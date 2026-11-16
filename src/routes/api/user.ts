import { registerUser } from '../../server/auth'

export async function post(req: Request): Promise<Response> {
  try {
    const body = await req.json()
    const user = await registerUser(
      body.email.toLowerCase(),
      body.name,
      body.password
    )
    return new Response(JSON.stringify({ id: user.id, email: user.email, name: user.name }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid credentials'
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
