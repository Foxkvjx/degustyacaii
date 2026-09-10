# Degusty Açaí — App de Controle Operacional

App para gestão de estoque, vendas, gastos e clima da **Degusty Açaí**.

**Repositório:** https://github.com/Foxkvjx/degustyacaii  
**Supabase:** projeto `zamcnogwjnxqwylltbuj`

## Stack
- Next.js 15 (App Router)
- Supabase (Postgres + Auth opcional)
- Tailwind CSS
- TypeScript

## Setup rápido

1. Clone o repo
2. `npm install`
3. Copie `.env.example` → `.env.local` e preencha as keys
4. Rode o SQL em `supabase/schema.sql` no SQL Editor do Supabase
5. `npm run dev`

## Módulos
- [x] Estrutura base
- [x] Dashboard
- [x] Estoque / Ciclos de estoque
- [x] Vendas diárias
- [x] Gastos / Situação financeira
- [x] Controle de clima
- [x] Metas e ponto de equilíbrio
- [x] Layout mobile-first
- [x] Navegação inferior para celular
- [x] Integração operacional com Supabase
- [ ] Autenticação

## Interface mobile
As telas operacionais foram adaptadas para uso prioritário em celular, incluindo navegação inferior, áreas de toque maiores, safe area para iPhone e grids responsivos.

## Desenvolvimento
Todas as evoluções devem ser registradas no Notion (Contexto Compartilhado de LLM → página Degusty Açaí) para manter o histórico do projeto entre sessões e assistentes.
