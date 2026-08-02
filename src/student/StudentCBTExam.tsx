import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, ChevronLeft, ChevronRight, BookmarkPlus, BookmarkCheck, Send, Lock, SkipForward } from "lucide-react";
import { StudentAPI } from "@/services/studentApi";

const SECTION_DURATION = 42 * 60; // 2520 seconds

interface Question {
  id: number;
  question_text: string;
  options: Record<string, string> | string[];
  marks: number;
  negative_marks: number;
  subject: string;
  image_url?: string;
  explanation?: string;
  saved: {
    selected_answer: string | null;
    is_marked_review: boolean;
    is_visited: boolean;
    time_spent_seconds: number;
  } | null;
}

interface SectionState {
  questions: Question[];
  answers: Record<number, string | null>;    // questionId → selected answer
  reviewed: Record<number, boolean>;          // questionId → marked for review
  visited: Record<number, boolean>;           // questionId → visited
  timeSpent: Record<number, number>;          // questionId → seconds
  savedToServer: Record<number, boolean>;     // questionId → has a persisted cbt_section_answers row
}

function getOption(opts: Record<string, string> | string[], key: string): string {
  if (!opts) return "";
  if (Array.isArray(opts)) {
    const idx = ["A","B","C","D"].indexOf(key);
    return opts[idx] || "";
  }
  return (opts as Record<string, string>)[key] || "";
}

function fmtTime(s: number) {
  const m = Math.floor(Math.abs(s) / 60);
  const sec = Math.abs(s) % 60;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

export default function StudentCBTExam() {
  const { examId, attemptId } = useParams<{ examId: string; attemptId: string }>();
  const navigate = useNavigate();

  const [section, setSection] = useState<SectionState | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionsSubmitted, setSectionsSubmitted] = useState<number[]>([]);
  const [totalSections, setTotalSections] = useState(1);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [sectionTimer, setSectionTimer] = useState(SECTION_DURATION);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examDone, setExamDone] = useState(false);
  const [warning, setWarning] = useState<{ count: number; max: number; autoSubmit: boolean } | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeOnCurrentQ = useRef(0);
  const lastQId = useRef<number | null>(null);
  const sectionStateRef = useRef<SectionState | null>(null);
  const currentSectionRef = useRef(0);
  const currentQIdxRef = useRef(0);
  const attemptIdNum = Number(attemptId);

  useEffect(() => { currentQIdxRef.current = currentQIdx; }, [currentQIdx]);

  // ── Anti-cheat ────────────────────────────────────────────────────────────

  const recordViolation = useCallback(async () => {
    if (examDone) return;
    const r = await StudentAPI.cbt.recordViolation(attemptIdNum);
    if (r.status) {
      if (r.action === "auto_submit") {
        alert("Exam auto-submitted due to repeated violations.");
        setExamDone(true);
        navigate(`/student/cbt-exams`);
      } else if (r.action === "warn") {
        setWarning({ count: r.violation_count, max: r.max_warnings, autoSubmit: true });
      }
    }
  }, [attemptIdNum, examDone, navigate]);

  useEffect(() => {
    // Tab/window switch detection (visibilitychange/blur → recordViolation) is
    // disabled for now so students can freely switch screens without the exam
    // flagging a violation or auto-submitting.
    const preventCtxMenu = (e: MouseEvent) => e.preventDefault();
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key)) || (e.ctrlKey && ["c","v","a","u"].includes(e.key))) {
        e.preventDefault();
      }
      if (e.key === "PrintScreen") { e.preventDefault(); recordViolation(); }
    };

    document.addEventListener("contextmenu", preventCtxMenu);
    document.addEventListener("copy", preventCopy);
    document.addEventListener("paste", preventCopy);
    document.addEventListener("keydown", preventKeys);
    return () => {
      document.removeEventListener("contextmenu", preventCtxMenu);
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("paste", preventCopy);
      document.removeEventListener("keydown", preventKeys);
    };
  }, [recordViolation, examDone]);

  // ── Load section questions ─────────────────────────────────────────────────

  const loadSection = useCallback(async (secIdx: number) => {
    setLoading(true);
    const r = await StudentAPI.cbt.getSectionQuestions(attemptIdNum, secIdx);
    if (!r.status) { setLoading(false); return; }

    const answers: Record<number, string | null> = {};
    const reviewed: Record<number, boolean> = {};
    const visited: Record<number, boolean> = {};
    const timeSpent: Record<number, number> = {};
    const savedToServer: Record<number, boolean> = {};

    r.questions.forEach((q: Question) => {
      answers[q.id] = q.saved?.selected_answer || null;
      reviewed[q.id] = q.saved?.is_marked_review || false;
      visited[q.id] = q.saved?.is_visited || false;
      timeSpent[q.id] = q.saved?.time_spent_seconds || 0;
      savedToServer[q.id] = q.saved !== null;
    });

    const state: SectionState = { questions: r.questions, answers, reviewed, visited, timeSpent, savedToServer };
    setSection(state);
    sectionStateRef.current = state;
    setCurrentSection(secIdx);
    currentSectionRef.current = secIdx;
    setSectionsSubmitted(r.sections_submitted || []);
    setTotalSections(r.total_sections || 1);
    setSectionTimer(r.time_remaining);
    // Resume at the furthest question already reached, not always Q1 — the
    // student can still freely go back from there, but shouldn't be forced
    // to re-click through everything they already passed.
    const lastSavedIdx = r.questions.reduce((max: number, qq: Question, i: number) => savedToServer[qq.id] ? i : max, -1);
    setCurrentQIdx(Math.max(0, Math.min(r.questions.length - 1, lastSavedIdx + 1)));
    setLoading(false);
  }, [attemptIdNum]);

  // Resolve which section the student is actually on (may not be 0, e.g. on
  // resume after a refresh) before loading questions, instead of assuming 0.
  useEffect(() => {
    (async () => {
      const r = await StudentAPI.cbt.startExam(Number(examId));
      if (!r.status || !r.attempt) {
        setLoading(false);
        alert(r.message || "Could not resume exam");
        navigate("/student/cbt-exams");
        return;
      }
      await loadSection(r.attempt.current_section || 0);
    })();
  }, [examId, loadSection, navigate]);

  // ── Section countdown timer ────────────────────────────────────────────────

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSectionTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSectionTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentSection]);

  // ── Per-question time tracking ─────────────────────────────────────────────

  useEffect(() => {
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    timeOnCurrentQ.current = 0;

    const q = section?.questions[currentQIdx];
    if (!q) return;
    lastQId.current = q.id;

    qTimerRef.current = setInterval(() => {
      timeOnCurrentQ.current += 1;
    }, 1000);

    return () => {
      if (qTimerRef.current) clearInterval(qTimerRef.current);
      // flush time spent for previous question
      if (lastQId.current && sectionStateRef.current) {
        const s = sectionStateRef.current;
        const updated = {
          ...s,
          timeSpent: { ...s.timeSpent, [lastQId.current]: (s.timeSpent[lastQId.current] || 0) + timeOnCurrentQ.current },
          visited: { ...s.visited, [lastQId.current]: true },
        };
        sectionStateRef.current = updated;
        setSection(updated);
      }
    };
  }, [currentQIdx, section?.questions]);

  // ── Save answer to backend (debounced fire-and-forget) ─────────────────────

  const saveAnswerToBackend = useCallback(async (questionId: number, selectedAnswer: string | null, isMarked: boolean, isRetry = false) => {
    const s = sectionStateRef.current;
    const timeSpent = (s?.timeSpent[questionId] || 0) + timeOnCurrentQ.current;
    const payload = {
      question_id: questionId,
      section_index: currentSectionRef.current,
      selected_answer: selectedAnswer,
      is_marked_review: isMarked,
      is_visited: true,
      time_spent_seconds: timeSpent,
    };
    try {
      const r = await StudentAPI.cbt.saveAnswer(attemptIdNum, payload);
      if (!r.status) throw new Error(r.message || "save failed");
      setSaveError(false);
    } catch {
      if (!isRetry) {
        setTimeout(() => saveAnswerToBackend(questionId, selectedAnswer, isMarked, true), 1500);
      } else {
        setSaveError(true);
      }
    }
  }, [attemptIdNum]);

  // ── Answer selection ──────────────────────────────────────────────────────

  const selectAnswer = (questionId: number, answer: string) => {
    const s = sectionStateRef.current;
    if (!s) return;
    const newAnswers = { ...s.answers, [questionId]: answer };
    const updated = { ...s, answers: newAnswers, visited: { ...s.visited, [questionId]: true }, savedToServer: { ...s.savedToServer, [questionId]: true } };
    sectionStateRef.current = updated;
    setSection(updated);
    saveAnswerToBackend(questionId, answer, s.reviewed[questionId] || false);
  };

  const clearAnswer = (questionId: number) => {
    const s = sectionStateRef.current;
    if (!s) return;
    const newAnswers = { ...s.answers, [questionId]: null };
    const updated = { ...s, answers: newAnswers, visited: { ...s.visited, [questionId]: true }, savedToServer: { ...s.savedToServer, [questionId]: true } };
    sectionStateRef.current = updated;
    setSection(updated);
    saveAnswerToBackend(questionId, null, s.reviewed[questionId] || false);
  };

  const toggleReview = (questionId: number) => {
    const s = sectionStateRef.current;
    if (!s) return;
    const isMarked = !s.reviewed[questionId];
    const updated = { ...s, reviewed: { ...s.reviewed, [questionId]: isMarked }, visited: { ...s.visited, [questionId]: true }, savedToServer: { ...s.savedToServer, [questionId]: true } };
    sectionStateRef.current = updated;
    setSection(updated);
    saveAnswerToBackend(questionId, s.answers[questionId] || null, isMarked);
  };

  // Persist the currently-open question if it hasn't been saved yet (i.e. the
  // student never selected/cleared/marked it) — guarantees every question the
  // student passes through ends up with a cbt_section_answers row, whether
  // answered or explicitly skipped, so the answer sheet always has all of them.
  const persistCurrentIfUnsaved = (qid: number | undefined) => {
    if (!qid) return;
    const s = sectionStateRef.current;
    if (!s || s.savedToServer[qid]) return;
    const updated = { ...s, visited: { ...s.visited, [qid]: true }, savedToServer: { ...s.savedToServer, [qid]: true } };
    sectionStateRef.current = updated;
    setSection(updated);
    saveAnswerToBackend(qid, s.answers[qid] ?? null, s.reviewed[qid] || false);
  };

  // ── Section submit ────────────────────────────────────────────────────────

  const handleSectionTimeout = useCallback(async () => {
    if (submitting || examDone) return;
    setSubmitting(true);
    const curQ = sectionStateRef.current?.questions[currentQIdxRef.current];
    if (curQ && !sectionStateRef.current!.savedToServer[curQ.id]) {
      await saveAnswerToBackend(curQ.id, sectionStateRef.current!.answers[curQ.id] ?? null, sectionStateRef.current!.reviewed[curQ.id] || false);
    }
    const r = await StudentAPI.cbt.submitSection(attemptIdNum, {
      section_index: currentSectionRef.current,
      reason: "timeout",
    });
    setSubmitting(false);
    if (r.exam_done) {
      setExamDone(true);
      setTimeout(() => navigate("/student/cbt-exams"), 3000);
    } else {
      await loadSection(r.next_section);
    }
  }, [attemptIdNum, loadSection, navigate, submitting, examDone, saveAnswerToBackend]);

  const handleSubmitSection = async (reason = "manual") => {
    if (submitting) return;
    setShowSubmitConfirm(false);
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    const curQ = sectionStateRef.current?.questions[currentQIdxRef.current];
    if (curQ && !sectionStateRef.current!.savedToServer[curQ.id]) {
      await saveAnswerToBackend(curQ.id, sectionStateRef.current!.answers[curQ.id] ?? null, sectionStateRef.current!.reviewed[curQ.id] || false);
    }
    const r = await StudentAPI.cbt.submitSection(attemptIdNum, {
      section_index: currentSection,
      reason,
    });
    setSubmitting(false);
    if (!r.status && !r.exam_done) { alert(r.message || "Error submitting section"); return; }
    if (r.exam_done) {
      setExamDone(true);
      setTimeout(() => navigate("/student/cbt-exams"), 3000);
    } else {
      await loadSection(r.next_section);
    }
  };

  if (examDone) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Send size={36} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted!</h2>
        <p className="text-gray-500">Your responses have been recorded. Results will be published by admin.</p>
        <p className="text-sm text-gray-400 mt-4">Redirecting...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading section...</p>
        </div>
      </div>
    );
  }

  if (!section) return null;

  const q = section.questions[currentQIdx];
  const qId = q?.id;
  const selectedAnswer = qId ? section.answers[qId] : null;
  const isMarked = qId ? section.reviewed[qId] : false;
  const isLastSection = currentSection === totalSections - 1;
  const timerWarning = sectionTimer < 120;

  const answered = Object.values(section.answers).filter(a => a !== null).length;
  const markedForReview = Object.values(section.reviewed).filter(Boolean).length;
  const notVisited = section.questions.filter(q => !section.visited[q.id]).length;

  // A student can freely revisit/edit any already-saved question, but can only
  // move one step past the furthest one reached so far — no jumping ahead to
  // questions never viewed.
  const lastSavedIdx = section.questions.reduce((max, qq, i) => section.savedToServer[qq.id] ? i : max, -1);
  const furthestAllowed = Math.min(section.questions.length - 1, lastSavedIdx + 1);

  const goTo = (idx: number) => {
    if (idx > furthestAllowed) return;
    persistCurrentIfUnsaved(qId);
    setCurrentQIdx(idx);
  };
  const goNext = () => {
    persistCurrentIfUnsaved(qId);
    setCurrentQIdx(i => Math.min(section.questions.length - 1, i + 1));
  };
  // Explicit skip: clears any selected answer and advances, regardless of
  // whether an option is currently selected — no need to deselect first.
  const handleSkip = () => {
    if (!qId) return;
    const s = sectionStateRef.current;
    if (!s) return;
    const updated = {
      ...s,
      answers: { ...s.answers, [qId]: null },
      visited: { ...s.visited, [qId]: true },
      savedToServer: { ...s.savedToServer, [qId]: true },
    };
    sectionStateRef.current = updated;
    setSection(updated);
    saveAnswerToBackend(qId, null, s.reviewed[qId] || false);
    setCurrentQIdx(i => Math.min(section.questions.length - 1, i + 1));
  };
  const goPrev = () => {
    persistCurrentIfUnsaved(qId);
    setCurrentQIdx(i => Math.max(0, i - 1));
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col overflow-hidden select-none">
      {saveError && (
        <div className="bg-red-600 text-white text-xs font-semibold text-center py-1.5 shrink-0">
          Connection issue — your last answer may not have saved. Please check your internet connection.
        </div>
      )}
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">{currentSection + 1}/{totalSections}</span>
          </div>
          <div>
            <p className="text-xs text-gray-400">Section {currentSection + 1}</p>
            <p className="text-sm font-bold text-gray-800">Q {currentQIdx + 1} / {section.questions.length}</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${
          timerWarning ? "bg-red-50 text-red-600 animate-pulse" : "bg-blue-50 text-blue-700"
        }`}>
          <Clock size={18} />
          <span>{fmtTime(sectionTimer)}</span>
        </div>

        <div className="text-right text-xs text-gray-500">
          <p>Answered: <strong className="text-green-600">{answered}</strong></p>
          <p>Marked: <strong className="text-purple-600">{markedForReview}</strong></p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Question area ────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {q ? (
            <div className="max-w-3xl mx-auto">
              {/* Question header */}
              <div className="flex items-start gap-3 mb-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mt-0.5">
                  {currentQIdx + 1}
                </span>
                <div className="flex-1">
                  {q.subject && <p className="text-xs text-blue-500 font-semibold mb-1">{q.subject}</p>}
                  <p className="text-base text-gray-900 leading-relaxed font-medium">{q.question_text}</p>
                  {q.image_url && (
                    <img src={q.image_url} alt="question" className="mt-3 max-h-48 rounded-xl object-contain border border-gray-200" />
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mt-4">
                {["A","B","C","D"].map(key => {
                  const text = getOption(q.options, key);
                  if (!text) return null;
                  const isSelected = selectedAnswer === key;
                  return (
                    <button
                      key={key}
                      onClick={() => isSelected ? clearAnswer(qId) : selectAnswer(qId, key)}
                      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                      }`}
                    >
                      <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}>{key}</span>
                      <span className={`text-sm leading-snug pt-0.5 ${isSelected ? "text-blue-900 font-medium" : "text-gray-700"}`}>{text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => toggleReview(qId)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                    isMarked
                      ? "bg-purple-100 border-purple-300 text-purple-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-200"
                  }`}
                >
                  {isMarked ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
                  {isMarked ? "Marked" : "Mark for Review"}
                </button>

                <button
                  onClick={() => clearAnswer(qId)}
                  disabled={!selectedAnswer}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : null}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 max-w-3xl mx-auto">
            <button
              onClick={goPrev}
              disabled={currentQIdx === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {currentQIdx < section.questions.length - 1 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Skip <SkipForward size={16} />
                </button>
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition shadow-sm shadow-green-200"
              >
                <Send size={16} />
                {isLastSection ? "Submit Exam" : "Submit Section"}
              </button>
            )}
          </div>
        </main>

        {/* ── Question palette (sidebar) ────────────────────────────────── */}
        <aside className="w-56 bg-white border-l border-gray-200 p-3 overflow-y-auto hidden md:block shrink-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Question Palette</p>

          {/* Legend */}
          <div className="space-y-1 mb-3 text-[11px]">
            {[
              { cls: "bg-green-500", label: "Answered" },
              { cls: "bg-purple-500", label: "Marked for Review" },
              { cls: "bg-gray-300", label: "Not Visited" },
              { cls: "bg-white border border-gray-300", label: "Visited, Not Answered" },
              { cls: "bg-gray-100 border border-gray-200", label: "Locked (view in order)" },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${cls}`} />
                <span className="text-gray-500">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {section.questions.map((pq, idx) => {
              const locked = idx > furthestAllowed;
              const ans = section.answers[pq.id];
              const mrk = section.reviewed[pq.id];
              const vis = section.visited[pq.id];
              let cls = "bg-white border border-gray-300 text-gray-600";
              if (locked) cls = "bg-gray-100 border border-gray-200 text-gray-300 cursor-not-allowed";
              else if (ans && mrk) cls = "bg-purple-500 text-white";
              else if (ans) cls = "bg-green-500 text-white";
              else if (mrk) cls = "bg-purple-200 text-purple-800";
              else if (vis) cls = "bg-orange-100 text-orange-700 border border-orange-200";
              return (
                <button
                  key={pq.id}
                  onClick={() => goTo(idx)}
                  disabled={locked}
                  title={locked ? "View the questions before this one first" : undefined}
                  className={`w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition hover:scale-110 disabled:hover:scale-100 ${cls} ${currentQIdx === idx ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                >
                  {locked ? <Lock size={12} /> : idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={submitting}
              className="w-full py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
            >
              <Send size={13} />
              {isLastSection ? "Submit Exam" : "Submit Section"}
            </button>
          </div>
        </aside>
      </div>

      {/* ── Warning overlay ────────────────────────────────────────────── */}
      {warning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Violation Detected!</h3>
            <p className="text-sm text-gray-600 mb-1">
              You have switched tabs or windows. This is attempt <strong>{warning.count}</strong> of <strong>{warning.max}</strong>.
            </p>
            {warning.autoSubmit && (
              <p className="text-xs text-red-500 mt-1">
                Your exam will be <strong>auto-submitted</strong> after {warning.max} violations.
              </p>
            )}
            <button onClick={() => setWarning(null)}
              className="mt-5 w-full py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition">
              I Understand, Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Submit confirm modal ──────────────────────────────────────── */}
      {showSubmitConfirm && section && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {isLastSection ? "Submit Exam?" : "Submit Section?"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {isLastSection
                ? "This will end your exam. You cannot make any changes after submission."
                : "Once you submit this section, you cannot go back to it."}
            </p>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div><p className="text-green-600 font-bold text-lg">{answered}</p><p className="text-gray-400">Answered</p></div>
              <div><p className="text-purple-600 font-bold text-lg">{markedForReview}</p><p className="text-gray-400">Marked</p></div>
              <div><p className="text-gray-500 font-bold text-lg">{section.questions.length - answered}</p><p className="text-gray-400">Unanswered</p></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                Go Back
              </button>
              <button onClick={() => handleSubmitSection("manual")} disabled={submitting}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition">
                {submitting ? "Submitting..." : isLastSection ? "Submit Exam" : "Submit Section"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
