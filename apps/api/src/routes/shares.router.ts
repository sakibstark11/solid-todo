import Router from '@koa/router';
import { body } from '../lib/request.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import * as sharesService from '../services/shares.service.ts';

const router = new Router();

router.get('/todos/:id/shares', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.sub;
  const todoId = ctx.params.id;
  const { cursor = null, pageSize } = ctx.query as { cursor?: string; pageSize?: string };
  ctx.body = await sharesService.listShares(
    userId,
    todoId,
    cursor ?? null,
    pageSize ? parseInt(pageSize, 10) : undefined
  );
});

router.post('/todos/:id/shares', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.sub;
  const todoId = ctx.params.id;
  await sharesService.shareTodo(userId, todoId, body(ctx));
  ctx.status = 204;
});

router.delete('/todos/:id/shares/:userId', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.sub;
  const todoId = ctx.params.id;
  const targetUserId = ctx.params.userId;
  await sharesService.unshareTodo(userId, todoId, targetUserId);
  ctx.status = 204;
});

export { router as sharesRouter };
