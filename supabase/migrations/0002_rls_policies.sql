-- =====================================================================
-- Marketplace de Gado — Paraguai
-- Migration 0002 — Row Level Security (RLS) e triggers de proteção
--
-- Rode DEPOIS da 0001. Regras centrais:
--   * Cada usuário só edita o próprio perfil e os próprios anúncios.
--   * Visitante só enxerga anúncio 'ativo' + 'aprovado'.
--   * Admin (profiles.is_admin = true) enxerga e modera tudo.
--   * A chave service_role do Supabase ignora RLS (uso server-side/admin).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. FUNÇÕES AUXILIARES
--    security definer => rodam ignorando RLS, evitando recursão ao ler
--    a tabela profiles de dentro de uma policy da própria profiles.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

create or replace function public.is_banned()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_banned from profiles where id = auth.uid()), false);
$$;


-- ---------------------------------------------------------------------
-- 1. TRIGGERS DE PROTEÇÃO (o que a RLS sozinha não consegue barrar)
-- ---------------------------------------------------------------------

-- Impede o dono do anúncio de se "auto-aprovar": só admin muda 'moderation'.
create or replace function public.protect_listing_moderation()
returns trigger language plpgsql as $$
begin
  if not public.is_admin() then
    new.moderation := old.moderation;
  end if;
  return new;
end;
$$;
create trigger trg_listings_protect_moderation
  before update on listings
  for each row execute function public.protect_listing_moderation();

-- Impede o usuário comum de se tornar admin ou de se "desbanir" sozinho.
create or replace function public.protect_profile_privileges()
returns trigger language plpgsql as $$
begin
  if not public.is_admin() then
    new.is_admin  := old.is_admin;
    new.is_banned := old.is_banned;
  end if;
  return new;
end;
$$;
create trigger trg_profiles_protect_privileges
  before update on profiles
  for each row execute function public.protect_profile_privileges();


-- ---------------------------------------------------------------------
-- 2. HABILITAR RLS EM TODAS AS TABELAS
-- ---------------------------------------------------------------------
alter table profiles         enable row level security;
alter table categories       enable row level security;
alter table breeds           enable row level security;
alter table farms            enable row level security;
alter table listings         enable row level security;
alter table listing_photos   enable row level security;
alter table favorites        enable row level security;
alter table messages         enable row level security;
alter table contact_events   enable row level security;
alter table reports          enable row level security;
alter table advertisers      enable row level security;
alter table banner_campaigns enable row level security;
alter table banner_events    enable row level security;


-- ---------------------------------------------------------------------
-- 3. PROFILES
-- ---------------------------------------------------------------------
-- Perfil é público (mini-perfil do vendedor aparece no anúncio).
create policy profiles_select_all on profiles
  for select using (true);

create policy profiles_insert_own on profiles
  for insert to authenticated with check (id = auth.uid());

create policy profiles_update_own on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());


-- ---------------------------------------------------------------------
-- 4. CATEGORIES / BREEDS  (lookup — leitura pública; escrita via admin/SQL)
-- ---------------------------------------------------------------------
create policy categories_select_all on categories for select using (true);
create policy breeds_select_all     on breeds     for select using (true);


-- ---------------------------------------------------------------------
-- 5. FARMS  (leitura pública; escrita só do dono)
-- ---------------------------------------------------------------------
create policy farms_select_all on farms
  for select using (true);

create policy farms_insert_own on farms
  for insert to authenticated with check (owner_id = auth.uid());

create policy farms_update_own on farms
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy farms_delete_own on farms
  for delete to authenticated using (owner_id = auth.uid());


-- ---------------------------------------------------------------------
-- 6. LISTINGS  (o coração — regras mais detalhadas)
-- ---------------------------------------------------------------------
-- Leitura: público vê só ativo+aprovado; dono vê os seus; admin vê tudo.
create policy listings_select_public on listings
  for select using (status = 'ativo' and moderation = 'aprovado');

create policy listings_select_own on listings
  for select to authenticated using (seller_id = auth.uid());

create policy listings_select_admin on listings
  for select to authenticated using (public.is_admin());

-- Criação: só logado, como dono, e não banido.
create policy listings_insert_own on listings
  for insert to authenticated
  with check (seller_id = auth.uid() and not public.is_banned());

-- Edição: dono edita o seu (trigger impede mexer em 'moderation'); admin edita tudo.
create policy listings_update_own on listings
  for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());

create policy listings_update_admin on listings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Exclusão: dono ou admin.
create policy listings_delete_own on listings
  for delete to authenticated using (seller_id = auth.uid());

create policy listings_delete_admin on listings
  for delete to authenticated using (public.is_admin());


-- ---------------------------------------------------------------------
-- 7. LISTING_PHOTOS  (segue a visibilidade do anúncio pai)
-- ---------------------------------------------------------------------
create policy listing_photos_select on listing_photos
  for select using (
    exists (
      select 1 from listings l
      where l.id = listing_photos.listing_id
        and (
          (l.status = 'ativo' and l.moderation = 'aprovado')
          or l.seller_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy listing_photos_write on listing_photos
  for all to authenticated
  using (
    exists (select 1 from listings l where l.id = listing_photos.listing_id and l.seller_id = auth.uid())
  )
  with check (
    exists (select 1 from listings l where l.id = listing_photos.listing_id and l.seller_id = auth.uid())
  );


-- ---------------------------------------------------------------------
-- 8. FAVORITES  (só o dono vê/mexe nos seus)
-- ---------------------------------------------------------------------
create policy favorites_select_own on favorites
  for select to authenticated using (user_id = auth.uid());

create policy favorites_insert_own on favorites
  for insert to authenticated with check (user_id = auth.uid());

create policy favorites_delete_own on favorites
  for delete to authenticated using (user_id = auth.uid());


-- ---------------------------------------------------------------------
-- 9. MESSAGES  (só remetente e destinatário)
-- ---------------------------------------------------------------------
create policy messages_select_parties on messages
  for select to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy messages_insert_sender on messages
  for insert to authenticated with check (sender_id = auth.uid() and not public.is_banned());

-- Destinatário pode marcar como lida.
create policy messages_update_recipient on messages
  for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());


-- ---------------------------------------------------------------------
-- 10. CONTACT_EVENTS  (qualquer um registra o clique; só dono/admin lê)
-- ---------------------------------------------------------------------
create policy contact_events_insert_any on contact_events
  for insert to anon, authenticated with check (true);

create policy contact_events_select_owner_admin on contact_events
  for select to authenticated using (
    public.is_admin()
    or exists (select 1 from listings l where l.id = contact_events.listing_id and l.seller_id = auth.uid())
  );


-- ---------------------------------------------------------------------
-- 11. REPORTS  (logado denuncia; só admin lê e resolve)
-- ---------------------------------------------------------------------
create policy reports_insert_own on reports
  for insert to authenticated with check (reporter_id = auth.uid());

create policy reports_select_admin on reports
  for select to authenticated using (public.is_admin());

create policy reports_update_admin on reports
  for update to authenticated using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------
-- 12. ADVERTISERS  (só admin)
-- ---------------------------------------------------------------------
create policy advertisers_all_admin on advertisers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------
-- 13. BANNER_CAMPAIGNS  (público vê as vigentes; admin gerencia)
-- ---------------------------------------------------------------------
create policy campaigns_select_active on banner_campaigns
  for select using (
    is_active
    and starts_at <= now()
    and (ends_at is null or ends_at > now())
  );

create policy campaigns_select_admin on banner_campaigns
  for select to authenticated using (public.is_admin());

create policy campaigns_write_admin on banner_campaigns
  for all to authenticated using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------
-- 14. BANNER_EVENTS  (qualquer um registra impressão/clique; só admin lê)
-- ---------------------------------------------------------------------
create policy banner_events_insert_any on banner_events
  for insert to anon, authenticated with check (true);

create policy banner_events_select_admin on banner_events
  for select to authenticated using (public.is_admin());
