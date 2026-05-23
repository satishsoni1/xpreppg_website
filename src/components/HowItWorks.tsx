import { BookMarked, PenLine, BarChart2, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: BookMarked,
    step: "01",
    title: "Revise",
    description: "Each day follows the structured 15-day PYT schedule. Know exactly what to study — no guesswork, no overwhelm.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    icon: PenLine,
    step: "02",
    title: "Test",
    description: "Take 50 high-yield MCQs from that day's topics. Active testing — not passive reading — is what builds real recall.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: BarChart2,
    step: "03",
    title: "Analyze",
    description: "Instantly review your score, accuracy, weak areas, and revision insights. Understand exactly where you need to improve.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Improve",
    description: "Use your insights to revise smarter on the next cycle. Repeated revision compounds — every session makes you stronger.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 block">
            The Method
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy mb-4">
            How XREVISE Works
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-navy mx-auto rounded-full" />
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-accent via-primary to-accent opacity-20" />

          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className={`bg-white rounded-2xl p-8 border ${s.border} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 ${s.bg} rounded-xl flex items-center justify-center border ${s.border}`}>
                    <s.icon className={`w-7 h-7 ${s.color}`} />
                  </div>
                  <span className="text-4xl font-black text-gray-100">{s.step}</span>
                </div>
                <h3 className={`text-2xl font-bold ${s.color} mb-3`}>{s.title}</h3>
                <p className="text-gray-600 leading-relaxed">{s.description}</p>
              </div>

              {/* Arrow between steps (mobile/tablet) */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex lg:hidden absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom emphasis */}
        <div className="mt-16 text-center">
          <p className="text-2xl font-bold text-navy">
            Repeated Revision Improves Recall.{" "}
            <span className="text-primary">Better Recall Improves Confidence.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
