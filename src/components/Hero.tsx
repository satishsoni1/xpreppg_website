import { ArrowRight, Brain, BookOpen, Calendar, BarChart2, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.18)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(147,197,253,0.08)_0%,_transparent_60%)]" />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(147,197,253,1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className={`relative max-w-7xl mx-auto w-full pt-24 pb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left — Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-white/70 text-sm font-medium tracking-wide">Structured PYT Recall Program</span>
            </div>

            {/* Brand name */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-4 leading-none">
              <span className="text-primary">X</span>
              <span className="text-white">REVISE</span>
            </h1>

            {/* Tagline */}
            <p className="text-2xl sm:text-3xl font-semibold text-white/80 mb-3 tracking-wide">
              Revise. Test. Analyze. Improve.
            </p>

            <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              A focused NEET PG revision program built around 800+ Previously Asked Topics — structured, daily, and results-driven.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10">
              {[
                { icon: BookOpen, value: "800+", label: "PYT Topics" },
                { icon: Calendar, value: "15", label: "Day Schedule" },
                { icon: Brain, value: "50", label: "MCQs/Day" },
                { icon: BarChart2, value: "750+", label: "High-Yield MCQs" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className="w-4 h-4 text-accent" />
                    <span className="text-3xl font-bold text-white">{value}</span>
                  </div>
                  <span className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <button
                onClick={() => window.dispatchEvent(new Event("open-register-modal"))}
                className="group flex items-center gap-3 bg-primary hover:bg-primaryDark text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50"
              >
                Join XREVISE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#schedule"
                className="flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
              >
                View 15-Day Schedule
              </a>
            </div>
          </div>

          {/* Right — Logo card */}
          <div className="flex-shrink-0 w-full max-w-sm">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl scale-110" />
              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm text-center">
                <img src={logo} alt="XREVISE Logo" className="w-48 mx-auto mb-6 drop-shadow-lg" />
                <div className="border-t border-white/10 pt-6 space-y-3">
                  {[
                    "NEET PG · INI-CET · FMGE",
                    "AIIMS · PGI",
                  ].map((t) => (
                    <p key={t} className="text-white/50 text-sm font-medium">{t}</p>
                  ))}
                  <p className="text-accent font-bold text-base pt-1">Repeated Revision Builds Recall</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
        <span className="text-white text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-4 h-4 text-white animate-bounce" />
      </div>
    </section>
  );
}
