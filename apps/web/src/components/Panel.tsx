import type { JSX } from '@solidjs/web';
import styles from './Panel.module.css';

type Props = {
  children: JSX.Element;
  class?: string;
};

export default function Panel(props: Props) {
  return <section class={`${styles.panel} ${props.class ?? ''}`}>{props.children}</section>;
}
