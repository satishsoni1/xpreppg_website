import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, ChevronRight, Lock, Star,
  Zap, CalendarDays, Target, ImageIcon,
  LayoutGrid, BookOpen, Layers, Timer,
} from "lucide-react";
import { PublicAPI } from "@/services/publicApi";

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

const SUBJECT_ICONS: Record<string, string> = {
  Anatomy: "🫀",
  Physiology: "⚡",
  Biochemistry: "🧬",
  Pathology: "🔬",
  Pharmacology: "💊",
  Microbiology: "🦠",
  "Community Medicine": "🏥",
  "Forensic Medicine": "⚖️",
  "Obstetrics & Gynecology": "👶",
  Pediatrics: "🧒",
  Medicine: "🩺",
  Surgery: "✂️",
  Orthopedics: "🦴",
  Ophthalmology: "👁️",
  ENT: "👂",
  Dermatology: "🩹",
  Psychiatry: "🧠",
  Radiology: "☢️",
};

interface Poster {
  id: number;
  title: string;
  subject: string;
  price: number;
  original_price?: number;
  image_url: string;
}

function MiniProtectedImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative w-full h-full select-none overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <img
        src={src} alt={alt} draggable="false"
        className="w-full h-full object-cover"
        style={{ pointerEvents: "none", userSelect: "none" }}
      />
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-around overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-white/20 font-bold text-[9px] whitespace-nowrap tracking-widest select-none" style={{ transform: "rotate(-35deg)" }}>
            © XREVISE Preview
          </span>
        ))}
      </div>
      <div className="absolute bottom-1 right-1 bg-black/40 text-white/70 text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 pointer-events-none select-none">
        <Lock size={7} /> Protected
      </div>
    </div>
  );
}

export default function PosterShopSection() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Poster[]>([]);
  const [subjects, setSubjects] = useState<{ subject: string; count: number }[]>([]);

  useEffect(() => {
    PublicAPI.getPosters().then(res => {
      if (res.status && Array.isArray(res.posters)) setFeatured(res.posters.slice(0, 6));
    });
    PublicAPI.getPosterSubjects().then(res => {
      if (res.status && Array.isArray(res.subjects)) setSubjects(res.subjects);
    });
  }, []);

  const goToShop = (subject?: string) =>
    navigate(subject ? `/shop?subject=${encodeURIComponent(subject)}` : "/shop");

  const displaySubjects = subjects.length > 0
    ? subjects.slice(0, 8)
    : Object.keys(SUBJECT_ICONS).slice(0, 8).map(s => ({ subject: s, count: 0 }));

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
            onClick={() => goToShop()}
            className="shrink-0 flex items-center gap-2 bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg"
          >
            <ShoppingBag size={16} /> Browse Posters <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Browse by Subject ─────────────────────────────────────────── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-navy text-xl">Browse by Subject</h3>
            <button onClick={() => goToShop()} className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {displaySubjects.map(({ subject, count }) => (
              <button
                key={subject}
                onClick={() => goToShop(subject)}
                className="group flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl p-4 hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-200"
              >
                <span className="text-2xl">{SUBJECT_ICONS[subject] ?? "📌"}</span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors text-center leading-tight">{subject}</span>
                {count > 0 && <span className="text-[10px] text-gray-400">{count} poster{count !== 1 ? "s" : ""}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Featured Posters ──────────────────────────────────────────── */}
        {featured.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h3 className="font-bold text-navy text-xl">Featured Posters</h3>
              </div>
              <button onClick={() => goToShop()} className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                Shop all <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featured.map(poster => {
                const discount = poster.original_price
                  ? Math.round((1 - poster.price / poster.original_price) * 100) : 0;
                return (
                  <div
                    key={poster.id}
                    onClick={() => goToShop()}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-secondaryDark transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <MiniProtectedImage src={poster.image_url} alt={poster.title} />
                    </div>
                    <div className="p-3">
                      {poster.subject && (
                        <span className="text-[10px] font-bold text-primary bg-secondary px-2 py-0.5 rounded-full">{poster.subject}</span>
                      )}
                      <p className="font-semibold text-gray-900 text-xs leading-snug mt-1.5 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {poster.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-navy text-sm">₹{poster.price}</span>
                        {discount > 0 && <span className="text-[10px] font-bold text-green-600">{discount}% off</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Build Bundle CTA ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-primary via-primaryDark to-navy rounded-2xl p-8 md:p-10 text-center">
          <p className="text-accent text-xs font-bold uppercase tracking-widest mb-3">Build Your Bundle</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Mix & Match Across All Subjects
          </h3>
          <p className="text-white/70 max-w-xl mx-auto mb-7 text-base">
            Add Anatomy, Pharmacology, Pathology and more to your cart — order as one bundle and get everything delivered together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => goToShop()}
              className="flex items-center justify-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full font-bold hover:bg-secondary transition-colors shadow-lg"
            >
              <ShoppingBag size={18} /> Start Building Your Bundle
            </button>
            <a
              href="https://wa.me/918446036521"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-3.5 rounded-full font-bold hover:bg-white/20 transition-colors"
            >
              Custom / Bulk Order
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
