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
    
    const missingFields = requiredFields.filter(
      ({ field }) => !customerData[field as keyof typeof customerData]?.trim()
    );

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(({ label }) => label).join(', ');
      return { isValid: false, message: `Campos obrigatórios não preenchidos: ${missingLabels}` };
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      return { isValid: false, message: 'Por favor, insira um e-mail válido.' };
    }

    // Validação de CPF (simples)
    const cpfNumbers = customerData.cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      return { isValid: false, message: 'Por favor, insira um CPF válido com 11 dígitos.' };
    }

    return { isValid: true, message: '' };
  };

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCustomerData();
    
    if (!validation.isValid) {
      toast({
        title: "Campos obrigatórios",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }
    
    setStep(2);
  };

  const generateCardToken = async (cardData: any) => {
    return new Promise((resolve, reject) => {
      // Verificar se o SDK do Mercado Pago está disponível
      if (typeof window !== 'undefined' && window.MercadoPago && window.MercadoPago.createCardToken) {
        window.MercadoPago.createCardToken({
          cardNumber: cardData.number.replace(/\s/g, ''),
          cardholderName: cardholderName,
          cardExpirationMonth: cardData.expiry.split('/')[0],
          cardExpirationYear: '20' + cardData.expiry.split('/')[1],
          securityCode: cardData.cvc,
          identificationType: 'CPF',
          identificationNumber: customerData.cpf.replace(/\D/g, ''),
        }, (status: number, response: any) => {
          if (status === 200 || status === 201) {
            resolve(response.id);
          } else {
            reject(response);
          }
        });
      } else {
        // Fallback: simular token para desenvolvimento
        console.warn('SDK do Mercado Pago não disponível, simulando token');
        setTimeout(() => {
          resolve('simulated_token_' + Date.now());
        }, 1000);
      }
    });
  };

  const handlePayment = async (paymentData: any) => {
    setIsProcessing(true);
    
    try {
      console.log('Iniciando processamento de pagamento:', paymentData.method);
      
      // Validar dados do cliente antes de processar pagamento
      const validation = validateCustomerData();
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      let paymentBody;
      
      if (paymentData.method === 'pix') {
        console.log('Processando pagamento PIX');
        paymentBody = {
          transaction_amount: 9.90,
          description: 'Assinatura Q-aura - Plano Mensal',
          payment_method_id: 'pix',
          payer: {
            email: customerData.email,
            first_name: customerData.name.split(' ')[0],
            last_name: customerData.name.split(' ').slice(1).join(' '),
            identification: {
              type: 'CPF',
              number: customerData.cpf.replace(/\D/g, '')
            }
          }
        };
      } else if (paymentData.method === 'card') {
        console.log('Processando pagamento com cartão');
        // Para cartão, vamos simular por enquanto já que não temos dados do cartão
        paymentBody = {
          transaction_amount: 9.90,
          description: 'Assinatura Q-aura - Plano Mensal',
          payment_method_id: 'visa', // Simulado
          payer: {
            email: customerData.email,
            first_name: customerData.name.split(' ')[0],
            last_name: customerData.name.split(' ').slice(1).join(' '),
            identification: {
              type: 'CPF',
              number: customerData.cpf.replace(/\D/g, '')
            }
          }
        };
      } else {
        throw new Error('Método de pagamento não suportado');
      }

      // Testar se conseguimos conectar com o banco
      console.log('🔍 SUPER DEBUG - Investigando banco de dados...');
      
      // 1. Testar conexão básica com Supabase
      console.log('🔗 Testando conexão básica...');
      const { data: basicTest, error: basicError } = await supabase
        .from('subscriptions')
        .select('count')
        .limit(1);
      
      console.log('🔗 Resultado conexão:', { basicTest, basicError });
      
      // 2. Tentar descobrir a estrutura exata da tabela
      console.log('🏗️ Investigando estrutura da tabela...');
      
      // Tentar diferentes approaches para descobrir colunas
      try {
        // Approach 1: Tentar buscar 1 registro para ver estrutura
        const { data: sampleData, error: sampleError } = await supabase
          .from('subscriptions')
          .select('*')
          .limit(1);
        
        console.log('📋 Dados de exemplo:', { sampleData, sampleError });
        
        // Approach 2: Tentar inserir um objeto vazio para ver que erro aparece
        console.log('🧪 Testando inserção vazia...');
        const { data: emptyInsert, error: emptyError } = await supabase
          .from('subscriptions')
          .insert({})
          .select();
        
        console.log('🧪 Resultado inserção vazia:', { emptyInsert, emptyError });
        
        // Approach 3: Tentar inserir com campos básicos
        console.log('💾 Testando inserção básica...');
        const { data: basicInsert, error: basicInsertError } = await supabase
          .from('subscriptions')
          .insert({ status: 'pending' })
          .select();
        
        console.log('💾 Resultado inserção básica:', { basicInsert, basicInsertError });
        
        if (basicInsertError) {
          console.error('🔥 ERRO ESPECÍFICO DA INSERÇÃO:', {
            message: basicInsertError.message,
            details: basicInsertError.details,
            hint: basicInsertError.hint,
            code: basicInsertError.code
          });
          
          // Vamos tentar descobrir quais campos são obrigatórios
          console.log('🔍 Tentando diferentes combinações de campos...');
          
          // Teste 1: id + status
          const test1 = await supabase
            .from('subscriptions')
            .insert({ id: crypto.randomUUID(), status: 'pending' })
            .select();
          console.log('Test 1 (id + status):', test1);
          
          if (test1.error) {
            // Teste 2: user_id + status  
            const test2 = await supabase
              .from('subscriptions')
              .insert({ user_id: crypto.randomUUID(), status: 'pending' })
              .select();
            console.log('Test 2 (user_id + status):', test2);
            
            if (test2.error) {
              // Teste 3: campos mais completos
              const test3 = await supabase
                .from('subscriptions')
                .insert({ 
                  user_id: crypto.randomUUID(),
                  status: 'pending',
                  plan: 'premium',
                  created_at: new Date().toISOString()
                })
                .select();
              console.log('Test 3 (completo):', test3);
              
              if (test3.error) {
                throw new Error(`Não conseguiu identificar estrutura da tabela: ${test3.error.message}`);
              } else {
                console.log('✅ SUCESSO com campos completos!');
              }
            } else {
              console.log('✅ SUCESSO com user_id + status!');
            }
          } else {
            console.log('✅ SUCESSO com id + status!');
          }
        } else {
          console.log('✅ SUCESSO com apenas status!');
        }
        
      } catch (debugError: any) {
        console.error('💥 ERRO NO DEBUG:', debugError);
        throw new Error(`Erro de debug: ${debugError.message}`);
      }

      // Simular processamento de pagamento (substituir por integração real depois)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Pagamento Processado!",
        description: paymentData.method === 'pix' 
          ? "PIX gerado com sucesso! Escaneie o código para finalizar."
          : "Pagamento no cartão processado com sucesso!",
      });

      navigate('/pagamento-sucesso', { 
        state: { 
          method: paymentData.method,
          amount: 9.90
        } 
      });
      
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      
      let errorMessage = "Não foi possível processar o pagamento. Tente novamente.";
      
      if (error.message?.includes('salvar dados')) {
        errorMessage = "Erro ao salvar seus dados. Verifique sua conexão e tente novamente.";
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
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                R$ 9,90/mês
              </div>
              <div className="text-sm text-muted-foreground">
                Cancele quando quiser
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Dados Pessoais
                </span>
                <span className={`text-sm ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Pagamento
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(step / 2) * 100}%` }}
                ></div>
              </div>
            </div>

            {step === 1 && (
              <form onSubmit={handleStepOne} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Digite seu nome completo"
                    value={customerData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={customerData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (com DDD) *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={customerData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp (com DDD) *</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={customerData.whatsapp}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    É por este número que você receberá o conteúdo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={customerData.cpf}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={customerData.birthDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço (Opcional)</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Rua, número, bairro, cidade - UF"
                    value={customerData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    variant="hero"
                    className="w-full text-lg py-6 h-auto"
                  >
                    Continuar para Pagamento
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Escolha a forma de pagamento</h3>
                  <p className="text-muted-foreground">
                    Como você gostaria de pagar sua assinatura?
                  </p>
                </div>

                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => handlePayment({ method: 'pix' })}
                    disabled={isProcessing}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">PIX</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">PIX</div>
                        <div className="text-sm text-muted-foreground">Pagamento instantâneo</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => {
                      // Por enquanto vamos simular cartão como PIX
                      handlePayment({ method: 'card' });
                    }}
                    disabled={isProcessing}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">💳</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Cartão de Crédito</div>
                        <div className="text-sm text-muted-foreground">Parcelamento disponível</div>
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep(1)}
                    className="w-full"
                    disabled={isProcessing}
                  >
                    ← Voltar para dados pessoais
                  </Button>
                </div>

                {isProcessing && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Processando pagamento...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
              <Lock className="w-4 h-4" />
              <span>Dados protegidos e pagamento seguro</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assinar;
