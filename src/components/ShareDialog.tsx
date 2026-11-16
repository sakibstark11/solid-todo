import { createSignal, For, Show } from "solid-js";
import { createAsync } from "@solidjs/router";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@suid/material";
import Close from "@suid/icons-material/Close";
import { getShares, shareTodo, unshareTodo } from "~/lib/api";
import { createCursorStack } from "~/lib/cursor";
import type { ShareItem, TodoItem, UserResult } from "~/lib/types";
import Pagination from "./Pagination";
import UserSearch from "./UserSearch";

type Feedback = { severity: "success" | "error"; text: string };

function ShareAction(props: {
  user: UserResult;
  todoId: string;
  onFeedback: (feedback: Feedback) => void;
}) {
  const [permission, setPermission] = createSignal<"view" | "edit">("view");
  const [busy, setBusy] = createSignal(false);

  async function share() {
    setBusy(true);
    const formData = new FormData();
    formData.set("todoId", props.todoId);
    formData.set("userId", props.user.id);
    formData.set("permission", permission());
    const result = await shareTodo(formData);
    setBusy(false);
    props.onFeedback(
      result instanceof Error
        ? { severity: "error", text: result.message }
        : { severity: "success", text: `Shared with ${props.user.name}.` }
    );
  }

  return (
    <Stack direction="row" spacing={1}>
      <Select
        size="small"
        value={permission()}
        onChange={(event) => setPermission(event.target.value as "view" | "edit")}
      >
        <MenuItem value="view">Can view</MenuItem>
        <MenuItem value="edit">Can edit</MenuItem>
      </Select>
      <Button size="small" variant="contained" disabled={busy()} onClick={share}>
        Share
      </Button>
    </Stack>
  );
}

export default function ShareDialog(props: {
  open: boolean;
  todo: TodoItem;
  onClose: () => void;
}) {
  const [feedback, setFeedback] = createSignal<Feedback | null>(null);
  const [sharesCursor, setSharesCursor] = createSignal<string | null>(null);
  const sharesHistory = createCursorStack();
  const shares = createAsync(() => getShares(props.todo.id, sharesCursor(), 5));

  async function revoke(share: ShareItem) {
    const formData = new FormData();
    formData.set("todoId", props.todo.id);
    formData.set("userId", share.userId);
    const result = await unshareTodo(formData);
    setFeedback(
      result instanceof Error
        ? { severity: "error", text: result.message }
        : { severity: "success", text: `Revoked access for ${share.name}.` }
    );
  }

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle>Share “{props.todo.title}”</DialogTitle>
      <DialogContent>
        <Show when={feedback()}>
          {(fb) => (
            <Alert severity={fb().severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
              {fb().text}
            </Alert>
          )}
        </Show>
        <Typography variant="subtitle2" gutterBottom>
          Find a user by name
        </Typography>
        <UserSearch
          renderAction={(user) => (
            <ShareAction user={user} todoId={props.todo.id} onFeedback={setFeedback} />
          )}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>
          People with access
        </Typography>
        <Show
          when={shares()}
          fallback={
            <Stack sx={{ alignItems: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Stack>
          }
        >
          {(data) => (
            <Show
              when={data().items.length > 0}
              fallback={
                <Typography variant="body2" color="text.secondary">
                  Not shared with anyone yet.
                </Typography>
              }
            >
              <List dense>
                <For each={data().items}>
                  {(share) => (
                    <ListItem
                      divider
                      sx={{ px: 0 }}
                      secondaryAction={
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Chip
                            size="small"
                            label={share.permission === "edit" ? "can edit" : "view only"}
                          />
                          <IconButton
                            size="small"
                            title="Revoke access"
                            aria-label={`Revoke access for ${share.name}`}
                            onClick={() => revoke(share)}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <ListItemText primary={share.name} secondary={share.email} />
                    </ListItem>
                  )}
                </For>
              </List>
              <Pagination
                data={data()}
                canGoBack={sharesHistory.canGoBack()}
                onPrev={() => setSharesCursor(sharesHistory.pop())}
                onNext={(next) => {
                  sharesHistory.push(sharesCursor());
                  setSharesCursor(next);
                }}
              />
            </Show>
          )}
        </Show>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}