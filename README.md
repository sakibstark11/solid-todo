# Todo App

A todo application with user accounts, todo sharing, and user search.
Built with a Solid 2.0 frontend and a Koa backend, Drizzle ORM, and PostgreSQL.

## Features

- Register and sign in with JWT access and refresh tokens
- Create, edit, complete, and soft-delete todos
- Share todos with other users (view or edit permission) and revoke shares
- "Shared with me" list
- Search users by name
- Every list uses cursor pagination

## Quick start

Requirements: Docker with the Compose plugin, Node.js 24+.

```bash
cp .env.example .env
```

Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in `.env` to random values:

```bash
openssl rand -hex 32
```

Start the stack:

```bash
docker compose up -d
```

The API is available at http://localhost:3001 and the Solid 2.0 frontend is at http://localhost:3000. The frontend proxies `/api` to the backend.

To run the frontend locally against a local API:

```bash
npm run dev -w @todo-app/web
```

To reset the database completely:

```bash
docker compose down -v
docker compose up -d
```

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start the Solid 2.0 frontend in development mode |
| `npm run dev -w @todo-app/api` | Start the Koa API locally (Docker runs this by default) |
| `npm run build` | Build all apps for production |
| `npm run typecheck` | Check TypeScript types |
| `npm run db:generate` | Generate a migration from the schema |
| `npm run db:migrate` | Apply pending migrations |

## Project structure

```
apps/
  api/                       Koa backend
    drizzle.config.ts        Drizzle configuration
    src/
      db/                    Drizzle schema and connection
      lib/                   Shared helpers (errors, JWT, pagination, password)
      middleware/            Koa middleware (auth, error handling)
      repositories/          Database queries (repo layer)
      routes/                HTTP route handlers
      services/              Business logic layer
      validation/            Zod schemas
      index.ts               Application entry point
  web/                       Solid 2.0 frontend
    src/
      pages/                 Route components
      lib/                   API client with signals and fetch interceptor
      App.tsx                Root component with Loading boundary
      Document.tsx           HTML shell
      router.ts              Explicit router config
drizzle/                     Versioned SQL migrations (managed from apps/api)
```

## Architecture

Each layer has one job:

- **Routes** parse HTTP requests and call services.
- **Services** validate input with Zod, check permissions, and call repositories.
- **Repositories** hold every database query. They know nothing about HTTP or JWT.
- **Cross-cutting logic** stays in its own module: JWT in `lib/jwt.ts`, hashing in
  `lib/password.ts`, cursors in `lib/pagination.ts`, and errors in `lib/errors.ts`.

### Authentication

Access tokens expire after 15 minutes and are sent in the `Authorization` header.
Refresh tokens expire after 7 days and are returned at login and from the refresh
endpoint. Call `/auth/refresh` with a refresh token to obtain a new access token
and a rotated refresh token.

### Pagination

Lists use keyset (cursor) pagination, not OFFSET. Todo and share lists order by
`(createdAt, id)` descending; user search orders by `(name, id)` ascending.
The cursor is an opaque base64url token that holds the last row's sort keys.
The next page selects rows strictly after the cursor, so deep pages stay fast
and concurrent inserts cannot shift rows between pages. Responses carry
`{ items, total, pageSize, nextCursor }`.

### Soft delete

Deleting a todo sets `deleted_at`. Every list and permission check filters
deleted rows out. The row stays in the database.

## API endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Sign in |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Sign out (client clears tokens) |
| GET | `/auth/me` | Current user |
| GET | `/todos?tab=mine|shared&cursor=` | List my todos or shared todos |
| POST | `/todos` | Create a todo |
| PATCH | `/todos/:id` | Update a todo |
| DELETE | `/todos/:id` | Soft-delete a todo |
| GET | `/todos/:id/shares?cursor=&pageSize=` | List shares for a todo |
| POST | `/todos/:id/shares` | Share a todo |
| DELETE | `/todos/:id/shares/:userId` | Revoke a share |
| GET | `/users/search?q=&cursor=` | Search users by name |

## Environment variables

| Variable | Purpose |
|---|---|
| `POSTGRES_USER` | Postgres role (compose) |
| `POSTGRES_PASSWORD` | Postgres password (compose) |
| `POSTGRES_DB` | Database name (compose) |
| `DATABASE_URL` | Connection string for host tooling |
| `JWT_ACCESS_SECRET` | Access token signing key, at least 32 characters |
| `JWT_REFRESH_SECRET` | Refresh token signing key, at least 32 characters |

## Production

```bash
npm run build
DATABASE_URL=... JWT_ACCESS_SECRET=... JWT_REFRESH_SECRET=... NODE_ENV=production npm start -w @todo-app/api
```

Serve the app behind TLS.
