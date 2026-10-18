import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UtmifyCustomer {
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  country?: string;
  ip?: string;
}

interface UtmifyProduct {
  id: string;
  name: string;
  planId: string | null;
  planName: string | null;
  quantity: number;
  priceInCents: number;
}

interface UtmifyTrackingParameters {
  src: string | null;
  sck: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

interface UtmifyCommission {
  totalPriceInCents: number;
  gatewayFeeInCents: number;
  userCommissionInCents: number;
  currency?: string;
}

interface UtmifyOrderPayload {
  orderId: string;
  platform: string;
  paymentMethod: "credit_card" | "boleto" | "pix" | "paypal" | "free_price";
  status: "waiting_payment" | "paid" | "refused" | "refunded" | "chargedback";
  createdAt: string;
  approvedDate: string | null;
  refundedAt: string | null;
  customer: UtmifyCustomer;
  products: UtmifyProduct[];
  trackingParameters: UtmifyTrackingParameters;
  commission: UtmifyCommission;
  isTest?: boolean;
}

interface SendToUtmifyRequest {
  orderId: string;
  status: "waiting_payment" | "paid" | "refused" | "refunded" | "chargedback";
  createdAt: string;
  approvedDate?: string | null;
  refundedAt?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerDocument?: string | null;
  productId: string;
  productName: string;
  planId?: string | null;
  planName?: string | null;
  priceInCents: number;
  utmParams?: {
    src?: string | null;
    sck?: string | null;
    utm_source?: string | null;
    utm_campaign?: string | null;
    utm_medium?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
  } | null;
  isTest?: boolean;
}

// Format date to UTC string in format YYYY-MM-DD HH:MM:SS
function formatDateToUTC(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const UTMIFY_API_TOKEN = Deno.env.get("UTMIFY_API_TOKEN");

    if (!UTMIFY_API_TOKEN) {
      console.error("Missing UTMIFY_API_TOKEN");
      throw new Error("Utmify configuration error - missing API token");
    }

    const body: SendToUtmifyRequest = await req.json();
    console.log("Sending order to Utmify:", JSON.stringify(body));

    const {
      orderId,
      status,
      createdAt,
      approvedDate,
      refundedAt,
      customerName,
      customerEmail,
      customerPhone,
      customerDocument,
      productId,
      productName,
      planId,
      planName,
      priceInCents,
      utmParams,
      isTest
    } = body;

    // Calculate commission (assuming 5% gateway fee for example)
    const gatewayFeePercent = 0.05;
    const gatewayFeeInCents = Math.round(priceInCents * gatewayFeePercent);
    const userCommissionInCents = priceInCents - gatewayFeeInCents;

    // Build Utmify payload
    const utmifyPayload: UtmifyOrderPayload = {
      orderId,
      platform: "Magnetize",
      paymentMethod: "pix",
      status,
      createdAt: formatDateToUTC(createdAt),
      approvedDate: approvedDate ? formatDateToUTC(approvedDate) : null,
      refundedAt: refundedAt ? formatDateToUTC(refundedAt) : null,
      customer: {
        name: customerName || "Usuário Anônimo",
        email: customerEmail || "anonimo@magnetize.ai",
        phone: customerPhone ? customerPhone.replace(/\D/g, '') : null,
        document: customerDocument ? customerDocument.replace(/\D/g, '') : null,
        country: "BR"
      },
      products: [
        {
          id: productId,
          name: productName,
          planId: planId || null,
          planName: planName || null,
          quantity: 1,
          priceInCents
        }
      ],
      trackingParameters: {
        src: utmParams?.src || null,
        sck: utmParams?.sck || null,
        utm_source: utmParams?.utm_source || null,
        utm_campaign: utmParams?.utm_campaign || null,
        utm_medium: utmParams?.utm_medium || null,
        utm_content: utmParams?.utm_content || null,
        utm_term: utmParams?.utm_term || null
      },
      commission: {
        totalPriceInCents: priceInCents,
        gatewayFeeInCents,
        userCommissionInCents,
        currency: "BRL"
      },
      isTest: isTest || false
    };

    console.log("Utmify payload:", JSON.stringify(utmifyPayload));

    // Send to Utmify API
    const utmifyResponse = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": UTMIFY_API_TOKEN
      },
      body: JSON.stringify(utmifyPayload)
    });

    const utmifyData = await utmifyResponse.json();
    console.log("Utmify response:", JSON.stringify(utmifyData), "Status:", utmifyResponse.status);

    if (!utmifyResponse.ok) {
      console.error("Utmify API error:", utmifyData);
      // Don't throw - we don't want to break the flow if Utmify fails
      return new Response(
        JSON.stringify({
          success: false,
          error: utmifyData.message || "Utmify API error",
          details: utmifyData
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 // Return 200 to avoid retries, log the error
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order sent to Utmify successfully",
        data: utmifyData
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error: unknown) {
    console.error("Error sending to Utmify:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Return 200 to avoid breaking the main flow
      }
    );
  }
});
