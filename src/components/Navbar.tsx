import { createSignal, Show, For } from 'solid-js'
import { A, useNavigate, useLocation } from '@solidjs/router'
import { store } from '../lib/store'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showSwitchMenu, setShowSwitchMenu] = createSignal(false)

  const handleLogout = () => {
    store.logout()
    navigate('/login')
  }

  const handleQuickSwitch = (userId: string) => {
    store.switchUser(userId)
    setShowSwitchMenu(false)
    if (location.pathname === '/login' || location.pathname === '/register') {
      navigate('/todos')
    }
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

          {/* Right side Auth & Switcher */}
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
                  {/* Account Switcher Dropdown */}
                  <div class="relative">
                    <button
                      onClick={() => setShowSwitchMenu(!showSwitchMenu())}
                      class="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors border border-gray-200"
                      title="Switch demo account"
                    >
                      <span class="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
                      <span class="font-semibold text-gray-900">{user().name}</span>
                      <span class="text-gray-500 hidden md:inline">({user().email})</span>
                      <span class="text-xs text-gray-400">▼</span>
                    </button>

                    <Show when={showSwitchMenu()}>
                      <div
                        class="fixed inset-0 z-10"
                        onClick={() => setShowSwitchMenu(false)}
                      ></div>
                      <div class="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                        <div class="px-4 py-2 border-b border-gray-100">
                          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Current Account
                          </p>
                          <p class="text-sm font-bold text-gray-800">{user().name}</p>
                          <p class="text-xs text-gray-500">{user().email}</p>
                        </div>

                        <div class="px-4 py-2 border-b border-gray-100">
                          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                            Switch Demo Account (Test Sharing)
                          </p>
                          <div class="space-y-1">
                            <For each={store.users()}>
                              {(u) => (
                                <button
                                  onClick={() => handleQuickSwitch(u.id)}
                                  class={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                    u.id === user().id
                                      ? 'bg-blue-50 text-blue-700 font-semibold'
                                      : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <div>
                                    <div class="font-medium">{u.name}</div>
                                    <div class="text-gray-400 text-[11px]">{u.email}</div>
                                  </div>
                                  <Show when={u.id === user().id}>
                                    <span class="text-blue-600 font-bold text-xs">Active</span>
                                  </Show>
                                </button>
                              )}
                            </For>
                          </div>
                        </div>

                        <div class="p-2">
                          <button
                            onClick={() => {
                              store.resetDemoData()
                              setShowSwitchMenu(false)
                              navigate('/todos')
                            }}
                            class="w-full text-left px-3 py-1.5 rounded-lg text-xs text-amber-700 hover:bg-amber-50 font-medium transition-colors"
                          >
                            ↺ Reset Sample Data
                          </button>
                        </div>
                      </div>
                    </Show>
                  </div>

                  {/* Sign Out */}
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
