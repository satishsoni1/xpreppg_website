import { useState, useEffect, useMemo } from "react";
import {
  Plus, Calendar, Clock, Save, Edit, Trash2, X,
  Loader2, CheckCircle, PlayCircle, Search, Trophy,
  Monitor, BookOpen, RefreshCw,
} from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

type ExamType = "cbt" | "xrevise";

const TYPE_CFG = {
  cbt: {
    label: "CBT Exam",
    badge: "bg-blue-100 text-blue-700",
    accent: "bg-blue-600",
    icon: <Monitor size={14} />,
    tab: "bg-blue-600 text-white",
    tabInactive: "text-blue-600 border-blue-200 hover:bg-blue-50",
    ring: "focus:ring-blue-500",
    btn: "bg-blue-600 hover:bg-blue-700",
    borderTop: "border-t-blue-600",
  },
  xrevise: {
    label: "XRevise Exam",
    badge: "bg-emerald-100 text-emerald-700",
    accent: "bg-emerald-600",
    icon: <BookOpen size={14} />,
    tab: "bg-emerald-600 text-white",
    tabInactive: "text-emerald-600 border-emerald-200 hover:bg-emerald-50",
    ring: "focus:ring-emerald-500",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    borderTop: "border-t-emerald-600",
  },
};

const emptyForm = {
  title: "", date: "", duration_minutes: 60, total_marks: 200,
  status: "upcoming", exam_type: "cbt" as ExamType,
};

export default function AdminExams() {
  // Determine default tab from admin portal (CBT → cbt, XRevise → xrevise)
  const defaultType: ExamType =
    (localStorage.getItem("admin_portal") || "CBT") === "CBT" ? "cbt" : "xrevise";

  const [activeType, setActiveType] = useState<ExamType>(defaultType);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm, exam_type: defaultType });

  useEffect(() => { fetchExams(); }, [activeType]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getExams(activeType);
      if (res.status) setExams(res.exams);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: exams.length,
    live: exams.filter(e => e.status === "live").length,
    upcoming: exams.filter(e => e.status === "upcoming").length,
    completed: exams.filter(e => e.status === "completed").length,
  }), [exams]);

  const filtered = useMemo(
    () => exams.filter(e => e.title?.toLowerCase().includes(searchTerm.toLowerCase())),
    [exams, searchTerm]
  );

  const cfg = TYPE_CFG[activeType];

  const handleTabSwitch = (t: ExamType) => {
    setActiveType(t);
    setSearchTerm("");
  };

  const handleStatusChange = async (exam: any, newStatus: string) => {
    setExams(prev => prev.map(e => e.id === exam.id ? { ...e, status: newStatus } : e));
    try {
      await AdminAPI.updateExam(exam.id, {
        title: exam.title, date: exam.date,
        duration_minutes: exam.duration || exam.duration_minutes,
        total_marks: exam.total_marks, status: newStatus, exam_type: exam.exam_type || activeType,
      });
    } catch {
      fetchExams();
    }
  };

  const handlePublishResult = async (exam: any) => {
    if (!window.confirm(`Publish result for "${exam.title}"? Students will see their rank.`)) return;
    const res = await AdminAPI.publishResult(exam.id);
    if (res.status) {
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, result_published: true } : e));
    } else {
      alert(res.message || "Failed to publish result");
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, exam_type: activeType });
    setIsModalOpen(true);
  };

  const openEditModal = (exam: any) => {
    setEditingId(exam.id);
    setForm({
      title: exam.title,
      date: exam.date ? new Date(exam.date).toISOString().split("T")[0] : "",
      duration_minutes: exam.duration_minutes || exam.duration || 60,
      total_marks: exam.total_marks || 200,
      status: exam.status || "upcoming",
      exam_type: (exam.exam_type as ExamType) || activeType,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setSubmitting(true);
    try {
      const res = editingId
        ? await AdminAPI.updateExam(editingId, form)
        : await AdminAPI.createExam(form);
      if (res.status) { fetchExams(); setIsModalOpen(false); }
      else alert(res.message);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this exam?")) return;
    const res = await AdminAPI.deleteExam(id);
    if (res.status) setExams(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Exams</h1>
          <p className="text-gray-500 text-sm mt-1">Manage CBT and XRevise exams separately</p>
        </div>
        <button
          onClick={openCreateModal}
          className={`${cfg.btn} text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow transition`}
        >
          <Plus size={18} /> New {activeType === "cbt" ? "CBT" : "XRevise"} Exam
        </button>
      </div>

      {/* Portal Type Tabs */}
      <div className="flex gap-2 mb-6">
        {(["cbt", "xrevise"] as ExamType[]).map(t => (
          <button
            key={t}
            onClick={() => handleTabSwitch(t)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all ${
              activeType === t ? TYPE_CFG[t].tab : `border ${TYPE_CFG[t].tabInactive} bg-white`
            }`}
          >
            {t === "cbt" ? <Monitor size={16} /> : <BookOpen size={16} />}
            {t === "cbt" ? "CBT Exams" : "XRevise Exams"}
          </button>
        ))}
        <button onClick={fetchExams} className="ml-auto p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "bg-slate-100 text-slate-700" },
          { label: "Live", value: stats.live, color: "bg-green-100 text-green-700" },
          { label: "Upcoming", value: stats.upcoming, color: "bg-purple-100 text-purple-700" },
          { label: "Completed", value: stats.completed, color: "bg-gray-100 text-gray-700" },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-2xl ${s.color} flex items-center justify-between`}>
            <div>
              <p className="text-xs font-bold uppercase opacity-70 mb-0.5">{s.label}</p>
              <p className="text-2xl font-extrabold">{s.value}</p>
            </div>
            <div className="p-2 bg-white/30 rounded-xl">
              {s.label === "Live" ? <PlayCircle size={20} /> :
               s.label === "Completed" ? <CheckCircle size={20} /> :
               <Calendar size={20} />}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5 relative">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
        <input
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 outline-none shadow-sm transition"
          placeholder={`Search ${activeType === "cbt" ? "CBT" : "XRevise"} exams…`}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Exam Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400 w-10 h-10" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          {activeType === "cbt"
            ? <Monitor className="w-14 h-14 text-blue-200 mx-auto mb-4" />
            : <BookOpen className="w-14 h-14 text-emerald-200 mx-auto mb-4" />}
          <p className="text-gray-500 font-semibold">No {activeType === "cbt" ? "CBT" : "XRevise"} exams yet</p>
          <button onClick={openCreateModal} className={`mt-4 ${cfg.btn} text-white px-5 py-2.5 rounded-xl font-bold transition text-sm`}>
            <Plus size={16} className="inline mr-1" /> Create First Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(exam => (
            <div key={exam.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col border-t-4 ${cfg.borderTop}`}>

              {/* Card Header */}
              <div className="p-5 border-b border-gray-50 flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {cfg.icon} {activeType === "cbt" ? "CBT" : "XRevise"}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-base line-clamp-2">{exam.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Calendar size={11} />
                    {exam.date ? new Date(exam.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No date"}
                  </p>
                </div>

                {/* Status dropdown */}
                <select
                  value={exam.status}
                  onChange={e => handleStatusChange(exam, e.target.value)}
                  className={`shrink-0 appearance-none pl-2 pr-6 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide cursor-pointer outline-none border transition ${
                    exam.status === "live" ? "bg-green-50 text-green-700 border-green-200" :
                    exam.status === "completed" ? "bg-gray-100 text-gray-600 border-gray-200" :
                    "bg-purple-50 text-purple-700 border-purple-200"
                  }`}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Ended</option>
                </select>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Duration</p>
                    <div className="flex items-center justify-center gap-1 font-bold text-gray-800">
                      <Clock size={13} /> {exam.duration || exam.duration_minutes || "—"}m
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Marks</p>
                    <p className="font-bold text-gray-800">{exam.total_marks || "—"}</p>
                  </div>
                </div>
                {exam.result_published && (
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    <CheckCircle size={13} /> Result Published
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-gray-50 flex gap-2 flex-wrap">
                <button
                  onClick={() => openEditModal(exam)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition"
                >
                  <Edit size={14} /> Edit
                </button>
                {exam.status === "completed" && !exam.result_published && (
                  <button
                    onClick={() => handlePublishResult(exam)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-50 text-purple-700 font-semibold text-sm hover:bg-purple-100 transition"
                  >
                    <Trophy size={14} /> Publish
                  </button>
                )}
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Edit Exam" : "Create Exam"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Exam Type selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Exam Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["cbt", "xrevise"] as ExamType[]).map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setForm(f => ({ ...f, exam_type: t }))}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-bold text-sm transition ${
                        form.exam_type === t
                          ? t === "cbt"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {t === "cbt" ? <Monitor size={16} /> : <BookOpen size={16} />}
                      {t === "cbt" ? "CBT" : "XRevise"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Title</label>
                <input
                  required
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3 focus:ring-2 outline-none text-sm"
                  placeholder={form.exam_type === "cbt" ? "e.g. NEET PG Grand Test 1" : "e.g. Phase 1 Day 1 — Anatomy + Ortho"}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                  <input
                    required type="date"
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3 focus:ring-2 outline-none text-sm"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3 focus:ring-2 outline-none bg-white text-sm"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Duration (mins)
                  </label>
                  <input
                    required type="number"
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3 focus:ring-2 outline-none text-sm"
                    value={form.duration_minutes}
                    onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Marks</label>
                  <input
                    required type="number"
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-3 focus:ring-2 outline-none text-sm"
                    value={form.total_marks}
                    onChange={e => setForm(f => ({ ...f, total_marks: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={submitting}
                className={`w-full ${form.exam_type === "cbt" ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-60`}
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {editingId ? "Update Exam" : `Create ${form.exam_type === "cbt" ? "CBT" : "XRevise"} Exam`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
