import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, X, ArrowRight } from "lucide-react";

export default function PosterAnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  if (!visible) return null;

  return (
    <div className="sticky top-28 z-40 w-full bg-gradient-to-r from-primary to-primaryDark shadow-md shadow-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">

        {/* Left: icon + message */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-white/20 rounded-full p-1.5 shrink-0">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <p className="text-white text-sm font-semibold truncate">
            <span className="hidden sm:inline">New — </span>
            <span className="font-bold">XREVISE Medical Posters</span>
            <span className="hidden sm:inline text-white/80"> · Stick. Revise. Recall.</span>
          </p>
        </div>

        {/* Centre: CTA */}
        <button
          onClick={() => navigate("/shop")}
          className="shrink-0 flex items-center gap-1.5 bg-white text-primary font-bold text-xs px-4 py-1.5 rounded-full hover:bg-secondary transition-colors shadow-sm"
        >
          Shop Posters <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Right: close */}
        <button
          onClick={() => setVisible(false)}
          className="shrink-0 text-white/60 hover:text-white transition-colors ml-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
