import { A } from '@solidjs/router'

export default function NotFound() {
  return (
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div class="max-w-md w-full text-center space-y-4 bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
        <div class="text-6xl font-extrabold text-blue-600">404</div>
        <h1 class="text-2xl font-bold text-gray-900">Page Not Found</h1>
        <p class="text-sm text-gray-500">
          The page you requested does not exist or may have been moved.
        </p>
        <div class="pt-4">
          <A
            href="/todos"
            class="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            Go to Todos
          </A>
        </div>
      </div>
    </div>
  )
}
