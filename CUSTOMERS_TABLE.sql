-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cpf VARCHAR(14),
    address JSONB, -- Para armazenar endereço completo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_cpf ON customers(cpf);

-- RLS (Row Level Security)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own customer data" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer data" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer data" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

-- Atualizar tabela subscriptions para referenciar customers
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Comentários para documentação
COMMENT ON TABLE customers IS 'Tabela para armazenar dados dos clientes';
COMMENT ON COLUMN customers.user_id IS 'Referência ao usuário autenticado';
COMMENT ON COLUMN customers.name IS 'Nome completo do cliente';
COMMENT ON COLUMN customers.email IS 'Email do cliente';
COMMENT ON COLUMN customers.phone IS 'Telefone do cliente';
COMMENT ON COLUMN customers.cpf IS 'CPF do cliente';
COMMENT ON COLUMN customers.address IS 'Endereço completo em formato JSON';
COMMENT ON COLUMN subscriptions.customer_id IS 'Referência aos dados do cliente';