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

const STORAGE_KEY_USERS = 'todo_app_users_v1'
const STORAGE_KEY_TODOS = 'todo_app_todos_v1'
const STORAGE_KEY_SHARES = 'todo_app_shares_v1'
const STORAGE_KEY_SESSION = 'todo_app_session_v1'

// Initial seed data
const SEED_USERS: User[] = [
  {
    id: 'u-alice-1',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    passwordHash: 'password123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-bob-2',
    email: 'bob@example.com',
    name: 'Bob Smith',
    passwordHash: 'password123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-charlie-3',
    email: 'charlie@example.com',
    name: 'Charlie Brown',
    passwordHash: 'password123',
    createdAt: new Date().toISOString(),
  },
]

const SEED_TODOS: Todo[] = [
  {
    id: 't-1',
    title: 'Design app architecture & layout',
    description: 'Create mobile-friendly wireframes and wire up SolidJS reactive state.',
    complete: true,
    creatorId: 'u-alice-1',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 't-2',
    title: 'Review team pull requests',
    description: 'Check security and test coverage for the new sharing features.',
    complete: false,
    creatorId: 'u-bob-2',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 't-3',
    title: 'Set up production deployment pipeline',
    description: 'Configure Docker compose, healthchecks, and environment variables.',
    complete: false,
    creatorId: 'u-alice-1',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const SEED_SHARES: Share[] = [
  // Todo 1 created by Alice, shared with Bob
  {
    id: 's-1',
    todoId: 't-1',
    userId: 'u-bob-2',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Todo 2 created by Bob, shared with Alice
  {
    id: 's-2',
    todoId: 't-2',
    userId: 'u-alice-1',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

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

// Reactive Signals for global state
function initUsers(): User[] {
  const existing = getFromStorage<User[]>(STORAGE_KEY_USERS, [])
  if (existing.length === 0) {
    saveToStorage(STORAGE_KEY_USERS, SEED_USERS)
    return SEED_USERS
  }
  return existing
}

function initTodos(): Todo[] {
  const existing = getFromStorage<Todo[]>(STORAGE_KEY_TODOS, [])
  if (existing.length === 0) {
    saveToStorage(STORAGE_KEY_TODOS, SEED_TODOS)
    return SEED_TODOS
  }
  return existing
}

function initShares(): Share[] {
  const existing = getFromStorage<Share[]>(STORAGE_KEY_SHARES, [])
  if (existing.length === 0) {
    saveToStorage(STORAGE_KEY_SHARES, SEED_SHARES)
    return SEED_SHARES
  }
  return existing
}

function initSession(users: User[]): User | null {
  const sessionUserId = getFromStorage<string | null>(STORAGE_KEY_SESSION, null)
  if (sessionUserId) {
    const found = users.find((u) => u.id === sessionUserId)
    if (found) return found
  }
  // Default to Alice if no session
  const defaultUser = users[0] || null
  if (defaultUser) {
    saveToStorage(STORAGE_KEY_SESSION, defaultUser.id)
  }
  return defaultUser
}

const initialUsers = initUsers()
const [users, setUsers] = createSignal<User[]>(initialUsers)
const [todos, setTodos] = createSignal<Todo[]>(initTodos())
const [shares, setShares] = createSignal<Share[]>(initShares())
const [currentUser, setCurrentUserSignal] = createSignal<User | null>(initSession(initialUsers))

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

  switchUser(userId: string): boolean {
    const user = users().find((u) => u.id === userId)
    if (user) {
      saveToStorage(STORAGE_KEY_SESSION, user.id)
      setCurrentUserSignal(user)
      return true
    }
    return false
  },

  // Todo queries & mutations
  getTodosForCurrentUser(): TodoWithShares[] {
    const user = currentUser()
    if (!user) return []

    const allTodos = todos()
    const allShares = shares()
    const allUsers = users()

    // Find todos created by user or shared with user
    const accessibleTodos = allTodos.filter((t) => {
      if (t.creatorId === user.id) return true
      return allShares.some((s) => s.todoId === t.id && s.userId === user.id && s.active)
    })

    // Sort by updatedAt descending
    accessibleTodos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return accessibleTodos.map((t) => {
      const creator = allUsers.find((u) => u.id === t.creatorId)
      const todoShares = allShares
        .filter((s) => s.todoId === t.id && s.active)
        .map((s) => {
          const u = allUsers.find((user) => user.id === s.userId)
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
        const u = allUsers.find((user) => user.id === s.userId)
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

    // Only owner can delete todo
    if (item.creatorId !== user.id) {
      // If shared user deletes, it just unshares them
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

  // Share methods
  shareTodo(todoId: string, targetEmail: string): { success: boolean; message: string } {
    const user = currentUser()
    if (!user) return { success: false, message: 'You must be logged in to share.' }

    const cleanEmail = targetEmail.trim().toLowerCase()
    if (!cleanEmail) return { success: false, message: 'Please enter a valid email.' }

    const targetUser = users().find((u) => u.email === cleanEmail)
    if (!targetUser) {
      return { success: false, message: `No user found with email "${cleanEmail}".` }
    }

    if (targetUser.id === user.id) {
      return { success: false, message: 'You already own this todo.' }
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
        // Reactivate
        const updatedShares = allShares.map((s) =>
          s.id === existing.id ? { ...s, active: true, updatedAt: new Date().toISOString() } : s
        )
        saveToStorage(STORAGE_KEY_SHARES, updatedShares)
        setShares(updatedShares)
        return { success: true, message: `Re-activated share with ${targetUser.name} (${cleanEmail})!` }
      }
    }

    // New share
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

  // Reset to initial seed data
  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEY_USERS)
    localStorage.removeItem(STORAGE_KEY_TODOS)
    localStorage.removeItem(STORAGE_KEY_SHARES)
    localStorage.removeItem(STORAGE_KEY_SESSION)

    saveToStorage(STORAGE_KEY_USERS, SEED_USERS)
    saveToStorage(STORAGE_KEY_TODOS, SEED_TODOS)
    saveToStorage(STORAGE_KEY_SHARES, SEED_SHARES)
    saveToStorage(STORAGE_KEY_SESSION, SEED_USERS[0].id)

    setUsers(SEED_USERS)
    setTodos(SEED_TODOS)
    setShares(SEED_SHARES)
    setCurrentUserSignal(SEED_USERS[0])
  },
}
