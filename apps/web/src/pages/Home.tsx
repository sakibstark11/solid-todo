import { Show } from 'solid-js';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Panel from '../components/Panel';
import { user } from '../lib/api';
import TodoDashboard from './TodoDashboard';
import styles from './Home.module.css';

export default function Home() {
  return (
    <Show
      when={user()}
      fallback={
        <Panel class={styles.welcome}>
          <div class={styles.welcomeMark}><Icon name="check-circle" size={25} /></div>
          <p class={styles.eyebrow}>A little more organized</p>
          <h2>Make room for what matters.</h2>
          <p class={styles.description}>
            Keep your tasks together, and share the ones you want to tackle with others.
          </p>
          <div class={styles.actions}>
            <Button href="/login"><Icon name="log-in" /> Sign in</Button>
            <Button href="/register" variant="secondary"><Icon name="user-plus" /> Create an account</Button>
          </div>
        </Panel>
      }
    >
      <TodoDashboard />
    </Show>
  );
}
