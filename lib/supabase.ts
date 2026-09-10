import { createClient } from "@supabase/supabase-js";

// Keep a browser-safe fallback so the app still works when Vercel env vars
// are missing. The legacy anon key is intentionally public and is protected
// by Supabase RLS.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://zamcnogwjnxqwylltbuj.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbWNub2d3am54cXd5bGx0YnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTk0MTEsImV4cCI6MjA5MDk5NTQxMX0.Z5QfcQ5i6BS1lhmpY5TXwm_HFmITTXDrwhzrnMXP3jw";

async function resilientFetch(input: RequestInfo | URL, init?: RequestInit) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Não foi possível conectar ao Supabase.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: resilientFetch },
});

export type Produto = {
  id: string;
  nome: string | null;
  qtd: number | null;
  custo: number | null;
  min: number | null;
  unidade: string | null;
  updated_at: string | null;
};

export type Venda = {
  id: string;
  produto: string | null;
  quantidade: number | null;
  valor: number | null;
  data: string | null;
  observacao: string | null;
  created_at: string | null;
};

export type Gasto = {
  id: string;
  nome: string | null;
  valor: number | null;
  tipo: string | null;
  data: string | null;
  observacao: string | null;
  created_at: string | null;
};

export type Config = {
  id: string;
  user_name: string | null;
  negocio: string | null;
  margem: number | null;
  preco_copo: number | null;
  meta_diaria: number | null;
  updated_at: string | null;
};

export type RegistroClima = {
  id: string;
  data: string;
  temperatura: number | null;
  condicao: string | null;
  umidade: number | null;
  observacao: string | null;
  created_at: string | null;
};

export type RegistroPonto = {
  id: number;
  data: string;
  custo_total: number | null;
  itens: unknown;
  observacao: string | null;
  created_at: string | null;
};
