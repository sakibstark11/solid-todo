import { Router, Route } from '@solidjs/router'
import Navbar from './components/Navbar'
import Index from './routes/index'
import Login from './routes/login'
import Register from './routes/register'
import Todos from './routes/todos'
import TodoDetail from './routes/todo-detail'
import NotFound from './routes/404'

export default function App() {
  return (
    <Router
      root={(props) => (
        <div class="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900">
          <Navbar />
          <main class="flex-1">{props.children}</main>
        </div>
      )}
    >
      <Route path="/" component={Index} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/todos" component={Todos} />
      <Route path="/todos/:id" component={TodoDetail} />
      <Route path="*404" component={NotFound} />
    </Router>
  )
}
