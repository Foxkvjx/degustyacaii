begin;

alter table public.config add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.config enable row level security;
drop policy if exists config_owner on public.config;
create policy config_owner on public.config for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
grant select, insert, update on public.config to authenticated;
create unique index if not exists config_user_id_key on public.config(user_id);
create index if not exists idx_config_user_id on public.config(user_id);

commit;
