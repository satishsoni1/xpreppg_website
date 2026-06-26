import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock, ChevronLeft, ChevronRight, Flag, Send, AlertTriangle,
  CheckCircle, RotateCcw, Loader2, BookOpen,
} from "lucide-react";
import { StudentAPI } from "@/services/studentApi";

type QStatus = "not_visited" | "skipped" | "answered" | "marked" | "answered_marked";
const STATUS_STYLE: Record<QStatus, string> = {
  not_visited:     "bg-gray-200 text-gray-600",
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

export default function StudentXReviseExam() {
  const { examId } = useParams();
  const navigate   = useNavigate();

  const [loading,          setLoading]          = useState(true);
  const [exam,             setExam]             = useState<any>(null);
  const [questions,        setQuestions]        = useState<any[]>([]);
  const [attemptId,        setAttemptId]        = useState<number | null>(null);
  const [currentIdx,       setCurrentIdx]       = useState(0);
  const [answers,          setAnswers]          = useState<Record<number, Answer>>({});
  const [timeRemaining,    setTimeRemaining]    = useState(0);
  const [showPalette,      setShowPalette]      = useState(true);
  const [submitting,       setSubmitting]       = useState(false);
  const [showSubmitModal,  setShowSubmitModal]  = useState(false);
  const [submitted,        setSubmitted]        = useState(false);
  const [violations,       setViolations]       = useState(0);
  const [showWarning,      setShowWarning]      = useState<string | null>(null);
  const [error,            setError]            = useState<string | null>(null);
  const [warningLog,       setWarningLog]       = useState<string[]>([]);
  const [blocked,          setBlocked]          = useState(false);

  const timerRef           = useRef<ReturnType<typeof setInterval>>();
  const questionTimerRef   = useRef<ReturnType<typeof setInterval>>();
  const questionTimeRef    = useRef(0);
  const isSaving           = useRef(false);
  const attemptIdRef       = useRef<number | null>(null);
  const submittedRef       = useRef(false);
  const violationsRef      = useRef(0);
  const examConfigRef      = useRef<any>(null);

  // Load exam on mount
  useEffect(() => {
    if (!examId) return;
    (async () => {
      const r = await StudentAPI.xrevise.startExam(parseInt(examId));
      if (!r.status) { setError(r.message || "Failed to start exam"); setLoading(false); return; }

      setExam(r.exam);
      examConfigRef.current = r.exam;
      setQuestions(r.questions || []);
      setAttemptId(r.attempt_id);
      attemptIdRef.current = r.attempt_id;
      setTimeRemaining(r.time_remaining_seconds || (r.exam?.duration_minutes || 60) * 60);
      setCurrentIdx(r.current_question_index || 0);

      // Pre-populate answers from resume
      const init: Record<number, Answer> = {};
      for (const q of r.questions || []) {
        const existing = (r.answers || []).find((a: any) => a.question_id === q.question_id);
        init[q.question_id] = {
          selected:   existing?.selected_answer || null,
          is_marked:  existing?.is_marked_review || false,
          is_visited: existing?.is_visited       || false,
          time_spent: existing?.time_spent_seconds || 0,
        };
      }
      setAnswers(init);
      setLoading(false);
    })();
  }, [examId]);

  // Countdown timer
  useEffect(() => {
    if (loading || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, submitted]);

  // Per-question timer
  useEffect(() => {
    questionTimeRef.current = 0;
    questionTimerRef.current = setInterval(() => {
      questionTimeRef.current += 1;
    }, 1000);
    return () => clearInterval(questionTimerRef.current);
  }, [currentIdx]);

  // ── Anti-cheat system ─────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || submitted) return;

    const maxWarnings = examConfigRef.current?.max_warnings ?? 3;
    const autoSubmit  = examConfigRef.current?.auto_submit_on_warnings ?? true;

    const logViolation = async (type: string, msg: string) => {
      if (submittedRef.current) return;
      violationsRef.current += 1;
      const count = violationsRef.current;
      const entry = `[${new Date().toLocaleTimeString()}] ${msg} (${count}/${maxWarnings})`;
      setWarningLog(prev => [...prev, entry]);
      setViolations(count);
      setShowWarning(`${msg} (warning ${count}/${maxWarnings})`);

      if (attemptIdRef.current) {
        await StudentAPI.xrevise.warn({
          attempt_id: attemptIdRef.current,
          warning_type: type,
          message: entry,
        });
      }

      if (autoSubmit && count >= maxWarnings) {
        setBlocked(true);
        setShowWarning("Max violations reached. Exam auto-submitted.");
        setTimeout(() => handleAutoSubmit(), 2000);
      }
    };

    // 1. Tab / window visibility change
    const onVisibility = () => {
      if (document.hidden) logViolation("tab_switch", "Tab switch detected");
    };

    // 2. Window blur (switched to another app)
    const onBlur = () => logViolation("window_blur", "Window lost focus");

    // 3. Right-click disabled
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logViolation("right_click", "Right-click attempt");
    };

    // 4. Copy/paste/cut disabled
    const onCopy  = (e: ClipboardEvent) => { e.preventDefault(); logViolation("copy",  "Copy attempt blocked"); };
    const onPaste = (e: ClipboardEvent) => { e.preventDefault(); logViolation("paste", "Paste attempt blocked"); };
    const onCut   = (e: ClipboardEvent) => { e.preventDefault(); logViolation("cut",   "Cut attempt blocked"); };

    // 5. Screenshot / PrintScreen key
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") { e.preventDefault(); logViolation("screenshot", "Screenshot key pressed"); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) { e.preventDefault(); logViolation("print", "Print attempt blocked"); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "i" || e.key === "I" || e.key === "j" || e.key === "J" || e.key === "c" || e.key === "C")) {
        e.preventDefault(); logViolation("devtools", "DevTools shortcut blocked");
      }
    };

    // 6. Fullscreen exit detection (if exam requested fullscreen)
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) logViolation("fullscreen_exit", "Exited fullscreen");
    };

    document.addEventListener("visibilitychange",  onVisibility);
    window.addEventListener("blur",               onBlur);
    document.addEventListener("contextmenu",       onContextMenu);
    document.addEventListener("copy",              onCopy);
    document.addEventListener("paste",             onPaste);
    document.addEventListener("cut",               onCut);
    document.addEventListener("keydown",           onKeyDown);
    document.addEventListener("fullscreenchange",  onFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange",  onVisibility);
      window.removeEventListener("blur",               onBlur);
      document.removeEventListener("contextmenu",       onContextMenu);
      document.removeEventListener("copy",              onCopy);
      document.removeEventListener("paste",             onPaste);
      document.removeEventListener("cut",               onCut);
      document.removeEventListener("keydown",           onKeyDown);
      document.removeEventListener("fullscreenchange",  onFullscreenChange);
    };
  }, [loading, submitted]);

  const saveAnswer = useCallback(async (questionId: number, ans: Answer, idx: number) => {
    if (!attemptId || isSaving.current) return;
    isSaving.current = true;
    await StudentAPI.xrevise.saveAnswer({
      attempt_id:           attemptId,
      question_id:          questionId,
      selected_answer:      ans.selected,
      is_marked_review:     ans.is_marked,
      time_spent_seconds:   ans.time_spent,
      current_question_index: idx,
      time_remaining_seconds: timeRemaining,
    });
    isSaving.current = false;
  }, [attemptId, timeRemaining]);

  const flushCurrentQuestion = useCallback((nextIdx: number) => {
    const q = questions[currentIdx];
    if (!q) return;
    const timeOnQ = questionTimeRef.current;
    setAnswers(prev => {
      const updated: Answer = {
        ...prev[q.question_id],
        is_visited: true,
        time_spent: (prev[q.question_id]?.time_spent || 0) + timeOnQ,
      };
      saveAnswer(q.question_id, updated, nextIdx);
      return { ...prev, [q.question_id]: updated };
    });
  }, [currentIdx, questions, saveAnswer]);

  const goTo = (idx: number) => {
    flushCurrentQuestion(idx);
    setCurrentIdx(idx);
  };

  const selectAnswer = (letter: string) => {
    const q = questions[currentIdx];
    if (!q) return;
    setAnswers(prev => {
      const cur = prev[q.question_id] || { selected: null, is_marked: false, is_visited: true, time_spent: 0 };
      const toggled = cur.selected === letter ? null : letter;
      const updated: Answer = { ...cur, selected: toggled, is_visited: true };
      saveAnswer(q.question_id, updated, currentIdx);
      return { ...prev, [q.question_id]: updated };
    });
  };

  const toggleMark = () => {
    const q = questions[currentIdx];
    if (!q) return;
    setAnswers(prev => {
      const cur = prev[q.question_id] || { selected: null, is_marked: false, is_visited: true, time_spent: 0 };
      const updated: Answer = { ...cur, is_marked: !cur.is_marked, is_visited: true };
      saveAnswer(q.question_id, updated, currentIdx);
      return { ...prev, [q.question_id]: updated };
    });
  };

  const handleAutoSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    clearInterval(timerRef.current);
    const aid = attemptIdRef.current;
    if (aid) await StudentAPI.xrevise.submit({ attempt_id: aid, time_remaining_seconds: 0 });
    navigate(`/student/xrevise/result/${aid}`);
  };

  const handleSubmit = async () => {
    if (!attemptId || submitting) return;
    flushCurrentQuestion(currentIdx);
    setSubmitting(true);
    setShowSubmitModal(false);
    clearInterval(timerRef.current);
    const r = await StudentAPI.xrevise.submit({ attempt_id: attemptId, time_remaining_seconds: timeRemaining });
    if (r.status || r.result) {
      submittedRef.current = true;
      setSubmitted(true);
      navigate(`/student/xrevise/result/${attemptId}`);
    } else {
      alert(r.message || "Submit failed");
      setSubmitting(false);
    }
  };

  const getQStatus = (qId: number): QStatus => {
    const a = answers[qId];
    if (!a || !a.is_visited) return "not_visited";
    if (a.selected && a.is_marked) return "answered_marked";
    if (a.is_marked) return "marked";
    if (a.selected) return "answered";
    return "skipped";
  };

  const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const timerColor = timeRemaining < 300 ? "text-red-500" : timeRemaining < 600 ? "text-amber-500" : "text-emerald-600";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-3 text-emerald-600" size={36} />
        <p className="text-gray-500 font-medium">Loading exam…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md">
        <AlertTriangle className="mx-auto mb-3 text-red-500" size={40} />
        <p className="font-bold text-gray-800 mb-2">Unable to load exam</p>
        <p className="text-gray-500 text-sm mb-5">{error}</p>
        <button onClick={() => navigate("/student/dashboard")}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const q = questions[currentIdx];
  const curAnswer = answers[q?.question_id] || { selected: null, is_marked: false, is_visited: false, time_spent: 0 };
  const answered  = Object.values(answers).filter(a => a.selected).length;
  const marked    = Object.values(answers).filter(a => a.is_marked).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-emerald-600" size={20} />
            <span className="font-bold text-gray-800 text-sm truncate max-w-xs">{exam?.title}</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {violations > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full border border-red-200">
                ⚠ {violations} / {examConfigRef.current?.max_warnings ?? 3} warnings
              </span>
            )}
            <div className={`flex items-center gap-1.5 font-mono font-bold text-lg ${timerColor}`}>
              <Clock size={18} /> {fmt(timeRemaining)}
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* Blocked overlay — auto-submit triggered */}
      {blocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-2xl">
            <AlertTriangle className="mx-auto mb-3 text-red-500" size={44} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Exam Auto-Submitted</h2>
            <p className="text-gray-500 text-sm">Maximum violations reached. Your exam has been automatically submitted.</p>
            <p className="text-xs text-gray-400 mt-3">Redirecting to results…</p>
          </div>
        </div>
      )}

      {/* Warning banner */}
      {showWarning && !blocked && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <span className="text-amber-800 text-sm font-medium">{showWarning}</span>
          <span className="ml-auto flex items-center gap-3">
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              {violations} warning{violations !== 1 ? "s" : ""} / {examConfigRef.current?.max_warnings ?? 3}
            </span>
            <button onClick={() => setShowWarning(null)} className="text-amber-600 text-xs font-bold">Dismiss</button>
          </span>
        </div>
      )}

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-4 gap-4">

        {/* Question panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex-1">

            {/* Q number + mark */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Question {currentIdx + 1} / {questions.length}
              </span>
              <button
                onClick={toggleMark}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                  curAnswer.is_marked
                    ? "bg-violet-100 text-violet-700 border-violet-300"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:border-violet-300"
                }`}
              >
                <Flag size={13} /> {curAnswer.is_marked ? "Marked" : "Mark for Review"}
              </button>
            </div>

            {/* Question text */}
            {q?.image_url && (
              <img src={q.image_url} alt="question" className="max-h-48 mb-4 rounded-lg object-contain" />
            )}
            <p className="text-gray-800 font-medium text-base leading-relaxed mb-6 whitespace-pre-wrap">
              {q?.question_text}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {(["A", "B", "C", "D"] as const).map(letter => {
                const optKey = `option_${letter.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d";
                const optText = q?.[optKey];
                if (!optText) return null;
                const selected = curAnswer.selected === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => selectAnswer(letter)}
                    className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      selected ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {letter}
                    </span>
                    <span className={`text-sm leading-relaxed pt-0.5 ${selected ? "text-emerald-900 font-medium" : "text-gray-700"}`}>
                      {optText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => currentIdx > 0 && goTo(currentIdx - 1)}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <div className="text-xs text-gray-400 font-medium">
              {answered} answered · {marked} marked
            </div>

            <button
              onClick={() => currentIdx < questions.length - 1 && goTo(currentIdx + 1)}
              disabled={currentIdx === questions.length - 1}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm disabled:opacity-40 transition"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Question palette */}
        {showPalette && (
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-700 text-sm">Question Palette</h3>
                <button onClick={() => setShowPalette(false)} className="text-gray-400 hover:text-gray-600 text-xs">Hide</button>
              </div>

              {/* Legend */}
              <div className="space-y-1 mb-3 text-[11px]">
                {([
                  ["answered",        "Answered"],
                  ["marked",          "Marked for Review"],
                  ["answered_marked", "Answered + Marked"],
                  ["skipped",         "Skipped"],
                  ["not_visited",     "Not Visited"],
                ] as [QStatus, string][]).map(([s, label]) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className={`w-4 h-4 rounded-sm flex items-center justify-center ${STATUS_STYLE[s]}`} />
                    <span className="text-gray-500">{label}</span>
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q2, i) => {
                  const st = getQStatus(q2.question_id);
                  return (
                    <button
                      key={q2.question_id}
                      onClick={() => goTo(i)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition border-2 ${STATUS_STYLE[st]} ${
                        i === currentIdx ? "ring-2 ring-offset-1 ring-emerald-500 scale-110" : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition"
              >
                <Send size={14} /> Submit Exam
              </button>
            </div>
          </div>
        )}

        {!showPalette && (
          <button
            onClick={() => setShowPalette(true)}
            className="fixed bottom-6 right-6 bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
          >
            <BookOpen size={20} />
          </button>
        )}
      </div>

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="text-amber-600" size={28} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Submit Exam?</h3>
              <p className="text-gray-500 text-sm mt-1">This action cannot be undone.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Questions</span>
                <span className="font-bold">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Answered</span>
                <span className="font-bold text-emerald-600">{answered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Not Answered</span>
                <span className="font-bold text-red-500">{questions.length - answered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time Remaining</span>
                <span className={`font-bold font-mono ${timerColor}`}>{fmt(timeRemaining)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 font-bold flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
