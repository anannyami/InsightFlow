import { useSyncExternalStore } from "react";

type State = { open: boolean; seed: string | null };

let state: State = { open: false, seed: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function openAiChat(seed?: string) {
  state = { open: true, seed: seed ?? null };
  emit();
}
export function closeAiChat() {
  state = { open: false, seed: null };
  emit();
}
export function consumeSeed() {
  const s = state.seed;
  if (s) state = { ...state, seed: null };
  return s;
}

const get = () => state;
export function useAiChatState() {
  return useSyncExternalStore(subscribe, get, get);
}
