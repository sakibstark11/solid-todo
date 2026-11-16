# Todo App - SolidStart + Drizzle + PostgreSQL

A todo application with user authentication, todo sharing, and search functionality.

## Quick Start

```bash
cd ~/repos/todo-app
npm install
npm run dev
```

Visit **http://localhost:3000** or **http://localhost:5173**

## Features

- ✅ User registration and login (session-based auth)
- ✅ Todo CRUD operations
- ✅ Share todos with other users by email
- ✅ Search users by name/email
- ✅ JSONB storage for flexible data
- ✅ Soft deletes on all tables

## Project Structure

```
todo-app/
├── src/
│   ├── routes/              # SSR pages
│   │   ├── index.tsx        # Home page (auth)
│   │   ├── todos.tsx        # Todo listing
│   │   └── users/
│   │       └── search.tsx   # User search
│   ├── api/                 # API endpoints
│   │   ├── user.ts          # User registration
│   │   ├── todos/
│   │   │   ├── index.ts     # CRUD
│   │   │   └── [todoId]/share.ts
│   │   └── users/
│   │       └── search.ts    # Search endpoint
│   ├── server/
│   │   ├── auth.ts          # Session management
│   │   ├── db/              # Drizzle schema
│   │   └── dev-api.ts       # API handlers
│   └── App.tsx              # Router setup
├── package.json
├── vite.config.ts           # Vite + SolidStart config
└── solid.config.ts          # SolidStart server config
```

## Environment Variables

Create `.env` file:

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=todo_db
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user` (POST) | Register new user |
| `/api/auth/me` (GET) | Current user info |
| `/api/todos` (GET/POST) | List/create todos |
| `/api/users/search?q=...` (GET) | Search users |

## License

MIT
# solidstart-todo
