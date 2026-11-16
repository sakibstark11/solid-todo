import { createSignal } from 'solid-js'

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: string
}

export interface Todo {
  id: string
  title: string
  description: string
  complete: boolean
  creatorId: string
  createdAt: string
  updatedAt: string
}

export interface Share {
  id: string
  todoId: string
  userId: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface TodoWithShares extends Todo {
  creatorName: string
  creatorEmail: string
  isOwner: boolean
  sharedUsers: Array<{
    shareId: string
    userId: string
    name: string
    email: string
    active: boolean
  }>
}

const STORAGE_KEY_USERS = 'todo_users_v2'
const STORAGE_KEY_TODOS = 'todo_items_v2'
const STORAGE_KEY_SHARES = 'todo_shares_v2'
const STORAGE_KEY_SESSION = 'todo_session_v2'

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Failed to save to localStorage:', err)
  }
}

// Clean initialization - starts completely empty
const initialUsers = getFromStorage<User[]>(STORAGE_KEY_USERS, [])
const initialTodos = getFromStorage<Todo[]>(STORAGE_KEY_TODOS, [])
const initialShares = getFromStorage<Share[]>(STORAGE_KEY_SHARES, [])
const sessionUserId = getFromStorage<string | null>(STORAGE_KEY_SESSION, null)
const initialSession = sessionUserId ? initialUsers.find((u) => u.id === sessionUserId) || null : null

// Also clear any legacy v1 storage if present
try {
  localStorage.removeItem('todo_app_users_v1')
  localStorage.removeItem('todo_app_todos_v1')
  localStorage.removeItem('todo_app_shares_v1')
  localStorage.removeItem('todo_app_session_v1')
} catch {}

const [users, setUsers] = createSignal<User[]>(initialUsers)
const [todos, setTodos] = createSignal<Todo[]>(initialTodos)
const [shares, setShares] = createSignal<Share[]>(initialShares)
const [currentUser, setCurrentUserSignal] = createSignal<User | null>(initialSession)

export const store = {
  // Signals
  currentUser,
  users,
  todos,
  shares,

  // Auth methods
  login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const cleanEmail = email.trim().toLowerCase()
    const allUsers = users()
    const user = allUsers.find((u) => u.email === cleanEmail)
    if (!user || user.passwordHash !== password) {
      return { success: false, error: 'Invalid email or password.' }
    }
    saveToStorage(STORAGE_KEY_SESSION, user.id)
    setCurrentUserSignal(user)
    return { success: true, user }
  },

  register(name: string, email: string, password: string): { success: boolean; error?: string; user?: User } {
    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()
    if (!cleanName) return { success: false, error: 'Name is required.' }
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Valid email is required.' }
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' }

    const allUsers = users()
    if (allUsers.some((u) => u.email === cleanEmail)) {
      return { success: false, error: 'A user with this email already exists.' }
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      passwordHash: password,
      createdAt: new Date().toISOString(),
    }

    const updated = [...allUsers, newUser]
    saveToStorage(STORAGE_KEY_USERS, updated)
    setUsers(updated)

    saveToStorage(STORAGE_KEY_SESSION, newUser.id)
    setCurrentUserSignal(newUser)

    return { success: true, user: newUser }
  },

  logout(): void {
    saveToStorage(STORAGE_KEY_SESSION, null)
    setCurrentUserSignal(null)
  },

  // Todo queries & mutations
  getTodosForCurrentUser(): TodoWithShares[] {
    const user = currentUser()
    if (!user) return []

    const allTodos = todos()
    const allShares = shares()
    const allUsers = users()

    const accessibleTodos = allTodos.filter((t) => {
      if (t.creatorId === user.id) return true
      return allShares.some((s) => s.todoId === t.id && s.userId === user.id && s.active)
    })

    accessibleTodos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return accessibleTodos.map((t) => {
      const creator = allUsers.find((u) => u.id === t.creatorId)
      const todoShares = allShares
        .filter((s) => s.todoId === t.id && s.active)
        .map((s) => {
          const u = allUsers.find((member) => member.id === s.userId)
          return {
            shareId: s.id,
            userId: s.userId,
            name: u ? u.name : 'Unknown User',
            email: u ? u.email : '',
            active: s.active,
          }
        })

      return {
        ...t,
        creatorName: creator ? creator.name : 'Unknown',
        creatorEmail: creator ? creator.email : '',
        isOwner: t.creatorId === user.id,
        sharedUsers: todoShares,
      }
    })
  },

  getTodoById(todoId: string): TodoWithShares | null {
    const user = currentUser()
    if (!user) return null

    const allTodos = todos()
    const t = allTodos.find((item) => item.id === todoId)
    if (!t) return null

    const allShares = shares()
    const allUsers = users()

    const hasAccess =
      t.creatorId === user.id ||
      allShares.some((s) => s.todoId === t.id && s.userId === user.id && s.active)

    if (!hasAccess) return null

    const creator = allUsers.find((u) => u.id === t.creatorId)
    const todoShares = allShares
      .filter((s) => s.todoId === t.id && s.active)
      .map((s) => {
        const u = allUsers.find((member) => member.id === s.userId)
        return {
          shareId: s.id,
          userId: s.userId,
          name: u ? u.name : 'Unknown User',
          email: u ? u.email : '',
          active: s.active,
        }
      })

    return {
      ...t,
      creatorName: creator ? creator.name : 'Unknown',
      creatorEmail: creator ? creator.email : '',
      isOwner: t.creatorId === user.id,
      sharedUsers: todoShares,
    }
  },

  createTodo(title: string, description: string): TodoWithShares | null {
    const user = currentUser()
    if (!user) return null

    const trimmedTitle = title.trim()
    if (!trimmedTitle) return null

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: description.trim(),
      complete: false,
      creatorId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [newTodo, ...todos()]
    saveToStorage(STORAGE_KEY_TODOS, updated)
    setTodos(updated)

    return this.getTodoById(newTodo.id)
  },

  toggleComplete(todoId: string): void {
    const allTodos = todos()
    const updated = allTodos.map((t) => {
      if (t.id === todoId) {
        return {
          ...t,
          complete: !t.complete,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })
    saveToStorage(STORAGE_KEY_TODOS, updated)
    setTodos(updated)
  },

  updateTodo(todoId: string, updates: { title?: string; description?: string }): boolean {
    const allTodos = todos()
    const item = allTodos.find((t) => t.id === todoId)
    if (!item) return false

    const updated = allTodos.map((t) => {
      if (t.id === todoId) {
        return {
          ...t,
          title: updates.title !== undefined ? updates.title.trim() : t.title,
          description: updates.description !== undefined ? updates.description.trim() : t.description,
          updatedAt: new Date().toISOString(),
        }
      }
      return t
    })
    saveToStorage(STORAGE_KEY_TODOS, updated)
    setTodos(updated)
    return true
  },

  deleteTodo(todoId: string): boolean {
    const user = currentUser()
    if (!user) return false

    const allTodos = todos()
    const item = allTodos.find((t) => t.id === todoId)
    if (!item) return false

    if (item.creatorId !== user.id) {
      this.unshareTodo(todoId, user.id)
      return true
    }

    const updatedTodos = allTodos.filter((t) => t.id !== todoId)
    const updatedShares = shares().filter((s) => s.todoId !== todoId)

    saveToStorage(STORAGE_KEY_TODOS, updatedTodos)
    saveToStorage(STORAGE_KEY_SHARES, updatedShares)
    setTodos(updatedTodos)
    setShares(updatedShares)
    return true
  },

  shareTodo(todoId: string, targetEmail: string): { success: boolean; message: string } {
    const user = currentUser()
    if (!user) return { success: false, message: 'You must be logged in to share.' }

    const cleanEmail = targetEmail.trim().toLowerCase()
    if (!cleanEmail) return { success: false, message: 'Please enter a valid email.' }

    const targetUser = users().find((u) => u.email === cleanEmail)
    if (!targetUser) {
      return { success: false, message: `No registered user found with email "${cleanEmail}".` }
    }

    if (targetUser.id === user.id) {
      return { success: false, message: 'You cannot share a todo with yourself.' }
    }

    const allTodos = todos()
    const todo = allTodos.find((t) => t.id === todoId)
    if (!todo) return { success: false, message: 'Todo not found.' }

    const allShares = shares()
    const existing = allShares.find((s) => s.todoId === todoId && s.userId === targetUser.id)

    if (existing) {
      if (existing.active) {
        return { success: false, message: `Already shared with ${targetUser.name} (${cleanEmail}).` }
      } else {
        const updatedShares = allShares.map((s) =>
          s.id === existing.id ? { ...s, active: true, updatedAt: new Date().toISOString() } : s
        )
        saveToStorage(STORAGE_KEY_SHARES, updatedShares)
        setShares(updatedShares)
        return { success: true, message: `Re-activated share with ${targetUser.name} (${cleanEmail})!` }
      }
    }

    const newShare: Share = {
      id: crypto.randomUUID(),
      todoId,
      userId: targetUser.id,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedShares = [...allShares, newShare]
    saveToStorage(STORAGE_KEY_SHARES, updatedShares)
    setShares(updatedShares)

    return { success: true, message: `Successfully shared with ${targetUser.name} (${cleanEmail})!` }
  },

  unshareTodo(todoId: string, targetUserId: string): { success: boolean; message: string } {
    const allShares = shares()
    const targetShare = allShares.find((s) => s.todoId === todoId && s.userId === targetUserId && s.active)

    if (!targetShare) {
      return { success: false, message: 'Share not found or already inactive.' }
    }

    const updatedShares = allShares.map((s) =>
      s.id === targetShare.id ? { ...s, active: false, updatedAt: new Date().toISOString() } : s
    )

    saveToStorage(STORAGE_KEY_SHARES, updatedShares)
    setShares(updatedShares)
    return { success: true, message: 'Access removed successfully.' }
  },
}
