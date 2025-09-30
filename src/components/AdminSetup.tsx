import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminSetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const makeAdmin = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRole) {
        if (existingRole.role === 'admin') {
          toast({
            title: "Você já é administrador!",
            description: "Recarregue a página para ver as opções de admin.",
          });
        } else {
          // Update existing role to admin
          const { error } = await supabase
            .from('user_roles')
            .update({ role: 'admin' })
            .eq('user_id', user.id);

          if (error) throw error;

          toast({
            title: "Sucesso!",
            description: "Você agora é administrador. Recarregue a página.",
          });
        }
      } else {
        // Insert new admin role
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: user.id, role: 'admin' }]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Você agora é administrador. Recarregue a página.",
        });
      }
      
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error making admin:', error);
      toast({
        title: "Erro",
        description: "Erro ao configurar administrador",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12 text-yellow-600" />
          </div>
          <CardTitle className="text-yellow-800 dark:text-yellow-200">
            Configuração Inicial
          </CardTitle>
          <CardDescription className="text-yellow-700 dark:text-yellow-300">
            Como você é o primeiro usuário, pode se tornar administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Email: <strong>{user.email}</strong>
          </p>
          
          <Button 
            onClick={makeAdmin}
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {loading ? (
              <>
                <Shield className="mr-2 h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Tornar-me Administrador
              </>
            )}
          </Button>
          
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            Após se tornar admin, você poderá gerenciar outros usuários
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;