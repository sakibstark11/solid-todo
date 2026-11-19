import { createContext, createSignal, Show, useContext, type ParentProps } from 'solid-js';
import type { User } from './api';

const AuthContext = createContext<{
  user: () => User | null;
  setUser: (user: User | null) => void;
}>();

export function AuthProvider(props: ParentProps) {
  const [user, setUser] = createSignal<User | null>(null);

  return <AuthContext value={{ user, setUser }}>{props.children}</AuthContext>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export function Protected(props: ParentProps) {
  const { user } = useAuth();
  return <Show when={user()}>{props.children}</Show>;
}
