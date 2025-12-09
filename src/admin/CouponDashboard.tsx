import { useEffect, useState } from "react";
import { AdminAPI } from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminCouponDashboard() {
  const token = localStorage.getItem("admin_token");

  const [analytics, setAnalytics] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [form, setForm] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    expiresAt: "",
  });

  const loadData = () => {
    AdminAPI.getCouponAnalytics().then((res) =>
      setAnalytics(res.data.analytics || [])
    );

    AdminAPI.getCoupons().then((res) =>
      setCoupons(res.data.coupons || [])
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const createCoupon = async (e: any) => {
    e.preventDefault();

    await AdminAPI.createCoupon(form);

    setForm({ code: "", discountType: "percent", discountValue: "", expiresAt: "" });
    loadData();
  };

  const deleteCoupon = async (id: string) => {
    await AdminAPI.deleteCoupon(id);
    loadData();
  };

  const toggleCoupon = async (id: string) => {
    await AdminAPI.toggleCoupon(id);
    loadData();
  };

  const totalUsed = analytics.reduce((sum: any, d: any) => sum + d.usedCount, 0);
  const totalDiscount = analytics.reduce((sum: any, d: any) => sum + d.totalDiscount, 0);
  const totalImpact = analytics.reduce((sum: any, d: any) => sum + d.revenueImpact, 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Coupon Management</h1>

      {/* CREATE COUPON */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Create Coupon</h2>

        <form
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          onSubmit={createCoupon}
        >
          <input
            className="border p-3 rounded"
            placeholder="Coupon Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            required
          />

          <select
            className="border p-3 rounded"
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
          >
            <option value="percent">Percent (%)</option>
            <option value="flat">Flat Amount</option>
          </select>

          <input
            className="border p-3 rounded"
            placeholder="Value"
            type="number"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            required
          />

          <input
            type="date"
            className="border p-3 rounded"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            required
          />

          <button
            className="bg-emerald-600 text-white rounded px-4 py-3 md:col-span-4"
          >
            Create Coupon
          </button>
        </form>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">Total Times Used</p>
          <p className="text-3xl font-bold">{totalUsed}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">Discount Given</p>
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

      {/* COUPON LIST */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">All Coupons</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-gray-600">
              <th className="py-3">Coupon</th>
              <th className="py-3">Type</th>
              <th className="py-3">Value</th>
              <th className="py-3">Expires</th>
              <th className="py-3">Active</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((c: any) => (
              <tr key={c._id} className="border-b">
                <td className="py-3 font-semibold">{c.code}</td>
                <td>{c.discountType}</td>
                <td>{c.discountValue}</td>
                <td>{c.expiresAt?.slice(0, 10)}</td>
                <td>
                  {c.active ? (
                    <span className="text-emerald-600 font-semibold">Active</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Inactive</span>
                  )}
                </td>
                <td className="flex gap-3 py-3">
                  <button
                    onClick={() => toggleCoupon(c._id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => deleteCoupon(c._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
