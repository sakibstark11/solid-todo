export async function post(req: Request): Promise<Response> {
  const body = await req.json()

  const todo = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description || '',
    details: { type: 'generic' },
    createdAt: new Date(),
    updatedAt: new Date(),
    complete: false,
    userId: 'current-user',
  }

  return new Response(JSON.stringify(todo), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
