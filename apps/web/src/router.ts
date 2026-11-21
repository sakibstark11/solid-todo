import { lazy } from 'solid-js';
import { createRouter } from '@solidjs/router';

export const Router = createRouter({
  routes: [
    { path: '/', component: lazy(() => import('./pages/Home')) },
    { path: '/todos/new', component: lazy(() => import('./pages/Todo')) },
    { path: '/todos/:id', component: lazy(() => import('./pages/Todo')) },
    { path: '/login', component: lazy(() => import('./pages/Login')) },
    { path: '/register', component: lazy(() => import('./pages/Register')) },
    { path: '*404', component: lazy(() => import('./pages/NotFound')) },
  ],
});

export const { paths } = Router;
