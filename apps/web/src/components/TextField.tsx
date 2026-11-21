import type { JSX } from '@solidjs/web';
import styles from './TextField.module.css';

type Props = {
  id: string;
  label: string;
  value: string;
  onInput: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'search';
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
};

export default function TextField(props: Props) {
  return (
    <label class={styles.field} for={props.id}>
      <span class={styles.label}>{props.label}</span>
      {props.multiline ? (
        <textarea
          id={props.id}
          class={styles.control}
          rows={props.rows ?? 4}
          maxlength={props.maxLength}
          value={props.value}
          placeholder={props.placeholder}
          required={props.required}
          disabled={props.disabled}
          onInput={(event) => props.onInput(event.currentTarget.value)}
        />
      ) : (
        <input
          id={props.id}
          class={styles.control}
          type={props.type ?? 'text'}
          maxlength={props.maxLength}
          value={props.value}
          placeholder={props.placeholder}
          required={props.required}
          disabled={props.disabled}
          onInput={(event) => props.onInput(event.currentTarget.value)}
        />
      )}
    </label>
  );
}
