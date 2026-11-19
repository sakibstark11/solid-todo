import type { ParameterizedContext } from 'koa';

export function body(ctx: ParameterizedContext): unknown {
  return (ctx.request as unknown as { body?: unknown }).body;
}
