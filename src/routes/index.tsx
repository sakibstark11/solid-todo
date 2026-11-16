import { createAsync } from "@solidjs/router";
import { getIndexTarget } from "~/lib/api";

export default function Index() {
  createAsync(() => getIndexTarget(), { deferStream: true });
  return null;
}