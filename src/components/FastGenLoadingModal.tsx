import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface FastGenLoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  generationType: 'video' | 'image';
}

const videoSteps = [
  "Preparando modelo... 🎬",
  "Analisando características...",
  "Removendo roupas... 🔥",
  "Gerando áudio realista... 🎙️",
  "Aplicando movimentos sensuais... 💃",
  "Renderizando vídeo... 🎥",
  "Finalizando geração... ✨"
];

const imageSteps = [
  "Preparando modelo... 📸",
  "Analisando características...",
  "Removendo roupas... 🔥",
  "Ajustando iluminação... 💡",
  "Aplicando filtros sensuais... ✨",
  "Renderizando imagem... 🖼️",
  "Finalizando geração... 🎨"
];

const LOADING_DURATION = 10000; // 10 segundos

const FastGenLoadingModal = ({
  isOpen,
  onComplete,
  generationType,
}: FastGenLoadingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const steps = generationType === 'video' ? videoSteps : imageSteps;
  const stepInterval = LOADING_DURATION / steps.length;

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    // Progresso suave
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + 1;
      });
    }, LOADING_DURATION / 100);

    // Trocar steps
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) return prev;
        return prev + 1;
      });
    }, stepInterval);

    // Completar após 10 segundos
    const completeTimer = setTimeout(() => {
      onComplete();
    }, LOADING_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepTimer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, onComplete, steps.length, stepInterval]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] bg-gradient-to-b from-zinc-900 to-black border-white/10 p-0 gap-0 overflow-hidden [&>button]:hidden">
        <div className="p-8 space-y-6">
          {/* Animated Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
              <div className="relative p-5 rounded-full bg-gradient-to-br from-primary/30 to-red-500/30 border border-primary/40">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-1 h-4 w-4 text-primary animate-pulse delay-300" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white">
              Gerando seu {generationType === 'video' ? 'vídeo' : 'imagem'} 🔞
            </h2>
            <p className="text-white/50 text-sm">
              Aguarde enquanto processamos...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-red-500"
            />
            <div className="flex justify-between text-xs text-white/40">
              <span>Processando...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Current Step */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-white font-medium text-sm animate-pulse">
                {steps[currentStep]}
              </span>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                  index < currentStep 
                    ? 'text-green-400' 
                    : index === currentStep 
                      ? 'text-white' 
                      : 'text-white/30'
                }`}
              >
                {index < currentStep ? (
                  <span className="text-green-400">✓</span>
                ) : index === currentStep ? (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-white/20" />
                )}
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FastGenLoadingModal;
