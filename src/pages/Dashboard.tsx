import { useState, useEffect, useRef } from "react";
import { Menu, Bell, Coins, Shield, Eye, EyeOff, Sparkles, Zap, Lock, ChevronRight, User } from "lucide-react";
import NudezTemplatesModal from "@/components/NudezTemplatesModal";
import VideoTemplatesModal from "@/components/VideoTemplatesModal";
import TrajeTemplatesModal from "@/components/TrajeTemplatesModal";
import PoseTemplatesModal from "@/components/PoseTemplatesModal";
import PhotoUploadModal from "@/components/PhotoUploadModal";
import VideoCategoryModal from "@/components/VideoCategoryModal";
import CreditsModal from "@/components/CreditsModal";
import PremiumContentModal from "@/components/PremiumContentModal";
import UserAccountModal from "@/components/UserAccountModal";
import WelcomeModal from "@/components/WelcomeModal";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUtmCapture } from "@/hooks/useUtmParams";

const Dashboard = () => {
  const { profile, isLoading } = useAuth();

  // Capture UTM params on dashboard entry (for direct links)
  useUtmCapture();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNudezModalOpen, setIsNudezModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isTrajeModalOpen, setIsTrajeModalOpen] = useState(false);
  const [isPoseModalOpen, setIsPoseModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const [isVideoCategoryModalOpen, setIsVideoCategoryModalOpen] = useState(false);
  const [isPremiumContentModalOpen, setIsPremiumContentModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [uploadedPhotoFile, setUploadedPhotoFile] = useState<File | null>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  // Check if first visit and show welcome modal
  useEffect(() => {
    if (false && profile && !isLoading) {
      const hasSeenWelcome = localStorage.getItem(`welcome_seen_${profile.id}`);
      if (!hasSeenWelcome) {
        // Small delay for better UX
        const timer = setTimeout(() => {
          setIsWelcomeModalOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [profile, isLoading]);

  const handleWelcomeClose = () => {
    if (profile) {
      localStorage.setItem(`welcome_seen_${profile.id}`, "true");
    }
    setIsWelcomeModalOpen(false);
  };

  const handleGoToTemplates = () => {
    handleWelcomeClose();
    // Scroll to templates section
    setTimeout(() => {
      templatesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Listen for openCreditsModal event
  useEffect(() => {
    const handleOpenCredits = () => setIsCreditsModalOpen(true);
    window.addEventListener("openCreditsModal", handleOpenCredits);
    return () => window.removeEventListener("openCreditsModal", handleOpenCredits);
  }, []);

  const handlePhotoUploaded = (file: File) => {
    setUploadedPhotoFile(file);
    setIsPhotoUploadModalOpen(false);
    setIsVideoCategoryModalOpen(true);
  };

  const handleCategorySelected = (categoryId: string) => {
    console.log("Categoria selecionada:", categoryId, "Foto:", uploadedPhotoFile?.name);
    setIsVideoCategoryModalOpen(false);
    setUploadedPhotoFile(null);
    // Aqui pode adicionar lógica de geração
  };

  const openPhotoUploadModal = () => {
    setIsPhotoUploadModalOpen(true);
  };

  const templates = [
    {
      id: 1,
      label: "VIDEO",
      type: "video",
      src: "https://magai.b-cdn.net/image_to_video/templates/template_20260726_060431_ccd6b165.mp4",
      badge: "HOT",
      badgeColor: "from-orange-500 to-red-500",
    },
    {
      id: 2,
      label: "NUDEZ",
      type: "video",
      src: "https://magai.b-cdn.net/image_to_video/templates/template_20260726_014421_bef46ec2.mp4",
      badge: "POPULAR",
      badgeColor: "from-primary to-red-600",
    },
    {
      id: 3,
      label: "TRAJE",
      type: "video",
      src: "https://magai.b-cdn.net/image_to_video/templates/template_20260726_065022_498b4e64.mp4",
      badge: "NOVO",
      badgeColor: "from-emerald-500 to-green-600",
    },
    {
      id: 4,
      label: "POSE",
      type: "image",
      src: "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/imgi_5_imgi-17-image.webp",
      badge: null,
      badgeColor: null,
    },
  ];

  const trustBadges = [
    { icon: Shield, label: "100% Seguro" },
    { icon: EyeOff, label: "Anônimo" },
    { icon: Lock, label: "Criptografado" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenCredits={() => setIsCreditsModalOpen(true)}
        onOpenPhotoGeneration={openPhotoUploadModal}
        onOpenPremiumContent={() => setIsPremiumContentModalOpen(true)}
      />

      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/50" />
        <div className="container relative flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-white/5 rounded-xl"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                <img
                  src="https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/imgi_1_CRIATIVOSIMAGEM(78).jpeg"
                  alt="Magnetize A.I."
                  className="relative h-7 w-auto rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Credits display */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{profile?.credits || 0}</span>
            </div>

            <Button
              onClick={() => setIsCreditsModalOpen(true)}
              className="bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 text-primary-foreground text-xs px-4 py-2 h-9 gap-2 rounded-xl shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-105"
            >
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Adquirir Créditos</span>
              <span className="sm:hidden">Créditos</span>
            </Button>

            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-white/5">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
            </Button>

            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
            >
              {(profile?.display_name || profile?.email || "U")[0].toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container relative px-4 py-8">
        {/* Trust Badges - Mobile */}
        <div className="flex justify-center gap-3 mb-6 md:hidden">
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20"
            >
              <badge.icon className="h-3 w-3 text-success" />
              <span className="text-[10px] font-medium text-success">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Welcome Section */}
        <div className="mb-8 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
                  PAINEL SEGURO
                </span>
                {/* Trust Badges - Desktop */}
                <div className="hidden md:flex gap-2">
                  {trustBadges.map((badge, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20"
                    >
                      <badge.icon className="h-3 w-3 text-success" />
                      <span className="text-xs font-medium text-success">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold text-foreground mt-3">
                Bem-vindo de volta! Vamos criar algo ousado?
              </h1>
              <p className="text-muted-foreground mt-2 max-w-lg">
                Suas atividades são <span className="text-success font-medium">100% anônimas</span>. Nenhum dado é
                armazenado.
              </p>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="mb-10 md:mb-12">
          <div className="relative group rounded-2xl overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-transparent to-primary/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

            <div className="relative card-glass rounded-2xl overflow-hidden border border-primary/20">
              <img
                src="https://magai.b-cdn.net/banners/banner_mobile_69c47c4fb4fe6.gif"
                alt="Banner"
                className="w-full h-auto object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />

              {/* Banner content */}
              <div className="absolute inset-0 flex items-center p-6 md:p-10">
              </div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div ref={templatesRef} className="mb-8 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Top templates da semana
              </h2>
              <p className="text-muted-foreground text-sm mt-1">GERAR PORNÔ</p>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  if (template.label === "NUDEZ") {
                    setIsNudezModalOpen(true);
                  } else if (template.label === "VIDEO") {
                    setIsVideoModalOpen(true);
                  } else if (template.label === "TRAJE") {
                    setIsTrajeModalOpen(true);
                  } else if (template.label === "POSE") {
                    setIsPoseModalOpen(true);
                  }
                }}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden card-glass-hover"
              >
                {/* Glow effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-b from-primary/40 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10" />

                {/* Border gradient */}
                <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent group-hover:from-primary/50 group-hover:via-primary/20 transition-all duration-500">
                  <div className="absolute inset-[1px] rounded-2xl bg-card" />
                </div>

                {/* Content */}
                <div className="relative h-full rounded-2xl overflow-hidden">
                  {template.type === "video" ? (
                    <video
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={template.src} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={template.src}
                      alt={template.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Badge */}
                  {template.badge && (
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${template.badgeColor} shadow-lg`}
                      >
                        {template.badge}
                      </span>
                    </div>
                  )}

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-bold text-sm tracking-wide">{template.label}</span>
                      <div className="h-8 w-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
                        <ChevronRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-12 py-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4 text-success" />
              <span className="text-sm">Criptografia de ponta a ponta</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <EyeOff className="h-4 w-4 text-success" />
              <span className="text-sm">Nenhuma imagem é armazenada</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-sm">Processamento 100% automático</span>
            </div>
          </div>
        </div>
      </main>

      <NudezTemplatesModal
        isOpen={isNudezModalOpen}
        onClose={() => setIsNudezModalOpen(false)}
        onSelectTemplate={(templateId) => {
          console.log("Template selecionado:", templateId);
          setIsNudezModalOpen(false);
        }}
      />

      <VideoTemplatesModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSelectTemplate={(templateId) => {
          console.log("Template de vídeo selecionado:", templateId);
          setIsVideoModalOpen(false);
        }}
      />

      <TrajeTemplatesModal
        isOpen={isTrajeModalOpen}
        onClose={() => setIsTrajeModalOpen(false)}
        onSelectTemplate={(templateId) => {
          console.log("Template de traje selecionado:", templateId);
          setIsTrajeModalOpen(false);
        }}
      />

      <PoseTemplatesModal
        isOpen={isPoseModalOpen}
        onClose={() => setIsPoseModalOpen(false)}
        onSelectTemplate={(templateId) => {
          console.log("Template de pose selecionado:", templateId);
          setIsPoseModalOpen(false);
        }}
      />

      <CreditsModal isOpen={isCreditsModalOpen} onClose={() => setIsCreditsModalOpen(false)} />

      <PhotoUploadModal
        isOpen={isPhotoUploadModalOpen}
        onClose={() => setIsPhotoUploadModalOpen(false)}
        onContinue={handlePhotoUploaded}
      />

      <VideoCategoryModal
        isOpen={isVideoCategoryModalOpen}
        onClose={() => {
          setIsVideoCategoryModalOpen(false);
          setUploadedPhotoFile(null);
        }}
        onSelectCategory={handleCategorySelected}
        uploadedImage={uploadedPhotoFile}
      />

      <PremiumContentModal isOpen={isPremiumContentModalOpen} onClose={() => setIsPremiumContentModalOpen(false)} />

      <UserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onOpenCredits={() => setIsCreditsModalOpen(true)}
      />

      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={handleWelcomeClose} onGoToTemplates={handleGoToTemplates} />
    </div>
  );
};

export default Dashboard;
