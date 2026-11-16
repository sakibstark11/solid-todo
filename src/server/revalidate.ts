import { setResponseHeader } from "@solidjs/start/http";

export function invalidate(...keys: string[]): void {
  setResponseHeader("X-Revalidate", keys.join(","));
}