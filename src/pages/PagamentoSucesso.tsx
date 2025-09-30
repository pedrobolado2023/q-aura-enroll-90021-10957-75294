import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Download } from 'lucide-react';

const PagamentoSucesso = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { method, amount } = location.state || { method: 'pix', amount: 9.90 };

  useEffect(() => {
    // Set page title
    document.title = 'Pagamento Aprovado - Q-aura';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <Card className="border-2 shadow-glow text-center">
          <CardHeader className="pb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl mb-2 text-green-600">
              Pagamento Realizado com Sucesso!
            </CardTitle>
            <CardDescription className="text-lg">
              {method === 'pix' 
                ? 'Seu PIX foi processado e sua assinatura está ativa!'
                : 'Seu pagamento foi aprovado e sua assinatura está ativa!'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Detalhes da Assinatura</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Plano:</span>
                  <span className="font-medium">Q-aura Mensal</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor:</span>
                  <span className="font-medium">R$ {amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método de Pagamento:</span>
                  <span className="font-medium">
                    {method === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">Ativo</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📱 Próximos Passos</h4>
              <p className="text-sm text-blue-700">
                Em breve você receberá no seu WhatsApp cadastrado o acesso ao conteúdo exclusivo do Q-aura.
                Fique atento às mensagens!
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold">Próximos passos:</p>
              <ul className="text-sm text-muted-foreground text-left space-y-1">
                <li>• Acesse sua área do usuário</li>
                <li>• Configure seu perfil de estudos</li>
                <li>• Comece a receber conteúdo via WhatsApp</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => navigate('/')}
                variant="hero"
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
              
              <Button 
                onClick={() => window.print()}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Salvar Comprovante
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-4">
              <p>
                Dúvidas? Entre em contato conosco pelo WhatsApp ou e-mail.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PagamentoSucesso;