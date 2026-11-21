import styles from './Avatar.module.css';

type Props = {
  name: string;
  small?: boolean;
};

export default function Avatar(props: Props) {
  const initials = () =>
    props.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toLocaleUpperCase() || '?';

  return (
    <span class={props.small ? styles.small : styles.avatar} aria-hidden="true">
      {initials()}
    </span>
  );
}
