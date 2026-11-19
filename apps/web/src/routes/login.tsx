import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { login, setTokens } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');

  async function submit(event: Event) {
    event.preventDefault();
    setError('');
    try {
      const response = await login(email(), password());
      setTokens(response);
      setUser(response.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Sign in</h2>
      <Show when={error()}>
        <p class="error">{error()}</p>
      </Show>
      <label>
        Email
        <input
          type="email"
          value={email()}
          onInput={(event) => setEmail(event.currentTarget.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password()}
          onInput={(event) => setPassword(event.currentTarget.value)}
          required
        />
      </label>
      <button type="submit">Sign in</button>
      <p>
        No account? <a href="/register">Register</a>.
      </p>
    </form>
  );
}
