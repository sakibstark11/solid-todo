import { Show } from 'solid-js'
import { A, useNavigate } from '@solidjs/router'
import { store } from '../lib/store'

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    store.logout()
    navigate('/login')
  }

  return (
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          {/* Brand */}
          <div class="flex items-center space-x-6">
            <A href="/" class="flex items-center space-x-2">
              <span class="bg-blue-600 text-white p-2 rounded-lg font-bold text-lg leading-none shadow">
                ✓
              </span>
              <span class="font-bold text-xl text-gray-900 tracking-tight">
                Solid<span class="text-blue-600">Todo</span>
              </span>
            </A>

            <Show when={store.currentUser()}>
              <nav class="hidden sm:flex space-x-1">
                <A
                  href="/todos"
                  activeClass="bg-blue-50 text-blue-700 font-semibold"
                  inactiveClass="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Todos
                </A>
              </nav>
            </Show>
          </div>

          {/* Right side User Info & Sign In/Out */}
          <div class="flex items-center space-x-3">
            <Show
              when={store.currentUser()}
              fallback={
                <div class="flex items-center space-x-2">
                  <A
                    href="/login"
                    class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Log In
                  </A>
                  <A
                    href="/register"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                  >
                    Sign Up
                  </A>
                </div>
              }
            >
              {(user) => (
                <div class="flex items-center space-x-3">
                  <div class="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-xs sm:text-sm">
                    <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span class="font-semibold text-gray-800">{user().name}</span>
                    <span class="text-gray-500 hidden sm:inline">({user().email})</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    class="text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </Show>
          </div>
        </div>
      </div>
    </header>
  )
}
