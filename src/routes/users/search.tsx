import { Show } from 'solid-js'

export default function UsersSearch(props: { searchParams?: { q?: string } }) {
  const [users, setUsers] = createSignal([])
  const [query] = createSignal(props.searchParams?.q || '')
  const [error, setError] = createSignal(null)

  async function handleSearch(event: Event) {
    event.preventDefault()
    
    if (!query()) {
      setUsers([])
      return
    }

    try {
      const res = await fetch('/api/users/search?q=' + encodeURIComponent(query()), {
        headers: { 'Accept': 'application/json' },
      })
      
      if (res.status === 401) {
        setError('Please log in first')
        setUsers([])
        return
      }

      const data = await res.json()
      setUsers(data || [])
      setError(null)
    } catch (e) {
      console.error('Search failed:', e)
      setError('Search failed. Please try again.')
    }
  }

  return (
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Search Users</h1>

        <form onsubmit={handleSearch} class="mb-8">
          <input 
            type="text" 
            value={query()} 
            oninput={(e) => { query(e.currentTarget.value as string) }} 
            placeholder="Search by name or email..." 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </form>

        <Show when={error()}>
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error()}
          </div>
        </Show>

        <Show when={query() && users().length > 0}>
          <div class="space-y-2">
            <For each={users}>
              {(user) => (
                <div class="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                  <p class="font-semibold text-gray-800">{user.name}</p>
                  <p class="text-sm text-gray-600">{user.email}</p>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Show when={query() && users().length === 0}>
          <p class="text-center text-gray-500">No matching users found.</p>
        </Show>
      </div>
    </div>
  )
}
