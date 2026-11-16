import { createSignal, Show } from 'solid-js'
import { A, useNavigate, Navigate } from '@solidjs/router'
import { store } from '../lib/store'

export default function Register() {
  if (store.currentUser()) {
    return <Navigate href="/todos" />
  }

  const navigate = useNavigate()
  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [errorMessage, setErrorMessage] = createSignal('')

  const handleRegister = (e: SubmitEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const res = store.register(name(), email(), password())
    if (res.success) {
      navigate('/todos')
    } else {
      setErrorMessage(res.error || 'Failed to create account.')
    }
  }

  return (
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60">
      <div class="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-500/30 mb-4">
            ✓
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Create an Account</h2>
          <p class="mt-2 text-sm text-gray-600">
            Sign up to start creating and sharing your tasks
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

        <form class="mt-8 space-y-5" onSubmit={handleRegister}>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              placeholder="Your Name"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              placeholder="name@domain.com"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minlength="6"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              placeholder="At least 6 characters"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Create Account
          </button>
        </form>

        <div class="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          Already have an account?{' '}
          <A href="/login" class="font-semibold text-blue-600 hover:text-blue-500 underline">
            Sign in
          </A>
        </div>
      </div>
    </div>
  )
}
