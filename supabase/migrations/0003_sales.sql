-- =====================================================================
-- Marketplace de Gado — Paraguai
-- Migration 0003 — registro de vendas (parciais)
--
-- Permite ao vendedor registrar quantas cabeças vendeu de um lote e
-- para quem. Rode no SQL Editor do Supabase DEPOIS das anteriores.
-- =====================================================================

create table sales (
  id          uuid        primary key default gen_random_uuid(),
  listing_id  uuid        not null references listings(id) on delete cascade,
  seller_id   uuid        not null references profiles(id) on delete cascade,
  quantity    integer     not null,
  buyer_name  text,
  buyer_phone text,
  note        text,
  sold_at     timestamptz not null default now(),
  constraint sales_qty_chk check (quantity > 0)
);

create index idx_sales_listing on sales(listing_id);
create index idx_sales_seller  on sales(seller_id);

-- Segurança: cada vendedor só vê e mexe nas próprias vendas.
alter table sales enable row level security;

create policy sales_select_own on sales
  for select to authenticated using (seller_id = auth.uid());

create policy sales_insert_own on sales
  for insert to authenticated
  with check (
    seller_id = auth.uid()
    and exists (
      select 1 from listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

create policy sales_delete_own on sales
  for delete to authenticated using (seller_id = auth.uid());
