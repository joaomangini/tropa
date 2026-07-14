-- =====================================================================
-- DEMO SEED — dados fictícios para ver as tabelas populadas
--
-- Rode DEPOIS de: 0001_schema_inicial.sql  ->  seed.sql  ->  0002_rls_policies.sql
-- Rode no SQL Editor do Supabase (ele usa a chave que ignora RLS).
--
-- Cria: 3 usuários demo, 3 fazendas, 6 anúncios (ativos e aprovados,
-- então aparecem no feed), fotos, favoritos, cliques de contato,
-- 1 anunciante e 1 campanha de banner.
--
-- OBS: são contas de DEMONSTRAÇÃO, só para exibir dados — não servem
-- para fazer login. Para testar login de verdade, crie uma conta pelo
-- cadastro normal quando o site existir.
--
-- Para apagar tudo depois:  delete from auth.users where email like '%@demo.tropa';
-- (o resto cai junto por causa do "on delete cascade")
-- =====================================================================

begin;

-- ---------- 1. Usuários demo (na tabela de auth do Supabase) ----------
insert into auth.users
  (instance_id, id, aud, role, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'carlos@demo.tropa', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Carlos Benítez"}'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'estancia@demo.tropa', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Estancia Santa Rosa"}'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'joana@demo.tropa', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Joana Ramírez"}')
on conflict (id) do nothing;

-- ---------- 2. Perfis ----------
insert into profiles (id, full_name, phone, whatsapp, city, department, user_type) values
  ('11111111-1111-1111-1111-111111111111', 'Carlos Benítez',       '+595981111111', '595981111111', 'Asunción',            'Central',      'vendedor'),
  ('22222222-2222-2222-2222-222222222222', 'Estancia Santa Rosa',  '+595982222222', '595982222222', 'Ciudad del Este',     'Alto Paraná',  'ambos'),
  ('33333333-3333-3333-3333-333333333333', 'Joana Ramírez',        '+595983333333', '595983333333', 'Encarnación',         'Itapúa',       'comprador')
on conflict (id) do nothing;

-- ---------- 3. Fazendas ----------
insert into farms (id, owner_id, name, department, city, latitude, longitude) values
  ('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Estancia La Esperanza', 'Central',     'Asunción',        -25.300000, -57.630000),
  ('f2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Estancia Santa Rosa',   'Alto Paraná', 'Ciudad del Este', -25.510000, -54.610000),
  ('f3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Campo San Miguel',      'Itapúa',      'Encarnación',     -27.330000, -55.870000)
on conflict (id) do nothing;

-- ---------- 4. Anúncios (todos ativos + aprovados => aparecem no feed) ----------
insert into listings
  (id, seller_id, farm_id, title, category_id, breed_id, head_count, avg_weight_kg, avg_age_months,
   price, price_type, currency, description, city, department, latitude, longitude,
   status, moderation, published_at, expires_at)
values
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111',
   'Lote de 60 novillos Nelore', (select id from categories where slug='boi'), (select id from breeds where slug='nelore'),
   60, 380.00, 30, 780.00, 'por_cabeca', 'USD', 'Novillos Nelore de invernada, bem manejados, prontos para engorda.',
   'Asunción', 'Central', -25.300000, -57.630000, 'ativo', 'aprovado', now(), now() + interval '30 days'),

  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222',
   '40 vaquillonas Brangus', (select id from categories where slug='novilha'), (select id from breeds where slug='brangus'),
   40, 320.00, 24, 690.00, 'por_cabeca', 'USD', 'Vaquillonas Brangus para reposição, sanidade em dia.',
   'Ciudad del Este', 'Alto Paraná', -25.510000, -54.610000, 'ativo', 'aprovado', now(), now() + interval '30 days'),

  ('a3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'f3333333-3333-3333-3333-333333333333',
   'Touros Angus registrados', (select id from categories where slug='touro'), (select id from breeds where slug='angus'),
   5, 620.00, 36, 2500.00, 'por_cabeca', 'USD', 'Reprodutores Angus com registro, excelente genética.',
   'Encarnación', 'Itapúa', -27.330000, -55.870000, 'ativo', 'aprovado', now(), now() + interval '30 days'),

  ('a4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111',
   '80 matrizes Brahman', (select id from categories where slug='matriz'), (select id from breeds where slug='brahman'),
   80, 450.00, 48, 4200000.00, 'por_cabeca', 'PYG', 'Matrizes Brahman de cria, rústicas e adaptadas ao clima.',
   'Coronel Oviedo', 'Caaguazú', -25.440000, -56.440000, 'ativo', 'aprovado', now(), now() + interval '30 days'),

  ('a5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222',
   '100 bezerros mestiços', (select id from categories where slug='bezerro'), null,
   100, 180.00, 8, 14500.00, 'por_kg', 'PYG', 'Bezerros mestiços desmamados, lote uniforme.',
   'San Estanislao', 'San Pedro', -24.660000, -56.440000, 'ativo', 'aprovado', now(), now() + interval '30 days'),

  ('a6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111',
   'Lote Braford por arroba', (select id from categories where slug='boi'), (select id from breeds where slug='braford'),
   35, 400.00, 28, 320000.00, 'por_arroba', 'PYG', 'Boi Braford gordo, venda por arroba.',
   'Pedro Juan Caballero', 'Amambay', -22.550000, -55.730000, 'ativo', 'aprovado', now(), now() + interval '30 days')
on conflict (id) do nothing;

-- ---------- 5. Fotos (caminhos de exemplo — sem imagem real no Storage) ----------
insert into listing_photos (listing_id, storage_path, sort_order) values
  ('a1111111-1111-1111-1111-111111111111', 'demo/nelore-1.jpg',  0),
  ('a1111111-1111-1111-1111-111111111111', 'demo/nelore-2.jpg',  1),
  ('a2222222-2222-2222-2222-222222222222', 'demo/brangus-1.jpg', 0),
  ('a3333333-3333-3333-3333-333333333333', 'demo/angus-1.jpg',   0),
  ('a4444444-4444-4444-4444-444444444444', 'demo/brahman-1.jpg', 0),
  ('a5555555-5555-5555-5555-555555555555', 'demo/bezerro-1.jpg', 0),
  ('a6666666-6666-6666-6666-666666666666', 'demo/braford-1.jpg', 0);

-- ---------- 6. Favoritos (a compradora Joana salvou 2 anúncios) ----------
insert into favorites (user_id, listing_id) values
  ('33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333')
on conflict do nothing;

-- ---------- 7. Cliques de contato (métrica do "Falar com o vendedor") ----------
insert into contact_events (listing_id, user_id, event_type) values
  ('a1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'whatsapp_click'),
  ('a1111111-1111-1111-1111-111111111111', null,                                   'whatsapp_click'),
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'whatsapp_click');

-- ---------- 8. Anunciante + campanha de banner ----------
insert into advertisers (id, name, contact_email, contact_phone, website) values
  ('adadadad-0000-0000-0000-000000000001', 'Agroganadera del Este', 'contacto@agroeste.py', '+595985000000', 'https://agroeste.py')
on conflict (id) do nothing;

insert into banner_campaigns (advertiser_id, name, position, image_path, link_url, starts_at, ends_at, is_active) values
  ('adadadad-0000-0000-0000-000000000001', 'Campanha suplementos verão', 'home_top', 'demo/banner-agroeste.jpg', 'https://agroeste.py/promo', now(), now() + interval '60 days', true);

commit;
