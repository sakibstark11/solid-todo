import { createSignal, createMemo, Show, For } from 'solid-js'
import { store, type TodoWithShares, type User } from '../lib/store'

interface ShareModalProps {
  todoId: string
  onClose: () => void
}

export default function ShareModal(props: ShareModalProps) {
  const [searchInput, setSearchInput] = createSignal('')
  const [feedback, setFeedback] = createSignal<{ text: string; isError: boolean } | null>(null)

  const todo = (): TodoWithShares | null => store.getTodoById(props.todoId)

  const searchResults = createMemo<User[]>(() => {
    const q = searchInput().trim()
    if (!q) return []
    return store.searchUsers(q)
  })

  const handleShareWithUser = (targetUser: User) => {
    const res = store.shareTodoWithUser(props.todoId, targetUser.id)
    setFeedback({ text: res.message, isError: !res.success })
    if (res.success) {
      setSearchInput('')
    }
  }

  const handleFormSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    const target = searchInput().trim()
    if (!target) {
      setFeedback({ text: 'Please enter a name or email address.', isError: true })
      return
    }

    const res = store.shareTodo(props.todoId, target)
    setFeedback({ text: res.message, isError: !res.success })
    if (res.success) {
      setSearchInput('')
    }
  }

  const handleUnshare = (userId: string, userName: string) => {
    const res = store.unshareTodo(props.todoId, userId)
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
                <span class="p-1.5 bg-blue-100 text-blue-700 rounded-md text-sm">🔗</span>
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
                class={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center justify-between ${
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

          {/* Search Form (by Name or Email) */}
          <form onSubmit={handleFormSubmit} class="mt-5 space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Search user by name or email
              </label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <input
                    type="text"
                    value={searchInput()}
                    onInput={(e) => setSearchInput(e.currentTarget.value)}
                    placeholder="Search by name or email..."
                    class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
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
                  class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                >
                  Share
                </button>
              </div>
            </div>

            {/* Live Search Results */}
            <Show when={searchInput().trim().length > 0}>
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                <p class="text-xs font-semibold text-gray-500">
                  Matching users ({searchResults().length}):
                </p>

                <For each={searchResults()}>
                  {(user) => (
                    <div class="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 shadow-xs">
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
                    No registered user found matching "{searchInput()}".
                  </p>
                </Show>
              </div>
            </Show>
          </form>

          {/* People with Access */}
          <div class="mt-6 pt-5 border-t border-gray-100">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              People with access
            </h4>

            <div class="space-y-2.5 max-h-56 overflow-y-auto">
              {/* Creator / Owner */}
              <div class="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {todo()?.creatorName.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{todo()?.creatorName}</p>
                    <p class="text-xs text-gray-500">{todo()?.creatorEmail}</p>
                  </div>
                </div>
                <span class="text-xs bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded-full">
                  Owner
                </span>
              </div>

              {/* Shared Users */}
              <For each={todo()?.sharedUsers}>
                {(share) => (
                  <div class="flex items-center justify-between p-2.5 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {share.name.charAt(0)}
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">{share.name}</p>
                        <p class="text-xs text-gray-500">{share.email}</p>
                      </div>
                    </div>

                    <div class="flex items-center space-x-2">
                      <span class="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                        Can edit
                      </span>
                      <button
                        onClick={() => handleUnshare(share.userId, share.name)}
                        class="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-colors font-medium"
                        title="Remove access"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </For>

              <Show when={todo()?.sharedUsers.length === 0}>
                <p class="text-xs text-gray-400 italic text-center py-2">
                  This todo has not been shared with anyone yet.
                </p>
              </Show>
            </div>
          </div>

          {/* Footer */}
          <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={props.onClose}
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
