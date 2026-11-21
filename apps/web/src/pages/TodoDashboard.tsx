import { For, Show, createSignal, onSettled } from 'solid-js';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Notice from '../components/Notice';
import Spinner from '../components/Spinner';
import {
  deleteTodo,
  listTodos,
  updateTodo,
  type Page,
  type Todo,
} from '../lib/api';
import TodoCard from '../components/TodoCard';
import TodoCreateModal from '../components/TodoCreateModal';
import TodoPagination from '../components/TodoPagination';
import styles from './TodoDashboard.module.css';

export default function TodoDashboard() {
  const [tab, setTab] = createSignal<'mine' | 'shared'>('mine');
  const [page, setPage] = createSignal<Page<Todo>>();
  const [cursor, setCursor] = createSignal<string | null>(null);
  const [previousCursors, setPreviousCursors] = createSignal<(string | null)[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [createOpen, setCreateOpen] = createSignal(false);
  const [pendingTodoIds, setPendingTodoIds] = createSignal<string[]>([]);

  function updateTodoInPage(id: string, update: (todo: Todo) => Todo) {
    setPage((current) =>
      current
        ? {
            ...current,
            items: current.items.map((todo) => (todo.id === id ? update(todo) : todo)),
          }
        : current
    );
  }

  async function load(nextTab = tab(), nextCursor = cursor()) {
    setLoading(true);
    setError('');
    try {
      const result = await listTodos(nextTab, nextCursor);
      setPage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load todos');
    } finally {
      setLoading(false);
    }
  }

  onSettled(() => {
    void load('mine', null);
  });

  function changeTab(nextTab: 'mine' | 'shared') {
    setTab(nextTab);
    setCursor(null);
    setPreviousCursors([]);
    void load(nextTab, null);
  }

  function nextPage() {
    const currentPage = page();
    if (!currentPage?.nextCursor) return;
    const next = currentPage.nextCursor;
    setPreviousCursors((cursors) => [...cursors, cursor()]);
    setCursor(next);
    void load(tab(), next);
  }

  function previousPage() {
    const cursors = previousCursors();
    if (cursors.length === 0) return;
    const previous = cursors[cursors.length - 1] ?? null;
    setPreviousCursors(cursors.slice(0, -1));
    setCursor(previous);
    void load(tab(), previous);
  }

  async function refreshMine() {
    setTab('mine');
    setCursor(null);
    setPreviousCursors([]);
    await load('mine', null);
  }

  async function toggleComplete(todo: Todo) {
    if (pendingTodoIds().includes(todo.id)) return;
    setError('');
    setPendingTodoIds((ids) => [...ids, todo.id]);
    updateTodoInPage(todo.id, (current) => ({ ...current, complete: !todo.complete }));
    try {
      const updated = await updateTodo(todo.id, { complete: !todo.complete });
      updateTodoInPage(todo.id, () => updated);
    } catch (err) {
      updateTodoInPage(todo.id, (current) => ({ ...current, complete: todo.complete }));
      setError(err instanceof Error ? err.message : 'Could not update todo');
    } finally {
      setPendingTodoIds((ids) => ids.filter((id) => id !== todo.id));
    }
  }

  async function removeTodo(todo: Todo) {
    if (pendingTodoIds().includes(todo.id)) return;
    setError('');
    const requestTab = tab();
    const requestCursor = cursor();
    const originalPage = page();
    const originalIndex = originalPage?.items.findIndex((item) => item.id === todo.id) ?? -1;
    setPendingTodoIds((ids) => [...ids, todo.id]);
    setPage((current) =>
      current
        ? {
            ...current,
            total: Math.max(0, current.total - 1),
            items: current.items.filter((item) => item.id !== todo.id),
          }
        : current
    );
    try {
      await deleteTodo(todo.id);
      if (
        tab() === requestTab &&
        cursor() === requestCursor &&
        page()?.items.length === 0 &&
        previousCursors().length > 0
      ) {
        previousPage();
      }
    } catch (err) {
      if (tab() === requestTab && cursor() === requestCursor && originalIndex >= 0) {
        setPage((current) => {
          if (!current || current.items.some((item) => item.id === todo.id)) return current;
          const items = current.items.reduce<Todo[]>((restored, item, index) => {
            if (index === originalIndex) restored.push(todo);
            restored.push(item);
            return restored;
          }, []);
          if (originalIndex >= current.items.length) items.push(todo);
          return { ...current, total: current.total + 1, items };
        });
      }
      setError(err instanceof Error ? err.message : 'Could not delete todo');
    } finally {
      setPendingTodoIds((ids) => ids.filter((id) => id !== todo.id));
    }
  }

  return (
    <>
      <section class={styles.dashboard}>
        <div class={styles.heading}>
          <div class={styles.titleGroup}>
            <span class={styles.headingIcon}><Icon name="list" size={22} /></span>
            <div>
              <p class={styles.eyebrow}>A little progress adds up</p>
              <h2>Your todos</h2>
            </div>
          </div>
          <div class={styles.headingActions}>
            <Button onClick={() => setCreateOpen(true)}>
              <Icon name="plus" size={17} /> New todo
            </Button>
          </div>
        </div>

        <div class={styles.tabs} role="group" aria-label="Todo lists">
          <Button
            variant={tab() === 'mine' ? 'primary' : 'secondary'}
            onClick={() => changeTab('mine')}
          >
            <Icon name="list" size={16} /> My todos
          </Button>
          <Button
            variant={tab() === 'shared' ? 'primary' : 'secondary'}
            onClick={() => changeTab('shared')}
          >
            <Icon name="users" size={17} /> Shared with me
          </Button>
        </div>

        <Show when={error()}>
          <Notice variant="error">{error()}</Notice>
        </Show>
        <Show when={loading()}>
          <div class={styles.loading}>
            <Spinner label="Loading todos" />
          </div>
        </Show>
        <Show when={!loading() && (page()?.items.length ?? 0) === 0}>
          <div class={styles.empty}>
            <span class={styles.emptyIcon}>
              <Icon name={tab() === 'mine' ? 'check-circle' : 'users'} size={25} />
            </span>
            <h3>{tab() === 'mine' ? 'Nothing on your list yet' : 'No shared todos yet'}</h3>
            <p>
              {tab() === 'mine'
                ? 'Add a todo to get started.'
                : 'When someone shares a todo with you, it will appear here.'}
            </p>
          </div>
        </Show>

        <div class={styles.grid}>
          <For each={page()?.items}>
            {(todo) => (
              <TodoCard
                todo={todo}
                pending={pendingTodoIds().includes(todo.id)}
                onComplete={toggleComplete}
                onDelete={removeTodo}
              />
            )}
          </For>
        </div>

        <Show when={!!page()?.nextCursor || previousCursors().length > 0}>
          <TodoPagination
            total={page()?.total ?? 0}
            loading={loading()}
            canPrevious={previousCursors().length > 0}
            canNext={!!page()?.nextCursor}
            onPrevious={previousPage}
            onNext={nextPage}
          />
        </Show>
      </section>

      <TodoCreateModal
        open={createOpen()}
        onClose={() => setCreateOpen(false)}
        onCreated={refreshMine}
      />
    </>
  );
}
