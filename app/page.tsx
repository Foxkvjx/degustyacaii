import Link from "next/link";
import MobileNav from "./components/MobileNav";

const screens = [
  ["/dashboard", "Dashboard", "Visão geral do dia, metas e ponto de equilíbrio", "📊"],
  ["/estoque", "Estoque", "Ciclos de estoque, litros e custos", "📦"],
  ["/vendas", "Vendas", "Registro diário de copos e faturamento", "💰"],
  ["/gastos", "Gastos", "Despesas e situação financeira", "🧾"],
  ["/clima", "Clima", "Condições do dia e relação com vendas", "🌤️"],
  ["/parametros", "Parâmetros", "Números fixos do negócio", "⚙️"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-acai-50 via-white to-purple-50 pb-24 sm:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-acai-700">Degusty Açaí</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">Controle da operação</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Estoque, vendas, gastos e clima em um único painel.</p>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {screens.map(([href, title, description, emoji]) => (
            <Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.98] sm:p-6 sm:hover:-translate-y-0.5 sm:hover:border-acai-300 sm:hover:shadow-md">
              <div className="text-2xl sm:text-3xl">{emoji}</div>
              <h2 className="mt-3 text-base font-semibold text-slate-900 sm:mt-4 sm:text-lg">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">{description}</p>
              <span className="mt-4 block text-xs font-medium text-acai-700 sm:mt-5 sm:text-sm">Abrir tela →</span>
            </Link>
          ))}
        </div>
        <footer className="mt-8 text-xs text-slate-400 sm:mt-12 sm:text-sm">Degusty Açaí · Painel operacional</footer>
      </div>
      <MobileNav />
    </main>
  );
}
