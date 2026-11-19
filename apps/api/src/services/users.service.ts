import * as usersRepo from '../repositories/users.ts';
import { HttpError } from '../lib/errors.ts';
import {
  DEFAULT_PAGE_SIZE,
  encodeCursor,
  makePage,
  parseNameCursor,
} from '../lib/pagination.ts';
import { searchUsersSchema } from '../validation/schemas.ts';
import type { Page, UserResult } from '../lib/types.ts';

export async function searchUsers(
  userId: string,
  q: string,
  cursor: string | null
): Promise<Page<UserResult>> {
  const parsed = searchUsersSchema.safeParse({ q });
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? 'Invalid input');

  const pattern = `%${parsed.data.q.replace(/[\\%_]/g, '\\$&')}%`;
  const [rows, total] = await Promise.all([
    usersRepo.searchByName(pattern, userId, parseNameCursor(cursor), DEFAULT_PAGE_SIZE + 1),
    usersRepo.countSearch(pattern, userId),
  ]);
  return makePage(rows, DEFAULT_PAGE_SIZE, total, (item) =>
    encodeCursor({ name: item.name, id: item.id })
  );
}
