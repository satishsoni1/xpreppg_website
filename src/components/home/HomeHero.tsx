import { ArrowRight, BookOpen, Monitor, Layers, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HIGHLIGHTS = [
  { icon: BookOpen, value: "800+", label: "PYT topics in XRevise" },
  { icon: Monitor, value: "Real", label: "NEET PG, UG & JEE CBT" },
  { icon: Layers, value: "New", label: "NEET PG, FMGE & INI-CET flash cards" },
];

// Decorative stack of flash cards — purely visual, no real content claims
function CardStack() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3.4]" aria-hidden="true">
      <div className="absolute inset-x-10 top-8 bottom-0 rounded-3xl bg-accent/90 rotate-6 shadow-lift" />
      <div className="absolute inset-x-6 top-4 bottom-4 rounded-3xl bg-primary -rotate-3 shadow-lift" />
      <div className="absolute inset-x-2 top-0 bottom-8 rounded-3xl bg-white border border-gray-100 shadow-lift p-7 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary bg-secondary px-3 py-1 rounded-full">Anatomy · Card 12</span>
          <span className="text-[11px] font-semibold text-gray-400">NEET PG · FMGE</span>
        </div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Question</p>
        <p className="text-navy text-xl sm:text-2xl font-bold leading-snug">
          Which nerve supplies motor innervation to the diaphragm?
        </p>
        <div className="mt-auto pt-6 border-t border-dashed border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-400">Flip for answer</span>
          <span className="text-sm font-bold text-primary">Phrenic (C3–C5)</span>
        </div>
      </div>
    </div>
  );
}

export default function HomeHero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary via-white to-white">
      <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-40 -left-40 w-[24rem] h-[24rem] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="text-center lg:text-left">
            <button
              onClick={() => navigate("/flashcards")}
              className="inline-flex items-center gap-2 bg-white border border-secondaryDark rounded-full pl-1.5 pr-4 py-1.5 mb-7 shadow-card hover:border-primary transition group"
            >
              <span className="bg-accent text-navy text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">New</span>
              <span className="text-sm font-semibold text-navy">NEET PG, FMGE & INI-CET flash cards are here</span>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
            </button>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy leading-[1.05] mb-6">
              Prepare smarter for <span className="text-primary">NEET PG</span>, <span className="text-primary">INI-CET</span> &amp; <span className="text-primary">FMGE</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-9">
              Structured revision with XRevise, real exam-style CBT mocks for NEET PG, NEET UG &amp; JEE, and high-yield flash cards &amp; posters delivered to your door.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-12">
              <button
                onClick={() => navigate("/xrevise-program")}
                className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark text-white px-7 py-4 rounded-xl font-bold transition shadow-lift"
              >
                Explore XRevise
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/flashcards")}
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary text-navy px-7 py-4 rounded-xl font-bold transition"
              >
                <Sparkles className="w-5 h-5 text-accent" />
                Shop flash cards
              </button>
            </div>

            <dl className="grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              {HIGHLIGHTS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <dt className="flex items-center justify-center lg:justify-start gap-1.5 text-2xl font-extrabold text-navy">
                    <Icon className="w-4 h-4 text-primary" /> {value}
                  </dt>
                  <dd className="text-xs text-gray-500 mt-1 leading-snug">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <CardStack />
        </div>
      </div>
    </section>
  );
}
