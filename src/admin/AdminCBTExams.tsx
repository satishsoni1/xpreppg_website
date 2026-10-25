import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, FileQuestion, BarChart3, ChevronDown, ChevronUp, X } from "lucide-react";
import { CbtModuleAPI } from "@/services/adminApi";
import { CBT_STREAMS, CbtStream, cbtStream, isCbtStream } from "@/data/cbtStreams";

interface Exam {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  total_marks: number;
  negative_marking: boolean;
  global_negative_value: number;
  max_warnings: number;
  auto_submit_on_warnings: boolean;
  is_active: boolean;
  status: string;
  question_count: number;
  section_count: number;
  section_minutes: number;
  stream: CbtStream;
  created_at: string;
}

const EMPTY_FORM = {
  stream: "neet_pg" as CbtStream,
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  total_marks: "",
  negative_marking: false,
  global_negative_value: "0.25",
  max_warnings: "3",
  auto_submit_on_warnings: true,
};

function fmt(dt: string) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function toLocalInput(dt: string) {
  if (!dt) return "";
  const d = new Date(dt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminCBTExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // ?stream= comes from the sidebar's NEET PG / NEET UG / JEE CBT links
  const [params, setParams] = useSearchParams();
  const streamFilter = isCbtStream(params.get("stream")) ? params.get("stream") as CbtStream : "all";
  const visibleExams = streamFilter === "all" ? exams : exams.filter(e => (e.stream || "neet_pg") === streamFilter);
  const setStreamFilter = (v: CbtStream | "all") => setParams(v === "all" ? {} : { stream: v });

  const load = async () => {
    setLoading(true);
    const r = await CbtModuleAPI.getExams();
    if (r.status) setExams(r.exams);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditExam(null);
    setForm({ ...EMPTY_FORM, stream: streamFilter === "all" ? "neet_pg" : streamFilter });
    setErr("");
    setShowModal(true);
  };

  const openEdit = (exam: Exam) => {
    setEditExam(exam);
    setForm({
      stream: exam.stream || "neet_pg",
      title: exam.title,
      description: exam.description || "",
      start_time: toLocalInput(exam.start_time),
      end_time: toLocalInput(exam.end_time),
      total_marks: String(exam.total_marks || ""),
      negative_marking: exam.negative_marking,
      global_negative_value: String(exam.global_negative_value || "0.25"),
      max_warnings: String(exam.max_warnings || "3"),
      auto_submit_on_warnings: exam.auto_submit_on_warnings,
    });
    setErr("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setErr("Title is required"); return; }
    setSaving(true); setErr("");
    const payload = {
      stream: form.stream,
      title: form.title.trim(),
      description: form.description.trim() || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      total_marks: Number(form.total_marks) || 0,
      negative_marking: form.negative_marking,
      global_negative_value: Number(form.global_negative_value) || 0.25,
      max_warnings: Number(form.max_warnings) || 3,
      auto_submit_on_warnings: form.auto_submit_on_warnings,
    };
    const r = editExam
      ? await CbtModuleAPI.updateExam(editExam.id, payload)
      : await CbtModuleAPI.createExam(payload);
    setSaving(false);
    if (!r.status) { setErr(r.message || "Error"); return; }
    setShowModal(false);
    load();
  };

  const handleActivate = async (exam: Exam) => {
    const r = await CbtModuleAPI.activateExam(exam.id, !exam.is_active);
    if (r.status) load();
  };

  const handleDelete = async (exam: Exam) => {
    if (!confirm(`Delete "${exam.title}"?`)) return;
    const r = await CbtModuleAPI.deleteExam(exam.id);
    if (r.status) load();
  };

  const statusBadge = (s: string, isActive: boolean) => {
    if (!isActive) return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Inactive</span>;
    if (s === "running") return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-bold">LIVE</span>;
    if (s === "completed") return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">Completed</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">Upcoming</span>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{streamFilter === "all" ? "CBT Exams" : `${cbtStream(streamFilter).label} CBT`}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {streamFilter === "all" ? "Computer-based mock tests for NEET PG, NEET UG and JEE" : cbtStream(streamFilter).sectionRule}
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          <Plus size={16} /> New Exam
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {[{ value: "all" as const, label: "All" }, ...CBT_STREAMS].map(s => (
          <button
            key={s.value}
            onClick={() => setStreamFilter(s.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
              streamFilter === s.value ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:border-blue-600"
            }`}
          >
            {s.label}
            <span className="ml-1.5 opacity-70">{s.value === "all" ? exams.length : exams.filter(e => (e.stream || "neet_pg") === s.value).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">Loading...</div>
      ) : visibleExams.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileQuestion size={40} className="mx-auto mb-3 opacity-40" />
          <p>No {streamFilter === "all" ? "" : `${cbtStream(streamFilter).label} `}CBT exams created yet.</p>
          <button onClick={openCreate} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Create First Exam</button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleExams.map(exam => (
            <div key={exam.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-bold text-gray-900 truncate">{exam.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cbtStream(exam.stream).badgeClass}`}>{cbtStream(exam.stream).label}</span>
                    {statusBadge(exam.status, exam.is_active)}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    <span>Questions: <strong className="text-gray-700">{exam.question_count}</strong></span>
                    <span>Sections: <strong className="text-gray-700">{exam.section_count}</strong> × {exam.section_minutes} min</span>
                    <span>Marks: <strong className="text-gray-700">{exam.total_marks}</strong></span>
                    {exam.negative_marking && <span className="text-red-500">-{exam.global_negative_value} negative</span>}
                    <span>Start: <strong className="text-gray-700">{fmt(exam.start_time)}</strong></span>
                    <span>End: <strong className="text-gray-700">{fmt(exam.end_time)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleActivate(exam)}
                    title={exam.is_active ? "Deactivate" : "Activate"}
                    className={`p-2 rounded-xl transition ${exam.is_active ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                  >
                    {exam.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => navigate(`/admin/cbt/questions/${exam.id}`)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Manage Questions">
                    <FileQuestion size={18} />
                  </button>
                  <button onClick={() => navigate(`/admin/cbt/results/${exam.id}`)} className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition" title="Results">
                    <BarChart3 size={18} />
                  </button>
                  <button onClick={() => openEdit(exam)} className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(exam)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition" title="Delete">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => setExpandedId(expandedId === exam.id ? null : exam.id)} className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                    {expandedId === exam.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {expandedId === exam.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Total Marks</p>
                    <p className="font-semibold text-gray-800">{exam.total_marks || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Negative Marking</p>
                    <p className="font-semibold text-gray-800">{exam.negative_marking ? `-${exam.global_negative_value} per wrong` : "No"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Max Violations</p>
                    <p className="font-semibold text-gray-800">{exam.max_warnings} warnings</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Auto Submit on Warn</p>
                    <p className="font-semibold text-gray-800">{exam.auto_submit_on_warnings ? "Yes" : "No"}</p>
                  </div>
                  {exam.description && (
                    <div className="col-span-full">
                      <p className="text-xs text-gray-400 mb-0.5">Description</p>
                      <p className="text-gray-700">{exam.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editExam ? "Edit Exam" : "Create CBT Exam"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {err && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{err}</p>}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Exam Stream *</label>
                <div className="grid grid-cols-3 gap-2">
                  {CBT_STREAMS.map(s => (
                    <button
                      key={s.value} type="button"
                      onClick={() => setForm(f => ({ ...f, stream: s.value }))}
                      className={`py-2.5 rounded-xl border text-sm font-semibold transition ${
                        form.stream === s.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-blue-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{cbtStream(form.stream).sectionRule}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Exam Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g. ${cbtStream(form.stream).label} Mock Test 1`} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Optional exam instructions" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Start Time</label>
                  <input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({...f, start_time: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">End Time</label>
                  <input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({...f, end_time: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Total Marks</label>
                <input type="number" value={form.total_marks} onChange={e => setForm(f => ({...f, total_marks: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 200" min="0" />
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input type="checkbox" id="neg" checked={form.negative_marking}
                  onChange={e => setForm(f => ({...f, negative_marking: e.target.checked}))}
                  className="w-4 h-4 accent-blue-600" />
                <label htmlFor="neg" className="text-sm font-medium text-gray-700">Enable Negative Marking</label>
              </div>

              {form.negative_marking && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Marks Deducted per Wrong Answer</label>
                  <input type="number" step="0.25" value={form.global_negative_value}
                    onChange={e => setForm(f => ({...f, global_negative_value: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.25" min="0" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Max Violations</label>
                  <input type="number" value={form.max_warnings}
                    onChange={e => setForm(f => ({...f, max_warnings: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.auto_submit_on_warnings}
                      onChange={e => setForm(f => ({...f, auto_submit_on_warnings: e.target.checked}))}
                      className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Auto-submit on limit</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Saving..." : editExam ? "Update Exam" : "Create Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
