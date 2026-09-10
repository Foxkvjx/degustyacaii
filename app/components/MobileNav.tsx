"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/dashboard", "Início", "⌂"],
  ["/vendas", "Vendas", "＋"],
  ["/estoque", "Estoque", "□"],
  ["/gastos", "Gastos", "−"],
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur dark:border-[#1a1a1a] dark:bg-black/95 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map(([href, label, icon]) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-medium transition-colors ${
                active
                  ? "bg-white text-slate-900 dark:bg-white dark:text-black"
                  : "text-slate-500 dark:text-slate-500"
              }`}
            >
              <span className="text-lg leading-5">{icon}</span>
              <span className="mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
