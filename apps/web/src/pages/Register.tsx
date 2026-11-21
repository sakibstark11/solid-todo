import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Notice from '../components/Notice';
import Panel from '../components/Panel';
import TextField from '../components/TextField';
import { register } from '../lib/api';
import styles from './AuthPage.module.css';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');

  async function submit(event: Event) {
    event.preventDefault();
    setError('');
    try {
      await register(name(), email(), password());
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <Panel class={styles.panel}>
      <div class={styles.title}>
        <span class={styles.titleIcon}><Icon name="user-plus" size={20} /></span>
        <div>
          <p>Your next step starts here</p>
          <h2>Create account</h2>
        </div>
      </div>
      <Show when={error()}>
        <Notice variant="error">{error()}</Notice>
      </Show>
      <form class={styles.form} onSubmit={submit}>
        <TextField
          id="register-name"
          label="Name"
          value={name()}
          onInput={setName}
          required
        />
        <TextField
          id="register-email"
          label="Email"
          type="email"
          value={email()}
          onInput={setEmail}
          required
        />
        <TextField
          id="register-password"
          label="Password"
          type="password"
          value={password()}
          onInput={setPassword}
          required
        />
        <Button type="submit" class={styles.submit}>
          <Icon name="user-plus" size={16} /> Create account
        </Button>
      </form>
      <p class={styles.footer}>
        Already have an account? <a href="/login">Sign in</a>.
      </p>
    </Panel>
  );
}
