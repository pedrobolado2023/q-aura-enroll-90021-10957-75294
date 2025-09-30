// @ts-nocheck
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const PagamentoErro = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title
    document.title = 'Erro no Pagamento - Q-aura';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-700">
            Erro no Pagamento
          </CardTitle>
          <CardDescription>
            Não foi possível processar seu pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Houve um problema ao processar seu pagamento. 
            Não se preocupe, nenhum valor foi cobrado.
          </p>
          
          <div className="space-y-2">
            <p className="text-sm font-semibold">Possíveis causas:</p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• Dados do cartão incorretos</li>
              <li>• Limite insuficiente</li>
              <li>• Problemas temporários no sistema</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/assinar')}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagamentoErro;