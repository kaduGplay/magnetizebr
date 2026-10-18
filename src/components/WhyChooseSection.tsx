import { Zap, Lock, CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhyChooseSectionProps {
  onCTAClick: () => void;
}

const WhyChooseSection = ({ onCTAClick }: WhyChooseSectionProps) => {
  const features = [
    {
      icon: Sparkles,
      title: "Resultados realistas",
      description: "Modelos treinados com milhares de imagens para máxima precisão visual.",
      gradient: "from-orange-500 to-red-600",
    },
    {
      icon: Zap,
      title: "Processamento instantâneo",
      description: "Resultados em segundos, sem filas.",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      icon: Lock,
      title: "Privacidade total",
      description: "Nenhuma imagem é armazenada após o processamento.",
      gradient: "from-red-500 to-pink-600",
    },
    {
      icon: CheckCircle,
      title: "100% automático",
      description: "Sem intervenção humana.",
      gradient: "from-pink-500 to-red-600",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Por que escolher o{" "}
            <span className="text-gradient">Magnetize A.I.</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Tecnologia de ponta para resultados impressionantes
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group card-glass card-glass-hover rounded-2xl p-7"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-14 flex justify-center">
          <Button 
            size="lg" 
            className="group bg-gradient-to-r from-primary via-red-500 to-primary bg-[length:200%_100%] hover:bg-right text-primary-foreground font-bold px-10 py-7 text-lg rounded-2xl btn-glow transition-all duration-500"
            onClick={onCTAClick}
          >
            <span className="flex items-center gap-3">
              Começar agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
