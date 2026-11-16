"use server";

import { redirect } from "@solidjs/router";
import * as usersRepo from "./repositories/users";
import { getSession, getSessionUser, requireUser } from "./auth";
import { hashPassword, verifyPassword } from "./password";
import {
  DEFAULT_PAGE_SIZE,
  encodeCursor,
  makePage,
  parseNameCursor,
} from "./pagination";
import { invalidate } from "./revalidate";
import {
  firstIssue,
  formValues,
  loginSchema,
  registerSchema,
  safeRedirectPath,
  searchUsersSchema,
} from "./validation";
import type { Page, SessionUser, UserResult } from "~/lib/types";

const PROTECTED_PREFIXES = ["/todos", "/users"];

function isProtected(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

export async function querySession(path: string): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (user && (path === "/login" || path === "/register")) throw redirect("/todos");
  if (!user && isProtected(path)) {
    throw redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }
  return user;
}

export async function indexTarget(): Promise<null> {
  const user = await getSessionUser();
  throw redirect(user ? "/todos" : "/login");
}

export async function register(formData: FormData): Promise<Error | void> {
  const parsed = registerSchema.safeParse(formValues(formData));
  if (!parsed.success) return new Error(firstIssue(parsed.error));
  const { name, email, password } = parsed.data;

  const passwordHash = await hashPassword(password);
  let userId: string;
  try {
    const user = await usersRepo.insert({ name, email, passwordHash });
    userId = user.id;
  } catch (err) {
    const code = err as { code?: string; cause?: { code?: string } };
    if (code.code === "23505" || code.cause?.code === "23505") {
      return new Error("An account with this email already exists");
    }
    throw err;
  }

  const session = await getSession();
  await session.update({ userId });
  throw redirect("/todos", { revalidate: "session" });
}

export async function login(formData: FormData): Promise<Error | void> {
  const parsed = loginSchema.safeParse(formValues(formData));
  if (!parsed.success) return new Error(firstIssue(parsed.error));
  const { email, password, redirectTo } = parsed.data;

  const user = await usersRepo.findByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return new Error("Invalid email or password");
  }

  const session = await getSession();
  await session.update({ userId: user.id });
  throw redirect(safeRedirectPath(redirectTo, "/todos"), { revalidate: "session" });
}

export async function logout(): Promise<void> {
  const session = await getSession();
  await session.clear();
  throw redirect("/login", { revalidate: ["session", "my-todos", "shared-todos"] });
}

export async function searchUsers(q: string, cursor: string | null): Promise<Page<UserResult>> {
  const user = await requireUser();
  const parsed = searchUsersSchema.safeParse({ q });
  if (!parsed.success) throw new Error(firstIssue(parsed.error));

  const pattern = `%${parsed.data.q.replace(/[\\%_]/g, "\\$&")}%`;
  const [rows, total] = await Promise.all([
    usersRepo.searchByName(pattern, user.id, parseNameCursor(cursor), DEFAULT_PAGE_SIZE + 1),
    usersRepo.countSearch(pattern, user.id),
  ]);
  return makePage(rows, DEFAULT_PAGE_SIZE, total, (item) =>
    encodeCursor({ name: item.name, id: item.id })
  );
}