import * as todosRepo from '../repositories/todos.ts';
import * as sharesRepo from '../repositories/shares.ts';
import * as usersRepo from '../repositories/users.ts';
import { HttpError } from '../lib/errors.ts';
import {
  DEFAULT_PAGE_SIZE,
  encodeCursor,
  makePage,
  parseTimeCursor,
} from '../lib/pagination.ts';
import { createTodoSchema, updateTodoSchema, todoIdSchema } from '../validation/schemas.ts';
import type { TodoAccess, TodoItem, Page } from '../lib/types.ts';

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

async function getTodoAccess(userId: string, todoId: string): Promise<TodoAccess | null> {
  const todo = await todosRepo.findActiveById(todoId);
  if (!todo) return null;
  if (todo.userId === userId) return 'owner';
  return sharesRepo.findPermission(todoId, userId);
}

export async function listMyTodos(
  userId: string,
  ownerName: string,
  cursor: string | null
): Promise<Page<TodoItem>> {
  const [rows, total] = await Promise.all([
    todosRepo.listOwned(userId, parseTimeCursor(cursor), DEFAULT_PAGE_SIZE + 1),
    todosRepo.countOwned(userId),
  ]);
  const items = rows.map((row) => toTodoItem(row, ownerName, 'owner'));
  return makePage(items, DEFAULT_PAGE_SIZE, total, todoCursor);
}

export async function listSharedTodos(
  userId: string,
  cursor: string | null
): Promise<Page<TodoItem>> {
  const [rows, total] = await Promise.all([
    todosRepo.listSharedWith(userId, parseTimeCursor(cursor), DEFAULT_PAGE_SIZE + 1),
    todosRepo.countSharedWith(userId),
  ]);
  const items = rows.map((row) => toTodoItem(row.todo, row.ownerName, row.permission));
  return makePage(items, DEFAULT_PAGE_SIZE, total, todoCursor);
}

export async function createTodo(
  userId: string,
  ownerName: string,
  body: unknown
): Promise<TodoItem> {
  const { title, description } = createTodoSchema.parse(body);
  const row = await todosRepo.insert({ userId, title, description });
  return toTodoItem(row, ownerName, 'owner');
}

export async function updateTodo(
  userId: string,
  todoId: string,
  body: unknown
): Promise<TodoItem> {
  // Inject todoId into the body for validation
  const parsed = updateTodoSchema.parse({ todoId, ...(body as object) });
  const { title, description, complete } = parsed;

  const access = await getTodoAccess(userId, todoId);
  if (!access) throw new HttpError(404, 'Todo not found');
  if (access === 'view') throw new HttpError(403, 'You have view-only access to this todo');

  await todosRepo.update(todoId, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(complete !== undefined && { complete }),
  });

  // Fetch updated row and owner name
  const row = await todosRepo.findById(todoId);
  if (!row) throw new HttpError(404, 'Todo not found after update');

  if (access === 'owner') {
    const owner = await usersRepo.findById(userId);
    return toTodoItem(row, owner?.name ?? '', 'owner');
  } else {
    // Shared: fetch owner name from the todo's userId
    const owner = await usersRepo.findById(row.userId);
    return toTodoItem(row, owner?.name ?? '', access);
  }
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  todoIdSchema.parse({ todoId });

  const access = await getTodoAccess(userId, todoId);
  if (access !== 'owner') throw new HttpError(403, 'Only the owner can delete this todo');

  await todosRepo.softDelete(todoId);
}
