import Link from "next/link";

const items = [
  ["/dashboard", "Início", "⌂"],
  ["/vendas", "Vendas", "＋"],
  ["/estoque", "Estoque", "□"],
  ["/gastos", "Gastos", "−"],
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map(([href, label, icon]) => (
          <Link key={href} href={href} className="flex min-h-14 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-medium text-slate-500 active:bg-slate-100 active:text-acai-700">
            <span className="text-lg leading-5">{icon}</span>
            <span className="mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
