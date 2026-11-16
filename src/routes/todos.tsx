import { createSignal, For, Show } from 'solid-js'
import { A } from '@solidjs/router'

interface TodoItem {
  id: string
  title: string
  description: string
  complete: boolean
  createdAt: Date
}

export default function Todos() {
  const [todos, setTodos] = createSignal<TodoItem[]>([
    {
      id: '1',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      complete: false,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Complete project',
      description: 'Review app structure and fix issues',
      complete: true,
      createdAt: new Date(),
    },
  ])

  const [title, setTitle] = createSignal('')
  const [description, setDescription] = createSignal('')

  const handleCreateTodo = (e: SubmitEvent) => {
    e.preventDefault()
    const trimmedTitle = title().trim()
    if (!trimmedTitle) return

    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        title: trimmedTitle,
        description: description().trim(),
        complete: false,
        createdAt: new Date(),
      },
      ...prev,
    ])

    setTitle('')
    setDescription('')
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, complete: !t.complete } : t))
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-gray-800">My Todos</h1>
          <A href="/" class="text-blue-600 hover:text-blue-800 font-medium text-sm underline">
            &larr; Back to Home
          </A>
        </div>

        <form onSubmit={handleCreateTodo} class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="space-y-4">
            <input
              type="text"
              name="title"
              required
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              placeholder="What needs to be done?"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <textarea
              name="description"
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
              placeholder="Add details (optional)"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              rows={2}
            />
            <button
              type="submit"
              class="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Create Todo
            </button>
          </div>
        </form>

        <For each={todos()}>
          {(todo) => (
            <div class="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500 mb-4 transition-all">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.complete}
                    onChange={() => toggleTodo(todo.id)}
                    class="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <div class="flex-1">
                    <span
                      class={`text-xl font-medium block ${
                        todo.complete ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}
                    >
                      {todo.title}
                    </span>
                    <Show when={todo.description}>
                      <p class="text-gray-600 mt-2 text-sm">{todo.description}</p>
                    </Show>
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  class="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  title="Delete todo"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </For>

        <Show when={todos().length === 0}>
          <div class="bg-white rounded-lg shadow-sm p-8 text-center">
            <p class="text-gray-500">No todos yet. Create one above!</p>
          </div>
        </Show>
      </div>
    </div>
  )
}
