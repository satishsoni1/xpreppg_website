import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, ChevronLeft, ChevronRight, Clock, Flag, X, Send, Eye,
  CheckCircle, Loader2, RotateCcw, AlertTriangle, Settings2,
  BookOpen, BarChart3, Trophy, Lock, SkipForward,
} from "lucide-react";
import { SimulatorAPI } from "@/services/examApi";

// Question status types for palette
type QStatus = "not_visited" | "skipped" | "answered" | "marked" | "answered_marked";
const STATUS_STYLE: Record<QStatus, string> = {
  not_visited:     "bg-slate-200 text-slate-600",
  skipped:         "bg-red-100 text-red-600 border border-red-200",
  answered:        "bg-emerald-500 text-white",
  marked:          "bg-violet-500 text-white",
  answered_marked: "bg-amber-400 text-white",
};

interface SimAnswer { selected: string | null; is_marked: boolean; visited: boolean; time_spent: number; }

interface SimConfig {
  exam_id: number | null;
  shuffle_questions: boolean;
  show_explanations: boolean;
  enable_timer: boolean;
}

export default function AdminExamSimulator() {
  const [step, setStep] = useState<"setup"|"running"|"result">("setup");
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingExam, setLoadingExam] = useState(false);
  const [config, setConfig] = useState<SimConfig>({
    exam_id: null,
    shuffle_questions: false,
    show_explanations: true,
    enable_timer: true,
  });

  // Running state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, SimAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showPalette, setShowPalette] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [startTs] = useState<Record<number, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const qStartRef = useRef(Date.now());

  // Result state
  const [result, setResult] = useState<any>(null);
  const [activeResultTab, setActiveResultTab] = useState<"overview"|"questions">("overview");

  useEffect(() => {
    SimulatorAPI.getAllExams().then(r => { if (r.status) setExams(r.exams || []); });
  }, []);

  const loadExamQuestions = async (examId: number, source: string) => {
    setLoadingExam(true);
    const r = await SimulatorAPI.getExam(examId, source);
    setLoadingExam(false);
    if (!r.status) { alert("Could not load exam"); return; }
    setSelectedExam(r.exam);
    let qs = r.questions || [];
    if (config.shuffle_questions) {
      qs = [...qs].sort(() => Math.random() - 0.5);
    }
    setQuestions(qs);
    const initAnswers: Record<number, SimAnswer> = {};
    for (const q of qs) initAnswers[q.question_id] = { selected: null, is_marked: false, visited: false, time_spent: 0 };
    setAnswers(initAnswers);
  };

  const startSim = () => {
    if (!selectedExam) return;
    setCurrentIdx(0);
    setTimeRemaining(selectedExam.duration_minutes * 60);
    qStartRef.current = Date.now();
    setStep("running");
  };

  // Countdown
  useEffect(() => {
    if (step !== "running" || !config.enable_timer) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) { clearInterval(timerRef.current); submitSim(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const getTimeSpent = () => Math.floor((Date.now() - qStartRef.current) / 1000);

  const commitCurrent = (nextIdx: number) => {
    const q = questions[currentIdx];
    if (!q) return;
    const spent = getTimeSpent();
    setAnswers(a => ({
      ...a,
      [q.question_id]: { ...a[q.question_id], visited: true, time_spent: (a[q.question_id]?.time_spent || 0) + spent },
    }));
    qStartRef.current = Date.now();
    setCurrentIdx(nextIdx);
  };

  const selectOption = (opt: string) => {
    const q = questions[currentIdx];
    if (!q) return;
    setAnswers(a => ({
      ...a,
      [q.question_id]: {
        ...a[q.question_id],
        selected: a[q.question_id]?.selected === opt ? null : opt,
        visited: true,
      },
    }));
  };

  const clearResponse = () => {
    const q = questions[currentIdx];
    if (!q) return;
    setAnswers(a => ({ ...a, [q.question_id]: { ...a[q.question_id], selected: null } }));
  };

  const toggleMark = () => {
    const q = questions[currentIdx];
    if (!q) return;
    setAnswers(a => ({ ...a, [q.question_id]: { ...a[q.question_id], is_marked: !a[q.question_id]?.is_marked, visited: true } }));
  };

  // Mirrors the student exam's lock: freely revisit any already-visited question,
  // but can't jump ahead past the one right after the furthest one reached.
  const lastVisitedIdx = questions.reduce((max, q, i) => answers[q.question_id]?.visited ? i : max, -1);
  const furthestAllowed = Math.max(currentIdx, Math.min(questions.length - 1, lastVisitedIdx + 1));

  const navigateQ = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    if (idx > furthestAllowed) return;
    commitCurrent(idx);
  };

  const getQStatus = (idx: number): QStatus => {
    const q = questions[idx];
    if (!q) return "not_visited";
    const a = answers[q.question_id];
    if (!a || !a.visited) return "not_visited";
    if (a.selected && a.is_marked) return "answered_marked";
    if (a.is_marked) return "marked";
    if (a.selected) return "answered";
    return "skipped";
  };

  const submitSim = () => {
    clearInterval(timerRef.current);
    setShowSubmit(false);

    // Commit current
    const q = questions[currentIdx];
    if (q) {
      const spent = getTimeSpent();
      setAnswers(prev => {
        const finalAnswers = {
          ...prev,
          [q.question_id]: { ...prev[q.question_id], visited: true, time_spent: (prev[q.question_id]?.time_spent || 0) + spent },
        };
        computeResult(finalAnswers);
        return finalAnswers;
      });
    } else {
      computeResult(answers);
    }
  };

  const computeResult = (finalAnswers: Record<number, SimAnswer>) => {
    let correct = 0, incorrect = 0, skipped = 0;
    let totalMarks = 0, positiveMarks = 0, negativeMarks = 0;
    const subjectMap: Record<string, { correct: number; total: number }> = {};
    const diffMap: Record<string, { correct: number; total: number }> = {};

    const qResults = questions.map(q => {
      const ans = finalAnswers[q.question_id];
      const isCorrect = ans?.selected === q.correct_answer;
      const isSkipped = !ans?.selected;
      totalMarks += q.marks || 1;

      const sub = q.subject || "General";
      const diff = q.difficulty || "Medium";
      if (!subjectMap[sub]) subjectMap[sub] = { correct: 0, total: 0 };
      if (!diffMap[diff]) diffMap[diff] = { correct: 0, total: 0 };
      subjectMap[sub].total++;
      diffMap[diff].total++;

      if (isSkipped) {
        skipped++;
      } else if (isCorrect) {
        correct++;
        positiveMarks += (q.marks || 1);
        subjectMap[sub].correct++;
        diffMap[diff].correct++;
      } else {
        incorrect++;
        negativeMarks += (q.negative_marks || 0);
      }

      return { ...q, selected_answer: ans?.selected || null, is_correct: isCorrect, is_skipped: isSkipped, time_spent_seconds: ans?.time_spent || 0 };
    });

    const finalScore = positiveMarks - negativeMarks;
    const pct = totalMarks > 0 ? Math.round((finalScore / totalMarks) * 100) : 0;

    setResult({
      correct, incorrect, skipped,
      total: questions.length,
      totalMarks,
      finalScore: Math.max(0, finalScore),
      positiveMarks,
      negativeMarksDed: negativeMarks,
      percentage: pct,
      passed: selectedExam?.passing_marks != null ? finalScore >= selectedExam.passing_marks : pct >= 50,
      questions: qResults,
      subjectMap,
      diffMap,
      timeTaken: config.enable_timer ? (selectedExam?.duration_minutes * 60 - timeRemaining) : 0,
    });
    setStep("result");
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
      : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const reset = () => {
    setStep("setup");
    setResult(null);
    setCurrentIdx(0);
    setAnswers({});
    setTimeRemaining(0);
    setSelectedExam(null);
    setQuestions([]);
    setConfig(c => ({ ...c, exam_id: null }));
  };

  const isLowTime = timeRemaining < 300 && config.enable_timer;
  const currentQ = questions[currentIdx];
  const currentAns = currentQ ? (answers[currentQ.question_id] || { selected: null, is_marked: false, visited: false, time_spent: 0 }) : null;

  const stats = {
    answered:    questions.filter((_,i) => getQStatus(i) === "answered").length,
    marked:      questions.filter((_,i) => ["marked","answered_marked"].includes(getQStatus(i))).length,
    skipped:     questions.filter((_,i) => getQStatus(i) === "skipped").length,
    not_visited: questions.filter((_,i) => getQStatus(i) === "not_visited").length,
  };

  // ─── SETUP SCREEN ───────────────────────────────────────────────────────────
  if (step === "setup") return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Play size={22} className="text-violet-600"/>Exam Simulator</h1>
        <p className="text-slate-500 text-sm mt-0.5">Preview and test any exam exactly as a student would experience it</p>
      </div>

      {/* Exam picker */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-slate-700 flex items-center gap-2"><BookOpen size={16}/>Select Exam</h2>
        <select
          value={config.exam_id || ""}
          onChange={async e => {
            const simId = e.target.value;
            if (!simId) return;
            const [source, rawId] = simId.split("-");
            const id = parseInt(rawId, 10);
            setConfig(c => ({ ...c, exam_id: simId as any }));
            await loadExamQuestions(id, source);
          }}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
        >
          <option value="">— choose an exam —</option>
          {exams.map(e => (
            <option key={e.sim_id} value={e.sim_id}>[{e.platform}] {e.title} ({e.question_count || 0}Q)</option>
          ))}
        </select>

        {loadingExam && (
          <div className="flex items-center gap-2 text-violet-600 text-sm">
            <Loader2 size={16} className="animate-spin"/> Loading exam questions…
          </div>
        )}

        {selectedExam && !loadingExam && (
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 grid grid-cols-3 gap-3 text-sm">
            {[
              { label:"Questions", value: questions.length },
              { label:"Duration", value:`${selectedExam.duration_minutes} min` },
              { label:"Total Marks", value: selectedExam.total_marks || questions.reduce((s:number,q:any)=>s+(q.marks||1),0) },
              { label:"Platform", value: selectedExam.platform?.toUpperCase() || "—" },
              { label:"Passing", value: selectedExam.passing_marks != null ? selectedExam.passing_marks : "—" },
              { label:"Negative", value: selectedExam.enable_negative_marking ? "Yes" : "No" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-bold text-violet-700 text-lg">{s.value}</p>
                <p className="text-xs text-violet-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Config */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-slate-700 flex items-center gap-2"><Settings2 size={16}/>Simulation Settings</h2>
        {[
          { key:"shuffle_questions" as const, label:"Shuffle Questions", desc:"Randomize question order (simulates exam randomness)" },
          { key:"show_explanations" as const, label:"Show Explanations in Results", desc:"Display explanations for each question after submission" },
          { key:"enable_timer" as const, label:"Enable Countdown Timer", desc:"Run the timer using exam's duration setting" },
        ].map(s => (
          <div key={s.key} className="flex items-start justify-between gap-4 py-2">
            <div className="flex-1">
              <p className="font-semibold text-slate-700 text-sm">{s.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
            </div>
            <button
              onClick={() => setConfig(c => ({ ...c, [s.key]: !c[s.key] }))}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${config[s.key] ? "bg-violet-600" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config[s.key] ? "translate-x-5" : ""}`}/>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={startSim}
        disabled={!selectedExam || loadingExam || questions.length === 0}
        className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl text-lg shadow-lg shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition"
      >
        <Play size={20}/> Launch Simulator
      </button>
    </div>
  );

  // ─── RUNNING SCREEN ──────────────────────────────────────────────────────────
  if (step === "running") return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col overflow-hidden select-none z-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm px-4 h-14 flex items-center gap-4 shrink-0">
        <span className="text-[11px] font-bold bg-violet-100 text-violet-700 px-2 py-1 rounded-lg uppercase tracking-wide">SIMULATOR</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{selectedExam?.title}</p>
          <p className="text-xs text-slate-400">{currentIdx + 1} / {questions.length}</p>
        </div>
        {config.enable_timer && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${isLowTime ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-100 text-slate-700"}`}>
            <Clock size={15}/> {formatTime(timeRemaining)}
          </div>
        )}
        <button onClick={() => setShowSubmit(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm">
          <Send size={15}/> Submit
        </button>
        <button onClick={reset} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition" title="Exit">
          <X size={16}/>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Question area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {currentQ && (
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-lg text-sm">Q {currentIdx + 1}</span>
                  {currentQ.subject && <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full font-medium">{currentQ.subject}</span>}
                  {currentQ.difficulty && <span className="text-xs text-slate-400">{currentQ.difficulty}</span>}
                  <span className="ml-auto text-xs text-slate-400">{currentQ.marks}M / -{currentQ.negative_marks}M</span>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  {currentQ.image_url && <img src={currentQ.image_url} alt="" className="w-full max-h-56 object-contain rounded-xl mb-4 border border-slate-100"/>}
                  <p className="text-slate-800 font-medium leading-relaxed">{currentQ.question_text}</p>
                </div>

                <div className="space-y-3">
                  {(["A","B","C","D"] as const).map(opt => {
                    const val = (currentQ as any)[`option_${opt.toLowerCase()}`];
                    const isSel = currentAns?.selected === opt;
                    return (
                      <button key={opt} onClick={() => selectOption(opt)}
                        className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                          isSel ? "border-violet-500 bg-violet-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}>
                        <span className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 ${isSel ? "bg-violet-500 text-white" : "bg-slate-100 text-slate-600"}`}>{opt}</span>
                        <span className={`text-sm leading-relaxed mt-0.5 ${isSel ? "text-violet-800 font-medium" : "text-slate-700"}`}>{val}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-2 shrink-0">
            <button onClick={() => navigateQ(currentIdx - 1)} disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm disabled:opacity-40">
              <ChevronLeft size={16}/> Prev
            </button>
            <button onClick={clearResponse}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium">
              <X size={14}/> Clear
            </button>
            <button onClick={toggleMark}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ${currentAns?.is_marked ? "bg-violet-100 text-violet-700" : "text-slate-500 hover:bg-slate-100"}`}>
              <Flag size={14}/> {currentAns?.is_marked ? "Unmark" : "Mark"}
            </button>
            <button onClick={() => navigateQ(currentIdx + 1)} disabled={currentIdx === questions.length - 1}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm disabled:opacity-40">
              {currentAns?.selected ? <>Save & Next <ChevronRight size={16}/></> : <>Skip <SkipForward size={16}/></>}
            </button>
          </div>
        </div>

        {/* Palette */}
        <div className={`bg-white border-l border-slate-200 flex flex-col shrink-0 ${showPalette ? "w-64" : "w-0 overflow-hidden"} transition-all`}>
          <div className="p-4 border-b border-slate-100">
            <p className="font-bold text-slate-700 text-sm mb-3">Question Palette</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {(["not_visited","answered","skipped","marked","answered_marked"] as const).map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-bold ${STATUS_STYLE[s]}`}>Q</span>
                  <span className="text-slate-400 capitalize">{s.replace("_"," ")}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 p-4 border-b border-slate-100 text-xs text-center">
            <div><p className="font-bold text-emerald-600">{stats.answered}</p><p className="text-slate-400">Ans</p></div>
            <div><p className="font-bold text-violet-600">{stats.marked}</p><p className="text-slate-400">Marked</p></div>
            <div><p className="font-bold text-red-500">{stats.skipped}</p><p className="text-slate-400">Skip</p></div>
            <div><p className="font-bold text-slate-400">{stats.not_visited}</p><p className="text-slate-400">New</p></div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-4 gap-1.5">
              {questions.map((q,idx) => {
                const locked = idx > furthestAllowed;
                return (
                  <button key={q.question_id} onClick={() => navigateQ(idx)} disabled={locked}
                    title={locked ? "View the questions before this one first" : undefined}
                    className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${locked ? "bg-slate-100 text-slate-300 cursor-not-allowed" : STATUS_STYLE[getQStatus(idx)]} ${currentIdx===idx?"ring-2 ring-offset-1 ring-slate-500":""}`}>
                    {locked ? <Lock size={12} className="mx-auto"/> : idx+1}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-3 border-t">
            <button onClick={() => setShowSubmit(true)}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
              <Send size={15}/> Submit
            </button>
          </div>
        </div>
        <button onClick={() => setShowPalette(p=>!p)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-700 text-white p-1.5 rounded-l-lg z-10">
          {showPalette ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>

      {/* Submit modal */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-bold text-slate-800 text-lg mb-4">Submit Simulation?</h2>
            <div className="space-y-2 mb-5 text-sm">
              {[
                { label:"Answered", value:stats.answered, c:"text-emerald-600" },
                { label:"Unanswered", value:stats.skipped+stats.not_visited, c:"text-red-500" },
                { label:"Marked", value:stats.marked, c:"text-violet-600" },
              ].map(s=>(
                <div key={s.label} className="flex justify-between">
                  <span className="text-slate-500">{s.label}</span>
                  <span className={`font-bold ${s.c}`}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setShowSubmit(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold">Cancel</button>
              <button onClick={submitSim} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── RESULT SCREEN ───────────────────────────────────────────────────────────
  if (step === "result" && result) return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Result header */}
      <div className={`rounded-2xl p-6 text-white ${result.passed ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-red-600 to-orange-600"}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-bold bg-white/20 text-white px-2 py-1 rounded-lg uppercase tracking-wide">SIMULATOR RESULT</span>
          <span className={`font-bold px-3 py-1 rounded-full text-sm ${result.passed?"bg-white/20 text-white":"bg-white/20 text-white"}`}>
            {result.passed ? "✅ PASSED" : "❌ FAILED"}
          </span>
        </div>
        <h2 className="text-2xl font-bold">{selectedExam?.title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label:"Score", value:`${result.finalScore}/${result.totalMarks}` },
            { label:"Percentage", value:`${result.percentage}%` },
            { label:"Correct", value:`${result.correct}/${result.total}` },
            { label:"Time Taken", value:config.enable_timer ? formatTime(result.timeTaken) : "—" },
          ].map(s=>(
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="font-bold text-xl">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          {l:"Correct",v:result.correct,c:"text-emerald-600",bg:"bg-emerald-50 border-emerald-200"},
          {l:"Incorrect",v:result.incorrect,c:"text-red-500",bg:"bg-red-50 border-red-200"},
          {l:"Skipped",v:result.skipped,c:"text-slate-500",bg:"bg-slate-50 border-slate-200"},
          {l:"+Marks",v:`+${result.positiveMarks}`,c:"text-violet-600",bg:"bg-violet-50 border-violet-200"},
          {l:"-Marks",v:`-${result.negativeMarksDed}`,c:"text-orange-500",bg:"bg-orange-50 border-orange-200"},
          {l:"Final",v:result.finalScore,c:"text-blue-600",bg:"bg-blue-50 border-blue-200"},
        ].map(s=>(
          <div key={s.l} className={`rounded-xl border p-3 text-center ${s.bg}`}>
            <p className={`font-bold text-xl ${s.c}`}>{s.v}</p>
            <p className="text-xs text-slate-500">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl border border-slate-200 p-1 gap-1 shadow-sm">
        {([["overview","Overview"],["questions","Questions"]] as const).map(([t,label])=>(
          <button key={t} onClick={()=>setActiveResultTab(t)}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${activeResultTab===t?"bg-violet-600 text-white":"text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {activeResultTab === "overview" && (
        <div className="space-y-4">
          {/* Subject breakdown */}
          {Object.keys(result.subjectMap).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-700">Subject-wise Performance</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>{["Subject","Correct","Total","Accuracy"].map(h=><th key={h} className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(result.subjectMap).map(([sub, s]: any) => {
                    const acc = s.total > 0 ? Math.round((s.correct/s.total)*100) : 0;
                    return (
                      <tr key={sub}>
                        <td className="px-4 py-3 font-semibold text-slate-700">{sub}</td>
                        <td className="px-4 py-3 text-emerald-600 font-bold">{s.correct}</td>
                        <td className="px-4 py-3 text-slate-500">{s.total}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full">
                              <div className={`h-full rounded-full ${acc>=70?"bg-emerald-500":acc>=40?"bg-amber-500":"bg-red-500"}`} style={{width:`${acc}%`}}/>
                            </div>
                            <span className={`font-bold text-xs w-10 ${acc>=70?"text-emerald-600":acc>=40?"text-amber-600":"text-red-500"}`}>{acc}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Difficulty breakdown */}
          <div className="grid grid-cols-3 gap-4">
            {(["Easy","Medium","Hard"] as const).map(d => {
              const info = result.diffMap[d] || { correct:0, total:0 };
              const acc = info.total > 0 ? Math.round((info.correct/info.total)*100) : 0;
              return (
                <div key={d} className={`rounded-2xl p-4 text-center ${d==="Easy"?"bg-emerald-50 border border-emerald-100":d==="Medium"?"bg-amber-50 border border-amber-100":"bg-red-50 border border-red-100"}`}>
                  <p className={`font-bold text-sm ${d==="Easy"?"text-emerald-700":d==="Medium"?"text-amber-700":"text-red-700"}`}>{d}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{acc}%</p>
                  <p className="text-xs text-slate-500">{info.correct}/{info.total}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeResultTab === "questions" && (
        <div className="space-y-3">
          {result.questions.map((q: any, idx: number) => {
            const isCorrect = q.is_correct;
            const isSkipped = !q.selected_answer;
            return (
              <div key={q.question_id} className={`bg-white rounded-2xl border p-4 ${isCorrect?"border-emerald-200":isSkipped?"border-slate-200":"border-red-200"}`}>
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isCorrect?"bg-emerald-100 text-emerald-700":isSkipped?"bg-slate-100 text-slate-500":"bg-red-100 text-red-600"}`}>{idx+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium">{q.question_text}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(["A","B","C","D"] as const).map(opt => {
                        const val = (q as any)[`option_${opt.toLowerCase()}`];
                        const isC = q.correct_answer === opt;
                        const isS = q.selected_answer === opt;
                        return (
                          <span key={opt} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isC?"bg-emerald-100 text-emerald-700 ring-1 ring-emerald-400":isS&&!isC?"bg-red-100 text-red-600 ring-1 ring-red-300":"bg-slate-100 text-slate-500"}`}>
                            {opt}: {val}
                          </span>
                        );
                      })}
                    </div>
                    {config.show_explanations && q.explanation && (
                      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg mt-2 leading-relaxed">{q.explanation}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      {q.subject && <span>{q.subject}</span>}
                      {q.difficulty && <span>{q.difficulty}</span>}
                      <span className="flex items-center gap-0.5"><Clock size={10}/>{q.time_spent_seconds}s</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isCorrect ? <CheckCircle size={18} className="text-emerald-500"/>
                      : isSkipped ? <X size={18} className="text-slate-300"/>
                      : <X size={18} className="text-red-400"/>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <button onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm">
          <RotateCcw size={16}/> New Simulation
        </button>
        <button onClick={() => { setStep("setup"); setResult(null); }}
          className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200">
          <Settings2 size={16}/> Change Settings
        </button>
      </div>
    </div>
  );

  return null;
}
