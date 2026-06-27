import { useEffect, useState } from "react";
import { XReviseAPI } from "@/services/adminApi";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Tag, Percent, IndianRupee } from "lucide-react";

const EMPTY = {
  code: "", discount_type: "flat", discount_value: "", min_order_amount: 0,
  valid_until: "", usage_limit: 0, is_active: true,
};

export default function AdminXreviseCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; coupon: any }>({ open: false, coupon: EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await XReviseAPI.getCoupons();
    if (r.status) setCoupons(r.coupons || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => setModal({ open: true, coupon: { ...EMPTY } });
  const openEdit = (c: any) => setModal({
    open: true,
    coupon: { ...c, valid_until: c.valid_until ? c.valid_until.slice(0, 10) : "" },
  });
  const closeModal = () => { setModal({ open: false, coupon: EMPTY }); setError(""); };
  const handleChange = (field: string, value: any) =>
    setModal(m => ({ ...m, coupon: { ...m.coupon, [field]: value } }));

  const handleSave = async () => {
    const c = modal.coupon;
    if (!c.code || !c.discount_value) { setError("Code and discount value are required"); return; }
    setSaving(true);
    const r = c.id
      ? await XReviseAPI.updateCoupon(c.id, c)
      : await XReviseAPI.createCoupon(c);
    setSaving(false);
    if (r.status) { closeModal(); load(); }
    else setError(r.message || "Failed to save");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    await XReviseAPI.deleteCoupon(id);
    load();
  };

  const handleToggle = async (c: any) => {
    await XReviseAPI.updateCoupon(c.id, { ...c, is_active: !c.is_active });
    load();
  };

  const isExpired = (until: string) => until && new Date(until) < new Date();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">XRevise Coupons</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage promo codes for XRevise subscriptions</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl text-gray-400">
          <Tag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No coupons yet</p>
          <p className="text-sm mt-1">Create promo codes for XRevise plans</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Discount</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Min Order</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Valid Until</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Usage</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">{c.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 font-semibold text-gray-800">
                      {c.discount_type === "percent" ? <Percent size={13} /> : <IndianRupee size={13} />}
                      {c.discount_value}
                      {c.discount_type === "percent" ? "%" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">₹{c.min_order_amount || 0}</td>
                  <td className="px-4 py-3">
                    {c.valid_until ? (
                      <span className={isExpired(c.valid_until) ? "text-red-500" : "text-gray-600"}>
                        {new Date(c.valid_until).toLocaleDateString("en-IN")}
                        {isExpired(c.valid_until) && " (expired)"}
                      </span>
                    ) : <span className="text-gray-400">No expiry</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.used_count}/{c.usage_limit > 0 ? c.usage_limit : "∞"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleToggle(c)} className={`p-1.5 rounded-lg transition ${c.is_active ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>
                        {c.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg">{modal.coupon.id ? "Edit Coupon" : "Add Coupon"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm">{error}</div>}

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Coupon Code *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono uppercase"
                  value={modal.coupon.code}
                  onChange={e => handleChange("code", e.target.value.toUpperCase())}
                  placeholder="XREV50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Discount Type</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.coupon.discount_type}
                    onChange={e => handleChange("discount_type", e.target.value)}
                  >
                    <option value="flat">Flat (₹)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Discount Value {modal.coupon.discount_type === "percent" ? "(%)" : "(₹)"} *
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.coupon.discount_value}
                    onChange={e => handleChange("discount_value", e.target.value)}
                    placeholder={modal.coupon.discount_type === "percent" ? "10" : "100"}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Min Order (₹)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.coupon.min_order_amount}
                    onChange={e => handleChange("min_order_amount", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Usage Limit (0=unlimited)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.coupon.usage_limit}
                    onChange={e => handleChange("usage_limit", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Valid Until</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.coupon.valid_until || ""}
                    onChange={e => handleChange("valid_until", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Status</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={modal.coupon.is_active ? "active" : "inactive"}
                    onChange={e => handleChange("is_active", e.target.value === "active")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
                {saving ? "Saving…" : modal.coupon.id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
