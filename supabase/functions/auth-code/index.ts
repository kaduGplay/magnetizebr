import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: "generate" | "login";
  accessCode?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: RequestBody = await req.json();

    if (body.action === "generate") {
      // Generate unique 6-digit code
      let accessCode: string;
      let codeExists = true;
      let attempts = 0;
      const maxAttempts = 10;

      while (codeExists && attempts < maxAttempts) {
        accessCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("access_code", accessCode)
          .maybeSingle();
        
        codeExists = !!existing;
        attempts++;
      }

      if (codeExists) {
        throw new Error("Não foi possível gerar um código único. Tente novamente.");
      }

      // Create new user with the code
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          access_code: accessCode!,
          credits: 0,
          is_premium: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating user:", insertError);
        throw new Error("Erro ao criar usuário");
      }

      return new Response(
        JSON.stringify({
          success: true,
          accessCode: newUser.access_code,
          userId: newUser.id,
          credits: newUser.credits,
          isPremium: newUser.is_premium,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (body.action === "login") {
      const accessCode = body.accessCode?.trim();

      // Validate: exactly 6 digits
      if (!accessCode || !/^\d{6}$/.test(accessCode)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Código inválido. Digite 6 números.",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Find user by access code
      const { data: user, error: findError } = await supabase
        .from("users")
        .select("*")
        .eq("access_code", accessCode)
        .maybeSingle();

      if (findError) {
        console.error("Error finding user:", findError);
        throw new Error("Erro ao buscar usuário");
      }

      if (!user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Código não encontrado. Verifique e tente novamente.",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          userId: user.id,
          accessCode: user.access_code,
          credits: user.credits,
          isPremium: user.is_premium,
          premiumExpiresAt: user.premium_expires_at,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    throw new Error("Ação inválida");
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
