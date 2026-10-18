const VIDEO_URL = "https://r2.fivemanage.com/SyCMQhFllZwEwx3Q4tCjM/undress.webm";

interface RevealSliderProps {
  className?: string;
}

export const RevealSlider = ({ className }: RevealSliderProps) => {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <video
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="block w-full h-full object-cover"
        aria-label="Vídeo de apresentação"
      />
    </div>
  );
};
