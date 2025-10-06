# 🏦 Configuração do Mercado Pago - Integração Real

## 🎯 Solução Implementada

✅ **Integração real com Mercado Pago**
✅ **Pagamentos reais (PIX e Cartão)**
✅ **Recebimento direto na sua conta**
✅ **Validação de usuário autenticado**
✅ **Tratamento de erros adequado**

## 📋 Pré-requisitos

1. **Conta no Mercado Pago**
   - Criar conta em: https://www.mercadopago.com.br/
   - Completar verificação da conta
   - Acessar o Painel de Desenvolvedores

2. **Chaves de API**
   - Public Key (para frontend)
   - Access Token (para backend/servidor)

## 🔑 Como Obter as Chaves do Mercado Pago

### 1. Acesse o Painel de Desenvolvedores
- Vá para: https://www.mercadopago.com.br/developers/
- Faça login na sua conta
- Clique em "Suas integrações"

### 2. Criar uma Aplicação
- Clique em "Criar aplicação"
- Escolha "Pagamentos online"
- Preencha nome da aplicação: "Q-aura Site"
- Selecione modelo de negócio adequado

### 3. Obter as Chaves

#### **Para Desenvolvimento (TEST):**
- Public Key: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Access Token: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

#### **Para Produção (PROD):**
- Public Key: `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Access Token: `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## ⚙️ Configuração Local

### 1. Editar arquivo `.env`
```bash
# Mercado Pago Configuration
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-chave-publica-aqui
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-sua-chave-privada-aqui
```

### 2. Exemplo com chaves reais:
```bash
# DESENVOLVIMENTO
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-12345678-1234-1234-1234-123456789012
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-12345678-1234-1234-1234-123456789012

# PRODUÇÃO (quando for publicar)
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-12345678-1234-1234-1234-123456789012
VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-12345678-1234-1234-1234-123456789012
```

## 🚀 Aplicar Migração do Banco

### 1. Via Supabase CLI
```bash
supabase db push
```

### 2. Via SQL Editor (Supabase Dashboard)
Execute o conteúdo do arquivo:
`supabase/migrations/20251001000000_create_subscriptions_table.sql`

### 3. Recarregar Schema Cache
```sql
NOTIFY pgrst, 'reload schema';
```

## 🔧 Ativar Inserção Real no Banco

No arquivo `src/pages/Assinar.tsx`, descomente as linhas de inserção real:

```typescript
// DESCOMENTE estas linhas:
const { data: subscription, error: subscriptionError } = await supabase
  .from('subscriptions')
  .insert(subscriptionData)
  .select()
  .single();

if (subscriptionError) {
  console.error('❌ Erro ao criar subscription:', subscriptionError);
  throw new Error(`Erro ao salvar dados da assinatura: ${subscriptionError.message}`);
}

console.log('✅ Subscription criada com sucesso:', subscription);

// COMENTE estas linhas:
// console.log('⚠️ Simulando inserção (aplicar migração primeiro)');
// const subscription = { id: `sub_${Date.now()}` };
// console.log('✅ Subscription simulada criada:', subscription);
```

## 🎯 Testando a Integração

### 1. Reiniciar o servidor
```bash
npm run dev
```

### 2. Testar o Fluxo
1. Acesse: http://localhost:8081/assinar
2. Preencha todos os dados
3. **FAÇA LOGIN** antes de tentar pagar
4. Escolha método de pagamento:
   - **PIX**: Gerará QR Code real
   - **Cartão**: Processará pagamento real

### 3. Logs Esperados
```
🔄 Iniciando processamento de pagamento: pix
🔍 Validando usuário autenticado: { user_exists: true, user_id: "uuid" }
💾 Dados sendo inseridos na tabela subscriptions: { user_id: "uuid", amount: 9.90 }
✅ Subscription criada com sucesso: { id: "sub_id" }
🏦 Iniciando pagamento real no Mercado Pago...
🚀 Enviando pagamento para Mercado Pago...
💰 Resposta do Mercado Pago: { id: "payment_id", status: "pending" }
🎯 PIX gerado com sucesso!
```

## 💰 Recebimento dos Pagamentos

### PIX
- **Recebimento**: Instantâneo na sua conta MP
- **Taxa**: ~1% do valor
- **Disponibilização**: Imediata

### Cartão de Crédito
- **Recebimento**: 1-2 dias úteis
- **Taxa**: ~3.99% + R$0,40
- **Parcelamento**: Disponível (configurável)

## 🔒 Segurança

### Chaves de Desenvolvimento vs Produção
- **TEST**: Não processa pagamentos reais
- **PROD**: Processa pagamentos reais

### Variáveis de Ambiente
- Nunca commitar chaves reais no Git
- Usar variáveis de ambiente sempre
- Separar chaves de DEV e PROD

## 🌐 Deploy em Produção

### 1. EasyPanel / Vercel / Netlify
Configurar as variáveis de ambiente:
```
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua-chave-prod
VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-sua-chave-prod
```

### 2. Webhook (Opcional)
Para confirmar pagamentos automaticamente, configure webhook:
- URL: `https://seusite.com/api/webhook/mercadopago`
- Eventos: `payment.created`, `payment.updated`

## 📊 Monitoramento

### Dashboard Mercado Pago
- Vendas em tempo real
- Relatórios financeiros
- Gestão de disputas
- Analytics de conversão

### Logs da Aplicação
- Todos os pagamentos são logados
- IDs de transação rastreáveis
- Erros detalhados para debug

## ❓ Troubleshooting

### "Chaves não configuradas"
- Verificar arquivo `.env`
- Confirmar que não contém 'your' no valor
- Reiniciar servidor após alterar

### "Erro 401 Unauthorized"
- Access Token inválido
- Verificar se é a chave correta (TEST/PROD)
- Confirmar permissões da aplicação MP

### "Erro 400 Bad Request"
- Dados inválidos (CPF, email)
- Validar campos obrigatórios
- Verificar formato dos dados

## 🎉 Resultado Final

Com esta configuração, você terá:
- ✅ Pagamentos reais processados
- ✅ Recebimento direto na sua conta MP
- ✅ Interface completa para PIX e Cartão
- ✅ Validação robusta de usuários
- ✅ Banco de dados estruturado
- ✅ Logs detalhados para monitoramento

**O sistema estará pronto para receber pagamentos reais e gerar receita!** 💰