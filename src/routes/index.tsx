import { createSignal, Show } from 'solid-js'
import { A } from '@solidjs/router'

export default function Index() {
  const [user, setUser] = createSignal<{ name: string; email: string } | null>(null)
  const [email, setEmail] = createSignal('')
  const [name, setName] = createSignal('')
  const [password, setPassword] = createSignal('')

  const handleSignUp = (e: SubmitEvent) => {
    e.preventDefault()
    if (!email() || !name()) return
    setUser({ name: name(), email: email() })
  }

  const handleSignOut = (e: SubmitEvent) => {
    e.preventDefault()
    setUser(null)
    setEmail('')
    setName('')
    setPassword('')
  }

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Todo App</h1>
          <p class="text-gray-600 mt-2">Manage and share your tasks easily</p>
        </div>

        <Show
          when={user()}
          fallback={
            <form onSubmit={handleSignUp} class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  placeholder="you@example.com"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={name()}
                  onInput={(e) => setName(e.currentTarget.value)}
                  placeholder="John Doe"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minlength="6"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  placeholder="At least 6 characters"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                class="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Sign Up
              </button>
            </form>
          }
        >
          {(currentUser) => (
            <div>
              <div class="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p class="text-sm text-blue-800 font-medium">Welcome, {currentUser().name}!</p>
                <p class="text-xs text-blue-600">{currentUser().email}</p>
              </div>
              <A
                href="/todos"
                class="block w-full bg-green-600 text-white text-center font-semibold px-4 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 mb-4"
              >
                View Todos
              </A>
              <form onSubmit={handleSignOut} class="flex justify-center">
                <button type="submit" class="text-gray-500 text-sm hover:text-gray-700 underline">
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </Show>
      </div>
    </div>
  )
}
