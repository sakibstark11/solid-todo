import { Show, For } from 'solid-js'

export default function Todos() {
  const [todos] = createSignal([])

  return (
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">My Todos</h1>

        <form method="post" action="/api/todos" class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="space-y-4">
            <input type="text" name="title" required placeholder="What needs to be done?" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            <textarea name="description" placeholder="Add details (optional)" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none" rows={2} />
            <button type="submit" class="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">Create Todo</button>
          </div>
        </form>

        <For each={todos}>
          {(todo) => (
            <div class="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500 mb-4">
              <div class="flex items-start gap-3">
                <input type="checkbox" checked={todo.complete} on:change={(e) => { todo.complete = e.value }} class="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500" />
                <div class="flex-1">
                  <span class={todo.complete ? 'line-through text-gray-400' : ''} class="text-xl font-medium">{todo.title}</span>
                  {todo.description && (
                    <p class="text-gray-600 mt-2">{todo.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </For>

        <Show when={todos.length === 0}>
          <p class="text-center text-gray-500">No todos yet. Create one above!</p>
        </Show>
      </div>
    </div>
  )
}
