import { useEffect, useState, useCallback } from "react";
import {
  Users, UserPlus, CheckCircle, Trash2, Search, Loader2,
  X, RotateCcw, AlertTriangle, ChevronDown,
} from "lucide-react";
import { XReviseAPI } from "@/services/adminApi";

type Tab = "overview" | "enroll" | "new_student";

const PHASES = [1, 2, 3, 4] as const;

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase mb-1";

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold ${
        ok ? "bg-emerald-600" : "bg-red-600"
      }`}
    >
      {ok ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
      {msg}
    </div>
  );
}

// ─── Phase badge ─────────────────────────────────────────────────────────────
function PhaseBadge({ phase }: { phase: number }) {
  const colors = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-orange-100 text-orange-700", "bg-emerald-100 text-emerald-700"];
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[phase - 1] ?? colors[0]}`}>
      Phase {phase}
    </span>
  );
}

// ─── Phase Picker ─────────────────────────────────────────────────────────────
function PhasePicker({ value, onChange }: { value: number; onChange: (p: number) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {PHASES.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`py-2.5 rounded-xl text-sm font-bold border-2 transition ${
            value === p
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-gray-200 text-gray-500 hover:border-emerald-300"
          }`}
        >
          Phase {p}
        </button>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminXreviseEnrollments() {
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-emerald-600" size={22} /> XRevise Enrollments
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Phase-wise enrollment management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {([
          { key: "overview",    label: "Overview",      icon: <Users size={15} /> },
          { key: "enroll",      label: "Enroll Students", icon: <UserPlus size={15} /> },
          { key: "new_student", label: "New Student",   icon: <UserPlus size={15} /> },
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
              tab === t.key
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "overview"    && <OverviewTab showToast={showToast} />}
      {tab === "enroll"      && <EnrollTab   showToast={showToast} />}
      {tab === "new_student" && <NewStudentTab showToast={showToast} />}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ showToast }: { showToast: (m: string, ok: boolean) => void }) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(1);
  const [removing, setRemoving] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await XReviseAPI.getPhaseEnrollments();
    if (r.status) setEnrollments(r.enrollments || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const byPhase = PHASES.reduce<Record<number, any[]>>((acc, p) => {
    acc[p] = enrollments.filter(e => e.phase === p);
    return acc;
  }, {} as any);

  const displayed = byPhase[activePhase].filter(e =>
    !search ||
    e.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.mobile?.includes(search) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = async (enr: any) => {
    if (!confirm(`Remove ${enr.student_name} from Phase ${enr.phase}?`)) return;
    setRemoving(enr.id);
    const r = await XReviseAPI.unenrollPhase(enr.id);
    if (r.status) {
      showToast("Student unenrolled", true);
      setEnrollments(prev => prev.filter(e => e.id !== enr.id));
    } else {
      showToast(r.message || "Failed", false);
    }
    setRemoving(null);
  };

  return (
    <div className="space-y-4">
      {/* Phase summary pills */}
      <div className="grid grid-cols-4 gap-3">
        {PHASES.map(p => (
          <button
            key={p}
            onClick={() => setActivePhase(p)}
            className={`rounded-xl p-3 border-2 text-left transition ${
              activePhase === p ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-emerald-200"
            }`}
          >
            <p className={`text-2xl font-extrabold ${activePhase === p ? "text-emerald-700" : "text-gray-800"}`}>
              {byPhase[p].length}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Phase {p} enrolled</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 gap-3 flex-wrap">
          <h3 className="font-bold text-gray-800">Phase {activePhase} Students ({displayed.length})</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-400 w-48"
              />
            </div>
            <button onClick={load} className="text-gray-400 hover:text-emerald-600">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
            <p>Loading…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users size={36} className="mx-auto mb-2 opacity-20" />
            <p className="font-semibold">No students enrolled in Phase {activePhase}</p>
            <p className="text-sm mt-1">Use the "Enroll Students" tab to add students</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {["#", "Student", "Mobile", "Email", "Category", "Enrolled By", "Date", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayed.map((enr, i) => (
                  <tr key={enr.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{enr.student_name}</td>
                    <td className="px-4 py-3 text-gray-600">{enr.mobile}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{enr.email || "—"}</td>
                    <td className="px-4 py-3">
                      {enr.category && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                          {enr.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        enr.enrolled_by === "payment"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {enr.enrolled_by || "admin"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(enr.enrolled_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemove(enr)}
                        disabled={removing === enr.id}
                        className="text-red-400 hover:text-red-600 transition disabled:opacity-50"
                      >
                        {removing === enr.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Enroll Students Tab ──────────────────────────────────────────────────────
function EnrollTab({ showToast }: { showToast: (m: string, ok: boolean) => void }) {
  const [students, setStudents]     = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [phase, setPhase]           = useState(1);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<Set<number>>(new Set());
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [sr, er] = await Promise.all([
      XReviseAPI.getAllStudents(),
      XReviseAPI.getPhaseEnrollments(),
    ]);
    if (sr.status) setStudents(sr.students || []);
    if (er.status) setEnrollments(er.enrollments || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Reset selection when phase changes
  useEffect(() => { setSelected(new Set()); }, [phase]);

  const enrolledIds = new Set(
    enrollments.filter(e => e.phase === phase).map(e => e.student_id)
  );

  const filtered = students.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.mobile?.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const notEnrolled = filtered.filter(s => !enrolledIds.has(s.id));
  const alreadyIn   = filtered.filter(s => enrolledIds.has(s.id));

  const toggleAll = () => {
    if (selected.size === notEnrolled.length && notEnrolled.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notEnrolled.map(s => s.id)));
    }
  };

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEnroll = async () => {
    if (!selected.size) return;
    setSaving(true);
    const r = await XReviseAPI.bulkPhaseEnroll([...selected], phase);
    if (r.status) {
      showToast(r.message || `Enrolled ${selected.size} student(s)`, true);
      setSelected(new Set());
      await load();
    } else {
      showToast(r.message || "Failed", false);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {/* Phase picker */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className={labelCls}>Select Phase to Enroll Into</label>
        <PhasePicker value={phase} onChange={setPhase} />
        <p className="text-xs text-gray-400 mt-2">
          {enrolledIds.size} student{enrolledIds.size !== 1 ? "s" : ""} already enrolled in Phase {phase}
        </p>
      </div>

      {/* Action bar */}
      {selected.size > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-emerald-800">
            {selected.size} student{selected.size !== 1 ? "s" : ""} selected for Phase {phase}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
              Clear
            </button>
            <button
              onClick={handleEnroll}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Enroll {selected.size} Student{selected.size !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* Student list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.size === notEnrolled.length && notEnrolled.length > 0}
              onChange={toggleAll}
              className="w-4 h-4 accent-emerald-600"
            />
            <span className="text-xs font-semibold text-gray-500 uppercase">Select All Not-Enrolled</span>
          </label>
          <div className="flex-1" />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search students…"
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-400 w-52"
            />
          </div>
          <button onClick={load} className="text-gray-400 hover:text-emerald-600">
            <RotateCcw size={15} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-10" />
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Mobile</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Not enrolled (selectable) */}
                {notEnrolled.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={`cursor-pointer transition ${selected.has(s.id) ? "bg-emerald-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggle(s.id)}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 accent-emerald-600"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.mobile}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.email || "—"}</td>
                    <td className="px-4 py-3">
                      {s.category && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                          {s.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">Not enrolled</span>
                    </td>
                  </tr>
                ))}

                {/* Already enrolled (dimmed) */}
                {alreadyIn.map(s => (
                  <tr key={s.id} className="opacity-50 bg-gray-50/50">
                    <td className="px-4 py-3">
                      <CheckCircle size={16} className="text-emerald-500" />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{s.mobile}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{s.email || "—"}</td>
                    <td className="px-4 py-3">
                      {s.category && (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">
                          {s.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PhaseBadge phase={phase} />
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">No students match</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── New Student Tab ──────────────────────────────────────────────────────────
function NewStudentTab({ showToast }: { showToast: (m: string, ok: boolean) => void }) {
  const [phase, setPhase] = useState(1);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", mobile: "", email: "", category: "", city: "", password: "",
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleCreate = async () => {
    if (!form.name.trim() || !form.mobile.trim()) {
      showToast("Name and mobile are required", false);
      return;
    }
    setSaving(true);
    try {
      // 1. Create student
      const sr = await XReviseAPI.createStudent(form);
      if (!sr.status) { showToast(sr.message || "Failed to create student", false); return; }
      const student = sr.student;

      // 2. Enroll for phase
      const er = await XReviseAPI.phaseEnroll(student.id, phase);
      if (er.status) {
        setCreated({ ...student, password: sr.password, phase });
        showToast(`Student created and enrolled for Phase ${phase}`, true);
        setForm({ name: "", mobile: "", email: "", category: "", city: "", password: "" });
      } else {
        showToast(`Student created (ID ${student.id}) but enrollment failed: ${er.message}`, false);
        setCreated({ ...student, password: sr.password, phase: null });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      {/* Success card */}
      {created && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 relative">
          <button
            onClick={() => setCreated(null)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
          <p className="font-bold text-emerald-800 flex items-center gap-2 mb-2">
            <CheckCircle size={16} /> Student Created & Enrolled
          </p>
          <div className="text-sm space-y-0.5 text-emerald-900">
            <p><strong>Name:</strong> {created.name}</p>
            <p><strong>Mobile:</strong> {created.mobile}</p>
            {created.password && <p><strong>Password:</strong> <span className="font-mono bg-emerald-100 px-1 rounded">{created.password}</span></p>}
            {created.phase && <p><strong>Enrolled:</strong> <PhaseBadge phase={created.phase} /></p>}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Student Details</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Mobile *</label>
            <input value={form.mobile} onChange={e => set("mobile", e.target.value)} placeholder="10-digit mobile" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Email</label>
          <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="Optional" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className={inputCls}>
              <option value="">Select…</option>
              <option>NEET PG</option>
              <option>USMLE</option>
              <option>FMGE</option>
              <option>INI CET</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Password (leave blank to auto-generate)</label>
          <input value={form.password} onChange={e => set("password", e.target.value)} placeholder="Auto-generated if blank" className={inputCls} />
        </div>
      </div>

      {/* Phase selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className={labelCls}>Enroll for Phase</label>
        <PhasePicker value={phase} onChange={setPhase} />
      </div>

      <button
        onClick={handleCreate}
        disabled={saving || !form.name || !form.mobile}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        Create Student & Enroll for Phase {phase}
      </button>
    </div>
  );
}
