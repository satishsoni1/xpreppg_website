import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, CheckCircle, XCircle, MinusCircle, Clock, BookOpen, BarChart3 } from "lucide-react";
import { StudentAPI } from "@/services/studentApi";

function fmtTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

const OPTION_KEYS = ["A","B","C","D"];
function optVal(opts: any, key: string): string {
  if (!opts) return "";
  if (Array.isArray(opts)) return opts[OPTION_KEYS.indexOf(key)] || "";
  return opts[key] || "";
}

export default function StudentCBTResult() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const r = await StudentAPI.cbt.getResultDetail(Number(examId));
      if (r.status) {
        setResult(r.result);
        setAnswers(r.answers);
      }
      setLoading(false);
    };
    load();
  }, [examId]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (!result) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <p className="text-gray-500">Result not available yet or not published.</p>
      <button onClick={() => navigate("/student/cbt-exams")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Back to Exams</button>
    </div>
  );

  const sections: Record<number, any[]> = {};
  answers.forEach(a => {
    const sec = a.section_index ?? 0;
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(a);
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/student/cbt-exams")} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{result.exam_title}</h1>
          <p className="text-sm text-gray-400">CBT Result</p>
        </div>
      </div>

      {/* Score card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">Your Score</p>
            <p className="text-5xl font-black">{result.final_marks}</p>
            <p className="text-blue-200">/ {result.total_marks} marks</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <Trophy size={20} className="text-yellow-300" />
              <span className="text-3xl font-bold">#{result.rank}</span>
            </div>
            <p className="text-blue-200 text-sm">{result.percentile}th percentile</p>
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

      {/* Negative deduction */}
      {result.negative_deduction > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700 flex items-center justify-between">
          <span>Negative Marks Deducted</span>
          <span className="font-bold">-{result.negative_deduction}</span>
        </div>
      )}

      {/* Subject analysis */}
      {result.subject_analysis && Object.keys(result.subject_analysis).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><BookOpen size={16} /> Subject-wise Analysis</h3>
          <div className="space-y-3">
            {Object.entries(result.subject_analysis).map(([subj, data]: any) => {
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

      {/* Difficulty-wise analysis */}
      {result.difficulty_analysis && Object.keys(result.difficulty_analysis).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><BarChart3 size={16} /> Difficulty-wise Analysis</h3>
          <div className="space-y-3">
            {Object.entries(result.difficulty_analysis).map(([diff, data]: any) => {
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

      {/* Section-wise answers */}
      {Object.keys(sections).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {Object.keys(sections).map(sec => (
              <button
                key={sec}
                onClick={() => setActiveSection(activeSection === Number(sec) ? null : Number(sec))}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
                  activeSection === Number(sec)
                    ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Section {Number(sec)+1}
              </button>
            ))}
          </div>

          {activeSection !== null && sections[activeSection] && (
            <div className="divide-y divide-gray-50">
              {sections[activeSection].map((ans, i) => {
                const isCorrect = ans.selected_answer === ans.correct_answer;
                const isWrong = ans.selected_answer && !isCorrect;
                const isSkipped = !ans.selected_answer;
                return (
                  <div key={ans.question_id} className={`p-4 ${isCorrect ? "bg-green-50/30" : isWrong ? "bg-red-50/30" : ""}`}>
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCorrect ? "bg-green-100 text-green-700" : isWrong ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {activeSection * 20 + i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium mb-2">{ans.question_text}</p>
                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                          {OPTION_KEYS.map(key => {
                            const text = optVal(ans.options, key);
                            if (!text) return null;
                            const isOpt = ans.selected_answer === key;
                            const isCorr = ans.correct_answer === key;
                            return (
                              <div key={key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                                isCorr ? "bg-green-100 text-green-800 font-semibold" :
                                isOpt ? "bg-red-100 text-red-700 font-semibold" :
                                "bg-gray-50 text-gray-600"
                              }`}>
                                <span className="font-bold">{key}.</span> {text}
                                {isCorr && <CheckCircle size={12} className="ml-auto text-green-600 shrink-0" />}
                                {isOpt && !isCorr && <XCircle size={12} className="ml-auto text-red-500 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-400">
                          <span>Time: {fmtTime(ans.time_spent_seconds || 0)}</span>
                          {ans.change_count > 0 && <span>Changed {ans.change_count}×</span>}
                        </div>
                        {ans.explanation && (
                          <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
                            <span className="font-bold">Explanation: </span>{ans.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
