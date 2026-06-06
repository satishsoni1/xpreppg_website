import { useState, useEffect, useRef } from "react";
import { Lock } from "lucide-react";

interface ImageSliderProps {
  images: string[];
  alt: string;
  className?: string;
  intervalMs?: number;
  /** Show a watermark overlay (for protected previews) */
  protected?: boolean;
}

export default function ImageSlider({
  images,
  alt,
  className = "",
  intervalMs = 2800,
  protected: isProtected = true,
}: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, intervalMs);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    start();
    return stop;
  }, [images.length, intervalMs]);

  return (
    <div
      className={`relative select-none overflow-hidden ${className}`}
      onContextMenu={e => e.preventDefault()}
      onDragStart={e => e.preventDefault()}
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      {/* Slides */}
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={src}
            alt={`${alt} ${i + 1}`}
            draggable="false"
            className="w-full h-full object-cover"
            style={{ pointerEvents: "none", userSelect: "none" }}
          />
        </div>
      ))}

      {/* Watermark */}
      {isProtected && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex flex-col items-center justify-around">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="text-white/20 font-bold text-xs whitespace-nowrap tracking-widest select-none"
              style={{ transform: "rotate(-35deg)" }}
            >
              © XREVISE — Preview Only
            </span>
          ))}
        </div>
      )}

      {/* Protected badge */}
      {isProtected && (
        <div className="absolute top-2 left-2 z-30 bg-black/40 text-white/80 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none select-none">
          <Lock size={9} /> Protected
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-30 flex gap-1.5 justify-center items-end pb-2 pointer-events-none">
          {images.map((src, i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded overflow-hidden border-2 ${
                i === current
                  ? "border-white w-10 h-10 shadow-lg"
                  : "border-white/40 w-7 h-7 opacity-60"
              }`}
            >
              <img
                src={src}
                alt={`thumb ${i + 1}`}
                draggable="false"
                className="w-full h-full object-cover"
                style={{ pointerEvents: "none" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 z-30 flex gap-1 pointer-events-none">
          {images.map((_, i) => (
            <span
              key={i}
              className={`block rounded-full transition-all duration-300 ${
                i === current ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
