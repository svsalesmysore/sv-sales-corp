-- Run this entire file in Supabase → SQL Editor → New Query

-- Stock: only stores qty; product metadata stays in the catalog JSON
create table if not exists stock (
  key  text    primary key,
  qty  integer not null default 0
);

-- Quotes: inbound quote requests from customers
create table if not exists quotes (
  id          text        primary key,
  created_at  timestamptz not null default now(),
  name        text        not null,
  company     text,
  phone       text        not null,
  email       text,
  message     text,
  items       jsonb       not null default '[]',
  uploaded    jsonb       not null default '[]',
  attachment  text,
  status      text        not null default 'new',  -- new | deal | dismissed
  deal_at     timestamptz
);

-- Sales: converted deals and manual walk-in sales
create table if not exists sales (
  id        text        primary key,
  at        timestamptz not null default now(),
  source    text        not null,  -- quote | manual
  quote_id  text,
  customer  text,
  lines     jsonb       not null default '[]'
);

-- Function used by decrementStock to safely subtract qty (allows negative for oversell detection)
create or replace function decrement_stock(p_key text, p_qty integer)
returns void as $$
begin
  insert into stock (key, qty) values (p_key, -p_qty)
  on conflict (key) do update set qty = stock.qty - p_qty;
end;
$$ language plpgsql;
