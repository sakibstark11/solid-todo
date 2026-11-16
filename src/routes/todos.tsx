import { createSignal, For, Show, Suspense } from "solid-js";
import { createAsync, useSearchParams, type RouteDefinition } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@suid/material";
import Add from "@suid/icons-material/Add";
import { getMyTodos, getSharedTodos, querySession } from "~/lib/api";
import { createCursorStack } from "~/lib/cursor";
import Pagination from "~/components/Pagination";
import TodoForm from "~/components/TodoForm";
import TodoItem from "~/components/TodoItem";

export const route = {
  async preload({ location }) {
    await querySession("/todos");
    const params = new URLSearchParams(location.search);
    const cursor = params.get("cursor");
    return params.get("tab") === "shared" ? getSharedTodos(cursor) : getMyTodos(cursor);
  },
} satisfies RouteDefinition;

export default function Todos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = createSignal(false);
  const history = createCursorStack();

  const tab = () => (searchParams.tab === "shared" ? "shared" : "mine");
  const cursor = () =>
    typeof searchParams.cursor === "string" && searchParams.cursor ? searchParams.cursor : null;
  const data = createAsync(() =>
    tab() === "shared" ? getSharedTodos(cursor()) : getMyTodos(cursor())
  );

  return (
    <Box>
      <Title>Todos · Todo App</Title>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Todos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
          New todo
        </Button>
      </Stack>
      <ToggleButtonGroup
        exclusive
        value={tab()}
        onChange={(_event, value) => {
          if (value) {
            history.reset();
            setSearchParams({ tab: value === "shared" ? "shared" : undefined, cursor: undefined });
          }
        }}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="mine">My todos</ToggleButton>
        <ToggleButton value="shared">Shared with me</ToggleButton>
      </ToggleButtonGroup>
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        }
      >
        <Show when={data()}>
          {(pageData) => (
            <Box>
              <Show
                when={pageData().items.length > 0}
                fallback={
                  <Alert severity="info">
                    {tab() === "shared"
                      ? "No todos are shared with you yet."
                      : "No todos yet. Create your first one."}
                  </Alert>
                }
              >
                <For each={pageData().items}>{(todo) => <TodoItem todo={todo} />}</For>
              </Show>
              <Pagination
                data={pageData()}
                canGoBack={history.canGoBack()}
                onPrev={() => setSearchParams({ cursor: history.pop() ?? undefined })}
                onNext={(next) => {
                  history.push(cursor());
                  setSearchParams({ cursor: next });
                }}
              />
            </Box>
          )}
        </Show>
      </Suspense>
      <Show when={createOpen()}>
        <TodoForm open onClose={() => setCreateOpen(false)} />
      </Show>
    </Box>
  );
}