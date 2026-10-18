import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface VideoCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
  uploadedImage: File | null;
}

const categories = [
  {
    id: "remocao-roupas",
    name: "Remoção de Roupas",
    description: "Remova roupas em vídeos realistas",
    videoUrl: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/21160027-43966a1a-14ce-4998-96e8-f570f18020e4.mp4"
  },
  {
    id: "anal",
    name: "Anal",
    description: "Cenas anais realistas e provocantes",
    videoUrl: "https://appmagnetize.com.br/wp-content/uploads/2025/11/video-2.mp4"
  },
  {
    id: "sentada-frente",
    name: "Sentando de Frente",
    description: "Movimentos intensos e realistas",
    videoUrl: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/sentada.mov"
  },
  {
    id: "boquete",
    name: "Boquete",
    description: "Cenas orais intensas e provocantes",
    videoUrl: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/video-1.mp4"
  },
  {
    id: "tomando-banho",
    name: "Tomando Banho",
    description: "Cenas sensuais debaixo d'água",
    videoUrl: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/video-1.mp4"
  },
  {
    id: "cavalgada",
    name: "Cavalgando por Cima",
    description: "Movimentos intensos de cavalgada",
    videoUrl: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/preview-2-1.mp4"
  }
];

const VideoCategoryModal = ({ isOpen, onClose, onSelectCategory, uploadedImage }: VideoCategoryModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedCategory) {
      onSelectCategory(selectedCategory);
      setSelectedCategory(null);
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border border-white/10 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Selecionar Categoria
            </h2>
            <p className="text-white/60 text-sm">
              Escolha uma modalidade para continuar
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${
                  selectedCategory === category.id
                    ? "ring-2 ring-primary shadow-lg shadow-primary/30"
                    : "hover:ring-2 hover:ring-white/30"
                }`}
              >
                {/* Video Preview */}
                <div className="aspect-[4/5] bg-black/40 relative overflow-hidden">
                  <video
                    src={category.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  {/* Selection Check */}
                  {selectedCategory === category.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-bold text-sm mb-0.5">
                    {category.name}
                  </h3>
                  <p className="text-white/60 text-xs line-clamp-1">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-12 rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedCategory}
              className={`flex-1 h-12 rounded-xl text-white font-bold transition-all duration-300 ${
                selectedCategory
                  ? "bg-gradient-to-r from-primary to-red-600 hover:shadow-lg hover:shadow-primary/30"
                  : "bg-primary/50 cursor-not-allowed"
              }`}
            >
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCategoryModal;
