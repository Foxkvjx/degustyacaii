import { createClient } from "@supabase/supabase-js";

// Public Supabase configuration. The fallback prevents Vercel prerendering
// from failing when NEXT_PUBLIC_* variables are not configured yet.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zamcnogwjnxqwylltbuj.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_yjv-2lhYKHsBb_mx5Hh3GA_v0wxyS4U";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Produto = { id:string; nome:string|null; qtd:number|null; custo:number|null; min:number|null; unidade:string|null; updated_at:string|null };
export type Venda = { id:string; produto:string|null; quantidade:number|null; valor:number|null; data:string|null; observacao:string|null; created_at:string|null };
export type Gasto = { id:string; nome:string|null; valor:number|null; tipo:string|null; data:string|null; observacao:string|null; created_at:string|null };
export type Config = { id:string; user_name:string|null; negocio:string|null; margem:number|null; preco_copo:number|null; meta_diaria:number|null; updated_at:string|null };
export type RegistroClima = { id:string; data:string; temperatura:number|null; condicao:string|null; umidade:number|null; observacao:string|null; created_at:string|null };
export type RegistroPonto = { id:number; data:string; custo_total:number|null; itens:unknown; observacao:string|null; created_at:string|null };
