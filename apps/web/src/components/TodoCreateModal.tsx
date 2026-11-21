import { Show, createSignal } from 'solid-js';
import Button from './Button';
import Icon from './Icon';
import Notice from './Notice';
import Spinner from './Spinner';
import TextField from './TextField';
import { createTodo } from '../lib/api';
import styles from './TodoCreateModal.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export default function TodoCreateModal(props: Props) {
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal('');

  function close() {
    if (saving()) return;
    setError('');
    props.onClose();
  }

  async function submit(event: Event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createTodo({ title: title(), description: description() });
      setTitle('');
      setDescription('');
      props.onClose();
      await props.onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create todo');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Show when={props.open}>
      <div
        class={styles.backdrop}
        role="presentation"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <section
          class={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-todo-title"
        >
          <div class={styles.header}>
            <div class={styles.heading}>
              <span class={styles.headingIcon}><Icon name="plus" size={18} /></span>
              <h2 id="create-todo-title">Add a todo</h2>
            </div>
            <Button variant="ghost" size="small" aria-label="Close dialog" onClick={close}>
              <Icon name="close" size={19} />
            </Button>
          </div>
          <form onSubmit={submit}>
            <div class={styles.body}>
              <Show when={error()}>
                <Notice variant="error">{error()}</Notice>
              </Show>
              <TextField
                id="new-todo-title"
                label="Title"
                value={title()}
                onInput={setTitle}
                maxLength={200}
                required
              />
              <TextField
                id="new-todo-description"
                label="Description"
                value={description()}
                onInput={setDescription}
                multiline
                rows={4}
                maxLength={2000}
              />
            </div>
            <div class={styles.footer}>
              <Button variant="secondary" disabled={saving()} onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving()}>
                {saving()
                  ? <><Spinner label="Creating todo" small /> Creating…</>
                  : <><Icon name="plus" size={16} /> Create todo</>}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </Show>
  );
}
