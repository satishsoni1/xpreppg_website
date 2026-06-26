import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle, XCircle, Clock, BarChart3, BookOpen, ArrowLeft,
  ChevronDown, ChevronUp, Trophy, TrendingUp, AlertTriangle, Loader2,
} from "lucide-react";
import { StudentAPI } from "@/services/studentApi";

export default function StudentXReviseResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "subjects">("overview");
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    StudentAPI.xrevise.getAnalysis(attemptId).then(r => {
      if (r.status) setData(r);
      setLoading(false);
    });
  }, [attemptId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-emerald-600" size={36} />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-2 text-red-500" size={36} />
        <p className="text-gray-600 font-medium">Analysis not available yet.</p>
        <button onClick={() => navigate("/student/dashboard")}
          className="mt-4 bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold text-sm">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const { exam, result, questions, time_analysis, suggestions } = data;
  const subjectAnalysis: any[] = result?.subject_analysis || [];
  const pct = parseFloat(result?.percentage || 0);

  const fmt = (s: number) => {
    if (!s) return "0s";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const answerColor = (q: any) => {
    if (!q.is_visited || !q.selected_answer) return "bg-gray-100 border-gray-200";
    return q.selected_answer === q.correct_answer
      ? "bg-emerald-50 border-emerald-300"
      : "bg-red-50 border-red-300";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/student/dashboard")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-medium text-sm transition">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <span className="font-bold text-gray-800 text-sm truncate">{exam?.title} — Analysis</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Score card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">{exam?.title}</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-extrabold">{result?.final_marks ?? "–"}</span>
                <span className="text-emerald-200 text-xl font-medium mb-1">/ {result?.total_marks ?? exam?.total_marks}</span>
              </div>
              <p className="text-emerald-100 text-sm mt-1">{pct.toFixed(1)}% Score</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {result?.rank && (
                <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                  <Trophy size={18} className="text-amber-300" />
                  <span className="font-bold text-lg">Rank #{result.rank}</span>
                </div>
              )}
              <div className={`px-4 py-1.5 rounded-xl font-bold text-sm ${
                result?.pass_fail === "pass" ? "bg-white/20" : "bg-red-400/30"
              }`}>
                {result?.pass_fail?.toUpperCase() || "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-100">{result?.correct || 0}</p>
              <p className="text-xs text-emerald-200">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-300">{result?.incorrect || 0}</p>
              <p className="text-xs text-emerald-200">Incorrect</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-200">{result?.skipped || 0}</p>
              <p className="text-xs text-emerald-200">Skipped</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{fmt(time_analysis?.total_time_seconds || 0)}</p>
              <p className="text-xs text-emerald-200">Total Time</p>
            </div>
          </div>
        </div>

        {/* Time analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TimeCard label="Avg time / question" value={fmt(time_analysis?.avg_time_per_question || 0)} icon={<Clock size={18} />} />
          <TimeCard label="Fastest question" value={
            time_analysis?.fastest_question
              ? `Q${(time_analysis.fastest_question as any).question_order || "?"} — ${fmt(time_analysis.fastest_question.time_spent_seconds)}`
              : "—"
          } icon={<TrendingUp size={18} />} color="text-emerald-600" />
          <TimeCard label="Slowest question" value={
            time_analysis?.slowest_question
              ? `Q${(time_analysis.slowest_question as any).question_order || "?"} — ${fmt(time_analysis.slowest_question.time_spent_seconds)}`
              : "—"
          } icon={<Clock size={18} />} color="text-amber-600" />
        </div>

        {/* Suggestions */}
        {suggestions?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} /> Suggestions
            </h3>
            <ul className="space-y-2">
              {suggestions.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="mt-0.5 shrink-0">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {([
            ["overview",  "Overview"],
            ["subjects",  "Subject-wise"],
            ["questions", "All Questions"],
          ] as const).map(([t, label]) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                activeTab === t ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><BarChart3 size={16} /> Performance Overview</h3>
            </div>
            <div className="p-6 space-y-4">
              <ProgressRow label="Accuracy" value={result?.correct || 0} total={result?.attempted || 1} color="bg-emerald-500" />
              <ProgressRow label="Attempt Rate" value={result?.attempted || 0} total={result?.total_questions || 1} color="bg-blue-500" />
              <ProgressRow label="Score %" value={pct} total={100} color="bg-violet-500" isPercent />
            </div>
          </div>
        )}

        {/* Subject-wise tab */}
        {activeTab === "subjects" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800">Subject-wise Performance</h3>
            </div>
            {subjectAnalysis.length === 0 ? (
              <p className="p-6 text-gray-400 text-sm text-center">No subject data available.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {subjectAnalysis.map((s: any) => (
                  <div key={s.subject} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800 text-sm">{s.subject}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        s.accuracy >= 70 ? "bg-emerald-100 text-emerald-700" :
                        s.accuracy >= 50 ? "bg-amber-100 text-amber-700" :
                                           "bg-red-100 text-red-700"
                      }`}>{s.accuracy?.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                      <div className={`h-2 rounded-full transition-all ${
                        s.accuracy >= 70 ? "bg-emerald-500" : s.accuracy >= 50 ? "bg-amber-400" : "bg-red-400"
                      }`} style={{ width: `${Math.min(s.accuracy, 100)}%` }} />
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="text-emerald-600 font-medium">{s.correct} correct</span>
                      <span className="text-red-500 font-medium">{s.incorrect} wrong</span>
                      <span>{s.skipped} skipped</span>
                      <span className="ml-auto flex items-center gap-1">
                        <Clock size={11} /> Avg {fmt(s.avg_time_seconds || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All questions tab */}
        {activeTab === "questions" && (
          <div className="space-y-3">
            {questions.map((q: any, i: number) => {
              const isCorrect  = q.selected_answer && q.selected_answer === q.correct_answer;
              const isWrong    = q.selected_answer && q.selected_answer !== q.correct_answer;
              const isSkipped  = !q.selected_answer;
              const isExpanded = expandedQ === q.question_id;

              return (
                <div key={q.question_id} className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${answerColor(q)}`}>
                  <button
                    className="w-full flex items-start gap-3 p-4 text-left"
                    onClick={() => setExpandedQ(isExpanded ? null : q.question_id)}
                  >
                    <span className={`w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center ${
                      isCorrect ? "bg-emerald-500" : isWrong ? "bg-red-500" : "bg-gray-300"
                    }`}>
                      {isCorrect
                        ? <CheckCircle size={14} className="text-white" />
                        : isWrong
                          ? <XCircle size={14} className="text-white" />
                          : <span className="text-white text-[10px] font-bold">–</span>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-gray-400">Q{i + 1}</span>
                        {q.subject && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{q.subject}</span>}
                        {q.time_spent_seconds != null && (
                          <span className="text-[10px] flex items-center gap-0.5 text-gray-400 ml-auto">
                            <Clock size={10} /> {fmt(q.time_spent_seconds)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 font-medium line-clamp-2">{q.question_text}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                      {(["A", "B", "C", "D"] as const).map(letter => {
                        const optKey = `option_${letter.toLowerCase()}` as any;
                        const text   = q[optKey];
                        if (!text) return null;
                        const isSelected = q.selected_answer === letter;
                        const isCorrectOpt = q.correct_answer === letter;
                        return (
                          <div key={letter} className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                            isCorrectOpt ? "bg-emerald-100 border border-emerald-300" :
                            isSelected   ? "bg-red-100 border border-red-300" :
                                           "bg-gray-50 border border-gray-200"
                          }`}>
                            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                              isCorrectOpt ? "bg-emerald-500 text-white" :
                              isSelected   ? "bg-red-500 text-white" :
                                             "bg-gray-200 text-gray-600"
                            }`}>{letter}</span>
                            <span className={isCorrectOpt ? "text-emerald-800 font-medium" : isSelected ? "text-red-700" : "text-gray-700"}>
                              {text}
                            </span>
                          </div>
                        );
                      })}

                      {q.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                          <span className="font-bold">Explanation: </span>{q.explanation}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-1 text-xs text-gray-400">
                        <span>Your answer: <strong className={q.selected_answer ? (isCorrect ? "text-emerald-600" : "text-red-600") : "text-gray-500"}>
                          {q.selected_answer || "Not answered"}
                        </strong></span>
                        <span>Correct: <strong className="text-emerald-600">{q.correct_answer}</strong></span>
                        {q.time_spent_seconds != null && (
                          <span className="ml-auto flex items-center gap-1">
                            <Clock size={11} /> {fmt(q.time_spent_seconds)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TimeCard({ label, value, icon, color = "text-gray-700" }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
      <div className={`p-2 rounded-full bg-gray-100 ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className={`font-bold text-base ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, total, color, isPercent = false }: any) {
  const pct = isPercent ? value : Math.round((value / Math.max(total, 1)) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold text-gray-800">{isPercent ? `${value.toFixed(1)}%` : `${value}/${total}`}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
