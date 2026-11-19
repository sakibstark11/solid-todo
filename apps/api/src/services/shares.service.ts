import * as sharesRepo from '../repositories/shares.ts';
import * as usersRepo from '../repositories/users.ts';
import * as todosRepo from '../repositories/todos.ts';
import { HttpError } from '../lib/errors.ts';
import { clampPageSize, encodeCursor, makePage, parseTimeCursor } from '../lib/pagination.ts';
import { shareTodoSchema, unshareTodoSchema } from '../validation/schemas.ts';
import type { Page, ShareItem } from '../lib/types.ts';
import type { TodoAccess } from '../lib/types.ts';

async function getTodoAccess(userId: string, todoId: string): Promise<TodoAccess | null> {
  const todo = await todosRepo.findActiveById(todoId);
  if (!todo) return null;
  if (todo.userId === userId) return 'owner';
  return sharesRepo.findPermission(todoId, userId);
}

export async function listShares(
  userId: string,
  todoId: string,
  cursor: string | null,
  pageSize?: number
): Promise<Page<ShareItem>> {
  const access = await getTodoAccess(userId, todoId);
  if (access !== 'owner') throw new HttpError(403, 'Only the owner can view shares');

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

export async function shareTodo(
  userId: string,
  todoId: string,
  body: unknown
): Promise<void> {
  const parsed = shareTodoSchema.parse({ todoId, ...(body as object) });
  const { userId: targetUserId, permission } = parsed;

  const access = await getTodoAccess(userId, todoId);
  if (access !== 'owner') throw new HttpError(403, 'Only the owner can share this todo');
  if (targetUserId === userId) throw new HttpError(400, 'You cannot share a todo with yourself');
  if (!(await usersRepo.exists(targetUserId))) throw new HttpError(404, 'User not found');

  await sharesRepo.upsert({ todoId, userId: targetUserId, permission });
}

export async function unshareTodo(
  userId: string,
  todoId: string,
  targetUserId: string
): Promise<void> {
  unshareTodoSchema.parse({ todoId, userId: targetUserId });

  const access = await getTodoAccess(userId, todoId);
  if (access !== 'owner') throw new HttpError(403, 'Only the owner can manage shares');

  await sharesRepo.remove(todoId, targetUserId);
}
