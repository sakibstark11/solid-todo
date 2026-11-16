import { pgTable, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
  active: boolean('active').default(true),
})

export const todos = pgTable('todos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  details: jsonb('details').notNull().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  complete: boolean('complete').default(false),
  deletedAt: timestamp('deleted_at'),
  userId: text('user_id').notNull(),
})

export const shares = pgTable('shares', {
  id: text('id').primaryKey(),
  todoId: text('todo_id').notNull(),
  userId: text('user_id').notNull(),
  permissions: jsonb('permissions'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Todo = typeof todos.$inferSelect
export type NewTodo = typeof todos.$inferInsert
export type Share = typeof shares.$inferSelect
export type NewShare = typeof shares.$inferInsert
