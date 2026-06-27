import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExamAPI } from "@/services/examApi";
import {
  BookOpen, Plus, Edit2, FileQuestion, ChevronRight,
  CheckCircle, Clock, Calendar, Layers, RotateCcw,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft:     "bg-slate-100 text-slate-500",
  upcoming:  "bg-blue-100 text-blue-600",
  running:   "bg-emerald-100 text-emerald-700",
  live:      "bg-emerald-100 text-emerald-700",
  completed: "bg-gray-100 text-gray-600",
};

export default function AdminXrevisePhases() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<number>(1);

  const load = async () => {
    setLoading(true);
    const r = await ExamAPI.getAll({ platform: "xrevise", limit: 500 });
    if (r.status) setExams(r.exams || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Group exams by phase
  const phaseMap: Record<number, any[]> = {};
  for (const ex of exams) {
    const ph = ex.phase || 1;
    if (!phaseMap[ph]) phaseMap[ph] = [];
    phaseMap[ph].push(ex);
  }
  const phases = [1, 2, 3, 4];

  const sorted = (list: any[]) =>
    [...list].sort((a, b) => (a.day_number || 999) - (b.day_number || 999));

  const goCreate = (phase: number) => {
    navigate(`/admin/em/xrevise-exams?newPhase=${phase}`);
  };

  const goManage = (examId: number) => {
    navigate(`/admin/em/xrevise-exams?exam=${examId}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="text-emerald-600" size={22} /> XRevise Phases
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage phase-wise day exams for XRevise students</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 text-sm font-semibold">
            <RotateCcw size={15} /> Refresh
          </button>
          <button
            onClick={() => navigate("/admin/em/xrevise-exams")}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            <Plus size={16} /> Create Exam
          </button>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {phases.map(ph => (
          <button
            key={ph}
            onClick={() => setActivePhase(ph)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-sm transition ${
              activePhase === ph ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Phase {ph}
            {phaseMap[ph]?.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activePhase === ph ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"
              }`}>
                {phaseMap[ph].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <RotateCcw className="animate-spin mx-auto mb-3" size={24} />
          <p>Loading exams…</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Phase header with create button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold text-sm">
                Phase {activePhase}
              </div>
              <span className="text-gray-500 text-sm">
                {phaseMap[activePhase]?.length || 0} exam{phaseMap[activePhase]?.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => goCreate(activePhase)}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl font-semibold text-sm transition"
            >
              <Plus size={15} /> Add Exam to Phase {activePhase}
            </button>
          </div>

          {!phaseMap[activePhase]?.length ? (
            <div className="border border-dashed border-emerald-200 rounded-2xl py-16 text-center text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No exams in Phase {activePhase} yet</p>
              <p className="text-sm mt-1 mb-4">Create day-wise exams for this phase</p>
              <button
                onClick={() => goCreate(activePhase)}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700"
              >
                <Plus size={15} /> Create First Exam
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {sorted(phaseMap[activePhase]).map(exam => (
                <div
                  key={exam.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-emerald-300 hover:shadow-sm transition group"
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Day badge */}
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-emerald-500 text-[10px] font-bold">DAY</span>
                      <span className="text-emerald-800 font-bold text-lg leading-none">{exam.day_number || "—"}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{exam.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        {exam.subject && <span className="text-emerald-600">{exam.subject}</span>}
                        <span className="flex items-center gap-1"><Clock size={11} /> {exam.duration_minutes} min</span>
                        <span className="flex items-center gap-1"><FileQuestion size={11} /> {exam.question_count || 0} Q</span>
                        {exam.scheduled_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(exam.scheduled_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status + actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[exam.status] || STATUS_COLORS.draft}`}>
                        {exam.status === "live" ? "Live" : (exam.status || "draft")}
                      </span>
                      {exam.question_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-semibold">
                          <CheckCircle size={11} /> {exam.question_count} Q
                        </span>
                      )}
                      <button
                        onClick={() => goManage(exam.id)}
                        className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-600 px-3 py-1.5 rounded-xl font-semibold transition"
                      >
                        <Edit2 size={12} /> Manage
                      </button>
                      <button
                        onClick={() => navigate(`/admin/xrevise/questions?exam=${exam.id}`)}
                        className="flex items-center gap-1.5 text-xs bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-700 border border-violet-200 px-3 py-1.5 rounded-xl font-semibold transition"
                      >
                        <FileQuestion size={12} /> Questions
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick stats */}
          {phaseMap[activePhase]?.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: "Total Exams", value: phaseMap[activePhase].length },
                { label: "Total Questions", value: phaseMap[activePhase].reduce((s: number, e: any) => s + (e.question_count || 0), 0) },
                { label: "Live / Running", value: phaseMap[activePhase].filter((e: any) => e.status === "live" || e.status === "running").length },
              ].map(stat => (
                <div key={stat.label} className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-700">{stat.value}</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All phases overview */}
      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="font-bold text-gray-700 text-sm flex items-center gap-2">
          <Layers size={15} className="text-emerald-600" /> All Phases Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {phases.map(ph => (
            <button
              key={ph}
              onClick={() => setActivePhase(ph)}
              className={`text-left p-4 rounded-xl border-2 transition hover:shadow-sm ${
                activePhase === ph ? "border-emerald-400 bg-emerald-50" : "border-gray-100 hover:border-emerald-200"
              }`}
            >
              <p className="font-bold text-gray-800">Phase {ph}</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{phaseMap[ph]?.length || 0}</p>
              <p className="text-xs text-gray-400">exams</p>
              {phaseMap[ph]?.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {phaseMap[ph].reduce((s: number, e: any) => s + (e.question_count || 0), 0)} questions
                </p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 font-semibold">
                View <ChevronRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
