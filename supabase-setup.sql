-- ============================================
-- TerraLink - Script SQL para Supabase
-- ============================================

-- 1. Criar VIEW vw_user_status
DROP VIEW IF EXISTS public.vw_user_status CASCADE;

CREATE VIEW public.vw_user_status AS
SELECT
  u.id,
  u.email,
  u.name,
  u.phone,
  u.role,
  u.is_admin,
  u.location,
  u.avatar,
  u.plan,
  u.two_factor_enabled,
  u.credits,
  u.first_ad_at,
  u.created_at,
  u.updated_at
FROM public.users u;

-- 2. Criar função get_user_stats
DROP FUNCTION IF EXISTS public.get_user_stats(UUID);

CREATE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_ads BIGINT,
  active_ads BIGINT,
  total_views BIGINT,
  total_clicks BIGINT,
  is_seller BOOLEAN,
  first_ad_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total_ads,
    COUNT(*) FILTER (WHERE a.status = 'active')::BIGINT AS active_ads,
    COALESCE(SUM(a.views), 0)::BIGINT AS total_views,
    COALESCE(SUM(a.clicks), 0)::BIGINT AS total_clicks,
    (COUNT(*) > 0) AS is_seller,
    MIN(a.created_at) AS first_ad_at
  FROM public.ads a
  WHERE a.user_id = user_uuid;
END;
$$;

-- 3. Políticas RLS para tabela users (sem recursão)
-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins têm acesso total - users" ON public.users;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.users;

-- Criar políticas sem recursão
CREATE POLICY "Usuários podem ver próprio perfil"
ON public.users
FOR SELECT
TO public
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.users
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins têm acesso total - users"
ON public.users
FOR ALL
TO public
USING (
  (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
);

-- 4. Políticas RLS para tabela ads (sem recursão)
DROP POLICY IF EXISTS "Anúncios públicos visíveis" ON public.ads;
DROP POLICY IF EXISTS "Usuários podem gerenciar próprios anúncios" ON public.ads;

CREATE POLICY "Anúncios públicos visíveis"
ON public.ads
FOR SELECT
TO public
USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Usuários podem gerenciar próprios anúncios"
ON public.ads
FOR ALL
TO public
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Garantir que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- 6. Grant de permissões
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.vw_user_status TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats(UUID) TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
