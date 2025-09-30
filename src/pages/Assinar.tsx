import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Lock, ChevronLeft } from "lucide-react";
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
  const [mpInitialized, setMpInitialized] = useState(false);

  // Estados do formulário - Dados do cliente
  const [customerData, setCustomerData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  // Estados do cartão
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.whatsapp || !formData.cpf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios (*). ",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para assinar.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      // Temporary solution: Save subscription locally and redirect to a payment simulation
      // TODO: Replace with proper Mercado Pago integration when Edge Functions are deployed
      
      // First, save the subscription intent to database
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: user.id,
          status: 'pending',
          amount: 9.90,
          mercadopago_subscription_id: `temp_${Date.now()}_${user.id.slice(0, 8)}`
        }]);

      if (subscriptionError) {
        throw new Error(`Erro ao salvar assinatura: ${subscriptionError.message}`);
      }

      toast({
        title: "Assinatura Criada!",
        description: "Dados salvos com sucesso. Redirecionando para finalizar pagamento...",
        variant: "default",
      });

      // Redirecionar para página de sucesso
      setTimeout(() => {
        navigate('/pagamento-sucesso');
      }, 2000);

      // COMMENTED OUT: Edge Function call (to be restored when functions are deployed)
      /*
      const { data, error } = await supabase.functions.invoke('create-mercadopago-preference', {
        body: formData,
      });

      if (error) throw error;

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('Erro ao criar preferência de pagamento');
      }
      */
      
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar assinatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Digite seu nome completo"
                  value={formData.name}
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
                  value={formData.email}
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
                  value={formData.phone}
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
                  value={formData.whatsapp}
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
                  value={formData.cpf}
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
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço (Opcional)</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Rua, número, bairro, cidade - UF"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  variant="hero"
                  className="w-full text-lg py-6 h-auto"
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Finalizar Assinatura'}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Dados protegidos e pagamento seguro</span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assinar;
