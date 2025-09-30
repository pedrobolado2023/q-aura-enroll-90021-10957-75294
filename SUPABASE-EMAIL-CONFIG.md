# Configuração de Email no Supabase

## 📧 Configuração de Confirmação por Email

### 1. **Habilitar Confirmação por Email**
No painel do Supabase:
- Vá para **Authentication** → **Settings**
- Em **User Signups**, marque **Enable email confirmations**

### 2. **URL de Redirecionamento**
Adicione as seguintes URLs em **Redirect URLs**:
```
http://localhost:5173/auth?type=signup
https://www.q-aura.com.br/auth?type=signup
https://dados-sitesitenovo.gbz7q.easypanel.host/auth?type=signup
```

### 3. **Templates de Email**
Configure os templates em **Authentication** → **Email Templates**:

#### Template de Confirmação:
```html
<h2>Confirme seu email</h2>
<p>Clique no link abaixo para confirmar sua conta no Q-aura:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
<p>Se você não criou esta conta, ignore este email.</p>
```

### 4. **Configuração SMTP (Opcional)**
Para usar seu próprio provedor de email:
- Vá para **Settings** → **Auth**
- Configure **SMTP Settings** com seus dados

### 5. **Variáveis de Ambiente Necessárias**
```env
VITE_SUPABASE_URL=https://ptkmfeinqmisluyljlyn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a21mZWlucW1pc2x1eWxqbHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzQxMjQsImV4cCI6MjA3MTA1MDEyNH0.fJsnX8h-erc4fImqEEaw14REpWm4vcP8KP_yHvs5EWE
```

## 🔧 Funcionalidades Implementadas

- ✅ Confirmação por email obrigatória
- ✅ Reenvio de email de confirmação
- ✅ Redirecionamento após confirmação
- ✅ Interface de aguardo de confirmação
- ✅ Tratamento de erros de confirmação

## 📱 Como Funciona

1. **Usuário se cadastra** → Email de confirmação é enviado
2. **Usuário clica no link** → Redirecionado para `/auth?type=signup`
3. **Sistema confirma** → Usuário pode fazer login
4. **Se não receber** → Pode reenviar o email