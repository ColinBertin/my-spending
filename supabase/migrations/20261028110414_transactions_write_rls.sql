create policy "transactions_insert_own"
on public.transactions
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.account_members am
    where am.account_id = transactions.account_id
      and am.user_id = (select auth.uid())
  )
  and (
    category_id is null
    or exists (
      select 1 from public.categories c
      where c.id = transactions.category_id
        and c.user_id = (select auth.uid())
    )
  )
);

create policy "transactions_update_own"
on public.transactions
for update
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.account_members am
    where am.account_id = transactions.account_id
      and am.user_id = (select auth.uid())
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.account_members am
    where am.account_id = transactions.account_id
      and am.user_id = (select auth.uid())
  )
  and (
    category_id is null
    or exists (
      select 1 from public.categories c
      where c.id = transactions.category_id
        and c.user_id = (select auth.uid())
    )
  )
);

create policy "transactions_delete_own"
on public.transactions
for delete
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.account_members am
    where am.account_id = transactions.account_id
      and am.user_id = (select auth.uid())
  )
);
