import { useEffect, useState } from "react";
import { XReviseAPI } from "@/services/adminApi";
import { RotateCcw, ShoppingBag, IndianRupee, Tag, CheckCircle, Clock } from "lucide-react";

export default function AdminXreviseOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await XReviseAPI.getOrders();
    if (r.status) setOrders(r.orders || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o =>
    !search ||
    o.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.student_mobile?.includes(search) ||
    o.order_id?.includes(search) ||
    o.plan_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = orders.filter(o => o.status === "paid").reduce((s, o) => s + Number(o.amount), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">XRevise Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">Subscription payment records</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 text-sm font-semibold">
          <RotateCcw size={15} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border p-4">
          <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Paid</p>
          <p className="text-2xl font-bold text-emerald-600">{orders.filter(o => o.status === "paid").length}</p>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-500">{orders.filter(o => o.status !== "paid").length}</p>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Revenue</p>
          <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
            <IndianRupee size={18} />{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <input
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
        placeholder="Search by name, mobile, order ID or plan…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl text-gray-400">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-20" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Phase</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Coupon</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{o.student_name || "—"}</p>
                    <p className="text-gray-400 text-xs">{o.student_mobile}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{o.plan_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                      Phase {o.phase}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900">₹{Number(o.amount).toLocaleString()}</p>
                    {o.discount_amount > 0 && (
                      <p className="text-xs text-emerald-600">saved ₹{Number(o.discount_amount).toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {o.coupon_code ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                        <Tag size={11} /> {o.coupon_code}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                      o.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {o.status === "paid" ? <CheckCircle size={11} /> : <Clock size={11} />}
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
