import Router from '@koa/router';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import * as usersService from '../services/users.service.ts';

const router = new Router();

router.get('/users/search', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.sub;
  const { q = '', cursor = null } = ctx.query as { q?: string; cursor?: string };
  ctx.body = await usersService.searchUsers(userId, q, cursor ?? null);
});

export { router as usersRouter };
