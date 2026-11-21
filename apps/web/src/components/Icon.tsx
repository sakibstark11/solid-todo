import styles from './Icon.module.css';

export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'check'
  | 'check-circle'
  | 'circle'
  | 'close'
  | 'edit'
  | 'external'
  | 'list'
  | 'log-in'
  | 'log-out'
  | 'plus'
  | 'search'
  | 'share'
  | 'trash'
  | 'user-plus'
  | 'users';

type Props = {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, string> = {
  'arrow-left': 'M19 12H5m7 7-7-7 7-7',
  'arrow-right': 'M5 12h14m-7-7 7 7-7 7',
  check: 'm5 12 4 4L19 6',
  'check-circle': 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-13-1 3 3 5-5',
  circle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
  close: 'M18 6 6 18M6 6l12 12',
  edit: 'M12 20h9m-4.5-15.5a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4 11.5-11.5Z',
  external: 'M14 4h6v6m-11 5L20 4M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  'log-in': 'M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7',
  'log-out': 'M14 7l5 5-5 5m5-5H9m4 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8',
  plus: 'M12 5v14m-7-7h14',
  search: 'm20 20-4.4-4.4M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  share: 'M12 16V4m-5 5 5-5 5 5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5',
  trash: 'M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6',
  'user-plus': 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm11-3v6m-3-3h6',
  users: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 10v-2a4 4 0 0 0-3-3.87m-1-11.13a4 4 0 0 1 0 7.75',
};

export default function Icon(props: Props) {
  return (
    <svg
      class={styles.icon}
      width={props.size ?? 18}
      height={props.size ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={paths[props.name]} />
    </svg>
  );
}
