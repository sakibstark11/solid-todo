import { Loading } from 'solid-js';
import { Router, paths } from './router';
import './App.css';

export default function App() {
  return (
    <Router>
      {(props) => (
        <div class="app">
          <header>
            <h1>
              <a href={paths()}>Todo App</a>
            </h1>
          </header>
          <Loading fallback={<main>Loading…</main>}>
            <main>{props.children}</main>
          </Loading>
        </div>
      )}
    </Router>
  );
}
