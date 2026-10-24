import { useState } from "react";
import { Calendar, ChevronRight } from "lucide-react";

// ── Static subject pattern (same across all 4 phases) ────────────────────────
export const DAY_PATTERN = [
  { day: 1,  subjects: ["Anatomy", "Ortho"],                              isRevision: false },
  { day: 2,  subjects: ["Biochemistry", "FMT"],                           isRevision: false },
  { day: 3,  subjects: ["Physiology", "Pharmacology"],                    isRevision: false },
  { day: 4,  subjects: ["Pathology", "Microbiology"],                     isRevision: false },
  { day: 5,  subjects: ["PSM", "OBG"],                                    isRevision: false },
  { day: 6,  subjects: ["ENT", "Ophthalmology"],                          isRevision: false },
  { day: 7,  subjects: ["Paediatrics", "Anaesthesia"],                    isRevision: false },
  { day: 8,  subjects: ["Medicine", "Dermatology", "Psychiatry"],         isRevision: false },
  { day: 9,  subjects: ["Surgery", "Radiology"],                          isRevision: false },
  { day: 10, subjects: ["Anatomy", "Ortho", "Radiology", "ENT"],          isRevision: true  },
  { day: 11, subjects: ["Surgery", "Anaesthesia", "Ophthalmology"],       isRevision: true  },
  { day: 12, subjects: ["Biochemistry", "Physiology", "FMT"],             isRevision: true  },
  { day: 13, subjects: ["Pharmacology", "Pathology", "Microbiology"],     isRevision: true  },
  { day: 14, subjects: ["Medicine", "Paediatrics", "Dermatology", "Psychiatry"], isRevision: true },
  { day: 15, subjects: ["OBG", "PSM"],                                    isRevision: true  },
];

// ── Phase config (start dates are 0-indexed month) ───────────────────────────
export const PHASES = [
  { label: "Phase 1", range: "15 Jun – 29 Jun", start: new Date(2026, 5, 15) },
  { label: "Phase 2", range: "30 Jun – 14 Jul", start: new Date(2026, 5, 30) },
  { label: "Phase 3", range: "15 Jul – 29 Jul", start: new Date(2026, 6, 15) },
  { label: "Phase 4", range: "30 Jul – 13 Aug", start: new Date(2026, 6, 30) },
];

export function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(base.getDate() + n);
  return d;
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtShort(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// Determine the active phase from today
function getActivePhase(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (today >= PHASES[i].start) return i;
  }
  return 0; // default to Phase 1 if before June 15
}

export default function RevisionSchedule({ standalone = true }: { standalone?: boolean }) {
  const [active, setActive] = useState(getActivePhase);

  const phase = PHASES[active];

  const content = (
    <div className="max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      {standalone && (
        <div className="text-center mb-12">
          <span className="text-accent font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 block">
            4 Phases · 60 Days · Structured Revision
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            PYT Recall Schedule
          </h2>
          {/* Tagline */}
          <p className="text-2xl sm:text-3xl font-bold text-accent mb-4 tracking-wide">
            Stick. Revise. Recall.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-accent to-primary mx-auto rounded-full mb-5" />
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            15 Jun 2026 – 13 Aug 2026 &nbsp;·&nbsp; 4 Phases × 15 Days &nbsp;·&nbsp; Every day has a subject, a test, a score.
          </p>
        </div>
      )}

      {/* ── Phase tabs ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {PHASES.map((p, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex flex-col items-center px-5 py-3 rounded-2xl font-semibold text-sm transition-all border ${
              active === i
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105"
                : "bg-white/5 border-white/15 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="font-bold text-base">{p.label}</span>
            <span className={`text-xs mt-0.5 ${active === i ? "text-white/80" : "text-white/50"}`}>{p.range}</span>
          </button>
        ))}
      </div>

      {/* ── Phase summary bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3 mb-8 w-fit mx-auto">
        <Calendar className="w-4 h-4 text-accent shrink-0" />
        <span className="text-white font-semibold text-sm">
          {phase.label} &nbsp;·&nbsp; {fmt(phase.start)} – {fmt(addDays(phase.start, 14))}
        </span>
        <ChevronRight className="w-4 h-4 text-white/30" />
        <span className="text-white/50 text-sm">15 daily tests · 50 MCQs each</span>
      </div>

      {/* ── Schedule grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
        {DAY_PATTERN.map(({ day, subjects, isRevision }, idx) => {
          const date = addDays(phase.start, idx);
          const dateStr = fmtShort(date);

          return (
            <div
              key={day}
              className={`relative rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 ${
                isRevision ? "border-accent/30 bg-white/5" : "border-white/10 bg-white/5"
              }`}
            >
              {/* Day badge + Rapid tag */}
              <div className="flex items-center justify-between mb-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isRevision ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                }`}>
                  <Calendar className="w-3 h-3" />
                  Day {day}
                </div>
                {isRevision && (
                  <span className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full">RAPID</span>
                )}
              </div>

              {/* Date */}
              <p className="text-white/50 text-[11px] font-semibold uppercase tracking-wider mb-3">{dateStr}</p>

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

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary/20 border border-primary/30" />
          <span className="text-white/60 text-sm">Days 1–9 · First Revision Cycle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-accent/20 border border-accent/30" />
          <span className="text-white/60 text-sm">Days 10–15 · Rapid Recall Cycle</span>
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <div className="text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-white/5 border border-white/10 rounded-2xl px-6 sm:px-10 py-8 max-w-full">
          <div className="text-left">
            <p className="text-white font-bold text-xl mb-1">50 MCQs per daily test</p>
            <p className="text-white/50 text-sm">Based on previous year patterns — subject-wise, date-locked</p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new Event("open-register-modal"))}
            className="bg-primary hover:bg-primaryDark text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg shadow-primary/30 whitespace-nowrap"
          >
            Register — Start {fmt(PHASES[0].start)}
          </button>
        </div>
      </div>

    </div>
  );

  if (!standalone) return content;

  return (
    <section id="schedule" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-navy to-navyLight">
      {content}
    </section>
  );
}
