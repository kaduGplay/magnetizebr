import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyCredits: () => void;
  currentCredits: number;
  requiredCredits: number;
}

const GENERATION_COST = 100;

/**
 * Modal exibido quando o usuário tenta gerar conteúdo sem créditos suficientes.
 *
 * O estado "sem créditos" (currentCredits === 0) segue exatamente o layout de
 * referência: ícone de alerta, título branco, subtítulo vermelho, caixa de
 * oferta com barra vermelha à esquerda e dois botões em largura total.
 *
 * O estado "créditos insuficientes" reutiliza a mesma estrutura visual, apenas
 * com um texto adaptado — assim as duas chamadas existentes (TemplateUploadModal
 * e FastGenerations) continuam funcionando sem alteração de props.
 */
const InsufficientCreditsModal = ({
  isOpen,
  onClose,
  onBuyCredits,
  currentCredits,
  requiredCredits,
}: InsufficientCreditsModalProps) => {
  const hasNoCredits = currentCredits === 0;
  const missingCredits = requiredCredits - currentCredits;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] bg-background border border-primary/20 rounded-3xl p-0 gap-0 overflow-hidden shadow-2xl shadow-primary/10">
        <div className="relative p-6 pt-8 space-y-5">
          {/* Brilho vermelho suave atrás do ícone */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-10 h-40 bg-primary/15 blur-3xl rounded-full"
          />

          {/* Ícone de alerta */}
          <div className="relative flex justify-center">
            <div className="relative p-4 rounded-full bg-primary/10 border border-primary/30">
              <AlertCircle className="h-10 w-10 text-primary" aria-hidden />
            </div>
          </div>

          {/* Texto principal */}
          <div className="relative text-center space-y-1">
            <h2 className="text-2xl font-bold text-foreground leading-tight">
              {hasNoCredits ? "Seus créditos acabaram," : "Faltam créditos,"}
            </h2>
            <p className="text-primary font-medium">
              mas temos um presente para você!
            </p>
          </div>

          {/* Caixa da oferta */}
          <div className="relative rounded-2xl bg-card/70 border border-border/60 py-4 pl-6 pr-4">
            {/* Barra vermelha na lateral esquerda */}
            <span
              aria-hidden
              className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full bg-primary"
            />
            <p className="font-bold text-foreground mb-2">
              Por tempo limitado:
            </p>
            {hasNoCredits ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                com só R$19,90 você recebe{" "}
                <span className="text-foreground font-bold">
                  40 créditos extras
                </span>{" "}
                e continua criando sem parar.
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                com só R$19,90 você recebe{" "}
                <span className="text-foreground font-bold">
                  40 créditos extras
                </span>{" "}
                e continua criando sem parar. Faltam{" "}
                <span className="text-foreground font-bold">
                  {missingCredits} créditos
                </span>{" "}
                para essa geração.
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="relative space-y-3">
            <Button
              onClick={onBuyCredits}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl shadow-lg shadow-primary/30"
            >
              Aproveitar Promoção
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-primary/25 bg-transparent hover:bg-primary/10 text-foreground font-semibold py-6 rounded-xl"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { GENERATION_COST };
export default InsufficientCreditsModal;
