import { createSignal } from "solid-js";

export function createCursorStack() {
  const [stack, setStack] = createSignal<string[]>([]);
  return {
    canGoBack: () => stack().length > 0,
    push(current: string | null) {
      setStack((s) => [...s, current ?? ""]);
    },
    pop(): string | null {
      const s = stack();
      if (s.length === 0) return null;
      setStack(s.slice(0, -1));
      const last = s[s.length - 1];
      return last === "" ? null : last;
    },
    reset() {
      setStack([]);
    },
  };
}