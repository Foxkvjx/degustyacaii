"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, CircleDollarSign, Package, Plus, RefreshCw, ShoppingBag, Target } from "lucide-react";
import MobileNav from "../components/MobileNav";
import { supabase } from "../../lib/supabase";

type Venda = { id: string; produto: string; quantidade: number; valor: number; data: string };
type Produto = { id: string; nome: string; qtd: number; custo: number; unidade: string };
const money = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Dashboard() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [meta, setMeta] = useState(66);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const [sales, stock, config] = await Promise.all([
      supabase.from("vendas").select("id, produto, quantidade, valor, data").order("data", { ascending: false }).limit(500),
      supabase.from("produtos").select("id, nome, qtd, custo, unidade"),
      supabase.from("config").select("meta_diaria").limit(1).maybeSingle(),
    ]);
    if (sales.error || stock.error || config.error) setError(sales.error?.message || stock.error?.message || config.error?.message || "Erro ao carregar dados");
    setVendas((sales.data ?? []) as Venda[]);
    setProdutos((stock.data ?? []) as Produto[]);
    if (config.data?.meta_diaria != null) setMeta(Number(config.data.meta_diaria));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const today = dayKey(new Date());
  const todaySales = useMemo(() => vendas.filter(v => dayKey(new Date(v.data)) === today), [vendas, today]);
  const revenue = useMemo(() => todaySales.reduce((s, v) => s + Number(v.valor), 0), [todaySales]);
  const cups = useMemo(() => todaySales.reduce((s, v) => s + Number(v.quantidade), 0), [todaySales]);
  const ticket = cups ? revenue / cups : 0;
  const acai = produtos.find(p => p.nome.toLowerCase() === "açaí");
  const stockValue = produtos.reduce((s, p) => s + Number(p.qtd) * Number(p.custo), 0);
  const progress = meta ? Math.min(100, cups / meta * 100) : 0;
  const lastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); const key = dayKey(d);
    return { label: i === 6 ? "Hoje" : d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), cups: vendas.filter(v => dayKey(new Date(v.data)) === key).reduce((s, v) => s + Number(v.quantidade), 0) };
  });
  const max = Math.max(1, ...lastDays.map(d => d.cups));

  return (
    <main className="min-h-screen bg-slate-50 pb-24 sm:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-xs font-medium text-slate-500">Degusty Açaí</Link>
            <p className="mt-3 text-sm text-slate-500">Visão geral</p>
            <h1 className="mt-1 text-[32px] font-semibold leading-none tracking-[-0.055em] text-slate-900">Bom dia.</h1>
          </div>
          <button onClick={load} disabled={loading} aria-label="Atualizar dados" className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-none dark:bg-white dark:text-black">
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        {error && <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">{error}</div>}

        <section className="mt-8 rounded-[28px] bg-black p-6 text-white dark:bg-white dark:text-black sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium opacity-60">Faturamento hoje</p>
              <p className="mt-3 text-[42px] font-semibold leading-none tracking-[-0.06em] sm:text-5xl">{loading ? "..." : money(revenue)}</p>
            </div>
            <CircleDollarSign size={25} strokeWidth={1.7} className="opacity-80" />
          </div>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div><p className="text-xs opacity-60">Meta diária</p><p className="mt-1 text-sm font-semibold">{cups} / {meta} copos</p></div>
            <span className="text-xs font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20 dark:bg-black/15"><div className="h-full rounded-full bg-white dark:bg-black" style={{ width: `${progress}%` }} /></div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            ["Copos", loading ? "..." : String(cups), "Hoje", ShoppingBag],
            ["Ticket", loading ? "..." : money(ticket), "Médio", CircleDollarSign],
            ["Açaí", acai ? `${Number(acai.qtd)} ${acai.unidade === "litros" ? "L" : acai.unidade}` : "0 L", "Estoque", Package],
            ["Estoque", loading ? "..." : money(stockValue), "Valor", Target],
          ].map(([label, value, note, Icon]) => {
            const I = Icon as typeof Package;
            return <div key={String(label)} className="rounded-2xl bg-white p-4 dark:bg-[#080808] sm:p-5"><I size={18} strokeWidth={1.7} className="text-slate-500" /><p className="mt-5 text-[11px] font-medium text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">{value}</p><p className="mt-1 text-[11px] text-slate-400">{note}</p></div>;
          })}
        </section>

        <section className="mt-4 rounded-2xl bg-white p-5 dark:bg-[#080808] sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Desempenho</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.035em] text-slate-900 dark:text-white">Vendas recentes</h2></div><Link href="/vendas" className="flex items-center gap-1 text-xs font-semibold text-slate-500">Ver tudo <ChevronRight size={14} /></Link></div>
          <div className="mt-7 flex h-36 items-end gap-2 sm:h-44 sm:gap-3">{lastDays.map((d, i) => <div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="w-full max-w-10 rounded-t-md bg-black dark:bg-white" style={{ height: `${Math.max(5, d.cups / max * 100)}%` }} /><span className="text-[10px] text-slate-400">{d.label}</span></div>)}</div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href="/vendas" className="group rounded-2xl bg-white p-5 dark:bg-[#080808]"><div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Operação</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">Registrar venda</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black"><Plus size={18} /></span></div></Link>
          <Link href="/estoque" className="group rounded-2xl bg-white p-5 dark:bg-[#080808]"><div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Controle</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">Ver estoque</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black"><ArrowUpRight size={18} /></span></div></Link>
        </section>
      </div>
      <MobileNav />
    </main>
  );
}
