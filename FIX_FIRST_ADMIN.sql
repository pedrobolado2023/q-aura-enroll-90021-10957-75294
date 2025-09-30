-- ========================================
-- FIX PARA O PRIMEIRO ADMIN - Execute no Supabase
-- ========================================

-- OPÇÃO 1: Temporariamente desabilitar RLS na tabela user_roles
-- (Execute apenas isto primeiro)
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Depois que o primeiro admin for criado, reabilite:
-- ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- OU OPÇÃO 2: Política que permite o primeiro admin
-- ========================================

-- Primeiro, remova todas as políticas existentes da tabela user_roles:
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- Criar novas políticas mais permissivas:
CREATE POLICY "Anyone can read roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert first admin"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permite inserir se não há admin ainda OU se já é admin
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
    OR 
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ========================================
-- EXECUTE UMA DAS OPÇÕES ACIMA
-- ========================================