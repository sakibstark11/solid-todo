import { createSignal, Show } from 'solid-js'
import { A, useNavigate } from '@solidjs/router'
import { store } from '../lib/store'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [errorMessage, setErrorMessage] = createSignal('')

  const handleLogin = (e: SubmitEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const res = store.login(email(), password())
    if (res.success) {
      navigate('/todos')
    } else {
      setErrorMessage(res.error || 'Failed to log in.')
    }
  }

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
    const res = store.login(demoEmail, 'password123')
    if (res.success) {
      navigate('/todos')
    }
  }

  return (
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60">
      <div class="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-500/30 mb-4">
            ✓
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
          <p class="mt-2 text-sm text-gray-600">
            Sign in to access your shared todos and personal tasks
          </p>
        </div>

        {/* Error Alert */}
        <Show when={errorMessage()}>
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div class="flex">
              <div class="flex-shrink-0 text-red-500">⚠</div>
              <div class="ml-3 text-sm text-red-700 font-medium">{errorMessage()}</div>
            </div>
          </div>
        </Show>

        <form class="mt-8 space-y-5" onSubmit={handleLogin}>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              placeholder="you@example.com"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-semibold text-gray-700">Password</label>
              <span class="text-xs text-gray-400">Default: password123</span>
            </div>
            <input
              type="password"
              required
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              placeholder="••••••••"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign In
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div class="pt-4 border-t border-gray-100">
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 text-center mb-3">
            Quick 1-Click Demo Sign In
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('alice@example.com')}
              class="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors border border-blue-100 flex flex-col items-center"
            >
              <span>Alice Johnson</span>
              <span class="text-[10px] text-blue-500 font-normal">alice@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('bob@example.com')}
              class="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors border border-indigo-100 flex flex-col items-center"
            >
              <span>Bob Smith</span>
              <span class="text-[10px] text-indigo-500 font-normal">bob@example.com</span>
            </button>
          </div>
        </div>

        <div class="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <A href="/register" class="font-semibold text-blue-600 hover:text-blue-500 underline">
            Create an account
          </A>
        </div>
      </div>
    </div>
  )
}
