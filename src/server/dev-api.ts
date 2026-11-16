import fs from 'fs'
import path from 'path'
import type http from 'http'

export interface DbUser {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

export interface DbTodo {
  id: string
  title: string
  description: string
  complete: boolean
  creatorId: string
  createdAt: string
  updatedAt: string
}

export interface DbShare {
  id: string
  todoId: string
  userId: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface DbData {
  users: DbUser[]
  todos: DbTodo[]
  shares: DbShare[]
}

const DB_FILE = path.resolve(process.cwd(), 'data/db.json')

function getInitialDb(): DbData {
  return {
    users: [],
    todos: [],
    shares: [],
  }
}

export function readDb(): DbData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDb()
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8')
      return initial
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw) as DbData
  } catch (err) {
    console.error('Error reading db.json:', err)
    return getInitialDb()
  }
}

export function writeDb(data: DbData): void {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing db.json:', err)
  }
}

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve({})
      }
    })
  })
}

function sendJson(res: http.ServerResponse, data: unknown, status = 200): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

export async function handleApiRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: () => void
): Promise<void> {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const pathname = url.pathname

  if (!pathname.startsWith('/api/')) {
    return next()
  }

  const method = (req.method || 'GET').toUpperCase()

  try {
    // 1. GET /api/users
    if (pathname === '/api/users' && method === 'GET') {
      const db = readDb()
      const publicUsers = db.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
      }))
      return sendJson(res, publicUsers)
    }

    // 2. POST /api/auth/register
    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await parseJsonBody(req)
      const name = (body.name || '').trim()
      const email = (body.email || '').trim().toLowerCase()
      const password = body.password || ''

      if (!name) return sendJson(res, { error: 'Name is required' }, 400)
      if (!email || !email.includes('@')) return sendJson(res, { error: 'Valid email is required' }, 400)
      if (password.length < 6) return sendJson(res, { error: 'Password must be at least 6 characters' }, 400)

      const db = readDb()
      if (db.users.some((u) => u.email.toLowerCase() === email)) {
        return sendJson(res, { error: 'A user with this email already exists' }, 409)
      }

      const newUser: DbUser = {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash: password,
        createdAt: new Date().toISOString(),
      }

      db.users.push(newUser)
      writeDb(db)

      return sendJson(res, {
        success: true,
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
      }, 201)
    }

    // 3. POST /api/auth/login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req)
      const email = (body.email || '').trim().toLowerCase()
      const password = body.password || ''

      const db = readDb()
      const user = db.users.find((u) => u.email.toLowerCase() === email)

      if (!user || user.passwordHash !== password) {
        return sendJson(res, { error: 'Invalid email or password' }, 401)
      }

      return sendJson(res, {
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
      })
    }

    // 4. GET /api/todos
    if (pathname === '/api/todos' && method === 'GET') {
      const userId = url.searchParams.get('userId') || ''
      if (!userId) return sendJson(res, { error: 'userId is required' }, 400)

      const db = readDb()
      const accessibleTodos = db.todos.filter((t) => {
        if (t.creatorId === userId) return true
        return db.shares.some((s) => s.todoId === t.id && s.userId === userId && s.active)
      })

      accessibleTodos.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )

      const result = accessibleTodos.map((t) => {
        const creator = db.users.find((u) => u.id === t.creatorId)
        const todoShares = db.shares
          .filter((s) => s.todoId === t.id && s.active)
          .map((s) => {
            const member = db.users.find((u) => u.id === s.userId)
            return {
              shareId: s.id,
              userId: s.userId,
              name: member ? member.name : 'Unknown User',
              email: member ? member.email : '',
              active: s.active,
            }
          })

        return {
          ...t,
          creatorName: creator ? creator.name : 'Unknown',
          creatorEmail: creator ? creator.email : '',
          isOwner: t.creatorId === userId,
          sharedUsers: todoShares,
        }
      })

      return sendJson(res, result)
    }

    // 5. POST /api/todos
    if (pathname === '/api/todos' && method === 'POST') {
      const body = await parseJsonBody(req)
      const title = (body.title || '').trim()
      const description = (body.description || '').trim()
      const userId = body.userId || ''

      if (!title) return sendJson(res, { error: 'Title is required' }, 400)
      if (!userId) return sendJson(res, { error: 'userId is required' }, 400)

      const db = readDb()
      const creator = db.users.find((u) => u.id === userId)

      const newTodo: DbTodo = {
        id: crypto.randomUUID(),
        title,
        description,
        complete: false,
        creatorId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      db.todos.unshift(newTodo)
      writeDb(db)

      return sendJson(res, {
        ...newTodo,
        creatorName: creator ? creator.name : 'Unknown',
        creatorEmail: creator ? creator.email : '',
        isOwner: true,
        sharedUsers: [],
      }, 201)
    }

    // 6. PATCH /api/todos/:id
    const patchMatch = pathname.match(/^\/api\/todos\/([a-zA-Z0-9-]+)$/)
    if (patchMatch && method === 'PATCH') {
      const todoId = patchMatch[1]
      const body = await parseJsonBody(req)
      const db = readDb()
      const todo = db.todos.find((t) => t.id === todoId)
      if (!todo) return sendJson(res, { error: 'Todo not found' }, 404)

      if (body.title !== undefined) todo.title = String(body.title).trim()
      if (body.description !== undefined) todo.description = String(body.description).trim()
      if (body.complete !== undefined) todo.complete = Boolean(body.complete)
      todo.updatedAt = new Date().toISOString()

      writeDb(db)
      return sendJson(res, { success: true, todo })
    }

    // 7. DELETE /api/todos/:id
    const deleteMatch = pathname.match(/^\/api\/todos\/([a-zA-Z0-9-]+)$/)
    if (deleteMatch && method === 'DELETE') {
      const todoId = deleteMatch[1]
      const userId = url.searchParams.get('userId') || ''
      const db = readDb()
      const todo = db.todos.find((t) => t.id === todoId)
      if (!todo) return sendJson(res, { error: 'Todo not found' }, 404)

      if (todo.creatorId === userId) {
        // Creator deletes the todo completely
        db.todos = db.todos.filter((t) => t.id !== todoId)
        db.shares = db.shares.filter((s) => s.todoId !== todoId)
      } else {
        // Shared user unshares themselves
        db.shares = db.shares.map((s) =>
          s.todoId === todoId && s.userId === userId ? { ...s, active: false } : s
        )
      }

      writeDb(db)
      return sendJson(res, { success: true })
    }

    // 8. POST /api/todos/:id/share
    const shareMatch = pathname.match(/^\/api\/todos\/([a-zA-Z0-9-]+)\/share$/)
    if (shareMatch && method === 'POST') {
      const todoId = shareMatch[1]
      const body = await parseJsonBody(req)
      const targetQuery = (body.targetQuery || '').trim().toLowerCase()
      const currentUserId = body.userId || ''

      if (!targetQuery) return sendJson(res, { error: 'Name or email is required' }, 400)
      if (!currentUserId) return sendJson(res, { error: 'userId is required' }, 400)

      const db = readDb()
      const todo = db.todos.find((t) => t.id === todoId)
      if (!todo) return sendJson(res, { error: 'Todo not found' }, 404)

      // Find target user (must be different from current user)
      const otherUsers = db.users.filter((u) => u.id !== currentUserId)
      const targetUser =
        otherUsers.find((u) => u.id === targetQuery) ||
        otherUsers.find((u) => u.email.toLowerCase() === targetQuery) ||
        otherUsers.find((u) => u.name.toLowerCase() === targetQuery) ||
        otherUsers.find((u) => u.name.toLowerCase().includes(targetQuery) || u.email.toLowerCase().includes(targetQuery))

      if (!targetUser) {
        return sendJson(
          res,
          { error: `No registered user found matching "${body.targetQuery}".` },
          404
        )
      }

      const existingShare = db.shares.find((s) => s.todoId === todoId && s.userId === targetUser.id)
      if (existingShare) {
        if (existingShare.active) {
          return sendJson(
            res,
            { error: `Todo is already shared with ${targetUser.name} (${targetUser.email}).` },
            400
          )
        } else {
          existingShare.active = true
          existingShare.updatedAt = new Date().toISOString()
          writeDb(db)
          return sendJson(res, {
            success: true,
            message: `Re-activated share with ${targetUser.name} (${targetUser.email})!`,
          })
        }
      }

      const newShare: DbShare = {
        id: crypto.randomUUID(),
        todoId,
        userId: targetUser.id,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      db.shares.push(newShare)
      writeDb(db)

      return sendJson(res, {
        success: true,
        message: `Successfully shared with ${targetUser.name} (${targetUser.email})!`,
        targetUser: { id: targetUser.id, name: targetUser.name, email: targetUser.email },
      }, 201)
    }

    // 9. DELETE /api/todos/:id/share/:targetUserId
    const unshareMatch = pathname.match(/^\/api\/todos\/([a-zA-Z0-9-]+)\/share\/([a-zA-Z0-9-]+)$/)
    if (unshareMatch && method === 'DELETE') {
      const todoId = unshareMatch[1]
      const targetUserId = unshareMatch[2]

      const db = readDb()
      const share = db.shares.find((s) => s.todoId === todoId && s.userId === targetUserId && s.active)

      if (!share) {
        return sendJson(res, { error: 'Share not found or already inactive' }, 404)
      }

      share.active = false
      share.updatedAt = new Date().toISOString()
      writeDb(db)

      return sendJson(res, { success: true, message: 'Access removed successfully' })
    }

    // Fallback 404 for unknown /api route
    return sendJson(res, { error: 'API route not found' }, 404)
  } catch (err) {
    console.error('API Error:', err)
    return sendJson(res, { error: 'Internal server error' }, 500)
  }
}
