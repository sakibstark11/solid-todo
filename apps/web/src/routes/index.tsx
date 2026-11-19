import { Show } from 'solid-js';
import { useAuth } from '../lib/auth';
import { clearTokens } from '../lib/api';

export default function Home() {
  const { user, setUser } = useAuth();

  function logout() {
    clearTokens();
    setUser(null);
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
