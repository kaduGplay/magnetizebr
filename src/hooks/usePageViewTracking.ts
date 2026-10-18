import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/facebook-pixel";

/**
 * Fires a Meta Pixel PageView on every client-side route change.
 * The initial PageView is fired by the base pixel code in index.html,
 * so we skip the first render to avoid duplicate events.
 */
export const usePageViewTracking = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackPageView();
  }, [location.pathname, location.search]);
};
