/**
 * Pré-carrega imagens e vídeos após o carregamento inicial.
 * O uso do cache depende do navegador e das configurações do servidor.
 */
const CDN = "https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/";

const REMOTE_IMAGES: readonly string[] = [
  "imgi_1_CRIATIVOSIMAGEM(78).jpeg",
  "PAGAMENTOSEGURO.png",
  "Designsemnome.gif",
  "imgi_3_imgi-9-image.webp",
  "imgi_4_imgi-4-image.webp",
  "imgi_5_imgi-17-image.webp",
  "imgi_2_imgi_2_fast_gen_68f80b8fab671.jpeg",
  "imgi_3_imgi_3_fast_gen_68f80d021f551(1).jpeg",
  "imgi_4_imgi_4_fast_gen_68f80d7a13310.jpeg",
  "imgi_5_imgi_5_fast_gen_68f80e03c6398.jpeg",
  "imgi_6_imgi_6_fast_gen_68f80e789f90a.jpeg",
  "imgi_7_imgi_7_fast_gen_68f80f3dc980f.jpeg",
  "imgi_8_imgi_8_fast_gen_68f80f76d6989.jpeg",
  "imgi_9_imgi_9_fast_gen_68f810293faab.jpeg",
  "imgi_10_imgi_10_fast_gen_68f932c45336c.jpeg",
  "imgi_11_imgi_11_fast_gen_68f939d0db8a3.jpeg",
  "imgi_12_imgi_12_fast_gen_68f93b3aea822.jpeg",
  "imgi_13_imgi_13_fast_gen_68f93d35c3cce.jpeg",
].map((f) => CDN + f);

const REMOTE_VIDEOS: readonly string[] = [
  CDN + "MAGNETIZEFeitocomoClipchamp.mp4",

  // Novo vídeo da capa do card VIDEO.
  "https://magai.b-cdn.net/image_to_video/templates/template_20260726_060431_ccd6b165.mp4",
];

// Todas as imagens locais (templates, premium, logo) resolvidas pelo Vite.
const LOCAL_IMAGES = Object.values(
  import.meta.glob<string>("/src/assets/**/*.{webp,jpg,jpeg,png}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
);

const preloadImage = (src: string): void => {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
};

const preloadVideo = (src: string): void => {
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.src = src;
  video.load();
};

let started = false;

export function preloadAllAssets(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const run = () => {
    [...REMOTE_IMAGES, ...LOCAL_IMAGES].forEach(preloadImage);
    REMOTE_VIDEOS.forEach(preloadVideo);
  };

  const schedule = () => {
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void) => void;
      }
    ).requestIdleCallback;

    if (ric) ric(run);
    else setTimeout(run, 200);
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
}
