import { For, Show, createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Notice from '../components/Notice';
import Panel from '../components/Panel';
import SelectField from '../components/SelectField';
import Spinner from '../components/Spinner';
import TextField from '../components/TextField';
import TodoPagination from '../components/TodoPagination';
import {
  createTodo,
  getTodo,
  listShares,
  searchUsers,
  shareTodo,
  unshareTodo,
  updateTodo,
  type Page,
  type Share,
  type Todo as TodoRecord,
  type UserResult,
} from '../lib/api';
import styles from './Todo.module.css';

export default function TodoPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = () => params.id === 'new';
  const [todo, setTodo] = createSignal<TodoRecord>();
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [complete, setComplete] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [loading, setLoading] = createSignal(!isNew());
  const [error, setError] = createSignal('');
  const [shareError, setShareError] = createSignal('');
  const [sharePermission, setSharePermission] = createSignal<'view' | 'edit'>('view');

  const [searchName, setSearchName] = createSignal('');
  const [userPage, setUserPage] = createSignal<Page<UserResult>>();
  const [userCursor, setUserCursor] = createSignal<string | null>(null);
  const [userPreviousCursors, setUserPreviousCursors] = createSignal<(string | null)[]>([]);
  const [searching, setSearching] = createSignal(false);

  const [sharePage, setSharePage] = createSignal<Page<Share>>();
  const [shareCursor, setShareCursor] = createSignal<string | null>(null);
  const [sharePreviousCursors, setSharePreviousCursors] = createSignal<(string | null)[]>([]);
  const [loadingShares, setLoadingShares] = createSignal(false);

  async function loadShares(todoId: string, cursor = shareCursor()) {
    setLoadingShares(true);
    setShareError('');
    try {
      setSharePage(await listShares(todoId, cursor));
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Could not load shares');
    } finally {
      setLoadingShares(false);
    }
  }

  async function loadTodo() {
    if (isNew()) return;
    try {
      const current = await getTodo(params.id);
      setTodo(current);
      setTitle(current.title);
      setDescription(current.description);
      setComplete(current.complete);
      if (current.access === 'owner') {
        await loadShares(current.id, null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load todo');
    } finally {
      setLoading(false);
    }
  }

  void loadTodo();

  const canEdit = () => !todo() || todo()?.access !== 'view';
  const canManageShares = () => todo()?.access === 'owner';
  const isPermission = (value: string): value is Share['permission'] =>
    value === 'view' || value === 'edit';

  async function save(event: Event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isNew()) {
        const created = await createTodo({ title: title(), description: description() });
        setTodo(created);
        navigate(`/todos/${created.id}`, { replace: true });
        return;
      }

      const current = todo();
      if (!current) return;
      const updated = await updateTodo(current.id, {
        title: title(),
        description: description(),
        complete: complete(),
      });
      setTodo(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save todo');
    } finally {
      setSaving(false);
    }
  }

  async function findUsers(event: Event) {
    event.preventDefault();
    const name = searchName().trim();
    setSearching(true);
    setShareError('');
    setUserCursor(null);
    setUserPreviousCursors([]);
    try {
      setUserPage(await searchUsers(name));
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Could not search users');
    } finally {
      setSearching(false);
    }
  }

  async function loadUserPage(cursor: string | null, previous: (string | null)[]) {
    setSearching(true);
    setShareError('');
    try {
      setUserPage(await searchUsers(searchName().trim(), cursor));
      setUserCursor(cursor);
      setUserPreviousCursors(previous);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Could not load users');
    } finally {
      setSearching(false);
    }
  }

  async function addShare(target: UserResult) {
    const current = todo();
    if (!current) return;
    setShareError('');
    try {
      await shareTodo(current.id, target.id, sharePermission());
      await loadShares(current.id, null);
      setShareCursor(null);
      setSharePreviousCursors([]);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Could not share todo');
    }
  }

  async function removeShare(share: Share) {
    const current = todo();
    if (!current) return;
    setShareError('');
    try {
      await unshareTodo(current.id, share.userId);
      await loadShares(current.id);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Could not revoke access');
    }
  }

  async function changePermission(share: Share, permission: Share['permission']) {
    const current = todo();
    if (!current) return;
    setShareError('');
    try {
      await shareTodo(current.id, share.userId, permission);
      await loadShares(current.id);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Could not update access');
    }
  }

  function previousUsers() {
    const cursors = userPreviousCursors();
    if (!cursors.length) return;
    void loadUserPage(cursors[cursors.length - 1] ?? null, cursors.slice(0, -1));
  }

  function nextUsers() {
    const currentPage = userPage();
    if (!currentPage?.nextCursor) return;
    void loadUserPage(currentPage.nextCursor, [...userPreviousCursors(), userCursor()]);
  }

  function previousShares() {
    const cursors = sharePreviousCursors();
    if (!cursors.length) return;
    const previous = cursors[cursors.length - 1] ?? null;
    setSharePreviousCursors(cursors.slice(0, -1));
    setShareCursor(previous);
    const current = todo();
    if (current) void loadShares(current.id, previous);
  }

  function nextShares() {
    const next = sharePage()?.nextCursor;
    const current = todo();
    if (!next || !current) return;
    setSharePreviousCursors((cursors) => [...cursors, shareCursor()]);
    setShareCursor(next);
    void loadShares(current.id, next);
  }

  return (
    <div class={styles.page}>
      <Button href="/" variant="ghost" class={styles.back}>
        <Icon name="arrow-left" size={16} /> Back to todos
      </Button>
      <Show when={loading()}>
        <div class={styles.loading}>
          <Spinner label="Loading todo" />
        </div>
      </Show>
      <Show when={!loading() && !error() && !todo() && !isNew()}>
        <Notice variant="warning">
          <h2 class={styles.noticeTitle}>Todo unavailable</h2>
          <p class={styles.noticeText}>
            This todo may have been deleted or you may not have access to it.
          </p>
        </Notice>
      </Show>
      <Show when={error()}>
        <Notice variant="error">{error()}</Notice>
      </Show>
      <Show when={!loading() && (isNew() || todo())}>
        <Panel class={styles.editor}>
          <div class={styles.heading}>
            <span class={styles.headingIcon}>
              <Icon name={isNew() ? 'plus' : 'edit'} size={22} />
            </span>
            <div>
              <p class={styles.eyebrow}>{isNew() ? 'New task' : 'Todo details'}</p>
              <h2>{isNew() ? 'Add a todo' : 'Edit todo'}</h2>
            </div>
            <Show when={todo()}>
              {(current) => (
                <p class={styles.subheading}>
                  {current().access === 'owner'
                    ? 'Created by you'
                    : `Shared by ${current().ownerName}`}
                </p>
              )}
            </Show>
          </div>

          <form onSubmit={save} class={styles.form}>
            <TextField
              id="todo-title"
              label="Title"
              value={title()}
              onInput={setTitle}
              maxLength={200}
              disabled={!canEdit()}
              required
            />
            <TextField
              id="todo-description"
              label="Description"
              value={description()}
              onInput={setDescription}
              multiline
              rows={5}
              maxLength={2000}
              disabled={!canEdit()}
            />
            <Show when={todo()}>
              <label class={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={complete()}
                  onChange={(event) => setComplete(event.currentTarget.checked)}
                  disabled={!canEdit()}
                />
                <span>Mark as complete</span>
              </label>
            </Show>
            <Show when={canEdit()}>
              <div>
                <Button type="submit" disabled={saving()}>
                  {saving()
                    ? 'Saving…'
                    : isNew()
                      ? <><Icon name="plus" size={16} /> Create todo</>
                      : <><Icon name="check" size={16} /> Save changes</>}
                </Button>
              </div>
            </Show>
            <Show when={!canEdit()}>
              <Notice variant="info">You have view-only access to this todo.</Notice>
            </Show>
          </form>

          <Show when={canManageShares() && todo()}>
            <section class={styles.collaboration}>
              <div class={styles.sectionHeading}>
                <span class={styles.shareIcon}><Icon name="share" size={19} /></span>
                <div>
                  <p class={styles.eyebrow}>Collaboration</p>
                  <h2>Share this todo</h2>
                </div>
                <p>Find people by name, then choose whether they can view or edit.</p>
              </div>

              <form onSubmit={findUsers} class={styles.searchForm}>
                <TextField
                  id="share-search-name"
                  label="Search users"
                  type="search"
                  value={searchName()}
                  onInput={setSearchName}
                  placeholder="Type a name"
                  maxLength={100}
                  required
                />
                <div class={styles.searchControls}>
                  <SelectField
                    id="share-permission"
                    label="Access"
                    value={sharePermission()}
                    onChange={(value) => {
                      if (isPermission(value)) setSharePermission(value);
                    }}
                    options={[
                      { value: 'view', label: 'Can view' },
                      { value: 'edit', label: 'Can edit' },
                    ]}
                  />
                  <Button type="submit" disabled={searching()}>
                    <Icon name="search" size={16} /> {searching() ? 'Searching…' : 'Search'}
                  </Button>
                </div>
              </form>

              <Show when={shareError()}>
                <Notice variant="error">{shareError()}</Notice>
              </Show>
              <Show when={userPage()}>
                {(results) => (
                  <Panel class={styles.subPanel}>
                    <div class={styles.listHeading}>
                      <h3>Search results</h3>
                      <small>{results().total} {results().total === 1 ? 'person' : 'people'}</small>
                    </div>
                    <Show
                      when={results().items.length > 0}
                      fallback={<p class={styles.empty}>No users found. Try another name.</p>}
                    >
                      <div class={styles.userList}>
                        <For each={results().items}>
                          {(result) => (
                            <div class={styles.userRow}>
                              <div class={styles.identity}>
                                <Avatar name={result.name} small />
                                <div class={styles.userDetails}>
                                  <strong>{result.name}</strong>
                                  <small>{result.email}</small>
                                </div>
                              </div>
                              <Button
                                size="small"
                                onClick={() => void addShare(result)}
                              >
                                <Icon name="user-plus" size={15} /> Share
                              </Button>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                    <Show when={!!results().nextCursor || userPreviousCursors().length > 0}>
                      <TodoPagination
                        total={results().total}
                        label="people"
                        ariaLabel="User search pages"
                        loading={searching()}
                        canPrevious={userPreviousCursors().length > 0}
                        canNext={!!results().nextCursor}
                        onPrevious={previousUsers}
                        onNext={nextUsers}
                      />
                    </Show>
                  </Panel>
                )}
              </Show>

              <Panel class={styles.subPanel}>
                <div class={styles.listHeading}>
                  <h3>People with access</h3>
                  <small>{sharePage()?.total ?? 0}</small>
                </div>
                <Show when={loadingShares()}>
                  <div class={styles.loadingSmall}>
                    <Spinner label="Loading access list" small />
                  </div>
                </Show>
                <Show when={!loadingShares() && (sharePage()?.items.length ?? 0) === 0}>
                  <p class={styles.empty}>This todo has not been shared yet.</p>
                </Show>
                <div class={styles.userList}>
                  <For each={sharePage()?.items}>
                    {(share) => (
                      <div class={styles.userRow}>
                        <div class={styles.identity}>
                          <Avatar name={share.name} small />
                          <div class={styles.userDetails}>
                            <strong>{share.name}</strong>
                            <small>{share.email}</small>
                          </div>
                        </div>
                        <div class={styles.shareActions}>
                          <SelectField
                            id={`share-access-${share.userId}`}
                            aria-label={`Access for ${share.name}`}
                            value={share.permission}
                            onChange={(value) => {
                              if (isPermission(value)) void changePermission(share, value);
                            }}
                            options={[
                              { value: 'view', label: 'Can view' },
                              { value: 'edit', label: 'Can edit' },
                            ]}
                          />
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => void removeShare(share)}
                          >
                            <Icon name="trash" size={14} /> Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
                <Show when={!!sharePage()?.nextCursor || sharePreviousCursors().length > 0}>
                  <TodoPagination
                    total={sharePage()?.total ?? 0}
                    label="people"
                    ariaLabel="Shared users pages"
                    loading={loadingShares()}
                    canPrevious={sharePreviousCursors().length > 0}
                    canNext={!!sharePage()?.nextCursor}
                    onPrevious={previousShares}
                    onNext={nextShares}
                  />
                </Show>
              </Panel>
            </section>
          </Show>
        </Panel>
      </Show>
    </div>
  );
}
