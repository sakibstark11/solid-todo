import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@suid/material";
import Logout from "@suid/icons-material/Logout";
import { useAuth } from "./AuthProvider";
import { logout } from "~/lib/api";

export default function NavBar() {
  const { user } = useAuth();
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography
          variant="h6"
          component={A}
          href="/"
          sx={{ color: "inherit", textDecoration: "none", mr: 2 }}
        >
          Todo
        </Typography>
        <Show when={user()}>
          <Button color="inherit" component={A} href="/todos">
            Todos
          </Button>
          <Button color="inherit" component={A} href="/users/search">
            Users
          </Button>
        </Show>
        <Box sx={{ flexGrow: 1 }} />
        <Show
          when={user()}
          fallback={
            <Stack direction="row" spacing={1}>
              <Button color="inherit" component={A} href="/login">
                Sign in
              </Button>
              <Button color="inherit" variant="outlined" component={A} href="/register">
                Sign up
              </Button>
            </Stack>
          }
        >
          {(u) => (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="body2">{u().name}</Typography>
              <form action={logout} method="post">
                <Button color="inherit" type="submit" startIcon={<Logout />}>
                  Sign out
                </Button>
              </form>
            </Stack>
          )}
        </Show>
      </Toolbar>
    </AppBar>
  );
}