import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  email: z
    .email("Enter a valid email address")
    .max(254, "Email must be 254 characters or fewer")
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const createTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .default(""),
});

export const updateTodoSchema = z
  .object({
    todoId: z.uuid("Invalid todo id"),
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer")
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, "Description must be 2000 characters or fewer")
      .optional(),
    complete: z.boolean().optional(),
  })
  .refine(
    (d) => d.title !== undefined || d.description !== undefined || d.complete !== undefined,
    "Nothing to update"
  );

export const todoIdSchema = z.object({
  todoId: z.uuid("Invalid todo id"),
});

export const shareTodoSchema = z.object({
  todoId: z.uuid("Invalid todo id"),
  userId: z.uuid("Invalid user id"),
  permission: z.enum(["view", "edit"]).default("view"),
});

export const unshareTodoSchema = z.object({
  todoId: z.uuid("Invalid todo id"),
  userId: z.uuid("Invalid user id"),
});

export const searchUsersSchema = z.object({
  q: z.string().trim().min(1, "Enter a name to search").max(100, "Query is too long"),
});

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
