import { useState, useEffect } from "react";
import { CalendarDays, Plus, Trash2, X, Save, Loader2, Edit2, AlertTriangle } from "lucide-react";
import { XReviseAPI } from "@/services/adminApi";

const SUBJECTS = [
  "Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology",
  "Microbiology", "Forensic Medicine", "Community Medicine", "ENT",
  "Ophthalmology", "General Medicine", "Surgery", "Obs & Gynae",
  "Paediatrics", "Orthopaedics", "Anaesthesia", "Radiology", "Psychiatry",
  "Dermatology", "PSM",
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  postponed: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const emptyForm = {
  day_number: "", day_label: "", subject: "", topic: "",
  scheduled_date: "", status: "scheduled", postponed_to: "", notes: "", exam_id: "",
};

export default function AdminXreviseSchedule() {
  const [entries, setEntries] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterSubject, setFilterSubject] = useState("");

  useEffect(() => {
    fetchSchedule();
    XReviseAPI.getExams().then(res => { if (res.status) setExams(res.exams || []); }).catch(() => {});
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await XReviseAPI.getSchedule();
      if (res.status) setEntries(res.schedule || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSchedule(); }, [filterSubject]);

  const openAdd = () => { setEditEntry(null); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (e: any) => {
    setEditEntry(e);
    setForm({
      day_number: e.day_number?.toString() || "",
      day_label: e.day_label || "",
      subject: e.subject || "",
      topic: e.topic || "",
      scheduled_date: e.scheduled_date ? e.scheduled_date.substring(0, 10) : "",
      status: e.status || "scheduled",
      postponed_to: e.postponed_to ? e.postponed_to.substring(0, 10) : "",
      notes: e.notes || "",
      exam_id: e.exam_id ? String(e.exam_id) : "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        day_number: parseInt(form.day_number),
        scheduled_date: form.scheduled_date || null,
        postponed_to: form.postponed_to || null,
        exam_id: form.exam_id ? parseInt(form.exam_id) : null,
      };
      let res;
      if (editEntry) {
        res = await XReviseAPI.updateScheduleEntry(editEntry.id, payload);
      } else {
        res = await XReviseAPI.createScheduleEntry(payload);
      }
      if (res.status) { setShowForm(false); fetchSchedule(); }
      else alert(res.message || "Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this schedule entry?")) return;
    const res = await XReviseAPI.deleteScheduleEntry(id);
    if (res.status) fetchSchedule();
  };

  const grouped = entries.reduce<Record<string, any[]>>((acc, e) => {
    const key = e.subject;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarDays className="text-primary" size={22} /> XRevise Schedule
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primaryDark transition">
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={28} /><p>Loading…</p></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <CalendarDays className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">No schedule entries yet</p>
          <button onClick={openAdd} className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primaryDark transition">
            <Plus size={16} /> Add First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([subject, items]) => (
            <div key={subject} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  {subject}
                  <span className="text-xs font-normal text-gray-400">({items.length} session{items.length > 1 ? "s" : ""})</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((entry) => (
                  <div key={entry.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition">
                    <div className="bg-primary/10 text-primary font-bold text-sm rounded-lg px-2.5 py-1.5 shrink-0 text-center min-w-[3rem]">
                      Day {entry.day_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{entry.topic}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {entry.day_label && <span className="text-xs text-gray-500">{entry.day_label}</span>}
                        {entry.scheduled_date && (
                          <span className="text-xs text-gray-500">📅 {new Date(entry.scheduled_date).toLocaleDateString("en-IN")}</span>
                        )}
                        {entry.postponed_to && (
                          <span className="text-xs text-yellow-600 flex items-center gap-1">
                            <AlertTriangle size={10} /> Postponed to {new Date(entry.postponed_to).toLocaleDateString("en-IN")}
                          </span>
                        )}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[entry.status] || "bg-gray-100 text-gray-600"}`}>
                          {entry.status}
                        </span>
                      </div>
                      {entry.exam_id && (
                        <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          Exam #{entry.exam_id} linked
                        </span>
                      )}
                      {entry.notes && <p className="text-xs text-gray-400 mt-1 italic">{entry.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEdit(entry)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">{editEntry ? "Edit Schedule Entry" : "Add Schedule Entry"}</h2>
              <button onClick={() => setShowForm(false)}><X size={22} className="text-gray-400 hover:text-gray-700" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Day Number *</label>
                  <input required type="number" min="1" value={form.day_number}
                    onChange={e => setForm(f => ({ ...f, day_number: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="1" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Day Label</label>
                  <input value={form.day_label}
                    onChange={e => setForm(f => ({ ...f, day_label: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Monday" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject *</label>
                <select required value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Select subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topic *</label>
                <input required value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="High-yield topics for this session" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Scheduled Date</label>
                  <input type="date" value={form.scheduled_date}
                    onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="postponed">Postponed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              {form.status === "postponed" && (
                <div>
                  <label className="block text-xs font-bold text-yellow-600 uppercase mb-1">Postponed To</label>
                  <input type="date" value={form.postponed_to}
                    onChange={e => setForm(f => ({ ...f, postponed_to: e.target.value }))}
                    className="w-full border border-yellow-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link Exam (for daily test)</label>
                <select value={form.exam_id}
                  onChange={e => setForm(f => ({ ...f, exam_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                  <option value="">No exam linked</option>
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>#{ex.id} — {ex.title}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Linking an exam lets students start the test from their portal.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                <textarea value={form.notes} rows={2}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Optional notes…" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primaryDark transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? "Saving…" : editEntry ? "Update Entry" : "Add Entry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
