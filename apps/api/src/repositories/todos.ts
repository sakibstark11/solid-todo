import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { shares, todos, users } from "../db/schema.ts";
import type { TimeCursor } from "../lib/pagination.ts";

export type TodoRow = typeof todos.$inferSelect;

export type SharedTodoRow = {
  todo: TodoRow;
  permission: "view" | "edit";
  ownerName: string;
};

export async function findActiveById(
  todoId: string
): Promise<{ id: string; userId: string } | null> {
  const [row] = await db
    .select({ id: todos.id, userId: todos.userId })
    .from(todos)
    .where(and(eq(todos.id, todoId), isNull(todos.deletedAt)))
    .limit(1);
  return row ?? null;
}

export async function listOwned(
  userId: string,
  cursor: TimeCursor | null,
  limit: number
): Promise<TodoRow[]> {
  return db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.userId, userId),
        isNull(todos.deletedAt),
        cursor
          ? sql`(${todos.createdAt}, ${todos.id}) < (${cursor.createdAt}, ${cursor.id})`
          : undefined
      )
    )
    .orderBy(desc(todos.createdAt), desc(todos.id))
    .limit(limit);
}

export async function countOwned(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(todos)
    .where(and(eq(todos.userId, userId), isNull(todos.deletedAt)));
  return row!.value;
}

export async function listSharedWith(
  userId: string,
  cursor: TimeCursor | null,
  limit: number
): Promise<SharedTodoRow[]> {
  return db
    .select({ todo: todos, permission: shares.permission, ownerName: users.name })
    .from(shares)
    .innerJoin(todos, eq(shares.todoId, todos.id))
    .innerJoin(users, eq(todos.userId, users.id))
    .where(
      and(
        eq(shares.userId, userId),
        isNull(todos.deletedAt),
        cursor
          ? sql`(${todos.createdAt}, ${todos.id}) < (${cursor.createdAt}, ${cursor.id})`
          : undefined
      )
    )
    .orderBy(desc(todos.createdAt), desc(todos.id))
    .limit(limit);
}

export async function countSharedWith(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(shares)
    .innerJoin(todos, eq(shares.todoId, todos.id))
    .where(and(eq(shares.userId, userId), isNull(todos.deletedAt)));
  return row!.value;
}

export async function insert(values: {
  userId: string;
  title: string;
  description: string;
}): Promise<TodoRow> {
  const [row] = await db.insert(todos).values(values).returning();
  return row!;
}

export async function update(
  todoId: string,
  fields: { title?: string; description?: string; complete?: boolean }
): Promise<void> {
  await db
    .update(todos)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(todos.id, todoId));
}

export async function findById(todoId: string): Promise<TodoRow | null> {
  const [row] = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, todoId), isNull(todos.deletedAt)))
    .limit(1);
  return row ?? null;
}

export async function softDelete(todoId: string): Promise<void> {
  await db.update(todos).set({ deletedAt: new Date() }).where(eq(todos.id, todoId));
}
