import type { JSX } from '@solidjs/web';
import styles from './Notice.module.css';

type Props = {
  children: JSX.Element;
  variant?: 'error' | 'info' | 'warning' | 'success';
};

export default function Notice(props: Props) {
  return (
    <div class={`${styles.notice} ${styles[props.variant ?? 'info']}`} role="alert">
      {props.children}
    </div>
  );
}
