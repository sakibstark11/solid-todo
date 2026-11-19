import { Router } from './router';
import { AuthProvider } from './lib/auth';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {(props) => (
          <div class="app">
            <header>
              <h1>Todo App</h1>
            </header>
            <main>{props.children}</main>
          </div>
        )}
      </Router>
    </AuthProvider>
  );
}
