import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation, useNavigate } from "react-router-dom";
import { Copy, Check, QrCode, ArrowLeft, Clock, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PagamentoPix = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const { 
    qrCode, 
    qrCodeBase64, 
    paymentId, 
    amount = 9.90, 
    subscriptionId,
    customerData,
    paymentMethod
  } = location.state || {};

  // PIX estático para demonstração (em produção, seria gerado dinamicamente)
  const pixStaticCode = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-42665544000027040000530398654049.905802BR5925QAURA EDUCACIONAL LTDA6009SAO PAULO61080540900062070503***6304";

  useEffect(() => {
    // Se não tem dados de pagamento, usar dados estáticos para demonstração
    if (!subscriptionId && !qrCode) {
      console.log('⚠️ Página PIX acessada sem dados de pagamento');
    }
  }, [subscriptionId, qrCode, navigate]);

  const copyToClipboard = async () => {
    const textToCopy = qrCode || pixStaticCode;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu banco ou app de pagamentos",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro ao copiar",
        description: "Tente copiar manualmente o código PIX",
        variant: "destructive"
      });
    }
  };

  const handleBackToPayment = () => {
    navigate('/assinar');
  };

  const generateQRCodeUrl = () => {
    if (qrCodeBase64) {
      return `data:image/png;base64,${qrCodeBase64}`;
    }
    
    // Gerar QR Code usando serviço online como fallback
    const pixCode = qrCode || pixStaticCode;
    const encodedPix = encodeURIComponent(pixCode);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedPix}`;
  };

  const simulatePaymentSuccess = async () => {
    if (!subscriptionId) {
      toast({
        title: "Pagamento simulado",
        description: "Em produção, o pagamento seria verificado automaticamente",
      });
      setTimeout(() => navigate('/?payment=success'), 2000);
      return;
    }

    setLoading(true);
    try {
      // Simular verificação de pagamento
      console.log('🔄 Simulando verificação de pagamento PIX...');
      
      // Atualizar status da subscription
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'active',
          payment_id: paymentId || 'pix_simulated_' + Date.now()
        })
        .eq('id', subscriptionId);

      if (error) {
        console.error('Erro ao atualizar subscription:', error);
        throw error;
      }

      toast({
        title: "Pagamento confirmado!",
        description: "Sua assinatura foi ativada com sucesso!",
      });

      // Redirecionar para sucesso
      setTimeout(() => {
        navigate('/?payment=success&subscription=' + subscriptionId);
      }, 2000);

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao processar",
        description: "Tente novamente ou entre em contato",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={handleBackToPayment}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <Card className="border-2 shadow-glow">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <QrCode className="h-8 w-8 text-primary" />
              Pagamento via PIX
            </CardTitle>
            <CardDescription className="text-lg">
              Escaneie o QR Code ou copie o código PIX para finalizar seu pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg shadow-inner mb-4 inline-block">
                <img 
                  src={generateQRCodeUrl()} 
                  alt="QR Code PIX" 
                  className="w-64 h-64 mx-auto"
                  onError={(e) => {
                    console.error('Erro ao carregar QR Code');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Valor: <span className="font-bold text-primary">R$ {amount.toFixed(2)}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Label htmlFor="pix-code" className="text-sm font-medium mb-2 block">
                  Código PIX (Copia e Cola):
                </Label>
                <div className="flex gap-2">
                  <Input 
                    id="pix-code"
                    value={qrCode || pixStaticCode}
                    readOnly 
                    className="flex-1 bg-white text-xs"
                  />
                  <Button 
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Como pagar:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Abra o app do seu banco</li>
                      <li>Escaneie o QR Code ou cole o código PIX</li>
                      <li>Confirme o pagamento de R$ {amount.toFixed(2)}</li>
                      <li>Aguarde a confirmação automática</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Prazo de pagamento:</p>
                    <p className="text-xs">Este PIX expira em 30 minutos. Após o pagamento, sua assinatura será ativada automaticamente.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={simulatePaymentSuccess}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Verificando..." : "✅ Simular Pagamento (Teste)"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleBackToPayment}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                🔒 Pagamento seguro processado pelo Mercado Pago
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
            <CardTitle className="text-2xl mb-2 flex items-center justify-center">
              <QrCode className="mr-2 h-6 w-6 text-primary" />
              Pagamento PIX
            </CardTitle>
            <CardDescription className="text-lg">
              Escaneie o QR Code ou copie o código PIX
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Valor a pagar</div>
              <div className="text-3xl font-bold text-primary">R$ {amount?.toFixed(2) || '9,90'}</div>
              <div className="text-sm text-muted-foreground">Assinatura Q-aura - Plano Mensal</div>
            </div>

            {qrCodeBase64 && (
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                  <img 
                    src={`data:image/png;base64,${qrCodeBase64}`} 
                    alt="QR Code PIX" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Abra o app do seu banco e escaneie o QR Code
                </p>
              </div>
            )}

            {qrCode && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Código PIX Copia e Cola:</label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                      {qrCode}
                    </div>
                    <Button
                      onClick={copyToClipboard}
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground">Instruções:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abra o app do seu banco ou carteira digital</li>
                <li>Escolha a opção PIX</li>
                <li>Escaneie o QR Code ou cole o código</li>
                <li>Confirme o pagamento de R$ {amount?.toFixed(2) || '9,90'}</li>
                <li>Aguarde a confirmação (pode levar alguns minutos)</li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">⏰ Importante:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Este PIX é válido por 30 minutos</li>
                <li>• Após o pagamento, sua assinatura será ativada automaticamente</li>
                <li>• Você receberá um email de confirmação</li>
                <li>• Em caso de problemas, entre em contato conosco</li>
              </ul>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                className="w-full"
              >
                Já paguei - Ir para o painel
              </Button>
            </div>

            {paymentId && (
              <div className="text-xs text-muted-foreground text-center">
                ID do Pagamento: {paymentId}
                {subscriptionId && <> | Subscription: {subscriptionId}</>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PagamentoPix;