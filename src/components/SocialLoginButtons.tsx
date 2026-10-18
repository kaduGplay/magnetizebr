import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";

type Provider = "google" | "apple";

interface SocialLoginButtonsProps {
  onError: (message: string) => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.27-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 2.99.72 1.24-.02 2.02-1.12 2.77-2.23.88-1.28 1.24-2.52 1.26-2.59-.03-.01-2.4-.92-2.4-3.67zM14.1 5.85c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.28z" />
  </svg>
);

/** Botões de entrar com Google e Apple. */
const SocialLoginButtons = ({ onError }: SocialLoginButtonsProps) => {
  const [loading, setLoading] = useState<Provider | null>(null);

  const login = async (provider: Provider) => {
    setLoading(provider);
    // Marca que, ao voltar do Google/Apple, a pessoa deve ir para o painel
    localStorage.setItem("oauth_redirect", "/dashboard");
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) {
      localStorage.removeItem("oauth_redirect");
      onError("Não foi possível entrar. Tente novamente.");
      setLoading(null);
      return;
    }
    if (result.redirected) return;
    // Sessão criada: o app reage pelo onAuthStateChange
    localStorage.removeItem("oauth_redirect");
    window.location.href = "/dashboard";
  };

  const cls = "h-12 rounded-xl bg-secondary/60 border-border hover:bg-secondary hover:border-primary/40 font-semibold";

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button type="button" variant="outline" className={cls} disabled={!!loading} onClick={() => login("google")}>
        {loading === "google" ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />} Google
      </Button>
      <Button type="button" variant="outline" className={cls} disabled={!!loading} onClick={() => login("apple")}>
        {loading === "apple" ? <Loader2 className="h-5 w-5 animate-spin" /> : <AppleIcon />} Apple
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
