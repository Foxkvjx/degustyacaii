"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [["/dashboard", "Início", "⌂"], ["/vendas", "Vendas", "＋"], ["/estoque", "Estoque", "□"], ["/receitas", "Receitas", "◈"], ["/calendario", "Agenda", "▣"]];

type MobileNavProps = { persistent?: boolean };

export default function MobileNav({ persistent = false }: MobileNavProps) {
  const pathname = usePathname();
  if (!persistent) return null;
  return <nav aria-label="Navegação principal" className="mobile-app-nav fixed inset-x-0 bottom-0 z-[90] border-t border-slate-200/80 bg-white/90 px-2 pt-2 backdrop-blur-xl dark:border-white/10 dark:bg-black/90 sm:hidden"><div className="mx-auto grid max-w-md grid-cols-5 gap-1 pb-[max(8px,env(safe-area-inset-bottom))]">{items.map(([href, label, icon]) => { const active = pathname === href; return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-semibold transition-all duration-200 ${active ? "bg-black text-white shadow-sm dark:bg-white dark:text-black" : "text-slate-500 active:scale-95 dark:text-slate-400"}`}><span className="text-lg leading-5">{icon}</span><span className="mt-1">{label}</span></Link>; })}</div></nav>;
}
