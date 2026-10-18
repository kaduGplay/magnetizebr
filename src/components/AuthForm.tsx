import { useState } from "react";
import { Loader2, AlertCircle, MailCheck, User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export type AuthMode = "login" | "signup";

interface AuthFormProps {
  initialMode?: AuthMode;
  onSuccess: () => void;
}

interface FieldProps extends React.ComponentProps<typeof Input> {
  id: string;
  label: string;
  icon: React.ElementType;
  trailing?: React.ReactNode;
}

/** Campo com ícone à esquerda, no estilo do site. */
const Field = ({ id, label, icon: Icon, trailing, className, ...props }: FieldProps) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </Label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
      <Input
        id={id}
        className={cn(
          "h-12 pl-11 pr-11 rounded-xl bg-secondary/60 border-border focus-visible:ring-primary/60 focus-visible:border-primary/60 transition-colors",
          className,
        )}
        {...props}
      />
      {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  </div>
);

/** Formulário de login/cadastro com nome (ou apelido), e-mail e senha. */
const AuthForm = ({ initialMode = "signup", onSuccess }: AuthFormProps) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmSent, setConfirmSent] = useState(false);

  const switchMode = (m: AuthMode) => { setMode(m); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && name.trim().length < 2) return setError("Digite seu nome ou apelido.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Digite um e-mail válido.");
    if (password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");

    setLoading(true);
    const res = mode === "signup" ? await signUp(name, email, password) : await signIn(email, password);
    setLoading(false);
    if (res.error) return setError(res.error.message);
    if (res.needsConfirmation) return setConfirmSent(true);
    onSuccess();
  };

  if (confirmSent) {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center btn-glow">
            <MailCheck className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-foreground">Confirme seu e-mail</h3>
        <p className="text-muted-foreground text-sm">
          Enviamos um link para <strong className="text-foreground">{email}</strong>. Clique nele para ativar sua conta.
        </p>
        <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => { setConfirmSent(false); switchMode("login"); }}>
          Já confirmei, entrar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="text-center">
        <div className="relative inline-flex mb-4">
          <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full animate-pulse" />
          <img
            src="https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/imgi_1_CRIATIVOSIMAGEM(78).jpeg"
            alt="Magnetize"
            className="relative h-12 w-auto rounded-xl glow-ring"
          />
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-foreground">
          {mode === "signup" ? <>Crie sua <span className="text-gradient">conta</span></> : <>Bem-vindo <span className="text-gradient">de volta</span></>}
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          {mode === "signup" ? "Leva menos de 1 minuto" : "Entre com seu e-mail e senha"}
        </p>
      </div>

      {/* Abas */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-secondary/60 border border-border" role="tablist">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={cn(
              "h-10 rounded-lg text-sm font-semibold transition-all",
              mode === m ? "bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "signup" ? "Criar conta" : "Entrar"}
          </button>
        ))}
      </div>

      <SocialLoginButtons onError={setError} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">ou com e-mail</span>
        </div>
      </div>

      <div className="space-y-4">
        {mode === "signup" && (
          <Field id="auth-name" label="Nome ou apelido" icon={User} value={name} onChange={(e) => setName(e.target.value)} placeholder="Como quer ser chamado" autoComplete="nickname" maxLength={50} />
        )}
        <Field id="auth-email" label="E-mail" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" maxLength={255} />
        <Field
          id="auth-pass"
          label="Senha"
          icon={Lock}
          type={showPass ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          trailing={
            <button type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Esconder senha" : "Mostrar senha"} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive text-sm" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-gradient-primary btn-glow text-primary-foreground font-bold text-lg hover:opacity-95">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {mode === "signup" ? <><Sparkles className="h-5 w-5 mr-1" /> Criar minha conta</> : "Entrar na minha conta"}
            <ArrowRight className="h-5 w-5 ml-1" />
          </>
        )}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-success" /> Seus dados ficam 100% protegidos
      </p>
    </form>
  );
};

export default AuthForm;
