import { useState, useEffect } from "react";
import { Truck, Plus, Trash2, X, Save, Loader2, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { AdminAPI } from "@/services/adminApi";

type Category = "poster" | "flashcard";
const CATEGORY_LABEL: Record<Category, string> = { poster: "Posters", flashcard: "Flash Cards" };

const emptyForm = { min_qty: "", max_qty: "", charge: "", sort_order: "0", is_active: true };

export default function AdminShippingCharges() {
  // ?category=flashcard comes from the sidebar's "Flash Card Delivery" link
  const [params, setParams] = useSearchParams();
  const category: Category = params.get("category") === "flashcard" ? "flashcard" : "poster";
  const [allTiers, setTiers] = useState<any[]>([]);
  const tiers = allTiers.filter(t => (t.category || "poster") === category);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTier, setEditTier] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => { fetchTiers(); }, []);

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getShippingChargeTiers();
      if (res.status) setTiers(res.tiers || []);
    } finally { setLoading(false); }
  };

  const openAdd = () => { setEditTier(null); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (t: any) => {
    setEditTier(t);
    setForm({
      min_qty: t.min_qty?.toString() || "",
      max_qty: t.max_qty != null ? t.max_qty.toString() : "",
      charge: t.charge?.toString() || "",
      sort_order: t.sort_order?.toString() || "0",
      is_active: t.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        min_qty: Number(form.min_qty),
        max_qty: form.max_qty === "" ? null : Number(form.max_qty),
        charge: Number(form.charge),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
        category,
      };
      let res;
      if (editTier) res = await AdminAPI.updateShippingChargeTier(editTier.id, payload);
      else res = await AdminAPI.createShippingChargeTier(payload);
      if (res.status) { setShowForm(false); fetchTiers(); }
      else alert(res.message || "Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this shipping charge tier?")) return;
    const res = await AdminAPI.deleteShippingChargeTier(id);
    if (res.status) fetchTiers();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Truck className="text-primary" size={22} /> {category === "flashcard" ? "Flash Card Delivery Charges" : "Poster Delivery Charges"}
        </h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primaryDark transition">
          <Plus size={16} /> Add Tier
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        {(Object.keys(CATEGORY_LABEL) as Category[]).map(c => (
          <button key={c} onClick={() => setParams(c === "poster" ? {} : { category: c })}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
              category === c ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"
            }`}>
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {category === "flashcard"
          ? "Delivery charge for a flash card order is picked by matching the number of flash card sets in the cart (each product's \"Shipping Qty\") against these tiers."
          : "Delivery charge for a poster order is picked by matching the total number of posters in the cart (summed across all packages) against these tiers."}
        {" "}Leave "Max Qty" blank for "and above".
      </p>

      {loading ? (
        <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={28} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {["Min Qty", "Max Qty", "Charge", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tiers.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold">{t.min_qty}</td>
                    <td className="px-4 py-3 text-gray-600">{t.max_qty ?? "and above"}</td>
                    <td className="px-4 py-3 font-bold text-primary">₹{Number(t.charge)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(t)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tiers.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">No shipping tiers yet</td></tr>
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
              <h2 className="text-xl font-bold text-gray-800">{editTier ? "Edit Tier" : `Add ${CATEGORY_LABEL[category]} Delivery Tier`}</h2>
              <button onClick={() => setShowForm(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Qty *</label>
                  <input required type="number" min="1" value={form.min_qty}
                    onChange={e => setForm(f => ({ ...f, min_qty: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="1" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Qty</label>
                  <input type="number" min="1" value={form.max_qty}
                    onChange={e => setForm(f => ({ ...f, max_qty: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Blank = and above" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Charge (₹) *</label>
                <input required type="number" min="0" value={form.charge}
                  onChange={e => setForm(f => ({ ...f, charge: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="150" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sort Order</label>
                <input type="number" min="0" value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
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
                {saving ? "Saving…" : editTier ? "Update Tier" : "Create Tier"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
