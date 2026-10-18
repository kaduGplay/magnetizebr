import { RevealSlider } from "@/components/RevealSlider";
import { Zap } from "lucide-react";

interface HeroSectionProps {
  onCTAClick: () => void;
}

const HeroSection = ({ onCTAClick }: HeroSectionProps) => {
  return (
    <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      <div className="container relative z-10">
        {/* Image reveal showcase — top of the page */}
        <div className="max-w-[240px] mx-auto">
          <div className="relative group">
            {/* Glow effect behind image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-red-500/20 to-primary/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden card-glass border border-primary/20">
              <RevealSlider className="w-full h-full" />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Subtitle below the images */}
        <p className="mt-8 md:mt-10 text-xl md:text-2xl lg:text-3xl font-bold text-foreground/90 max-w-3xl mx-auto leading-relaxed text-center">
          Remova a roupa de qualquer mulher com <span className="text-gradient">Magnetize I.A</span>
        </p>

        {/* Description */}
        <div className="mt-8 text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-primary">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Resultados em segundos</span>
            <Zap className="w-5 h-5" />
          </div>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Desbloqueie o poder da IA para criar nudes realista de qualquer foto em apenas alguns passos simples.
          </p>
        </div>

        {/* CTA + trust line + free test box */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={onCTAClick}
            className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl px-8 py-5 shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-colors duration-300"
          >
            Desbloquear Agora 🔥
          </button>

          <p className="text-sm md:text-base text-muted-foreground">
            Processamento instantâneo
            <span className="text-red-500 mx-2">•</span>
            100% seguro
          </p>

          <div className="w-full max-w-sm rounded-2xl border border-red-500/60 bg-red-500/10 px-6 py-4 text-center animate-pulse">
            <span className="font-bold text-foreground">🎁 Você ganhou um teste grátis</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
