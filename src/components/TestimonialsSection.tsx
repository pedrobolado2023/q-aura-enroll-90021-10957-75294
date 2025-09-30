import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ana Paula Silva",
    role: "Estudante de Medicina",
    content: "O Q-aura mudou completamente minha rotina de estudos. Consegui organizar melhor meu tempo e os resultados apareceram rapidamente!",
    rating: 5,
    initials: "AP",
  },
  {
    name: "Carlos Eduardo",
    role: "Concurseiro",
    content: "Praticidade total! Estudar direto pelo WhatsApp facilitou muito minha vida. Recomendo demais!",
    rating: 5,
    initials: "CE",
  },
  {
    name: "Juliana Santos",
    role: "Universitária",
    content: "A metodologia é realmente eficiente. Em poucos meses já percebi uma evolução enorme no meu desempenho.",
    rating: 5,
    initials: "JS",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            O que nossos{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">alunos dizem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de quem transformou seus estudos com o Q-aura
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 bg-gradient-primary">
                    <AvatarFallback className="bg-transparent text-primary-foreground font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
