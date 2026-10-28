create policy "categories_insert_own"
on public.categories
for insert
to authenticated
with check (user_id = (select auth.uid()));
