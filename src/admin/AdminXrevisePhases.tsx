import { useEffect, useState } from "react";
import { XReviseAPI } from "@/services/adminApi";
import {
  Layers, Plus, Edit2, Trash2, CheckCircle, XCircle,
  Loader2, Calendar, BookOpen, Users, ToggleLeft, ToggleRight,
} from "lucide-react";

const EMPTY = {
  name: "", description: "", start_date: "", end_date: "", is_active: true, sort_order: 0,
};

export default function AdminXrevisePhases() {
  const [phases, setPhases]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<{ open: boolean; phase: any }>({ open: false, phase: EMPTY });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteError, setDeleteError]     = useState("");

  const load = async () => {
    setLoading(true);
    const r = await XReviseAPI.getPhases();
    if (r.status) setPhases(r.phases || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setModal({ open: true, phase: { ...EMPTY } });
    setError("");
  };

  const openEdit = (p: any) => {
    setModal({
      open: true,
      phase: {
        ...p,
        start_date: p.start_date ? p.start_date.split("T")[0] : "",
        end_date:   p.end_date   ? p.end_date.split("T")[0]   : "",
      },
    });
    setError("");
  };

  const closeModal = () => { setModal({ open: false, phase: EMPTY }); setError(""); };

  const set = (field: string, value: any) =>
    setModal(m => ({ ...m, phase: { ...m.phase, [field]: value } }));

  const handleSave = async () => {
    const p = modal.phase;
    if (!p.name.trim()) { setError("Phase name is required"); return; }
    setSaving(true);
    const payload = {
      name:        p.name.trim(),
      description: p.description || null,
      start_date:  p.start_date || null,
      end_date:    p.end_date   || null,
      is_active:   p.is_active,
      sort_order:  parseInt(p.sort_order) || 0,
    };
    const r = p.id
      ? await XReviseAPI.updatePhase(p.id, payload)
      : await XReviseAPI.createPhase(payload);
    setSaving(false);
    if (r.status) { closeModal(); load(); }
    else setError(r.message || "Failed to save phase");
  };

  const handleToggle = async (p: any) => {
    await XReviseAPI.togglePhase(p.id, !p.is_active);
    load();
  };

  const handleDelete = async (id: number) => {
    setDeleteError("");
    const r = await XReviseAPI.deletePhase(id);
    if (r.status) { setDeleteConfirm(null); load(); }
    else { setDeleteError(r.message || "Delete failed"); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="text-emerald-600" size={22} /> XRevise Phases
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Create and manage phases — students pick phases when enrolling
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition"
        >
          <Plus size={16} /> Add Phase
        </button>
      </div>

      {/* Phase cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mr-2" /> Loading phases…
        </div>
      ) : phases.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl text-gray-400">
          <Layers size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold">No phases yet</p>
          <p className="text-sm mt-1">Create the first phase to get started</p>
          <button
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700"
          >
            <Plus size={15} /> Create Phase
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phases.map(ph => (
            <div
              key={ph.id}
              className={`bg-white rounded-2xl border-2 p-5 transition ${
                ph.is_active ? "border-gray-200" : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">

                  {/* Name + active indicator */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ph.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                    <h3 className="font-bold text-gray-900 text-lg truncate">{ph.name}</h3>
                    {!ph.is_active && (
                      <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                        Disabled
                      </span>
                    )}
                  </div>

                  {ph.description && (
                    <p className="text-gray-500 text-sm mb-3">{ph.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-emerald-500" />
                      {ph.exam_count} test{ph.exam_count !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={13} className="text-blue-500" />
                      {ph.enrolled_count} enrolled
                    </span>
                  </div>

                  {/* Dates */}
                  {(ph.start_date || ph.end_date) && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={12} />
                      {ph.start_date && (
                        <span>{new Date(ph.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      )}
                      {ph.start_date && ph.end_date && <span>→</span>}
                      {ph.end_date && (
                        <span>{new Date(ph.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(ph)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleToggle(ph)}
                    className={`p-2 rounded-lg transition ${
                      ph.is_active
                        ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                        : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                    title={ph.is_active ? "Disable" : "Enable"}
                  >
                    {ph.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                  </button>
                  <button
                    onClick={() => { setDeleteConfirm(ph.id); setDeleteError(""); }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Sort order badge */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Sort order: {ph.sort_order}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  ph.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {ph.is_active ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {modal.phase.id ? "Edit Phase" : "Create Phase"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Phase Name *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  placeholder="e.g. Phase 1 — Surgery & Anatomy"
                  value={modal.phase.name}
                  onChange={e => set("name", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
                  placeholder="Brief description of what this phase covers…"
                  value={modal.phase.description || ""}
                  onChange={e => set("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    <Calendar size={12} className="inline mr-1" />Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.phase.start_date || ""}
                    onChange={e => set("start_date", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    <Calendar size={12} className="inline mr-1" />End Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.phase.end_date || ""}
                    onChange={e => set("end_date", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Sort Order</label>
                  <input
                    type="number" min="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    placeholder="0"
                    value={modal.phase.sort_order ?? 0}
                    onChange={e => set("sort_order", parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Lower = shown first</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Status</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.phase.is_active ? "active" : "disabled"}
                    onChange={e => set("is_active", e.target.value === "active")}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {modal.phase.id ? "Save Changes" : "Create Phase"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="font-bold text-gray-900">Delete Phase?</h3>
              <p className="text-gray-500 text-sm mt-1">
                This cannot be undone. Phases with tests assigned cannot be deleted — disable them instead.
              </p>
            </div>
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteError(""); }}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 font-semibold text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 font-semibold text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
