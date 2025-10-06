import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Lock, ChevronLeft, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const Assinar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Estados principais
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados do formulário - Dados do cliente
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    cpf: '',
    birthDate: '',
    address: ''
  });

  // Estados do cartão
  const [cardholderName, setCardholderName] = useState('');

  const validateCustomerData = () => {
    const requiredFields = [
      { field: 'name', label: 'Nome completo' },
      { field: 'email', label: 'E-mail' },
      { field: 'phone', label: 'Telefone' },
      { field: 'whatsapp', label: 'WhatsApp' },
      { field: 'cpf', label: 'CPF' }
    ];
    
    for (const { field, label } of requiredFields) {
      if (!customerData[field as keyof typeof customerData]?.trim()) {
        return {
          isValid: false,
          message: `Por favor, preencha o campo: ${label}`
        };
      }
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      return {
        isValid: false,
        message: 'Por favor, insira um e-mail válido'
      };
    }

    // Validação básica de CPF (apenas verificar se tem 11 dígitos)
    const cpfNumbers = customerData.cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      return {
        isValid: false,
        message: 'Por favor, insira um CPF válido com 11 dígitos'
      };
    }

    return { isValid: true, message: '' };
  };

  const handlePayment = async (paymentData: any) => {
    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando processamento de pagamento:', paymentData.method);
      
      // 🔐 CRÍTICO: Validar autenticação do usuário PRIMEIRO
      console.log('🔍 Validando usuário autenticado:', {
        user_exists: !!user,
        user_id: user?.id,
        user_email: user?.email
      });
      
      if (!user?.id) {
        throw new Error('Usuário não autenticado! Faça login antes de continuar.');
      }

      // Validar dados do cliente
      const validation = validateCustomerData();
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // 💾 Preparar dados para inserção na tabela subscriptions
      const subscriptionData = {
        user_id: user.id, // ← CRÍTICO: não pode ser null
        amount: 9.90,
        status: 'pending',
        payment_method: paymentData.method,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      };

      console.log('💾 Dados sendo inseridos na tabela subscriptions:', subscriptionData);

      // 💾 INSERÇÃO REAL NA TABELA SUBSCRIPTIONS
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (subscriptionError) {
        console.error('❌ Erro ao criar subscription:', subscriptionError);
        throw new Error(`Erro ao salvar dados da assinatura: ${subscriptionError.message}`);
      }

      console.log('✅ Subscription criada com sucesso:', subscription);

      // 🏦 INTEGRAÇÃO REAL COM MERCADO PAGO
      console.log('💳 Iniciando pagamento real no Mercado Pago...');
      
      const paymentBody = {
        transaction_amount: 9.90,
        description: 'Assinatura Q-aura - Plano Mensal',
        payment_method_id: paymentData.method === 'pix' ? 'pix' : 'visa',
        payer: {
          email: customerData.email,
          first_name: customerData.name.split(' ')[0],
          last_name: customerData.name.split(' ').slice(1).join(' ') || 'Usuario',
          identification: {
            type: 'CPF',
            number: customerData.cpf.replace(/\D/g, '')
          }
        }
      };

      // 🔑 CONFIGURAÇÃO DAS CHAVES MERCADO PAGO
      // Primeiro tenta pegar das variáveis de ambiente, depois usa fallback
      const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-1ce19553-fcdd-469b-9e00-2bdf113f1035';
      const accessToken = import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-778407631893036-092213-cc300b09f44f7942b7eb772a9ad40c6e-142018015';
      
      console.log('🔑 Chaves Mercado Pago configuradas:', {
        publicKeySource: import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY ? 'env' : 'fallback',
        accessTokenSource: import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN ? 'env' : 'fallback',
        publicKeyPrefix: publicKey.substring(0, 15),
        accessTokenPrefix: accessToken.substring(0, 15)
      });
      
      // Validação básica das chaves
      if (!publicKey || !accessToken || publicKey === 'TEST-your-public-key-here' || accessToken === 'TEST-your-access-token-here') {
        console.error('❌ Chaves do Mercado Pago inválidas');
        
        toast({
          title: "Erro de Configuração",
          description: "Chaves do Mercado Pago não configuradas corretamente",
          variant: "destructive",
        });
        
        return;
      }

      // Fazer requisição real para o Mercado Pago
      console.log('🚀 Enviando pagamento para Mercado Pago...');
      
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Idempotency-Key': `${subscription.id}-${Date.now()}`
        },
        body: JSON.stringify(paymentBody)
      });

      const paymentResult = await response.json();
      console.log('💰 Resposta do Mercado Pago:', paymentResult);

      if (!response.ok) {
        throw new Error(`Erro no Mercado Pago: ${paymentResult.message || 'Erro desconhecido'}`);
      }

      // Processar resposta baseada no método de pagamento
      if (paymentData.method === 'pix') {
        // Para PIX, mostrar QR Code
        const qrCode = paymentResult.point_of_interaction?.transaction_data?.qr_code;
        const qrCodeBase64 = paymentResult.point_of_interaction?.transaction_data?.qr_code_base64;
        
        if (qrCode || qrCodeBase64) {
          console.log('🎯 PIX gerado com sucesso!');
          
          toast({
            title: "PIX Gerado com Sucesso!",
            description: "Use o QR Code ou código PIX para finalizar o pagamento",
          });

          // Redirecionar para página de PIX com dados
          navigate('/pagamento-pix', { 
            state: { 
              qrCode,
              qrCodeBase64,
              paymentId: paymentResult.id,
              amount: 9.90,
              subscriptionId: subscription.id
            } 
          });
        } else {
          throw new Error('QR Code PIX não foi gerado');
        }
        
      } else {
        // Para cartão, verificar se foi aprovado
        if (paymentResult.status === 'approved') {
          console.log('✅ Pagamento no cartão aprovado!');
          
          toast({
            title: "Pagamento Aprovado!",
            description: "Sua assinatura foi ativada com sucesso!",
          });

          // Redirecionar para sucesso
          navigate('/pagamento-sucesso', { 
            state: { 
              method: 'card',
              amount: 9.90,
              paymentId: paymentResult.id,
              subscriptionId: subscription.id
            } 
          });
        } else {
          throw new Error(`Pagamento não aprovado: ${paymentResult.status_detail}`);
        }
      }

    } catch (error: any) {
      console.error('❌ Erro no pagamento:', error);
      
      let errorMessage = "Não foi possível processar o pagamento. Tente novamente.";
      
      if (error.message?.includes('não autenticado')) {
        errorMessage = "Você precisa estar logado para fazer uma assinatura. Faça login e tente novamente.";
      } else if (error.message?.includes('Mercado Pago')) {
        errorMessage = `Erro no processamento: ${error.message}`;
      } else if (error.message?.includes('CPF')) {
        errorMessage = "CPF inválido. Verifique os dados informados.";
      } else if (error.message?.includes('email')) {
        errorMessage = "E-mail inválido. Verifique o formato do e-mail.";
      }
      
      toast({
        title: "Erro no Pagamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerData({
      ...customerData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <Card className="border-2 shadow-glow">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl mb-2">
              Assine o{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">Q-aura</span>
            </CardTitle>
            <CardDescription className="text-lg">
              Preencha seus dados para começar sua jornada de estudos
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-primary" />
                    Seus Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={customerData.name}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={customerData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        type="text"
                        value={customerData.cpf}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={customerData.phone}
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        value={customerData.whatsapp}
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        value={customerData.birthDate}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Endereço Completo</Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        value={customerData.address}
                        onChange={handleChange}
                        placeholder="Rua, número, bairro, cidade, estado"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <Button 
                    onClick={() => {
                      const validation = validateCustomerData();
                      if (validation.isValid) {
                        setStep(2);
                      } else {
                        toast({
                          title: "Dados incompletos",
                          description: validation.message,
                          variant: "destructive",
                        });
                      }
                    }}
                    className="w-full"
                    size="lg"
                  >
                    Continuar para Pagamento
                    <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep(1)}
                    className="mb-4"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Voltar aos Dados
                  </Button>
                  
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-primary" />
                    Escolha a Forma de Pagamento
                  </h3>
                  
                  <div className="bg-muted/50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Plano Mensal Q-aura</p>
                        <p className="text-sm text-muted-foreground">Acesso completo à plataforma</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">R$ 9,90</p>
                        <p className="text-sm text-muted-foreground">/mês</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <Button
                      onClick={() => handlePayment({ method: 'pix' })}
                      disabled={isProcessing}
                      className="w-full h-16 text-left justify-start relative overflow-hidden"
                      variant="outline"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <span className="text-xs font-bold">PIX</span>
                        </div>
                        <div>
                          <p className="font-medium">PIX</p>
                          <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => {
                        if (!cardholderName.trim()) {
                          toast({
                            title: "Nome no cartão obrigatório",
                            description: "Por favor, preencha o nome que está no cartão",
                            variant: "destructive",
                          });
                          return;
                        }
                        handlePayment({ method: 'card' });
                      }}
                      disabled={isProcessing}
                      className="w-full h-16 text-left justify-start"
                      variant="outline"
                    >
                      <div className="flex items-center space-x-4">
                        <CreditCard className="h-6 w-6" />
                        <div>
                          <p className="font-medium">Cartão de Crédito</p>
                          <p className="text-sm text-muted-foreground">Mastercard, Visa, Elo</p>
                        </div>
                      </div>
                    </Button>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="cardholderName">Nome no Cartão (obrigatório para cartão)</Label>
                    <Input
                      id="cardholderName"
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Nome exatamente como está no cartão"
                    />
                  </div>

                  {isProcessing && (
                    <div className="text-center p-4">
                      <div className="inline-flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Processando pagamento...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Lock className="mr-2 h-4 w-4" />
                  Pagamento 100% seguro e criptografado
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assinar;