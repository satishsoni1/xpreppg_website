import { Star, Target, AlertTriangle, BarChart2, Lightbulb } from "lucide-react";

const metrics = [
  { icon: Star, label: "Test Score", description: "Instant score out of 50 after every daily test" },
  { icon: Target, label: "Accuracy Analysis", description: "See what percentage you're getting right vs. wrong" },
  { icon: BarChart2, label: "Performance Review", description: "Overall performance tracking across all sessions" },
  { icon: AlertTriangle, label: "Weak Area Identification", description: "Pinpoint exactly which topics need more revision" },
  { icon: Lightbulb, label: "Revision Insights", description: "Actionable guidance on what to revisit before the next cycle" },
];

export default function PerformanceSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <span className="text-primary font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 block">
              After Every Test
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-navy mb-6 leading-tight">
              Know Exactly<br />Where You Stand
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              After every daily test, XREVISE gives you a complete performance breakdown — so every session makes you measurably better, not just busier.
            </p>

            <div className="space-y-4">
              {metrics.map(({ icon: Icon, label, description }) => (
                <div key={label} className="flex items-start gap-4 p-4 rounded-xl border border-secondaryMiddle hover:border-primaryDeep/30 hover:bg-secondary transition-all duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy mb-0.5">{label}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual mock */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl" />
            <div className="relative bg-navy rounded-3xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <p className="text-white font-bold text-lg">Day 4 Results</p>
                <span className="bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full">Pathology + Microbiology</span>
              </div>

              {/* Score ring visual */}
              <div className="flex items-center gap-6 mb-8 p-5 bg-white/5 rounded-2xl border border-white/10">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#2563EB" strokeWidth="10"
                      strokeDasharray="201" strokeDashoffset="50" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-black text-lg">38</span>
                  </div>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Score out of 50</p>
                  <p className="text-white font-bold text-2xl">76%</p>
                  <p className="text-accent text-sm font-medium">Accuracy</p>
                </div>
              </div>

              {/* Subject breakdown */}
              <div className="space-y-3 mb-8">
                {[
                  { label: "Pathology", score: 82, color: "bg-accent" },
                  { label: "Microbiology", score: 68, color: "bg-primary" },
                ].map(({ label, score, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">{label}</span>
                      <span className="text-white font-semibold">{score}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-accent text-xs font-bold uppercase tracking-wider mb-1">Revision Insight</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  Microbiology needs more attention — revisit Gram stain patterns and antibiotic mechanisms before Day 13 cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
