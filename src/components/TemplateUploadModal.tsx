import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InsufficientCreditsModal, { GENERATION_COST } from "./InsufficientCreditsModal";
import GenerationLoadingModal from "./GenerationLoadingModal";
import QueueErrorModal from "./QueueErrorModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  templateImage: string;
  onGenerate: (file: File) => void;
  isVideo?: boolean;
}

const TemplateUploadModal = ({ 
  isOpen, 
  onClose, 
  templateName, 
  templateImage,
  onGenerate,
  isVideo = false
}: TemplateUploadModalProps) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showQueueErrorModal, setShowQueueErrorModal] = useState(false);

  const currentCredits = profile?.credits || 0;
  const hasEnoughCredits = currentCredits >= GENERATION_COST;

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleGenerate = () => {
    if (!selectedFile) return;
    
    // Always show loading first
    setShowLoadingModal(true);
  };

  const handleLoadingComplete = useCallback(() => {
    setShowLoadingModal(false);
    
    // After loading, check credits
    if (!hasEnoughCredits) {
      // Not enough credits: show insufficient credits modal
      setShowCreditsModal(true);
    } else {
      // Has enough credits: show queue error modal (upsell for priority)
      setShowQueueErrorModal(true);
    }
  }, [hasEnoughCredits]);

  const handleBuyCredits = () => {
    setShowCreditsModal(false);
    handleClose();
    navigate("/dashboard");
    window.dispatchEvent(new CustomEvent('openCreditsModal'));
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)] max-h-[90vh] bg-background border-border p-0 gap-0 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {/* Template Preview */}
            <div className="w-full">
              {isVideo ? (
                <video
                  src={templateImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-contain"
                />
              ) : (
                <img 
                  src={templateImage}
                  alt={templateName}
                  className="w-full h-auto object-contain"
                />
              )}
            </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{templateName}</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Faça upload da foto da pessoa que você deseja ver no vídeo
              </p>
            </div>


            {/* Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Selecione a foto da pessoa
              </label>
              
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-all duration-300
                  ${isDragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                  ${previewUrl ? 'p-2' : ''}
                `}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-32 object-contain rounded"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Selecione uma foto</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        PNG, JPG, WEBP até 50MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleGenerate}
                disabled={!selectedFile}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                Gerar Vídeo
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="w-full border-border py-6"
              >
                Fechar
              </Button>
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      <GenerationLoadingModal
        isOpen={showLoadingModal}
        onComplete={handleLoadingComplete}
      />

      <InsufficientCreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        onBuyCredits={handleBuyCredits}
        currentCredits={currentCredits}
        requiredCredits={GENERATION_COST}
      />

      <QueueErrorModal
        isOpen={showQueueErrorModal}
        onClose={() => setShowQueueErrorModal(false)}
      />
    </>
  );
};

export default TemplateUploadModal;
