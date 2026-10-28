drop extension if exists "pg_net";

create type "public"."category_type" as enum ('normal', 'professional');

alter table "public"."account_members" enable row level security;

alter table "public"."accounts" enable row level security;

alter table "public"."categories" add column "type" public.category_type default 'normal'::public.category_type;

alter table "public"."categories" enable row level security;

alter table "public"."transactions" enable row level security;

alter table "public"."users" enable row level security;


  create policy "account_members_select_self"
  on "public"."account_members"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "accounts_select_if_member"
  on "public"."accounts"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.account_members am
  WHERE ((am.account_id = accounts.id) AND (am.user_id = auth.uid())))));



  create policy "categories_select_own"
  on "public"."categories"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "transactions_select_if_account_member"
  on "public"."transactions"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.account_members am
  WHERE ((am.account_id = transactions.account_id) AND (am.user_id = auth.uid())))));



