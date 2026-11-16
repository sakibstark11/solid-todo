export async function get(req: Request): Promise<Response> {
  // Return mock todos for demo
  const mockTodos = [
    {
      id: '1',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      complete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Complete project',
      description: '',
      complete: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  return new Response(JSON.stringify(mockTodos), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
