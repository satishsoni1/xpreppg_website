import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, PlayCircle, Calendar, Clock, BookOpen,
  Trophy, Flame, BarChart2, Loader2, RotateCcw, Info,
  Lock, AlertCircle, ChevronRight,
} from "lucide-react";
import { StudentAPI } from "@/services/studentApi";

function Countdown({ targetDate }: { targetDate: string }) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const update = () => setDiff(Math.max(0, new Date(targetDate).getTime() - Date.now()));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono">
      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">{String(h).padStart(2, "0")}h</span>
      <span className="text-gray-400">:</span>
      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">{String(m).padStart(2, "0")}m</span>
      <span className="text-gray-400">:</span>
      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">{String(s).padStart(2, "0")}s</span>
    </span>
  );
}

const fmtDatetime = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
  " at " +
  new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

export default function DailyTests() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await StudentAPI.xrevise.getMyExams();
    if (r.status) setExams(r.exams || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-select phase that has a live exam
  useEffect(() => {
    if (!exams.length) return;
    const liveEx = exams.find(e => e.status === "running" || e.status === "live");
    if (liveEx?.phase) setActivePhase(liveEx.phase);
  }, [exams]);

  // Group by phase, sort each phase by day_number
  const byPhase: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const ex of exams) byPhase[ex.phase || 1].push(ex);
  for (const p of [1, 2, 3, 4]) {
    byPhase[p].sort((a, b) => (a.day_number ?? 999) - (b.day_number ?? 999));
  }

  const liveExams      = exams.filter(e => e.status === "running" || e.status === "live");
  const completedCount = exams.filter(e => e.status === "completed").length;
  const upcomingCount  = exams.filter(e => e.status === "upcoming").length;
  const phasesWithExams = ([1, 2, 3, 4] as const).filter(p => byPhase[p].length > 0);

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
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            XREVISE Daily Tests
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Your enrolled exams — grouped by phase
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-600 font-medium transition"
        >
          <RotateCcw size={14} /> Refresh
        </button>
      </div>

      {/* Live alert banner */}
      {liveExams.length > 0 && (
        <div className="mb-5 bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-emerald-800 text-sm">
              {liveExams.length} exam{liveExams.length !== 1 ? "s are" : " is"} LIVE now!
            </p>
            <p className="text-emerald-700 text-xs mt-0.5">
              {liveExams.map(e => e.title).join(" · ")}
            </p>
          </div>
          {liveExams.length === 1 && (
            <button
              onClick={() => navigate(`/student/xrevise/exam/${liveExams[0].id}`)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition shrink-0"
            >
              <PlayCircle size={15} /> Start Now
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
          <div className="text-3xl font-extrabold text-green-600">{completedCount}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
          <div className="text-3xl font-extrabold text-orange-500 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5" /> {liveExams.length}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Live Now</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
          <div className="text-3xl font-extrabold text-blue-600">{upcomingCount}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Upcoming</div>
        </div>
      </div>

      {/* No exams at all */}
      {exams.length === 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-sky-800">No exams available yet</p>
            <p className="text-xs text-sky-700 mt-1">
              Exams will appear here once you are enrolled in a phase and the admin activates them.
            </p>
          </div>
        </div>
      )}

      {/* Phase tabs */}
      {exams.length > 0 && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {([1, 2, 3, 4] as const).map(p => {
              const hasLive = byPhase[p].some(e => e.status === "running" || e.status === "live");
              const count   = byPhase[p].length;
              return (
                <button
                  key={p}
                  onClick={() => setActivePhase(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    activePhase === p
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  Phase {p}
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      activePhase === p ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {count}
                    </span>
                  )}
                  {hasLive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                </button>
              );
            })}
          </div>

          {/* Exam cards for active phase */}
          {byPhase[activePhase].length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No exams in Phase {activePhase} yet</p>
              <p className="text-sm mt-1">
                {phasesWithExams.length > 0
                  ? `Check Phase ${phasesWithExams[0]} for available exams`
                  : "Admin will activate exams for this phase soon"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {byPhase[activePhase].map(exam => (
                <ExamCard key={exam.id} exam={exam} navigate={navigate} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Programme Info */}
      {exams.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Trophy className="w-8 h-8 text-emerald-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">About XREVISE</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                A structured NEET PG revision programme. <strong>4 phases</strong>, each with day-wise{" "}
                <strong>PYT-based MCQs</strong> from high-yield topics across all 19 subjects.
                Tests are scored instantly with rank and accuracy analysis.
              </p>
              <button
                onClick={() => navigate("/student/xrevise-attempts")}
                className="mt-3 text-emerald-700 font-bold text-sm flex items-center gap-1 hover:text-emerald-800"
              >
                <BarChart2 className="w-4 h-4" /> View All My Attempts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamCard({ exam, navigate }: { exam: any; navigate: (path: string) => void }) {
  const isLive      = exam.status === "running" || exam.status === "live";
  const isUpcoming  = exam.status === "upcoming";
  const isCompleted = exam.status === "completed";
  const attempted   = exam.attempt_status === "submitted" || exam.attempt_status === "auto_submitted";
  const inProgress  = exam.attempt_status === "in_progress";

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${
      isLive ? "border-emerald-300 shadow-md ring-2 ring-emerald-100" : "border-gray-200 hover:border-emerald-200 hover:shadow-sm"
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Day badge */}
          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold text-sm ${
            isLive      ? "bg-emerald-600 text-white" :
            isCompleted ? "bg-green-100 text-green-700" :
            "bg-blue-100 text-blue-700"
          }`}>
            {isCompleted && attempted ? (
              <CheckCircle size={20} />
            ) : (
              <>
                <span className="text-[9px] font-bold opacity-70">DAY</span>
                <span className="leading-none">{exam.day_number ?? "—"}</span>
              </>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isLive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" /> LIVE
                </span>
              )}
              {isUpcoming && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  UPCOMING
                </span>
              )}
              {isCompleted && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  COMPLETED
                </span>
              )}
              {inProgress && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  IN PROGRESS
                </span>
              )}
              {exam.subject && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {exam.subject}
                </span>
              )}
            </div>

            <h3 className="font-bold text-gray-900 text-base truncate">{exam.title}</h3>

            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock size={11} /> {exam.duration_minutes || exam.duration || 60} min</span>
              <span className="flex items-center gap-1"><BookOpen size={11} /> {exam.question_count || 0} Qs</span>
              {exam.start_time && (
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <Calendar size={11} /> {fmtDatetime(exam.start_time)}
                </span>
              )}
            </div>
          </div>

          {/* Action area */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            {isLive && !attempted && (
              <button
                onClick={() => navigate(`/student/xrevise/exam/${exam.id}`)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition shadow-sm"
              >
                {inProgress ? <><RotateCcw size={14} /> Resume</> : <><PlayCircle size={14} /> Start</>}
              </button>
            )}
            {isLive && attempted && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Submitted
                </span>
                {exam.final_marks != null && (
                  <button
                    onClick={() => navigate(`/student/xrevise/result/${exam.attempt_id}`)}
                    className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                  >
                    <BarChart2 size={12} className="inline mr-1" />Result
                  </button>
                )}
              </div>
            )}
            {isUpcoming && (
              <div className="text-right">
                {exam.start_time ? <Countdown targetDate={exam.start_time} /> : (
                  <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl font-semibold">
                    Soon
                  </span>
                )}
              </div>
            )}
            {isCompleted && attempted && (
              <div className="flex flex-col items-end gap-1">
                {exam.final_marks != null && (
                  <span className="text-sm font-bold text-green-700">
                    {Number(exam.final_marks).toFixed(0)}<span className="text-gray-400 text-xs font-normal">/{exam.total_marks}</span>
                  </span>
                )}
                <button
                  onClick={() => navigate(`/student/xrevise/result/${exam.attempt_id}`)}
                  className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                >
                  <BarChart2 size={12} className="inline mr-1" />Analysis
                </button>
              </div>
            )}
            {isCompleted && !attempted && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Lock size={12} /> Not attempted
              </span>
            )}
          </div>
        </div>

        {/* Score breakdown for completed + attempted */}
        {isCompleted && attempted && exam.correct != null && (
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="text-center">
              <p className="text-emerald-600 font-bold">{exam.correct}</p>
              <p className="text-[10px] text-gray-400">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-red-500 font-bold">{exam.incorrect}</p>
              <p className="text-[10px] text-gray-400">Wrong</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 font-bold">{exam.skipped}</p>
              <p className="text-[10px] text-gray-400">Skipped</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
