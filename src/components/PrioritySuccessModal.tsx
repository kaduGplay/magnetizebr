import { CheckCircle, Clock, Rocket, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PrioritySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrioritySuccessModal = ({
  isOpen,
  onClose,
}: PrioritySuccessModalProps) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    onClose();
    navigate("/dashboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] bg-gradient-to-b from-zinc-900 to-black border-white/10 p-0 gap-0 overflow-hidden">
        <div className="p-6 space-y-5">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 blur-3xl rounded-full animate-pulse" />
              <div className="relative p-5 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-500/50">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-white">
              Acesso Prioritário Ativado! 🎉
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Parabéns! Você agora tem <span className="text-green-400 font-bold">prioridade máxima</span> em 
              todas as suas gerações.
            </p>
          </div>

          {/* Benefits Activated */}
          <div className="space-y-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
              <Rocket className="h-4 w-4" />
              <span>Benefícios ativados:</span>
            </div>
            <ul className="text-white/70 text-xs space-y-1.5 ml-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                Geração instantânea sem fila
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                Prioridade máxima 24/7
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                Acesso vitalício garantido
              </li>
            </ul>
          </div>

          {/* Wait Time Notice */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Clock className="h-6 w-6 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-white/80 text-sm font-medium">Aguarde 30 minutos</p>
              <p className="text-white/50 text-xs">
                Para melhor qualidade, aguarde 30 minutos antes de iniciar sua próxima geração.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleGoToDashboard}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-base font-bold shadow-lg shadow-green-500/30"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrioritySuccessModal;
