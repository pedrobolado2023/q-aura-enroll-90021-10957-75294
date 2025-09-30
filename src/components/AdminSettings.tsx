// @ts-nocheck
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, Eye, EyeOff } from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showTokens, setShowTokens] = useState(false);
  const [settings, setSettings] = useState({
    mercadopago_access_token: '',
    mercadopago_public_key: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['mercadopago_access_token', 'mercadopago_public_key']);

      if (error) throw error;

      if (data) {
        const settingsObj = data.reduce((acc, item) => {
          acc[item.key] = item.value || '';
          return acc;
        }, {} as Record<string, string>);

        setSettings({
          mercadopago_access_token: settingsObj.mercadopago_access_token || '',
          mercadopago_public_key: settingsObj.mercadopago_public_key || '',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('app_settings')
          .update({ value })
          .eq('key', key);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Sistema
        </CardTitle>
        <CardDescription>
          Configure as credenciais do Mercado Pago para processar pagamentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="mercadopago_access_token">
                Mercado Pago - Access Token
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTokens(!showTokens)}
              >
                {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Input
              id="mercadopago_access_token"
              type={showTokens ? "text" : "password"}
              value={settings.mercadopago_access_token}
              onChange={(e) =>
                setSettings({ ...settings, mercadopago_access_token: e.target.value })
              }
              placeholder="APP_USR-..."
            />
            <p className="text-xs text-muted-foreground">
              Token de acesso para processar pagamentos (privado)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mercadopago_public_key">
              Mercado Pago - Public Key
            </Label>
            <Input
              id="mercadopago_public_key"
              type={showTokens ? "text" : "password"}
              value={settings.mercadopago_public_key}
              onChange={(e) =>
                setSettings({ ...settings, mercadopago_public_key: e.target.value })
              }
              placeholder="APP_USR-..."
            />
            <p className="text-xs text-muted-foreground">
              Chave pública para checkout (pode ser exposta)
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg text-sm">
          <p className="font-semibold mb-2">Como obter as credenciais:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Acesse o Mercado Pago Developers</li>
            <li>Vá em "Suas integrações" {'>'} "Criar aplicação"</li>
            <li>Configure sua aplicação</li>
            <li>Copie o Access Token e Public Key</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
