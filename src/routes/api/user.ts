import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function post(req: Request): Promise<Response> {
  const body = await req.json()
  const parsed = registerSchema.safeParse(body)
  
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.errors[0]?.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Return success for now - actual registration needs DB setup
  return new Response(JSON.stringify({ message: 'User created successfully', email: parsed.data.email.toLowerCase(), name: parsed.data.name }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
