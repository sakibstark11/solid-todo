import { createSignal, Show } from "solid-js";
import { Alert, Box, Card, CardContent, Checkbox, IconButton, Stack, Typography } from "@suid/material";
import Delete from "@suid/icons-material/Delete";
import Edit from "@suid/icons-material/Edit";
import Share from "@suid/icons-material/Share";
import { deleteTodo, updateTodo } from "~/lib/api";
import type { TodoItem as TodoItemData } from "~/lib/types";
import TodoForm from "./TodoForm";
import ShareDialog from "./ShareDialog";

export default function TodoItem(props: { todo: TodoItemData }) {
  const [editOpen, setEditOpen] = createSignal(false);
  const [shareOpen, setShareOpen] = createSignal(false);
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const isOwner = () => props.todo.access === "owner";
  const canEdit = () => props.todo.access !== "view";

  async function run(action: (formData: FormData) => Promise<Error | void>, formData: FormData) {
    setBusy(true);
    setError(null);
    const result = await action(formData);
    setBusy(false);
    if (result instanceof Error) setError(result.message);
  }

  function toggleComplete(checked: boolean) {
    const formData = new FormData();
    formData.set("todoId", props.todo.id);
    formData.set("complete", String(checked));
    void run(updateTodo, formData);
  }

  function remove() {
    const formData = new FormData();
    formData.set("todoId", props.todo.id);
    void run(deleteTodo, formData);
  }

  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        <Checkbox
          checked={props.todo.complete}
          disabled={busy() || !canEdit()}
          onChange={(event) => toggleComplete(event.currentTarget.checked)}
          inputProps={{ "aria-label": `Mark "${props.todo.title}" complete` }}
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            sx={{
              textDecoration: props.todo.complete ? "line-through" : "none",
              color: props.todo.complete ? "text.disabled" : "text.primary",
              overflowWrap: "anywhere",
            }}
          >
            {props.todo.title}
          </Typography>
          <Show when={props.todo.description}>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {props.todo.description}
            </Typography>
          </Show>
          <Show when={!isOwner()}>
            <Typography variant="caption" color="text.secondary">
              Shared by {props.todo.ownerName} · {props.todo.access === "edit" ? "can edit" : "view only"}
            </Typography>
          </Show>
          <Show when={error()}>
            <Alert severity="error" sx={{ mt: 1 }}>
              {error()}
            </Alert>
          </Show>
        </Box>
        <Stack direction="row">
          <Show when={isOwner()}>
            <IconButton title="Share" aria-label="Share" onClick={() => setShareOpen(true)}>
              <Share />
            </IconButton>
          </Show>
          <Show when={canEdit()}>
            <IconButton title="Edit" aria-label="Edit" onClick={() => setEditOpen(true)}>
              <Edit />
            </IconButton>
          </Show>
          <Show when={isOwner()}>
            <IconButton title="Delete" aria-label="Delete" color="error" disabled={busy()} onClick={remove}>
              <Delete />
            </IconButton>
          </Show>
        </Stack>
      </CardContent>
      <Show when={editOpen()}>
        <TodoForm open todo={props.todo} onClose={() => setEditOpen(false)} />
      </Show>
      <Show when={shareOpen()}>
        <ShareDialog open todo={props.todo} onClose={() => setShareOpen(false)} />
      </Show>
    </Card>
  );
}