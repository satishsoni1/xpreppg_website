import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import MainLayout from "@/layouts/MainLayout";

export default function AdminCouponDashboard() {
  const [analytics, setAnalytics] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    expiresAt: "",
    maxUses: "",
  });

  const loadData = async () => {
    setLoading(true);
    const a = await axios.get("https://api.xpreppg.com/api/coupon-dashboard/analytics");
    const c = await axios.get("https://api.xpreppg.com/api/coupon-dashboard/list");

    if (a.data.status) setAnalytics(a.data.analytics);
    if (c.data.status) setCoupons(c.data.coupons);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* CREATE */
  const createCoupon = async () => {
    const res = await axios.post("https://api.xpreppg.com/api/coupon-dashboard/create", form);
    alert(res.data.message);
    loadData();
    setForm({ code: "", discountType: "percent", discountValue: "", expiresAt: "", maxUses: "" });
  };

  /* TOGGLE ACTIVE */
  const toggleCoupon = async (id: string) => {
    await axios.patch(`https://api.xpreppg.com/api/coupon-dashboard/toggle/${id}`);
    loadData();
  };

  /* DELETE */
  const deleteCoupon = async (id: string) => {
    if (confirm("Delete this coupon?")) {
      await axios.delete(`https://api.xpreppg.com/api/coupon-dashboard/delete/${id}`);
      loadData();
    }
  };

  if (loading) return <p>Loading...</p>;

  const totalUsed = analytics.reduce((s: number, d: any) => s + d.usedCount, 0);
  const totalDiscount = analytics.reduce((s: number, d: any) => s + d.totalDiscount, 0);
  const totalImpact = analytics.reduce((s: number, d: any) => s + d.revenueImpact, 0);

  return (
    <MainLayout>
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Coupon Management Dashboard</h1>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">Total Coupon Uses</p>
          <p className="text-3xl font-bold text-primary">{totalUsed}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">Total Discount Given</p>
          <p className="text-3xl font-bold text-red-500">₹{totalDiscount}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">Revenue Impact</p>
          <p className="text-3xl font-bold text-emerald-600">₹{totalImpact}</p>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Usage by Coupon</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics}>
            <XAxis dataKey="coupon" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="usedCount" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CREATE COUPON FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-bold mb-4">Create New Coupon</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="border p-3 rounded" placeholder="Code" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />

          <select className="border p-3 rounded" value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
            <option value="percent">Percent (%)</option>
            <option value="flat">Flat (₹)</option>
          </select>

          <input className="border p-3 rounded" placeholder="Value" type="number"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />

          <input className="border p-3 rounded" type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />

          <input className="border p-3 rounded" placeholder="Max Uses (optional)" type="number"
            value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} />
        </div>

        <button onClick={createCoupon} className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg">
          Create Coupon
        </button>
      </div>

      {/* COUPON LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">All Coupons</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm">
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Expiry</th>
              <th>Uses Left</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((c: any) => (
              <tr key={c._id} className="border-b">
                <td className="py-3 font-bold">{c.code}</td>
                <td>{c.discountType}</td>
                <td>{c.discountValue}</td>
                <td>{new Date(c.expiresAt).toLocaleDateString()}</td>
                <td>{c.maxUses ? c.maxUses - (c.usedCount || 0) : "∞"}</td>
                <td>{c.active ? "🟢 Active" : "🔴 Inactive"}</td>

                <td className="flex gap-2 py-3">
                  <button onClick={() => toggleCoupon(c._id)}
                    className="px-3 py-1 bg-yellow-400 text-white rounded">
                    Toggle
                  </button>

                  <button onClick={() => deleteCoupon(c._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded">
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </MainLayout>
  );
}
