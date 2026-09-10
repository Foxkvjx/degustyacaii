"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      router.replace(data.session ? "/dashboard" : "/login");
    });
  }, [router]);
  return <main className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500 dark:bg-black dark:text-slate-400">Finalizando acesso...</main>;
}
