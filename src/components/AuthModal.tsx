import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AuthForm, { type AuthMode } from "@/components/AuthForm";

interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
}

const AuthModal = ({ isOpen, mode, onClose }: AuthModalProps) => {
  const navigate = useNavigate();
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md card-glass border-primary/20 rounded-3xl p-6 md:p-8 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-primary/25 blur-[80px]" />
        <DialogTitle className="sr-only">{mode === "signup" ? "Criar conta" : "Entrar"}</DialogTitle>
        <div className="relative">
          <AuthForm key={mode} initialMode={mode} onSuccess={() => { onClose(); navigate("/dashboard"); }} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
