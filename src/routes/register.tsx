import { Show } from "solid-js";
import { A, useSubmission } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { Alert, Button, Card, CardContent, Link, Stack, TextField, Typography } from "@suid/material";
import { register } from "~/lib/api";

export default function Register() {
  const submission = useSubmission(register);

  return (
    <Card sx={{ maxWidth: 420, mx: "auto", mt: 4 }}>
      <CardContent>
        <Title>Sign up · Todo App</Title>
        <Typography variant="h5" gutterBottom>
          Sign up
        </Typography>
        <Show when={submission.result instanceof Error}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {(submission.result as Error).message}
          </Alert>
        </Show>
        <form action={register} method="post">
          <Stack spacing={2}>
            <TextField
              label="Name"
              name="name"
              required
              fullWidth
              autoComplete="name"
              inputProps={{ maxLength: 100 }}
            />
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
              autoComplete="new-password"
              helperText="At least 8 characters"
              inputProps={{ minLength: 8, maxLength: 128 }}
            />
            <Button type="submit" variant="contained" disabled={submission.pending}>
              {submission.pending ? "Creating account…" : "Sign up"}
            </Button>
          </Stack>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link component={A} href="/login">
            Sign in
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
}