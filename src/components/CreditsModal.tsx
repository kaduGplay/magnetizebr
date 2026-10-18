import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Star, Check, DollarSign, Play, Sparkles, Zap, Crown } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getStoredUtmParams } from "@/hooks/useUtmParams";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreditsModal = ({ isOpen, onClose }: CreditsModalProps) => {
  const navigate = useNavigate();

  const oneTimePlans = [
    {
      id: "basic",
      name: "Magnetize Basic",
      price: "R$9,90",
      priceValue: 990,
      period: "uma única vez",
      videos: 3,
      credits: 50,
      features: ["Qualidade HD", "3 vídeos", "Suporte básico"],
      isPopular: false,
      icon: Zap,
      isLifetime: false,
      isPremium: false,
    },
    {
      id: "medium",
      name: "Magnetize Medium",
      price: "R$19,90",
      priceValue: 1990,
      period: "uma única vez",
      videos: 8,
      credits: 250,
      features: ["Qualidade Ultra HD", "8 vídeos", "Suporte prioritário"],
      isPopular: true,
      icon: Sparkles,
      isLifetime: false,
      isPremium: false,
    },
    {
      id: "advanced",
      name: "Magnetize Advanced",
      price: "R$29,90",
      priceValue: 2990,
      period: "uma única vez",
      videos: 17,
      credits: 500,
      features: ["Qualidade 4K", "16 vídeos", "Suporte 24h"],
      isPopular: false,
      icon: Crown,
      isLifetime: false,
      isPremium: false,
    },
  ];

  const superPacks = [
    {
      id: "mega-pack",
      name: "Mega Pack",
      badge: "70% OFF",
      originalPrice: "R$149,90",
      price: "R$48,50",
      priceValue: 4850,
      period: "pagamento único",
      credits: 2500,
      creditsLabel: "Créditos",
      features: [
        "2.500 créditos para usar quando quiser",
        "Sem mensalidade",
        "Modo Anônimo",
        "Sem marca d'água",
        "Suporte prioritário",
      ],
      isLifetime: false,
      isPremium: true,
    },
    {
      id: "ultra-pack",
      name: "Ultra Pack Ilimitado",
      badge: "ULTRA DESCONTO",
      originalPrice: "R$997,00",
      price: "R$129,90",
      priceValue: 12990,
      period: "acesso vitalício",
      credits: 999999,
      creditsLabel: "Para Sempre",
      features: [
        "Créditos infinitos para sempre",
        "Pague uma vez, use para sempre",
        "Modo Anônimo",
        "Sem marca d'água",
        "Suporte VIP 24h",
      ],
      isLifetime: true,
      isPremium: true,
    },
  ];

  const handlePurchase = (planId: string, planName: string, amount: number, credits: number, isLifetime: boolean, isPremium: boolean) => {
    onClose();
    // Navigate to checkout page with plan info and UTM params
    const params = new URLSearchParams({
      plan: planId,
      name: planName,
      amount: amount.toString(),
      credits: credits.toString(),
      isLifetime: isLifetime.toString(),
      isPremium: isPremium.toString(),
    });
    
    // Append stored UTM params
    const utmParams = getStoredUtmParams();
    if (utmParams) {
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-xl border-white/10 p-0 shadow-2xl shadow-primary/20">
        {/* Gradient overlay top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent pointer-events-none" />
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative p-6 md:p-10 space-y-14">
          {/* Planos Únicos Section */}
          <section>
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-semibold tracking-wider mb-4 border border-primary/30">
                PLANOS AVULSOS
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Planos Únicos
              </h2>
              <p className="text-white/50 text-sm max-w-md mx-auto">
                Escolha o plano perfeito para suas necessidades e comece a transformar suas imagens hoje mesmo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {oneTimePlans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <div
                    key={plan.id}
                    className={`group relative rounded-2xl p-[1px] transition-all duration-500 ${
                      plan.isPopular
                        ? "bg-gradient-to-b from-primary via-primary/50 to-primary/20 scale-[1.03] z-10"
                        : "bg-gradient-to-b from-white/20 via-white/5 to-transparent hover:from-white/30"
                    }`}
                  >
                    <div className={`relative h-full rounded-2xl p-6 ${
                      plan.isPopular 
                        ? "bg-gradient-to-b from-black via-black/95 to-black" 
                        : "bg-black/80 backdrop-blur-sm"
                    }`}>
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/40">
                            <Star className="h-3 w-3 fill-current" />
                            POPULAR
                          </span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`inline-flex p-3 rounded-xl mb-4 ${
                        plan.isPopular 
                          ? "bg-primary/20 text-primary" 
                          : "bg-white/5 text-white/60 group-hover:text-white/80"
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2">
                        {plan.name}
                      </h3>

                      <div className="mb-1">
                        <span className={`text-4xl font-black ${plan.isPopular ? "text-primary" : "text-white"}`}>
                          {plan.price}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 mb-6">{plan.period}</p>

                      {plan.id === "basic" && (
                        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-400/15 via-yellow-300/10 to-amber-500/5 p-3 shadow-lg shadow-amber-500/5">
                          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-300/10 text-2xl">
                            🎁
                          </span>
                          <div className="text-left">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/80">Presente</p>
                            <p className="text-sm font-bold text-amber-100">40 créditos extras</p>
                          </div>
                        </div>
                      )}

                      {/* Videos and Credits */}
                      <div className="flex justify-center gap-6 mb-5">
                        <div className="text-center px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                          <Play className="h-4 w-4 text-white/50 mx-auto mb-1" />
                          <span className="text-xl font-bold text-white block">{plan.videos}</span>
                          <span className="text-[10px] text-white/40 uppercase tracking-wider">Vídeos</span>
                        </div>
                        <div className="text-center px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                          <DollarSign className="h-4 w-4 text-white/50 mx-auto mb-1" />
                          <span className="text-xl font-bold text-white block">{plan.credits}</span>
                          <span className="text-[10px] text-white/40 uppercase tracking-wider">Créditos</span>
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="bg-gradient-to-r from-amber-950/60 to-amber-900/40 border border-amber-800/40 rounded-xl p-3 mb-5 backdrop-blur-sm">
                        <p className="text-[11px] text-amber-300/90 text-center leading-relaxed">
                          Após a confirmação do pagamento, seus créditos serão adicionados automaticamente.
                        </p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2.5 text-sm">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-white/70">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handlePurchase(plan.id, plan.name, plan.priceValue, plan.credits, plan.isLifetime, plan.isPremium)}
                        className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
                          plan.isPopular
                            ? "bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20"
                        }`}
                      >
                        Adquirir Agora
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-6 text-white/30 text-xs uppercase tracking-widest">ou</span>
            </div>
          </div>

          {/* Super Packs Section */}
          <section>
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white text-xs font-semibold tracking-wider mb-4 animate-pulse">
                🔥 SUPER PACKS 🔥
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Super Packs Exclusivos
              </h2>
              <p className="text-white/50 text-sm max-w-md mx-auto">
                Aproveite nossos packs com mega descontos — pague uma vez e use à vontade!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-3xl mx-auto">
              {superPacks.map((plan) => {
                return (
                  <div
                    key={plan.id}
                    className={`group relative rounded-2xl p-[1px] transition-all duration-500 ${
                      plan.id === "ultra-pack"
                        ? "bg-gradient-to-b from-amber-400 via-primary to-primary/50 scale-[1.02]"
                        : "bg-gradient-to-b from-white/20 via-white/5 to-transparent hover:from-primary/50 hover:via-primary/20"
                    }`}
                  >
                    <div className="relative h-full rounded-2xl bg-black/90 backdrop-blur-sm p-6">
                      <span className={`inline-flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 ${
                        plan.id === "ultra-pack"
                          ? "bg-gradient-to-r from-amber-500 to-primary animate-pulse"
                          : "bg-gradient-to-r from-primary to-red-600"
                      }`}>
                        {plan.badge}
                      </span>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {plan.name}
                      </h3>

                      <div className="mb-1 flex items-baseline gap-2">
                        <span className="text-lg text-white/40 line-through">{plan.originalPrice}</span>
                        <span className={`text-4xl font-black ${plan.id === "ultra-pack" ? "text-amber-400" : "text-primary"}`}>
                          {plan.price}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 mb-6">{plan.period}</p>

                      {/* Credits */}
                      <div className="flex justify-center mb-5">
                        <div className={`text-center px-6 py-4 rounded-xl border min-w-[160px] ${
                          plan.id === "ultra-pack"
                            ? "bg-gradient-to-br from-amber-500/20 to-primary/20 border-amber-500/40"
                            : "bg-white/5 border-white/10"
                        }`}>
                          <DollarSign className={`h-5 w-5 mx-auto mb-2 ${plan.id === "ultra-pack" ? "text-amber-400" : "text-primary"}`} />
                          <span className={`text-2xl font-bold block ${plan.id === "ultra-pack" ? "text-amber-400" : "text-white"}`}>
                            {plan.credits}
                          </span>
                          <span className="text-[10px] text-white/40 uppercase tracking-wider">{plan.creditsLabel}</span>
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className={`rounded-xl p-3 mb-5 backdrop-blur-sm ${
                        plan.id === "ultra-pack"
                          ? "bg-gradient-to-r from-amber-950/60 to-amber-900/40 border border-amber-500/40"
                          : "bg-gradient-to-r from-amber-950/60 to-amber-900/40 border border-amber-800/40"
                      }`}>
                        <p className="text-[11px] text-amber-300/90 text-center leading-relaxed">
                          Após a confirmação do pagamento, seus créditos serão adicionados automaticamente.
                        </p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2.5 text-sm">
                            <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                              plan.id === "ultra-pack" ? "bg-amber-500/20" : "bg-primary/20"
                            }`}>
                              <Check className={`h-3 w-3 ${plan.id === "ultra-pack" ? "text-amber-400" : "text-primary"}`} />
                            </div>
                            <span className="text-white/70">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handlePurchase(plan.id, plan.name, plan.priceValue, plan.credits, plan.isLifetime, plan.isPremium)}
                        className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
                          plan.id === "ultra-pack"
                            ? "bg-gradient-to-r from-amber-500 to-primary hover:from-amber-400 hover:to-primary/90 text-black font-bold shadow-lg shadow-amber-500/30"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20"
                        }`}
                      >
                        {plan.id === "ultra-pack" ? "🔥 Quero Acesso Ilimitado" : "Adquirir Agora"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsModal;
