import Router from '@koa/router';
import { body } from '../lib/request.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import * as authService from '../services/auth.service.ts';

const router = new Router();

router.post('/auth/register', async (ctx) => {
  const result = await authService.register(body(ctx));
  ctx.status = 201;
  ctx.body = result;
});

router.post('/auth/login', async (ctx) => {
  ctx.body = await authService.login(body(ctx));
});

router.post('/auth/refresh', async (ctx) => {
  ctx.body = await authService.refresh(body(ctx));
});

router.post('/auth/logout', async (ctx) => {
  ctx.status = 204;
});

router.get('/auth/me', authMiddleware, async (ctx) => {
  ctx.body = await authService.me(ctx.state.user.sub);
});

export { router as authRouter };
