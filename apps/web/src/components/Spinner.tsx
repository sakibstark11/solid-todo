import styles from './Spinner.module.css';

type Props = {
  label: string;
  small?: boolean;
};

export default function Spinner(props: Props) {
  return (
    <span class={props.small ? styles.spinnerSmall : styles.spinner} role="status">
      <span class={styles.hidden}>{props.label}</span>
    </span>
  );
}
