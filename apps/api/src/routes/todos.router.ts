import Router from '@koa/router';
import { body } from '../lib/request.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import * as todosService from '../services/todos.service.ts';

const router = new Router();

router.get('/todos', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.sub;
  const ownerName = ctx.state.user.name;
  const { cursor = null, tab = 'mine' } = ctx.query as { cursor?: string; tab?: string };
  if (tab === 'shared') {
    ctx.body = await todosService.listSharedTodos(userId, cursor ?? null);
  } else {
    ctx.body = await todosService.listMyTodos(userId, ownerName, cursor ?? null);
  }
});

router.post('/todos', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.sub;
  const ownerName = ctx.state.user.name;
  const result = await todosService.createTodo(userId, ownerName, body(ctx));
  ctx.status = 201;
  ctx.body = result;
});

router.patch('/todos/:id', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.sub;
  ctx.body = await todosService.updateTodo(userId, ctx.params.id, body(ctx));
});

router.delete('/todos/:id', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.sub;
  await todosService.deleteTodo(userId, ctx.params.id);
  ctx.status = 204;
});

export { router as todosRouter };
