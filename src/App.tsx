import { Router, Route } from '@solidjs/router'
import IndexRoute from './routes/index'
import TodosRoute from './routes/todos'

export default function App() {
  return (
    <Router>
      <Route path="/" component={IndexRoute} />
      <Route path="/todos" component={TodosRoute} />
    </Router>
  )
}
