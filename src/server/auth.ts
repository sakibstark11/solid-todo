import { redirect } from "@solidjs/router";
import { useSession } from "@solidjs/start/http";
import * as usersRepo from "./repositories/users";
import type { SessionUser } from "~/lib/types";

type SessionData = { userId?: string };

export async function getSession() {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters");
  }
  return useSession<SessionData>({
    name: "todo_session",
    password,
    cookie: {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    },
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession();
  const userId = session.data.userId;
  if (!userId) return null;
  return usersRepo.findById(userId);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw redirect("/login");
  return user;
}