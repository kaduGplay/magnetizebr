import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionMetadata {
  planId?: string;
  planName?: string;
  credits?: number;
  isLifetime?: boolean;
  isPremium?: boolean;
}

interface UtmParams {
  src?: string | null;
  sck?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_medium?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      throw new Error("Database configuration error");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    // Log seguro: sem token, CPF ou dados do cliente
    console.log("Received gateway webhook event:", body?.event, "tx:", body?.transaction?.id, "status:", body?.transaction?.status);

    // Validação do token (VoidPay). Só aplicada se GATEWAY_WEBHOOK_TOKEN estiver configurado.
    const expectedToken = Deno.env.get("GATEWAY_WEBHOOK_TOKEN");
    if (expectedToken && body?.token !== expectedToken) {
      console.warn("Invalid webhook token");
      return new Response(JSON.stringify({ success: false, error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }
    if (body?.event && !["TRANSACTION_PAID"].includes(body.event) && !body.transaction) {
      return new Response(JSON.stringify({ success: true, message: "Event ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    // KorePay v2 webhook callback format
    // The callback sends: { event, token, transaction: { id, identifier, status, ... }, ... }
    const transaction = body.transaction || body.data?.transaction || {};
    const korepayId = String(
      transaction.id || body.transactionId || body.data?.transactionId || body.id || ""
    );
    const rawStatus = transaction.status || body.status || body.data?.status;
    const paidAt = transaction.payedAt || body.paidAt || transaction.approvedDate || body.approvedDate;

    // Map KorePay v2 statuses to our internal statuses
    // v2 statuses: OK, FAILED, PENDING, REJECTED, CANCELED
    let status: string;
    switch (rawStatus) {
      case "OK":
      case "paid":
      case "COMPLETED":
        status = "paid";
        break;
      case "PENDING":
      case "waiting_payment":
        status = "waiting_payment";
        break;
      case "FAILED":
      case "REJECTED":
        status = "failed";
        break;
      case "CANCELED":
      case "refunded":
        status = "refunded";
        break;
      default:
        status = rawStatus || "unknown";
    }

    console.log("Processing webhook - KorePay ID:", korepayId, "Raw status:", rawStatus, "Mapped status:", status);

    if (!korepayId) {
      throw new Error("Missing transaction ID in webhook");
    }

    const updateData: Record<string, unknown> = { status };

    if (paidAt && status === "paid") {
      updateData.paid_at = paidAt;
    }

    // Find the transaction by korepay_id
    let { data: existingTx, error: findError } = await supabase
      .from("pix_transactions")
      .select("*")
      .eq("korepay_id", korepayId)
      .maybeSingle();

    // Fallback: busca pelo identifier que enviamos ao criar o PIX
    if (!existingTx && !findError && transaction.identifier) {
      ({ data: existingTx, error: findError } = await supabase
        .from("pix_transactions")
        .select("*")
        .eq("metadata->>identifier", String(transaction.identifier))
        .maybeSingle());
    }

    if (findError) {
      console.error("Error finding transaction:", findError);
      throw new Error("Failed to find transaction");
    }

    if (!existingTx) {
      console.log("Transaction not found for KorePay ID:", korepayId);
      return new Response(
        JSON.stringify({ success: true, message: "Transaction not found, ignored" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Idempotência: se já está pago, não credita de novo
    if (existingTx.status === "paid") {
      return new Response(JSON.stringify({ success: true, message: "Already processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    // Update the transaction
    const { data: updatedTx, error: dbError } = await supabase
      .from("pix_transactions")
      .update(updateData)
      .eq("id", existingTx.id)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to update transaction");
    }

    console.log("Transaction updated:", updatedTx?.id, "Status:", status);

    // Process payment confirmation
    if (status === "paid" && updatedTx) {
      console.log("Payment confirmed for transaction:", updatedTx.id);

      const metadata = updatedTx.metadata as TransactionMetadata | null;
      const userId = updatedTx.user_id;

      if (userId && metadata) {
        const credits = metadata.credits || 0;
        const planId = metadata.planId || "unknown";
        const planName = metadata.planName || "Plano";
        const isLifetime = metadata.isLifetime || false;
        const isPremium = metadata.isPremium || false;

        console.log("Processing credits for user:", userId, "Credits:", credits);

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, credits, is_premium")
          .eq("id", userId)
          .single();

        if (userError) {
          console.error("Error fetching user:", userError);
        } else if (userData) {
          const newCredits = (userData.credits || 0) + credits;
          const updateUserData: Record<string, unknown> = { credits: newCredits };

          if (isPremium) {
            updateUserData.is_premium = true;
            if (isLifetime) {
              updateUserData.premium_expires_at = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
            } else {
              updateUserData.premium_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            }
          }

          const { error: updateError } = await supabase
            .from("users")
            .update(updateUserData)
            .eq("id", userId);

          if (updateError) {
            console.error("Error updating user credits:", updateError);
          } else {
            console.log("User credits updated. New balance:", newCredits);
          }

          const { error: planError } = await supabase
            .from("user_plans")
            .insert({
              user_id: userId,
              plan_id: planId,
              plan_name: planName,
              credits_purchased: credits,
              amount_paid: updatedTx.amount,
              is_lifetime: isLifetime,
            });

          if (planError) {
            console.error("Error recording plan:", planError);
          }

          const { error: txError } = await supabase
            .from("credit_transactions")
            .insert({
              user_id: userId,
              amount: credits,
              transaction_type: "purchase",
              description: `Compra: ${planName}`,
              pix_transaction_id: updatedTx.id,
            });

          if (txError) {
            console.error("Error recording credit transaction:", txError);
          }

          // Send paid event to Utmify
          const utmParams = updatedTx.utm_params as UtmParams | null;
          const utmifyPayload = {
            orderId: updatedTx.id,
            status: "paid",
            createdAt: updatedTx.created_at,
            approvedDate: paidAt || new Date().toISOString(),
            refundedAt: null,
            customerName: updatedTx.customer_name || "Usuário Anônimo",
            customerEmail: updatedTx.customer_email || "anonimo@magnetize.ai",
            customerPhone: updatedTx.customer_phone,
            customerDocument: updatedTx.customer_document,
            productId: planId,
            productName: planName,
            planId: planId,
            planName: planName,
            priceInCents: updatedTx.amount,
            utmParams: utmParams,
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
            .then((data) => console.log("Utmify paid event sent:", data))
            .catch((err) => console.error("Error sending paid event to Utmify:", err));
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
