import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TemplateUploadModal from "./TemplateUploadModal";

interface VideoTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

const templates = [
  { id: "cowgirl-reverso", label: "Cowgirl Reverso 2.0", src: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/Reverse_cowgirl_2_0_prev_video_mp4.mp4", star: true },
  { id: "rebolar", label: "Rebolar 2.0", src: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/Twerk_2_0_prev_video_mp4.mp4" },
  { id: "puf", label: "Puf!", src: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/Prev_poof_clip_video_mp4.mp4" },
  { id: "missionario", label: "Missionário 2.0", src: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/Missionary_2_0_prev_video_mp4.mp4" },
  { id: "ahegao", label: "Ahegao", src: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/Ahegao_video_clip_mp4.mp4", star: true },
  { id: "masturbacao-peitos", label: "Masturbação de peitos 2.0", src: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/Tits_massage_clip_video_mp4.mp4", badge: "NOVO" },
  { id: "mostra-peitos", label: "Mostra peitos", src: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/Teasing_tits_prev_video_mp4.mp4", badge: "HOT" },
  { id: "masturbacao", label: "Masturbação 2.0", src: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/Masturbation_2_0_prev_video_mp4.mp4" },
  { id: "boquete", label: "Boquete 2.0", src: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/Blowjob_prev_2_0_video_mp4.mp4", star: true },
];

const VideoTemplatesModal = ({ isOpen, onClose, onSelectTemplate }: VideoTemplatesModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);

  const handleTemplateClick = (template: typeof templates[0]) => {
    setSelectedTemplate(template);
  };

  const handleUploadClose = () => {
    setSelectedTemplate(null);
  };

  const handleGenerate = (file: File) => {
    console.log("Generating with file:", file.name, "for template:", selectedTemplate?.id);
    onSelectTemplate(selectedTemplate?.id || "");
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border p-0">
          <DialogHeader className="sticky top-0 bg-background z-10 px-6 py-4 border-b border-border flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">
              ESCOLHA UM MODELO DE VÍDEO
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-card border border-border hover:border-primary transition-all duration-300"
                >
                  <video
                    className="w-full h-full object-cover absolute inset-0"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    onError={(e) => console.log("Video error for:", template.id, e)}
                  >
                    <source src={template.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Badge */}
                  {template.badge && (
                    <span className={`absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold ${
                      template.badge === "HOT" ? "bg-primary text-primary-foreground" : "bg-purple-500 text-white"
                    }`}>
                      {template.badge}
                    </span>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  
                  {/* Label */}
                  <div className="absolute bottom-2 left-0 right-0 text-center px-1">
                    <span className="text-foreground font-medium text-xs leading-tight flex items-center justify-center gap-1">
                      {template.label}
                      {template.star && <Star className="h-3 w-3 text-primary fill-primary" />}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedTemplate && (
        <TemplateUploadModal
          isOpen={!!selectedTemplate}
          onClose={handleUploadClose}
          templateName={selectedTemplate.label}
          templateImage={selectedTemplate.src}
          onGenerate={handleGenerate}
          isVideo={true}
        />
      )}
    </>
  );
};

export default VideoTemplatesModal;
