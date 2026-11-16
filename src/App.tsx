import { Router, A } from '@solidjs/router'
import Home from './routes/index'
import Todos from './routes/todos'
import UsersSearch from './routes/users/search'

export default function App() {
  return (
    <Router fallback={<div>Loading...</div>} root={false}>
      <Home />
      <Todos path="/todos" />
      <UsersSearch path="/search" />
      <A href="/" class="text-blue-600 hover:underline">← Back to home</A>
    </Router>
  )
}
