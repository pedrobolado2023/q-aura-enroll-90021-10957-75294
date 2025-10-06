import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation, useNavigate } from "react-router-dom";
import { Copy, Check, QrCode, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PagamentoPix = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { 
    amount = 9.90, 
    subscriptionId, 
    qrCode, 
    qrCodeBase64, 
    paymentId,
    customerData,
    paymentMethod 
  } = location.state || {};
  
  // Usar código PIX real do Mercado Pago se disponível, senão usar fallback
  const pixCode = qrCode || "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-42665544000027040000530398654049.905802BR5925QAURA EDUCACIONAL LTDA6009SAO PAULO61080540900062070503***6304";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu banco ou app de pagamentos",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente copiar manualmente",
        variant: "destructive"
      });
    }
  };

  const generateQRCodeUrl = () => {
    // Se temos QR Code base64 do Mercado Pago, usar ele
    if (qrCodeBase64) {
      return `data:image/png;base64,${qrCodeBase64}`;
    }
    
    // Senão, gerar QR Code a partir do código PIX
    const encodedPix = encodeURIComponent(pixCode);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedPix}`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/assinar')}
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
              Escaneie o QR Code ou copie o código PIX
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg shadow-inner mb-4 inline-block">
                <img 
                  src={generateQRCodeUrl()} 
                  alt="QR Code PIX" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Valor: <span className="font-bold text-primary">R$ {amount.toFixed(2)}</span>
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <Label htmlFor="pix-code" className="text-sm font-medium mb-2 block">
                Código PIX (Copia e Cola):
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="pix-code"
                  value={pixCode}
                  readOnly 
                  className="flex-1 bg-white text-xs"
                />
                <Button 
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => navigate('/?payment=success')}
                className="w-full"
              >
                ✅ Simular Pagamento Aprovado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PagamentoPix;