#!/bin/bash

# Script para gerar build estático para deploy no Easypanel

echo "🚀 Iniciando build estático para Easypanel..."

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  ATENÇÃO: Arquivo .env não encontrado!"
    echo "   Copie .env.example para .env e configure suas variáveis."
    echo "   Ou configure as variáveis diretamente no EasyPanel."
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar build de produção
echo "🔨 Gerando build de produção..."
npm run build

# Verificar se o build foi gerado com sucesso
if [ -d "dist" ]; then
    echo "✅ Build gerado com sucesso na pasta 'dist'"
    
    # Verificar se _redirects existe (para SPA routing)
    if [ -f "dist/_redirects" ]; then
        echo "✅ Arquivo _redirects encontrado para SPA routing"
    else
        echo "⚠️  Adicionando arquivo _redirects para SPA routing..."
        echo "/*    /index.html   200" > dist/_redirects
    fi
    
    echo "📁 Conteúdo da pasta dist:"
    ls -la dist/
    
    echo ""
    echo "🎉 Build estático pronto para deploy!"
    echo ""
    echo "📋 Instruções para EasyPanel:"
    echo "1. Crie um novo serviço → Static Site"
    echo "2. Configure o repositório Git OU faça upload manual"
    echo "3. Configure build command: 'npm run build'"
    echo "4. Configure output directory: 'dist'"
    echo "5. Adicione variáveis de ambiente:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_PUBLISHABLE_KEY"
    echo ""
    echo "📂 Arquivos gerados em: ./dist/"
else
    echo "❌ Erro: Build não foi gerado. Verifique os logs acima."
    exit 1
fi