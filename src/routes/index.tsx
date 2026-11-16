import { Show } from 'solid-js'
import { A } from '@solidjs/router'
import { store } from '../lib/store'

export default function Index() {
  return (
    <div class="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div class="text-center space-y-4 pt-6">
          <div class="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-blue-200 shadow-sm">
            <span>✓</span> Collaborative Todo Application
          </div>
          <h1 class="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Manage Tasks & <span class="text-blue-600">Share with Others</span>
          </h1>
          <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            A task management application featuring user authentication, todo sharing by user email, permissions, and responsive updates.
          </p>

          <div class="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Show
              when={store.currentUser()}
              fallback={
                <>
                  <A
                    href="/login"
                    class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
                  >
                    Sign In to Your Account
                  </A>
                  <A
                    href="/register"
                    class="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-xl border border-gray-200 shadow-sm transition-all hover:scale-[1.02]"
                  >
                    Create Free Account
                  </A>
                </>
              }
            >
              {(user) => (
                <div class="space-y-3">
                  <div class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm">
                    <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span>Signed in as <strong>{user().name}</strong> ({user().email})</span>
                  </div>
                  <div>
                    <A
                      href="/todos"
                      class="inline-block px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
                    >
                      Open Workspace &rarr;
                    </A>
                  </div>
                </div>
              )}
            </Show>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-xl font-bold mb-4">
              🔐
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-1">User Accounts</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              Sign up or log in securely. Each user maintains their own private tasks and shared collaboration views.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center text-xl font-bold mb-4">
              👥
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-1">Task Sharing</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              Share tasks with any registered user by their email address. Manage access or revoke permissions at any time.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-xl font-bold mb-4">
              ⚡
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-1">Fast & Persistent</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              Built on SolidJS fine-grained reactivity. Tasks and collaboration state persist seamlessly.
            </p>
          </div>
        </div>

        {/* How Sharing Works */}
        <div class="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🔗</span> How Task Sharing Works
          </h3>
          <ol class="list-decimal list-inside space-y-2.5 text-sm text-gray-700">
            <li>
              Sign up or log into your account.
            </li>
            <li>
              Create a task in your workspace.
            </li>
            <li>
              Click the <span class="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xs font-semibold">🔗 Share</span> button on the task.
            </li>
            <li>
              Enter the email address of the registered user you want to share with and confirm.
            </li>
            <li>
              The shared user can view, edit, and check off the task from their own workspace.
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
