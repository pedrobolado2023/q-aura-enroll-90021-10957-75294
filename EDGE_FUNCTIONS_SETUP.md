# Edge Functions do Supabase - Q-aura

## 📋 **Funções Criadas:**

### 1. `create-mercadopago-preference`
- **Função**: Criar preferência de pagamento no Mercado Pago
- **Método**: POST
- **Endpoint**: `/functions/v1/create-mercadopago-preference`

### 2. `mercadopago-webhook`
- **Função**: Receber notificações de pagamento do Mercado Pago
- **Método**: POST
- **Endpoint**: `/functions/v1/mercadopago-webhook`

## 🚀 **Como Fazer Deploy das Edge Functions:**

### **Pré-requisitos:**
1. Instalar Supabase CLI: `npm install -g @supabase/cli`
2. Fazer login: `supabase login`
3. Linkar projeto: `supabase link --project-ref ptkmfeinqmisluyljlyn`

### **Deploy das Funções:**
```bash
# Deploy todas as funções
supabase functions deploy

# Ou deploy individual
supabase functions deploy create-mercadopago-preference
supabase functions deploy mercadopago-webhook
```

### **Configurar Variáveis de Ambiente:**
No Supabase Dashboard > Settings > Edge Functions:
- `SUPABASE_URL`: https://ptkmfeinqmisluyljlyn.supabase.co
- `SUPABASE_ANON_KEY`: [sua chave anônima]
- `SUPABASE_SERVICE_ROLE_KEY`: [sua chave de serviço]

## 🔧 **Configuração do Mercado Pago:**

### **1. No Painel Admin do Site:**
- Configurar `mercadopago_access_token`
- Configurar `mercadopago_public_key`

### **2. No Mercado Pago Dashboard:**
- Configurar webhook URL: `https://ptkmfeinqmisluyljlyn.supabase.co/functions/v1/mercadopago-webhook`
- Eventos: `payment`

## ⚠️ **IMPORTANTE:**

**Se não conseguir fazer deploy das Edge Functions:**

### **Alternativa Temporária:**
Comentar a chamada da Edge Function e usar redirecionamento direto:

```typescript
// Em src/pages/Assinar.tsx, substitua:
const { data, error } = await supabase.functions.invoke('create-mercadopago-preference', {
  body: formData,
});

// Por:
// Redirecionamento direto para Mercado Pago
window.location.href = 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=SEU_PREFERENCE_ID';
```

## 🧪 **Como Testar:**

1. **Deploy das funções** (se possível)
2. **Configurar tokens** do Mercado Pago no admin
3. **Testar** o fluxo de pagamento
4. **Verificar** logs das funções no Supabase Dashboard

## 📚 **Documentação:**
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Mercado Pago API](https://www.mercadopago.com.br/developers/pt/reference)