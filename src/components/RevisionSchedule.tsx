import { Calendar } from "lucide-react";

const days = [
  { day: 1, subjects: ["Anatomy", "Orthopedics"] },
  { day: 2, subjects: ["Biochemistry", "FMT"] },
  { day: 3, subjects: ["Physiology", "Pharmacology"] },
  { day: 4, subjects: ["Pathology", "Microbiology"] },
  { day: 5, subjects: ["PSM", "Obstetrics & Gynecology"] },
  { day: 6, subjects: ["ENT", "Ophthalmology"] },
  { day: 7, subjects: ["Pediatrics", "Anaesthesia"] },
  { day: 8, subjects: ["Medicine", "Dermatology", "Psychiatry"] },
  { day: 9, subjects: ["Surgery", "Radiology"] },
  { day: 10, subjects: ["Anatomy", "Orthopedics", "Radiology", "ENT"] },
  { day: 11, subjects: ["Surgery", "Anaesthesia", "Ophthalmology"] },
  { day: 12, subjects: ["Biochemistry", "Physiology", "FMT"] },
  { day: 13, subjects: ["Pharmacology", "Pathology", "Microbiology"] },
  { day: 14, subjects: ["Medicine", "Pediatrics", "Dermatology", "Psychiatry"] },
  { day: 15, subjects: ["Obstetrics & Gynecology", "PSM"] },
];

// Generate real calendar dates starting from tomorrow
function getStartDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(base: Date, offset: number) {
  const d = new Date(base);
  d.setDate(base.getDate() + offset);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export default function RevisionSchedule() {
  const startDate = getStartDate();

  return (
    <section id="schedule" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-navy to-navyLight">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-accent font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 block">
            Structured Revision
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            15-Day PYT Recall Schedule
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-accent to-primary mx-auto rounded-full mb-6" />
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Date-wise subject plan — starting {formatDate(startDate, 0)}. Every day builds on the last.
          </p>
        </div>

        {/* Schedule grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
          {days.map(({ day, subjects }, idx) => {
            const isRevision = day > 9;
            const dateLabel = formatDate(startDate, idx);

            return (
              <div
                key={day}
                className={`relative rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 ${
                  isRevision ? "border-accent/30 bg-white/5" : "border-white/10 bg-white/5"
                }`}
              >
                {/* Date + Day badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isRevision ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                  }`}>
                    <Calendar className="w-3 h-3" />
                    Day {day}
                  </div>
                  {isRevision && (
                    <div className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full">
                      RAPID
                    </div>
                  )}
                </div>

                {/* Calendar date */}
                <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-3">
                  {dateLabel}
                </p>

                {/* Subjects */}
                <div className="space-y-1.5">
                  {subjects.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRevision ? "bg-accent" : "bg-primary"}`} />
                      <span className="text-white/80 text-sm font-medium leading-tight">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Phase legend */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary/20 border border-primary/30" />
            <span className="text-white/60 text-sm">Days 1–9: First Revision Cycle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-accent/20 border border-accent/30" />
            <span className="text-white/60 text-sm">Days 10–15: Rapid Recall Cycle</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-white/5 border border-white/10 rounded-2xl px-10 py-8">
            <div className="text-left">
              <p className="text-white font-bold text-xl mb-1">50 MCQs per daily test</p>
              <p className="text-white/50 text-sm">High-yield questions from that day's PYT topics</p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new Event("open-register-modal"))}
              className="bg-primary hover:bg-primaryDark text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-primary/30 whitespace-nowrap"
            >
              Start Day 1 — {formatDate(startDate, 0)}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
