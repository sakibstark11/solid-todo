# Todo App

A todo application with user accounts, todo sharing, and user search.
Built with SolidStart v2, Drizzle ORM, PostgreSQL, and Material UI for SolidJS (`@suid/material`).

## Features

- Register, sign in, and sign out with session cookies
- Create, edit, complete, and soft-delete todos
- Share todos with other users (view or edit permission), and revoke shares
- "Shared with me" list
- Search users by name
- Every list uses cursor pagination
- Server-side rendering, and forms work without JavaScript

## Quick start

Requirements: Docker with the Compose plugin.

```bash
cp .env.example .env
```

Set `SESSION_SECRET` in `.env` to a random value:

```bash
openssl rand -hex 32
```

Start the stack:

```bash
docker compose up -d
```

Open http://localhost:3000.

The `app` service uses the `node:24-slim` image directly. It mounts this
repository, installs dependencies, applies database migrations, and starts the
dev server. No Dockerfile is needed. The `postgres` service stores data in the
`postgres_data` volume. Container dependencies live in the `app_node_modules`
volume, separate from the host's `node_modules`.

To reset the database completely:

```bash
docker compose down -v
docker compose up -d
```

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start the dev server (port 3000) |
| `npm run build` | Build for production into `.output/` |
| `npm start` | Run the production build |
| `npm run typecheck` | Check TypeScript types |
| `npm run db:generate` | Generate a migration from the schema |
| `npm run db:migrate` | Apply pending migrations |

## Project structure

```
src/
  app.tsx                  Root component: theme, auth context, layout
  entry-client.tsx         Client hydration entry
  entry-server.tsx         Server document entry
  middleware.ts            Security response headers
  routes/                  File-based pages
    index.tsx              Redirects to /todos or /login
    login.tsx              Sign in
    register.tsx           Sign up
    todos.tsx              Todo lists (mine / shared with me)
    users/search.tsx       User search
    [...404].tsx           Not found
  components/              UI components (Material UI)
  lib/
    api.ts                 query() and action() wrappers
    types.ts               Shared data types
    cursor.ts              Client-side cursor history
  server/
    users.ts               "use server": auth and user search RPC
    todos.ts               "use server": todo RPC
    shares.ts              "use server": share RPC
    auth.ts                Session cookie and route guards
    password.ts            scrypt hashing
    access.ts              Ownership and share permission checks
    validation.ts          Zod schemas
    pagination.ts          Cursor encode/decode and page assembly
    revalidate.ts          Query invalidation helper
    db.ts                  Connection pool
    schema.ts              Tables and indexes
    repositories/          All database queries
drizzle/                   Versioned SQL migrations
```

## Architecture

Each layer has one job:

- **Routes and components** render UI and call the wrappers in `lib/api.ts`.
- **`lib/api.ts`** binds server functions to router `query` (cached reads) and
  `action` (mutations) keys.
- **`server/*.ts` RPC modules** validate input with Zod, check permissions,
  call repositories, and invalidate affected queries.
- **`server/repositories/`** holds every database query. It knows nothing
  about HTTP, sessions, or validation.
- **Cross-cutting logic** stays in its own module: sessions in `auth.ts`,
  hashing in `password.ts`, cursors in `pagination.ts`, invalidation in
  `revalidate.ts`, permission resolution in `access.ts`.

### Pagination

Lists use keyset (cursor) pagination, not OFFSET. Todo and share lists order by
`(createdAt, id)` descending; user search orders by `(name, id)` ascending.
The cursor is an opaque base64url token that holds the last row's sort keys.
The next page selects rows strictly after the cursor, so deep pages stay fast
and concurrent inserts cannot shift rows between pages. Responses carry
`{ items, total, pageSize, nextCursor }`. The UI keeps a cursor history for
"Previous" navigation. The composite index
`todos_user_active_idx (user_id, created_at, id)` covers the main list query.

### Soft delete

Deleting a todo sets `deleted_at`. Every list and permission check filters
deleted rows out. The row stays in the database.

## Security

- Passwords hash with scrypt using OWASP minimum cost parameters.
- Sessions use an encrypted, sealed cookie (`useSession`): HttpOnly,
  SameSite=Lax, and Secure in production. The server never trusts a user id
  from the client.
- Every mutation validates input with Zod and checks ownership or share
  permission on the server.
- Queries are parameterized through Drizzle. User search escapes LIKE
  wildcards.
- Security headers on every response: `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`.
- Server code and secrets never reach the client bundle.
- Redirect targets are restricted to internal paths.

## Environment variables

| Variable | Purpose |
|---|---|
| `POSTGRES_USER` | Postgres role (compose) |
| `POSTGRES_PASSWORD` | Postgres password (compose) |
| `POSTGRES_DB` | Database name (compose) |
| `DATABASE_URL` | Connection string for host tooling; compose builds its own for the app container |
| `SESSION_SECRET` | Cookie encryption key, at least 32 characters |

## Production

```bash
npm run build
DATABASE_URL=... SESSION_SECRET=... NODE_ENV=production npm start
```

Serve the app behind TLS. Session cookies carry the `Secure` flag when
`NODE_ENV` is `production`.