import { supabase } from "./supabase";

type Action = "insert" | "update" | "delete";
type Pending = {
  id: string;
  table: string;
  action: Action;
  payload?: Record<string, unknown>;
  match?: { column: string; value: string };
  createdAt: number;
};

const KEY = "degusty:persistent-mutation-queue:v1";

function readQueue(): Pending[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") as Pending[]; } catch { return []; }
}
function writeQueue(queue: Pending[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(queue));
}

export function queueMutation(input: Omit<Pending, "id" | "createdAt">) {
  const item: Pending = { ...input, id: crypto.randomUUID(), createdAt: Date.now() };
  const queue = readQueue();
  queue.push(item);
  writeQueue(queue);
  void flushPendingMutations();
  return item;
}

export async function flushPendingMutations() {
  if (typeof window === "undefined" || !navigator.onLine) return;
  const queue = readQueue();
  if (!queue.length) return;

  const remaining: Pending[] = [];
  for (const item of queue) {
    let error: unknown = null;
    try {
      if (item.action === "insert") {
        const result = await supabase.from(item.table).insert(item.payload || {});
        error = result.error;
      } else if (item.action === "update" && item.match) {
        const result = await supabase.from(item.table).update(item.payload || {}).eq(item.match.column, item.match.value);
        error = result.error;
      } else if (item.action === "delete" && item.match) {
        const result = await supabase.from(item.table).delete().eq(item.match.column, item.match.value);
        error = result.error;
      }
    } catch (err) { error = err; }
    if (error) remaining.push(item);
  }
  writeQueue(remaining);
}

export function startMutationSync() {
  if (typeof window === "undefined") return () => {};
  const sync = () => { void flushPendingMutations(); };
  window.addEventListener("online", sync);
  const timer = window.setInterval(sync, 15000);
  sync();
  return () => {
    window.removeEventListener("online", sync);
    window.clearInterval(timer);
  };
}
