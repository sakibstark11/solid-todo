export async function get(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const qParam = url.searchParams.get('q')

  // Only search when q parameter is provided and non-empty
  if (!qParam || qParam.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Search query required. Use ?q=...' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Return empty array for now - will connect to DB later
  return new Response(JSON.stringify([]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
