import { useState, useRef } from "react";
import { Upload, Image, Shield, AlertTriangle } from "lucide-react";
interface ImageUploadSectionProps {
  onImageSelect: (file: File) => void;
}
const ImageUploadSection = ({
  onImageSelect
}: ImageUploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      onImageSelect(file);
    }
  };
  const isValidFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      onImageSelect(file);
    }
  };
  return <section id="upload-section" className="relative py-16 md:py-24 section-glow">
      <div className="container relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Faça upload da sua imagem
          </h2>
          <p className="text-muted-foreground">
            Arraste ou clique para começar
          </p>
        </div>
        
        <div className="max-w-xl mx-auto">
          {/* Upload zone */}
          <div className="relative group">
            {/* Animated border glow */}
            <div className={`absolute -inset-1 rounded-3xl transition-all duration-500 ${isDragging ? 'bg-gradient-to-r from-primary via-red-500 to-primary opacity-100' : 'bg-gradient-to-r from-primary/50 via-red-500/30 to-primary/50 opacity-0 group-hover:opacity-100'} blur-lg`} />
            
            <div className={`
                relative card-glass rounded-3xl p-10 md:p-14 
                transition-all duration-500 cursor-pointer
                ${isDragging ? 'border-2 border-primary bg-primary/10 scale-[1.02]' : 'border-2 border-dashed border-border hover:border-primary/50'}
              `} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <div className="flex flex-col items-center gap-6 text-center">
                {/* Icon container */}
                <div className={`relative transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
                    <Upload className={`w-10 h-10 text-primary transition-all duration-300 ${isDragging ? 'animate-bounce' : ''}`} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xl font-bold text-foreground">
                    {isDragging ? 'Solte a imagem aqui' : 'Faça upload da sua imagem'}
                  </p>
                  <p className="text-muted-foreground">
                    Arraste e solte ou clique para selecionar
                  </p>
                </div>
                
                {/* File types badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  {['JPG', 'PNG', 'WEBP'].map(format => <span key={format} className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/80 text-muted-foreground border border-border">
                      {format}
                    </span>)}
                </div>
              </div>
              
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileSelect} />
            </div>
          </div>
          
          {/* Warning card */}
          <div className="mt-8">
            <div className="card-glass rounded-2xl p-5 border border-primary/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary mb-1">ATENÇÃO</p>
                  <p className="text-sm text-muted-foreground">
                    ​Na Magnetize, não pedimos nenhum dado. Qualquer imagem é gerada de forma 100% anônima.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Max size info */}
          <p className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Tamanho máximo: 50MB • Seus dados estão protegidos
          </p>
        </div>
      </div>
    </section>;
};
export default ImageUploadSection;