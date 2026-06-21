import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Clock, ChevronRight, ChevronLeft, Flag, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { StudentAPI } from "@/services/studentApi";
import { API_BASE_URL } from "@/config";

interface Question {
  id: number;
  question_text: string;
  type: string;
  options: Array<{ id?: string | number; text: string }>;
  marks: number;
  negative_marks: number;
  subject: string;
  topic: string;
  difficulty: string;
  image_url: string | null;
  image_path: string | null;
}

type AnswerStatus = "answered" | "marked" | "visited" | "not-visited";

export default function StudentExamPortal() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const timeSpent = useRef<Record<string, number>>({});
  const questionStartTime = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch exam + questions
  useEffect(() => {
    if (!examId) return;

    const token = localStorage.getItem("student_token");
    if (!token) { navigate("/student/login"); return; }

    (async () => {
      try {
        const data = await StudentAPI.getExamQuestions(examId);
        if (!data.status) {
          setError(data.message || "Unable to load exam");
          setLoading(false);
          return;
        }
        setExam(data.exam);
        setQuestions(data.questions);
        setTimeLeft((data.exam.duration || 60) * 60);
      } catch (err) {
        setError("Failed to load exam. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [examId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (loading || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          submitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, questions.length]);

  const recordTimeSpent = useCallback(() => {
    const qId = String(questions[currentQIndex]?.id);
    if (!qId) return;
    const now = Date.now();
    const elapsed = Math.floor((now - questionStartTime.current) / 1000);
    timeSpent.current[qId] = (timeSpent.current[qId] || 0) + elapsed;
    questionStartTime.current = now;
  }, [currentQIndex, questions]);

  const goToQuestion = useCallback((idx: number) => {
    recordTimeSpent();
    setCurrentQIndex(idx);
    setVisitedQuestions(prev => new Set(prev).add(idx));
    questionStartTime.current = Date.now();
  }, [recordTimeSpent]);

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) goToQuestion(currentQIndex + 1);
  };

  const handlePrev = () => {
    if (currentQIndex > 0) goToQuestion(currentQIndex - 1);
  };

  const handleSelect = (optionIndex: number) => {
    const qId = String(questions[currentQIndex].id);
    setAnswers(prev => ({ ...prev, [qId]: String(optionIndex) }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      const qId = questions[currentQIndex].id;
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  const clearAnswer = () => {
    const qId = String(questions[currentQIndex].id);
    setAnswers(prev => { const n = { ...prev }; delete n[qId]; return n; });
  };

  const submitExam = async (autoSubmit = false) => {
    if (submitting) return;
    recordTimeSpent();
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const data = await StudentAPI.submitDailyExam({
        examId: examId!,
        answers,
        timeSpent: timeSpent.current,
      });
      if (data.status) {
        navigate("/student/xrevise-result", {
          state: {
            result: data,
            examTitle: exam?.title,
            questions,
            answers,
          },
        });
      } else if (data.message === "Already submitted today") {
        navigate("/student/xrevise-attempts");
      } else {
        alert(data.message || "Submission failed");
        setSubmitting(false);
      }
    } catch (err) {
      alert("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const getQuestionStatus = (idx: number): AnswerStatus => {
    const q = questions[idx];
    const qId = String(q.id);
    if (answers[qId]) return markedForReview.has(q.id) ? "marked" : "answered";
    if (markedForReview.has(q.id)) return "marked";
    if (visitedQuestions.has(idx)) return "visited";
    return "not-visited";
  };

  const statusStyle: Record<AnswerStatus, string> = {
    answered: "bg-green-500 text-white",
    marked: "bg-orange-400 text-white",
    visited: "bg-red-100 text-red-600 border border-red-300",
    "not-visited": "bg-gray-100 text-gray-500",
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const isUrgent = timeLeft <= 300;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Loading exam…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Exam</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">No questions found for this exam.</p>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  const selectedAnswer = answers[String(currentQ.id)];
  const isMarked = markedForReview.has(currentQ.id);

  const imageUrl = currentQ.image_url
    ? (currentQ.image_url.startsWith("http") ? currentQ.image_url : `${API_BASE_URL.replace("/api", "")}/${currentQ.image_url}`)
    : currentQ.image_path
    ? `${API_BASE_URL.replace("/api", "")}/api/uploads/${currentQ.image_path}`
    : null;

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">

      {/* LEFT: Question Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-14 bg-white border-b px-4 flex items-center justify-between shadow-sm shrink-0 gap-3">
          <h2 className="font-bold text-gray-900 text-base line-clamp-1 flex-1">{exam?.title || "Exam"}</h2>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono font-bold text-sm ${isUrgent ? "bg-red-100 text-red-700 animate-pulse" : "bg-emerald-50 text-emerald-700"}`}>
            <Clock size={16} /> {formatTime(timeLeft)}
          </div>
        </div>

        {/* Subject tag + Q number */}
        <div className="px-6 pt-4 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Q {currentQIndex + 1} / {questions.length}
            </span>
            {currentQ.subject && (
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                {currentQ.subject}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">+{currentQ.marks} / {currentQ.negative_marks}</span>
        </div>

        {/* Question Content */}
        <div className="flex-1 px-6 pb-2 overflow-y-auto">
          <div className="max-w-2xl">
            {/* Image */}
            {imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
                <img src={imageUrl} alt="Question" className="max-h-56 object-contain w-full bg-white" />
              </div>
            )}

            <p className="text-gray-900 font-medium text-lg leading-relaxed mb-6">
              {currentQ.question_text}
            </p>

            {/* MCQ Options */}
            {currentQ.type === "mcq" || !currentQ.type ? (
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const optKey = String(idx);
                  const isSelected = selectedAnswer === optKey;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left flex items-start gap-3 p-4 border-2 rounded-xl transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-200 bg-white"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {["A", "B", "C", "D", "E"][idx] || idx + 1}
                      </div>
                      <span className={`text-base ${isSelected ? "text-emerald-900 font-semibold" : "text-gray-800"}`}>
                        {opt.text || String(opt)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                className="w-full h-36 border-2 border-gray-200 rounded-xl p-4 text-base focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                placeholder="Type your answer here…"
                onChange={e => setAnswers(prev => ({ ...prev, [String(currentQ.id)]: e.target.value }))}
                value={answers[String(currentQ.id)] || ""}
              />
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="bg-white border-t px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentQIndex === 0}
            className="flex items-center gap-1.5 text-gray-600 font-semibold hover:bg-gray-100 px-3 py-2 rounded-lg disabled:opacity-30 text-sm"
          >
            <ChevronLeft size={18} /> Prev
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMarkForReview}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition ${
                isMarked ? "bg-orange-100 text-orange-600" : "text-orange-500 hover:bg-orange-50"
              }`}
            >
              <Flag size={16} /> {isMarked ? "Marked" : "Mark"}
            </button>
            {selectedAnswer && (
              <button onClick={clearAnswer} className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded">
                Clear
              </button>
            )}
          </div>

          {currentQIndex === questions.length - 1 ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-700 text-sm shadow"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 text-sm flex items-center gap-1 shadow"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: Question Palette */}
      <div className="w-72 bg-white border-l flex flex-col shrink-0">
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-800 mb-2">Question Palette</h3>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div>Answered</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-400 rounded-sm"></div>Marked</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded-sm"></div>Visited</div>
          </div>
        </div>

        <div className="flex-1 p-3 grid grid-cols-5 gap-1.5 content-start overflow-y-auto">
          {questions.map((q, idx) => {
            const status = getQuestionStatus(idx);
            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(idx)}
                className={`h-9 w-full rounded-lg font-bold text-xs flex items-center justify-center transition ring-offset-1 ${statusStyle[status]} ${
                  currentQIndex === idx ? "ring-2 ring-slate-700 ring-offset-1" : ""
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t bg-gray-50 space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-white rounded-lg p-2 border">
              <div className="font-bold text-green-600 text-lg">{answeredCount}</div>
              <div className="text-gray-500">Answered</div>
            </div>
            <div className="bg-white rounded-lg p-2 border">
              <div className="font-bold text-gray-600 text-lg">{questions.length - answeredCount}</div>
              <div className="text-gray-500">Remaining</div>
            </div>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="w-full bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition text-sm"
          >
            {submitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Submit Exam"}
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-orange-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Submit Exam?</h3>
                <p className="text-sm text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Answered</span>
                <span className="font-bold text-green-600">{answeredCount} / {questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Unanswered</span>
                <span className="font-bold text-red-500">{questions.length - answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Marked</span>
                <span className="font-bold text-orange-500">{markedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time Left</span>
                <span className="font-bold font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
              >
                Resume
              </button>
              <button
                onClick={() => { setShowConfirm(false); submitExam(); }}
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-1"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle size={16} /> Confirm</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
