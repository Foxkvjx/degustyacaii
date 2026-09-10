import Link from "next/link";

const screens = [
  ["/dashboard", "Dashboard", "Visão geral do dia, metas e ponto de equilíbrio", "📊"],
  ["/estoque", "Estoque", "Ciclos de estoque, litros e custos", "📦"],
  ["/vendas", "Vendas", "Registro diário de copos e faturamento", "💰"],
  ["/gastos", "Gastos", "Despesas e situação financeira", "🧾"],
  ["/clima", "Clima", "Condições do dia e relação com vendas", "🌤️"],
  ["/parametros", "Parâmetros", "Números fixos do negócio", "⚙️"],
];

export default function Home() {
  return <main className="min-h-screen bg-gradient-to-br from-acai-50 via-white to-purple-50"><div className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><header className="mb-10"><p className="text-sm font-semibold uppercase tracking-wider text-acai-700">Degusty Açaí</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Controle da operação</h1><p className="mt-3 max-w-2xl text-slate-600">Estoque, vendas, gastos e clima em um único painel. A humanidade finalmente organizou o açaí em tabelas.</p></header><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{screens.map(([href, title, description, emoji]) => <Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-acai-300 hover:shadow-md"><div className="text-3xl">{emoji}</div><h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-acai-700">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p><span className="mt-5 block text-sm font-medium text-acai-700">Abrir tela →</span></Link>)}</div><footer className="mt-12 text-sm text-slate-400">Degusty Açaí · Painel operacional</footer></div></main>;
}
