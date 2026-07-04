import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Clock, ChevronLeft, ChevronRight, Flag, X, Send,
  CheckCircle, BookmarkCheck, SkipForward,
  Loader2, RotateCcw, Maximize2,
} from "lucide-react";
import { StudentPortalAPI } from "@/services/examApi";

// Question status in palette
type QStatus = "not_visited" | "skipped" | "answered" | "marked" | "answered_marked";
const STATUS_STYLE: Record<QStatus,string> = {
  not_visited:     "bg-slate-200 text-slate-600",
  skipped:         "bg-red-100 text-red-600 border border-red-300",
  answered:        "bg-emerald-500 text-white",
  marked:          "bg-violet-500 text-white",
  answered_marked: "bg-amber-400 text-white",
};

interface Answer {
  selected: string | null;
  is_marked: boolean;
  is_visited: boolean;
  time_spent: number;
}

export default function XReviseExamInterface() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showPalette, setShowPalette] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const questionTimerRef = useRef<ReturnType<typeof setInterval>>();
  const questionStartRef = useRef(Date.now());
  const saveQueueRef = useRef<NodeJS.Timeout>();

  // Load exam on mount
  useEffect(() => {
    loadExam();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(questionTimerRef.current);
    };
  }, []);

  const loadExam = async () => {
    setLoading(true);
    const r = await StudentPortalAPI.startExam(parseInt(examId!));
    if (!r.status) {
      alert(r.message || "Failed to start exam");
      navigate("/xrevise");
      return;
    }
    setExam(r.exam);
    setQuestions(r.questions);
    setAttemptId(r.attempt_id);
    setTimeRemaining(r.time_remaining_seconds);
    setCurrentIdx(r.current_question_index || 0);

    // Restore saved answers
    const savedAnswers: Record<number, Answer> = {};
    for (const q of r.questions) {
      savedAnswers[q.question_id] = { selected: null, is_marked: false, is_visited: false, time_spent: 0 };
    }
    for (const a of (r.answers || [])) {
      if (savedAnswers[a.question_id] !== undefined) {
        savedAnswers[a.question_id] = {
          selected: a.selected_answer || null,
          is_marked: a.is_marked_review || false,
          is_visited: a.is_visited || false,
          time_spent: a.time_spent_seconds || 0,
        };
      }
    }
    setAnswers(savedAnswers);
    setLoading(false);
  };

  // Countdown timer
  useEffect(() => {
    if (!timeRemaining || submitted || autoSubmitted) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmitTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeRemaining > 0, submitted, autoSubmitted]);

  // Question time tracking
  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentIdx]);

  const getTimeSpentOnCurrent = () => Math.floor((Date.now() - questionStartRef.current) / 1000);

  // Anti-cheat: visibility change — disabled for now so students can freely
  // switch screens/tabs without the exam flagging a violation or auto-submitting.

  const handleAutoSubmitTimeout = async () => {
    if (submitted || autoSubmitted) return;
    setSubmitting(true);
    const r = await StudentPortalAPI.submit({ attempt_id: attemptId, time_remaining_seconds: 0 });
    setSubmitting(false);
    setSubmitted(true);
    navigate(`/xrevise/result/${attemptId}`);
  };

  // Auto-save answer
  const saveAnswer = useCallback(async (qId: number, data: Answer, remaining: number, idx: number) => {
    if (!attemptId) return;
    await StudentPortalAPI.saveAnswer({
      attempt_id: attemptId,
      question_id: qId,
      selected_answer: data.selected || null,
      is_marked_review: data.is_marked,
      is_visited: data.is_visited,
      time_spent_seconds: data.time_spent,
      current_question_index: idx,
      time_remaining_seconds: remaining,
    });
  }, [attemptId]);

  const selectOption = (option: string) => {
    const q = questions[currentIdx];
    if (!q) return;
    const timeSpent = getTimeSpentOnCurrent();
    const updated = {
      ...answers,
      [q.question_id]: {
        selected: option === answers[q.question_id]?.selected ? null : option,
        is_marked: answers[q.question_id]?.is_marked || false,
        is_visited: true,
        time_spent: (answers[q.question_id]?.time_spent || 0) + timeSpent,
      },
    };
    setAnswers(updated);
    questionStartRef.current = Date.now();
    clearTimeout(saveQueueRef.current);
    saveQueueRef.current = setTimeout(() => saveAnswer(q.question_id, updated[q.question_id], timeRemaining, currentIdx), 500);
  };

  const clearResponse = () => {
    const q = questions[currentIdx];
    if (!q) return;
    const updated = {
      ...answers,
      [q.question_id]: { ...answers[q.question_id], selected: null, is_visited: true },
    };
    setAnswers(updated);
    saveAnswer(q.question_id, updated[q.question_id], timeRemaining, currentIdx);
  };

  const toggleMark = () => {
    const q = questions[currentIdx];
    if (!q) return;
    const updated = {
      ...answers,
      [q.question_id]: {
        ...answers[q.question_id],
        is_marked: !answers[q.question_id]?.is_marked,
        is_visited: true,
      },
    };
    setAnswers(updated);
    saveAnswer(q.question_id, updated[q.question_id], timeRemaining, currentIdx);
  };

  const navigate_Q = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    // Mark current as visited
    const q = questions[currentIdx];
    if (q) {
      const timeSpent = getTimeSpentOnCurrent();
      const cur = answers[q.question_id] || { selected:null, is_marked:false, is_visited:false, time_spent:0 };
      const upd = { ...answers, [q.question_id]: { ...cur, is_visited:true, time_spent: cur.time_spent + timeSpent } };
      setAnswers(upd);
      saveAnswer(q.question_id, upd[q.question_id], timeRemaining, idx);
    }
    questionStartRef.current = Date.now();
    setCurrentIdx(idx);
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    setShowSubmitModal(false);
    const r = await StudentPortalAPI.submit({ attempt_id: attemptId, time_remaining_seconds: timeRemaining });
    setSubmitting(false);
    if (r.status) {
      setSubmitted(true);
      navigate(`/xrevise/result/${attemptId}`);
    } else alert(r.message || "Submit failed");
  };

  const getQStatus = (idx: number): QStatus => {
    const q = questions[idx];
    if (!q) return "not_visited";
    const a = answers[q.question_id];
    if (!a || !a.is_visited) return "not_visited";
    if (a.selected && a.is_marked) return "answered_marked";
    if (a.is_marked) return "marked";
    if (a.selected) return "answered";
    return "skipped";
  };

  const stats = {
    answered: questions.filter((_, i) => getQStatus(i) === "answered").length,
    marked:   questions.filter((_, i) => getQStatus(i) === "marked" || getQStatus(i) === "answered_marked").length,
    skipped:  questions.filter((_, i) => getQStatus(i) === "skipped").length,
    not_visited: questions.filter((_, i) => getQStatus(i) === "not_visited").length,
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
      : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const currentQ = questions[currentIdx];
  const currentAns = currentQ ? (answers[currentQ.question_id] || { selected:null, is_marked:false, is_visited:false, time_spent:0 }) : null;
  const isLowTime = timeRemaining < 300;

  if (loading) return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="animate-spin mx-auto mb-3" size={40}/>
        <p className="font-semibold">Loading exam…</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm px-4 h-14 flex items-center gap-4 shrink-0">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{exam?.title}</p>
          <p className="text-xs text-slate-500">{currentIdx + 1} / {questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${isLowTime ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-100 text-slate-700"}`}>
          <Clock size={15}/>
          {formatTime(timeRemaining)}
        </div>
        <button onClick={() => setShowSubmitModal(true)} disabled={submitting}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm disabled:opacity-60">
          {submitting ? <Loader2 size={15} className="animate-spin"/> : <Send size={15}/>}
          Submit
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {currentQ && (
              <div className="max-w-2xl mx-auto space-y-5">
                {/* Question header */}
                <div className="flex items-center gap-3">
                  <span className="bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-lg text-sm">Q {currentIdx + 1}</span>
                  {currentQ.subject && <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full font-medium">{currentQ.subject}</span>}
                  {currentQ.difficulty && <span className="text-xs text-slate-500">{currentQ.difficulty}</span>}
                  <span className="ml-auto text-xs text-slate-400">{currentQ.marks}M / -{currentQ.negative_marks}M</span>
                </div>

                {/* Question text */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  {currentQ.image_url && (
                    <img src={currentQ.image_url} alt="Question" className="w-full max-h-56 object-contain rounded-xl mb-4 border border-slate-100"/>
                  )}
                  <p className="text-slate-800 font-medium leading-relaxed">{currentQ.question_text}</p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {(["A","B","C","D"] as const).map(opt => {
                    const val = (currentQ as any)[`option_${opt.toLowerCase()}`];
                    const isSelected = currentAns?.selected === opt;
                    return (
                      <button key={opt} onClick={() => selectOption(opt)}
                        className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}>
                        <span className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                          {opt}
                        </span>
                        <span className={`text-sm leading-relaxed mt-0.5 ${isSelected ? "text-emerald-800 font-medium" : "text-slate-700"}`}>
                          {val}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-2 shrink-0">
            <button onClick={() => navigate_Q(currentIdx - 1)} disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm disabled:opacity-40">
              <ChevronLeft size={16}/> Previous
            </button>
            <button onClick={clearResponse}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium">
              <X size={14}/> Clear
            </button>
            <button onClick={toggleMark}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ${currentAns?.is_marked ? "bg-violet-100 text-violet-700" : "text-slate-500 hover:bg-slate-100"}`}>
              <Flag size={14}/> {currentAns?.is_marked ? "Unmark" : "Mark"}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => navigate_Q(currentIdx + 1)} disabled={currentIdx === questions.length - 1}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm disabled:opacity-40">
                Save & Next <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette */}
        <div className={`bg-white border-l border-slate-200 flex flex-col shrink-0 ${showPalette ? "w-72" : "w-0 overflow-hidden"} transition-all`}>
          <div className="p-4 border-b border-slate-100">
            <p className="font-bold text-slate-700 text-sm mb-3">Question Palette</p>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {([
                ["not_visited","Not Visited"],
                ["answered","Answered"],
                ["skipped","Skipped"],
                ["marked","Marked"],
                ["answered_marked","Ans+Marked"],
              ] as const).map(([status, label]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-bold ${STATUS_STYLE[status]}`}>Q</span>
                  <span className="text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 p-3 border-b border-slate-100 text-xs">
            <div className="text-center bg-emerald-50 rounded-lg p-2">
              <p className="font-bold text-emerald-600 text-lg">{stats.answered}</p>
              <p className="text-emerald-700">Answered</p>
            </div>
            <div className="text-center bg-violet-50 rounded-lg p-2">
              <p className="font-bold text-violet-600 text-lg">{stats.marked}</p>
              <p className="text-violet-700">Marked</p>
            </div>
            <div className="text-center bg-red-50 rounded-lg p-2">
              <p className="font-bold text-red-600 text-lg">{stats.skipped}</p>
              <p className="text-red-600">Skipped</p>
            </div>
            <div className="text-center bg-slate-50 rounded-lg p-2">
              <p className="font-bold text-slate-600 text-lg">{stats.not_visited}</p>
              <p className="text-slate-500">Not visited</p>
            </div>
          </div>

          {/* Palette grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const status = getQStatus(idx);
                return (
                  <button key={q.question_id} onClick={() => navigate_Q(idx)}
                    className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${STATUS_STYLE[status]} ${currentIdx===idx?"ring-2 ring-offset-1 ring-slate-500":""}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 border-t border-slate-100">
            <button onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
              <Send size={15}/> Submit Exam
            </button>
          </div>
        </div>

        {/* Palette toggle button */}
        <button onClick={() => setShowPalette(p=>!p)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-700 text-white p-1.5 rounded-l-lg z-10">
          {showPalette ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Send className="text-emerald-600" size={18}/>
              </div>
              <h2 className="font-bold text-slate-800 text-lg">Submit Exam?</h2>
            </div>

            <div className="space-y-2 mb-5">
              {[
                { label:"Answered", value: stats.answered, color:"text-emerald-600" },
                { label:"Not Answered", value: stats.skipped + stats.not_visited, color:"text-red-500" },
                { label:"Marked for Review", value: stats.marked, color:"text-violet-600" },
                { label:"Time Remaining", value: formatTime(timeRemaining), color:"text-slate-700" },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 mb-5">Once submitted, you cannot change your answers. Are you sure?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting && <Loader2 size={15} className="animate-spin"/>}
                {submitting ? "Submitting…" : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
