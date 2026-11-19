import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { shares, users } from "../db/schema.ts";
import type { TimeCursor } from "../lib/pagination.ts";

export type ShareRow = {
  id: string;
  userId: string;
  permission: "view" | "edit";
  createdAt: Date;
  name: string;
  email: string;
};

export async function findPermission(
  todoId: string,
  userId: string
): Promise<"view" | "edit" | null> {
  const [row] = await db
    .select({ permission: shares.permission })
    .from(shares)
    .where(and(eq(shares.todoId, todoId), eq(shares.userId, userId)))
    .limit(1);
  return row?.permission ?? null;
}

export async function listByTodo(
  todoId: string,
  cursor: TimeCursor | null,
  limit: number
): Promise<ShareRow[]> {
  return db
    .select({
      id: shares.id,
      userId: shares.userId,
      permission: shares.permission,
      createdAt: shares.createdAt,
      name: users.name,
      email: users.email,
    })
    .from(shares)
    .innerJoin(users, eq(shares.userId, users.id))
    .where(
      and(
        eq(shares.todoId, todoId),
        cursor
          ? sql`(${shares.createdAt}, ${shares.id}) < (${cursor.createdAt}, ${cursor.id})`
          : undefined
      )
    )
    .orderBy(desc(shares.createdAt), desc(shares.id))
    .limit(limit);
}

export async function countByTodo(todoId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(shares)
    .where(eq(shares.todoId, todoId));
  return row!.value;
}

export async function upsert(values: {
  todoId: string;
  userId: string;
  permission: "view" | "edit";
}): Promise<void> {
  await db
    .insert(shares)
    .values(values)
    .onConflictDoUpdate({
      target: [shares.todoId, shares.userId],
      set: { permission: values.permission },
    });
}

export async function remove(todoId: string, userId: string): Promise<void> {
  await db.delete(shares).where(and(eq(shares.todoId, todoId), eq(shares.userId, userId)));
}
