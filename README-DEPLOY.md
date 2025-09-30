# 🚀 Deploy para Easypanel

Este guia explica como fazer deploy do seu site estático no Easypanel.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Acesso ao Easypanel
- Domínio configurado (opcional)

## 🔧 Preparação do Build

### 1. Gerar Build Estático

Execute o script de deploy incluído:

```bash
chmod +x deploy.sh
./deploy.sh
```

Ou manualmente:

```bash
npm install
npm run build
```

### 2. Verificar Arquivos

O build gera uma pasta `dist/` com todos os arquivos estáticos:
- `index.html` - Página principal
- `assets/` - CSS, JS e imagens otimizadas
- `.htaccess` - Configuração para SPA routing

## 📤 Deploy no Easypanel

### Opção 1: Upload Manual

1. **Compactar pasta dist:**
   ```bash
   cd dist && zip -r ../site-static.zip . && cd ..
   ```

2. **No Easypanel:**
   - Criar novo serviço → **Static Site**
   - Upload do arquivo `site-static.zip`
   - Aguardar deploy automático

### Opção 2: Git Deploy (Recomendado)

1. **Subir código para repositório Git**

2. **No Easypanel:**
   - Criar novo serviço → **Static Site**
   - Conectar repositório GitHub/GitLab
   - Configurar build:
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

## ⚙️ Configurações Importantes

### Variáveis de Ambiente

Se usar funcionalidades backend, configure:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publica
```

### Configuração de Domínio

1. No Easypanel, vá em **Domains**
2. Adicione seu domínio personalizado
3. Configure DNS para apontar para Easypanel

### Configuração SSL

- SSL automático via Let's Encrypt
- Redirecionamento HTTPS automático

## 🔄 Atualizações

### Deploy Manual
1. Executar `./deploy.sh`
2. Upload do novo ZIP no Easypanel

### Deploy Automático (Git)
- Push para branch principal
- Deploy automático no Easypanel

## 🐛 Troubleshooting

### Problema: Rotas 404
**Solução:** Verificar se `.htaccess` foi incluído no build

### Problema: Assets não carregam
**Solução:** Verificar configuração de base URL no `vite.config.ts`

### Problema: Funcionalidades backend não funcionam
**Solução:** Verificar variáveis de ambiente e configuração do Supabase

## 📊 Monitoramento

No Easypanel você pode monitorar:
- Tráfico e bandwidth
- Uptime e performance
- Logs de acesso
- Métricas de CDN

## 🔐 Sistema de Administrador

### Configuração Inicial

1. **Primeiro usuário admin:**
   - Registre-se normalmente no site
   - Acesse o backend do Lovable Cloud
   - Execute SQL manualmente:
   ```sql
   UPDATE user_roles 
   SET role = 'admin' 
   WHERE user_id = 'seu_user_id_aqui';
   ```

2. **Acessar painel admin:**
   - Login no site
   - Ir para `/admin`
   - Gerenciar outros usuários

### Funcionalidades Admin

- ✅ Visualizar todos os usuários
- ✅ Alterar roles (admin/usuário)
- ✅ Estatísticas básicas
- ✅ Proteção por autenticação

## 📝 Notas Importantes

- Site é **100% estático** após build
- Funcionalidades dinâmicas dependem do Supabase
- Autenticação funciona via Supabase Auth
- Cache automático de assets estáticos

## 🆘 Suporte

Em caso de problemas:
1. Verificar logs no Easypanel
2. Testar build localmente
3. Validar configurações de ambiente
4. Conferir documentação do Easypanel