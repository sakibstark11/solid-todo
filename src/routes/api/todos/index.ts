export async function get(req: Request): Promise<Response> {
  // Return mock todos for demo
  const mockTodos = [
    { id: '1', title: 'Buy groceries', description: 'Milk, eggs, bread', complete: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', title: 'Complete project', description: '', complete: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]
  
  return new Response(JSON.stringify(mockTodos), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export async function post(req: Request): Promise<Response> {
  const body = await req.json()
  
  const todo = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description || '',
    complete: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return new Response(JSON.stringify(todo), { status: 201, headers: { 'Content-Type': 'application/json' } })
}
