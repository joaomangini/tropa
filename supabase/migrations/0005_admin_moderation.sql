-- =====================================================================
-- Marketplace de Gado — Paraguai
-- Migration 0005 — Admin: atualizar qualquer perfil (para banir usuários)
--
-- A policy profiles_update_own só deixava o usuário editar o próprio perfil.
-- Aqui liberamos o admin a atualizar qualquer perfil (ex: is_banned).
-- O trigger protect_profile_privileges continua permitindo que só admin
-- mude is_admin/is_banned.
-- =====================================================================

create policy profiles_update_admin on profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
