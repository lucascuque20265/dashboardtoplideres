-- ============================================================
-- Função RPC para listar usuários auth (apenas superadmin)
-- Execute no Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  id              uuid,
  email           text,
  created_at      timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  -- Verifica se o chamador tem app_metadata.superadmin = true
  IF NOT ((auth.jwt() -> 'app_metadata' ->> 'superadmin')::boolean IS TRUE) THEN
    RAISE EXCEPTION 'Acesso negado: apenas superadmin pode listar usuários';
  END IF;

  RETURN QUERY
    SELECT u.id, u.email, u.created_at, u.last_sign_in_at
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;

-- Permitir que usuários autenticados chamem via supabase.rpc()
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;


-- ============================================================
-- Diagnóstico: ver quem está como superadmin
-- ============================================================
-- SELECT id, email, raw_app_meta_data
-- FROM auth.users
-- WHERE raw_app_meta_data->>'superadmin' = 'true';


-- ============================================================
-- Corrigir: remover superadmin de usuário comum
-- (substitua pelo e-mail do usuário normal)
-- ============================================================
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data - 'superadmin'
-- WHERE email = 'usuario_normal@seudominio.com';


-- ============================================================
-- Definir superadmin no usuário principal
-- (substitua pelo SEU e-mail)
-- ============================================================
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"superadmin": true}'::jsonb
-- WHERE email = 'seu_email@seudominio.com';
