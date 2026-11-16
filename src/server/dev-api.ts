import { requireAuth, unauthorized } from './auth'
import * as schema from './schema'
import { db } from './dev-db'
import { authMiddleware } from './middleware'

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export async function getAuthMe(req: Request): Promise<Response> {
  const authResult = await requireAuth(req)
  
  if (authResult === null) return json({ error: 'Unauthorized' }, 401)
  
  // Return user info without sensitive data
  return json({ id: authResult.user.id, email: authResult.user.email, name: authResult.user.name })
}

export async function postUser(req: Request): Promise<Response> {
  try {
    const body = await req.json()
    
    // Validate input
    if (!body.email || !body.name || body.password.length < 6) {
      return json({ error: 'Email, name required. Password must be at least 6 characters' }, 400)
    }

    // Register user in database with bcrypt password hash
    const result = await db.insert(schema.users).values({
      id: crypto.randomUUID(),
      email: body.email.toLowerCase(),
      name: body.name,
      passwordHash: await bcrypt.hash(body.password, 10),
      sessionToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true,
    }).returning()

    return json({ id: result[0].id, email: result[0].email, name: result[0].name }, 201)
  } catch (e) {
    return json({ error: 'Failed to create user' }, 400)
  }
}

export async function getTodos(req: Request): Promise<Response> {
  const authResult = await requireAuth(req)
  
  if (authResult === null) return json({ error: 'Unauthorized' }, 401)

  // Get todos from database
  try {
    const dbTodos = await db.select()
      .from(schema.todos)
      .where(schema.users.id.eq(authResult.user.id))
      .limit(5)
    
    return json(dbTodos.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      complete: t.complete || false,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt?.toISOString() || null,
    })))
  } catch {
    return json([])
  }
}

export async function postTodo(req: Request): Promise<Response> {
  const authResult = await requireAuth(req)
  
  if (authResult === null) return json({ error: 'Unauthorized' }, 401)

  try {
    const body = await req.json()
    const title = body.title?.trim() || ''
    const description = body.description || ''

    if (!title) {
      return json({ error: 'Title is required' }, 400)
    }

    // Create todo in database
    try {
      const dbTodo = await db.insert(schema.todos).values({
        id: crypto.randomUUID(),
        title,
        description,
        details: JSON.stringify({ type: 'generic' }),
        createdAt: new Date(),
        updatedAt: new Date(),
        complete: false,
        userId: authResult.user.email,
      }).returning()

      return json(dbTodo[0], 201)
    } catch (e) {
      return json({ error: 'Failed to create todo' }, 500)
    }
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
}

export async function postShare(req: Request, params: { todoId: string }): Promise<Response> {
  const authResult = await requireAuth(req)
  
  if (authResult === null) return json({ error: 'Unauthorized' }, 401)

  try {
    const body = await req.json()
    const recipientEmail = body.email?.toLowerCase().trim() || ''

    if (!recipientEmail) {
      return json({ error: 'Email is required' }, 400)
    }

    // Create share with recipient
    const newShare = await db.insert(schema.shares).values({
      id: crypto.randomUUID(),
      todoId: params.todoId,
      userId: recipientEmail,
      permissions: JSON.stringify({ canView: true, canEdit: false }),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    return json({ message: `Shared with ${recipientEmail}`, shareId: newShare[0].id }, 201)
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
}
