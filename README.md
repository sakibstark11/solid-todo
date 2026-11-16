# Todo App

A todo application built with SolidJS, Vite, and Tailwind CSS. Features user authentication, todo management, and database schema setup with Drizzle ORM.

## Quick Start

### 1. Install Dependencies

```bash
cd ~/repos/todo-app
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to see the app!

### 3. Build for Production

```bash
npm run build
```

## Features Implemented

- ✅ **User Authentication UI** - Sign up with email, name, password (reactive client-side state)
- ✅ **Todo Management** - Create, view, complete, and delete todos with reactive UI
- ✅ **Clean Routing** - `@solidjs/router` client routing between `/` and `/todos`
- ✅ **Database Schema** - Drizzle ORM schema with PostgreSQL connection (users, todos, shares)
- ✅ **Password Hashing** - bcryptjs password utilities

## Tech Stack

| Package | Purpose |
|---------|---------|
| SolidJS + Vite | Framework and fast bundler |
| @solidjs/router | Client-side routing |
| Drizzle ORM | Database ORM (PostgreSQL) |
| TailwindCSS | Utility-first styling |
| bcryptjs | Password hashing |
| Zod | Schema validation |

## Project Structure

```
todo-app/
├── src/
│   ├── routes/
│   │   ├── index.tsx          # Home page (auth form & dashboard)
│   │   ├── todos.tsx          # Todo management page
│   │   └── api/               # API route handlers
│   ├── server/
│   │   ├── db/
│   │   │   ├── index.ts       # DB connection config
│   │   │   └── schema.ts      # Drizzle ORM schema & types
│   │   └── auth.ts            # Auth utilities & db queries
│   ├── middleware/
│   │   └── auth.ts            # Request authentication helper
│   ├── App.tsx                # Main app with client routing
│   ├── index.tsx              # Application entrypoint
│   └── assets/index.css       # Tailwind CSS & global styles
├── docker-compose.yml         # PostgreSQL 16 container
├── package.json               # Dependencies & scripts
├── vite.config.ts             # Vite configuration with solid plugin
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## Setup with PostgreSQL (Optional)

1. Review `.env` (configured for default local docker):
```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=todo_password
POSTGRES_DB=todo_db
```

2. Start Docker PostgreSQL:
```bash
docker-compose up -d
```

## License

MIT
