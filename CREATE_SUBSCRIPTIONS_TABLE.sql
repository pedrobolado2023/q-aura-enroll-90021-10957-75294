-- Execute este SQL no painel do Supabase (SQL Editor)
-- https://supabase.com/dashboard/project/ptkmfeinqmisluyljlyn/sql

-- 1. Criar tabela subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
    payment_method TEXT CHECK (payment_method IN ('pix', 'card')),
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON public.subscriptions(created_at);

-- 3. Habilitar RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS

-- Usuários podem ver suas próprias assinaturas
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias assinaturas
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias assinaturas
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todas as assinaturas
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Admins podem atualizar todas as assinaturas
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can update all subscriptions"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.subscriptions;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Recarregar cache do schema
NOTIFY pgrst, 'reload schema';

-- ✅ PRONTO! Tabela subscriptions criada com sucesso!