import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Eye, Trophy, CheckCircle, XCircle, Clock } from "lucide-react";
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

export default function AdminCBTResults() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"attempts" | "results">("attempts");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [pubLoading, setPubLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [expandedResult, setExpandedResult] = useState<number | null>(null);

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

  useEffect(() => { loadAttempts(); }, [examId]);

  const switchTab = (t: "attempts" | "results") => {
    setTab(t);
    if (t === "results") loadResults();
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
        <div className="flex gap-2">
          <button onClick={handleGenerate} disabled={genLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            <RefreshCw size={15} className={genLoading ? "animate-spin" : ""} />
            {genLoading ? "Generating..." : "Generate Results"}
          </button>
          <button onClick={handlePublish} disabled={pubLoading || results.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            <Eye size={15} />
            {pubLoading ? "Publishing..." : "Publish Results"}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.toLowerCase().includes("error") || msg.toLowerCase().includes("fail") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
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
        {(["attempts", "results"] as const).map(t => (
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
      ) : (
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No results generated yet.</p>
              <p className="text-xs mt-1">Click "Generate Results" to calculate scores and ranks.</p>
            </div>
          ) : results.map((res, i) => (
            <div key={res.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-700">
                  {res.rank}
                </div>
                <div className="flex-1">
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
                <button onClick={() => setExpandedResult(expandedResult === res.id ? null : res.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                  {expandedResult === res.id ? "▲" : "▼"}
                </button>
              </div>

              {expandedResult === res.id && res.subject_analysis && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-600 mb-3">Subject Analysis</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.entries(typeof res.subject_analysis === 'string' ? JSON.parse(res.subject_analysis) : res.subject_analysis).map(([subj, data]: any) => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
