import { createSignal } from 'solid-js'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface TodoWithShares {
  id: string
  title: string
  description: string
  complete: boolean
  creatorId: string
  createdAt: string
  updatedAt: string
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

const STORAGE_KEY_SESSION = 'todo_session_user_v3'

function getSessionUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function saveSessionUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION)
    }
  } catch (err) {
    console.error('Failed to save session:', err)
  }
}

// Global Signals
const [currentUser, setCurrentUserSignal] = createSignal<User | null>(getSessionUser())
const [users, setUsers] = createSignal<User[]>([])
const [todos, setTodos] = createSignal<TodoWithShares[]>([])

// Auto-sync functions
async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/users')
    if (res.ok) {
      const data = (await res.json()) as User[]
      setUsers(data)
      return data
    }
  } catch (err) {
    console.error('Failed to fetch users:', err)
  }
  return []
}

async function fetchTodos(userId?: string): Promise<TodoWithShares[]> {
  const uid = userId || currentUser()?.id
  if (!uid) {
    setTodos([])
    return []
  }
  try {
    const res = await fetch(`/api/todos?userId=${encodeURIComponent(uid)}`)
    if (res.ok) {
      const data = (await res.json()) as TodoWithShares[]
      setTodos(data)
      return data
    }
  } catch (err) {
    console.error('Failed to fetch todos:', err)
  }
  return []
}

// Initial fetch if user is logged in
if (currentUser()) {
  fetchUsers()
  fetchTodos()
} else {
  fetchUsers()
}

export const store = {
  // Signals
  currentUser,
  users,
  todos,

  // Manual refreshes
  async refreshUsers(): Promise<User[]> {
    return await fetchUsers()
  },

  async refreshTodos(): Promise<TodoWithShares[]> {
    return await fetchTodos()
  },

  // Auth methods
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create account.' }
      }
      const user = data.user as User
      saveSessionUser(user)
      setCurrentUserSignal(user)
      await fetchUsers()
      await fetchTodos(user.id)
      return { success: true, user }
    } catch {
      return { success: false, error: 'Network error during registration.' }
    }
  },

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid email or password.' }
      }
      const user = data.user as User
      saveSessionUser(user)
      setCurrentUserSignal(user)
      await fetchUsers()
      await fetchTodos(user.id)
      return { success: true, user }
    } catch {
      return { success: false, error: 'Network error during login.' }
    }
  },

  logout(): void {
    saveSessionUser(null)
    setCurrentUserSignal(null)
    setTodos([])
  },

  // Todo queries & mutations
  getTodosForCurrentUser(): TodoWithShares[] {
    return todos()
  },

  getTodoById(todoId: string): TodoWithShares | null {
    return todos().find((t) => t.id === todoId) || null
  },

  async createTodo(title: string, description: string): Promise<boolean> {
    const user = currentUser()
    if (!user) return false

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, userId: user.id }),
      })
      if (res.ok) {
        await fetchTodos(user.id)
        return true
      }
    } catch (err) {
      console.error('Failed to create todo:', err)
    }
    return false
  },

  async toggleComplete(todoId: string): Promise<void> {
    const item = todos().find((t) => t.id === todoId)
    if (!item) return

    const newComplete = !item.complete

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, complete: newComplete } : t))
    )

    try {
      await fetch(`/api/todos/${encodeURIComponent(todoId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complete: newComplete }),
      })
    } catch (err) {
      console.error('Failed to toggle todo:', err)
      await fetchTodos()
    }
  },

  async updateTodo(
    todoId: string,
    updates: { title?: string; description?: string }
  ): Promise<boolean> {
    try {
      const res = await fetch(`/api/todos/${encodeURIComponent(todoId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        await fetchTodos()
        return true
      }
    } catch (err) {
      console.error('Failed to update todo:', err)
    }
    return false
  },

  async deleteTodo(todoId: string): Promise<boolean> {
    const user = currentUser()
    if (!user) return false

    // Optimistic removal
    setTodos((prev) => prev.filter((t) => t.id !== todoId))

    try {
      const res = await fetch(
        `/api/todos/${encodeURIComponent(todoId)}?userId=${encodeURIComponent(user.id)}`,
        { method: 'DELETE' }
      )
      if (res.ok) {
        await fetchTodos(user.id)
        return true
      }
    } catch (err) {
      console.error('Failed to delete todo:', err)
      await fetchTodos(user.id)
    }
    return false
  },

  // Share methods
  searchUsers(query: string): User[] {
    const cur = currentUser()
    const clean = query.trim().toLowerCase()
    if (!clean) return []

    const otherUsers = users().filter((u) => u.id !== cur?.id)
    return otherUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(clean) ||
        u.email.toLowerCase().includes(clean)
    )
  },

  async shareTodoWithUser(
    todoId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const user = currentUser()
    if (!user) return { success: false, message: 'You must be logged in to share.' }

    try {
      const res = await fetch(`/api/todos/${encodeURIComponent(todoId)}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetQuery: targetUserId, userId: user.id }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        await fetchTodos(user.id)
        return { success: true, message: data.message }
      }
      return { success: false, message: data.error || 'Failed to share todo.' }
    } catch {
      return { success: false, message: 'Network error while sharing.' }
    }
  },

  async shareTodo(
    todoId: string,
    targetQuery: string
  ): Promise<{ success: boolean; message: string }> {
    const user = currentUser()
    if (!user) return { success: false, message: 'You must be logged in to share.' }

    try {
      const res = await fetch(`/api/todos/${encodeURIComponent(todoId)}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetQuery, userId: user.id }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        await fetchTodos(user.id)
        return { success: true, message: data.message }
      }
      return { success: false, message: data.error || 'Failed to share todo.' }
    } catch {
      return { success: false, message: 'Network error while sharing.' }
    }
  },

  async unshareTodo(
    todoId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(
        `/api/todos/${encodeURIComponent(todoId)}/share/${encodeURIComponent(targetUserId)}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      if (res.ok && data.success) {
        await fetchTodos()
        return { success: true, message: data.message }
      }
      return { success: false, message: data.error || 'Failed to remove access.' }
    } catch {
      return { success: false, message: 'Network error while unsharing.' }
    }
  },
}
