import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, Lock, PlayCircle, Calendar, Clock, BookOpen,
  Trophy, Flame, Star, ChevronRight, Info, BarChart2, Loader2
} from "lucide-react";
import { StudentAPI } from "@/services/studentApi";

// 4 Phases × 15 Days — XREVISE structured schedule
// Phase 1 starts: 15 June 2026
const PHASE_START = new Date("2026-06-15");
const DAYS_PER_PHASE = 15;
const TOTAL_PHASES = 4;

const DAY_SUBJECTS = [
  "Anatomy + Ortho",
  "Biochem + FMT",
  "Physio + Pharma",
  "Patho + Micro",
  "PSM + OBGY",
  "ENT + Ophthalmology",
  "Peads + Anaesthesia",
  "Medicine + Derma + Psych",
  "Surgery + Radio",
  "Anatomy + Ortho + Radio + ENT",
  "Surgery + Anaesthesia + Ophthalmology",
  "Biochem + Physio + FMT",
  "Pharma + Patho + Micro",
  "Medicine + Peads + Derma + Psych",
  "OBGY + PSM",
];

const SUBJECT_COLORS: Record<string, string> = {
  Anatomy: "bg-blue-100 text-blue-700",
  Physiology: "bg-green-100 text-green-700",
  Biochemistry: "bg-yellow-100 text-yellow-700",
  Pathology: "bg-red-100 text-red-700",
  Pharmacology: "bg-purple-100 text-purple-700",
  Microbiology: "bg-teal-100 text-teal-700",
  Surgery: "bg-cyan-100 text-cyan-700",
  Medicine: "bg-sky-100 text-sky-700",
  OBGY: "bg-rose-100 text-rose-700",
  PSM: "bg-emerald-100 text-emerald-700",
  ENT: "bg-pink-100 text-pink-700",
  Ophthalmology: "bg-indigo-100 text-indigo-700",
  Pediatrics: "bg-lime-100 text-lime-700",
  default: "bg-gray-100 text-gray-700",
};

function getSubjectColor(subjects: string) {
  const first = subjects.split("+")[0].trim();
  return SUBJECT_COLORS[first] || SUBJECT_COLORS.default;
}

// Build a date for a given phase (0-indexed) and day (0-indexed)
function getScheduleDate(phase: number, dayIndex: number): Date {
  const d = new Date(PHASE_START);
  d.setDate(d.getDate() + phase * DAYS_PER_PHASE + dayIndex);
  return d;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

type DayStatus = "completed" | "today" | "upcoming" | "locked";

interface ScheduleDay {
  phase: number;       // 1-4
  day: number;         // 1-15
  globalDay: number;   // 1-60
  subjects: string;
  date: Date;
  status: DayStatus;
  examId?: number | null;
  attemptScore?: number | null;
  attemptAccuracy?: number | null;
}

export default function DailyTests() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<ScheduleDay | null>(null);
  const [activePhase, setActivePhase] = useState(1);

  useEffect(() => {
    buildSchedule();
  }, []);

  async function buildSchedule() {
    setLoading(true);
    const today = startOfDay(new Date());
    let apiSchedule: Record<string, { exam_id?: number | null }> = {};
    let attempts: Record<string, { score: number; accuracy: number }> = {};

    try {
      // Fetch admin-configured schedule entries (may include exam_id per day)
      const schedRes = await StudentAPI.getXreviseSchedule();
      if (schedRes.status && schedRes.schedule) {
        for (const entry of schedRes.schedule) {
          // key by "phase-day" using day_number
          const key = entry.day_number ? String(entry.day_number) : "";
          if (key) apiSchedule[key] = { exam_id: entry.exam_id || null };
        }
      }
    } catch (_) {}

    try {
      const attRes = await StudentAPI.getXreviseAttempts();
      if (attRes.status && attRes.attempts) {
        for (const a of attRes.attempts) {
          if (a.exam_id) {
            const dateKey = new Date(a.submitted_at).toDateString();
            attempts[dateKey] = { score: a.score, accuracy: a.accuracy };
          }
        }
      }
    } catch (_) {}

    const days: ScheduleDay[] = [];
    let todayPhase = 1;

    for (let p = 0; p < TOTAL_PHASES; p++) {
      for (let d = 0; d < DAYS_PER_PHASE; d++) {
        const date = getScheduleDate(p, d);
        const dayStart = startOfDay(date);
        const globalDay = p * DAYS_PER_PHASE + d + 1;
        const dayKey = String(d + 1); // day_number in xrevise_schedule (1-15)
        const apiEntry = apiSchedule[dayKey];

        let status: DayStatus;
        if (dayStart < today) status = "completed";
        else if (dayStart.getTime() === today.getTime()) {
          status = "today";
          todayPhase = p + 1;
        }
        else if (dayStart > today && globalDay <= days.filter(d => d.status !== "locked").length + DAYS_PER_PHASE) {
          status = "upcoming";
        }
        else {
          status = dayStart <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) ? "upcoming" : "locked";
        }

        const dateKey = date.toDateString();
        const attempt = attempts[dateKey];

        days.push({
          phase: p + 1,
          day: d + 1,
          globalDay,
          subjects: DAY_SUBJECTS[d],
          date,
          status,
          examId: apiEntry?.exam_id ?? null,
          attemptScore: attempt?.score ?? null,
          attemptAccuracy: attempt?.accuracy ?? null,
        });
      }
    }

    setSchedule(days);
    setActivePhase(todayPhase);
    setLoading(false);
  }

  const todayDay = schedule.find(d => d.status === "today");
  const completedCount = schedule.filter(d => d.status === "completed").length;
  const phaseDays = schedule.filter(d => d.phase === activePhase);

  function startTest(day: ScheduleDay) {
    if (day.examId) {
      navigate(`/exam-portal/${day.examId}`);
    } else {
      alert("Exam not scheduled yet. Please check back later or contact admin.");
    }
  }

  const statusStyle: Record<DayStatus, string> = {
    completed: "bg-green-50 border-green-200 hover:border-green-400",
    today: "bg-white border-emerald-500 shadow-lg hover:shadow-xl ring-2 ring-emerald-100",
    upcoming: "bg-white border-gray-200 hover:border-gray-300",
    locked: "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed",
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          XREVISE Daily Test Programme
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          4 Phases × 15 Days • 50 MCQs per test • PYT-based revision
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
          <div className="text-3xl font-extrabold text-emerald-600">{completedCount}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Days Done</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
          <div className="text-3xl font-extrabold text-orange-500 flex items-center justify-center gap-1">
            <Flame className="w-6 h-6" /> {completedCount}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Day Streak</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
          <div className="text-3xl font-extrabold text-gray-900">{60 - completedCount}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Days Left</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
          <div className="text-3xl font-extrabold text-green-600">
            {Math.round((completedCount / 60) * 100)}%
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Progress</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-5 border shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Progress (60 Days)</span>
          <span className="text-sm font-bold text-emerald-600">{completedCount}/60</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / 60) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-4 text-xs text-gray-400 mt-2">
          {[1, 2, 3, 4].map(p => (
            <div key={p} className="text-center">Phase {p}</div>
          ))}
        </div>
      </div>

      {/* Today's Test Highlight */}
      {todayDay && (
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 mb-6 text-white shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
                <span className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">
                  Today's Test — Phase {todayDay.phase} • Day {todayDay.day}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-1">{todayDay.subjects}</h2>
              <div className="flex flex-wrap gap-3 text-sm mt-3">
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> 50 Questions
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 60 Minutes
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> PYT-based MCQs
                </span>
              </div>
            </div>
            <button
              onClick={() => startTest(todayDay)}
              className="bg-white text-emerald-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition shrink-0 flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Start Test
            </button>
          </div>
        </div>
      )}

      {!todayDay && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
          <p className="text-sm text-sky-800">
            <span className="font-bold">XREVISE Phase 1</span> starts on{" "}
            <strong>{PHASE_START.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>.
            Your structured 60-day revision journey begins soon!
          </p>
        </div>
      )}

      {/* Phase Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[1, 2, 3, 4].map(p => (
          <button
            key={p}
            onClick={() => setActivePhase(p)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activePhase === p
                ? "bg-emerald-600 text-white shadow"
                : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
            }`}
          >
            Phase {p}
          </button>
        ))}
      </div>

      {/* Phase Schedule Grid */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Phase {activePhase} Schedule
          <span className="text-xs font-normal text-gray-400 ml-1">
            {phaseDays[0]?.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
            {phaseDays[14]?.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {phaseDays.map(day => (
            <button
              key={day.globalDay}
              disabled={day.status === "locked"}
              onClick={() => setSelectedDay(selectedDay?.globalDay === day.globalDay ? null : day)}
              className={`text-left rounded-xl border p-4 transition-all duration-200 ${statusStyle[day.status]} ${
                selectedDay?.globalDay === day.globalDay ? "ring-2 ring-emerald-500" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                    day.status === "completed" ? "bg-green-500 text-white" :
                    day.status === "today" ? "bg-emerald-600 text-white" :
                    day.status === "upcoming" ? "bg-gray-200 text-gray-600" :
                    "bg-gray-100 text-gray-300"
                  }`}>
                    {day.status === "completed" ? <CheckCircle className="w-5 h-5" /> :
                     day.status === "locked" ? <Lock className="w-4 h-4" /> :
                     day.day}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">Day {day.day}</span>
                      {day.status === "today" && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{day.subjects}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {day.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  {day.status === "completed" && day.attemptScore != null && (
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      {day.attemptScore.toFixed(0)} pts
                    </span>
                  )}
                  <span className={`text-xs font-semibold ${getSubjectColor(day.subjects)} px-2 py-0.5 rounded-full`}>
                    Day {day.day}
                  </span>
                </div>
              </div>

              {/* Expanded Detail */}
              {selectedDay?.globalDay === day.globalDay && day.status !== "locked" && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-700 font-medium mb-3">{day.subjects}</p>
                  <div className="flex flex-wrap gap-2 text-xs mb-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">50 MCQs</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">60 Minutes</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">PYT-based</span>
                  </div>
                  {(day.status === "today" || day.status === "upcoming") && (
                    <button
                      onClick={e => { e.stopPropagation(); startTest(day); }}
                      className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {day.status === "today" ? "Start Today's Test" : "Practice Early"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {day.status === "completed" && (
                    <div className="space-y-2">
                      {day.attemptScore != null && (
                        <div className="flex justify-between text-sm bg-green-50 rounded-lg px-3 py-2">
                          <span className="text-gray-600">Your Score</span>
                          <span className="font-bold text-green-700">
                            {day.attemptScore.toFixed(0)} pts • {Math.round((day.attemptAccuracy || 0) * 100)}% acc
                          </span>
                        </div>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); navigate("/student/xrevise-attempts"); }}
                        className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition flex items-center justify-center gap-1"
                      >
                        <BarChart2 className="w-4 h-4" /> View Result
                      </button>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Programme Info */}
      <div className="mt-8 bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Trophy className="w-8 h-8 text-emerald-600 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">About XREVISE</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              A structured 60-day NEET PG revision programme. <strong>4 phases × 15 days</strong>, each with{" "}
              <strong>50 PYT-based MCQs</strong> from high-yield topics across all 19 subjects.
              Tests are scored instantly with rank and accuracy analysis.
            </p>
            <button
              onClick={() => navigate("/student/xrevise-attempts")}
              className="mt-3 text-emerald-700 font-bold text-sm flex items-center gap-1 hover:text-emerald-800"
            >
              <BarChart2 className="w-4 h-4" /> View My Attempts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
