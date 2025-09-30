import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, BookOpen, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                🚀 Sistema Automatizado de Estudos
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Estude direto do{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                WhatsApp
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Q-aura é o sistema de estudos que vai revolucionar sua forma de aprender. 
              Conteúdo direto no seu WhatsApp, sem complicação, com resultados reais.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate("/assinar")}
                className="text-lg px-8 py-6 h-auto"
              >
                Começar Agora <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline-light"
                className="text-lg px-8 py-6 h-auto"
              >
                Saiba Mais
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Online</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Disponível</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">∞</div>
                <div className="text-sm text-muted-foreground">Conteúdo</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-30 animate-pulse"></div>
            <img 
              src={heroImage} 
              alt="Q-aura - Sistema de Estudos via WhatsApp" 
              className="relative rounded-3xl shadow-2xl w-full transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
