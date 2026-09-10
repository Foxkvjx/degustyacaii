import Link from "next/link";
import MobileNav from "./components/MobileNav";

const screens = [
  ["/dashboard", "Dashboard", "Visão geral do dia, metas e ponto de equilíbrio", "01"],
  ["/estoque", "Estoque", "Produtos, quantidades e custos", "02"],
  ["/vendas", "Vendas", "Registro diário e faturamento", "03"],
  ["/gastos", "Gastos", "Despesas e resultado operacional", "04"],
  ["/clima", "Clima", "Condições do dia e histórico", "05"],
  ["/calendario", "Calendário", "Dias de trabalho, clima e planejamento de vendas", "06"],
  ["/parametros", "Parâmetros", "Configurações do negócio", "07"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 pb-24 sm:pb-0">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Degusty Açaí</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-5xl">Controle da operação</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Estoque, vendas, gastos, clima e calendário em um único painel.</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {screens.map(([href, title, description, number]) => (
            <Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 active:scale-[0.99] sm:p-6 sm:hover:-translate-y-0.5 sm:hover:shadow-md">
              <div className="flex items-start justify-between gap-4"><span className="text-xs font-medium tabular-nums text-slate-400">{number}</span><span className="text-sm text-slate-400 transition-transform group-hover:translate-x-0.5">↗</span></div>
              <h2 className="mt-8 text-lg font-semibold tracking-[-0.02em] text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-5 text-slate-500">{description}</p>
            </Link>
          ))}
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:mt-14">Degusty Açaí · Painel operacional</footer>
      </div>
      <MobileNav />
    </main>
  );
}
