import { useState, useEffect, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  access_code: string;
  email: string | null;
  display_name: string | null;
  credits: number;
  is_premium: boolean;
  premium_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

type AuthResult = { error: { message: string } | null; needsConfirmation?: boolean };

/** Traduz mensagens de erro comuns do serviço de login. */
const translateError = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered")) return "Este e-mail já tem uma conta. Faça login.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("password")) return "Senha fraca ou inválida (mínimo 6 caracteres).";
  return msg;
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
    if (error) console.error("Error loading profile:", error);
    setProfile((data as UserProfile | null) ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        // Evita deadlock: busca fora do callback
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id);
      else setIsLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session?.user, loadProfile]);

  const signUp = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin, data: { display_name: name.trim() } },
    });
    if (error) return { error: { message: translateError(error.message) } };
    return { error: null, needsConfirmation: !data.session };
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: { message: translateError(error.message) } };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return {
    profile,
    isLoading,
    // Sessão válida já conta como logado (evita "deslogar" enquanto o perfil carrega)
    isAuthenticated: !!session,
    hasSession: !!session,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };
};
