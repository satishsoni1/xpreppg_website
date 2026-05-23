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

const phaseColors = [
  "border-primary/40 bg-primary/5",
  "border-navyLight/40 bg-navyLight/5",
];

export default function RevisionSchedule() {
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
            Day-by-day subject plan — from Anatomy on Day 1 to OBG + PSM on Day 15. Every day builds on the last.
          </p>
        </div>

        {/* Schedule grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
          {days.map(({ day, subjects }) => {
            const isRevision = day > 9;
            return (
              <div
                key={day}
                className={`relative rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 ${
                  isRevision
                    ? "border-accent/30 bg-white/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {/* Day badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                  isRevision
                    ? "bg-accent/20 text-accent"
                    : "bg-primary/20 text-primary"
                }`}>
                  <Calendar className="w-3 h-3" />
                  Day {day}
                </div>
                {isRevision && (
                  <div className="absolute top-3 right-3 bg-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full">
                    RAPID
                  </div>
                )}

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

        {/* Phase labels */}
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
              Start Day 1 Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
