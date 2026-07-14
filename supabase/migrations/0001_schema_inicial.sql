-- =====================================================================
-- Marketplace de Gado — Paraguai  (nome de trabalho: "Tropa")
-- Migration 0001 — schema inicial
--
-- Alvo: PostgreSQL 15+ / Supabase.
-- Observacoes:
--   * As policies de RLS (Row Level Security) NAO estao aqui de proposito:
--     elas entram na Etapa 3 (auth e perfil), quando as regras de acesso
--     ja estiverem definidas.
--   * gen_random_uuid() e nativo no Postgres 13+ (nao precisa de extensao).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TIPOS (enums)
-- ---------------------------------------------------------------------
create type user_type          as enum ('comprador', 'vendedor', 'ambos');
create type listing_status     as enum ('rascunho', 'ativo', 'vendido', 'pausado', 'expirado');
create type moderation_status  as enum ('pendente', 'aprovado', 'reprovado');
create type price_type         as enum ('por_cabeca', 'por_kg', 'por_arroba');
create type currency_code      as enum ('PYG', 'BRL', 'USD');
create type report_status      as enum ('pendente', 'revisado', 'removido');
create type contact_event_type as enum ('whatsapp_click', 'phone_view');
create type banner_position    as enum ('home_top', 'feed_inline', 'search_sidebar', 'detail_footer');
create type banner_event_type  as enum ('impression', 'click');


-- ---------------------------------------------------------------------
-- 2. PERFIS  (estende auth.users do Supabase)
-- ---------------------------------------------------------------------
create table profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text        not null,
  phone       text,
  whatsapp    text,                                   -- numero em formato internacional, ex: 595981234567
  city        text,
  department  text,                                   -- departamento do Paraguai
  user_type   user_type   not null default 'comprador',
  avatar_url  text,
  is_admin    boolean     not null default false,
  is_banned   boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 3. CATEGORIAS DE ANIMAL  (lookup — populado pelo seed)
-- ---------------------------------------------------------------------
create table categories (
  id         smallint primary key generated always as identity,
  slug       text     not null unique,               -- boi, vaca, novilha, bezerro, touro, matriz
  name_es    text     not null,
  name_pt    text     not null,
  sort_order smallint not null default 0
);


-- ---------------------------------------------------------------------
-- 4. RACAS  (lookup — populado pelo seed)
-- ---------------------------------------------------------------------
create table breeds (
  id         smallint primary key generated always as identity,
  slug       text     not null unique,               -- nelore, brangus, braford, angus, brahman, mestico
  name       text     not null,
  sort_order smallint not null default 0
);


-- ---------------------------------------------------------------------
-- 5. FAZENDAS / LOCALIZACAO  (um vendedor pode ter varias)
-- ---------------------------------------------------------------------
create table farms (
  id         uuid          primary key default gen_random_uuid(),
  owner_id   uuid          not null references profiles(id) on delete cascade,
  name       text          not null,
  department text,
  city       text,
  latitude   numeric(9,6),
  longitude  numeric(9,6),
  created_at timestamptz   not null default now(),
  constraint farms_lat_chk check (latitude  is null or latitude  between  -90 and  90),
  constraint farms_lng_chk check (longitude is null or longitude between -180 and 180)
);
create index idx_farms_owner on farms(owner_id);


-- ---------------------------------------------------------------------
-- 6. ANUNCIOS DE LOTE DE GADO  (tabela central)
-- ---------------------------------------------------------------------
create table listings (
  id             uuid              primary key default gen_random_uuid(),
  seller_id      uuid              not null references profiles(id)   on delete cascade,
  farm_id        uuid              references farms(id)               on delete set null,
  title          text              not null,
  category_id    smallint          not null references categories(id),
  breed_id       smallint          references breeds(id),             -- null quando "mestico"/nao informado
  head_count     integer           not null,                         -- quantidade de cabecas
  avg_weight_kg  numeric(6,2),                                        -- peso medio (kg)
  avg_age_months integer,                                             -- idade media (meses)
  price          numeric(14,2)     not null,
  price_type     price_type        not null default 'por_cabeca',
  currency       currency_code     not null default 'PYG',
  description    text,
  city           text,
  department     text,
  latitude       numeric(9,6),
  longitude      numeric(9,6),
  status         listing_status    not null default 'rascunho',
  moderation     moderation_status not null default 'pendente',
  view_count     integer           not null default 0,
  created_at     timestamptz       not null default now(),
  updated_at     timestamptz       not null default now(),
  published_at   timestamptz,
  expires_at     timestamptz,
  constraint listings_head_count_chk check (head_count > 0),
  constraint listings_weight_chk     check (avg_weight_kg  is null or avg_weight_kg  > 0),
  constraint listings_age_chk        check (avg_age_months is null or avg_age_months >= 0),
  constraint listings_price_chk      check (price >= 0),
  constraint listings_title_len      check (char_length(title) between 3 and 120),
  constraint listings_lat_chk        check (latitude  is null or latitude  between  -90 and  90),
  constraint listings_lng_chk        check (longitude is null or longitude between -180 and 180),
  constraint listings_expires_chk    check (expires_at is null or published_at is null or expires_at > published_at)
);

-- indices pedidos na Etapa 1 (categoria, departamento, preco, status) + os do feed
create index idx_listings_category   on listings(category_id);
create index idx_listings_breed      on listings(breed_id);
create index idx_listings_department on listings(department);
create index idx_listings_price      on listings(price);
create index idx_listings_status     on listings(status);
create index idx_listings_seller     on listings(seller_id);
create index idx_listings_expires    on listings(expires_at);
-- feed da home / busca: so anuncios ativos, mais recentes primeiro
create index idx_listings_feed       on listings(status, created_at desc);


-- ---------------------------------------------------------------------
-- 7. FOTOS DO ANUNCIO  (ate 8 — limite reforcado no app/Etapa 4)
-- ---------------------------------------------------------------------
create table listing_photos (
  id          uuid        primary key default gen_random_uuid(),
  listing_id  uuid        not null references listings(id) on delete cascade,
  storage_path text       not null,                  -- caminho no Supabase Storage
  sort_order  smallint    not null default 0,
  created_at  timestamptz not null default now()
);
create index idx_listing_photos_listing on listing_photos(listing_id);


-- ---------------------------------------------------------------------
-- 8. FAVORITOS  (N:N usuario <-> anuncio)
-- ---------------------------------------------------------------------
create table favorites (
  user_id    uuid        not null references profiles(id) on delete cascade,
  listing_id uuid        not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index idx_favorites_listing on favorites(listing_id);


-- ---------------------------------------------------------------------
-- 9. MENSAGENS / CONTATOS  (chat interno — "depois" no roadmap, ja modelado)
-- ---------------------------------------------------------------------
create table messages (
  id           uuid        primary key default gen_random_uuid(),
  listing_id   uuid        references listings(id) on delete set null,
  sender_id    uuid        not null references profiles(id) on delete cascade,
  recipient_id uuid        not null references profiles(id) on delete cascade,
  body         text        not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now(),
  constraint messages_not_self check (sender_id <> recipient_id)
);
create index idx_messages_recipient on messages(recipient_id, created_at desc);
create index idx_messages_listing   on messages(listing_id);


-- ---------------------------------------------------------------------
-- 10. METRICAS DE CONTATO  (cada clique no "Falar com o vendedor")
-- ---------------------------------------------------------------------
create table contact_events (
  id         bigint             primary key generated always as identity,
  listing_id uuid               not null references listings(id) on delete cascade,
  user_id    uuid               references profiles(id) on delete set null,  -- null = visitante anonimo
  event_type contact_event_type not null default 'whatsapp_click',
  created_at timestamptz        not null default now()
);
create index idx_contact_events_listing on contact_events(listing_id);


-- ---------------------------------------------------------------------
-- 11. DENUNCIAS
-- ---------------------------------------------------------------------
create table reports (
  id          uuid          primary key default gen_random_uuid(),
  listing_id  uuid          not null references listings(id) on delete cascade,
  reporter_id uuid          references profiles(id) on delete set null,
  reason      text          not null,
  description text,
  status      report_status not null default 'pendente',
  created_at  timestamptz   not null default now()
);
create index idx_reports_status on reports(status);


-- ---------------------------------------------------------------------
-- 12. ANUNCIANTES  (empresas do agronegocio — monetizacao)
-- ---------------------------------------------------------------------
create table advertisers (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  contact_email text,
  contact_phone text,
  website       text,
  created_at    timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 13. CAMPANHAS DE BANNER
-- ---------------------------------------------------------------------
create table banner_campaigns (
  id            uuid            primary key default gen_random_uuid(),
  advertiser_id uuid            not null references advertisers(id) on delete cascade,
  name          text            not null,
  position      banner_position not null,
  image_path    text            not null,
  link_url      text,
  starts_at     timestamptz     not null default now(),
  ends_at       timestamptz,
  is_active     boolean         not null default true,
  created_at    timestamptz     not null default now(),
  constraint campaigns_dates_chk check (ends_at is null or ends_at > starts_at)
);
create index idx_campaigns_active on banner_campaigns(position, is_active);


-- ---------------------------------------------------------------------
-- 14. EVENTOS DE BANNER  (impressoes e cliques)
-- ---------------------------------------------------------------------
create table banner_events (
  id          bigint            primary key generated always as identity,
  campaign_id uuid              not null references banner_campaigns(id) on delete cascade,
  event_type  banner_event_type not null,
  created_at  timestamptz       not null default now()
);
create index idx_banner_events_campaign on banner_events(campaign_id);


-- ---------------------------------------------------------------------
-- 15. TRIGGER: manter updated_at atualizado
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

create trigger trg_listings_updated before update on listings
  for each row execute function set_updated_at();
