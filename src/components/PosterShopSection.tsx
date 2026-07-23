import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ShoppingBag, ChevronRight,
  Zap, CalendarDays, Target, ImageIcon,
  LayoutGrid, BookOpen, Layers, Timer,
  ShoppingCart,
} from "lucide-react";
import { POSTER_PACKAGES, type PosterPackage } from "@/data/posterPackages";
import { PublicAPI } from "@/services/publicApi";
import ImageSlider from "@/components/ImageSlider";

const FEATURES = [
  {
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    border: "border-yellow-100",
    title: "High-Yield Rapid Recall",
    desc: "Designed for quick retention and faster revision during the final months before the exam.",
  },
  {
    icon: CalendarDays,
    color: "text-primary",
    bg: "bg-secondary",
    border: "border-secondaryDark",
    title: "Subject-Wise Planning",
    desc: "Daily targets and organised revision schedules keep students disciplined and consistent.",
  },
  {
    icon: Target,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
    title: "Improves MCQ Accuracy",
    desc: "Targets concepts where students commonly err — boosts correct attempts, confidence, and reduces negative marking.",
  },
  {
    icon: ImageIcon,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    title: "Image-Based Learning",
    desc: "Includes pathology, radiology, histopathology, clinical photos, flowcharts & tables — essential for image-based NEET PG questions.",
  },
  {
    icon: LayoutGrid,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    title: "Wall Revision Posters",
    desc: "Specially designed to help students revise passively throughout the day, improve visual memory and retain difficult concepts faster.",
  },
  {
    icon: BookOpen,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
    title: "Exam-Oriented Content",
    desc: "Every poster is crafted around high-frequency exam patterns from NEET PG, INI-CET, FMGE, AIIMS & PGI.",
  },
  {
    icon: Layers,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    title: "Concept + Image Integration",
    desc: "Every topic carries high-yield facts, one-line recall points, integrated images, and buzzwords frequently asked in exams.",
  },
  {
    icon: Timer,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    title: "Final Revision Phase Ready",
    desc: "Perfect for the last 3–6 months — rapid revisions, short revision cycles, and improving recall speed under exam pressure.",
  },
];


function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 px-3 py-1 bg-gray-100 rounded-full">{label}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export default function PosterShopSection() {
  const navigate = useNavigate();
  const goToShop = () => navigate("/shop");

  const [allPackages, setAllPackages] = useState<PosterPackage[]>(POSTER_PACKAGES);

  useEffect(() => {
    PublicAPI.getPosterPackages().then(res => {
      if (res.status && res.packages?.length) {
        setAllPackages(res.packages);
      }
    }).catch(() => {});
  }, []);

  const shortCombo   = allPackages.filter(p => p.subject === "Short Subject Combo");
  const mediumCombos = allPackages.filter(p => p.subject === "Medium Subject Combo");
  const longPacks    = allPackages.filter(p => p.subject === "Long Subject Pack");

  return (
    <section className="py-20 bg-gradient-to-b from-white via-secondary to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ────────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <span className="bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-primary/20 inline-flex items-center gap-1.5 mb-4">
            <ShoppingBag size={12} /> XREVISE Posters
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
            Study Smarter with Visual Posters
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            High-yield, image-rich revision posters designed specifically for NEET PG, INI-CET & FMGE — built for the final months of preparation.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-6" />
        </div>

        {/* ── Features Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl border ${f.border} bg-white p-5 hover:shadow-lg transition-all duration-300 group`}
            >
              <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── What's Inside callout ─────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-navy to-navyLight rounded-2xl p-6 md:p-8 mb-14 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">What's inside every poster</p>
            <h3 className="text-xl font-bold text-white mb-3">Concept + Image + Recall — All in One</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["🎯", "High-yield facts"],
                ["📝", "One-line recall points"],
                ["🖼️", "Integrated images"],
                ["🔑", "Exam buzzwords"],
              ].map(([emoji, label]) => (
                <div key={label} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5 text-white/90 text-xs font-semibold">
                  <span>{emoji}</span> {label}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={goToShop}
            className="shrink-0 flex items-center gap-2 bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg"
          >
            <ShoppingBag size={16} /> Browse Posters <ChevronRight size={16} />
          </button>
        </div>

        {/* ── All 9 Products ────────────────────────────────────────────── */}
        <div className="space-y-8 mb-12">

          {/* Short Subject Combo */}
          <div>
            <SectionDivider label="Short Subject Combo" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shortCombo.map(pack => (
                <ProductCard key={pack.id} pack={pack} onClick={goToShop} />
              ))}
            </div>
          </div>

          {/* Medium Subject Combos */}
          <div>
            <SectionDivider label="Medium Subject Combos" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {mediumCombos.map(pack => (
                <ProductCard key={pack.id} pack={pack} onClick={goToShop} />
              ))}
            </div>
          </div>

          {/* Long Subject Packs */}
          <div>
            <SectionDivider label="Long Subject Packs" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {longPacks.map(pack => (
                <ProductCard key={pack.id} pack={pack} onClick={goToShop} />
              ))}
            </div>
          </div>
        </div>

        {/* ── View All CTA ──────────────────────────────────────────────── */}
        <div className="text-center">
          <button
            onClick={goToShop}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primaryDark text-white px-10 py-4 rounded-full font-bold text-base transition-colors shadow-lg"
          >
            <ShoppingCart size={18} /> Order Now — ₹319 onwards
          </button>
          <p className="text-gray-400 text-xs mt-3">+ Delivery charge applies based on order quantity</p>
        </div>

      </div>
    </section>
  );
}

// ── Product card (home page preview) ─────────────────────────────────────────
function ProductCard({ pack, onClick }: { pack: PosterPackage; onClick: () => void }) {
  const discount = pack.original_price
    ? Math.round((1 - pack.price / pack.original_price) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-secondaryDark transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <ImageSlider
          images={[pack.image_url, ...(pack.image_url2 ? [pack.image_url2] : [])]}
          alt={pack.title}
          className="w-full h-full"
          intervalMs={3200}
        />
        {discount > 0 && (
          <span className="absolute top-2 right-2 z-40 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
        )}
      </div>
      <div className="p-4">
        <span className="text-[10px] font-bold text-primary bg-secondary px-2 py-0.5 rounded-full">{pack.subject}</span>
        <p className="font-semibold text-gray-900 text-sm leading-snug mt-2 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {pack.title}
        </p>
        <p className="text-gray-400 text-[10px] mb-2">{pack.poster_count}</p>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-navy text-base">₹{pack.price}</span>
          {pack.original_price && <span className="text-xs text-gray-400 line-through">₹{pack.original_price}</span>}
        </div>
      </div>
    </div>
  );
}
