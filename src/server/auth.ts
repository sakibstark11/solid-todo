import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from './db'
import * as schema from './db/schema'
import type { User } from './db/schema'

export interface AuthContext {
  user: User
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function unauthorized(): Response {
  return json({ error: 'Unauthorized' }, 401)
}

export async function requireAuth(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return unauthorized()
  try {
    const [email] = JSON.parse(authHeader.replace('Bearer ', '')) as string[]
    const user = await getUserByEmail(email)
    if (!user || !user.active) return unauthorized()
    return null
  } catch {
    return unauthorized()
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1)
  return result[0] || null
}

export async function registerUser(email: string, name: string, password: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10)
  const result = await db
    .insert(schema.users)
    .values({
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true,
    })
    .returning()
  return result[0]
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (!user || !user.active) return null
  const validPassword = await bcrypt.compare(password, user.passwordHash)
  if (!validPassword) return null
  return user
}
