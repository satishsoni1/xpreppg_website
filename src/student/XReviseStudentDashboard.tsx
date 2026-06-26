import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import {
  BookOpen, Clock, Play, CheckCircle, RotateCcw, BarChart3,
  Lock, Trophy, AlertCircle,
} from "lucide-react";

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  running:   { label: "LIVE",      dot: "bg-emerald-500 animate-pulse", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  live:      { label: "LIVE",      dot: "bg-emerald-500 animate-pulse", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  upcoming:  { label: "Upcoming",  dot: "bg-blue-400",                  badge: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "Completed", dot: "bg-slate-400",                 badge: "bg-slate-100 text-slate-600 border-slate-200" },
};

const isLive      = (s: string) => s === "running" || s === "live";
const isUpcoming  = (s: string) => s === "upcoming";
const isCompleted = (s: string) => s === "completed";

export default function XReviseStudentDashboard() {
  const navigate  = useNavigate();
  const [exams,   setExams]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"running" | "upcoming" | "completed">("running");
  const user = JSON.parse(localStorage.getItem("student_user") || "{}");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await StudentAPI.xrevise.getMyExams();
    if (r.status) setExams(r.exams || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const groups = {
    running:   exams.filter(e => isLive(e.status)),
    upcoming:  exams.filter(e => isUpcoming(e.status)),
    completed: exams.filter(e => isCompleted(e.status)),
  };
  const displayed = groups[tab];

  const startOrResume = (exam: any) => {
    navigate(`/student/xrevise/exam/${exam.id}`);
  };

  const viewAnalysis = (exam: any) => {
    navigate(`/student/xrevise/result/${exam.attempt_id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
        <p className="text-emerald-100 text-sm font-medium">Welcome back,</p>
        <p className="text-2xl font-bold">{user.name} 👋</p>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-emerald-100">
          <span>{groups.running.length} Live Exam{groups.running.length !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{groups.upcoming.length} Upcoming</span>
          <span>·</span>
          <span>{groups.completed.length} Completed</span>
        </div>
      </div>

      {/* Live alert */}
      {groups.running.length > 0 && tab !== "running" && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-sm font-semibold">
            {groups.running.length} exam{groups.running.length !== 1 ? "s are" : " is"} live right now!
          </span>
          <button
            onClick={() => setTab("running")}
            className="ml-auto text-xs bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold"
          >
            View Live
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {(["running", "upcoming", "completed"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition ${
              tab === t ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "running" && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            <span className="capitalize">{t}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              tab === t ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"
            }`}>
              {groups[t].length}
            </span>
          </button>
        ))}
      </div>

      {/* Exam cards */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <RotateCcw className="animate-spin mx-auto mb-3" size={28} />
          <p>Loading your exams…</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold">No {tab} exams</p>
          <p className="text-sm mt-1 text-gray-400">
            {tab === "upcoming" ? "Your upcoming exams will appear here." :
             tab === "running"  ? "No exams are live right now." :
             "You haven't completed any exams yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(exam => {
            const cfg = STATUS_CFG[exam.status] || STATUS_CFG.completed;
            const attempted  = exam.attempt_status === "submitted" || exam.attempt_status === "auto_submitted";
            const inProgress = exam.attempt_status === "in_progress";

            return (
              <div
                key={exam.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      {/* Status + badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        {inProgress && (
                          <span className="text-[11px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                            IN PROGRESS
                          </span>
                        )}
                        {exam.category && (
                          <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {exam.category}
                          </span>
                        )}
                      </div>

                      <h3 className="text-gray-900 font-bold text-lg leading-tight">{exam.title}</h3>
                      {exam.subject && <p className="text-emerald-600 text-sm mt-0.5">{exam.subject}</p>}

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> {exam.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} /> {exam.question_count || 0} Questions
                        </span>
                        {exam.start_time && (
                          <span>
                            📅 {new Date(exam.start_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action area */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      {isLive(exam.status) && !attempted && (
                        <button
                          onClick={() => startOrResume(exam)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm"
                        >
                          {inProgress ? <><RotateCcw size={16} /> Resume</> : <><Play size={16} /> Start Exam</>}
                        </button>
                      )}

                      {isLive(exam.status) && attempted && (
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle size={13} /> Submitted
                          </span>
                          {exam.show_result_immediately && exam.final_marks != null && (
                            <button
                              onClick={() => viewAnalysis(exam)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm"
                            >
                              <BarChart3 size={14} /> View Result
                            </button>
                          )}
                        </div>
                      )}

                      {isCompleted(exam.status) && (
                        <div className="text-right">
                          {attempted ? (
                            <>
                              {exam.final_marks != null && (
                                <div className="text-right mb-2">
                                  <p className="text-2xl font-bold text-gray-900">
                                    {exam.final_marks}
                                    <span className="text-gray-400 text-sm font-normal">/{exam.total_marks}</span>
                                  </p>
                                  <p className="text-sm text-gray-500">{exam.percentage}%</p>
                                  {exam.rank && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1 justify-end">
                                      <Trophy size={12} /> Rank #{exam.rank}
                                    </p>
                                  )}
                                </div>
                              )}
                              <button
                                onClick={() => viewAnalysis(exam)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm"
                              >
                                <BarChart3 size={14} /> View Analysis
                              </button>
                            </>
                          ) : (
                            <span className="flex items-center gap-2 text-gray-400 text-sm">
                              <Lock size={16} /> Not Attempted
                            </span>
                          )}
                        </div>
                      )}

                      {isUpcoming(exam.status) && (
                        <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl font-semibold">
                          Opens soon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score summary for completed attempts */}
                  {exam.status === "completed" && attempted && exam.correct != null && (
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-emerald-600 font-bold text-lg">{exam.correct}</p>
                        <p className="text-xs text-gray-400">Correct</p>
                      </div>
                      <div className="text-center">
                        <p className="text-red-500 font-bold text-lg">{exam.incorrect}</p>
                        <p className="text-xs text-gray-400">Incorrect</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 font-bold text-lg">{exam.skipped}</p>
                        <p className="text-xs text-gray-400">Skipped</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Refresh button */}
      <div className="text-center">
        <button
          onClick={load}
          className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-emerald-600 transition font-medium"
        >
          <RotateCcw size={14} /> Refresh exams
        </button>
      </div>
    </div>
  );
}
