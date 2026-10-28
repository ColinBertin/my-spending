create policy "accounts_delete_if_member"
on public.accounts
for delete
to authenticated
using (
  exists (
    select 1 from public.account_members am
    where am.account_id = accounts.id
      and am.user_id = (select auth.uid())
  )
);
