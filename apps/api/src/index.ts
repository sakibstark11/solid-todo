import Koa from 'koa';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import { errorMiddleware } from './middleware/error.middleware.ts';
import { router } from './routes/index.ts';

const app = new Koa();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.use(cors());
app.use(koaBody());
app.use(errorMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
