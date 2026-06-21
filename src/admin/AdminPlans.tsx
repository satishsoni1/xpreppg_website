import { useState, useEffect } from "react";
import { AdminAPI } from "@/services/adminApi";
import { Package, Save, Loader2, Eye, EyeOff } from "lucide-react";

type PortalType = "cbt" | "xrevise";

const TYPE_CFG = {
  cbt: { label: "CBT", border: "border-blue-500", badge: "bg-blue-50 text-blue-700 border border-blue-100", btn: "from-blue-600 to-blue-700" },
  xrevise: { label: "XRevise", border: "border-emerald-500", badge: "bg-emerald-50 text-emerald-700 border border-emerald-100", btn: "from-emerald-600 to-emerald-700" },
};

export default function AdminPlans() {
  const [activeType, setActiveType] = useState<PortalType>(() =>
    localStorage.getItem("admin_portal") === "xrevise" ? "xrevise" : "cbt"
  );
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "", exams_count: 1, selling_price: "", original_price: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchPlans(); }, [activeType]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getPlans(activeType);
      if (res.status) setPlans(res.plans);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setCreating(true);
    const res = await AdminAPI.createPlan({ ...form, portal_type: activeType });
    setCreating(false);
    if (res.status) {
      setForm({ name: "", exams_count: 1, selling_price: "", original_price: "" });
      fetchPlans();
    } else {
      alert(res.message);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${!currentStatus ? "activate" : "hide"} this plan?`)) return;
    const res = await AdminAPI.togglePlan(id, !currentStatus);
    if (res.status) fetchPlans();
    else alert(res.message);
  };

  const cfg = TYPE_CFG[activeType];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Package className="text-primary" /> Plan Management
      </h1>

      {/* Portal Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(["cbt", "xrevise"] as PortalType[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              activeType === t
                ? t === "cbt" ? "bg-blue-600 text-white shadow" : "bg-emerald-600 text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {TYPE_CFG[t].label} Plans
          </button>
        ))}
      </div>

      {/* CREATE FORM */}
      <div className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${cfg.border} border border-gray-200 mb-8`}>
        <h3 className="font-bold text-gray-800 mb-4">Create New {cfg.label} Package</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Plan Name</label>
            <input
              required placeholder="e.g. Gold Pack (5 Exams)"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-primary"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Exams Count</label>
            <input
              required type="number" placeholder="1"
              className="w-full border p-2.5 rounded-lg"
              value={form.exams_count}
              onChange={e => setForm({ ...form, exams_count: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Selling Price</label>
            <input
              required type="number" placeholder="₹ 999"
              className="w-full border p-2.5 rounded-lg font-bold text-primary"
              value={form.selling_price}
              onChange={e => setForm({ ...form, selling_price: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Original Price</label>
            <input
              type="number" placeholder="₹ 1999"
              className="w-full border p-2.5 rounded-lg text-gray-400"
              value={form.original_price}
              onChange={e => setForm({ ...form, original_price: e.target.value })}
            />
          </div>

          <button
            type="submit" disabled={creating}
            className={`md:col-span-5 bg-gradient-to-r ${cfg.btn} text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2`}
          >
            {creating ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save {cfg.label} Plan
          </button>
        </form>
      </div>

      {/* PLANS LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
          <Package size={40} className="mx-auto mb-2 opacity-30" />
          <p>No {cfg.label} plans yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`rounded-xl shadow-sm border-t-4 ${cfg.border} border p-6 transition group ${
                plan.is_active ? "bg-white border-gray-200 hover:shadow-md" : "bg-gray-50 border-gray-200 opacity-70"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                    plan.is_active ? "bg-secondary text-primary" : "bg-gray-200 text-gray-500"
                  }`}>
                    {plan.exams_count}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      plan.is_active ? "bg-secondaryMiddle text-primary" : "bg-gray-200 text-gray-600"
                    }`}>
                      {plan.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(plan.id, plan.is_active)}
                  title={plan.is_active ? "Hide Plan" : "Activate Plan"}
                  className={`p-2 rounded-lg transition ${
                    plan.is_active
                      ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
                      : "text-gray-400 hover:text-primary hover:bg-secondary"
                  }`}
                >
                  {plan.is_active ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <h3 className={`text-xl font-bold mb-1 ${plan.is_active ? "text-gray-900" : "text-gray-600"}`}>
                {plan.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{plan.exams_count} Exams included</p>

              <div className="flex items-end gap-2 border-t pt-4">
                <span className={`text-3xl font-extrabold ${plan.is_active ? "text-gray-900" : "text-gray-500"}`}>
                  ₹{plan.selling_price}
                </span>
                {plan.original_price && (
                  <span className="text-sm text-gray-400 line-through mb-1">₹{plan.original_price}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}