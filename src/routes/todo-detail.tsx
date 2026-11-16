import { createSignal, createMemo, Show, For } from 'solid-js'
import { useParams, useNavigate, A, Navigate } from '@solidjs/router'
import { store, type TodoWithShares, type User } from '../lib/store'

export default function TodoDetail() {
  if (!store.currentUser()) {
    return <Navigate href="/login" />
  }

  const params = useParams()
  const navigate = useNavigate()

  const todoId = () => params.id || ''
  const todo = (): TodoWithShares | null => (todoId() ? store.getTodoById(todoId()) : null)

  const [isEditing, setIsEditing] = createSignal(false)
  const [editTitle, setEditTitle] = createSignal('')
  const [editDesc, setEditDesc] = createSignal('')
  const [shareInput, setShareInput] = createSignal('')
  const [message, setMessage] = createSignal<{ text: string; isError: boolean } | null>(null)

  const searchResults = createMemo<User[]>(() => {
    const q = shareInput().trim()
    if (!q) return []
    return store.searchUsers(q)
  })

  // Initialize editing fields when entering edit mode
  const startEditing = () => {
    const cur = todo()
    if (cur) {
      setEditTitle(cur.title)
      setEditDesc(cur.description)
      setIsEditing(true)
    }
  }

  const handleSaveEdit = (e: SubmitEvent) => {
    e.preventDefault()
    if (!editTitle().trim() || !todoId()) return

    const ok = store.updateTodo(todoId(), {
      title: editTitle(),
      description: editDesc(),
    })
    if (ok) {
      setIsEditing(false)
      setMessage({ text: 'Changes saved successfully!', isError: false })
    }
  }

  const handleShareWithUser = (targetUser: User) => {
    if (!todoId()) return
    const res = store.shareTodoWithUser(todoId(), targetUser.id)
    setMessage({ text: res.message, isError: !res.success })
    if (res.success) {
      setShareInput('')
    }
  }

  const handleShare = (e: SubmitEvent) => {
    e.preventDefault()
    const target = shareInput().trim()
    if (!target || !todoId()) return

    const res = store.shareTodo(todoId(), target)
    setMessage({ text: res.message, isError: !res.success })
    if (res.success) {
      setShareInput('')
    }
  }

  const handleUnshare = (userId: string, userName: string) => {
    if (!todoId()) return
    const res = store.unshareTodo(todoId(), userId)
    setMessage({
      text: res.success ? `Removed access for ${userName}.` : res.message,
      isError: !res.success,
    })
  }

  const handleDelete = () => {
    const cur = todo()
    if (!cur || !todoId()) return
    if (confirm(cur.isOwner ? 'Are you sure you want to permanently delete this todo?' : 'Remove yourself from this shared todo?')) {
      store.deleteTodo(todoId())
      navigate('/todos')
    }
  }

  return (
    <div class="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div class="flex items-center justify-between">
          <A
            href="/todos"
            class="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
          >
            <span>&larr;</span> Back to Workspace
          </A>
          <div class="flex items-center space-x-2">
            <Show when={todo()}>
              <button
                onClick={handleDelete}
                class="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                {todo()?.isOwner ? 'Delete Todo' : 'Leave Todo'}
              </button>
            </Show>
          </div>
        </div>

        {/* Message Banner */}
        <Show when={message()}>
          {(msg) => (
            <div
              class={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm ${
                msg().isError
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
            >
              <span>{msg().text}</span>
              <button
                onClick={() => setMessage(null)}
                class="text-xs ml-4 opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}
        </Show>

        <Show
          when={todo()}
          fallback={
            <div class="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <div class="text-4xl mb-3">🔍</div>
              <h3 class="text-lg font-bold text-gray-800">Todo Not Found</h3>
              <p class="text-sm text-gray-500 mt-1 mb-4">
                This todo does not exist or you do not have permission to access it.
              </p>
              <A
                href="/todos"
                class="px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl"
              >
                Return to Todos
              </A>
            </div>
          }
        >
          {(item) => (
            <div class="space-y-6">
              {/* Main Card */}
              <div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <Show
                  when={isEditing()}
                  fallback={
                    <div class="space-y-4">
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={item().complete}
                            onChange={() => store.toggleComplete(item().id)}
                            class="mt-1.5 w-6 h-6 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <h1
                              class={`text-2xl font-bold ${
                                item().complete ? 'line-through text-gray-400' : 'text-gray-900'
                              }`}
                            >
                              {item().title}
                            </h1>
                            <div class="flex items-center gap-2 mt-2">
                              <span
                                class={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                  item().complete
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item().complete ? 'Completed' : 'In Progress'}
                              </span>
                              <span class="text-xs text-gray-400">
                                Updated {new Date(item().updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={startEditing}
                          class="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                        >
                          ✏️ Edit
                        </button>
                      </div>

                      <Show when={item().description}>
                        <div class="pt-3 border-t border-gray-100">
                          <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                            Description / Context
                          </h4>
                          <p class="text-gray-700 whitespace-pre-line text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {item().description}
                          </p>
                        </div>
                      </Show>
                    </div>
                  }
                >
                  {/* Edit Form */}
                  <form onSubmit={handleSaveEdit} class="space-y-4">
                    <h3 class="text-lg font-bold text-gray-900">Edit Task Details</h3>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        value={editTitle()}
                        onInput={(e) => setEditTitle(e.currentTarget.value)}
                        class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editDesc()}
                        onInput={(e) => setEditDesc(e.currentTarget.value)}
                        class="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      />
                    </div>
                    <div class="flex items-center justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </Show>
              </div>

              {/* SHARING COLLABORATION PANEL */}
              <div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="p-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">👥</span>
                    <h2 class="text-xl font-bold text-gray-900">Task Sharing & Permissions</h2>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Share this task with other users so they can view, complete, and collaborate on it.
                  </p>
                </div>

                {/* Share Form (by Name or Email) */}
                <form onSubmit={handleShare} class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Search user by name or email to share
                  </label>
                  <div class="flex gap-2">
                    <input
                      type="text"
                      value={shareInput()}
                      onInput={(e) => setShareInput(e.currentTarget.value)}
                      placeholder="Type name or email..."
                      class="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                    />
                    <button
                      type="submit"
                      class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
                    >
                      Share
                    </button>
                  </div>

                  {/* Matching User Results */}
                  <Show when={shareInput().trim().length > 0}>
                    <div class="bg-white border border-gray-200 rounded-xl p-3 space-y-2 mt-2">
                      <p class="text-xs font-semibold text-gray-500">
                        Matching users ({searchResults().length}):
                      </p>
                      <For each={searchResults()}>
                        {(user) => (
                          <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                              <div class="text-xs font-bold text-gray-800">{user.name}</div>
                              <div class="text-[11px] text-gray-500">{user.email}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleShareWithUser(user)}
                              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                            >
                              Share
                            </button>
                          </div>
                        )}
                      </For>
                      <Show when={searchResults().length === 0}>
                        <p class="text-xs text-gray-400 italic py-1">
                          No registered user found matching "{shareInput()}".
                        </p>
                      </Show>
                    </div>
                  </Show>
                </form>

                {/* Users List with Access */}
                <div>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Members with access ({item().sharedUsers.length + 1})
                  </h3>

                  <div class="space-y-2">
                    {/* Creator */}
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div class="flex items-center space-x-3">
                        <div class="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                          {item().creatorName.charAt(0)}
                        </div>
                        <div>
                          <p class="text-sm font-bold text-gray-900">{item().creatorName}</p>
                          <p class="text-xs text-gray-500">{item().creatorEmail}</p>
                        </div>
                      </div>
                      <span class="text-xs bg-gray-200 text-gray-700 font-semibold px-2.5 py-1 rounded-full">
                        Creator / Owner
                      </span>
                    </div>

                    {/* Shared members */}
                    <For each={item().sharedUsers}>
                      {(sh) => (
                        <div class="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors">
                          <div class="flex items-center space-x-3">
                            <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                              {sh.name.charAt(0)}
                            </div>
                            <div>
                              <p class="text-sm font-semibold text-gray-900">{sh.name}</p>
                              <p class="text-xs text-gray-500">{sh.email}</p>
                            </div>
                          </div>

                          <div class="flex items-center space-x-3">
                            <span class="text-xs bg-green-50 text-green-700 border border-green-200 font-medium px-2.5 py-0.5 rounded-full">
                              Can edit & complete
                            </span>
                            <button
                              onClick={() => handleUnshare(sh.userId, sh.name)}
                              class="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-lg font-semibold transition-colors border border-transparent hover:border-red-100"
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      )}
                    </For>

                    <Show when={item().sharedUsers.length === 0}>
                      <div class="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <p class="text-xs text-gray-400">
                          This task is private to {item().creatorName}. Enter an email above to share it!
                        </p>
                      </div>
                    </Show>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Show>
      </div>
    </div>
  )
}
