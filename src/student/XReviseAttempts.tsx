import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, Calendar, CheckCircle, ArrowLeft, Loader2, Trophy } from "lucide-react";
import { StudentAPI } from "@/services/studentApi";

interface Attempt {
  id: number;
  exam_id: number;
  submitted_at: string;
  correct: number;
  wrong: number;
  unattempted: number;
  score: number;
  total_marks: number;
  accuracy: number;
  exam_title: string;
  exam_subject: string | null;
}

export default function XReviseAttempts() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentAPI.getXreviseAttempts()
      .then(res => { if (res.status) setAttempts(res.attempts); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalTests = attempts.length;
  const avgAccuracy = totalTests > 0
    ? Math.round(attempts.reduce((s, a) => s + (a.accuracy || 0), 0) / totalTests * 100)
    : 0;
  const totalScore = attempts.reduce((s, a) => s + (a.score || 0), 0);

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/student/daily-tests")} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My XRevise Attempts</h1>
          <p className="text-sm text-gray-500">Your complete daily test history</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border p-4 text-center shadow-sm">
          <div className="text-2xl font-extrabold text-emerald-600">{totalTests}</div>
          <div className="text-xs text-gray-500 mt-1">Tests Done</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center shadow-sm">
          <div className="text-2xl font-extrabold text-blue-600">{avgAccuracy}%</div>
          <div className="text-xs text-gray-500 mt-1">Avg Accuracy</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center shadow-sm">
          <div className="text-2xl font-extrabold text-purple-600">{totalScore.toFixed(0)}</div>
          <div className="text-xs text-gray-500 mt-1">Total Score</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-emerald-600" /></div>
      ) : attempts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No attempts yet</p>
          <p className="text-gray-400 text-sm mt-1">Complete your first daily test to see results here.</p>
          <button
            onClick={() => navigate("/student/daily-tests")}
            className="mt-4 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 text-sm"
          >
            Start Today's Test
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map(a => {
            const accuracyPct = Math.round((a.accuracy || 0) * 100);
            const date = new Date(a.submitted_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            });
            return (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{a.exam_title || `Exam #${a.exam_id}`}</h3>
                    {a.exam_subject && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                        {a.exam_subject}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Calendar size={11} /> {date}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-extrabold text-gray-900">
                      {a.score?.toFixed(0)} <span className="text-xs text-gray-400 font-normal">/{a.total_marks}</span>
                    </div>
                    <div className={`text-xs font-bold ${accuracyPct >= 70 ? "text-green-600" : accuracyPct >= 40 ? "text-yellow-600" : "text-red-500"}`}>
                      {accuracyPct}% acc
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                  <div className="bg-green-50 rounded-lg py-1.5">
                    <div className="font-bold text-green-700">{a.correct}</div>
                    <div className="text-green-600">Correct</div>
                  </div>
                  <div className="bg-red-50 rounded-lg py-1.5">
                    <div className="font-bold text-red-600">{a.wrong}</div>
                    <div className="text-red-500">Wrong</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-1.5">
                    <div className="font-bold text-gray-600">{a.unattempted}</div>
                    <div className="text-gray-400">Skipped</div>
                  </div>
                </div>
                {/* Accuracy bar */}
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${accuracyPct >= 70 ? "bg-green-500" : accuracyPct >= 40 ? "bg-yellow-500" : "bg-red-400"}`}
                    style={{ width: `${accuracyPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
