-- =====================================================================
-- Marketplace de Gado — Paraguai
-- Migration 0004 — Storage das fotos dos anúncios
--
-- Cria o bucket público "listing-photos" e as regras de acesso.
-- Rode no SQL Editor do Supabase.
-- =====================================================================

-- Bucket público (leitura livre; escrita controlada pelas policies abaixo)
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Qualquer um vê as fotos (bucket público)
create policy "listing_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

-- Logado só envia para a sua própria pasta (1ª pasta = id do usuário)
create policy "listing_photos_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Logado só apaga as suas próprias fotos
create policy "listing_photos_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
