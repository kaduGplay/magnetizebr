import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Copy, 
  ArrowLeft, 
  Shield, 
  Lock, 
  Clock, 
  CheckCircle,
  Loader2,
  Coins,
  AlertCircle,
  QrCode,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import magnetizeLogo from "@/assets/magnetize-logo-icon.png";
import GuaranteeSection from "@/components/checkout/GuaranteeSection";
import TestimonialsCarousel from "@/components/checkout/TestimonialsCarousel";
import { trackViewContent, trackInitiateCheckout, trackAddPaymentInfo } from "@/lib/facebook-pixel";

interface PixPaymentData {
  pixQrcode: string;
  pixExpirationDate: string;
  transactionId: string;
}

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const hasGeneratedPix = useRef(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  const loadingMessages = [
    "Conectando ao banco...",
    "Gerando código PIX...",
    "Validando transação...",
    "Preparando QR Code...",
    "Finalizando..."
  ].filter(Boolean);

  const planId = searchParams.get("plan") || "";
  const planName = searchParams.get("name") || "";
  const amount = parseInt(searchParams.get("amount") || "0");
  const credits = parseInt(searchParams.get("credits") || "0");
  const isLifetime = searchParams.get("isLifetime") === "true";
  const isPremium = searchParams.get("isPremium") === "true";

  // Capture UTM parameters from URL
  const utmParams = {
    src: searchParams.get("src") || null,
    sck: searchParams.get("sck") || null,
    utm_source: searchParams.get("utm_source") || null,
    utm_campaign: searchParams.get("utm_campaign") || null,
    utm_medium: searchParams.get("utm_medium") || null,
    utm_content: searchParams.get("utm_content") || null,
    utm_term: searchParams.get("utm_term") || null,
  };

  // Facebook Pixel - ViewContent + InitiateCheckout on checkout page
  useEffect(() => {
    const valueInReais = amount / 100;
    trackViewContent({
      content_name: planName || 'Checkout',
      value: valueInReais,
      currency: 'BRL'
    });
    trackInitiateCheckout({
      content_name: planName || 'Checkout',
      value: valueInReais,
      currency: 'BRL'
    });
  }, [planName, amount]);

  useEffect(() => {
    if (hasGeneratedPix.current || pixData) return;
    if (!planId || !planName || !Number.isFinite(amount) || amount <= 0) {
      setError("Dados do plano inválidos");
      setIsLoading(false);
      return;
    }
    hasGeneratedPix.current = true;
    void generatePix();
  }, [planId, planName, amount, pixData]);

  const generatePix = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingStep(0);
    
    // Animação de loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1500);
    
    try {
      // Mantém a identificação do pagamento sem exigir login ou cadastro.
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      let userId = sessionData.session?.user.id;
      if (!userId) {
        const { data: guestData, error: guestError } = await supabase.auth.signInAnonymously();
        if (guestError) {
          throw new Error("Não foi possível iniciar o acesso de visitante. Verifique se o acesso anônimo está habilitado no Supabase.");
        }
        userId = guestData.user?.id;
      }
      if (!userId) throw new Error("Não foi possível identificar o pagamento.");

      const { data, error } = await supabase.functions.invoke("create-pix-payment", {
        body: {
          planId,
          planName,
          amount,
          credits,
          isLifetime,
          isPremium,
          userId,
          utmParams,
        },
      });

      clearInterval(stepInterval);

      if (error) {
        console.error("Error creating payment:", error);
        let details: { error?: string; message?: string; msg?: string } | null = null;
        const response = error.context instanceof Response ? error.context : null;
        if (response) {
          details = await response.clone().json().catch(() => null);
        }
        const reason = details?.error || details?.message || details?.msg;
        const knownErrors: Record<string, string> = {
          "Payment configuration error": "As credenciais do provedor Pix não estão configuradas no servidor.",
          "Database configuration error": "A conexão do serviço de pagamento com o banco não está configurada.",
          "Failed to save transaction": "O provedor respondeu, mas não foi possível salvar a cobrança. Não gere outra antes de verificar o pagamento.",
          "Invalid JWT": "A sessão de pagamento foi recusada pelo servidor. Atualize a página e tente novamente.",
        };
        if (reason && knownErrors[reason]) throw new Error(knownErrors[reason]);
        if (response?.status === 404) {
          throw new Error("O serviço de geração de Pix não está disponível no servidor (404).");
        }
        if (response?.status === 401 || response?.status === 403) {
          throw new Error("O servidor recusou o acesso ao serviço Pix. Verifique a configuração da função de pagamento.");
        }
        throw new Error(reason
          ? `Não foi possível gerar o Pix: ${reason}`
          : "Não foi possível conectar ao serviço Pix. Verifique a conexão e a disponibilidade do servidor.");
      }

      if (data?.success && data?.pixQrcode) {
        setPixData({
          pixQrcode: data.pixQrcode,
          pixExpirationDate: data.pixExpirationDate,
          transactionId: data.transactionId,
        });
        setIsLoading(false);
        // Fire AddPaymentInfo once PIX is ready to be paid
        trackAddPaymentInfo({
          content_name: planName || 'PIX',
          value: amount / 100,
          currency: 'BRL',
        });
      } else {
        throw new Error(data?.error || "O serviço de pagamento não retornou um código PIX.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Não foi possível gerar o PIX.");
      setIsLoading(false);
    } finally {
      clearInterval(stepInterval);
    }
  };

  // Poll for payment status every 5 seconds
  useEffect(() => {
    if (!pixData?.transactionId) return;

    const checkPaymentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("pix_transactions")
          .select("status")
          .eq("id", pixData.transactionId)
          .maybeSingle();

        if (error) {
          console.error("Error checking payment:", error);
          return;
        }

        if (data?.status === "paid" || data?.status === "COMPLETED" || data?.status === "OK") {
          toast.success("Pagamento confirmado!");
          const isPriorityPlan = planId === "priority";
          navigate(`/thank-you?plan=${encodeURIComponent(planName)}&credits=${credits}&amount=${amount}&isPriority=${isPriorityPlan}`);
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      }
    };

    // Check immediately
    checkPaymentStatus();

    // Then poll every 5 seconds
    const interval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(interval);
  }, [pixData?.transactionId, navigate, planName, credits]);

  const copyPixCode = () => {
    if (pixData?.pixQrcode) {
      navigator.clipboard.writeText(pixData.pixQrcode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatPrice = (value: number) => {
    return (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatCredits = (value: number) => {
    if (value >= 999999) return "∞ Ilimitados";
    return value.toLocaleString('pt-BR');
  };

  // Generate QR Code URL using a free API
  const getQrCodeUrl = (code: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/50" />
        <div className="container relative flex h-16 items-center justify-between px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
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

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-success" />
            <span className="text-xs text-success font-medium hidden sm:inline">Pagamento Seguro</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container relative px-4 py-8 md:py-12">
        <div className="max-w-lg mx-auto">
          
          {/* Loading State - Premium Design */}
          {isLoading && (
            <div className="relative rounded-3xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-red-500 to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] p-[2px] rounded-3xl">
                <div className="absolute inset-[2px] bg-gradient-to-b from-zinc-900 to-black rounded-3xl" />
              </div>
              
              <div className="relative p-8 md:p-12 text-center">
                {/* Glowing icon */}
                <div className="relative inline-flex mb-8">
                  <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full animate-pulse" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/40 to-red-500/30 border border-primary/40 flex items-center justify-center shadow-2xl shadow-primary/30">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                  Gerando seu PIX...
                </h2>
                
                {/* Animated step message */}
                <p className="text-white/60 mb-8 h-6 transition-all duration-300">
                  {loadingMessages[loadingStep]}
                </p>
                
                {/* Progress bar */}
                <div className="max-w-xs mx-auto mb-6">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-red-500 transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Steps list */}
                <div className="flex flex-col items-center gap-2 text-sm">
                  {loadingMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        index < loadingStep 
                          ? 'text-green-400' 
                          : index === loadingStep 
                            ? 'text-white' 
                            : 'text-white/30'
                      }`}
                    >
                      {index < loadingStep ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : index === loadingStep ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-white/20" />
                      )}
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
                
                {/* Trust badge */}
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/40">
                  <Lock className="h-3 w-3" />
                  <span>Transação 100% segura e criptografada</span>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="card-glass rounded-3xl p-8 md:p-10 text-center">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-destructive/30 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-destructive/30 to-destructive/10 border border-destructive/30 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Erro ao gerar PIX</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90"
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* PIX Payment */}
          {pixData && !isLoading && (
            <div className="space-y-6">
              {/* Plan Info Card */}
              <div className="card-glass rounded-2xl p-5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-lg shadow-primary/30 p-2">
                      <img 
                        src={magnetizeLogo}
                        alt="Magnetize"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{planName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{formatCredits(credits)} créditos</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">{formatPrice(amount)}</p>
                  </div>
                </div>
                
                {/* Secure Payment Banner */}
                <div className="mt-4">
                  <img 
                    src="https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/PAGAMENTOSEGURO.png"
                    alt="Pagamento Seguro"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>

              {/* PIX Code Card */}
              <div className="card-glass rounded-3xl p-6 md:p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">PIX Gerado com Sucesso</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Pagamento via PIX</h2>
                  <p className="text-muted-foreground">Copie o código abaixo e pague no app do seu banco</p>
                </div>

                {/* QR Code - Desktop: always visible, Mobile: toggle */}
                <div className="mb-6">
                  {/* Desktop QR Code - always visible */}
                  <div className="hidden md:flex justify-center mb-6">
                    <div className="p-4 bg-white rounded-2xl shadow-lg">
                      <img 
                        src={getQrCodeUrl(pixData.pixQrcode)}
                        alt="QR Code PIX"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  {/* Mobile QR Code - toggle button */}
                  <div className="md:hidden">
                    <button
                      onClick={() => setShowQrCode(!showQrCode)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all mb-4"
                    >
                      <QrCode className="h-5 w-5" />
                      <span className="font-medium">
                        {showQrCode ? "Ocultar QR Code" : "Mostrar QR Code"}
                      </span>
                      {showQrCode ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    
                    {showQrCode && (
                      <div className="flex justify-center mb-4 animate-fade-in">
                        <div className="p-4 bg-white rounded-2xl shadow-lg">
                          <img 
                            src={getQrCodeUrl(pixData.pixQrcode)}
                            alt="QR Code PIX"
                            className="w-40 h-40"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PIX Code Display */}
                <div className="bg-secondary/50 border border-border rounded-2xl p-5 mb-6">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                    Código PIX Copia e Cola
                  </p>
                  <div className="bg-background/80 rounded-xl p-4 break-all border border-border">
                    <p className="text-foreground/80 text-sm font-mono leading-relaxed">
                      {pixData.pixQrcode.length > 120 
                        ? `${pixData.pixQrcode.substring(0, 120)}...` 
                        : pixData.pixQrcode}
                    </p>
                  </div>
                </div>

                {/* Copy Button */}
                <Button
                  onClick={copyPixCode}
                  className={`w-full h-14 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    copied 
                      ? "bg-success hover:bg-success/90" 
                      : "bg-gradient-to-r from-primary via-red-500 to-primary bg-[length:200%_100%] hover:bg-right shadow-lg shadow-primary/30 hover:shadow-primary/50"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Código Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      Copiar Código PIX
                    </>
                  )}
                </Button>

                {/* Timer Info */}
                <div className="flex items-center justify-center gap-2 mt-5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">O código expira em 30 minutos</span>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-amber-950/60 to-amber-900/40 border border-amber-800/40 rounded-2xl p-5 backdrop-blur-sm">
                <p className="text-sm text-amber-300/90 text-center leading-relaxed">
                  Após o pagamento, seus <strong>{formatCredits(credits)} créditos</strong> serão adicionados automaticamente em até 5 minutos.
                </p>
              </div>

              {/* Security Badges */}
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                  <Lock className="h-4 w-4 text-success" />
                  <span className="text-xs font-medium text-success">Criptografado</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="text-xs font-medium text-success">100% Seguro</span>
                </div>
              </div>

              {/* Guarantee Section */}
              <GuaranteeSection />

              {/* Testimonials Carousel */}
              <TestimonialsCarousel />

              {/* Back Button */}
              <Button
                onClick={() => navigate("/dashboard")}
                variant="ghost"
                className="w-full h-12 rounded-xl text-muted-foreground hover:text-foreground"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Checkout;
