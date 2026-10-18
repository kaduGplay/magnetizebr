import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const imageAssets = import.meta.glob<string>(
  "/src/assets/**/*.{png,jpg,jpeg,webp,avif,gif,svg,ico}",
  { eager: true, query: "?url", import: "default" },
);
const publicAssets = import.meta.glob(
  "/public/**/*.{png,jpg,jpeg,webp,avif,gif,svg,ico}",
  { eager: true, query: "?url", import: "default" },
);

let started = false;
const pendingImages = new Set<HTMLImageElement>();

function preloadImages() {
  if (started) return;
  started = true;
  const urls = [...new Set([
    ...Object.values(imageAssets),
    ...Object.keys(publicAssets).map(path => path.replace(/^\/public/, "")),
  ])];
  let next = 0;
  const loadNext = () => {
    const url = urls[next++];
    if (!url) return;
    const image = new Image();
    image.fetchPriority = "low";
    pendingImages.add(image);
    const finish = () => {
      image.onload = null;
      image.onerror = null;
      pendingImages.delete(image);
      loadNext();
    };
    image.onload = finish;
    image.onerror = finish;
    image.src = url;
  };
  // Keep bandwidth available for the visible page while warming the cache.
  for (let i = 0; i < Math.min(4, urls.length); i++) loadNext();
}

export default function SiteNavigationEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;
    preloadImages();
    // Include remote images as soon as the landing page renders them.
    const loadRenderedImages = () => {
      document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach(image => {
        image.loading = "eager";
      });
    };
    loadRenderedImages();
    const observer = new MutationObserver(loadRenderedImages);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["loading"],
    });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
