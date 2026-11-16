import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  sessionToken: text('session_token'), // NULL if not logged in
  tokenExpiresAt: timestamp('token_expires_at'), // When session expires
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  active: boolean('active').default(true).notNull(),
})

export const todos = pgTable('todos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  details: jsonb('details').notNull().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  complete: boolean('complete').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const shares = pgTable('shares', {
  id: text('id').primaryKey(),
  todoId: text('todo_id').notNull().references(() => todos.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userId: text('user_id').notNull(),
  permissions: jsonb('permissions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})
