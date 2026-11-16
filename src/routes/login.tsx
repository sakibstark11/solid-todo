import { Show } from "solid-js";
import { A, useSearchParams, useSubmission } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { Alert, Button, Card, CardContent, Link, Stack, TextField, Typography } from "@suid/material";
import { login } from "~/lib/api";

export default function Login() {
  const [searchParams] = useSearchParams();
  const submission = useSubmission(login);
  const redirectTo = () =>
    typeof searchParams.redirectTo === "string" ? searchParams.redirectTo : "";

  return (
    <Card sx={{ maxWidth: 420, mx: "auto", mt: 4 }}>
      <CardContent>
        <Title>Sign in · Todo App</Title>
        <Typography variant="h5" gutterBottom>
          Sign in
        </Typography>
        <Show when={submission.result instanceof Error}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {(submission.result as Error).message}
          </Alert>
        </Show>
        <form action={login} method="post">
          <input type="hidden" name="redirectTo" value={redirectTo()} />
          <Stack spacing={2}>
            <TextField
              label="Email"
              name="email"
              type="email"
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              required
              fullWidth
              autoComplete="current-password"
            />
            <Button type="submit" variant="contained" disabled={submission.pending}>
              {submission.pending ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          No account yet?{" "}
          <Link component={A} href="/register">
            Sign up
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
}