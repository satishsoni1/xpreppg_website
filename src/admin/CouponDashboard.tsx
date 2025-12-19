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
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    AdminAPI.getPlans().then(res =>
      setPlans(res.data.plans || [])
    );
  }, []);

  const [form, setForm] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    expiresAt: "",
    applicablePlans: [],
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

    setForm({ code: "", discountType: "percent", discountValue: "", expiresAt: "", applicablePlans: [] });
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
          <div className="md:col-span-4">
            <label className="text-sm font-medium">Applicable Plans</label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {plans.map((p: any) => (
                <label
                  key={p._id}
                  className="flex items-center gap-2 border rounded-lg px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={form.applicablePlans?.includes(p._id)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...(form.applicablePlans || []), p._id]
                        : form.applicablePlans.filter((id: string) => id !== p._id);

                      setForm({ ...form, applicablePlans: updated });
                    }}
                  />
                  <span className="text-sm">
                    {p.exams} Exams – ₹{p.sellingPrice}
                  </span>
                </label>
              ))}
            </div>
          </div>

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
              <th className="py-3">Plans</th> {/* ⭐ NEW */}
              <th className="py-3">Expires</th>
              <th className="py-3">Active</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((c: any) => {
              const plans = c.applicablePlans || [];
              const visiblePlans = plans.slice(0, 2);
              const extraCount = plans.length - visiblePlans.length;

              return (
                <tr key={c._id} className="border-b align-top">
                  <td className="py-3 font-semibold">{c.code}</td>

                  <td className="py-3 capitalize">{c.discountType}</td>

                  <td className="py-3">
                    {c.discountType === "percent"
                      ? `${c.discountValue}%`
                      : `₹${c.discountValue}`}
                  </td>

                  {/* PLANS COLUMN */}
                  <td className="py-3">
                    {plans.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {visiblePlans.map((p: any) => (
                          <span
                            key={p._id}
                            className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                          >
                            {p.exams} exams
                          </span>
                        ))}

                        {extraCount > 0 && (
                          <span
                            title={plans.map((p: any) => p.exams).join(" exams, ")}
                            className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600 cursor-help"
                          >
                            +{extraCount} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-red-500">
                        No plans assigned
                      </span>
                    )}
                  </td>

                  <td className="py-3">{c.expiresAt?.slice(0, 10)}</td>

                  <td className="py-3">
                    {c.active ? (
                      <span className="text-emerald-600 font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleCoupon(c._id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => deleteCoupon(c._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
