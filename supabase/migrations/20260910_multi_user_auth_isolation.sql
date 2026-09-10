begin;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, avatar_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.profiles enable row level security;
drop policy if exists profiles_owner on public.profiles;
create policy profiles_owner on public.profiles for all to authenticated using (id=auth.uid()) with check (id=auth.uid());
grant select, insert, update on public.profiles to authenticated;

alter table public.produtos add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.gastos add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.vendas add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.receitas add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.receita_itens add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.estoque_movimentacoes add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.work_calendar_events add column if not exists user_id uuid references auth.users(id) on delete cascade;

create or replace function public.set_record_owner() returns trigger language plpgsql security definer set search_path=public as $$ begin if new.user_id is null then new.user_id:=auth.uid(); end if; if new.user_id is null then raise exception 'Usuário autenticado obrigatório'; end if; return new; end; $$;
do $do$ declare t text; begin foreach t in array array['produtos','gastos','vendas','receitas','receita_itens','estoque_movimentacoes','work_calendar_events'] loop execute format('drop trigger if exists set_record_owner on public.%I',t); execute format('create trigger set_record_owner before insert on public.%I for each row execute function public.set_record_owner()',t); execute format('alter table public.%I enable row level security',t); execute format('drop policy if exists owner_isolation on public.%I',t); execute format('create policy owner_isolation on public.%I as restrictive for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid())',t); execute format('create index if not exists %I on public.%I(user_id)','idx_'||t||'_user_id',t); end loop; end $do$;

create or replace function public.handle_new_auth_user() returns trigger language plpgsql security definer set search_path=public as $$ declare display_name text; avatar text; begin display_name:=nullif(trim(coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name','')),''); avatar:=nullif(trim(coalesce(new.raw_user_meta_data->>'avatar_url','')),''); insert into public.profiles(id,full_name,avatar_url) values(new.id,display_name,avatar) on conflict(id) do update set full_name=excluded.full_name,avatar_url=excluded.avatar_url,updated_at=now(); if to_regclass('public.config') is not null then insert into public.config(user_id,user_name,meta_diaria) values(new.id,display_name,66) on conflict(user_id) do update set user_name=coalesce(excluded.user_name,public.config.user_name); end if; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();

commit;
