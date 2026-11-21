import { Show } from 'solid-js';
import type { JSX } from '@solidjs/web';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type Props = {
  children: JSX.Element;
  variant?: Variant;
  size?: 'small' | 'medium';
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: JSX.ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  title?: string;
  'aria-label'?: string;
  class?: string;
};

const variantClasses: Record<Variant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  danger: styles.danger,
  ghost: styles.ghost,
};

export default function Button(props: Props) {
  const className = () =>
    [
      styles.button,
      variantClasses[props.variant ?? 'primary'],
      props.size === 'small' ? styles.small : '',
      props.class ?? '',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <Show
      when={props.href}
      fallback={
        <button
          type={props.type ?? 'button'}
          class={className()}
          disabled={props.disabled}
          onClick={props.onClick}
          title={props.title}
          aria-label={props['aria-label']}
        >
          {props.children}
        </button>
      }
    >
      {(href) => (
        <a
          href={href()}
          class={className()}
          aria-label={props['aria-label']}
          aria-disabled={props.disabled ? 'true' : undefined}
        >
          {props.children}
        </a>
      )}
    </Show>
  );
}
