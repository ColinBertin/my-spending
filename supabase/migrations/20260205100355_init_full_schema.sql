create table if not exists users (
    id text primary key,
    email text not null unique,
    username text not null,
    created_at timestamptz default now()
);

create table if not exists accounts (
    id text primary key,
    name text not null,
    type text check (type in ('single', 'shared', 'professional')),
    currency text not null,
    created_at timestamptz default now()
);

create table if not exists account_members (
    account_id text references accounts(id) on delete cascade,
    user_id text references users(id) on delete cascade,
    primary key (account_id, user_id)
);

create table if not exists categories (
    id text primary key,
    user_id text references users(id) on delete cascade,
    name text not null,
    color text,
    icon text,
    icon_pack text,
    created_at timestamptz default now()
);

create table if not exists transactions (
    id text primary key,
    title text not null,
    account_id text references accounts(id) on delete cascade,
    type text check (type in ('income', 'expense')),
    category_id text references categories(id),
    category_name text,
    category_icon text,
    category_icon_pack text,
    category_color text,
    amount numeric not null,
    currency text not null,
    date timestamptz not null,
    note text,
    created_by text references users(id),
    created_at timestamptz default now()
);