import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface GenerationLoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const loadingSteps = [
  "Analisando imagem...",
  "Detectando rosto...",
  "Aplicando modelo de IA...",
  "Removendo roupas...",
  "Aplicando posição...",
  "Finalizando geração...",
];

const GenerationLoadingModal = ({ isOpen, onComplete }: GenerationLoadingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Step animation
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    // Complete after all steps
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(completeTimeout);
    };
  }, [isOpen, onComplete]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] bg-background border-border p-0 gap-0 overflow-hidden [&>button]:hidden">
        <div className="p-8 space-y-6">
          {/* Animated Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
              <div className="relative p-5 rounded-full bg-gradient-to-br from-primary/30 to-red-500/30 border border-primary/40">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Gerando conteúdo...
            </h2>
            <p className="text-muted-foreground text-sm">
              Por favor, aguarde enquanto processamos sua imagem
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-3">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-red-500 transition-all duration-100 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Current step */}
            <div className="flex items-center justify-center gap-2 min-h-[24px]">
              <span className="text-sm text-primary font-medium animate-pulse">
                {loadingSteps[currentStep]}
              </span>
            </div>
          </div>

          {/* Steps list */}
          <div className="space-y-2">
            {loadingSteps.slice(0, currentStep + 1).map((step, index) => (
              <div 
                key={index}
                className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                  index === currentStep 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${
                  index === currentStep 
                    ? 'bg-primary animate-pulse' 
                    : 'bg-success'
                }`} />
                {step}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerationLoadingModal;
