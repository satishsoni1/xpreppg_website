import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Zap, BookOpen, AlertTriangle, Loader2 } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { PublicAPI } from "@/services/publicApi";
import { DAY_PATTERN, PHASES, addDays } from "@/components/RevisionSchedule";

// One row of the timeline, from either the standard pattern or the admin schedule
interface DayItem {
  key: string;
  day: number;
  label?: string;
  date: Date | null;
  subjects: string[];
  topics?: string[];
  rapid: boolean;
  status?: string;
  postponedTo?: Date | null;
}

type PhaseState = "done" | "live" | "upcoming";

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const fmtLong = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtDay = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short" });
const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function phaseState(i: number): PhaseState {
  const today = startOfToday();
  const start = PHASES[i].start;
  const end = addDays(start, DAY_PATTERN.length - 1);
  if (today > end) return "done";
  if (today >= start) return "live";
  return "upcoming";
}

function defaultPhase() {
  const live = PHASES.findIndex((_, i) => phaseState(i) === "live");
  if (live >= 0) return live;
  const next = PHASES.findIndex((_, i) => phaseState(i) === "upcoming");
  return next >= 0 ? next : 0;
}

const STATE_STYLE: Record<PhaseState, { label: string; cls: string }> = {
  done: { label: "Completed", cls: "bg-gray-100 text-gray-500" },
  live: { label: "Live now", cls: "bg-green-100 text-green-700" },
  upcoming: { label: "Upcoming", cls: "bg-secondary text-primary" },
};

const ADMIN_STATUS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  postponed: "bg-amber-100 text-amber-700",
  scheduled: "bg-secondary text-primary",
};

export default function SchedulePage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(defaultPhase);
  const [adminRows, setAdminRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PublicAPI.getXreviseSchedule()
      .then(res => { if (res?.status) setAdminRows(res.schedule || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const usingAdmin = adminRows.length > 0;
  const today = startOfToday();

  // Admin schedule: group topic rows by day number
  const adminDays: DayItem[] = useMemo(() => {
    const byDay = new Map<number, DayItem>();
    adminRows.forEach(r => {
      const d: DayItem = byDay.get(r.day_number) || {
        key: `a${r.day_number}`, day: r.day_number, label: r.day_label || undefined,
        date: r.scheduled_date ? new Date(r.scheduled_date) : null,
        subjects: [], topics: [], rapid: false, status: r.status,
        postponedTo: r.postponed_to ? new Date(r.postponed_to) : null,
      };
      if (!d.subjects.includes(r.subject)) d.subjects.push(r.subject);
      if (r.topic) d.topics!.push(r.topic);
      byDay.set(r.day_number, d);
    });
    return [...byDay.values()].sort((a, b) => a.day - b.day);
  }, [adminRows]);

  const standardDays: DayItem[] = DAY_PATTERN.map((d, i) => ({
    key: `s${d.day}`, day: d.day, date: addDays(PHASES[phase].start, i),
    subjects: d.subjects, rapid: d.isRevision,
  }));

  const days = usingAdmin ? adminDays : standardDays;
  const firstCycle = days.filter(d => !d.rapid);
  const rapidCycle = days.filter(d => d.rapid);

  const allDone = PHASES.every((_, i) => phaseState(i) === "done");
  const programStart = PHASES[0].start;
  const programEnd = addDays(PHASES[PHASES.length - 1].start, DAY_PATTERN.length - 1);

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-gradient-to-b from-secondary to-white px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">XRevise · NEET PG</p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-navy mb-3">Revision Schedule</h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Every day has a subject, a 50-MCQ test and a score. Nine days of first revision, then six days of rapid recall — repeated across four phases.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: CalendarDays, text: `${fmtLong(programStart)} – ${fmtLong(programEnd)}` },
                { icon: BookOpen, text: "4 phases × 15 days" },
                { icon: Clock, text: "50 MCQs / day" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-navy shadow-card">
                  <Icon className="w-4 h-4 text-primary" /> {text}
                </span>
              ))}
            </div>
          </div>

          {allDone && !usingAdmin && (
            <div className="mt-6 flex items-start gap-3 bg-white border border-amber-200 rounded-2xl p-4 text-sm text-gray-700">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p>
                This XRevise cycle ended on <strong>{fmtLong(programEnd)}</strong>. The plan below shows how each phase runs —
                register to be notified when the next cycle opens.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Phase picker (standard schedule only — admin schedule has its own dates) */}
          {!usingAdmin && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
              {PHASES.map((p, i) => {
                const st = STATE_STYLE[phaseState(i)];
                const selected = phase === i;
                return (
                  <button
                    key={p.label}
                    onClick={() => setPhase(i)}
                    className={`text-left rounded-2xl border p-4 transition ${
                      selected ? "border-primary bg-primary text-white shadow-lift" : "border-gray-200 bg-white hover:border-primary shadow-card"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-base font-extrabold">{p.label}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${selected ? "bg-white/20 text-white" : st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    <span className={`text-sm ${selected ? "text-white/80" : "text-gray-500"}`}>{p.range}</span>
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-gray-400">
              <Loader2 className="animate-spin mx-auto mb-3" size={28} /> Loading schedule…
            </div>
          ) : (
            <div className="space-y-12">
              <DayGroup
                title={usingAdmin ? "Day-wise plan" : "First revision cycle"}
                subtitle={usingAdmin ? "Updated by the XRevise team" : "Days 1–9 · every subject covered once"}
                icon={<BookOpen className="w-5 h-5" />}
                tone="primary"
                days={firstCycle}
                today={today}
              />
              {rapidCycle.length > 0 && (
                <DayGroup
                  title="Rapid recall cycle"
                  subtitle="Days 10–15 · subjects combined for fast revision"
                  icon={<Zap className="w-5 h-5" />}
                  tone="accent"
                  days={rapidCycle}
                  today={today}
                />
              )}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 rounded-3xl bg-navy p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-1">Revise with a plan, not a pile of notes</h2>
              <p className="text-white/70">Daily tests, instant scores and subject-wise analysis — all in XRevise.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => navigate("/xrevise-register")}
                className="group inline-flex items-center justify-center gap-2 bg-accent text-navy px-6 py-3.5 rounded-xl font-bold hover:brightness-95 transition"
              >
                Register for XRevise <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/xrevise-program")}
                className="inline-flex items-center justify-center border border-white/25 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                About the program
              </button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

function DayGroup({ title, subtitle, icon, tone, days, today }: {
  title: string; subtitle: string; icon: React.ReactNode; tone: "primary" | "accent";
  days: DayItem[]; today: Date;
}) {
  const badge = tone === "primary" ? "bg-secondary text-primary" : "bg-amber-100 text-amber-700";
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${badge}`}>{icon}</span>
        <div>
          <h2 className="text-xl font-extrabold text-navy">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(d => {
          const isToday = d.date ? sameDay(d.date, today) : false;
          const isPast = d.date ? d.date < today && !isToday : false;
          return (
            <div
              key={d.key}
              className={`relative bg-white rounded-2xl border p-5 flex gap-4 transition ${
                isToday ? "border-primary ring-2 ring-primary/20 shadow-lift" : "border-gray-200 shadow-card"
              } ${isPast ? "opacity-70" : ""}`}
            >
              <div className={`w-14 shrink-0 rounded-xl text-center py-2 ${tone === "primary" ? "bg-secondary" : "bg-amber-50"}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Day</p>
                <p className={`text-2xl font-extrabold leading-none ${tone === "primary" ? "text-primary" : "text-amber-600"}`}>{d.day}</p>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-500">
                    {d.date ? <>{fmtDay(d.date)}, <span className="text-navy">{fmtDate(d.date)}</span></> : d.label || "Date to be announced"}
                  </p>
                  {isToday && <span className="text-[10px] font-bold uppercase bg-primary text-white px-2 py-0.5 rounded-full">Today</span>}
                  {isPast && !d.status && <CheckCircle2 className="w-4 h-4 text-gray-400" aria-label="Done" />}
                  {d.status && d.status !== "scheduled" && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${ADMIN_STATUS[d.status] || "bg-gray-100 text-gray-600"}`}>{d.status}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {d.subjects.map(s => (
                    <span key={s} className="text-sm font-semibold text-navy bg-mist border border-gray-100 rounded-lg px-2.5 py-1">{s}</span>
                  ))}
                </div>
                {d.topics && d.topics.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{d.topics.join(" · ")}</p>
                )}
                {d.status === "postponed" && d.postponedTo && (
                  <p className="text-xs text-amber-700 mt-2">Moved to {fmtLong(d.postponedTo)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
