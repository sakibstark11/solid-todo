"use server";

import * as todosRepo from "./repositories/todos";
import { requireUser } from "./auth";
import { getTodoAccess } from "./access";
import {
  DEFAULT_PAGE_SIZE,
  encodeCursor,
  makePage,
  parseTimeCursor,
} from "./pagination";
import { invalidate } from "./revalidate";
import {
  createTodoSchema,
  firstIssue,
  formValues,
  todoIdSchema,
  updateTodoSchema,
} from "./validation";
import type { Page, TodoAccess, TodoItem } from "~/lib/types";

function toTodoItem(row: todosRepo.TodoRow, ownerName: string, access: TodoAccess): TodoItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    complete: row.complete,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ownerId: row.userId,
    ownerName,
    access,
  };
}

function todoCursor(item: TodoItem): string {
  return encodeCursor({ createdAt: item.createdAt, id: item.id });
}

export async function listMyTodos(cursor: string | null): Promise<Page<TodoItem>> {
  const user = await requireUser();
  const [rows, total] = await Promise.all([
    todosRepo.listOwned(user.id, parseTimeCursor(cursor), DEFAULT_PAGE_SIZE + 1),
    todosRepo.countOwned(user.id),
  ]);
  const items = rows.map((row) => toTodoItem(row, user.name, "owner"));
  return makePage(items, DEFAULT_PAGE_SIZE, total, todoCursor);
}

export async function listSharedTodos(cursor: string | null): Promise<Page<TodoItem>> {
  const user = await requireUser();
  const [rows, total] = await Promise.all([
    todosRepo.listSharedWith(user.id, parseTimeCursor(cursor), DEFAULT_PAGE_SIZE + 1),
    todosRepo.countSharedWith(user.id),
  ]);
  const items = rows.map((row) => toTodoItem(row.todo, row.ownerName, row.permission));
  return makePage(items, DEFAULT_PAGE_SIZE, total, todoCursor);
}

export async function createTodo(formData: FormData): Promise<Error | void> {
  const user = await requireUser();
  const parsed = createTodoSchema.safeParse(formValues(formData));
  if (!parsed.success) return new Error(firstIssue(parsed.error));

  await todosRepo.insert({
    userId: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
  });
  invalidate("my-todos");
}

export async function updateTodo(formData: FormData): Promise<Error | void> {
  const user = await requireUser();
  const parsed = updateTodoSchema.safeParse(formValues(formData));
  if (!parsed.success) return new Error(firstIssue(parsed.error));
  const { todoId, title, description, complete } = parsed.data;

  const access = await getTodoAccess(user.id, todoId);
  if (!access) return new Error("Todo not found");
  if (access === "view") return new Error("You have view-only access to this todo");

  await todosRepo.update(todoId, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(complete !== undefined && { complete }),
  });
  invalidate("my-todos", "shared-todos");
}

export async function deleteTodo(formData: FormData): Promise<Error | void> {
  const user = await requireUser();
  const parsed = todoIdSchema.safeParse(formValues(formData));
  if (!parsed.success) return new Error(firstIssue(parsed.error));
  const { todoId } = parsed.data;

  const access = await getTodoAccess(user.id, todoId);
  if (access !== "owner") return new Error("Only the owner can delete this todo");

  await todosRepo.softDelete(todoId);
  invalidate("my-todos", "shared-todos");
}