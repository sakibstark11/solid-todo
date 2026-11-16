import { createSignal, createMemo, onMount, Show, For } from 'solid-js'
import { store, type TodoWithShares, type User } from '../lib/store'

interface ShareModalProps {
  todoId: string
  onClose: () => void
}

export default function ShareModal(props: ShareModalProps) {
  const [searchInput, setSearchInput] = createSignal('')
  const [feedback, setFeedback] = createSignal<{ text: string; isError: boolean } | null>(null)
  const [isSubmitting, setIsSubmitting] = createSignal(false)

  // Refresh users list immediately on open
  onMount(() => {
    store.refreshUsers()
    store.refreshTodos()
  })

  const todo = (): TodoWithShares | null => store.getTodoById(props.todoId)

  // Other users in system (excluding current logged-in user)
  const allOtherUsers = createMemo<User[]>(() => {
    const cur = store.currentUser()
    return store.users().filter((u) => u.id !== cur?.id)
  })

  // Filtered by search input
  const filteredUsers = createMemo<User[]>(() => {
    const q = searchInput().trim().toLowerCase()
    const others = allOtherUsers()
    if (!q) return others
    return others.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  })

  const isAlreadyShared = (userId: string) => {
    const currentTodo = todo()
    if (!currentTodo) return false
    return currentTodo.sharedUsers.some((s) => s.userId === userId && s.active)
  }

  const handleShareWithUser = async (targetUser: User) => {
    setIsSubmitting(true)
    const res = await store.shareTodoWithUser(props.todoId, targetUser.id)
    setIsSubmitting(false)
    setFeedback({ text: res.message, isError: !res.success })
  }

  const handleFormSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    const target = searchInput().trim()
    if (!target) {
      setFeedback({ text: 'Please enter a name or email address.', isError: true })
      return
    }

    setIsSubmitting(true)
    const res = await store.shareTodo(props.todoId, target)
    setIsSubmitting(false)
    setFeedback({ text: res.message, isError: !res.success })
    if (res.success) {
      setSearchInput('')
    }
  }

  const handleUnshare = async (userId: string, userName: string) => {
    setIsSubmitting(true)
    const res = await store.unshareTodo(props.todoId, userId)
    setIsSubmitting(false)
    setFeedback({
      text: res.success ? `Revoked access for ${userName}.` : res.message,
      isError: !res.success,
    })
  }

  return (
    <div class="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={props.onClose}
      ></div>

      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 overflow-hidden z-10 border border-gray-100">
          {/* Header */}
          <div class="flex items-start justify-between pb-4 border-b border-gray-100">
            <div>
              <div class="flex items-center space-x-2">
                <span class="p-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-bold">🔗</span>
                <h3 class="text-xl font-bold text-gray-900">Share Todo</h3>
              </div>
              <p class="text-sm text-gray-500 mt-1 line-clamp-1 font-medium">
                "{todo()?.title || 'Selected Todo'}"
              </p>
            </div>
            <button
              onClick={props.onClose}
              class="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Feedback Banner */}
          <Show when={feedback()}>
            {(fb) => (
              <div
                class={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center justify-between ${
                  fb().isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-green-50 text-green-800 border border-green-200'
                }`}
              >
                <span>{fb().text}</span>
                <button
                  onClick={() => setFeedback(null)}
                  class="text-xs ml-2 opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            )}
          </Show>

          {/* Search Form */}
          <form onSubmit={handleFormSubmit} class="mt-5 space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Search Registered Users by Name or Email
              </label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <input
                    type="text"
                    value={searchInput()}
                    onInput={(e) => setSearchInput(e.currentTarget.value)}
                    placeholder="Type name or email to filter..."
                    class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pl-9"
                  />
                  <span class="absolute left-3 top-2.5 text-xs text-gray-400">🔍</span>
                  <Show when={searchInput()}>
                    <button
                      type="button"
                      onClick={() => setSearchInput('')}
                      class="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </Show>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting()}
                  class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                >
                  Share
                </button>
              </div>
            </div>
          </form>

          {/* Available Users List */}
          <div class="mt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Registered Users ({filteredUsers().length})
              </span>
              <button
                type="button"
                onClick={() => store.refreshUsers()}
                class="text-xs text-blue-600 hover:underline"
              >
                ↺ Refresh List
              </button>
            </div>

            <div class="space-y-2 max-h-48 overflow-y-auto p-1">
              <For each={filteredUsers()}>
                {(user) => {
                  const shared = () => isAlreadyShared(user.id)
                  return (
                    <div class="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200 transition-colors">
                      <div class="flex items-center space-x-2.5">
                        <div class="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p class="text-sm font-bold text-gray-900">{user.name}</p>
                          <p class="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <div>
                        <Show
                          when={shared()}
                          fallback={
                            <button
                              type="button"
                              disabled={isSubmitting()}
                              onClick={() => handleShareWithUser(user)}
                              class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                            >
                              <span>🔗</span> Share
                            </button>
                          }
                        >
                          <div class="flex items-center gap-2">
                            <span class="text-[11px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-md">
                              ✓ Shared
                            </span>
                            <button
                              type="button"
                              disabled={isSubmitting()}
                              onClick={() => handleUnshare(user.id, user.name)}
                              class="text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              Revoke
                            </button>
                          </div>
                        </Show>
                      </div>
                    </div>
                  )
                }}
              </For>

              {/* Empty State: 0 Other Users Registered */}
              <Show when={allOtherUsers().length === 0}>
                <div class="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1.5">
                  <p class="font-bold flex items-center gap-1">
                    <span>ℹ️</span> No other users registered yet
                  </p>
                  <p class="text-amber-800">
                    You are currently the only registered user in the application (<strong>{store.currentUser()?.name}</strong>).
                  </p>
                  <p class="text-amber-700">
                    To share a task with someone:
                  </p>
                  <ol class="list-decimal list-inside pl-1 space-y-0.5 text-amber-800">
                    <li>Open an Incognito window (or a second tab/browser).</li>
                    <li>Register another user (e.g. named <em>"sakib"</em> with a different email).</li>
                    <li>They will immediately appear in this list ready to be shared with!</li>
                  </ol>
                </div>
              </Show>

              {/* No search matches */}
              <Show when={allOtherUsers().length > 0 && filteredUsers().length === 0}>
                <div class="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
                  No registered users match <strong>"{searchInput()}"</strong>.
                </div>
              </Show>
            </div>
          </div>

          {/* Current Shares / Permissions */}
          <div class="mt-5 pt-4 border-t border-gray-100">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Active Shares on this Todo ({todo()?.sharedUsers.length || 0})
            </h4>

            <div class="space-y-1.5 max-h-36 overflow-y-auto">
              <For each={todo()?.sharedUsers}>
                {(share) => (
                  <div class="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 text-xs">
                    <span class="font-medium text-gray-800">
                      {share.name} <span class="text-gray-400">({share.email})</span>
                    </span>
                    <button
                      onClick={() => handleUnshare(share.userId, share.name)}
                      class="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Remove Access
                    </button>
                  </div>
                )}
              </For>
              <Show when={!todo()?.sharedUsers || todo()?.sharedUsers.length === 0}>
                <p class="text-xs text-gray-400 italic">No one else has access to this todo yet.</p>
              </Show>
            </div>
          </div>

          {/* Footer */}
          <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={props.onClose}
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
