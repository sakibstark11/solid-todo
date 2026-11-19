import Router from '@koa/router';
import { authRouter } from './auth.router.ts';
import { todosRouter } from './todos.router.ts';
import { sharesRouter } from './shares.router.ts';
import { usersRouter } from './users.router.ts';

export const router = new Router();

router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(todosRouter.routes(), todosRouter.allowedMethods());
router.use(sharesRouter.routes(), sharesRouter.allowedMethods());
router.use(usersRouter.routes(), usersRouter.allowedMethods());
