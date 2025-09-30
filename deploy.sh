#!/bin/bash

# Script para gerar build estático para deploy no Easypanel

echo "🚀 Iniciando build estático para Easypanel..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar build de produção
echo "🔨 Gerando build de produção..."
npm run build

# Verificar se o build foi gerado com sucesso
if [ -d "dist" ]; then
    echo "✅ Build gerado com sucesso na pasta 'dist'"
    
    # Criar arquivo .htaccess para SPA routing (se necessário)
    echo "📝 Criando arquivo .htaccess..."
    cat > dist/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
EOF
    
    echo "📁 Conteúdo da pasta dist:"
    ls -la dist/
    
    echo ""
    echo "🎉 Build estático pronto para deploy!"
    echo ""
    echo "📋 Instruções para Easypanel:"
    echo "1. Compacte a pasta 'dist' em um arquivo ZIP"
    echo "2. No Easypanel, crie um novo serviço Static Site"
    echo "3. Faça upload do arquivo ZIP"
    echo "4. Configure o domínio personalizado (se necessário)"
    echo ""
    echo "📂 Arquivos gerados em: ./dist/"
else
    echo "❌ Erro: Build não foi gerado. Verifique os logs acima."
    exit 1
fi