import { Show } from 'solid-js';
import { user } from '../lib/api';
import Login from './Login';
import TodoDashboard from './TodoDashboard';

export default function Home() {
  return (
    <Show
      when={user()}
      fallback={<Login />}
    >
      <TodoDashboard />
    </Show>
  );
}
