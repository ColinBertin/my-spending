alter table public.users
add column if not exists auth_user_id uuid;

update public.users pu
set auth_user_id = au.id
from auth.users au
where lower(pu.email) = lower(au.email)
  and pu.auth_user_id is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_auth_user_id_key'
  ) then
    alter table public.users
      add constraint users_auth_user_id_key unique (auth_user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_auth_user_id_fkey'
  ) then
    alter table public.users
      add constraint users_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id) on delete cascade;
  end if;
end $$;


alter table public.account_members
add column if not exists auth_user_id uuid;

alter table public.categories
add column if not exists auth_user_id uuid;

alter table public.transactions
add column if not exists auth_created_by uuid;


update public.account_members am
set auth_user_id = u.auth_user_id
from public.users u
where am.user_id = u.id
  and am.auth_user_id is null;

update public.categories c
set auth_user_id = u.auth_user_id
from public.users u
where c.user_id = u.id
  and c.auth_user_id is null;

update public.transactions t
set auth_created_by = u.auth_user_id
from public.users u
where t.created_by = u.id
  and t.auth_created_by is null;


do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'account_members_auth_user_id_fkey'
  ) then
    alter table public.account_members
      add constraint account_members_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'categories_auth_user_id_fkey'
  ) then
    alter table public.categories
      add constraint categories_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'transactions_auth_created_by_fkey'
  ) then
    alter table public.transactions
      add constraint transactions_auth_created_by_fkey
      foreign key (auth_created_by) references auth.users(id);
  end if;
end $$;


create index if not exists idx_users_auth_user_id on public.users(auth_user_id);
create index if not exists idx_account_members_auth_user_id on public.account_members(auth_user_id);
create index if not exists idx_categories_auth_user_id on public.categories(auth_user_id);
create index if not exists idx_transactions_auth_created_by on public.transactions(auth_created_by);
