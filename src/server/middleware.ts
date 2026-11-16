import { requireAuth } from './auth'
import * as schema from './db/schema'
import { db } from './db'

export async function authMiddleware(req: Request, handler: () => Response): Promise<Response> {
  const authResult = await requireAuth(req)
  
  if (authResult === null) {
    return handler()
  }

  // Check if session has expired
  const user = await db.select().from(schema.users).where(schema.users.id.eq(authResult.user.id)).limit(1)
  
  if (!user[0]) {
    return handler(new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }))
  }

  // Session is valid
  req.auth = authResult.user as any
  return handler()
}

export async function requireAuthMiddleware(req: Request) {
  const authResult = await requireAuth(req)
  
  if (authResult === null) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  
  req.auth = authResult.user as any
}

export async function getAuthenticatedUser(req: Request): Promise<User | null> {
  const authResult = await requireAuth(req)
  if (authResult === null) return null
  return authResult.user
}
