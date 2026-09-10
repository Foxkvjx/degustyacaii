import Link from "next/link";
import MobileNav from "../components/MobileNav";

const cards = [
  ["Faturamento", "R$ 1.428,00", "+12,4%", "text-emerald-600"],
  ["Copos vendidos", "102", "+8 hoje", "text-acai-700"],
  ["Ticket médio", "R$ 14,00", "Meta R$ 14,00", "text-purple-600"],
  ["Estoque", "13,6 L", "~45 copos", "text-amber-600"],
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-50 pb-24 sm:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8 sm:items-center">
          <div><Link href="/" className="text-sm text-acai-700 hover:underline">← Início</Link><h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1><p className="mt-1 text-sm text-slate-500">Visão geral da operação.</p></div>
          <span className="rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">Hoje</span>
        </div>
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {cards.map(([label, value, note, color]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><p className="text-xs text-slate-500 sm:text-sm">{label}</p><p className={`mt-2 text-xl font-bold sm:text-2xl ${color}`}>{value}</p><p className="mt-1 text-[11px] text-slate-400 sm:text-xs">{note}</p></div>)}
        </section>
        <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">Vendas dos últimos dias</h2><span className="text-xs text-slate-400">Copos</span></div><div className="mt-5 flex h-44 items-end gap-2 sm:mt-6 sm:h-48 sm:gap-3">{[38,52,44,67,58,78,102].map((height,i)=><div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-acai-500" style={{height:`${height}%`}}/><span className="text-[10px] text-slate-400 sm:text-xs">{["Seg","Ter","Qua","Qui","Sex","Sáb","Hoje"][i]}</span></div>)}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="font-semibold text-slate-900">Resumo operacional</h2><div className="mt-5 space-y-4 text-sm"><div className="flex justify-between"><span className="text-slate-500">Meta diária</span><b>66 copos</b></div><div className="flex justify-between"><span className="text-slate-500">Realizado</span><b>102 copos</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 w-full rounded-full bg-acai-600"/></div><div className="flex justify-between"><span className="text-slate-500">Ponto de equilíbrio</span><b>23 copos</b></div><div className="rounded-xl bg-purple-50 p-3 text-sm text-purple-800 sm:p-4">A operação está acima da meta projetada.</div></div></section>
        </div>
      </div>
      <MobileNav />
    </main>
  );
}
