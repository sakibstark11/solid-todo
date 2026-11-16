import { action, query } from "@solidjs/router";
import * as users from "~/server/users";
import * as todos from "~/server/todos";
import * as shares from "~/server/shares";

export const querySession = query(users.querySession, "session");
export const getIndexTarget = query(users.indexTarget, "index-target");
export const searchUsers = query(users.searchUsers, "user-search");
export const getMyTodos = query(todos.listMyTodos, "my-todos");
export const getSharedTodos = query(todos.listSharedTodos, "shared-todos");
export const getShares = query(shares.listShares, "shares");

export const register = action(users.register, "register");
export const login = action(users.login, "login");
export const logout = action(users.logout, "logout");
export const createTodo = action(todos.createTodo, "create-todo");
export const updateTodo = action(todos.updateTodo, "update-todo");
export const deleteTodo = action(todos.deleteTodo, "delete-todo");
export const shareTodo = action(shares.shareTodo, "share-todo");
export const unshareTodo = action(shares.unshareTodo, "unshare-todo");