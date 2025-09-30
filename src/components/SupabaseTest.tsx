// @ts-nocheck
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const SupabaseTest = () => {
  const [testResult, setTestResult] = useState('');

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase.from('user_roles').select('count').limit(1);
      
      if (error) {
        console.error('Supabase error:', error);
        setTestResult(`Erro: ${error.message}`);
      } else {
        console.log('Supabase connection successful:', data);
        setTestResult('Conexão com Supabase OK!');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setTestResult(`Erro de conexão: ${err.message}`);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3>Teste de Conexão Supabase</h3>
      <Button onClick={testConnection}>Testar Conexão</Button>
      {testResult && <p className="mt-2">{testResult}</p>}
    </div>
  );
};

export default SupabaseTest;