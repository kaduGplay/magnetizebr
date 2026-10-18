import { X, Zap, Shield, EyeOff } from "lucide-react";

interface CreateAccountModalProps {
  isOpen: boolean;
  onCreateAccount: () => void;
  onLogin: () => void;
  onClose: () => void;
}

const CreateAccountModal = ({
  isOpen,
  onCreateAccount,
  onLogin,
  onClose,
}: CreateAccountModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative max-w-sm w-full rounded-[1.75rem] border border-white/10 bg-[#0a0a0a] p-8 text-center shadow-2xl shadow-red-950/40">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-5 top-5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Lock icon */}
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 rounded-2xl bg-red-600/40 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/60">
            <span className="text-4xl" role="img" aria-label="Cadeado">🔒</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-3xl font-extrabold text-foreground mb-3">
          Quase lá!
        </h3>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Para resgatar sua imagem processada, você precisa criar uma conta
        </p>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onCreateAccount}
          className="w-full h-14 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-red-700 via-red-600 to-red-700 shadow-[0_0_35px_-5px_rgba(220,38,38,0.7)] hover:shadow-[0_0_45px_-5px_rgba(220,38,38,0.9)] hover:brightness-110 active:scale-[0.99] transition-all duration-300"
        >
          Criar Conta Grátis
        </button>

        {/* Secondary CTA */}
        <button
          type="button"
          onClick={onLogin}
          className="mt-4 w-full h-14 rounded-2xl text-lg font-bold text-foreground border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
        >
          Já tenho conta
        </button>

        {/* Trust line */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground/80">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Rápido
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Seguro
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-1.5">
            <EyeOff className="h-3.5 w-3.5" />
            100% Privado
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountModal;
