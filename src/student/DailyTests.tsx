import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, PlayCircle, Calendar, Clock, BookOpen,
  Trophy, Flame, BarChart2, Loader2, RotateCcw,
  Lock, AlertCircle, ChevronRight, Layers,
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
  const [exams,   setExams]   = useState<any[]>([]);
  const [phases,  setPhases]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [examRes, phaseRes] = await Promise.all([
      StudentAPI.xrevise.getMyExams(),
      StudentAPI.xrevisePublic.getAllPhases(),
    ]);
    const fetchedExams  = examRes.status  ? (examRes.exams   || []) : [];
    const fetchedPhases = phaseRes.status ? (phaseRes.phases || []) : [];
    setExams(fetchedExams);
    setPhases(fetchedPhases);

    // Auto-select: first prefer a live phase, then first active phase with exams
    const liveEx = fetchedExams.find((e: any) => e.status === "running" || e.status === "live");
    if (liveEx?.phase) {
      setActivePhaseId(liveEx.phase);
    } else {
      const firstActive = fetchedPhases.find((p: any) => p.is_active);
      if (firstActive) setActivePhaseId(firstActive.id);
    }

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Group exams by phase id, sorted by day_number
  const byPhase: Record<number, any[]> = {};
  for (const ex of exams) {
    const ph = ex.phase || 0;
    if (!byPhase[ph]) byPhase[ph] = [];
    byPhase[ph].push(ex);
  }
  for (const key of Object.keys(byPhase)) {
    byPhase[Number(key)].sort((a, b) => (a.day_number ?? 999) - (b.day_number ?? 999));
  }

  const liveExams      = exams.filter(e => e.status === "running" || e.status === "live");
  const completedCount = exams.filter(e => e.status === "completed").length;
  const upcomingCount  = exams.filter(e => e.status === "upcoming").length;

  const activePhase = phases.find(p => p.id === activePhaseId);

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
            Your enrolled tests — grouped by phase
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
              {liveExams.length} test{liveExams.length !== 1 ? "s are" : " is"} LIVE now!
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
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-sky-800">No tests available yet</p>
            <p className="text-xs text-sky-700 mt-1">
              Tests will appear here once you are enrolled in a phase and the admin activates them.
            </p>
          </div>
        </div>
      )}

      {/* Phase tabs — all phases from DB, disabled ones shown as locked */}
      {phases.length > 0 && (
        <>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {phases.map(ph => {
              const hasLive    = (byPhase[ph.id] || []).some((e: any) => e.status === "running" || e.status === "live");
              const examCount  = (byPhase[ph.id] || []).length;
              const isSelected = activePhaseId === ph.id;
              const isDisabled = !ph.is_active;

              return (
                <button
                  key={ph.id}
                  onClick={() => !isDisabled && setActivePhaseId(ph.id)}
                  disabled={isDisabled}
                  title={isDisabled ? "This phase is currently disabled" : ph.name}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isDisabled
                      ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                      : isSelected
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  {isDisabled ? <Lock size={13} className="shrink-0" /> : null}
                  <span className="truncate max-w-[120px]">{ph.name}</span>
                  {!isDisabled && examCount > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {examCount}
                    </span>
                  )}
                  {hasLive && !isDisabled && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Disabled phase notice */}
          {activePhase && !activePhase.is_active && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 mb-4">
              <Lock className="text-amber-500 shrink-0" size={18} />
              <div>
                <p className="text-sm font-semibold text-amber-800">{activePhase.name} is currently disabled</p>
                <p className="text-xs text-amber-700 mt-0.5">This phase will be enabled by the admin soon.</p>
              </div>
            </div>
          )}

          {/* Tests for selected active phase */}
          {activePhase?.is_active && (
            (byPhase[activePhaseId!] || []).length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold">No tests in {activePhase?.name ?? "this phase"} yet</p>
                <p className="text-sm mt-1">Admin will activate tests for this phase soon</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(byPhase[activePhaseId!] || []).map((exam: any) => (
                  <ExamCard key={exam.id} exam={exam} navigate={navigate} />
                ))}
              </div>
            )
          )}

          {/* Phase info footer */}
          {activePhase && (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 px-1">
              <Layers size={12} />
              <span>{activePhase.name}</span>
              {activePhase.description && <span>· {activePhase.description}</span>}
              {activePhase.start_date && (
                <span>
                  · from {new Date(activePhase.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          )}
        </>
      )}

      {/* Programme info */}
      {exams.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Trophy className="w-8 h-8 text-emerald-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">About XREVISE</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                A structured NEET PG revision programme with day-wise{" "}
                <strong>PYT-based MCQs</strong> from high-yield topics across all 19 subjects.
                Tests are scored instantly with rank and accuracy analysis.
              </p>
              <button
                onClick={() => navigate("/student/xrevise-attempts")}
                className="mt-3 text-emerald-700 font-bold text-sm flex items-center gap-1 hover:text-emerald-800"
              >
                <BarChart2 className="w-4 h-4" /> <span>View All My Attempts</span> <ChevronRight size={14} />
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
