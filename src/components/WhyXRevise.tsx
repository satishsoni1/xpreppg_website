import { AlertCircle, CheckCircle2 } from "lucide-react";

const struggles = [
  "Struggling to increase the number of correct questions?",
  "Losing marks due to negative marking?",
  "Feeling confident but still getting answers wrong?",
  "Making repeated mistakes in high-yield topics?",
  "Finding it difficult to retain repeatedly revised concepts?",
  "Feeling overwhelmed by the vast syllabus?",
];

const solutions = [
  "Structured schedules — know exactly what to revise each day",
  "Focused PYT-based tests — only what matters in the exam",
  "Active recall — testing, not just re-reading",
  "Daily manageable targets — no burnout, just progress",
  "800+ PYT topics — covering every repeated concept",
  "Performance analysis — identify and fix weak areas fast",
];

export default function WhyXRevise() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 block">
            Is This You?
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy mb-4 leading-tight">
            NEET PG Isn't About<br />Reading Endlessly
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-navy mx-auto rounded-full mb-6" />
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            It's about repeated revision, regular testing, active recall, identifying mistakes, and improving consistently.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Pain points */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Many students struggle because they…</h3>
            </div>
            <div className="space-y-4">
              {struggles.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-red-50/60 border border-red-100">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-500 text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-navy">XREVISE solves this with…</h3>
            </div>
            <div className="space-y-4">
              {solutions.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-secondary border border-secondaryMiddle">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-gray-700 font-medium leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            {/* Mission pull-quote */}
            <div className="mt-8 bg-navy rounded-2xl p-8 text-center">
              <p className="text-white/70 text-lg leading-relaxed">
                "Repeated Revision Improves Recall.<br />
                <span className="text-accent font-semibold">Better Recall Improves Confidence.</span>"
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
