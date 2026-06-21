import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, X, Save, Loader2, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

const emptyForm = {
  code: "", discount_type: "percentage", discount_value: "",
  min_order_amount: "", usage_limit: "", valid_until: "", is_active: true,
};

export default function AdminPosterPromos() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPromo, setEditPromo] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getPosterPromos();
      if (res.status) setPromos(res.promos || []);
    } finally { setLoading(false); }
  };

  const openAdd = () => { setEditPromo(null); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (p: any) => {
    setEditPromo(p);
    setForm({
      code: p.code, discount_type: p.discount_type, discount_value: p.discount_value?.toString() || "",
      min_order_amount: p.min_order_amount?.toString() || "", usage_limit: p.usage_limit?.toString() || "",
      valid_until: p.valid_until ? p.valid_until.substring(0, 10) : "", is_active: p.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form, discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount) || 0,
        usage_limit: Number(form.usage_limit) || 0,
        valid_until: form.valid_until || null,
      };
      let res;
      if (editPromo) res = await AdminAPI.updatePosterPromo(editPromo.id, payload);
      else res = await AdminAPI.createPosterPromo(payload);
      if (res.status) { setShowForm(false); fetchPromos(); }
      else alert(res.message || "Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this promo code?")) return;
    const res = await AdminAPI.deletePosterPromo(id);
    if (res.status) fetchPromos();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Tag className="text-primary" size={22} /> Poster Promo Codes
        </h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primaryDark transition">
          <Plus size={16} /> Add Promo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={28} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {["Code", "Type", "Value", "Min Order", "Limit", "Used", "Expires", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {promos.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-primary">{p.code}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{p.discount_type}</td>
                    <td className="px-4 py-3 font-semibold">{p.discount_type === "percentage" ? `${p.discount_value}%` : `₹${p.discount_value}`}</td>
                    <td className="px-4 py-3 text-gray-600">₹{p.min_order_amount || 0}</td>
                    <td className="px-4 py-3 text-gray-600">{p.usage_limit || "∞"}</td>
                    <td className="px-4 py-3 text-gray-600">{p.used_count || 0}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.valid_until ? new Date(p.valid_until).toLocaleDateString("en-IN") : "No expiry"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {promos.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">No promo codes yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">{editPromo ? "Edit Promo Code" : "Add Promo Code"}</h2>
              <button onClick={() => setShowForm(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Promo Code *</label>
                <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono font-bold tracking-widest focus:ring-2 focus:ring-primary outline-none"
                  placeholder="SAVE20" disabled={!!editPromo} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Type *</label>
                  <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Value *</label>
                  <input required type="number" min="0" value={form.discount_value}
                    onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder={form.discount_type === "percentage" ? "20" : "100"} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Order (₹)</label>
                  <input type="number" min="0" value={form.min_order_amount}
                    onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usage Limit (0=∞)</label>
                  <input type="number" min="0" value={form.usage_limit}
                    onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valid Until</label>
                <input type="date" value={form.valid_until}
                  onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className="shrink-0">
                  {form.is_active ? <ToggleRight className="text-primary" size={28} /> : <ToggleLeft className="text-gray-400" size={28} />}
                </button>
                <span className="text-sm font-medium text-gray-700">{form.is_active ? "Active" : "Inactive"}</span>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primaryDark transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? "Saving…" : editPromo ? "Update Promo" : "Create Promo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
