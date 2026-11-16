"use server";

import * as sharesRepo from "./repositories/shares";
import * as usersRepo from "./repositories/users";
import { requireUser } from "./auth";
import { getTodoAccess } from "./access";
import { clampPageSize, encodeCursor, makePage, parseTimeCursor } from "./pagination";
import { invalidate } from "./revalidate";
import { firstIssue, formValues, shareTodoSchema, unshareTodoSchema } from "./validation";
import type { Page, ShareItem } from "~/lib/types";

export async function listShares(
  todoId: string,
  cursor: string | null,
  pageSize?: number
): Promise<Page<ShareItem>> {
  const user = await requireUser();
  const access = await getTodoAccess(user.id, todoId);
  if (access !== "owner") throw new Error("Only the owner can view shares");

  const size = clampPageSize(pageSize);
  const [rows, total] = await Promise.all([
    sharesRepo.listByTodo(todoId, parseTimeCursor(cursor), size + 1),
    sharesRepo.countByTodo(todoId),
  ]);
  const items: ShareItem[] = rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));
  return makePage(items, size, total, (item) =>
    encodeCursor({ createdAt: item.createdAt, id: item.id })
  );
}

export async function shareTodo(formData: FormData): Promise<Error | void> {
  const user = await requireUser();
  const parsed = shareTodoSchema.safeParse(formValues(formData));
  if (!parsed.success) return new Error(firstIssue(parsed.error));
  const { todoId, userId, permission } = parsed.data;

  const access = await getTodoAccess(user.id, todoId);
  if (access !== "owner") return new Error("Only the owner can share this todo");
  if (userId === user.id) return new Error("You cannot share a todo with yourself");
  if (!(await usersRepo.exists(userId))) return new Error("User not found");

  await sharesRepo.upsert({ todoId, userId, permission });
  invalidate("shares", "shared-todos");
}

export async function unshareTodo(formData: FormData): Promise<Error | void> {
  const user = await requireUser();
  const parsed = unshareTodoSchema.safeParse(formValues(formData));
  if (!parsed.success) return new Error(firstIssue(parsed.error));
  const { todoId, userId } = parsed.data;

  const access = await getTodoAccess(user.id, todoId);
  if (access !== "owner") return new Error("Only the owner can manage shares");

  await sharesRepo.remove(todoId, userId);
  invalidate("shares", "shared-todos");
}