create policy "categories_update_own"
on public.categories
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()))