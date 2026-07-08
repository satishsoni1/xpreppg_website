import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Trophy, CheckCircle, XCircle, MinusCircle, Clock,
  BookOpen, Loader2, ChevronDown, ChevronUp, BarChart3,
} from "lucide-react";
import { CbtModuleAPI } from "@/services/adminApi";

const OPTION_KEYS = ["A", "B", "C", "D"];
function optVal(opts: any, key: string): string {
  if (!opts) return "";
  if (Array.isArray(opts)) return opts[OPTION_KEYS.indexOf(key)] || "";
  return opts[key] || "";
}

function fmtTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

const DIFF_COLOR: Record<string, string> = {
  easy: "text-emerald-600 bg-emerald-50",
  medium: "text-amber-600 bg-amber-50",
  hard: "text-red-600 bg-red-50",
};

function AnswerRow({ a, idx }: { a: any; idx: number }) {
  const [open, setOpen] = useState(false);
  const isCorrect = a.selected_answer && a.selected_answer === a.correct_answer;
  const isSkipped = !a.selected_answer;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      isCorrect ? "border-emerald-200 bg-emerald-50/50"
        : isSkipped ? "border-slate-200 bg-slate-50/50"
        : "border-red-200 bg-red-50/50"
    }`}>
      <button onClick={() => setOpen(o => !o)} className="w-full text-left p-4 flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold ${
          isCorrect ? "bg-emerald-100 text-emerald-700"
            : isSkipped ? "bg-slate-100 text-slate-500"
            : "bg-red-100 text-red-600"
        }`}>{idx + 1}</div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-800 text-sm font-medium leading-snug line-clamp-2">{a.question_text}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {a.subject && <span className="text-[11px] text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{a.subject}</span>}
            {a.difficulty && <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${DIFF_COLOR[a.difficulty] || "text-slate-500 bg-slate-100"}`}>{a.difficulty}</span>}
            <span className="text-[11px] text-slate-400 flex items-center gap-0.5"><Clock size={10} /> {fmtTime(a.time_spent_seconds || 0)}</span>
            {a.change_count > 0 && <span className="text-[11px] text-slate-400">Changed {a.change_count}×</span>}
          </div>
        </div>
        <div className="ml-2 shrink-0 flex items-center gap-2">
          {isCorrect ? <CheckCircle size={18} className="text-emerald-500" />
            : isSkipped ? <MinusCircle size={18} className="text-slate-400" />
            : <XCircle size={18} className="text-red-500" />}
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
          <div className="space-y-1.5">
            {OPTION_KEYS.map(key => {
              const text = optVal(a.options, key);
              if (!text) return null;
              const isCorrOpt = a.correct_answer === key;
              const isSelOpt = a.selected_answer === key;
              return (
                <div key={key} className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-sm ${
                  isCorrOpt ? "bg-emerald-50 border-emerald-300 font-semibold"
                    : isSelOpt && !isCorrOpt ? "bg-red-50 border-red-300"
                    : "bg-white border-slate-100"
                }`}>
                  <span className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-xs font-bold ${
                    isCorrOpt ? "bg-emerald-500 text-white"
                      : isSelOpt ? "bg-red-400 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}>{key}</span>
                  <span className={isCorrOpt ? "text-emerald-800" : isSelOpt ? "text-red-700" : "text-slate-600"}>{text}</span>
                  {isCorrOpt && <CheckCircle size={14} className="text-emerald-500 ml-auto shrink-0 mt-0.5" />}
                  {isSelOpt && !isCorrOpt && <XCircle size={14} className="text-red-400 ml-auto shrink-0 mt-0.5" />}
                </div>
              );
            })}
          </div>
          {a.explanation && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1"><BookOpen size={11} />Explanation</p>
              <p className="text-blue-800 text-sm leading-relaxed">{a.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminCBTResultAnalysis() {
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const r = await CbtModuleAPI.getStudentResultDetail(Number(examId), Number(studentId));
      if (r.status) { setResult(r.result); setAnswers(r.answers || []); }
      setLoading(false);
    };
    load();
  }, [examId, studentId]);

  const subjects: string[] = useMemo(
    () => [...new Set<string>(answers.map(a => a.subject).filter(Boolean))], [answers]
  );

  const filteredAnswers = useMemo(() => answers.filter(a => {
    const isCorrect = a.selected_answer && a.selected_answer === a.correct_answer;
    const isSkipped = !a.selected_answer;
    if (filter === "correct" && !isCorrect) return false;
    if (filter === "incorrect" && (isCorrect || isSkipped)) return false;
    if (filter === "skipped" && !isSkipped) return false;
    if (subjectFilter !== "all" && a.subject !== subjectFilter) return false;
    return true;
  }), [answers, filter, subjectFilter]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
      <p className="text-slate-500 font-medium">Loading analysis…</p>
    </div>
  );

  if (!result) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <p className="text-slate-500">Result not found for this student.</p>
      <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Back</button>
    </div>
  );

  const subjectAnalysis = result.subject_analysis || {};
  const difficultyAnalysis = result.difficulty_analysis || {};

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/admin/cbt/results/${examId}`)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{result.student_name} <span className="text-gray-400 font-normal">· {result.mobile}</span></h1>
          <p className="text-sm text-gray-400">{result.exam_title} — Full Result Analysis</p>
        </div>
      </div>

      {/* Score card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-sm mb-1">Score</p>
            <p className="text-5xl font-black">{result.final_marks}</p>
            <p className="text-blue-200">/ {result.total_marks} marks</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <Trophy size={20} className="text-yellow-300" />
              <span className="text-3xl font-bold">#{result.rank ?? "—"}</span>
            </div>
            <p className="text-blue-200 text-sm">{result.percentile ?? "—"}th percentile</p>
            <p className="text-blue-200 text-sm">{result.percentage}%</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <CheckCircle className="text-green-500" size={20} />, label: "Correct", val: result.correct, cls: "text-green-600" },
          { icon: <XCircle className="text-red-500" size={20} />, label: "Incorrect", val: result.incorrect, cls: "text-red-600" },
          { icon: <MinusCircle className="text-gray-400" size={20} />, label: "Skipped", val: result.skipped, cls: "text-gray-500" },
          { icon: <Clock className="text-blue-500" size={20} />, label: "Time Taken", val: fmtTime(result.time_taken_seconds || 0), cls: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <p className={`text-xl font-bold ${s.cls}`}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Subject + Difficulty analysis */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {Object.keys(subjectAnalysis).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><BookOpen size={16} /> Subject-wise Analysis</h3>
            <div className="space-y-3">
              {Object.entries(subjectAnalysis).map(([subj, data]: any) => {
                const total = (data.correct || 0) + (data.wrong || 0) + (data.skipped || 0);
                const pct = total > 0 ? Math.round((data.correct / total) * 100) : 0;
                return (
                  <div key={subj}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{subj || "General"}</span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-green-600">✓{data.correct}</span>
                        <span className="text-red-500">✗{data.wrong}</span>
                        <span className="text-gray-400">—{data.skipped}</span>
                        <span className="font-bold text-gray-700">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {Object.keys(difficultyAnalysis).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><BarChart3 size={16} /> Difficulty-wise Analysis</h3>
            <div className="space-y-3">
              {Object.entries(difficultyAnalysis).map(([diff, data]: any) => {
                const total = (data.correct || 0) + (data.wrong || 0) + (data.skipped || 0);
                const pct = total > 0 ? Math.round((data.correct / total) * 100) : 0;
                return (
                  <div key={diff}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{diff}</span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-green-600">✓{data.correct}</span>
                        <span className="text-red-500">✗{data.wrong}</span>
                        <span className="text-gray-400">—{data.skipped}</span>
                        <span className="font-bold text-gray-700">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Question-wise list */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(["all", "correct", "incorrect", "skipped"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold capitalize transition ${filter === f ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"}`}>
              {f}
            </button>
          ))}
          {subjects.length > 0 && (
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-sm border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        {filteredAnswers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
            <p>No questions match the filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnswers.map((a) => <AnswerRow key={a.question_id} a={a} idx={answers.indexOf(a)} />)}
          </div>
        )}
      </div>

      <div className="pb-8" />
    </div>
  );
}
