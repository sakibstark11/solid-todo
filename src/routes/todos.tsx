import { createSignal, createMemo, Show, For } from 'solid-js'
import { A } from '@solidjs/router'
import { store, type TodoWithShares } from '../lib/store'
import ShareModal from '../components/ShareModal'

type FilterType = 'all' | 'active' | 'completed' | 'shared' | 'mine'

export default function Todos() {
  const [filter, setFilter] = createSignal<FilterType>('all')
  const [searchQuery, setSearchQuery] = createSignal('')
  const [newTitle, setNewTitle] = createSignal('')
  const [newDescription, setNewDescription] = createSignal('')
  const [sharingTodoId, setSharingTodoId] = createSignal<string | null>(null)
  const [actionNotice, setActionNotice] = createSignal<string | null>(null)

  const showNotice = (msg: string) => {
    setActionNotice(msg)
    setTimeout(() => {
      setActionNotice(null)
    }, 3500)
  }

  const handleCreateTodo = (e: SubmitEvent) => {
    e.preventDefault()
    const title = newTitle().trim()
    if (!title) return

    const created = store.createTodo(title, newDescription().trim())
    if (created) {
      setNewTitle('')
      setNewDescription('')
      showNotice(`Created todo "${title}"!`)
    }
  }

  const handleToggle = (id: string, title: string) => {
    store.toggleComplete(id)
    showNotice(`Updated "${title}"`)
  }

  const handleDelete = (id: string, title: string, isOwner: boolean) => {
    if (confirm(isOwner ? `Delete todo "${title}"?` : `Remove yourself from "${title}"?`)) {
      store.deleteTodo(id)
      showNotice(isOwner ? `Deleted "${title}".` : `Removed access to "${title}".`)
    }
  }

  // Filtered & searched todos
  const displayedTodos = createMemo(() => {
    const list = store.getTodosForCurrentUser()
    const query = searchQuery().toLowerCase().trim()
    const curFilter = filter()

    return list.filter((t) => {
      // Search matching
      const matchesSearch =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.creatorName.toLowerCase().includes(query)

      if (!matchesSearch) return false

      // Filter matching
      if (curFilter === 'active') return !t.complete
      if (curFilter === 'completed') return t.complete
      if (curFilter === 'shared') return !t.isOwner
      if (curFilter === 'mine') return t.isOwner
      return true
    })
  })

  return (
    <div class="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-6">
        {/* Not Logged In Banner */}
        <Show when={!store.currentUser()}>
          <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-amber-900">You are currently viewing as guest</h3>
                <p class="text-xs text-amber-700 mt-0.5">
                  Sign in or create an account to save and share your tasks.
                </p>
              </div>
              <A
                href="/login"
                class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Sign In &rarr;
              </A>
            </div>
          </div>
        </Show>

        {/* Action Notice Toast */}
        <Show when={actionNotice()}>
          <div class="bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between transition-all">
            <span>✓ {actionNotice()}</span>
            <button
              onClick={() => setActionNotice(null)}
              class="text-blue-200 hover:text-white text-xs ml-4"
            >
              ✕
            </button>
          </div>
        </Show>

        {/* Page Title & Stats */}
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Todo Workspace</h1>
            <p class="text-sm text-gray-500 mt-1">
              Logged in as <strong class="text-gray-800">{store.currentUser()?.name || 'Guest'}</strong> ({store.currentUser()?.email || 'not signed in'})
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs bg-white text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full font-medium shadow-sm">
              Total: {store.getTodosForCurrentUser().length}
            </span>
            <span class="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-semibold shadow-sm">
              Shared: {store.getTodosForCurrentUser().filter((t) => !t.isOwner || t.sharedUsers.length > 0).length}
            </span>
          </div>
        </div>

        {/* Create Todo Card */}
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 transition-all hover:shadow-md">
          <h2 class="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span class="text-blue-600 font-bold">+</span> Create New Todo
          </h2>
          <form onSubmit={handleCreateTodo} class="space-y-3">
            <input
              type="text"
              required
              value={newTitle()}
              onInput={(e) => setNewTitle(e.currentTarget.value)}
              placeholder="What needs to be accomplished?"
              class="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
            />
            <textarea
              rows={2}
              value={newDescription()}
              onInput={(e) => setNewDescription(e.currentTarget.value)}
              placeholder="Add extra context or instructions (optional)..."
              class="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-gray-400"
            />
            <div class="flex justify-end">
              <button
                type="submit"
                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Add Todo</span>
              </button>
            </div>
          </form>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Tabs */}
          <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              class={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter() === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              class={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter() === 'active'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              class={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter() === 'completed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('shared')}
              class={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                filter() === 'shared'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              <span>🔗 Shared with me</span>
            </button>
            <button
              onClick={() => setFilter('mine')}
              class={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter() === 'mine'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Created by me
            </button>
          </div>

          {/* Search */}
          <div class="relative sm:w-64">
            <input
              type="text"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              placeholder="Search todos..."
              class="w-full px-3.5 py-1.5 pl-8 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all"
            />
            <span class="absolute left-2.5 top-2 text-xs text-gray-400">🔍</span>
            <Show when={searchQuery()}>
              <button
                onClick={() => setSearchQuery('')}
                class="absolute right-2.5 top-1.5 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </Show>
          </div>
        </div>

        {/* Todo Cards List */}
        <div class="space-y-3">
          <For each={displayedTodos()}>
            {(todo) => (
              <div
                class={`bg-white rounded-2xl border p-5 transition-all shadow-sm hover:shadow-md ${
                  todo.complete
                    ? 'border-gray-200 bg-gray-50/70'
                    : todo.isOwner
                    ? 'border-gray-200 hover:border-blue-300'
                    : 'border-indigo-200 bg-indigo-50/20 hover:border-indigo-300'
                }`}
              >
                <div class="flex items-start justify-between gap-4">
                  {/* Left: Checkbox & Content */}
                  <div class="flex items-start gap-3.5 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.complete}
                      onChange={() => handleToggle(todo.id, todo.title)}
                      class="mt-1 w-5 h-5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />

                    <div class="space-y-1.5 flex-1">
                      {/* Title */}
                      <span
                        class={`text-base font-bold block transition-all ${
                          todo.complete
                            ? 'line-through text-gray-400'
                            : 'text-gray-900'
                        }`}
                      >
                        {todo.title}
                      </span>

                      {/* Description */}
                      <Show when={todo.description}>
                        <p class={`text-sm ${todo.complete ? 'text-gray-400' : 'text-gray-600'}`}>
                          {todo.description}
                        </p>
                      </Show>

                      {/* Metadata Badges */}
                      <div class="flex flex-wrap items-center gap-2 pt-1">
                        {/* Ownership Badge */}
                        <Show
                          when={todo.isOwner}
                          fallback={
                            <span class="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                              <span>👥 Shared by</span>
                              <strong>{todo.creatorName}</strong>
                            </span>
                          }
                        >
                          <span class="inline-flex items-center text-[11px] font-medium bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                            👤 Created by you
                          </span>
                        </Show>

                        {/* Shared count indicator */}
                        <Show when={todo.sharedUsers.length > 0}>
                          <span class="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                            🔗 Shared with {todo.sharedUsers.length}{' '}
                            {todo.sharedUsers.length === 1 ? 'person' : 'people'}
                          </span>
                        </Show>

                        {/* Date */}
                        <span class="text-[11px] text-gray-400">
                          {new Date(todo.updatedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Share, Details, Delete */}
                  <div class="flex items-center space-x-1.5 flex-shrink-0">
                    {/* SHARE BUTTON */}
                    <button
                      onClick={() => setSharingTodoId(todo.id)}
                      class="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 transition-colors shadow-sm"
                      title="Share with another user"
                    >
                      <span>🔗</span>
                      <span>Share</span>
                      <Show when={todo.sharedUsers.length > 0}>
                        <span class="ml-1 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px]">
                          {todo.sharedUsers.length}
                        </span>
                      </Show>
                    </button>

                    {/* Details Link */}
                    <A
                      href={`/todos/${todo.id}`}
                      class="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl text-xs font-medium transition-colors"
                      title="View details and edit"
                    >
                      ✏️ Edit
                    </A>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(todo.id, todo.title, todo.isOwner)}
                      class="px-2 py-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors"
                      title={todo.isOwner ? 'Delete todo' : 'Remove from my list'}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            )}
          </For>

          {/* Empty State */}
          <Show when={displayedTodos().length === 0}>
            <div class="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <div class="text-4xl mb-3">📋</div>
              <h3 class="text-base font-bold text-gray-800">No todos found</h3>
              <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {filter() === 'shared'
                  ? 'No todos have been shared with your account yet. Log in as Alice or Bob to share tasks between them!'
                  : filter() === 'completed'
                  ? 'No completed tasks yet. Finish a task above!'
                  : 'Start by creating your first task above.'}
              </p>
            </div>
          </Show>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <Show when={sharingTodoId()}>
        {(todoId) => (
          <ShareModal
            todoId={todoId()}
            onClose={() => setSharingTodoId(null)}
          />
        )}
      </Show>
    </div>
  )
}
