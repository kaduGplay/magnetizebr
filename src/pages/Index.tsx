import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ImageUploadSection from "@/components/ImageUploadSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SecuritySection from "@/components/SecuritySection";
import FAQSection from "@/components/FAQSection";
import LoadingModal from "@/components/LoadingModal";
import { useUtmCapture } from "@/hooks/useUtmParams";

const Index = () => {
  // Capture UTM params from URL on landing
  useUtmCapture();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (_file: File) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  const openDashboard = () => navigate("/dashboard");

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      <main>
        <HeroSection onCTAClick={openDashboard} />
        <ImageUploadSection onImageSelect={handleImageSelect} />
        <WhyChooseSection onCTAClick={scrollToUpload} />
        <HowItWorksSection onCTAClick={scrollToUpload} />
        <SecuritySection />
        <FAQSection onCTAClick={scrollToUpload} />
      </main>
      
      {/* Footer */}
      <footer className="relative py-10 border-t border-border/50">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <div className="container relative text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img 
              src="https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/imgi_1_CRIATIVOSIMAGEM(78).jpeg" 
              alt="Magnetize Logo" 
              className="h-6 w-auto rounded"
            />
            <span className="font-bold text-foreground">Magnetize A.I.</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Magnetize A.I. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <LoadingModal isOpen={isLoading} message="GERANDO IMAGEM" />
    </div>
  );
};

export default Index;
