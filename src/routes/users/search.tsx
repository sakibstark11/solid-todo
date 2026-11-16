import { type RouteDefinition } from "@solidjs/router";
import { Box, Typography } from "@suid/material";
import { Title } from "@solidjs/meta";
import { querySession } from "~/lib/api";
import UserSearch from "~/components/UserSearch";

export const route = {
  async preload() {
    await querySession("/users/search");
  },
} satisfies RouteDefinition;

export default function UsersSearch() {
  return (
    <Box>
      <Title>Find users · Todo App</Title>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Find users
      </Typography>
      <UserSearch />
    </Box>
  );
}