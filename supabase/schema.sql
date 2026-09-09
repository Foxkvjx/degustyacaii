-- =====================================================
-- Degusty Açaí - Schema inicial
-- Rode este arquivo no SQL Editor do Supabase
-- =====================================================

-- 1. Parâmetros do negócio (números fixos)
CREATE TABLE IF NOT EXISTS parametros_negocio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Valores iniciais (ajuste conforme o Trello atual)
INSERT INTO parametros_negocio (chave, valor, descricao) VALUES
  ('preco_copo_padrao', '14', 'Preço de venda padrão por copo (R$)'),
  ('meta_copos_dia', '12', 'Meta de copos vendidos por dia'),
  ('ponto_equilibrio_copos', '6', 'Quantidade mínima de copos para cobrir custos do dia'),
  ('custo_ciclo_estoque', '300', 'Custo médio de um ciclo de estoque (R$)'),
  ('dias_ciclo_estoque', '6', 'Duração média de um ciclo de estoque em dias'),
  ('litros_por_ciclo', '20', 'Litros de açaí por ciclo típico')
ON CONFLICT (chave) DO NOTHING;

-- 2. Ciclos de estoque
CREATE TABLE IF NOT EXISTS ciclos_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  litros_comprados NUMERIC(10,2) NOT NULL,
  custo_total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'finalizado')),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Vendas diárias
CREATE TABLE IF NOT EXISTS vendas_diarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  quantidade_copos INTEGER NOT NULL DEFAULT 0,
  preco_unitario NUMERIC(10,2) NOT NULL DEFAULT 14,
  faturamento NUMERIC(10,2) GENERATED ALWAYS AS (quantidade_copos * preco_unitario) STORED,
  ponto_venda TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Gastos
CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  categoria TEXT NOT NULL, -- 'estoque', 'transporte', 'embalagem', 'outros'
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Registro de clima (para correlacionar com vendas)
CREATE TABLE IF NOT EXISTS registros_clima (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  temperatura_max NUMERIC(4,1),
  temperatura_min NUMERIC(4,1),
  condicao TEXT, -- 'sol', 'nublado', 'chuva', 'calor extremo'
  chuva BOOLEAN DEFAULT false,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS básico (permite leitura/escrita com a anon key por enquanto)
ALTER TABLE parametros_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciclos_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_clima ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir tudo para anon (temporário - ajustar depois)" ON parametros_negocio FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para anon (temporário - ajustar depois)" ON ciclos_estoque FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para anon (temporário - ajustar depois)" ON vendas_diarias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para anon (temporário - ajustar depois)" ON gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para anon (temporário - ajustar depois)" ON registros_clima FOR ALL USING (true) WITH CHECK (true);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas_diarias(data DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_data ON gastos(data DESC);
CREATE INDEX IF NOT EXISTS idx_clima_data ON registros_clima(data DESC);
CREATE INDEX IF NOT EXISTS idx_ciclos_status ON ciclos_estoque(status);
