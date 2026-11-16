export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export type UserResult = {
  id: string;
  name: string;
  email: string;
};

export type TodoAccess = "owner" | "view" | "edit";

export type TodoItem = {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName: string;
  access: TodoAccess;
};

export type ShareItem = {
  id: string;
  userId: string;
  name: string;
  email: string;
  permission: "view" | "edit";
  createdAt: string;
};

export type Page<T> = {
  items: T[];
  total: number;
  pageSize: number;
  nextCursor: string | null;
};