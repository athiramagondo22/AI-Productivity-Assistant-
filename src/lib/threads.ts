import type { UIMessage } from "ai";
import { useSyncExternalStore } from "react";

export type Thread = { id: string; title: string; updatedAt: number; messages: UIMessage[] };

const KEY = "wpa-chat-threads";
const listeners = new Set<() => void>();
let cache: Thread[] | null = null;
const EMPTY: Thread[] = [];

function read(): Thread[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    cache = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Thread[];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: Thread[]) {
  cache = [...next].sort((a, b) => b.updatedAt - a.updatedAt);
  window.localStorage.setItem(KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

export function getThreads() {
  return read();
}

export function getThread(id: string) {
  return read().find((t) => t.id === id);
}

export function createThread(): Thread {
  const t: Thread = { id: crypto.randomUUID().slice(0, 8), title: "New conversation", updatedAt: Date.now(), messages: [] };
  write([t, ...read()]);
  return t;
}

/** Returns the most recent empty thread or creates one — idempotent across StrictMode double-runs. */
export function getOrCreateLatestThread(): Thread {
  const existing = read()[0];
  return existing ?? createThread();
}

export function ensureThread(id: string) {
  if (!getThread(id)) {
    write([{ id, title: "New conversation", updatedAt: Date.now(), messages: [] }, ...read()]);
  }
}

export function saveMessages(id: string, messages: UIMessage[]) {
  const threads = read();
  const t = threads.find((x) => x.id === id);
  const firstUser = messages.find((m) => m.role === "user");
  const firstText = firstUser?.parts.find((p) => p.type === "text");
  const title =
    t && t.title !== "New conversation"
      ? t.title
      : firstText && "text" in firstText
        ? firstText.text.slice(0, 48)
        : "New conversation";
  const updated: Thread = { id, title, updatedAt: Date.now(), messages };
  write([updated, ...threads.filter((x) => x.id !== id)]);
}

export function deleteThread(id: string) {
  write(read().filter((t) => t.id !== id));
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useThreads() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
