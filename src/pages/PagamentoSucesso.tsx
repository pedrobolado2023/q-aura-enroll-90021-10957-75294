// @ts-nocheck
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home } from 'lucide-react';

const PagamentoSucesso = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title
    document.title = 'Pagamento Aprovado - Q-aura';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            Pagamento Aprovado!
          </CardTitle>
          <CardDescription>
            Sua assinatura do Q-aura foi ativada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Você já pode começar a usar todos os recursos do Q-aura. 
            Bem-vindo ao melhor sistema de estudos via WhatsApp!
          </p>
          
          <div className="space-y-2">
            <p className="text-sm font-semibold">Próximos passos:</p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• Acesse sua área do usuário</li>
              <li>• Configure seu perfil de estudos</li>
              <li>• Comece a receber conteúdo via WhatsApp</li>
            </ul>
          </div>

          <Button 
            onClick={() => navigate('/')}
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Voltar ao Site
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagamentoSucesso;