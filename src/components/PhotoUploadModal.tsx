import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image, X, Upload } from "lucide-react";

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (file: File) => void;
}

const PhotoUploadModal = ({ isOpen, onClose, onContinue }: PhotoUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleContinue = () => {
    if (selectedFile) {
      onContinue(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border border-white/10 p-0 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Gere vídeos com fotos da galeria
            </h2>
            <p className="text-white/60 text-sm">
              Escolha uma de nossas modelos e gere imagens incríveis em segundos
            </p>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300 min-h-[200px] flex items-center justify-center ${
              isDragOver
                ? "border-primary bg-primary/10"
                : previewUrl
                ? "border-primary/50 bg-primary/5"
                : "border-primary/30 hover:border-primary/50 bg-black/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-[300px] object-contain rounded-xl"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Image className="h-8 w-8 text-primary" />
                </div>
                <p className="text-white font-semibold mb-1">
                  Selecione a foto da pessoa
                </p>
                <p className="text-white/50 text-sm">
                  Clique aqui ou arraste uma imagem
                </p>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedFile}
            className={`w-full mt-6 h-12 rounded-xl text-white font-bold text-base transition-all duration-300 ${
              selectedFile
                ? "bg-gradient-to-r from-primary to-red-600 hover:shadow-lg hover:shadow-primary/30"
                : "bg-primary/50 cursor-not-allowed"
            }`}
          >
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUploadModal;
