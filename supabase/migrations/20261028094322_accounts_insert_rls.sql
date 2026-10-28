do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.account_members'::regclass
      and contype in ('p', 'u')
  ) then
    alter table public.account_members
      add constraint account_members_pkey primary key (account_id, user_id);
  end if;
end $$;

create policy "accounts_insert_authenticated"
on public.accounts
for insert
to authenticated
with check (true);

create or replace function public.add_account_creator_as_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    insert into public.account_members (account_id, user_id)
    values (new.id, auth.uid());
  end if;
  return new;
end;
$$;

revoke execute on function public.add_account_creator_as_member() from public, anon, authenticated;

create trigger add_account_creator_as_member
after insert on public.accounts
for each row
execute procedure public.add_account_creator_as_member();
