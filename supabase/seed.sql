-- Test user: test@myspending.com / password123!
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'test@myspending.com', crypt('password123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}',
  '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, created_at, updated_at
) values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"test@myspending.com"}',
  'email', now(), now()
);


-- Accounts
insert into public.accounts (id, name, type, currency) values
  ('22222222-0000-0000-0000-000000000001', 'Personal Wallet',  'single',       'JPY'),
  ('22222222-0000-0000-0000-000000000002', 'Household',        'shared',       'JPY'),
  ('22222222-0000-0000-0000-000000000003', 'Freelance Business', 'professional', 'JPY');

-- Memberships: the seed runs as postgres (no auth.uid()), so the
-- add_account_creator_as_member trigger skips; insert them explicitly.
insert into public.account_members (account_id, user_id) values
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'),
  ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111'),
  ('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111');


-- Categories
insert into public.categories (id, user_id, name, type, color, icon, icon_pack) values
  -- normal: single/shared accounts
  ('33333333-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Groceries',     'normal', 'jade',      'HiShoppingCart',   'hi'),
  ('33333333-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Restaurants',   'normal', 'tangerine', 'MdRestaurantMenu', 'md'),
  ('33333333-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Transport',     'normal', 'azure',     'FaBus',            'fa'),
  ('33333333-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Rent',          'normal', 'grape',     'HiHome',           'hi'),
  ('33333333-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Salary',        'normal', 'emerald',   'HiBanknotes',      'hi'),
  -- professional: professional account and ledgers
  ('33333333-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', '売上高',         'professional', 'basil',  'MdAttachMoney',  'md'),
  ('33333333-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', '水道光熱費',     'professional', 'amber',  'MdElectricBolt', 'md'),
  ('33333333-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', '通信費',         'professional', 'sky',    'HiWifi',         'hi'),
  ('33333333-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', '消耗品費',       'professional', 'slate',  'HiShoppingBag',  'hi');



-- Transactions: one row per template per month, from January of last year up to today.
-- Category fields are a snapshot copied onto each transaction, so they're joined in.
insert into public.transactions (
  id, title, account_id, type, amount, currency, date, created_by,
  category_id, category_name, category_icon, category_icon_pack, category_color
)
select
  gen_random_uuid()::text, t.title, t.account_id, t.type,
  -- "varies" templates get a deterministic 0–2,999 offset so amounts differ month to month
  t.amount + case when t.varies
    then (extract(month from m.month)::int * 7919 + extract(year from m.month)::int) % 3000
    else 0 end,
  'JPY',
  m.month + make_interval(days => t.day - 1),
  '11111111-1111-1111-1111-111111111111',
  c.id, c.name, c.icon, c.icon_pack, c.color
from generate_series(
  date_trunc('year', now()) - interval '1 year',  -- January of last year
  date_trunc('month', now()),                     -- this month
  interval '1 month'
) as m(month)
cross join (values
  -- Personal Wallet
  ('22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000005', 'Monthly salary',   'income',  320000, 25, false, 1),
  ('22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000004', 'Rent',             'expense',  95000, 27, false, 1),
  ('22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000003', 'Suica top-up',     'expense',   5000,  3, false, 1),
  ('22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000002', 'Dinner out',       'expense',   4000, 14, true,  1),
  -- Household (shared)
  ('22222222-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', 'Supermarket',      'expense',   8000,  9, true,  1),
  ('22222222-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', 'Supermarket',      'expense',   9000, 22, true,  1),
  ('22222222-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', 'Family lunch',     'expense',   4500, 18, true,  2),
  -- Freelance Business
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000006', 'Client A invoice', 'income',  450000, 20, false, 1),
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000006', 'Client B project', 'income',  280000, 10, false, 3),
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000007', 'Electricity',      'expense',   8000, 15, true,  1),
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000007', 'Gas',              'expense',   5000, 18, true,  1),
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000008', 'Internet',         'expense',   5500, 28, false, 1),
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000008', 'Phone',            'expense',   3300,  5, false, 1),
  ('22222222-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000009', 'Office supplies',  'expense',   1500, 12, true,  2)
) as t(account_id, category_id, title, type, amount, day, varies, every_n_months)
join public.categories c on c.id = t.category_id
where extract(month from m.month)::int % t.every_n_months = 0         -- skip off-months
  and m.month + make_interval(days => t.day - 1) <= now();            -- no future dates
