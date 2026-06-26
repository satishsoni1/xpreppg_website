import { useEffect, useState } from "react";
import { Search, Download, Loader2, BookOpen, Key, X, CheckCircle } from "lucide-react";
import { XReviseAPI } from "@/services/adminApi";
import * as XLSX from "xlsx";

export default function AdminXreviseStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [resetModal, setResetModal] = useState<{ open: boolean; student: any | null }>({ open: false, student: null });
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await XReviseAPI.getAllStudents();
      if (data.status) setStudents(data.students || []);
    } finally { setLoading(false); }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(term.toLowerCase()) ||
    s.email?.toLowerCase().includes(term.toLowerCase()) ||
    s.mobile?.includes(term)
  );

  const handleExport = () => {
    const rows = filtered.map(s => ({
      "ID": s.id, "Name": s.name, "Email": s.email, "Mobile": s.mobile,
      "City": s.city || "", "Category": s.category || "", "Joined": new Date(s.created_at).toLocaleDateString("en-IN"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "XRevise Students");
    XLSX.writeFile(wb, `XRevise_Students_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !resetModal.student) return;
    setSubmitting(true);
    try {
      const res = await XReviseAPI.resetStudentPassword(resetModal.student.id, newPassword);
      if (res.status) {
        setNotification({ msg: "Password reset successfully!", type: "success" });
        setResetModal({ open: false, student: null });
        setNewPassword("");
      } else {
        setNotification({ msg: res.message || "Failed", type: "error" });
      }
    } finally { setSubmitting(false); }
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="text-primary" size={22} /> XRevise Students
          <span className="ml-2 text-sm font-normal text-gray-500">({students.length} total)</span>
        </h1>
        <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition">
          <Download size={16} /> Export
        </button>
      </div>

      {notification && (
        <div className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium ${notification.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          <CheckCircle size={16} /> {notification.msg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={term} onChange={e => setTerm(e.target.value)}
              placeholder="Search name, email, mobile…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={28} /><p>Loading…</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {["#", "Name", "Mobile", "Email", "City", "Category", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.mobile}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{s.city || "—"}</td>
                    <td className="px-4 py-3"><span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">{s.category || "—"}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setResetModal({ open: true, student: s }); setNewPassword(""); }}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Key size={12} /> Reset
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No XRevise students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {resetModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Reset Password</h3>
              <button onClick={() => setResetModal({ open: false, student: null })}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Resetting password for <strong>{resetModal.student?.name}</strong></p>
            <input
              type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="New password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mb-4 focus:ring-2 focus:ring-primary outline-none"
            />
            <button onClick={handleResetPassword} disabled={!newPassword || submitting}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primaryDark transition disabled:opacity-60">
              {submitting ? "Resetting…" : "Reset Password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
