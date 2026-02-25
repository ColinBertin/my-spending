do $$
begin
  if exists (select 1 from public.categories where auth_user_id is null) then
    raise exception 'Cannot swap: public.categories.auth_user_id contains NULLs';
  end if;

  if exists (select 1 from public.transactions where auth_created_by is null) then
    raise exception 'Cannot swap: public.transactions.auth_created_by contains NULLs';
  end if;

  if exists (select 1 from public.account_members where auth_user_id is null) then
    raise exception 'Cannot swap: public.account_members.auth_user_id contains NULLs';
  end if;
end $$;


alter table public.categories
  drop constraint if exists categories_user_id_fkey;

alter table public.categories
  drop column if exists user_id;

alter table public.categories
  rename column auth_user_id to user_id;

alter table public.categories
  add constraint categories_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

create index if not exists idx_categories_user_id on public.categories(user_id);


alter table public.transactions
  drop constraint if exists transactions_created_by_fkey;

alter table public.transactions
  drop column if exists created_by;

alter table public.transactions
  rename column auth_created_by to created_by;

alter table public.transactions
  add constraint transactions_created_by_fkey
  foreign key (created_by) references auth.users(id);

create index if not exists idx_transactions_created_by on public.transactions(created_by);


alter table public.account_members
  drop constraint if exists account_members_user_id_fkey;

alter table public.account_members
  drop column if exists user_id;

alter table public.account_members
  rename column auth_user_id to user_id;

alter table public.account_members
  add constraint account_members_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

create index if not exists idx_account_members_user_id on public.account_members(user_id);