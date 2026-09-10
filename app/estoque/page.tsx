import Link from "next/link";

const items = [
  ["Açaí", "13,6 L", "R$ 156,40", "Normal"],
  ["Leite em pó", "1,8 kg", "R$ 42,00", "Normal"],
  ["Leite condensado", "6 un.", "R$ 39,00", "Baixo"],
  ["Banana", "3 kg", "R$ 18,00", "Normal"],
  ["Sucrilhos", "2 kg", "R$ 28,00", "Normal"],
];

export default function Estoque() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/" className="text-sm text-acai-700 hover:underline">← Início</Link>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><h1 className="text-3xl font-bold text-slate-900">Estoque</h1><p className="mt-1 text-slate-500">Acompanhe quantidade, custo e necessidade de reposição.</p></div>
          <button className="rounded-xl bg-acai-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">+ Registrar entrada</button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200"><p className="text-sm text-slate-500">Estoque de açaí</p><b className="mt-2 block text-2xl">13,6 L</b></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200"><p className="text-sm text-slate-500">Valor estimado</p><b className="mt-2 block text-2xl">R$ 283,40</b></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200"><p className="text-sm text-slate-500">Itens para revisar</p><b className="mt-2 block text-2xl text-amber-600">1</b></div>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 font-semibold">Itens em estoque</div>
          <div className="divide-y divide-slate-100">
            {items.map(([name, qty, cost, status]) => <div key={name} className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4 sm:items-center"><div className="font-medium text-slate-800">{name}</div><div className="text-sm text-slate-500">{qty}</div><div className="text-sm text-slate-600">{cost}</div><div className="text-left sm:text-right"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "Baixo" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{status}</span></div></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
