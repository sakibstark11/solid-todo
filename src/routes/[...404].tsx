import { A } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { Alert, Link } from "@suid/material";

export default function NotFound() {
  return (
    <Alert severity="warning">
      <Title>Not found · Todo App</Title>
      Page not found.{" "}
      <Link component={A} href="/">
        Go to the start page
      </Link>
    </Alert>
  );
}