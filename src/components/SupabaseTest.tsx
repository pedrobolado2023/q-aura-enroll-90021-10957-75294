// @ts-nocheck
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const SupabaseTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    const results = [];
    
    try {
      // Test 1: Basic Supabase connection
      results.push('🔄 Testando conexão básica...');
      setTestResults([...results]);
      
      const { data: basicTest, error: basicError } = await supabase
        .from('_realtime')
        .select('count');
      
      if (basicError) {
        results.push(`❌ Conexão básica falhou: ${basicError.message}`);
      } else {
        results.push('✅ Conexão básica OK');
      }
      
      // Test 2: Check if user_roles table exists
      results.push('🔄 Verificando tabela user_roles...');
      setTestResults([...results]);
      
      const { data: rolesTest, error: rolesError } = await supabase
        .from('user_roles')
        .select('count');
        
      if (rolesError) {
        results.push(`❌ Tabela user_roles: ${rolesError.message}`);
        if (rolesError.code === 'PGRST116') {
          results.push('💡 Tabela user_roles não existe - precisa executar migrações');
        }
      } else {
        results.push('✅ Tabela user_roles existe');
      }
      
      // Test 3: Check if profiles table exists
      results.push('🔄 Verificando tabela profiles...');
      setTestResults([...results]);
      
      const { data: profilesTest, error: profilesError } = await supabase
        .from('profiles')
        .select('count');
        
      if (profilesError) {
        results.push(`❌ Tabela profiles: ${profilesError.message}`);
        if (profilesError.code === 'PGRST116') {
          results.push('💡 Tabela profiles não existe - precisa executar migrações');
        }
      } else {
        results.push('✅ Tabela profiles existe');
      }
      
      // Test 4: Check auth
      results.push('🔄 Verificando autenticação...');
      setTestResults([...results]);
      
      const { data: authTest } = await supabase.auth.getUser();
      if (authTest.user) {
        results.push(`✅ Usuário logado: ${authTest.user.email}`);
      } else {
        results.push('⚠️ Nenhum usuário logado');
      }
      
    } catch (err) {
      results.push(`💥 Erro geral: ${err.message}`);
    }
    
    setTestResults(results);
    setLoading(false);
  };

  const createTables = async () => {
    setLoading(true);
    const results = [];
    
    try {
      results.push('🔄 Tentando criar tabelas...');
      setTestResults([...results]);
      
      // Try to create the profiles table directly
      const { error: profilesError } = await supabase.rpc('create_profiles_table');
      
      if (profilesError) {
        results.push(`❌ Erro ao criar tabelas: ${profilesError.message}`);
        results.push('💡 Você precisa executar as migrações no painel do Supabase');
        results.push('📝 Vá para: Dashboard > SQL Editor > cole o conteúdo das migrações');
      } else {
        results.push('✅ Tabelas criadas com sucesso!');
      }
      
    } catch (err) {
      results.push(`💥 Erro: ${err.message}`);
      results.push('💡 Execute as migrações manualmente no Supabase Dashboard');
    }
    
    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded max-w-md">
      <h3 className="font-bold mb-2">🔧 Diagnóstico Supabase</h3>
      <div className="space-y-2 mb-4">
        <Button onClick={testConnection} disabled={loading} size="sm">
          {loading ? 'Testando...' : 'Testar Conexão'}
        </Button>
        <Button onClick={createTables} disabled={loading} size="sm" variant="outline">
          Criar Tabelas
        </Button>
      </div>
      
      {testResults.length > 0 && (
        <div className="bg-gray-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="mb-1">{result}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;