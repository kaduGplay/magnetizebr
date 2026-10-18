// Facebook Pixel helpers.
// The base pixel code (loader + init + first PageView) is installed in index.html
// so it runs on every page of the site, including direct/refresh loads.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

type FbqEventParams = Record<string, unknown>;

const safeFbq = (...args: unknown[]) => {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") {
    // Pixel not yet loaded — retry shortly (script is async in <head>).
    setTimeout(() => {
      if (typeof window.fbq === "function") window.fbq(...args);
    }, 250);
    return;
  }
  window.fbq(...args);
};

// Kept for backwards compatibility with existing imports.
// The base code is now in index.html — this is a no-op.
export const initFacebookPixel = () => {
  /* installed via index.html */
};

export const trackPageView = () => {
  safeFbq("track", "PageView");
  console.log("[FB Pixel] PageView tracked");
};

export const trackViewContent = (data?: {
  content_name?: string;
  value?: number;
  currency?: string;
}) => {
  const params: FbqEventParams = {
    content_name: data?.content_name || "Checkout",
    value: data?.value ?? 0,
    currency: data?.currency || "BRL",
  };
  safeFbq("track", "ViewContent", params);
  console.log("[FB Pixel] ViewContent tracked:", params);
};

export const trackInitiateCheckout = (data?: {
  content_name?: string;
  value?: number;
  currency?: string;
}) => {
  const params: FbqEventParams = {
    content_name: data?.content_name || "Checkout",
    value: data?.value ?? 0,
    currency: data?.currency || "BRL",
  };
  safeFbq("track", "InitiateCheckout", params);
  console.log("[FB Pixel] InitiateCheckout tracked:", params);
};

export const trackAddPaymentInfo = (data?: {
  content_name?: string;
  value?: number;
  currency?: string;
}) => {
  const params: FbqEventParams = {
    content_name: data?.content_name || "PIX",
    value: data?.value ?? 0,
    currency: data?.currency || "BRL",
  };
  safeFbq("track", "AddPaymentInfo", params);
  console.log("[FB Pixel] AddPaymentInfo tracked:", params);
};

export const trackPurchase = (data?: {
  value?: number;
  currency?: string;
  content_name?: string;
}) => {
  const params: FbqEventParams = {
    value: data?.value ?? 0,
    currency: data?.currency || "BRL",
    content_name: data?.content_name || "Plano Magnetize",
  };
  safeFbq("track", "Purchase", params);
  console.log("[FB Pixel] Purchase tracked:", params);
};
