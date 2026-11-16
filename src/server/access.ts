import * as todosRepo from "./repositories/todos";
import * as sharesRepo from "./repositories/shares";
import type { TodoAccess } from "~/lib/types";

export async function getTodoAccess(
  userId: string,
  todoId: string
): Promise<TodoAccess | null> {
  const todo = await todosRepo.findActiveById(todoId);
  if (!todo) return null;
  if (todo.userId === userId) return "owner";
  return sharesRepo.findPermission(todoId, userId);
}