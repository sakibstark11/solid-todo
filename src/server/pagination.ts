import { z } from "zod";
import type { Page } from "~/lib/types";

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

const pageSizeSchema = z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).catch(DEFAULT_PAGE_SIZE);

export function clampPageSize(pageSize?: number): number {
  return pageSizeSchema.parse(pageSize ?? DEFAULT_PAGE_SIZE);
}

export function encodeCursor(value: Record<string, string>): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeCursor(cursor: string | null): unknown {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

const timeCursorSchema = z.object({ createdAt: z.iso.datetime(), id: z.uuid() });
const nameCursorSchema = z.object({ name: z.string().min(1), id: z.uuid() });

export type TimeCursor = { createdAt: Date; id: string };
export type NameCursor = { name: string; id: string };

export function parseTimeCursor(cursor: string | null): TimeCursor | null {
  const parsed = timeCursorSchema.safeParse(decodeCursor(cursor));
  if (!parsed.success) return null;
  return { createdAt: new Date(parsed.data.createdAt), id: parsed.data.id };
}

export function parseNameCursor(cursor: string | null): NameCursor | null {
  const parsed = nameCursorSchema.safeParse(decodeCursor(cursor));
  return parsed.success ? parsed.data : null;
}

export function makePage<T>(
  items: T[],
  pageSize: number,
  total: number,
  cursorOf: (item: T) => string
): Page<T> {
  const hasMore = items.length > pageSize;
  const pageItems = hasMore ? items.slice(0, pageSize) : items;
  return {
    items: pageItems,
    total,
    pageSize,
    nextCursor: hasMore ? cursorOf(pageItems[pageItems.length - 1]) : null,
  };
}