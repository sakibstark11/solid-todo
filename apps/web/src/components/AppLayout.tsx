import type { JSX } from '@solidjs/web';
import { Show } from 'solid-js';
import { paths } from '../router';
import { clearTokens, user } from '../lib/api';
import Icon from './Icon';
import Avatar from './Avatar';
import Button from './Button';
import styles from './AppLayout.module.css';

type Props = {
  children: JSX.Element;
};

export default function AppLayout(props: Props) {
  function signOut() {
    clearTokens();
    window.location.assign('/');
  }

  return (
    <div class={styles.shell}>
      <header class={styles.header}>
        <a class={styles.brand} href={paths()}>
          <span class={styles.brandMark}><Icon name="check-circle" size={22} /></span>
          <span class={styles.brandWords}>
            <strong>Todo App</strong>
            <small>Small steps, real momentum</small>
          </span>
        </a>
        <Show when={user()}>
          {(currentUser) => (
            <div class={styles.account}>
              <Avatar name={currentUser().name} small />
              <span class={styles.accountName}>{currentUser().name}</span>
              <Button variant="ghost" size="small" onClick={signOut}>
                <Icon name="log-out" size={16} /> Sign out
              </Button>
            </div>
          )}
        </Show>
      </header>
      {props.children}
    </div>
  );
}
