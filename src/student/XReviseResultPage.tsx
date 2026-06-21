import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, CheckCircle, XCircle, MinusCircle, BarChart2, ArrowLeft, BookOpen, Star } from "lucide-react";

interface QuestionResult {
  id: number;
  correct_answer: string;
  selected: string;
  isCorrect: boolean;
}

interface ResultState {
  result: {
    correct: number;
    wrong: number;
    unattempted: number;
    score: number;
    totalMarks: number;
    accuracy: number;
    rank: number;
    totalStudents: number;
    questionResults?: QuestionResult[];
  };
  examTitle?: string;
  questions?: any[];
  answers?: Record<string, string>;
}

export default function XReviseResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  if (!state?.result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500">No result data found.</p>
        <button onClick={() => navigate("/student/dashboard")} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { result, examTitle, questions, answers } = state;
  const { correct, wrong, unattempted, score, totalMarks, accuracy, rank, totalStudents, questionResults } = result;
  const attempted = correct + wrong;
  const accuracyPct = Math.round((accuracy || 0) * 100);
  const percentile = totalStudents > 1 ? Math.round(((totalStudents - rank) / (totalStudents - 1)) * 100) : 100;

  // Subject-wise breakdown
  const subjectMap: Record<string, { correct: number; wrong: number; total: number }> = {};
  if (questions && questionResults) {
    const qrMap = Object.fromEntries(questionResults.map(qr => [String(qr.id), qr]));
    for (const q of questions) {
      const sub = q.subject || "General";
      if (!subjectMap[sub]) subjectMap[sub] = { correct: 0, wrong: 0, total: 0 };
      subjectMap[sub].total++;
      const qr = qrMap[String(q.id)];
      if (qr?.isCorrect) subjectMap[sub].correct++;
      else if (qr?.selected !== undefined && qr?.selected !== null) subjectMap[sub].wrong++;
    }
  }
  const subjectEntries = Object.entries(subjectMap).sort((a, b) => b[1].total - a[1].total);

  const rankLabel = rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`;
  const isTopPerformer = rank <= Math.ceil(totalStudents * 0.1);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/student/daily-tests")}
          className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Test Result</h1>
          {examTitle && <p className="text-sm text-gray-500">{examTitle}</p>}
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white mb-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider mb-1">Your Score</p>
            <div className="text-5xl font-extrabold">
              {score.toFixed(0)}
              <span className="text-emerald-300 text-2xl font-bold">/{totalMarks}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{rankLabel}</div>
            <div className="text-emerald-200 text-xs mt-1">
              of {totalStudents} {totalStudents === 1 ? "student" : "students"}
            </div>
          </div>
        </div>

        {isTopPerformer && (
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2 mb-4 text-sm font-bold">
            <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
            Top {100 - percentile < 10 ? 10 : 100 - percentile}% Performer!
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="bg-white/15 rounded-xl p-2">
            <div className="text-xl font-extrabold text-white">{correct}</div>
            <div className="text-emerald-200 text-xs">Correct</div>
          </div>
          <div className="bg-white/15 rounded-xl p-2">
            <div className="text-xl font-extrabold text-white">{wrong}</div>
            <div className="text-emerald-200 text-xs">Wrong</div>
          </div>
          <div className="bg-white/15 rounded-xl p-2">
            <div className="text-xl font-extrabold text-white">{unattempted}</div>
            <div className="text-emerald-200 text-xs">Skipped</div>
          </div>
          <div className="bg-white/15 rounded-xl p-2">
            <div className="text-xl font-extrabold text-white">{accuracyPct}%</div>
            <div className="text-emerald-200 text-xs">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-500 font-semibold uppercase">Rank</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{rank} <span className="text-sm font-normal text-gray-400">/ {totalStudents}</span></div>
          <div className="text-xs text-gray-500 mt-1">Percentile: <span className="font-bold text-emerald-600">{percentile}th</span></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500 font-semibold uppercase">Accuracy</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{accuracyPct}%</div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${accuracyPct}%` }} />
          </div>
        </div>
      </div>

      {/* Subject-wise Breakdown */}
      {subjectEntries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900">Subject-wise Performance</h2>
          </div>
          <div className="space-y-3">
            {subjectEntries.map(([sub, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              return (
                <div key={sub}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-800">{sub}</span>
                    <span className="text-gray-500 text-xs">{stats.correct}/{stats.total} correct ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Review */}
      {questionResults && questions && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            Question Review
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const qr = questionResults.find(r => String(r.id) === String(q.id));
              const answered = qr?.selected !== undefined && qr?.selected !== null;
              const isCorrect = qr?.isCorrect;
              return (
                <div key={q.id} className={`p-3 rounded-xl border text-sm ${
                  !answered ? "bg-gray-50 border-gray-100" :
                  isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">
                      {!answered ? <MinusCircle className="w-4 h-4 text-gray-400" /> :
                       isCorrect ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                       <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 line-clamp-2">Q{idx + 1}. {q.question_text}</div>
                      {q.subject && <div className="text-xs text-gray-400 mt-0.5">{q.subject}</div>}
                    </div>
                    <div className="text-xs font-bold shrink-0">
                      {!answered ? <span className="text-gray-400">Skipped</span> :
                       isCorrect ? <span className="text-green-600">+{q.marks}</span> :
                       <span className="text-red-500">{q.negative_marks}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/student/daily-tests")}
          className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
        >
          <BookOpen size={18} /> Back to Schedule
        </button>
        <button
          onClick={() => navigate("/student/xrevise-attempts")}
          className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition"
        >
          View All Attempts
        </button>
      </div>
    </div>
  );
}
