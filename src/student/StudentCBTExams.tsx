import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, Clock, CheckCircle, AlertCircle, Trophy, BookOpen, Calendar } from "lucide-react";
import { StudentAPI } from "@/services/studentApi";

interface Exam {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  total_marks: number;
  is_active: boolean;
  status: string;
  negative_marking: boolean;
  global_negative_value: number;
  max_warnings: number;
  auto_submit_on_warnings: boolean;
  question_count: number;
  section_count: number;
  attempt_id: number | null;
  attempt_status: string | null;
  current_section: number | null;
  is_published: boolean | null;
  final_marks: number | null;
  rank: number | null;
}

function formatDt(dt: string) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function useCountdown(targetDate: string | null) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Started"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setRemaining(`${d}d ${h}h`);
      else if (h > 0) setRemaining(`${h}h ${m}m`);
      else setRemaining(`${m}m ${s}s`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [targetDate]);
  return remaining;
}

function ExamCard({ exam, onStart, onViewResult, onReexam }: { exam: Exam; onStart: (e: Exam) => void; onViewResult: (e: Exam) => void; onReexam: (e: Exam) => void }) {
  const isUpcoming = exam.status === "upcoming";
  const isLive = exam.status === "running";
  const isCompleted = exam.status === "completed";
  const attempted = exam.attempt_status === "submitted" || exam.attempt_status === "timed_out";
  const inProgress = exam.attempt_status === "in_progress";
  const countdown = useCountdown(isUpcoming ? exam.start_time : null);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
      isLive && !attempted ? "border-blue-300 shadow-blue-100" : "border-gray-200"
    }`}>
      {/* Status bar */}
      <div className={`h-1.5 ${
        isLive && !attempted ? "bg-blue-500" :
        attempted ? "bg-green-500" :
        isUpcoming ? "bg-amber-400" :
        "bg-gray-200"
      }`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isLive && !attempted && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white animate-pulse">LIVE</span>
              )}
              {isUpcoming && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">UPCOMING</span>
              )}
              {attempted && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">SUBMITTED</span>
              )}
              {inProgress && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">IN PROGRESS</span>
              )}
              {isCompleted && !attempted && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">ENDED</span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">{exam.title}</h3>
          </div>
          <Monitor size={22} className={`shrink-0 mt-1 ${isLive && !attempted ? "text-blue-500" : "text-gray-300"}`} />
        </div>

        {exam.description && (
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{exam.description}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Questions</p>
            <p className="text-base font-bold text-gray-900">{exam.question_count}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Sections</p>
            <p className="text-base font-bold text-gray-900">{exam.section_count}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Duration</p>
            <p className="text-base font-bold text-gray-900">{exam.section_count * 42}m</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Marks</p>
            <p className="text-base font-bold text-gray-900">{exam.total_marks}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Calendar size={12} /> Start: {formatDt(exam.start_time)}</span>
          {exam.end_time && <span className="flex items-center gap-1"><Clock size={12} /> End: {formatDt(exam.end_time)}</span>}
          {exam.negative_marking && <span className="text-red-500">Negative: -{exam.global_negative_value}</span>}
        </div>

        {isUpcoming && countdown && (
          <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
            <Clock size={14} />
            <span className="text-sm font-semibold">Starts in {countdown}</span>
          </div>
        )}

        {attempted && exam.is_published && exam.final_marks != null && (
          <div className="mt-3 flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3">
            <Trophy size={18} className="text-green-600" />
            <div>
              <p className="text-sm font-bold text-green-700">Score: {exam.final_marks} / {exam.total_marks}</p>
              {exam.rank && <p className="text-xs text-green-600">Rank #{exam.rank}</p>}
            </div>
          </div>
        )}

        {attempted && !exam.is_published && (
          <div className="mt-3 flex items-center gap-2 text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
            <AlertCircle size={14} />
            <span className="text-sm">Result will be published by admin</span>
          </div>
        )}

        {attempted && !exam.is_published && (
          <button onClick={() => onReexam(exam)}
            className="mt-2 w-full py-2 border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-bold transition">
            Reexam
          </button>
        )}

        <div className="mt-4 flex gap-2">
          {(isLive || inProgress) && !attempted && (
            <button onClick={() => onStart(exam)}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-blue-200">
              {inProgress ? "Resume Exam" : "Start Exam"}
            </button>
          )}
          {attempted && exam.is_published && (
            <button onClick={() => onViewResult(exam)}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition">
              View Result
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentCBTExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<number | null>(null);
  const [reexamExam, setReexamExam] = useState<Exam | null>(null);
  const [reexamPassword, setReexamPassword] = useState("");
  const [reexamError, setReexamError] = useState("");
  const [reexamSubmitting, setReexamSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const r = await StudentAPI.cbt.getExams();
      if (r.status) setExams(r.exams);
      setLoading(false);
    };
    load();
  }, []);

  const handleStart = async (exam: Exam) => {
    setStarting(exam.id);
    const r = await StudentAPI.cbt.startExam(exam.id);
    setStarting(null);
    if (!r.status) { alert(r.message || "Could not start exam"); return; }
    navigate(`/student/cbt-exam/${exam.id}/${r.attempt.id}`);
  };

  const handleViewResult = (exam: Exam) => {
    navigate(`/student/cbt-result/${exam.id}`);
  };

  const openReexam = (exam: Exam) => {
    setReexamExam(exam);
    setReexamPassword("");
    setReexamError("");
  };

  const submitReexam = async () => {
    if (!reexamExam) return;
    setReexamSubmitting(true);
    setReexamError("");
    const r = await StudentAPI.cbt.startExam(reexamExam.id, reexamPassword);
    setReexamSubmitting(false);
    if (!r.status) { setReexamError(r.message || "Could not start re-exam"); return; }
    const examId = reexamExam.id;
    setReexamExam(null);
    navigate(`/student/cbt-exam/${examId}/${r.attempt.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Monitor size={24} className="text-blue-500" /> CBT Exams
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Section-based computer-based tests · 5 sections · 42 min per section</p>
      </div>

      {/* Rules banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <p className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><AlertCircle size={16} /> Exam Rules</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Do NOT switch tabs, windows, or applications during the exam</li>
          <li>Right-click and copy/paste are disabled</li>
          <li>Each section has a 42-minute timer — auto-submits when time is up</li>
          <li>You cannot go back to a previous section once submitted</li>
          <li>Results will be published by the admin after the exam</li>
        </ul>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Monitor size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No CBT exams available</p>
          <p className="text-sm mt-1">Exams will appear here when activated by admin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {exams.map(exam => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onStart={starting === exam.id ? () => {} : handleStart}
              onViewResult={handleViewResult}
              onReexam={openReexam}
            />
          ))}
        </div>
      )}

      {reexamExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reexam: {reexamExam.title}</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your previous attempt and score will be cleared and you'll start fresh. Enter the reexam password to continue.
            </p>
            <input
              type="password"
              autoFocus
              value={reexamPassword}
              onChange={e => setReexamPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitReexam()}
              placeholder="Reexam password"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
            {reexamError && <p className="text-xs text-red-500 mt-2">{reexamError}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setReexamExam(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={submitReexam} disabled={reexamSubmitting || !reexamPassword}
                className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 disabled:opacity-50 transition">
                {reexamSubmitting ? "Starting..." : "Start Reexam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
