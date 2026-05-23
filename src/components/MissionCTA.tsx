import { ArrowRight, Brain } from "lucide-react";

export default function MissionCTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-navy relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-10">
          <Brain className="w-4 h-4 text-accent" />
          <span className="text-white/60 text-sm font-medium">Our Mission</span>
        </div>

        <blockquote className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
          Repeated Revision Improves Recall.
          <span className="block text-accent mt-2">Better Recall Improves Confidence.</span>
        </blockquote>

        <p className="text-xl text-white/50 mb-4 leading-relaxed max-w-2xl mx-auto">
          XREVISE is built to help every NEET PG aspirant revise in a smarter, simpler, and more consistent way.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white/40 text-base mb-12 font-medium">
          {["Revise daily.", "Practice actively.", "Analyze mistakes.", "Improve consistently."].map((t, i) => (
            <span key={i} className="flex items-center gap-3">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />}
              <span>{t}</span>
            </span>
          ))}
        </div>

        <button
          onClick={() => {
            window.dispatchEvent(new Event("open-register-modal"));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="group inline-flex items-center gap-3 bg-primary hover:bg-primaryDark text-white px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50"
        >
          Join XREVISE — Start Day 1
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-white/30 text-sm mt-6">
          XREVISE · A Structured 15-Day PYT Recall Program
        </p>
      </div>
    </section>
  );
}
