import { requireAuth } from '../../../server/auth'

export async function get(req: Request): Promise<Response> {
  const authResult = await requireAuth(req)
  if (authResult === null) {
    return unauthorized()
  }
  
  // Return user info without sensitive data
  return json({ id: authResult.user.id, email: authResult.user.email, name: authResult.user.name })
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
