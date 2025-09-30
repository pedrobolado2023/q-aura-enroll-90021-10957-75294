import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
            Pronto para transformar seus{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              estudos?
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Junte-se a centenas de estudantes que já estão alcançando seus objetivos com o Q-aura
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => navigate("/assinar")}
              className="text-lg px-10 py-7 h-auto"
            >
              Assinar Agora <ArrowRight className="ml-2" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            Cancele quando quiser • Sem taxas ocultas • Suporte 24/7
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
