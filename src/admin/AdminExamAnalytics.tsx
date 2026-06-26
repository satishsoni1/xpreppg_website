import { useState, useEffect } from "react";
import {
  BarChart3, Users, Award, TrendingUp, Clock, CheckCircle,
  XCircle, Minus, ChevronDown, Loader2, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { ExamAPI, AnalyticsAPI } from "@/services/examApi";

const PIE_COLORS = ["#10b981","#ef4444","#94a3b8"];
const DIFF_COLORS: Record<string,string> = { easy:"#22c55e", medium:"#f59e0b", hard:"#ef4444" };

export default function AdminExamAnalytics() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState<any|null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview"|"questions"|"students">("overview");

  useEffect(() => {
    ExamAPI.getAll({ limit:100 }).then(r => { if(r.status) setExams(r.exams||[]); });
  }, []);

  const loadAnalytics = async () => {
    if (!selectedId) return;
    setLoading(true);
    const [statsR, resultsR] = await Promise.all([
      AnalyticsAPI.getExamStats(parseInt(selectedId)),
      AnalyticsAPI.getStudentResults(parseInt(selectedId), { limit: 100 }),
    ]);
    if (statsR.status) setData(statsR);
    if (resultsR.status) setResults(resultsR.results);
    setLoading(false);
  };

  useEffect(() => { if (selectedId) loadAnalytics(); }, [selectedId]);

  const scoreDistData = data?.score_distribution ? [
    { range:"0-20%", count: parseInt(data.score_distribution["0-20"]||0) },
    { range:"20-40%", count: parseInt(data.score_distribution["20-40"]||0) },
    { range:"40-60%", count: parseInt(data.score_distribution["40-60"]||0) },
    { range:"60-80%", count: parseInt(data.score_distribution["60-80"]||0) },
    { range:"80-100%", count: parseInt(data.score_distribution["80-100"]||0) },
  ] : [];

  const attendancePieData = data ? [
    { name:"Appeared", value: data.attendance?.appeared||0 },
    { name:"Absentees", value: data.attendance?.absentees||0 },
  ] : [];

  const resultPieData = data ? [
    { name:"Pass", value: data.scores?.pass_count||0 },
    { name:"Fail", value: data.scores?.fail_count||0 },
  ] : [];

  const radarData = data?.subject_stats?.slice(0,8).map((s:any) => ({
    subject: s.subject?.substring(0,10)||"?",
    accuracy: parseFloat(s.accuracy_pct)||0,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-violet-600" size={22}/>
            <h1 className="text-xl font-bold text-slate-800">Exam Analytics</h1>
          </div>
          <div className="flex-1 min-w-[200px]">
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400">
              <option value="">— Select an exam —</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>[{ex.platform?.toUpperCase()}] {ex.title}</option>)}
            </select>
          </div>
          {selectedId && (
            <button onClick={loadAnalytics} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
              <RefreshCw size={16} className={loading?"animate-spin":""}/>
            </button>
          )}
        </div>
      </div>

      {!selectedId ? (
        <div className="py-24 text-center text-slate-400">
          <BarChart3 size={48} className="mx-auto mb-3 text-slate-200"/>
          <p className="font-semibold">Select an exam to view analytics</p>
        </div>
      ) : loading ? (
        <div className="py-24 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" size={32}/>Loading analytics…</div>
      ) : data ? (
        <>
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-white rounded-t-2xl shadow-sm px-2">
            {(["overview","questions","students"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 capitalize transition -mb-px ${tab===t?"border-violet-600 text-violet-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>
                {t}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-5">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { label:"Enrolled", value: data.attendance?.enrolled, color:"text-violet-600", bg:"bg-violet-50" },
                  { label:"Appeared", value: data.attendance?.appeared, color:"text-blue-600", bg:"bg-blue-50" },
                  { label:"Absentees", value: data.attendance?.absentees, color:"text-slate-600", bg:"bg-slate-50" },
                  { label:"Avg Score", value: data.scores?.avg_marks ? `${data.scores.avg_marks}` : "—", color:"text-emerald-600", bg:"bg-emerald-50" },
                  { label:"Highest", value: data.scores?.highest_marks||"—", color:"text-green-600", bg:"bg-green-50" },
                  { label:"Lowest", value: data.scores?.lowest_marks||"—", color:"text-red-600", bg:"bg-red-50" },
                ].map(k => (
                  <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-slate-100`}>
                    <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
                  </div>
                ))}
              </div>

              {/* Pass/Fail and Attendance row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Attendance pie */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <p className="font-bold text-slate-700 mb-3">Attendance</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                        <Cell fill="#6366f1"/><Cell fill="#e2e8f0"/>
                      </Pie>
                      <Tooltip/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"/>Appeared: {data.attendance?.appeared}</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-200 inline-block"/>Absent: {data.attendance?.absentees}</span>
                  </div>
                </div>

                {/* Pass/Fail pie */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <p className="font-bold text-slate-700 mb-3">Pass / Fail</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={resultPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                        <Cell fill="#10b981"/><Cell fill="#ef4444"/>
                      </Pie>
                      <Tooltip/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/>Pass: {data.scores?.pass_count}</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>Fail: {data.scores?.fail_count}</span>
                  </div>
                </div>

                {/* Score stats */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <p className="font-bold text-slate-700 mb-3">Score Summary</p>
                  <div className="space-y-3">
                    {[
                      { label:"Average Score", value: data.scores?.avg_marks, sub: `${data.scores?.avg_percentage}%` },
                      { label:"Highest Score", value: data.scores?.highest_marks, color:"text-green-600" },
                      { label:"Lowest Score", value: data.scores?.lowest_marks, color:"text-red-500" },
                      { label:"Pass Rate", value: `${data.scores?.pass_percentage}%`, color:"text-emerald-600" },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                        <span className="text-sm text-slate-600">{s.label}</span>
                        <span className={`font-bold text-sm ${s.color||"text-slate-800"}`}>{s.value} {s.sub && <span className="text-xs text-slate-400">({s.sub})</span>}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score distribution */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="font-bold text-slate-700 mb-4">Score Distribution</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={scoreDistData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="range" tick={{fontSize:12}}/>
                    <YAxis tick={{fontSize:12}}/>
                    <Tooltip/>
                    <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} name="Students"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Subject-wise accuracy */}
              {data.subject_stats?.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="font-bold text-slate-700 mb-4">Subject-wise Accuracy</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.subject_stats.slice(0,10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                        <XAxis type="number" domain={[0,100]} tick={{fontSize:11}} tickFormatter={v=>`${v}%`}/>
                        <YAxis type="category" dataKey="subject" tick={{fontSize:11}} width={90}/>
                        <Tooltip formatter={(v:any) => `${v}%`}/>
                        <Bar dataKey="accuracy_pct" fill="#8b5cf6" radius={[0,4,4,0]} name="Accuracy"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="font-bold text-slate-700 mb-4">Subject Radar</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid/>
                        <PolarAngleAxis dataKey="subject" tick={{fontSize:10}}/>
                        <PolarRadiusAxis angle={90} domain={[0,100]} tick={{fontSize:9}}/>
                        <Radar name="Accuracy" dataKey="accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2}/>
                        <Tooltip formatter={(v:any)=>`${v}%`}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Difficulty stats */}
              {data.difficulty_stats?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <p className="font-bold text-slate-700 mb-4">Difficulty-wise Performance</p>
                  <div className="grid grid-cols-3 gap-4">
                    {data.difficulty_stats.map((d:any) => (
                      <div key={d.difficulty} className="p-4 rounded-xl border border-slate-100 text-center">
                        <p className="text-2xl font-bold" style={{color:DIFF_COLORS[d.difficulty]||"#64748b"}}>{d.accuracy_pct||0}%</p>
                        <p className="text-sm font-semibold text-slate-600 capitalize mt-1">{d.difficulty}</p>
                        <p className="text-xs text-slate-400">{d.question_count} questions</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "questions" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <p className="font-bold text-slate-700 text-sm">Question-wise Performance ({data.question_stats?.length||0} questions)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["#","Question","Subject","Difficulty","Attempts","Correct","Accuracy","Avg Time","Answer"].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(data.question_stats||[]).map((q:any) => (
                      <tr key={q.question_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">Q{q.question_order}</td>
                        <td className="px-4 py-3 max-w-[260px]">
                          <p className="text-slate-700 line-clamp-2 text-sm">{q.question_text}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-violet-700 bg-violet-50 rounded">{q.subject||"—"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold" style={{color:DIFF_COLORS[q.difficulty]||"#64748b"}}>{q.difficulty}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{q.total_attempts}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle size={13}/>{q.correct}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full w-16">
                              <div className="h-2 rounded-full bg-violet-500" style={{width:`${q.accuracy_pct||0}%`}}/>
                            </div>
                            <span className="text-xs font-bold text-slate-600">{q.accuracy_pct||0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{q.avg_time_seconds ? `${Math.round(q.avg_time_seconds)}s` : "—"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{q.correct_answer}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "students" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <p className="font-bold text-slate-700 text-sm">Student Results ({results.length})</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Rank","Name","Mobile","Marks","Percentage","Pass/Fail","Correct","Wrong","Skipped","Time"].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {results.map((r:any) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-violet-600">#{r.rank||"—"}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.student_name||"—"}</td>
                        <td className="px-4 py-3 text-slate-500">{r.mobile||"—"}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{r.final_marks}/{r.total_marks}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full">
                              <div className="h-2 rounded-full bg-violet-500" style={{width:`${r.percentage||0}%`}}/>
                            </div>
                            <span className="text-xs font-bold">{r.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {r.pass_fail ? (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.pass_fail==="pass"?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>
                              {r.pass_fail}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-emerald-600 font-semibold">{r.correct}</td>
                        <td className="px-4 py-3 text-red-500 font-semibold">{r.incorrect}</td>
                        <td className="px-4 py-3 text-slate-400">{r.skipped}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {r.time_taken_seconds ? `${Math.floor(r.time_taken_seconds/60)}m ${r.time_taken_seconds%60}s` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
