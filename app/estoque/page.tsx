"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MobileNav from "../components/MobileNav";
import { supabase } from "../../lib/supabase";

type Produto = {
  id: string;
  nome: string;
  qtd: number;
  custo: number;
  min: number;
  unidade: string;
  updated_at: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatQuantity(qtd: number, unidade: string) {
  const unit = unidade === "litros" ? "L" : unidade;
  return `${formatNumber(qtd)} ${unit}`;
}

export default function Estoque() {
  const [items, setItems] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStock() {
    setLoading(true);
    setError(null);

    const { data, error: supabaseError } = await supabase
      .from("produtos")
      .select("id, nome, qtd, custo, min, unidade, updated_at")
      .order("nome", { ascending: true });

    if (supabaseError) {
      setError(`Não foi possível carregar o estoque: ${supabaseError.message}`);
      setItems([]);
    } else {
      setItems((data ?? []) as Produto[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadStock();
  }, []);

  const totalValue = useMemo(
    () => items.reduce((total, item) => total + Number(item.qtd) * Number(item.custo), 0),
    [items]
  );

  const lowStock = useMemo(
    () => items.filter((item) => Number(item.qtd) <= Number(item.min)).length,
    [items]
  );

  const acai = items.find((item) => item.nome.toLowerCase() === "açaí");

  return (
    <main className="min-h-screen bg-slate-50 pb-24 sm:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Link href="/" className="text-sm text-acai-700 hover:underline">← Início</Link>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Estoque</h1>
            <p className="mt-1 text-sm text-slate-500">Dados em tempo real do Supabase.</p>
          </div>
          <button onClick={loadStock} disabled={loading} className="w-full rounded-xl bg-acai-700 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60 sm:w-auto">
            {loading ? "Atualizando..." : "↻ Atualizar estoque"}
          </button>
        </div>

        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs text-slate-500">Estoque de açaí</p>
            <b className="mt-2 block text-xl sm:text-2xl">{loading ? "..." : acai ? formatQuantity(Number(acai.qtd), acai.unidade) : "0 L"}</b>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs text-slate-500">Valor do estoque</p>
            <b className="mt-2 block text-xl sm:text-2xl">{loading ? "..." : formatCurrency(totalValue)}</b>
          </div>
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1 sm:p-5">
            <p className="text-xs text-slate-500">Itens para revisar</p>
            <b className={`mt-2 block text-xl sm:text-2xl ${lowStock > 0 ? "text-amber-600" : "text-emerald-600"}`}>{loading ? "..." : lowStock}</b>
          </div>
        </div>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-6">
          <div className="border-b border-slate-100 px-4 py-4 font-semibold sm:px-5">Itens em estoque</div>
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">Carregando dados do Supabase...</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">Nenhum produto encontrado.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const quantity = Number(item.qtd);
                const minimum = Number(item.min);
                const isLow = quantity <= minimum;
                return (
                  <div key={item.id} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 px-4 py-4 sm:grid-cols-4 sm:items-center sm:px-5">
                    <div>
                      <div className="font-medium text-slate-800">{item.nome}</div>
                      <div className="mt-0.5 text-xs text-slate-400">Mínimo: {formatQuantity(minimum, item.unidade)}</div>
                    </div>
                    <div className="text-right text-sm text-slate-600 sm:text-left">{formatQuantity(quantity, item.unidade)}</div>
                    <div className="text-sm text-slate-600">{formatCurrency(quantity * Number(item.custo))}</div>
                    <div className="col-span-2 text-left sm:col-span-1 sm:text-right">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isLow ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{isLow ? "Baixo" : "Normal"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <MobileNav />
    </main>
  );
}
