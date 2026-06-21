import { useState, useEffect, useMemo } from "react";
import {
  Database, Play, CheckSquare, Square, Loader2,
  CheckCircle, AlertCircle, Filter, Search, RefreshCw, User,
} from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

export default function PendingAttemptsTable() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [filterType, setFilterType] = useState<"" | "xrevise" | "cbt">("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attemptsRes, examsRes] = await Promise.all([
        AdminAPI.getPendingAttempts(),
        AdminAPI.getExams(),
      ]);
      setAttempts(attemptsRes.attempts || []);
      setExams(examsRes.exams || []);
    } catch (err) {
      setNotification({ type: "error", msg: "Failed to load data from server." });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return attempts.filter((a) => {
      const matchSearch =
        !search ||
        a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.mobile?.includes(search) ||
        a.exam_title?.toLowerCase().includes(search.toLowerCase());

      const matchExam = !filterExam || a.exam_id?.toString() === filterExam;

      const exam = exams.find((e) => e.id?.toString() === a.exam_id?.toString());
      const matchType =
        !filterType ||
        (filterType === "xrevise" && (!exam?.exam_type || exam.exam_type === "xrevise")) ||
        (filterType === "cbt" && exam?.exam_type === "cbt");

      return matchSearch && matchExam && matchType;
    });
  }, [attempts, exams, search, filterExam, filterType]);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const filteredIds = filtered.map((a) => a.raw_attempt_id);
    if (filteredIds.every((id) => selectedIds.includes(id)) && filteredIds.length > 0) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const handleGenerateResults = async () => {
    if (selectedIds.length === 0) return;
    setEvaluating(true);
    setNotification(null);
    try {
      const data = await AdminAPI.evaluateSelectedAttempts(selectedIds);
      setNotification({ type: data.success ? "success" : "error", msg: data.message });
      if (data.success) {
        setSelectedIds([]);
        fetchData();
      }
    } catch {
      setNotification({ type: "error", msg: "Server connection failed." });
    } finally {
      setEvaluating(false);
    }
  };

  const filteredIds = filtered.map((a) => a.raw_attempt_id);
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Database className="text-blue-500" size={26} /> Result Generator
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Filter and select attempts to evaluate and generate results.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            {selectedIds.length} selected
          </span>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-all"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleGenerateResults}
            disabled={evaluating || selectedIds.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md"
          >
            {evaluating ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
            {evaluating ? "Evaluating…" : "Generate Results"}
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 font-medium text-sm ${
          notification.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {notification.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {notification.msg}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold mr-1">
            <Filter size={15} /> Filters
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student / mobile / exam…"
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Exam type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="">All Types</option>
            <option value="xrevise">XRevise</option>
            <option value="cbt">CBT</option>
          </select>

          {/* Specific exam filter */}
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white max-w-xs"
          >
            <option value="">All Exams</option>
            {exams
              .filter((e) => !filterType || (!e.exam_type ? filterType === "xrevise" : e.exam_type === filterType))
              .map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
          </select>

          {(search || filterExam || filterType) && (
            <button
              onClick={() => { setSearch(""); setFilterExam(""); setFilterType(""); }}
              className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-all"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-3 text-xs text-slate-400 font-medium">
          Showing {filtered.length} of {attempts.length} attempts
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
            <p className="text-slate-500 font-medium">Loading pending attempts…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 w-12">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600 transition-colors">
                      {allFilteredSelected
                        ? <CheckSquare size={20} className="text-blue-600" />
                        : <Square size={20} />}
                    </button>
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map((row, idx) => {
                    const isSelected = selectedIds.includes(row.raw_attempt_id);
                    const exam = exams.find((e) => e.id?.toString() === row.exam_id?.toString());
                    const examType = exam?.exam_type || "xrevise";
                    return (
                      <tr
                        key={row.raw_attempt_id}
                        onClick={() => toggleSelection(row.raw_attempt_id)}
                        className={`transition-colors cursor-pointer ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                      >
                        <td className="py-4 px-6">
                          {isSelected
                            ? <CheckSquare size={18} className="text-blue-600" />
                            : <Square size={18} className="text-slate-300" />}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400 font-mono">#{idx + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <User size={15} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{row.student_name || "Unknown"}</p>
                              <p className="text-xs text-slate-400">{row.mobile}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-slate-700">{row.exam_title || `Exam #${row.exam_id}`}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            examType === "cbt" ? "bg-blue-100 text-blue-700" : "bg-primary/10 text-primary"
                          }`}>
                            {examType === "cbt" ? "CBT" : "XRevise"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {new Date(row.submitted_at).toLocaleString("en-IN", {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-500">
                      <Database className="mx-auto text-slate-300 mb-3" size={40} />
                      <p className="font-bold text-lg text-slate-700">
                        {attempts.length === 0 ? "Queue is Empty" : "No results match filters"}
                      </p>
                      <p className="text-sm mt-1 text-slate-400">
                        {attempts.length === 0
                          ? "No pending attempts found."
                          : "Try clearing filters to see all attempts."}
                      </p>
                    </td>
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
