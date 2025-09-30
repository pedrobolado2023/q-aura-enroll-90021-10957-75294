# 🔧 Troubleshooting - Email de Confirmação

## ❌ Problema Relatado
- Sistema não dá erro no cadastro
- Tela de "Verifique seu Email" aparece corretamente  
- Mas o email de confirmação não chega na caixa de entrada

## 🔍 Possíveis Causas

### 1. **Confirmação por Email Desabilitada**
- No painel Supabase, Authentication → Settings
- Verificar se "Enable email confirmations" está marcado

### 2. **SMTP Não Configurado ou com Limite**
- Supabase gratuito tem limite de emails
- Pode precisar configurar SMTP próprio

### 3. **URLs de Redirecionamento Incorretas**
- Verificar se as URLs estão corretas no painel

### 4. **Email indo para Spam**
- Verificar pasta de spam/lixo eletrônico

## ✅ Soluções Passo a Passo

### **Solução 1: Verificar Configurações Básicas**

Acesse: https://supabase.com/dashboard/project/ptkmfeinqmisluyljlyn

#### Authentication → Settings:
1. ✅ Enable email confirmations
2. ✅ Adicionar URLs de redirecionamento:
   ```
   https://dados-sitesitenovo.gbz7q.easypanel.host/auth?type=signup
   http://localhost:5173/auth?type=signup
   ```

### **Solução 2: Configurar SMTP Gmail**

Se o SMTP padrão não funcionar, configure Gmail:

#### No Supabase (Settings → Auth → SMTP):
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: seu-email@gmail.com  
SMTP Pass: senha-de-app-gmail
Sender Name: Q-aura
Sender Email: seu-email@gmail.com
```

#### No Gmail:
1. Ativar verificação em 2 etapas
2. Gerar senha de aplicativo
3. Usar essa senha no SMTP

### **Solução 3: Configurar SendGrid (Recomendado)**

SendGrid oferece 100 emails gratuitos por dia:

1. Crie conta no SendGrid
2. Obtenha API Key
3. Configure no Supabase:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Pass: sua-api-key-sendgrid
   ```

### **Solução 4: Template de Email**

Personalize o template em Authentication → Email Templates:

```html
<h2>🎯 Confirme seu email - Q-aura</h2>
<p>Olá! Obrigado por se cadastrar no Q-aura!</p>
<p>Clique no botão para confirmar sua conta:</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background: #667eea; color: white; padding: 15px 30px; 
            text-decoration: none; border-radius: 8px; 
            font-weight: bold; display: inline-block;">
     ✅ Confirmar Email
  </a>
</p>
<p>Se não foi você, ignore este email.</p>
```

## 🚨 Checklist de Verificação

- [ ] Email confirmations habilitado no Supabase
- [ ] URLs de redirecionamento configuradas
- [ ] SMTP configurado (próprio ou padrão)
- [ ] Template de email ativo
- [ ] Verificar pasta de spam
- [ ] Testar com email diferente
- [ ] Verificar logs do Supabase

## 📞 Suporte

Se ainda não funcionar:
1. Verificar logs em Supabase → Logs
2. Testar com provedor SMTP diferente
3. Contatar suporte do Supabase se necessário