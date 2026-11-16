import crypto from 'crypto'

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthContext {
  user: User
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

export async function requireAuth(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get('authorization') || req.headers.get('cookie')?.split(';').find(c => c.startsWith('auth='))
  
  if (!authHeader) return unauthorized()

  try {
    let token: string
    
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').split(',')[0]?.trim() || ''
    } else if (authHeader.startsWith('auth=')) {
      const [tokenPart, expiresStr] = authHeader.split(',') as any[]
      token = tokenPart.trim()
      
      // Parse expiration
      const maxAge = parseInt(expiresStr?.split(';')[0].split('=')[1], 10) || 30 * 24 * 60 * 60 * 1000
      const expires = Date.now() + maxAge
      
      if (Date.now() > expires) {
        return unauthorized()
      }
    } else {
      return unauthorized()
    }

    // Hash token for security
    const hash = crypto.createHash('sha256').update(token).digest('hex')
    
    // For demo - accept any valid session
    // In production, check against database here
    
    // Set secure cookie
    const cookieValue = `auth=${hash},${Date.now() + 30 * 24 * 60 * 60 * 1000}`
    const setCookieHeader = `Set-Cookie: auth=${encodeURIComponent(cookieValue)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`

    return {
      user: { id: crypto.randomUUID(), email: hash, name: 'Demo User' },
      headers: { 'Set-Cookie': setCookieHeader },
    }
  } catch {
    return unauthorized()
  }
}
