import { Loading } from 'solid-js';
import { Router } from './router';
import AppLayout from './components/AppLayout';

export default function App() {
  return (
    <AppLayout>
      <Router>
        {(props) => (
          <Loading fallback={<main>Loading…</main>}>
            <main>{props.children}</main>
          </Loading>
        )}
      </Router>
    </AppLayout>
  );
}
