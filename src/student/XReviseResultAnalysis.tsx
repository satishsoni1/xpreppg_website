import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle, XCircle, Minus, Clock, ChevronDown, ChevronUp,
  ArrowLeft, Trophy, Target, BarChart3, BookOpen, Zap, TrendingUp,
  AlertCircle, Loader2, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
} from "recharts";
import { StudentPortalAPI } from "@/services/examApi";

const PIE_COLORS = ["#10b981","#ef4444","#94a3b8"];
const BAR_COLORS = ["#6366f1","#8b5cf6","#a78bfa"];

const DIFF_COLOR: Record<string,string> = {
  Easy:   "text-emerald-600 bg-emerald-50",
  Medium: "text-amber-600 bg-amber-50",
  Hard:   "text-red-600 bg-red-50",
};

function QCard({ q, idx }: { q: any; idx: number }) {
  const [open, setOpen] = useState(false);
  const isCorrect = q.is_correct;
  const isSkipped = !q.selected_answer;

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
          <p className="text-slate-800 text-sm font-medium leading-snug line-clamp-2">{q.question_text}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {q.subject && <span className="text-[11px] text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{q.subject}</span>}
            {q.difficulty && <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${DIFF_COLOR[q.difficulty] || "text-slate-500 bg-slate-100"}`}>{q.difficulty}</span>}
            <span className="text-[11px] text-slate-400 flex items-center gap-0.5"><Clock size={10}/> {q.time_spent_seconds || 0}s</span>
          </div>
        </div>
        <div className="ml-2 shrink-0 flex items-center gap-2">
          {isCorrect ? <CheckCircle size={18} className="text-emerald-500"/>
            : isSkipped ? <Minus size={18} className="text-slate-400"/>
            : <XCircle size={18} className="text-red-500"/>}
          {open ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
          {q.image_url && <img src={q.image_url} alt="" className="rounded-xl max-h-40 object-contain border border-slate-100"/>}
          <div className="space-y-1.5">
            {(["A","B","C","D"] as const).map(opt => {
              const val = q[`option_${opt.toLowerCase()}`];
              const isCorrectOpt = q.correct_answer === opt;
              const isStudentOpt = q.selected_answer === opt;
              return (
                <div key={opt} className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-sm ${
                  isCorrectOpt ? "bg-emerald-50 border-emerald-300 font-semibold"
                    : isStudentOpt && !isCorrectOpt ? "bg-red-50 border-red-300"
                    : "bg-white border-slate-100"
                }`}>
                  <span className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-xs font-bold ${
                    isCorrectOpt ? "bg-emerald-500 text-white"
                      : isStudentOpt ? "bg-red-400 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}>{opt}</span>
                  <span className={isCorrectOpt ? "text-emerald-800" : isStudentOpt ? "text-red-700" : "text-slate-600"}>{val}</span>
                  {isCorrectOpt && <CheckCircle size={14} className="text-emerald-500 ml-auto shrink-0 mt-0.5"/>}
                  {isStudentOpt && !isCorrectOpt && <XCircle size={14} className="text-red-400 ml-auto shrink-0 mt-0.5"/>}
                </div>
              );
            })}
          </div>
          {q.explanation && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1"><BookOpen size={11}/>Explanation</p>
              <p className="text-blue-800 text-sm leading-relaxed">{q.explanation}</p>
            </div>
          )}
          {q.chapter && <p className="text-xs text-slate-400">Chapter: <span className="text-slate-600">{q.chapter}</span>{q.topic ? ` › ${q.topic}` : ""}</p>}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg px-3 py-2 text-sm">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}{p.unit || ""}</p>
      ))}
    </div>
  );
};

export default function XReviseResultAnalysis() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview"|"questions"|"subjects">("overview");
  const [filter, setFilter] = useState<"all"|"correct"|"incorrect"|"skipped">("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const r = await StudentPortalAPI.getAnalysis(parseInt(attemptId!));
    if (r.status) setData(r);
    else alert(r.message || "Failed to load analysis");
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-3 text-violet-600" size={40}/>
        <p className="text-slate-600 font-semibold">Loading Analysis…</p>
      </div>
    </div>
  );
  if (!data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Analysis not available</div>;

  const { exam, result, questions: qs = [], subject_analysis = [], difficulty_analysis = {} } = data;

  const filteredQs = qs.filter((q: any) => {
    if (filter === "correct" && !q.is_correct) return false;
    if (filter === "incorrect" && (q.is_correct || !q.selected_answer)) return false;
    if (filter === "skipped" && q.selected_answer) return false;
    if (subjectFilter !== "all" && q.subject !== subjectFilter) return false;
    return true;
  });

  const subjects: string[] = [...new Set<string>(qs.map((q: any) => q.subject).filter(Boolean))];

  const pieData = [
    { name:"Correct", value: result.correct || 0 },
    { name:"Incorrect", value: result.incorrect || 0 },
    { name:"Skipped", value: result.skipped || 0 },
  ];

  const percentage = result.percentage || 0;
  const passed = result.passed;

  const subjectChartData = subject_analysis.map((s: any) => ({
    name: s.subject?.length > 12 ? s.subject.slice(0, 12) + "…" : s.subject,
    fullName: s.subject,
    accuracy: s.accuracy || 0,
    correct: s.correct || 0,
    total: s.total || 0,
  }));

  const weakAreas = subject_analysis.filter((s: any) => s.accuracy < 50);
  const strongAreas = subject_analysis.filter((s: any) => s.accuracy >= 70);

  const formatTime = (s: number) => {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-indigo-700 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate("/xrevise")} className="flex items-center gap-2 text-violet-200 hover:text-white mb-4 text-sm font-medium">
            <ArrowLeft size={16}/> Back to Portal
          </button>
          <h1 className="text-2xl font-bold">{exam?.title}</h1>
          <p className="text-violet-200 text-sm mt-0.5">Result Analysis</p>

          {/* Score Hero */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:"Score", value:`${result.final_marks || 0}/${result.total_marks || 0}`, icon:"🎯" },
              { label:"Percentage", value:`${percentage}%`, icon:"📊" },
              { label:"Rank", value: result.rank ? `#${result.rank}` : "—", icon:"🏆" },
              { label:"Status", value: passed ? "PASSED" : "FAILED", icon: passed ? "✅" : "❌" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
                <p className="text-2xl">{s.icon}</p>
                <p className="text-white font-bold text-lg">{s.value}</p>
                <p className="text-violet-200 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Quick stats strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label:"Correct",   value: result.correct || 0,   color:"text-emerald-600", bg:"bg-emerald-50 border-emerald-200" },
            { label:"Incorrect", value: result.incorrect || 0,  color:"text-red-500",     bg:"bg-red-50 border-red-200" },
            { label:"Skipped",   value: result.skipped || 0,    color:"text-slate-500",   bg:"bg-slate-50 border-slate-200" },
            { label:"Attempted", value: result.attempted || 0,  color:"text-blue-600",    bg:"bg-blue-50 border-blue-200" },
            { label:"Marks",     value: `+${result.positive_marks || 0}`, color:"text-violet-600", bg:"bg-violet-50 border-violet-200" },
            { label:"Negative",  value: `-${result.negative_marks_deducted || 0}`, color:"text-orange-500", bg:"bg-orange-50 border-orange-200" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-3 text-center ${s.bg}`}>
              <p className={`font-bold text-xl ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-slate-200 p-1 gap-1 shadow-sm">
          {([["overview","Overview"],["questions","Questions"],["subjects","Subjects"]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${activeTab===t?"bg-violet-600 text-white shadow-sm":"text-slate-500 hover:text-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Charts row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Pie chart */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4">Answer Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius:"12px", border:"1px solid #e2e8f0" }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {pieData.map((d,i) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-3 h-3 rounded-full" style={{background:PIE_COLORS[i]}}/>
                      <span className="text-slate-600">{d.name}: <strong>{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Analysis */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4">Time Analysis</h3>
                <div className="space-y-3">
                  {[
                    { label:"Total Time Taken", value: formatTime(result.time_taken_seconds) },
                    { label:"Avg per Question", value: formatTime(Math.floor((result.time_taken_seconds||0) / Math.max(result.attempted||1,1))) },
                    { label:"Time on Correct", value: formatTime(qs.filter((q:any)=>q.is_correct).reduce((s:number,q:any)=>s+(q.time_spent_seconds||0),0)) },
                    { label:"Time on Incorrect", value: formatTime(qs.filter((q:any)=>!q.is_correct&&q.selected_answer).reduce((s:number,q:any)=>s+(q.time_spent_seconds||0),0)) },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-500 text-sm">{r.label}</span>
                      <span className="font-bold text-slate-700">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-4">Difficulty Breakdown</h3>
              <div className="grid grid-cols-3 gap-3">
                {(["Easy","Medium","Hard"] as const).map(d => {
                  const info = (difficulty_analysis as any)[d] || { total:0, correct:0, incorrect:0, skipped:0 };
                  const acc = info.total > 0 ? Math.round((info.correct/info.total)*100) : 0;
                  return (
                    <div key={d} className={`rounded-xl p-4 ${d==="Easy"?"bg-emerald-50":d==="Medium"?"bg-amber-50":"bg-red-50"}`}>
                      <p className={`font-bold text-sm ${d==="Easy"?"text-emerald-700":d==="Medium"?"text-amber-700":"text-red-700"}`}>{d}</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{acc}%</p>
                      <p className="text-xs text-slate-500 mt-0.5">{info.correct}/{info.total} correct</p>
                      <div className="h-1.5 bg-slate-200 rounded-full mt-2">
                        <div className={`h-full rounded-full ${d==="Easy"?"bg-emerald-500":d==="Medium"?"bg-amber-500":"bg-red-500"}`} style={{width:`${acc}%`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weak / Strong areas */}
            <div className="grid md:grid-cols-2 gap-4">
              {weakAreas.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                  <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2"><AlertCircle size={16}/>Weak Areas</h3>
                  <div className="space-y-2">
                    {weakAreas.map((s: any) => (
                      <div key={s.subject} className="flex items-center justify-between">
                        <span className="text-sm text-red-800">{s.subject}</span>
                        <span className="text-sm font-bold text-red-600">{s.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-red-600 mt-3 font-medium">Focus on these chapters before next exam.</p>
                </div>
              )}
              {strongAreas.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                  <h3 className="font-bold text-emerald-700 mb-3 flex items-center gap-2"><TrendingUp size={16}/>Strong Areas</h3>
                  <div className="space-y-2">
                    {strongAreas.map((s: any) => (
                      <div key={s.subject} className="flex items-center justify-between">
                        <span className="text-sm text-emerald-800">{s.subject}</span>
                        <span className="text-sm font-bold text-emerald-600">{s.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-emerald-600 mt-3 font-medium">Keep up the momentum!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === "questions" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {(["all","correct","incorrect","skipped"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold capitalize transition ${filter===f ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {f} ({f==="all"?qs.length:f==="correct"?qs.filter((q:any)=>q.is_correct).length:f==="incorrect"?qs.filter((q:any)=>!q.is_correct&&q.selected_answer).length:qs.filter((q:any)=>!q.selected_answer).length})
                </button>
              ))}
              {subjects.length > 0 && (
                <select value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-sm border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-300">
                  <option value="all">All Subjects</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>

            {filteredQs.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-20"/>
                <p>No questions match the filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQs.map((q: any, i: number) => <QCard key={q.question_id} q={q} idx={qs.indexOf(q)}/>)}
              </div>
            )}
          </div>
        )}

        {/* SUBJECTS TAB */}
        {activeTab === "subjects" && (
          <div className="space-y-5">
            {subjectChartData.length > 0 ? (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-700 mb-4">Subject-wise Accuracy</h3>
                  <ResponsiveContainer width="100%" height={Math.max(200, subjectChartData.length * 40)}>
                    <BarChart data={subjectChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                      <XAxis type="number" domain={[0,100]} tickFormatter={v=>`${v}%`} tick={{fontSize:11}}/>
                      <YAxis type="category" dataKey="name" width={90} tick={{fontSize:11}}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="accuracy" name="Accuracy" unit="%" radius={[0,6,6,0]}>
                        {subjectChartData.map((_: any, i: number) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {["Subject","Total","Correct","Incorrect","Skipped","Accuracy"].map(h=>(
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subject_analysis.map((s: any) => (
                        <tr key={s.subject} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-semibold text-slate-700">{s.subject}</td>
                          <td className="px-4 py-3 text-slate-500">{s.total}</td>
                          <td className="px-4 py-3 text-emerald-600 font-bold">{s.correct}</td>
                          <td className="px-4 py-3 text-red-500 font-bold">{s.incorrect}</td>
                          <td className="px-4 py-3 text-slate-400">{s.skipped}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full">
                                <div className="h-full rounded-full bg-violet-500" style={{width:`${s.accuracy}%`}}/>
                              </div>
                              <span className={`font-bold text-xs w-10 text-right ${s.accuracy>=70?"text-emerald-600":s.accuracy>=40?"text-amber-600":"text-red-500"}`}>{s.accuracy}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {subjectChartData.length >= 3 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-4">Subject Radar</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={subjectChartData}>
                        <PolarGrid gridType="polygon"/>
                        <PolarAngleAxis dataKey="name" tick={{fontSize:11}}/>
                        <Radar name="Accuracy" dataKey="accuracy" fill="#8b5cf6" fillOpacity={0.25} stroke="#8b5cf6" strokeWidth={2}/>
                        <Tooltip contentStyle={{borderRadius:"12px"}}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center text-slate-400">
                <BarChart3 size={40} className="mx-auto mb-3 opacity-20"/>
                <p>No subject data available</p>
              </div>
            )}
          </div>
        )}

        <div className="pb-8"/>
      </div>
    </div>
  );
}
