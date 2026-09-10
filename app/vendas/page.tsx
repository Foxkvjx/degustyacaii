"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MobileNav from "../components/MobileNav";
import { supabase } from "../../lib/supabase";

type Venda = { id: string; produto: string; quantidade: number; valor: number; data: string; observacao?: string | null };
const money = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
const dayKey = (date: Date) => { const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, "0"); const d = String(date.getDate()).padStart(2, "0"); return `${y}-${m}-${d}`; };

export default function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  async function loadSales() { setLoading(true); setError(null); const { data, error } = await supabase.from("vendas").select("id, produto, quantidade, valor, data, observacao").order("data", { ascending: false }).limit(100); if (error) { setError(`Não foi possível carregar as vendas: ${error.message}`); setVendas([]); } else setVendas((data ?? []) as Venda[]); setLoading(false); }
  useEffect(() => { loadSales(); }, []);
  const today = dayKey(new Date());
  const todaySales = useMemo(() => vendas.filter(v => dayKey(new Date(v.data)) === today), [vendas, today]);
  const todayRevenue = useMemo(() => todaySales.reduce((s, v) => s + Number(v.valor), 0), [todaySales]);
  const todayCups = useMemo(() => todaySales.reduce((s, v) => s + Number(v.quantidade), 0), [todaySales]);
  const ticket = todayCups ? todayRevenue / todayCups : 0;
  return <main className="min-h-screen bg-slate-50 pb-24 sm:pb-0"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"><Link href="/" className="text-sm text-acai-700 hover:underline">← Início</Link><div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Vendas</h1><p className="mt-1 text-sm text-slate-500">Dados reais armazenados no Supabase.</p></div><button onClick={loadSales} disabled={loading} className="w-full rounded-xl bg-acai-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto">{loading ? "Atualizando..." : "↻ Atualizar vendas"}</button></div>{error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:grid-cols-3 sm:gap-4"><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><p className="text-xs text-slate-500">Hoje</p><b className="mt-2 block text-xl sm:text-2xl">{loading ? "..." : money(todayRevenue)}</b></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><p className="text-xs text-slate-500">Copos hoje</p><b className="mt-2 block text-xl sm:text-2xl">{loading ? "..." : todayCups}</b></div><div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1 sm:p-5"><p className="text-xs text-slate-500">Ticket médio</p><b className="mt-2 block text-xl sm:text-2xl">{loading ? "..." : money(ticket)}</b></div></div><section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-6"><div className="grid grid-cols-4 border-b border-slate-100 px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:px-5 sm:text-xs"><span>Data</span><span>Produto</span><span>Copos</span><span>Faturamento</span></div>{loading ? <div className="p-8 text-center text-sm text-slate-500">Carregando...</div> : vendas.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">Nenhuma venda registrada.</div> : vendas.map(v => <div key={v.id} className="grid grid-cols-4 border-b border-slate-100 px-4 py-4 text-sm last:border-0 sm:px-5"><span className="font-medium">{new Date(v.data).toLocaleDateString("pt-BR")}</span><span>{v.produto}</span><span>{v.quantidade}</span><span className="font-semibold text-emerald-600">{money(Number(v.valor))}</span></div>)}</section></div><MobileNav /></main>;
}
