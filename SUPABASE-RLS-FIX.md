# 🔧 INSTRUÇÕES PARA CORRIGIR RLS NO SUPABASE

## 🚨 PROBLEMA IDENTIFICADO
O erro `403 Forbidden` com código `42501` indica que as **políticas RLS (Row Level Security)** estão bloqueando a inserção de dados na tabela `subscriptions`.

## 🛠️ SOLUÇÃO PASSO A PASSO

### 1. 🌐 Acesse o Dashboard do Supabase
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto: **ptkmfeinqmisluyljlyn**

### 2. 🔐 Navegue até Authentication > Policies
- No menu lateral, clique em **"Authentication"**
- Depois clique em **"Policies"**

### 3. 🔍 Encontre a tabela "subscriptions"
- Procure pela tabela **"subscriptions"** na lista
- Se não aparecer, pode estar no schema **"public"**

### 4. ➕ Criar Nova Política para INSERT
Clique em **"New Policy"** e configure:

```sql
-- Nome da política
Allow anonymous subscription creation

-- Operação
INSERT

-- Target roles
anon, authenticated

-- USING expression (deixe vazio para INSERT)
(vazio)

-- WITH CHECK expression
true
```

### 5. ➕ Criar Política para SELECT (opcional)
```sql
-- Nome da política
Allow anonymous subscription viewing

-- Operação
SELECT  

-- Target roles
anon, authenticated

-- USING expression
true
```

### 6. ✅ Salvar e Testar
- Clique em **"Review"** e depois **"Save policy"**
- Teste a aplicação novamente

## 🔄 ALTERNATIVA RÁPIDA
Se preferir, execute este SQL no **SQL Editor** do Supabase:

```sql
-- Permitir inserção anônima na tabela subscriptions
CREATE POLICY IF NOT EXISTS "Allow anonymous subscription creation"
  ON public.subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permitir visualização anônima (opcional)
CREATE POLICY IF NOT EXISTS "Allow anonymous subscription viewing"
  ON public.subscriptions
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

## 🧪 TESTE
Após aplicar as políticas, teste novamente o fluxo de pagamento na aplicação.

O erro `403 Forbidden` deve desaparecer! ✅