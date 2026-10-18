import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "@/components/AuthForm";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
      </div>
      <div className="relative w-full max-w-md card-glass border-primary/20 rounded-3xl p-6 md:p-8">
        <AuthForm
          initialMode={params.get("mode") === "signup" ? "signup" : "login"}
          onSuccess={() => navigate("/dashboard")}
        />
      </div>
    </div>
  );
};

export default Auth;
