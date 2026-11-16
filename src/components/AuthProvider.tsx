import { createAsync, useLocation } from "@solidjs/router";
import { createContext, useContext, type ParentProps } from "solid-js";
import { querySession } from "~/lib/api";
import type { SessionUser } from "~/lib/types";

type AuthContextValue = {
  user: () => SessionUser | null | undefined;
};

const AuthContext = createContext<AuthContextValue>();

export default function AuthProvider(props: ParentProps) {
  const location = useLocation();
  const user = createAsync(() => querySession(location.pathname), { deferStream: true });
  return <AuthContext.Provider value={{ user }}>{props.children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}