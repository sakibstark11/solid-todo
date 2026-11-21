import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Notice from '../components/Notice';
import Panel from '../components/Panel';
import TextField from '../components/TextField';
import { login } from '../lib/api';
import styles from './AuthPage.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');

  async function submit(event: Event) {
    event.preventDefault();
    setError('');
    try {
      await login(email(), password());
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  }

  return (
    <Panel class={styles.panel}>
      <div class={styles.title}>
        <span class={styles.titleIcon}><Icon name="log-in" size={20} /></span>
        <div>
          <p>Welcome back</p>
          <h2>Sign in</h2>
        </div>
      </div>
      <Show when={error()}>
        <Notice variant="error">{error()}</Notice>
      </Show>
      <form class={styles.form} onSubmit={submit}>
        <TextField
          id="login-email"
          label="Email"
          type="email"
          value={email()}
          onInput={setEmail}
          required
        />
        <TextField
          id="login-password"
          label="Password"
          type="password"
          value={password()}
          onInput={setPassword}
          required
        />
        <Button type="submit" class={styles.submit}><Icon name="log-in" size={16} /> Sign in</Button>
      </form>
      <p class={styles.footer}>
        No account? <a href="/register">Register</a>.
      </p>
    </Panel>
  );
}
