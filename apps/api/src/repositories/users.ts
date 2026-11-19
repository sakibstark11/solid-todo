import { and, asc, count, eq, ilike, ne, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import type { NameCursor } from "../lib/pagination.ts";
import type { SessionUser, UserResult } from "../lib/types.ts";

export type UserRow = typeof users.$inferSelect;

export async function findByEmail(email: string): Promise<UserRow | null> {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row ?? null;
}

export async function findById(id: string): Promise<SessionUser | null> {
  const [row] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row ?? null;
}

export async function insert(values: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<{ id: string }> {
  const [row] = await db.insert(users).values(values).returning({ id: users.id });
  return row!;
}

export async function exists(id: string): Promise<boolean> {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
  return row !== undefined;
}

export async function searchByName(
  pattern: string,
  excludeUserId: string,
  cursor: NameCursor | null,
  limit: number
): Promise<UserResult[]> {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(
      and(
        ilike(users.name, pattern),
        ne(users.id, excludeUserId),
        cursor ? sql`(${users.name}, ${users.id}) > (${cursor.name}, ${cursor.id})` : undefined
      )
    )
    .orderBy(asc(users.name), asc(users.id))
    .limit(limit);
}

export async function countSearch(pattern: string, excludeUserId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(users)
    .where(and(ilike(users.name, pattern), ne(users.id, excludeUserId)));
  return row!.value;
}
