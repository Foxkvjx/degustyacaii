"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Edit3, Eraser, RefreshCw, Trash2, X } from "lucide-react";
import MobileNav from "../components/MobileNav";
import { supabase } from "../../lib/supabase";

type Venda = {
  id: string;
  produto: string;
  quantidade: number;
  valor: number;
  data: string;
  observacao?: string | null;
};

const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const dayKey = (value: Date | string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

const todayKey = () => dayKey(new Date());

const dayBounds = (key: string) => {
  const start = new Date(`${key}T00:00:00-03:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
};

export default function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ produto: "", quantidade: "", valor: "", observacao: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ produto: "", quantidade: "", valor: "", observacao: "" });

  async function loadSales() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("vendas")
      .select("id,produto,quantidade,valor,data,observacao")
      .order("data", { ascending: false })
      .limit(500);

    if (error) {
      setError(error.message);
      setVendas([]);
    } else {
      setVendas((data ?? []) as Venda[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSales();
  }, []);

  async function addSale(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const quantidade = Number(form.quantidade);
    const valor = Number(form.valor);

    if (!form.produto.trim() || quantidade <= 0 || valor < 0) {
      setError("Preencha produto, quantidade e valor corretamente.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("vendas").insert({
      produto: form.produto.trim(),
      quantidade,
      valor,
      data: new Date().toISOString(),
      observacao: form.observacao.trim() || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setForm({ produto: "", quantidade: "", valor: "", observacao: "" });
      await loadSales();
    }
    setSaving(false);
  }

  function startEdit(v: Venda) {
    setEditing(v.id);
    setEditForm({
      produto: v.produto,
      quantidade: String(v.quantidade),
      valor: String(v.valor),
      observacao: v.observacao ?? "",
    });
    setError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setEditForm({ produto: "", quantidade: "", valor: "", observacao: "" });
  }

  async function saveEdit(id: string) {
    const quantidade = Number(editForm.quantidade);
    const valor = Number(editForm.valor);

    if (!editForm.produto.trim() || quantidade <= 0 || valor < 0) {
      setError("Preencha produto, quantidade e valor corretamente.");
      return;
    }

    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("vendas")
      .update({
        produto: editForm.produto.trim(),
        quantidade,
        valor,
        observacao: editForm.observacao.trim() || null,
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      cancelEdit();
      await loadSales();
    }
    setSaving(false);
  }

  async function deleteSale(v: Venda) {
    if (!window.confirm(`Excluir a venda de ${v.quantidade} unidade(s) de ${v.produto}?`)) return;

    setError(null);
    const { error } = await supabase.from("vendas").delete().eq("id", v.id);
    if (error) setError(error.message);
    else await loadSales();
  }

  async function clearToday() {
    const today = todayKey();
    const todayCount = vendas.filter((v) => dayKey(v.data) === today).length;

    if (todayCount === 0) {
      setError("Não há vendas registradas hoje para limpar.");
      return;
    }

    if (
      !window.confirm(
        `Isso vai excluir TODAS as ${todayCount} venda(s) de hoje. As vendas de outros dias serão mantidas. Continuar?`,
      )
    ) return;

    setSaving(true);
    setError(null);
    const { start, end } = dayBounds(today);
    const { error } = await supabase.from("vendas").delete().gte("data", start).lt("data", end);

    if (error) setError(error.message);
    else await loadSales();
    setSaving(false);
  }

  const today = todayKey();
  const todaySales = useMemo(
    () => vendas.filter((v) => dayKey(v.data) === today),
    [vendas, today],
  );
  const revenue = useMemo(
    () => todaySales.reduce((sum, v) => sum + Number(v.valor), 0),
    [todaySales],
  );
  const cups = useMemo(
    () => todaySales.reduce((sum, v) => sum + Number(v.quantidade), 0),
    [todaySales],
  );
  const ticket = cups ? revenue / cups : 0;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 sm:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
        <Link href="/" className="text-xs font-medium text-slate-500 hover:text-slate-900">
          ← Início
        </Link>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">Vendas</h1>
            <p className="mt-1 text-sm text-slate-500">Registro diário e faturamento.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
            <button
              onClick={loadSales}
              disabled={loading || saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
            <button
              onClick={clearToday}
              disabled={loading || saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 dark:bg-white/10 dark:text-white disabled:opacity-60"
            >
              <Eraser size={15} />
              Limpar hoje
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-white/10 dark:text-white">
            {error}
          </div>
        )}

        <form onSubmit={addSale} className="mt-6 rounded-2xl bg-white p-5 shadow-none dark:bg-[#080808] sm:p-6">
          <h2 className="font-semibold tracking-[-0.02em]">Registrar venda</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <input required value={form.produto} onChange={(e) => setForm({ ...form, produto: e.target.value })} placeholder="Produto" className="border px-3 py-3 text-sm" />
            <input required type="number" min="1" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} placeholder="Quantidade" className="border px-3 py-3 text-sm" />
            <input required type="number" min="0" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="Valor total (R$)" className="border px-3 py-3 text-sm" />
            <button disabled={saving} className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black disabled:opacity-60">
              {saving ? "Salvando..." : "Salvar venda"}
            </button>
          </div>
          <input value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Observação (opcional)" className="mt-3 w-full border px-3 py-3 text-sm" />
        </form>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl bg-white p-4 shadow-none dark:bg-[#080808]">
            <p className="text-xs font-medium text-slate-500">Hoje</p>
            <b className="mt-2 block text-xl tracking-[-0.03em]">{loading ? "..." : money(revenue)}</b>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-none dark:bg-[#080808]">
            <p className="text-xs font-medium text-slate-500">Copos hoje</p>
            <b className="mt-2 block text-xl tracking-[-0.03em]">{loading ? "..." : cups}</b>
          </div>
          <div className="col-span-2 rounded-2xl bg-white p-4 shadow-none dark:bg-[#080808] sm:col-span-1">
            <p className="text-xs font-medium text-slate-500">Ticket médio</p>
            <b className="mt-2 block text-xl tracking-[-0.03em]">{loading ? "..." : money(ticket)}</b>
          </div>
        </div>

        <section className="mt-5 rounded-2xl bg-white shadow-none dark:bg-[#080808] sm:mt-6">
          <div className="hidden grid-cols-[1fr_1.2fr_.6fr_1fr_auto] gap-2 px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:grid">
            <span>Data</span><span>Produto</span><span>Qtd.</span><span>Faturamento</span><span>Ações</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Carregando...</div>
          ) : vendas.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">Nenhuma venda registrada.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/10">
              {vendas.map((v) =>
                editing === v.id ? (
                  <div key={v.id} className="bg-slate-50 px-5 py-5 dark:bg-white/[.04]">
                    <div className="grid gap-3 sm:grid-cols-4">
                      <input value={editForm.produto} onChange={(e) => setEditForm({ ...editForm, produto: e.target.value })} className="border px-3 py-3 text-sm" placeholder="Produto" />
                      <input type="number" min="1" value={editForm.quantidade} onChange={(e) => setEditForm({ ...editForm, quantidade: e.target.value })} className="border px-3 py-3 text-sm" placeholder="Quantidade" />
                      <input type="number" min="0" step="0.01" value={editForm.valor} onChange={(e) => setEditForm({ ...editForm, valor: e.target.value })} className="border px-3 py-3 text-sm" placeholder="Valor total" />
                      <input value={editForm.observacao} onChange={(e) => setEditForm({ ...editForm, observacao: e.target.value })} placeholder="Observação" className="border px-3 py-3 text-sm" />
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button onClick={() => saveEdit(v.id)} disabled={saving} className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-semibold text-white dark:bg-white dark:text-black disabled:opacity-60">
                        <Check size={14} /> Salvar alterações
                      </button>
                      <button onClick={cancelEdit} disabled={saving} className="flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-xs font-semibold text-slate-900 dark:bg-white/10 dark:text-white disabled:opacity-60">
                        <X size={14} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <article key={v.id} className="px-5 py-4 sm:grid sm:grid-cols-[1fr_1.2fr_.6fr_1fr_auto] sm:items-center sm:gap-2">
                    <div className="flex items-start justify-between gap-3 sm:contents">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:hidden">{new Date(v.data).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>
                        <p className="mt-1 font-medium sm:mt-0">{v.produto}</p>
                      </div>
                      <p className="font-semibold sm:order-none">{money(Number(v.valor))}</p>
                    </div>
                    <span className="hidden sm:block">{v.produto}</span>
                    <span className="mt-2 block text-sm text-slate-500 sm:mt-0 sm:text-current">{v.quantidade} unidade(s)</span>
                    <span className="hidden sm:block font-semibold">{money(Number(v.valor))}</span>
                    <div className="mt-3 flex gap-2 sm:mt-0">
                      <button onClick={() => startEdit(v)} className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 dark:bg-white/10 dark:text-white sm:flex-none" aria-label={`Editar venda de ${v.produto}`}>
                        <Edit3 size={15} /> Editar
                      </button>
                      <button onClick={() => deleteSale(v)} className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 dark:bg-white/10 dark:text-white sm:flex-none" aria-label={`Excluir venda de ${v.produto}`}>
                        <Trash2 size={15} /> Excluir
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </div>
      <MobileNav />
    </main>
  );
}
