import type { Context, Next } from 'koa';
import { verifyAccessToken } from '../lib/jwt.ts';
import { HttpError } from '../lib/errors.ts';

export async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  const header = ctx.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new HttpError(401, 'Missing or invalid authorization header');
  const token = header.slice(7);
  try {
    ctx.state.user = verifyAccessToken(token);
  } catch {
    throw new HttpError(401, 'Invalid or expired access token');
  }
  await next();
}
