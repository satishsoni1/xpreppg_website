import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Eye, Trophy, CheckCircle, XCircle, Clock, Users, BarChart3, ExternalLink } from "lucide-react";
import { CbtModuleAPI } from "@/services/adminApi";

interface Attempt {
  id: number;
  student_id: number;
  name: string;
  mobile: string;
  email: string;
  category: string;
  status: string;
  started_at: string;
  submitted_at: string;
  result_id: number | null;
  final_marks: number | null;
  rank: number | null;
  is_published: boolean | null;
}

interface Result {
  id: number;
  student_id: number;
  name: string;
  mobile: string;
  email: string;
  category: string;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  marks_obtained: number;
  negative_deduction: number;
  final_marks: number;
  total_marks: number;
  percentage: number;
  rank: number;
  percentile: number;
  time_taken_seconds: number;
  is_published: boolean;
  section_analysis: any;
  subject_analysis: any;
  difficulty_analysis: any;
}

function fmtTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
}

function fmt(dt: string) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function parseJson(v: any) {
  if (!v) return {};
  return typeof v === "string" ? JSON.parse(v) : v;
}

export default function AdminCBTResults() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"attempts" | "results" | "analytics">("attempts");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [pubLoading, setPubLoading] = useState(false);
  const [rankLoading, setRankLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const [cohortSize, setCohortSize] = useState<string>("");

  const loadAttempts = async () => {
    if (!examId) return;
    setLoading(true);
    const r = await CbtModuleAPI.getAttempts(Number(examId));
    if (r.status) setAttempts(r.attempts);
    setLoading(false);
  };

  const loadResults = async () => {
    if (!examId) return;
    setLoading(true);
    const r = await CbtModuleAPI.getResults(Number(examId));
    if (r.status) setResults(r.results);
    setLoading(false);
  };

  const loadAnalytics = async () => {
    if (!examId) return;
    setLoading(true);
    const r = await CbtModuleAPI.getQuestionAnalytics(Number(examId));
    if (r.status) setAnalytics(r);
    setLoading(false);
  };

  const loadExamCohortSize = async () => {
    const r = await CbtModuleAPI.getExams();
    if (r.status) {
      const exam = r.exams.find((e: any) => e.id?.toString() === examId);
      if (exam?.manual_cohort_size) setCohortSize(String(exam.manual_cohort_size));
    }
  };

  useEffect(() => { loadAttempts(); loadExamCohortSize(); }, [examId]);

  const switchTab = (t: "attempts" | "results" | "analytics") => {
    setTab(t);
    if (t === "results") loadResults();
    else if (t === "analytics") loadAnalytics();
    else loadAttempts();
  };

  const handleGenerate = async () => {
    if (!confirm("Generate results for all submitted attempts? This will overwrite previous calculations.")) return;
    setGenLoading(true); setMsg("");
    const r = await CbtModuleAPI.generateResults(Number(examId));
    setGenLoading(false);
    setMsg(r.message || (r.status ? "Done" : r.message));
    if (r.status) loadResults();
  };

  const handleGenerateRanks = async () => {
    const size = parseInt(cohortSize, 10);
    if (!size || size <= 0) { setMsg("Enter a valid total cohort size first."); return; }
    if (!confirm(`Generate ranks against a total cohort of ${size} students? Students beyond the real attempts will be simulated statistically for ranking purposes only.`)) return;
    setRankLoading(true); setMsg("");
    const r = await CbtModuleAPI.generateRanks(Number(examId), size);
    setRankLoading(false);
    setMsg(r.message || (r.status ? "Done" : r.message));
    if (r.status) loadResults();
  };

  const handlePublish = async () => {
    if (!confirm("Publish results? Students will be able to see their scores.")) return;
    setPubLoading(true); setMsg("");
    const r = await CbtModuleAPI.publishResults(Number(examId));
    setPubLoading(false);
    setMsg(r.message || (r.status ? "Published" : r.message));
    if (r.status) loadResults();
  };

  const publishedCount = results.filter(r => r.is_published).length;
  const totalSubmitted = attempts.filter(a => a.status === "submitted" || a.status === "timed_out").length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/admin/cbt/exams")} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">CBT Results — Exam #{examId}</h1>
          <p className="text-sm text-gray-500">
            {totalSubmitted} submitted · {results.length > 0 ? `${results.length} results generated` : "No results yet"}
            {publishedCount > 0 && ` · ${publishedCount} published`}
          </p>
        </div>
      </div>

      {/* Result generator controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <button onClick={handleGenerate} disabled={genLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            <RefreshCw size={15} className={genLoading ? "animate-spin" : ""} />
            {genLoading ? "Generating..." : "1. Generate Results"}
          </button>

          <div className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Total Manual Cohort Size</label>
              <input
                type="number" min={1} value={cohortSize}
                onChange={e => setCohortSize(e.target.value)}
                placeholder="e.g. 5000"
                className="w-40 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button onClick={handleGenerateRanks} disabled={rankLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
              <Trophy size={15} />
              {rankLoading ? "Ranking..." : "2. Generate Ranks"}
            </button>
          </div>

          <button onClick={handlePublish} disabled={pubLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            <Eye size={15} />
            {pubLoading ? "Publishing..." : "3. Publish Results"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Generate results first, enter the total cohort size (including students not evaluated here) to rank against, then publish once ranks look right.</p>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.toLowerCase().includes("error") || msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("invalid") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {msg}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Attempts", val: attempts.length, color: "blue" },
          { label: "Submitted", val: totalSubmitted, color: "green" },
          { label: "Results Generated", val: results.length, color: "purple" },
          { label: "Published", val: publishedCount, color: "emerald" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{s.val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5">
        {(["attempts", "results", "analytics"] as const).map(t => (
          <button key={t} onClick={() => switchTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition capitalize ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">Loading...</div>
      ) : tab === "attempts" ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Started</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Submitted</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Score</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No attempts yet</td></tr>
              ) : attempts.map((a, i) => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400">{i+1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.mobile}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.category || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      a.status === "submitted" ? "bg-green-100 text-green-700" :
                      a.status === "timed_out" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmt(a.started_at)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmt(a.submitted_at)}</td>
                  <td className="px-4 py-3">
                    {a.final_marks != null
                      ? <span className="font-bold text-blue-700">{a.final_marks}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === "results" ? (
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No results generated yet.</p>
              <p className="text-xs mt-1">Click "Generate Results" to calculate scores and ranks.</p>
            </div>
          ) : results.map((res) => {
            const difficultyAnalysis = parseJson(res.difficulty_analysis);
            const subjectAnalysis = parseJson(res.subject_analysis);
            return (
              <div key={res.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-700">
                    {res.rank}
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{res.name}</p>
                      {res.is_published && <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">Published</span>}
                    </div>
                    <p className="text-xs text-gray-400">{res.mobile} · {res.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">{res.final_marks}</p>
                    <p className="text-xs text-gray-400">/{res.total_marks} marks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">{res.percentage}%</p>
                    <p className="text-xs text-gray-400">{res.percentile}%ile</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={13} />{res.correct}</p>
                    <p className="text-sm font-semibold text-red-500 flex items-center gap-1"><XCircle size={13} />{res.incorrect}</p>
                  </div>
                  {res.time_taken_seconds && (
                    <div className="text-right text-xs text-gray-500">
                      <Clock size={13} className="inline mr-1" />{fmtTime(res.time_taken_seconds)}
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/admin/cbt/results/${examId}/student/${res.student_id}`)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <ExternalLink size={13} /> Full Paper
                  </button>
                  <button onClick={() => setExpandedResult(expandedResult === res.id ? null : res.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                    {expandedResult === res.id ? "▲" : "▼"}
                  </button>
                </div>

                {expandedResult === res.id && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 grid sm:grid-cols-2 gap-5">
                    {Object.keys(subjectAnalysis).length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-3">Subject Analysis</p>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(subjectAnalysis).map(([subj, data]: any) => (
                            <div key={subj} className="bg-white rounded-xl p-3 border border-gray-200 text-xs">
                              <p className="font-semibold text-gray-700 truncate">{subj || "Unknown"}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-green-600">✓{data.correct}</span>
                                <span className="text-red-500">✗{data.wrong}</span>
                                <span className="text-gray-400">—{data.skipped}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {Object.keys(difficultyAnalysis).length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-3">Difficulty Analysis</p>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(difficultyAnalysis).map(([diff, data]: any) => (
                            <div key={diff} className="bg-white rounded-xl p-3 border border-gray-200 text-xs">
                              <p className="font-semibold text-gray-700 capitalize truncate">{diff}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-green-600">✓{data.correct}</span>
                                <span className="text-red-500">✗{data.wrong}</span>
                                <span className="text-gray-400">—{data.skipped}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <AnalyticsTab analytics={analytics} />
      )}
    </div>
  );
}

function AnalyticsTab({ analytics }: { analytics: any }) {
  if (!analytics) return <div className="py-16 text-center text-gray-400">No analytics available.</div>;
  const { attendance, scores, score_distribution, question_stats = [], subject_stats = [], difficulty_stats = [] } = analytics;

  return (
    <div className="space-y-6">
      {/* Attendance + score summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Enrolled", val: attendance?.enrolled ?? 0, icon: <Users size={16} className="text-blue-500" /> },
          { label: "Appeared", val: attendance?.appeared ?? 0, icon: <CheckCircle size={16} className="text-green-500" /> },
          { label: "Absent", val: attendance?.absentees ?? 0, icon: <XCircle size={16} className="text-red-500" /> },
          { label: "Appear Rate", val: `${attendance?.appear_rate ?? 0}%`, icon: <BarChart3 size={16} className="text-purple-500" /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <p className="text-xl font-bold text-gray-900">{s.val}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg Marks", val: scores?.avg_marks ?? "—" },
          { label: "Highest", val: scores?.highest_marks ?? "—" },
          { label: "Lowest", val: scores?.lowest_marks ?? "—" },
          { label: "Avg %", val: scores?.avg_percentage != null ? `${scores.avg_percentage}%` : "—" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-blue-700">{s.val}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Score distribution */}
      {score_distribution && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Score Distribution</h3>
          <div className="grid grid-cols-5 gap-2">
            {["0-20", "20-40", "40-60", "60-80", "80-100"].map(bucket => (
              <div key={bucket} className="text-center">
                <p className="text-lg font-bold text-gray-900">{score_distribution[bucket] ?? 0}</p>
                <p className="text-xs text-gray-400">{bucket}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject-wise */}
      {subject_stats.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700">Subject-wise Performance</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Subject</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Correct</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Incorrect</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Skipped</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Accuracy</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {subject_stats.map((s: any) => (
                <tr key={s.subject} className="border-b border-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{s.subject}</td>
                  <td className="px-4 py-2.5 text-green-600">{s.correct}</td>
                  <td className="px-4 py-2.5 text-red-500">{s.incorrect}</td>
                  <td className="px-4 py-2.5 text-gray-400">{s.skipped}</td>
                  <td className="px-4 py-2.5 font-semibold">{s.accuracy_pct != null ? `${s.accuracy_pct}%` : "—"}</td>
                  <td className="px-4 py-2.5 text-gray-500">{s.avg_time_seconds != null ? `${s.avg_time_seconds}s` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Difficulty-wise */}
      {difficulty_stats.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Difficulty-wise Performance</h3>
          <div className="grid grid-cols-3 gap-3">
            {difficulty_stats.map((d: any) => (
              <div key={d.difficulty} className="rounded-xl p-4 bg-gray-50 border border-gray-100">
                <p className="font-bold text-sm text-gray-700 capitalize">{d.difficulty || "—"}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{d.accuracy_pct != null ? `${d.accuracy_pct}%` : "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.question_count} questions · avg {d.avg_time_seconds ?? 0}s</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-wise */}
      {question_stats.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700">Question-wise Performance</h3>
            <p className="text-xs text-gray-400 mt-0.5">Sorted lowest-accuracy first — spot the hardest / most-missed questions.</p>
          </div>
          <div className="max-h-[32rem] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">#</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Question</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Subject</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Attempts</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Accuracy</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600 text-xs uppercase">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {[...question_stats].sort((a: any, b: any) => (a.accuracy_pct ?? 101) - (b.accuracy_pct ?? 101)).map((q: any, i: number) => (
                  <tr key={q.question_id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2.5 text-gray-800 max-w-xs truncate">{q.question_text}</td>
                    <td className="px-4 py-2.5 text-gray-500">{q.subject || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500">{q.total_attempts}</td>
                    <td className={`px-4 py-2.5 font-semibold ${q.accuracy_pct != null && q.accuracy_pct < 40 ? "text-red-500" : q.accuracy_pct != null && q.accuracy_pct < 70 ? "text-amber-600" : "text-green-600"}`}>
                      {q.accuracy_pct != null ? `${q.accuracy_pct}%` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{q.avg_time_seconds != null ? `${q.avg_time_seconds}s` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
