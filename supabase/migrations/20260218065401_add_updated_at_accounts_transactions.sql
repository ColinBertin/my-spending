alter table public.accounts
add column if not exists updated_at timestamptz;

alter table public.transactions
add column if not exists updated_at timestamptz;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_accounts_updated_at on public.accounts;

create trigger set_accounts_updated_at
before update on public.accounts
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_transactions_updated_at on public.transactions;

create trigger set_transactions_updated_at
before update on public.transactions
for each row
execute procedure public.set_updated_at();
