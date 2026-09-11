"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const ACTIVE_USER_KEY = "degusty:active-user-id";
const CACHE_PREFIX = "degusty:cache:";
const QUEUE_PREFIX = "degusty:persistent-mutation-queue:";

function clearUserScopedStorage() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(CACHE_PREFIX) || key.startsWith(QUEUE_PREFIX))) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
}

function syncActiveUser(userId: string | null) {
  if (typeof window === "undefined") return;
  const previous = localStorage.getItem(ACTIVE_USER_KEY);
  if (previous && previous !== userId) clearUserScopedStorage();
  if (userId) localStorage.setItem(ACTIVE_USER_KEY, userId);
  else localStorage.removeItem(ACTIVE_USER_KEY);
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const apply = (id: string | null) => {
      syncActiveUser(id);
      if (!mounted) return;
      setUserId(id);
      setChecking(false);
      if (!id && pathname !== "/login") router.replace("/login");
      if (id && pathname === "/login") router.replace("/dashboard");
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user.id ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user.id ?? null));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [pathname, router]);

  if (checking) return <main className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500 dark:bg-black dark:text-slate-400">Verificando acesso...</main>;
  if (!userId && pathname !== "/login") return null;
  if (userId && pathname === "/login") return null;
  return <>{children}</>;
}
