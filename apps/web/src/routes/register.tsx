import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { register, setTokens } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');

  async function submit(event: Event) {
    event.preventDefault();
    setError('');
    try {
      const response = await register(name(), email(), password());
      setTokens(response);
      setUser(response.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Create account</h2>
      <Show when={error()}>
        <p class="error">{error()}</p>
      </Show>
      <label>
        Name
        <input
          type="text"
          value={name()}
          onInput={(event) => setName(event.currentTarget.value)}
          required
        />
      </label>
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
      <button type="submit">Create account</button>
      <p>
        Already have an account? <a href="/login">Sign in</a>.
      </p>
    </form>
  );
}
