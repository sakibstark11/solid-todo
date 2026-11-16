import { createSignal, For, Show, type JSX } from "solid-js";
import { createAsync } from "@solidjs/router";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
} from "@suid/material";
import Search from "@suid/icons-material/Search";
import { searchUsers } from "~/lib/api";
import { createCursorStack } from "~/lib/cursor";
import type { UserResult } from "~/lib/types";
import Pagination from "./Pagination";

export default function UserSearch(props: {
  renderAction?: (user: UserResult) => JSX.Element;
}) {
  const [input, setInput] = createSignal("");
  const [query, setQuery] = createSignal("");
  const [cursor, setCursor] = createSignal<string | null>(null);
  const history = createCursorStack();

  const results = createAsync(() =>
    query() ? searchUsers(query(), cursor()) : Promise.resolve(undefined)
  );

  function submit(event: SubmitEvent) {
    event.preventDefault();
    setQuery(input().trim());
    setCursor(null);
    history.reset();
  }

  return (
    <Box>
      <form onSubmit={submit}>
        <Stack direction="row" spacing={1}>
          <TextField
            label="Search by name"
            value={input()}
            onInput={(event) => setInput((event.target as HTMLInputElement).value)}
            fullWidth
            size="small"
            inputProps={{ maxLength: 100 }}
          />
          <Button type="submit" variant="contained" startIcon={<Search />} disabled={!input().trim()}>
            Search
          </Button>
        </Stack>
      </form>
      <Show when={query()}>
        <Show
          when={results()}
          fallback={
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          }
        >
          {(data) => (
            <Show
              when={data().items.length > 0}
              fallback={<Alert severity="info" sx={{ mt: 2 }}>No users match “{query()}”.</Alert>}
            >
              <List>
                <For each={data().items}>
                  {(user) => (
                    <ListItem divider secondaryAction={props.renderAction?.(user)} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={user.name} secondary={user.email} />
                    </ListItem>
                  )}
                </For>
              </List>
              <Pagination
                data={data()}
                canGoBack={history.canGoBack()}
                onPrev={() => setCursor(history.pop())}
                onNext={(next) => {
                  history.push(cursor());
                  setCursor(next);
                }}
              />
            </Show>
          )}
        </Show>
      </Show>
    </Box>
  );
}