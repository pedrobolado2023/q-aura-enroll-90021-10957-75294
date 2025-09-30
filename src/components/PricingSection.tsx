import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const benefits = [
  "Acesso ilimitado ao conteúdo",
  "Material atualizado diariamente",
  "Suporte via WhatsApp",
  "Metodologia exclusiva",
  "Acompanhamento de progresso",
  "Comunidade de estudantes",
  "Certificado de conclusão",
  "Cancele quando quiser",
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Plano Simples e{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Transparente</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma assinatura, todos os benefícios. Sem taxas ocultas, sem burocracia.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="border-2 border-primary shadow-glow">
            <CardHeader className="text-center pb-8">
              <div className="mb-4">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  ⭐ Mais Popular
                </span>
              </div>
              <CardTitle className="text-3xl mb-2">Assinatura Mensal</CardTitle>
              <CardDescription className="text-lg">
                Acesso completo ao sistema Q-aura
              </CardDescription>
              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    R$ 9,90
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate("/assinar")}
                className="w-full text-lg py-6 h-auto"
              >
                Assinar Agora <ArrowRight className="ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Pagamento 100% seguro via Mercado Pago
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
