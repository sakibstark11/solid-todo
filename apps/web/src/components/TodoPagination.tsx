import Button from './Button';
import Icon from './Icon';
import styles from './TodoPagination.module.css';

type Props = {
  total: number;
  loading: boolean;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  label?: string;
  ariaLabel?: string;
};

export default function TodoPagination(props: Props) {
  return (
    <nav class={styles.pagination} aria-label={props.ariaLabel ?? 'Todo pages'}>
      <small class={styles.count}>{props.total} {props.label ?? 'total'}</small>
      <div class={styles.buttons}>
        <Button
          variant="secondary"
          size="small"
          disabled={!props.canPrevious || props.loading}
          onClick={props.onPrevious}
          aria-label="Previous page"
        >
          <Icon name="arrow-left" size={15} /> Previous
        </Button>
        <Button
          variant="secondary"
          size="small"
          disabled={!props.canNext || props.loading}
          onClick={props.onNext}
          aria-label="Next page"
        >
          Next <Icon name="arrow-right" size={15} />
        </Button>
      </div>
    </nav>
  );
}
