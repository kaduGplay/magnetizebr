import { Lock, ImageOff, Cpu, ShieldCheck } from "lucide-react";

const SecuritySection = () => {
  const features = [
    { 
      icon: Lock, 
      title: "Processamento criptografado",
      description: "Dados protegidos",
    },
    { 
      icon: ImageOff, 
      title: "Nenhuma imagem salva",
      description: "Deletadas automaticamente",
    },
    { 
      icon: Cpu, 
      title: "Sistema automatizado",
      description: "Sem acesso humano",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
      
      <div className="container relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 backdrop-blur-sm mb-6">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">100% Seguro</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Segurança e <span className="text-gradient">privacidade</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Seus dados estão protegidos em todas as etapas
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-3xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group card-glass card-glass-hover rounded-2xl p-6 text-center min-w-[180px] flex-1 max-w-[220px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-success/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-success" />
              </div>
              
              <h3 className="font-bold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <p className="text-center text-muted-foreground mt-10 text-base flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-success" />
          Você mantém total controle sobre seus dados.
        </p>
      </div>
    </section>
  );
};

export default SecuritySection;
