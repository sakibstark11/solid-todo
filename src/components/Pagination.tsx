import { Show } from "solid-js";
import { Button, Stack, Typography } from "@suid/material";
import NavigateBefore from "@suid/icons-material/NavigateBefore";
import NavigateNext from "@suid/icons-material/NavigateNext";
import type { Page } from "~/lib/types";

export default function Pagination(props: {
  data: Page<unknown>;
  canGoBack: boolean;
  onPrev: () => void;
  onNext: (cursor: string) => void;
}) {
  return (
    <Show when={props.data.total > 0}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "center", mt: 2, flexWrap: "wrap" }}
      >
        <Typography variant="body2" color="text.secondary">
          {props.data.total} {props.data.total === 1 ? "result" : "results"}
        </Typography>
        <Button
          size="small"
          startIcon={<NavigateBefore />}
          disabled={!props.canGoBack}
          onClick={props.onPrev}
        >
          Previous
        </Button>
        <Button
          size="small"
          endIcon={<NavigateNext />}
          disabled={!props.data.nextCursor}
          onClick={() => {
            const cursor = props.data.nextCursor;
            if (cursor) props.onNext(cursor);
          }}
        >
          Next
        </Button>
      </Stack>
    </Show>
  );
}