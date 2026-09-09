import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types baseados no schema previsto
export type ParametroNegocio = {
  id: string;
  chave: string;
  valor: string;
  descricao?: string;
  updated_at: string;
};

export type CicloEstoque = {
  id: string;
  data_inicio: string;
  data_fim?: string;
  litros_comprados: number;
  custo_total: number;
  status: "ativo" | "finalizado";
  observacao?: string;
  created_at: string;
};

export type VendaDiaria = {
  id: string;
  data: string;
  quantidade_copos: number;
  preco_unitario: number;
  faturamento: number;
  ponto_venda?: string;
  observacao?: string;
  created_at: string;
};

export type Gasto = {
  id: string;
  data: string;
  categoria: string;
  descricao: string;
  valor: number;
  created_at: string;
};

export type RegistroClima = {
  id: string;
  data: string;
  temperatura_max?: number;
  temperatura_min?: number;
  condicao?: string;
  chuva: boolean;
  observacao?: string;
  created_at: string;
};
