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
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [form, setForm] = useState({
    code: "",
    expiresAt: "",
    discountType: "percent",
    discountValue: 0,
    applicablePlans: [] as string[],
    planRules: [] as any[], // ⭐ plan-wise rules
    maxUses: 100,          // ⭐ NEW
    oneTime: false,
  });

  /* ---------------- LOAD DATA ---------------- */

  const loadData = () => {
    AdminAPI.getCouponAnalytics().then((res) =>
      setAnalytics(res.data.analytics || [])
    );

    AdminAPI.getCoupons().then((res) =>
      setCoupons(res.data.coupons || [])
    );
  };

  useEffect(() => {
    AdminAPI.getPlans().then((res) =>
      setPlans(res.data.plans || [])
    );
    loadData();
  }, []);

  /* ---------------- CREATE COUPON ---------------- */

  const createCoupon = async (e: any) => {
    e.preventDefault();

    if (!form.code || !form.expiresAt) {
      alert("Coupon code & expiry required");
      return;
    }

    await AdminAPI.createCoupon(form);

    setForm({
      code: "",
      expiresAt: "",
      discountType: "percent",
      discountValue: 0,
      applicablePlans: [],
      planRules: [],
      maxUses: 100,
      oneTime: false
    });

    loadData();
  };

  /* ---------------- ACTIONS ---------------- */

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await AdminAPI.deleteCoupon(id);
    loadData();
  };

  const toggleCoupon = async (id: string) => {
    await AdminAPI.toggleCoupon(id);
    loadData();
  };

  /* ---------------- ANALYTICS ---------------- */

  const totalUsed = analytics.reduce(
    (sum: number, d: any) => sum + d.usedCount,
    0
  );
  const totalDiscount = analytics.reduce(
    (sum: number, d: any) => sum + d.totalDiscount,
    0
  );
  const totalImpact = analytics.reduce(
    (sum: number, d: any) => sum + d.revenueImpact,
    0
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Coupon Management</h1>

      {/* ================= CREATE COUPON ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Create Coupon</h2>

        <form
          onSubmit={createCoupon}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {/* CODE */}
          <input
            className="border p-3 rounded"
            placeholder="Coupon Code"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
            required
          />

          {/* EXPIRY */}
          <input
            type="date"
            className="border p-3 rounded"
            value={form.expiresAt}
            onChange={(e) =>
              setForm({ ...form, expiresAt: e.target.value })
            }
            required
          />
          {/* ONE-TIME TOGGLE */}
          <div className="flex items-center gap-3 md:col-span-4">
            <input
              type="checkbox"
              checked={form.oneTime}
              onChange={(e) => {
                const isOneTime = e.target.checked;

                setForm({
                  ...form,
                  oneTime: isOneTime,
                  maxUses: isOneTime ? 1 : 100,
                  expiresAt: isOneTime
                    ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 10)
                    : form.expiresAt,
                });
              }}
            />

            <span className="text-sm font-medium">
              One-Time Promo (Valid for 2 Days, Single Use)
            </span>
          </div>

          {/* GLOBAL DISCOUNT (fallback) */}
          <select
            className="border p-3 rounded"
            value={form.discountType}
            onChange={(e) =>
              setForm({ ...form, discountType: e.target.value })
            }
          >
            <option value="percent">Global %</option>
            <option value="flat">Global ₹</option>
          </select>

          <input
            type="number"
            className="border p-3 rounded"
            placeholder="Global Discount"
            value={form.discountValue}
            onChange={(e) =>
              setForm({ ...form, discountValue: Number(e.target.value) })
            }
          />

          {/* APPLICABLE PLANS */}
          <div className="md:col-span-4">
            <label className="text-sm font-medium">
              Applicable Plans
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {plans.map((p: any) => (
                <label
                  key={p._id}
                  className="flex items-center gap-2 border rounded-lg px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={form.applicablePlans.includes(p._id)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...form.applicablePlans, p._id]
                        : form.applicablePlans.filter(
                          (id) => id !== p._id
                        );
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

          {/* PLAN-WISE RULES */}
          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold mt-4 mb-2">
              Plan-wise Discount Rules (Override)
            </h3>

            <div className="space-y-3">
              {plans.map((p: any) => {
                const rule = form.planRules.find(
                  (r: any) => r.planId === p._id
                );

                return (
                  <div
                    key={p._id}
                    className="grid grid-cols-5 gap-3 items-center border rounded-lg p-3"
                  >
                    <span className="text-sm font-medium">
                      {p.exams} Exams
                    </span>

                    <select
                      className="border p-2 rounded"
                      value={rule?.discountType || "percent"}
                      onChange={(e) => {
                        const updated = form.planRules.filter(
                          (r: any) => r.planId !== p._id
                        );
                        updated.push({
                          planId: p._id,
                          discountType: e.target.value,
                          discountValue: rule?.discountValue || 0,
                        });
                        setForm({ ...form, planRules: updated });
                      }}
                    >
                      <option value="percent">%</option>
                      <option value="flat">₹</option>
                    </select>

                    <input
                      type="number"
                      className="border p-2 rounded"
                      placeholder="Value"
                      value={rule?.discountValue || ""}
                      onChange={(e) => {
                        const updated = form.planRules.filter(
                          (r: any) => r.planId !== p._id
                        );
                        updated.push({
                          planId: p._id,
                          discountType:
                            rule?.discountType || "percent",
                          discountValue: Number(e.target.value),
                        });
                        setForm({ ...form, planRules: updated });
                      }}
                    />

                    <input
                      type="checkbox"
                      checked={!!rule}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [
                            ...form.planRules,
                            {
                              planId: p._id,
                              discountType: "percent",
                              discountValue: 0,
                            },
                          ]
                          : form.planRules.filter(
                            (r: any) => r.planId !== p._id
                          );
                        setForm({ ...form, planRules: updated });
                      }}
                    />

                    <span className="text-xs text-gray-500">
                      Enable
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="bg-emerald-600 text-white rounded px-4 py-3 md:col-span-4">
            Create Coupon
          </button>
        </form>
      </div>

      {/* ================= ANALYTICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Stat title="Total Times Used" value={totalUsed} />
        <Stat title="Discount Given" value={`₹${totalDiscount}`} red />
        <Stat title="Revenue Impact" value={`₹${totalImpact}`} green />
      </div>

      {/* ================= BAR CHART ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Usage by Coupon
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics}>
            <XAxis dataKey="coupon" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="usedCount" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= COUPON LIST ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">All Coupons</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-gray-600">
              <th className="py-3">Coupon</th>
              <th className="py-3">Discount</th>
              <th className="py-3">Plans</th>
              <th className="py-3">Expires</th>
              <th className="py-3">Active</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((c: any) => (
              <tr key={c._id} className="border-b align-top">
                <td className="py-3 font-semibold">{c.code}</td>

                <td className="py-3 text-sm">
                  {c.planRules?.length > 0
                    ? "Plan-wise"
                    : `${c.discountValue}${c.discountType === "percent" ? "%" : "₹"
                    }`}
                </td>

                <td className="py-3 text-sm">
                  {c.planRules?.length > 0 ? (
                    c.planRules.map((r: any) => (
                      <div key={r.planId._id}>
                        {r.planId.exams} Exams → {r.discountValue}
                        {r.discountType === "percent" ? "%" : "₹"}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500">
                      Global Discount
                    </span>
                  )}
                </td>

                <td className="py-3">
                  {c.expiresAt?.slice(0, 10)}
                </td>

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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= SMALL STAT COMPONENT ================= */

function Stat({
  title,
  value,
  red,
  green,
}: {
  title: string;
  value: any;
  red?: boolean;
  green?: boolean;
}) {
  return (
    <div className="p-6 bg-white rounded-xl shadow text-center">
      <p className="text-gray-600 text-sm">{title}</p>
      <p
        className={`text-3xl font-bold ${red
            ? "text-red-500"
            : green
              ? "text-emerald-600"
              : ""
          }`}
      >
        {value}
      </p>
    </div>
  );
}
