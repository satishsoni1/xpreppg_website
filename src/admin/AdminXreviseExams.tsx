import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, RotateCcw, Power, Clock, Calendar,
  FileQuestion, AlertTriangle, CheckCircle, Plus,
  Edit2, Trash2, X, Loader2,
} from "lucide-react";
import { XReviseAPI } from "@/services/adminApi";

const STATUS_STYLE: Record<string, string> = {
  upcoming:  "bg-blue-100 text-blue-700 border-blue-200",
  running:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  live:      "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  draft:     "bg-gray-100 text-gray-500 border-gray-200",
};

const EMPTY_FORM = {
  title: "", phase: 1, day_number: "" as string | number,
  subject: "", start_time: "", end_time: "",
  duration: 45, total_marks: 200, scheduled_date: "", description: "",
};

const IST_TIME_ZONE = "Asia/Kolkata";

const getZonedParts = (value: string, timeZone = IST_TIME_ZONE) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
  };
};

const toIstTimeInput = (value?: string | null) => {
  if (!value) return "";
  const plainTimeMatch = value.match(/^(\d{2}:\d{2})(:\d{2})?$/);
  if (plainTimeMatch) return plainTimeMatch[1];
  const parts = getZonedParts(value);
  if (!parts) return "";
  return `${parts.hour}:${parts.minute}`;
};

const toIstDateInput = (value?: string | null) => {
  if (!value) return "";
  const plainDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (plainDateMatch) return plainDateMatch[0];
  const parts = getZonedParts(value);
  if (!parts) return "";
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export default function AdminXreviseExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [activePhase, setActivePhase] = useState<number | "all">("all");

  const [modal, setModal] = useState<{ open: boolean; mode: "create" | "edit"; exam?: any }>({ open: false, mode: "create" });
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await XReviseAPI.getExams();
    if (r.status) setExams(r.exams || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleActivate = async (exam: any) => {
    setToggling(exam.id);
    const r = await XReviseAPI.activateExam(exam.id, !exam.is_active);
    if (r.status) {
      await load();
      showToast(r.message || (exam.is_active ? "Exam deactivated" : "Exam activated"), true);
    } else {
      showToast(r.message || "Failed to update", false);
    }
    setToggling(null);
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setModal({ open: true, mode: "create" });
  };

  const openEdit = (exam: any) => {
    setForm({
      title: exam.title || "",
      phase: exam.phase || 1,
      day_number: exam.day_number ?? "",
      subject: exam.subject || "",
      start_time: toIstTimeInput(exam.start_time),
      end_time: toIstTimeInput(exam.end_time),
      duration: exam.duration || 45,
      total_marks: exam.total_marks || 200,
      scheduled_date: toIstDateInput(exam.scheduled_date),
      description: exam.description || "",
    });
    setModal({ open: true, mode: "edit", exam });
  };

  const closeModal = () => setModal({ open: false, mode: "create" });

  const handleSave = async () => {
    if (!form.title.trim()) { showToast("Title is required", false); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        day_number: form.day_number !== "" ? Number(form.day_number) : null,
        phase: Number(form.phase),
        duration: Number(form.duration),
        total_marks: Number(form.total_marks),
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        scheduled_date: form.scheduled_date || null,
        schedule_date: form.scheduled_date || null,
      };
      console.log("Saving exam:", payload);
      const r = modal.mode === "create"
        ? await XReviseAPI.createExam(payload)
        : await XReviseAPI.updateExam(modal.exam.id, payload);
      if (r.status) {
        showToast(modal.mode === "create" ? "Exam created!" : "Exam updated!", true);
        closeModal();
       await load();
      } else {
        showToast(r.message || "Failed", false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exam: any) => {
    if (!confirm(`Delete "${exam.title}"? This cannot be undone.`)) return;
    setDeleting(exam.id);
    const r = await XReviseAPI.deleteExam(exam.id);
    if (r.status) {
      showToast("Exam deleted", true);
      setExams(prev => prev.filter(e => e.id !== exam.id));
    } else {
      showToast(r.message || "Failed to delete", false);
    }
    setDeleting(null);
  };

  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { timeZone: IST_TIME_ZONE, day: "numeric", month: "short", year: "numeric" }) : "—";
  const fmtTime = (d: string) => toIstTimeInput(d) || "—";

  const filtered = activePhase === "all" ? exams : exams.filter(e => e.phase === activePhase);
  const phaseCounts = [1, 2, 3, 4].map(p => ({ phase: p, count: exams.filter(e => e.phase === p).length }));

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase mb-1";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold transition-all ${toast.ok ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.ok ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-emerald-600" size={22} /> XRevise Exams
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filtered.filter(e => e.is_active).length} active · {filtered.filter(e => !e.is_active).length} inactive · {filtered.length} shown
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 text-sm font-semibold">
            <RotateCcw size={15} /> Refresh
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            <Plus size={16} /> Create Exam
          </button>
        </div>
      </div>

      {/* Phase filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActivePhase("all")}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition ${
            activePhase === "all" ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-500 hover:border-gray-400"
          }`}
        >
          All ({exams.length})
        </button>
        {phaseCounts.map(({ phase, count }) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition ${
              activePhase === phase ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 text-gray-500 hover:border-emerald-300"
            }`}
          >
            Phase {phase} ({count})
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-start gap-2">
        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
        <span>New exams are <strong>hidden</strong> from students by default. Use the <strong>Activate</strong> toggle to make them visible.</span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <RotateCcw className="animate-spin mx-auto mb-3" size={28} />
          <p>Loading exams…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold">No exams yet</p>
          <button onClick={openCreate} className="mt-4 text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold">
            Create First Exam
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(exam => {
            const isActive = !!exam.is_active;
            const isToggling = toggling === exam.id;
            const statusStyle = STATUS_STYLE[exam.status] || STATUS_STYLE.draft;

            return (
              <div
                key={exam.id}
                className={`bg-white border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                  isActive ? "border-emerald-200 shadow-sm" : "border-gray-200 opacity-80"
                }`}
              >
                <div className={`w-1.5 self-stretch rounded-full shrink-0 ${isActive ? "bg-emerald-500" : "bg-gray-200"}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusStyle}`}>
                      {(exam.status || "upcoming").toUpperCase()}
                    </span>
                    {exam.phase && (
                      <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">
                        Phase {exam.phase}
                      </span>
                    )}
                    {exam.day_number && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Day {exam.day_number}</span>
                    )}
                    {exam.subject && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{exam.subject}</span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-base truncate">{exam.title}</h3>

                  <div className="flex flex-wrap gap-4 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={12} /> {exam.duration || 45} min</span>
                    {exam.scheduled_date && (
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Calendar size={12} /> {fmtDate(exam.scheduled_date)}
                      </span>
                    )}
                    {exam.start_time && (
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Clock size={12} /> starts {fmtTime(exam.start_time)}
                      </span>
                    )}
                    {exam.end_time && (
                      <span className="flex items-center gap-1 text-orange-500 font-medium">
                        ends {fmtTime(exam.end_time)}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><FileQuestion size={12} /> {exam.question_count ?? "—"} Qs</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <button
                    onClick={() => navigate(`/admin/xrevise/questions?exam=${exam.id}`)}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-violet-300 hover:text-violet-700 font-semibold transition"
                  >
                    <FileQuestion size={13} className="inline mr-1" />Qs
                  </button>
                  <button
                    onClick={() => openEdit(exam)}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-700 font-semibold transition"
                  >
                    <Edit2 size={13} className="inline mr-1" />Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exam)}
                    disabled={deleting === exam.id}
                    className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg text-gray-400 hover:border-red-300 hover:text-red-600 transition disabled:opacity-50"
                  >
                    {deleting === exam.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                  <button
                    onClick={() => toggleActivate(exam)}
                    disabled={isToggling}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                    }`}
                  >
                    {isToggling ? <RotateCcw size={13} className="animate-spin" /> : <Power size={13} />}
                    {isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b shrink-0">
              <h3 className="font-bold text-gray-900 text-lg">
                {modal.mode === "create" ? "Create New Exam" : "Edit Exam"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Phase 1 Day 1 – Anatomy"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Phase</label>
                  <select
                    value={form.phase}
                    onChange={e => setForm(f => ({ ...f, phase: Number(e.target.value) }))}
                    className={inputCls}
                  >
                    {[1, 2, 3, 4].map(p => <option key={p} value={p}>Phase {p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Day Number</label>
                  <input
                    type="number"
                    value={form.day_number}
                    onChange={e => setForm(f => ({ ...f, day_number: e.target.value }))}
                    placeholder="1"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Subject</label>
                <input
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Anatomy, Physiology"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start Time</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>End Time</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Schedule Date</label>
                  <input
                    type="date"
                    value={form.scheduled_date}
                    onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Duration (min)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Total Marks</label>
                  <input
                    type="number"
                    value={form.total_marks}
                    onChange={e => setForm(f => ({ ...f, total_marks: Number(e.target.value) }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Optional description…"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="p-5 border-t shrink-0 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {modal.mode === "create" ? "Create Exam" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
