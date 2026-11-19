import { Show } from 'solid-js';
import { clearTokens, user } from '../lib/api';

export default function Home() {
  function logout() {
    clearTokens();
  }

  return (
    <div>
      <Show
        when={user()}
        fallback={
          <div>
            <p>You are not signed in.</p>
            <a href="/login">Sign in</a> or <a href="/register">create an account</a>.
          </div>
        }
      >
        {(u) => (
          <div>
            <p>
              Hello, <strong>{u().name}</strong>.
            </p>
            <button type="button" onClick={logout}>
              Sign out
            </button>
          </div>
        )}
      </Show>
    </div>
  );
}
