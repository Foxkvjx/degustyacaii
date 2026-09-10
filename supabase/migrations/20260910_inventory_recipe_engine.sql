begin;

alter table public.produtos alter column qtd type numeric(14,3) using qtd::numeric;
alter table public.produtos alter column min type numeric(14,3) using min::numeric;
alter table public.vendas add column if not exists complementos jsonb not null default '[]'::jsonb;
alter table public.vendas add column if not exists estoque_processado boolean not null default false;

create table if not exists public.receitas (
  id uuid primary key default gen_random_uuid(), nome text not null unique,
  tipo text not null check (tipo in ('produto','complemento')), preco numeric(10,2), ativo boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.receita_itens (
  id uuid primary key default gen_random_uuid(), receita_id uuid not null references public.receitas(id) on delete cascade,
  insumo_id uuid not null references public.produtos(id) on delete restrict, quantidade numeric(14,3) not null check (quantidade > 0),
  created_at timestamptz not null default now(), unique(receita_id, insumo_id)
);
create table if not exists public.estoque_movimentacoes (
  id uuid primary key default gen_random_uuid(), produto_id uuid not null references public.produtos(id) on delete restrict,
  quantidade numeric(14,3) not null, tipo text not null check (tipo in ('entrada','consumo','ajuste','reversao')),
  origem text, venda_id uuid references public.vendas(id) on delete set null, observacao text, created_at timestamptz not null default now()
);
create index if not exists idx_receita_itens_receita on public.receita_itens(receita_id);
create index if not exists idx_receita_itens_insumo on public.receita_itens(insumo_id);
create index if not exists idx_estoque_movimentacoes_produto on public.estoque_movimentacoes(produto_id, created_at desc);
create index if not exists idx_estoque_movimentacoes_venda on public.estoque_movimentacoes(venda_id);

alter table public.receitas enable row level security;
alter table public.receita_itens enable row level security;
alter table public.estoque_movimentacoes enable row level security;
grant select, insert, update, delete on public.receitas, public.receita_itens, public.estoque_movimentacoes to anon, authenticated;
drop policy if exists receitas_public_all on public.receitas;
drop policy if exists receita_itens_public_all on public.receita_itens;
drop policy if exists estoque_movimentacoes_public_all on public.estoque_movimentacoes;
create policy receitas_public_all on public.receitas for all to anon, authenticated using (true) with check (true);
create policy receita_itens_public_all on public.receita_itens for all to anon, authenticated using (true) with check (true);
create policy estoque_movimentacoes_public_all on public.estoque_movimentacoes for all to anon, authenticated using (true) with check (true);

update public.produtos set qtd=qtd*1000, unidade='ml', min=min*1000 where lower(nome)='açaí' and unidade='litros';
insert into public.receitas(nome,tipo,preco) values
('Açaí 100ml','produto',5),('Açaí 300ml','produto',13),('Açaí 500ml','produto',18),
('Banana','complemento',null),('Leite condensado','complemento',null),('Leite em pó','complemento',null)
on conflict(nome) do update set tipo=excluded.tipo, preco=excluded.preco, updated_at=now();
with r as(select id from public.receitas where nome='Açaí 100ml'),p as(select id from public.produtos where lower(nome)='açaí') insert into public.receita_itens(receita_id,insumo_id,quantidade) select r.id,p.id,100 from r,p on conflict(receita_id,insumo_id) do update set quantidade=excluded.quantidade;
with r as(select id from public.receitas where nome='Açaí 300ml'),p as(select id from public.produtos where lower(nome)='açaí') insert into public.receita_itens(receita_id,insumo_id,quantidade) select r.id,p.id,300 from r,p on conflict(receita_id,insumo_id) do update set quantidade=excluded.quantidade;
with r as(select id from public.receitas where nome='Açaí 500ml'),p as(select id from public.produtos where lower(nome)='açaí') insert into public.receita_itens(receita_id,insumo_id,quantidade) select r.id,p.id,500 from r,p on conflict(receita_id,insumo_id) do update set quantidade=excluded.quantidade;
insert into public.receita_itens(receita_id,insumo_id,quantidade) select r.id,p.id,1 from public.receitas r cross join public.produtos p where r.tipo='produto' and p.nome in('Copo','Tampa','Colher') on conflict(receita_id,insumo_id) do update set quantidade=excluded.quantidade;
with r as(select id from public.receitas where nome='Banana'),p as(select id from public.produtos where lower(nome)='banana') insert into public.receita_itens(receita_id,insumo_id,quantidade) select r.id,p.id,.5 from r,p on conflict(receita_id,insumo_id) do update set quantidade=excluded.quantidade;
with r as(select id from public.receitas where nome='Leite condensado'),p as(select id from public.produtos where lower(nome)='leite condensado') insert into public.receita_itens(receita_id,insumo_id,quantidade) select r.id,p.id,.05 from r,p on conflict(receita_id,insumo_id) do update set quantidade=excluded.quantidade;
with r as(select id from public.receitas where nome='Leite em pó'),p as(select id from public.produtos where lower(nome)='leite em pó') insert into public.receita_itens(receita_id,insumo_id,quantidade) select r.id,p.id,10 from r,p on conflict(receita_id,insumo_id) do update set quantidade=excluded.quantidade;

create or replace function public.aplicar_consumo_receita(p_venda_id uuid,p_produto text,p_quantidade numeric,p_complementos jsonb,p_sinal numeric,p_origem text)
returns void language plpgsql security invoker set search_path=public as $$
declare item record; comp text; rec_id uuid; total numeric;
begin
 select r.id into rec_id from public.receitas r where r.tipo='produto' and lower(r.nome)=lower(trim(p_produto)) and r.ativo limit 1;
 if rec_id is not null then
  for item in select ri.insumo_id,ri.quantidade,p.nome from public.receita_itens ri join public.produtos p on p.id=ri.insumo_id where ri.receita_id=rec_id loop
   total:=item.quantidade*p_quantidade*p_sinal;
   if p_sinal<0 and (select qtd from public.produtos where id=item.insumo_id)+total < -0.0005 then raise exception 'Estoque insuficiente para %',item.nome; end if;
   update public.produtos set qtd=qtd+total,updated_at=now() where id=item.insumo_id;
   insert into public.estoque_movimentacoes(produto_id,quantidade,tipo,origem,venda_id,observacao) values(item.insumo_id,total,case when p_sinal<0 then 'consumo' else 'reversao' end,p_origem,p_venda_id,'Consumo automático pela venda');
  end loop;
 end if;
 if jsonb_typeof(coalesce(p_complementos,'[]'::jsonb))='array' then
  for comp in select value from jsonb_array_elements_text(coalesce(p_complementos,'[]'::jsonb)) loop
   select r.id into rec_id from public.receitas r where r.tipo='complemento' and lower(r.nome)=lower(trim(comp)) and r.ativo limit 1;
   if rec_id is not null then
    for item in select ri.insumo_id,ri.quantidade,p.nome from public.receita_itens ri join public.produtos p on p.id=ri.insumo_id where ri.receita_id=rec_id loop
     total:=item.quantidade*p_quantidade*p_sinal;
     if p_sinal<0 and (select qtd from public.produtos where id=item.insumo_id)+total < -0.0005 then raise exception 'Estoque insuficiente para %',item.nome; end if;
     update public.produtos set qtd=qtd+total,updated_at=now() where id=item.insumo_id;
     insert into public.estoque_movimentacoes(produto_id,quantidade,tipo,origem,venda_id,observacao) values(item.insumo_id,total,case when p_sinal<0 then 'consumo' else 'reversao' end,p_origem,p_venda_id,'Complemento consumido automaticamente pela venda');
    end loop;
   end if;
  end loop;
 end if;
end; $$;

create or replace function public.processar_venda_estoque()
returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if tg_op='INSERT' then
  perform public.aplicar_consumo_receita(new.id,new.produto,new.quantidade,new.complementos,-1,'venda');
  update public.vendas set estoque_processado=true where id=new.id;
  return new;
 elsif tg_op='UPDATE' then
  if old.estoque_processado then
   perform public.aplicar_consumo_receita(old.id,old.produto,old.quantidade,old.complementos,1,'estorno-venda');
   perform public.aplicar_consumo_receita(new.id,new.produto,new.quantidade,new.complementos,-1,'venda-atualizada');
  end if;
  return new;
 elsif tg_op='DELETE' then
  if old.estoque_processado then perform public.aplicar_consumo_receita(old.id,old.produto,old.quantidade,old.complementos,1,'exclusao-venda'); end if;
  return old;
 end if;
 return coalesce(new,old);
end; $$;
drop trigger if exists trg_processar_venda_estoque on public.vendas;
create trigger trg_processar_venda_estoque after insert on public.vendas for each row execute function public.processar_venda_estoque();
create trigger trg_reprocessar_venda_estoque before update or delete on public.vendas for each row execute function public.processar_venda_estoque();

create or replace function public.registrar_entrada_estoque(p_produto_id uuid,p_quantidade numeric,p_observacao text default null)
returns public.produtos language plpgsql security invoker set search_path=public as $$ declare r public.produtos; begin if p_quantidade<=0 then raise exception 'Quantidade de entrada deve ser maior que zero'; end if; update public.produtos set qtd=qtd+p_quantidade,updated_at=now() where id=p_produto_id returning * into r; if not found then raise exception 'Produto não encontrado'; end if; insert into public.estoque_movimentacoes(produto_id,quantidade,tipo,origem,observacao) values(p_produto_id,p_quantidade,'entrada','compra',p_observacao); return r; end; $$;
grant execute on function public.registrar_entrada_estoque(uuid,numeric,text) to anon,authenticated;
commit;
