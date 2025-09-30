import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, BookOpen, TrendingUp, Clock, Brain, Zap } from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Direto no WhatsApp",
    description: "Receba o conteúdo diretamente no aplicativo que você já usa todos os dias. Sem necessidade de baixar nada novo.",
  },
  {
    icon: BookOpen,
    title: "Conteúdo Curado",
    description: "Material selecionado por especialistas, organizado de forma didática e prática para seu aprendizado.",
  },
  {
    icon: Brain,
    title: "Metodologia Comprovada",
    description: "Sistema baseado em técnicas de memorização e aprendizado validadas cientificamente.",
  },
  {
    icon: Clock,
    title: "Flexível e Prático",
    description: "Estude no seu ritmo, quando e onde quiser. O sistema se adapta à sua rotina.",
  },
  {
    icon: TrendingUp,
    title: "Resultados Reais",
    description: "Acompanhe sua evolução com métricas claras e veja seus resultados melhorarem.",
  },
  {
    icon: Zap,
    title: "Automatizado",
    description: "Todo o processo é automatizado. Você só precisa focar nos estudos.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Por que escolher o{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Q-aura?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Um sistema completo pensado para otimizar seus estudos e maximizar seus resultados
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-purple"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
