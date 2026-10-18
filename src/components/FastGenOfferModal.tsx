import { useNavigate } from "react-router-dom";
import { Check, Zap } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getStoredUtmParams } from "@/hooks/useUtmParams";

/**
 * Oferta exclusiva da tela de Gerações Rápidas: R$9,90 por 100 créditos.
 * Não interfere nos planos listados no CreditsModal.
 */
export const FAST_GEN_OFFER = {
  planId: "fast-generations",
  planName: "Gerações Rápidas",
  amountCents: 990,
  credits: 100,
} as const;

interface FastGenOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Abre a lista completa de planos como alternativa à oferta. */
  onSeeAllPlans: () => void;
}

const benefits = [
  "100 créditos liberados na hora",
  "Rende 1 vídeo ou 1 imagem",
  "Pagamento único, sem mensalidade",
];

const FastGenOfferModal = ({ isOpen, onClose, onSeeAllPlans }: FastGenOfferModalProps) => {
  const navigate = useNavigate();

  const handlePurchase = () => {
    onClose();

    const params = new URLSearchParams({
      plan: FAST_GEN_OFFER.planId,
      name: FAST_GEN_OFFER.planName,
      amount: FAST_GEN_OFFER.amountCents.toString(),
      credits: FAST_GEN_OFFER.credits.toString(),
      isLifetime: "false",
      isPremium: "false",
    });

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
      <DialogContent className="max-w-md overflow-hidden bg-card border-border p-0">
        <div className="relative p-6 pt-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-primary">
            <Zap className="h-3 w-3" />
            OFERTA RELÂMPAGO
          </span>

          <h2 className="mt-4 text-2xl font-black text-foreground">Gerações Rápidas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Só para quem está gerando agora
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
            <p className="text-sm font-medium text-muted-foreground">
              {FAST_GEN_OFFER.credits} créditos por
            </p>
            <p className="mt-1 text-5xl font-black tracking-tight text-primary">
              R$9,90
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              pagamento único via PIX
            </p>
          </div>

          <ul className="mt-5 space-y-2 text-left">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3">
            <Button
              onClick={handlePurchase}
              className="w-full rounded-xl bg-primary py-6 font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
            >
              Gerar agora com PIX
            </Button>
            <Button
              variant="outline"
              onClick={onSeeAllPlans}
              className="w-full rounded-xl border-border py-5 font-medium text-muted-foreground hover:text-foreground"
            >
              Ver todos os planos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FastGenOfferModal;
