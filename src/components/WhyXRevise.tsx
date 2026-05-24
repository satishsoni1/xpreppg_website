import { CheckCircle2 } from "lucide-react";

const solutions = [
  {
    title: "Structured Daily Schedules",
    desc: "Know exactly what to revise each day — no guesswork, no wasted time.",
  },
  {
    title: "Focused PYT-Based Tests",
    desc: "Only high-yield, previously asked concepts — exactly what matters in the exam.",
  },
  {
    title: "Active Recall Over Re-reading",
    desc: "Daily MCQ testing that forces retrieval and burns concepts into long-term memory.",
  },
  {
    title: "Daily Manageable Targets",
    desc: "Bite-sized revision cycles — consistent progress without burnout.",
  },
  {
    title: "5000+ Previous Year MCQs",
    desc: "Covering every repeatedly asked topic across NEET PG, INI-CET, FMGE, AIIMS & PGI.",
  },
  {
    title: "Performance Analysis",
    desc: "Identify weak areas, track improvement, and fix mistakes after every test.",
  },
];

export default function WhyXRevise() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 block">
            Why XREVISE
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy mb-4 leading-tight">
            NEET PG Isn't About<br />Reading Endlessly
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-navy mx-auto rounded-full mb-6" />
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            It's about repeated revision, regular testing, active recall, identifying mistakes, and improving consistently.
          </p>
        </div>

        {/* Solutions grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {solutions.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-secondary border border-secondaryMiddle hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-navy text-sm mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mission pull-quote */}
        <div className="bg-navy rounded-2xl p-10 text-center">
          <p className="text-white/70 text-xl leading-relaxed max-w-2xl mx-auto">
            "Repeated Revision Improves Recall.<br />
            <span className="text-accent font-semibold">Better Recall Improves Confidence.</span>"
          </p>
        </div>
      </div>
    </section>
  );
}
