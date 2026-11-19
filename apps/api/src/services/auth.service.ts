import * as usersRepo from '../repositories/users.ts';
import type { SessionUser } from '../lib/types.ts';
import { hashPassword, verifyPassword } from '../lib/password.ts';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.ts';
import { HttpError } from '../lib/errors.ts';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validation/schemas.ts';

export async function register(body: unknown) {
  const { name, email, password } = registerSchema.parse(body);
  const passwordHash = await hashPassword(password);
  let userId: string;
  try {
    const user = await usersRepo.insert({ name, email, passwordHash });
    userId = user.id;
  } catch (err: unknown) {
    const e = err as { code?: string; cause?: { code?: string } };
    if (e.code === '23505' || e.cause?.code === '23505')
      throw new HttpError(409, 'An account with this email already exists');
    throw err;
  }
  const user = { id: userId, name, email };
  return {
    accessToken: signAccessToken({ sub: userId, name, email }),
    refreshToken: signRefreshToken({ sub: userId }),
    user,
  };
}

export async function login(body: unknown) {
  const { email, password } = loginSchema.parse(body);
  const userRow = await usersRepo.findByEmail(email);
  if (!userRow || !(await verifyPassword(password, userRow.passwordHash)))
    throw new HttpError(401, 'Invalid email or password');
  const { id, name } = userRow;
  return {
    accessToken: signAccessToken({ sub: id, name, email }),
    refreshToken: signRefreshToken({ sub: id }),
    user: { id, name, email },
  };
}

export async function refresh(body: unknown) {
  const { refreshToken } = refreshTokenSchema.parse(body);
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, 'Invalid or expired refresh token');
  }
  const user = await usersRepo.findById(payload.sub);
  if (!user) throw new HttpError(401, 'User not found');
  return {
    accessToken: signAccessToken({ sub: user.id, name: user.name, email: user.email }),
    refreshToken: signRefreshToken({ sub: user.id }),
  };
}

export async function me(userId: string): Promise<SessionUser> {
  const user = await usersRepo.findById(userId);
  if (!user) throw new HttpError(401, 'User not found');
  return user;
}
