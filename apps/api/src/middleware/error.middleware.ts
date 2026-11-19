import type { Context, Next } from 'koa';
import { ZodError } from 'zod';
import { HttpError } from '../lib/errors.ts';

export async function errorMiddleware(ctx: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (err) {
    if (err instanceof HttpError) {
      ctx.status = err.status;
      ctx.body = { error: err.message };
    } else if (err instanceof ZodError) {
      ctx.status = 400;
      ctx.body = { error: err.issues[0]?.message ?? 'Invalid input' };
    } else {
      console.error(err);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  }
}
