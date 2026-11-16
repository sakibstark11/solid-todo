import { eq, and, ne, ilike, or } from 'drizzle-orm'
import { db } from '../../../server/db'
import { users } from '../../../server/db/schema'

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function get(req: Request): Promise<Response> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return json({ error: 'Unauthorized' }, 401)

  try {
    const [email] = JSON.parse(authHeader.replace('Bearer ', '')) as string[]

    // Check current user exists and is active
    const currentUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!currentUser[0]) return json({ error: 'User not found' }, 404)
    if (!currentUser[0].active) return json({ error: 'Account deactivated' }, 403)

    const url = new URL(req.url)
    const query = url.searchParams.get('q') || ''

    // If no query, return all active users except current user
    let results
    if (!query) {
      results = await db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(and(eq(users.active, true), ne(users.id, currentUser[0].id)))
    } else {
      // Search by name or email (case-insensitive)
      results = await db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(
          and(
            eq(users.active, true),
            or(ilike(users.name, `%${query}%`), ilike(users.email, `%${query}%`)),
            ne(users.id, currentUser[0].id)
          )
        )
    }

    return json(results)
  } catch {
    return json({ error: 'Invalid token' }, 401)
  }
}
