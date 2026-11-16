import { createEffect, Show } from "solid-js";
import { useSubmission } from "@solidjs/router";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@suid/material";
import { createTodo, updateTodo } from "~/lib/api";
import type { TodoItem } from "~/lib/types";

export default function TodoForm(props: {
  open: boolean;
  onClose: () => void;
  todo?: TodoItem;
}) {
  const action = props.todo ? updateTodo : createTodo;
  const submission = useSubmission(action);

  createEffect(() => {
    if (submission.input && !submission.pending && !(submission.result instanceof Error)) {
      submission.clear();
      props.onClose();
    }
  });

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle>{props.todo ? "Edit todo" : "New todo"}</DialogTitle>
      <form action={action} method="post">
        <DialogContent>
          <Show when={submission.result instanceof Error}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {(submission.result as Error).message}
            </Alert>
          </Show>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Show when={props.todo}>
              {(todo) => <input type="hidden" name="todoId" value={todo().id} />}
            </Show>
            <TextField
              label="Title"
              name="title"
              required
              fullWidth
              autoFocus
              defaultValue={props.todo?.title ?? ""}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              label="Description"
              name="description"
              multiline
              rows={3}
              fullWidth
              defaultValue={props.todo?.description ?? ""}
              inputProps={{ maxLength: 2000 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submission.pending}>
            {submission.pending ? "Saving…" : props.todo ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}