-- =====================================================================
-- Seed — categorias e racas fixas
-- Rode DEPOIS da migration 0001.
-- =====================================================================

insert into categories (slug, name_es, name_pt, sort_order) values
  ('boi',      'Novillo',    'Boi',      1),
  ('vaca',     'Vaca',       'Vaca',     2),
  ('novilha',  'Vaquillona', 'Novilha',  3),
  ('bezerro',  'Ternero',    'Bezerro',  4),
  ('touro',    'Toro',       'Touro',    5),
  ('matriz',   'Matriz',     'Matriz',   6)
on conflict (slug) do nothing;

insert into breeds (slug, name, sort_order) values
  ('nelore',  'Nelore',  1),
  ('brangus', 'Brangus', 2),
  ('braford', 'Braford', 3),
  ('angus',   'Angus',   4),
  ('brahman', 'Brahman', 5),
  ('mestico', 'Mestico', 6)
on conflict (slug) do nothing;
