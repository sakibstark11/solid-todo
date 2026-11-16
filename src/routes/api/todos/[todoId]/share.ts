import { authMiddleware } from '../../server/middleware'
import * as schema from '../../server/db/schema'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function post(req, params) {
  const authResult = await authMiddleware(req, (next) => next())
  if (!authResult) return json({ error: 'Unauthorized' }, 401)

  try {
    const body = await req.json()
    const recipientEmail = body.email?.toLowerCase().trim() || ''

    if (!recipientEmail) {
      return json({ error: 'Email is required' }, 400)
    }

    // Check todo exists
    const existingShare = await db.select()
      .from(schema.shares)
      .where(eq(schema.shares.todoId, params.todoId))
      .limit(1)

    if (existingShare.length > 0 && !existingShare[0].active) {
      return json({ error: 'Shared link expired' }, 410)
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
