import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Copy, Check, QrCode, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PagamentoPix = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { qrCode, qrCodeBase64, paymentId, amount, subscriptionId } = location.state || {};

  useEffect(() => {
    if (!qrCode && !qrCodeBase64) {
      navigate('/assinar');
    }
  }, [qrCode, qrCodeBase64, navigate]);

  const copyToClipboard = async () => {
    if (qrCode) {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu banco ou app de pagamentos",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!qrCode && !qrCodeBase64) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/assinar")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <Card className="border-2 shadow-glow">
          <CardHeader className="text-center">
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