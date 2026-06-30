import { useEffect, useState } from "react";
import { XReviseAPI } from "@/services/adminApi";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, BookOpen, Tag } from "lucide-react";

const EMPTY = {
  name: "", plan_type: "basic", description: "", exams_count: 0, duration_days: 15,
  selling_price: "", original_price: "", features: "", is_active: true,
};

export default function AdminXrevisePlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; plan: any }>({ open: false, plan: EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await XReviseAPI.getPlans();
    if (r.status) setPlans(r.plans || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => setModal({ open: true, plan: { ...EMPTY } });
  const openEdit = (p: any) => setModal({
    open: true,
    plan: { ...p, features: Array.isArray(p.features) ? p.features.join("\n") : (p.features || "") },
  });
  const closeModal = () => { setModal({ open: false, plan: EMPTY }); setError(""); };

  const handleChange = (field: string, value: any) =>
    setModal(m => ({ ...m, plan: { ...m.plan, [field]: value } }));

  const handleSave = async () => {
    const p = modal.plan;
    if (!p.name || !p.selling_price) { setError("Name and selling price are required"); return; }
    setSaving(true);
    const payload = {
      ...p,
      plan_type: p.plan_type || "basic",
      features: p.features ? p.features.split("\n").map((s: string) => s.trim()).filter(Boolean) : [],
    };
    const r = p.id
      ? await XReviseAPI.updatePlan(p.id, payload)
      : await XReviseAPI.createPlan(payload);
    setSaving(false);
    if (r.status) { closeModal(); load(); }
    else setError(r.message || "Failed to save");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this plan?")) return;
    const r = await XReviseAPI.deletePlan(id);
    if (r.status) load();
  };

  const handleToggle = async (p: any) => {
    await XReviseAPI.updatePlan(p.id, { ...p, is_active: !p.is_active });
    load();
  };

  const typeGroups = plans.reduce((acc: Record<string, any[]>, p) => {
    const t = p.plan_type || "basic";
    if (!acc[t]) acc[t] = [];
    acc[t].push(p);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">XRevise Plans</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage subscription plans for XRevise students</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition"
        >
          <Plus size={16} /> Add Plan
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : Object.keys(typeGroups).length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No plans yet</p>
          <p className="text-sm mt-1">Create the first XRevise subscription plan</p>
        </div>
      ) : (
        (["basic", "advance"] as const).filter(t => typeGroups[t]?.length > 0).map(planType => {
          const ps = typeGroups[planType];
          const phasesAllowed = planType === "advance" ? 3 : 1;
          return (
          <div key={planType} className="space-y-3">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-sm ${planType === "advance" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                {planType === "advance" ? "Advance" : "Basic"} Plan
              </span>
              <span className="text-gray-400 text-sm font-normal">{phasesAllowed} phase{phasesAllowed > 1 ? "s" : ""} access · {ps.length} plan{ps.length !== 1 ? "s" : ""}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ps.map((plan: any) => (
                <div key={plan.id} className={`bg-white rounded-2xl border p-5 ${plan.is_active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${plan.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                        <h3 className="font-bold text-gray-900 truncate">{plan.name}</h3>
                      </div>
                      {plan.description && <p className="text-gray-500 text-sm mb-2">{plan.description}</p>}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                        <span><BookOpen size={13} className="inline mr-1" />{plan.exams_count} tests</span>
                        <span>{plan.duration_days} days</span>
                        {plan.enrolled_count > 0 && (
                          <span className="text-emerald-600 font-semibold">{plan.enrolled_count} enrolled</span>
                        )}
                      </div>
                      {Array.isArray(plan.features) && plan.features.length > 0 && (
                        <ul className="space-y-0.5 mb-3">
                          {plan.features.slice(0, 3).map((f: string, i: number) => (
                            <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                              <CheckCircle size={11} className="text-emerald-500" /> {f}
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-xs text-gray-400">+{plan.features.length - 3} more</li>
                          )}
                        </ul>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-emerald-700">₹{Number(plan.selling_price).toLocaleString()}</span>
                        {plan.original_price && Number(plan.original_price) > Number(plan.selling_price) && (
                          <span className="text-gray-400 line-through text-sm">₹{Number(plan.original_price).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => openEdit(plan)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleToggle(plan)} className={`p-2 rounded-lg transition ${plan.is_active ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>
                        {plan.is_active ? <XCircle size={15} /> : <CheckCircle size={15} />}
                      </button>
                      <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          );
        })
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg">{modal.plan.id ? "Edit Plan" : "Add Plan"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Plan Name *</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.plan.name}
                    onChange={e => handleChange("name", e.target.value)}
                    placeholder="e.g. Basic Plan / Advance Plan"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Plan Type</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.plan.plan_type || "basic"}
                    onChange={e => handleChange("plan_type", e.target.value)}
                  >
                    <option value="basic">Basic — 1 Phase</option>
                    <option value="advance">Advance — 3 Phases</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Duration (days)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.plan.duration_days}
                    onChange={e => handleChange("duration_days", parseInt(e.target.value) || 15)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Selling Price (₹) *</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.plan.selling_price}
                    onChange={e => handleChange("selling_price", e.target.value)}
                    placeholder="999"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Original Price (₹)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.plan.original_price}
                    onChange={e => handleChange("original_price", e.target.value)}
                    placeholder="1499"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Exams Count</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.plan.exams_count}
                    onChange={e => handleChange("exams_count", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Status</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.plan.is_active ? "active" : "inactive"}
                    onChange={e => handleChange("is_active", e.target.value === "active")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
                    value={modal.plan.description || ""}
                    onChange={e => handleChange("description", e.target.value)}
                    placeholder="Brief plan description…"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    <Tag size={13} className="inline mr-1" />Features (one per line)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
                    value={modal.plan.features || ""}
                    onChange={e => handleChange("features", e.target.value)}
                    placeholder={"15 Day-wise exams\nFull analysis\nRank prediction\nMobile access"}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition disabled:opacity-50"
              >
                {saving ? "Saving…" : modal.plan.id ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
