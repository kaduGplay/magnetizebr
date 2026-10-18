import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UtmParams {
  src?: string | null;
  sck?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_medium?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

interface CreatePixPaymentRequest {
  planId: string;
  planName: string;
  amount: number; // in cents from frontend
  credits?: number;
  isLifetime?: boolean;
  isPremium?: boolean;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerDocument?: string;
  utmParams?: UtmParams;
}

const DEFAULT_CUSTOMER = {
  name: "Usuario Anonimo",
  email: "clienteia@gmail.com",
  document: "085.943.527-00",
  phone: "(11) 99999-9999",
} as const;

// Retry helper function
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  delayMs = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`KorePay v2 request attempt ${attempt}/${maxRetries}`);
      const response = await fetch(url, options);

      if (response.ok || response.status < 500) {
        return response;
      }

      const errorData = await response.clone().json().catch(() => ({}));
      console.log(`KorePay server error (attempt ${attempt}):`, errorData);
      lastError = new Error(errorData.message || `Server error: ${response.status}`);
    } catch (error) {
      console.log(`KorePay network error (attempt ${attempt}):`, error);
      lastError = error instanceof Error ? error : new Error("Network error");
    }

    if (attempt < maxRetries) {
      console.log(`Waiting ${delayMs}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= 1.5;
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Chaves VoidPay (fallback para nomes antigos)
    const KOREPAY_PUBLIC_KEY = Deno.env.get("VOIDPAY_PUBLIC_KEY") || Deno.env.get("KOREPAY_PUBLIC_KEY");
    const KOREPAY_SECRET_KEY = Deno.env.get("VOIDPAY_SECRET_KEY") || Deno.env.get("KOREPAY_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!KOREPAY_PUBLIC_KEY || !KOREPAY_SECRET_KEY) {
      console.error("Missing KorePay API keys");
      throw new Error("Payment configuration error");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      throw new Error("Database configuration error");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: CreatePixPaymentRequest = await req.json();
    console.log("Received payment request:", JSON.stringify(body));

    const { planId, planName, amount, customerName, customerEmail, customerPhone, customerDocument } = body;

    if (!planId || !amount) {
      throw new Error("Missing required fields: planId and amount");
    }

    // Frontend sends amount in cents, KorePay v2 expects reais
    const amountInCents = Math.round(amount);
    const amountInReais = amountInCents / 100;

    // Resolve customer data
    const resolvedName = (customerName || DEFAULT_CUSTOMER.name).trim();
    const resolvedEmail = (
      customerEmail || DEFAULT_CUSTOMER.email
    ).trim();
    const resolvedPhone = (customerPhone || DEFAULT_CUSTOMER.phone).trim();
    const resolvedDocument = (customerDocument || DEFAULT_CUSTOMER.document).trim();

    // Generate unique identifier for KorePay v2
    const identifier = crypto.randomUUID().replace(/-/g, "").substring(0, 16);

    // KorePay v2 payload
    const korepayPayload = {
      identifier,
      amount: amountInReais,
      client: {
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
        document: resolvedDocument,
      },
      products: [
        {
          id: planId,
          name: planName,
          quantity: 1,
          price: amountInReais,
        },
      ],
      metadata: {
        planId,
        planName,
        credits: body.credits || 0,
        isLifetime: body.isLifetime || false,
        isPremium: body.isPremium || false,
        userId: body.userId || null,
      },
      // callbackUrl omitido: webhook cadastrado no painel (limite de 20 webhooks na conta)
    };

    console.log("Sending request to KorePay v2:", JSON.stringify(korepayPayload));

    const korepayResponse = await fetchWithRetry(
      "https://dash.voidpayments.com/api/v1/gateway/pix/receive",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-public-key": KOREPAY_PUBLIC_KEY,
          "x-secret-key": KOREPAY_SECRET_KEY,
        },
        body: JSON.stringify(korepayPayload),
      },
      3,
      1000
    );

    const responseText = await korepayResponse.text();
    console.log("KorePay v2 raw response:", responseText.substring(0, 500));

    let korepayData: Record<string, unknown>;
    try {
      korepayData = JSON.parse(responseText);
    } catch {
      console.error("KorePay returned non-JSON response:", responseText.substring(0, 200));
      throw new Error("KorePay retornou uma resposta inválida. Tente novamente.");
    }

    console.log("KorePay v2 response:", JSON.stringify(korepayData));

    if (!korepayResponse.ok) {
      console.error("KorePay v2 error:", korepayData);
      throw new Error((korepayData.message as string) || "Failed to create payment");
    }

    // Extract PIX data from v2 response
    const pixCode = korepayData.pix?.code || "";
    const pixBase64 = korepayData.pix?.base64 || "";
    const pixImage = korepayData.pix?.image || "";
    const transactionIdFromKorepay = korepayData.transactionId || "";
    const orderUrl = korepayData.order?.url || "";
    const orderReceiptUrl = korepayData.order?.receiptUrl || "";

    const userId = body.userId || null;
    const creditsFromRequest = body.credits || 0;
    const isLifetimeFromRequest = body.isLifetime || false;
    const isPremiumFromRequest = body.isPremium || false;
    const utmParamsFromRequest = body.utmParams || null;

    // Save transaction to database
    const { data: transaction, error: dbError } = await supabase
      .from("pix_transactions")
      .insert({
        korepay_id: transactionIdFromKorepay,
        amount: amountInCents,
        status: korepayData.status === "OK" ? "waiting_payment" : (korepayData.status || "waiting_payment"),
        pix_qrcode: pixCode,
        pix_expiration_date: null,
        customer_name: resolvedName,
        customer_email: resolvedEmail,
        customer_phone: resolvedPhone,
        customer_document: resolvedDocument,
        secure_url: orderUrl,
        secure_id: korepayData.order?.id || null,
        postback_url: `${SUPABASE_URL}/functions/v1/korepay-webhook`,
        user_id: userId,
        utm_params: utmParamsFromRequest,
        metadata: {
          planId,
          planName,
          credits: creditsFromRequest,
          isLifetime: isLifetimeFromRequest,
          isPremium: isPremiumFromRequest,
          identifier,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save transaction");
    }

    console.log("Transaction saved:", transaction.id);

    // Send waiting_payment event to Utmify (fire and forget)
    const utmifyPayload = {
      orderId: transaction.id,
      status: "waiting_payment",
      createdAt: transaction.created_at,
      approvedDate: null,
      refundedAt: null,
      customerName: resolvedName,
      customerEmail: resolvedEmail,
      customerPhone: resolvedPhone,
      customerDocument: resolvedDocument,
      productId: planId,
      productName: planName,
      planId: planId,
      planName: planName,
      priceInCents: amountInCents,
      utmParams: utmParamsFromRequest,
      isTest: false,
    };

    fetch(`${SUPABASE_URL}/functions/v1/utmify-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(utmifyPayload),
    })
      .then((res) => res.json())
      .then((data) => console.log("Utmify waiting_payment sent:", data))
      .catch((err) => console.error("Error sending to Utmify:", err));

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transaction.id,
        korepayId: transactionIdFromKorepay,
        pixQrcode: pixCode,
        pixBase64: pixBase64,
        pixImage: pixImage,
        pixExpirationDate: null,
        secureUrl: orderUrl,
        status: korepayData.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error creating PIX payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
