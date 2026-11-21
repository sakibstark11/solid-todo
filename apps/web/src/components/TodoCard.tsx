import { Show } from 'solid-js';
import Button from './Button';
import Icon from './Icon';
import type { Todo } from '../lib/api';
import styles from './TodoCard.module.css';

type Props = {
  todo: Todo;
  pending: boolean;
  onComplete: (todo: Todo) => void | Promise<void>;
  onDelete: (todo: Todo) => void | Promise<void>;
};

export default function TodoCard(props: Props) {
  const todo = () => props.todo;
  const accessClass = () => {
    if (todo().access === 'owner') return styles.owner;
    if (todo().access === 'edit') return styles.editor;
    return styles.viewer;
  };

  return (
    <article class={styles.card}>
      <div class={styles.cardTop}>
        <Button
          variant={todo().complete ? 'primary' : 'secondary'}
          size="small"
          aria-label={todo().complete ? `Mark ${todo().title} incomplete` : `Complete ${todo().title}`}
          title={todo().complete ? 'Mark incomplete' : 'Mark complete'}
          disabled={todo().access === 'view' || props.pending}
          onClick={() => props.onComplete(todo())}
        >
          <Icon name={todo().complete ? 'check' : 'circle'} size={15} />
          {todo().complete ? 'Done' : 'Complete'}
        </Button>
        <div class={styles.actions}>
          <Button href={`/todos/${todo().id}`} variant="secondary" size="small">
            Open <Icon name="external" size={14} />
          </Button>
          <Show when={todo().access === 'owner'}>
            <Button
              variant="danger"
              size="small"
              disabled={props.pending}
              onClick={() => props.onDelete(todo())}
            >
              <Icon name="trash" size={14} /> Delete
            </Button>
          </Show>
        </div>
      </div>
      <div class={styles.details}>
        <a class={styles.title} href={`/todos/${todo().id}`}>
          {todo().title}
        </a>
        <Show when={todo().description}>
          <p class={styles.description}>{todo().description}</p>
        </Show>
      </div>
      <div class={styles.meta}>
        <small>
          {todo().access === 'owner' ? 'You own this' : `Shared by ${todo().ownerName}`}
        </small>
        <span class={`${styles.badge} ${accessClass()}`}>{todo().access}</span>
      </div>
    </article>
  );
}
