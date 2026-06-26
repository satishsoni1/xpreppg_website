import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Clock, Play, CheckCircle, ChevronRight,
  RotateCcw, BarChart3, LogOut, Lock, Trophy, User, Bell,
} from "lucide-react";
import { StudentPortalAPI } from "@/services/examApi";

interface CountdownProps { targetDate: string; }
function Countdown({ targetDate }: CountdownProps) {
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
    <div className="flex items-center gap-1 text-sm font-mono">
      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{String(h).padStart(2,"0")}h</span>
      <span className="text-slate-400">:</span>
      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{String(m).padStart(2,"0")}m</span>
      <span className="text-slate-400">:</span>
      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{String(s).padStart(2,"0")}s</span>
    </div>
  );
}

const STATUS_CONFIG: Record<string,{label:string;color:string;bg:string;dot:string}> = {
  running:   { label:"LIVE",      color:"text-emerald-700", bg:"bg-emerald-50 border-emerald-200", dot:"bg-emerald-500" },
  upcoming:  { label:"Upcoming",  color:"text-blue-700",    bg:"bg-blue-50 border-blue-200",       dot:"bg-blue-500" },
  completed: { label:"Completed", color:"text-slate-600",   bg:"bg-slate-50 border-slate-200",     dot:"bg-slate-400" },
};

export default function XRevisePortal() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"running"|"upcoming"|"completed">("running");
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const s = localStorage.getItem("xrevise_student");
    if (s) setStudent(JSON.parse(s));
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    const r = await StudentPortalAPI.getMyExams();
    if (r.status) setExams(r.exams);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("xrevise_token");
    localStorage.removeItem("xrevise_student");
    navigate("/xrevise/login");
  };

  const running   = exams.filter(e => e.status === "running");
  const upcoming  = exams.filter(e => e.status === "upcoming");
  const completed = exams.filter(e => e.status === "completed");

  const tabData = { running, upcoming, completed };
  const displayed = tabData[activeTab];

  const startExam = async (exam: any) => {
    navigate(`/xrevise/exam/${exam.id}`, { state: { exam } });
  };

  const viewResult = (exam: any) => {
    navigate(`/xrevise/result/${exam.attempt_id}`, { state: { exam } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-emerald-400" size={24}/>
            <span className="font-bold text-white text-lg">XRevise</span>
            <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">Portal</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={fetchExams} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
              <RotateCcw size={16}/>
            </button>
            {student && (
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  {student.name?.[0]?.toUpperCase()||"S"}
                </div>
                <span className="text-white text-sm font-medium hidden sm:block">{student.name}</span>
              </div>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition text-sm font-semibold">
              <LogOut size={15}/> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome banner */}
        {student && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
            <p className="text-emerald-100 text-sm font-medium">Welcome back,</p>
            <p className="text-2xl font-bold">{student.name} 👋</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-emerald-100">
              <span>{running.length} Live Exam{running.length!==1?"s":""}</span>
              <span>·</span>
              <span>{upcoming.length} Upcoming</span>
              <span>·</span>
              <span>{completed.length} Completed</span>
            </div>
          </div>
        )}

        {/* Live exams banner */}
        {running.length > 0 && activeTab !== "running" && (
          <div className="flex items-center gap-3 bg-emerald-900/50 border border-emerald-600/40 rounded-xl px-4 py-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"/>
            <span className="text-emerald-300 text-sm font-semibold">{running.length} exam{running.length!==1?"s are":" is"} live right now!</span>
            <button onClick={() => setActiveTab("running")}
              className="ml-auto text-xs bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold">View Live</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-slate-800/60 rounded-2xl p-1 gap-1">
          {(["running","upcoming","completed"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition ${activeTab===t?"bg-white text-slate-800 shadow-sm":"text-slate-400 hover:text-white"}`}>
              {t==="running" && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>}
              <span className="capitalize">{t}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab===t?"bg-slate-100 text-slate-600":"bg-slate-700 text-slate-400"}`}>
                {tabData[t].length}
              </span>
            </button>
          ))}
        </div>

        {/* Exam Cards */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RotateCcw className="animate-spin mx-auto mb-3" size={28}/>
            <p>Loading your exams…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <BookOpen size={48} className="mx-auto mb-3 opacity-20"/>
            <p className="font-semibold text-slate-400">No {activeTab} exams</p>
            <p className="text-sm text-slate-600 mt-1">
              {activeTab==="upcoming"?"Your upcoming exams will appear here once scheduled."
                :activeTab==="running"?"No exams are live right now."
                :"You haven't completed any exams yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map(exam => {
              const cfg = STATUS_CONFIG[exam.status] || STATUS_CONFIG.completed;
              const attempted = exam.attempt_status === "submitted" || exam.attempt_status === "auto_submitted";
              const inProgress = exam.attempt_status === "in_progress";
              return (
                <div key={exam.id} className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/60 rounded-2xl overflow-hidden hover:border-emerald-700/50 transition-all">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${exam.status==="running"?"animate-pulse":""}`}/>
                            {cfg.label}
                          </span>
                          {exam.category && <span className="text-[11px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{exam.category}</span>}
                          {inProgress && <span className="text-[11px] bg-amber-900/50 text-amber-400 border border-amber-700/50 px-2 py-0.5 rounded-full font-bold">IN PROGRESS</span>}
                        </div>
                        <h3 className="text-white font-bold text-lg leading-tight">{exam.title}</h3>
                        {exam.subject && <p className="text-emerald-400 text-sm mt-0.5">{exam.subject}</p>}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5"><Clock size={14}/>{exam.duration_minutes} min</span>
                          <span className="flex items-center gap-1.5">
                            <BookOpen size={14}/>{exam.question_count||0} Questions
                          </span>
                          {exam.start_time && (
                            <span>📅 {new Date(exam.start_time).toLocaleDateString("en-IN", { day:"numeric",month:"short",year:"numeric" })}</span>
                          )}
                          {exam.start_time && (
                            <span>🕐 {new Date(exam.start_time).toLocaleTimeString("en-IN", { hour:"2-digit",minute:"2-digit" })}</span>
                          )}
                        </div>
                      </div>

                      {/* Right side — action */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        {exam.status === "upcoming" && exam.start_time && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">Starts in</p>
                            <Countdown targetDate={exam.start_time}/>
                          </div>
                        )}

                        {exam.status === "running" && !attempted && (
                          <button onClick={() => startExam(exam)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/40">
                            {inProgress ? <><RotateCcw size={16}/>Resume</> : <><Play size={16}/>Start Exam</>}
                          </button>
                        )}

                        {exam.status === "running" && attempted && (
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={13}/>Submitted</span>
                            {exam.show_result_immediately && exam.final_marks != null && (
                              <button onClick={() => viewResult(exam)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm">
                                <BarChart3 size={14}/> View Result
                              </button>
                            )}
                          </div>
                        )}

                        {exam.status === "completed" && (
                          <div className="text-right">
                            {attempted ? (
                              <>
                                {exam.final_marks != null && (
                                  <div className="text-right mb-2">
                                    <p className="text-2xl font-bold text-white">{exam.final_marks}<span className="text-slate-400 text-sm font-normal">/{exam.total_marks}</span></p>
                                    <p className="text-sm text-slate-400">{exam.percentage}%</p>
                                    {exam.rank && <p className="text-xs text-amber-400 flex items-center gap-1 justify-end"><Trophy size={12}/>Rank #{exam.rank}</p>}
                                  </div>
                                )}
                                <button onClick={() => viewResult(exam)}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm">
                                  <BarChart3 size={14}/> Analysis
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Lock size={16}/> Not Attempted
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Result summary for completed */}
                    {exam.status === "completed" && attempted && exam.correct != null && (
                      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700/50">
                        <div className="text-center">
                          <p className="text-emerald-400 font-bold text-lg">{exam.correct}</p>
                          <p className="text-xs text-slate-500">Correct</p>
                        </div>
                        <div className="text-center">
                          <p className="text-red-400 font-bold text-lg">{exam.incorrect}</p>
                          <p className="text-xs text-slate-500">Incorrect</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 font-bold text-lg">{exam.skipped}</p>
                          <p className="text-xs text-slate-500">Skipped</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
