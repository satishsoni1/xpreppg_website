import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import { WebAPI, CouponAPI, PaymentAPI } from "@/services/api";
import { openRazorpay } from "@/lib/razorpay";

export default function Enroll() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const mobile = localStorage.getItem("x_user_mobile");
  const name = localStorage.getItem("x_user_name");
  const email = localStorage.getItem("x_user_email");

  const [loading, setLoading] = useState(false);

  // Prefill Data
  const prefill = useMemo(
    () => ({
      plan: sp.get("plan") || "",
      exams: Number(sp.get("exams") || 1),
      amount: Number(sp.get("amount") || 0),
      original: Number(sp.get("original") || 0),
    }),
    [sp]
  );

  const [form, setForm] = useState({
    fullName: name || "",
    email: email || "",
    phone: mobile || "",
    studentCount:
      prefill.plan.toLowerCase().includes("group of 5")
        ? 5
        : prefill.plan.toLowerCase().includes("group of 3")
        ? 3
        : 1,
    plan: prefill.plan,
    exams: prefill.exams,
    amount: prefill.amount,
  });

  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);
  const [finalAmount, setFinalAmount] = useState(prefill.amount);

  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // -------------------------------------------------------
  // LOAD USER DETAILS ONCE
  // -------------------------------------------------------
  useEffect(() => {
    if (!mobile || !name || !email) {
      alert("Please register first.");
      return navigate("/");
    }

    const loadUser = async () => {
      const res = await WebAPI.getUser(mobile);
      if (res.data?.status) {
        const u = res.data.user;
        setForm((prev) => ({
          ...prev,
          fullName: u.name,
          email: u.email,
          phone: u.mobile,
        }));
      }
    };

    loadUser();
  }, []);

  // -------------------------------------------------------
  // APPLY COUPON
  // -------------------------------------------------------
  const applyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");

    if (!discountCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);

    try {
      const res = await CouponAPI.validate({
        code: discountCode,
        amount: form.amount,
      });

      if (!res.data.valid) {
        setCouponError("Invalid or expired coupon.");
        setCouponLoading(false);
        return;
      }

      let discount = 0;
      const { discountType, discountValue } = res.data;

      if (discountType === "percent") {
        discount = (form.amount * discountValue) / 100;
      } else {
        discount = discountValue;
      }

      if (discount > form.amount) discount = form.amount;

      setDiscountApplied(discount);
      setFinalAmount(form.amount - discount);
      setCouponSuccess(`Coupon applied! You saved ₹${discount}.`);
    } catch {
      setCouponError("Unable to apply coupon. Try again.");
    }

    setCouponLoading(false);
  };

  // Remove coupon
  const removeCoupon = () => {
    setDiscountCode("");
    setDiscountApplied(0);
    setFinalAmount(form.amount);
    setCouponSuccess("Coupon removed.");
  };

  // -------------------------------------------------------
  // PAYMENT FLOW
  // -------------------------------------------------------
  const payAndGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const invoiceId = String(Date.now());

    try {
      // A. Create order
      const orderRes = await PaymentAPI.createOrder({
        mobile: form.phone,
        amount: finalAmount,
        originalAmount: form.amount,
        discount: discountApplied,
        discountCode: discountCode,
        plan: form.plan,
        exams: form.exams,
      });

      // FREE COUPON FLOW
      if (orderRes.data.free) {
        return navigate(
          `/invoice/${invoiceId}?${new URLSearchParams({
            name: form.fullName,
            email: form.email,
            phone: form.phone,
            plan: form.plan,
            exams: String(form.exams),
            originalAmount: String(form.amount),
            discount: String(discountApplied),
            amount: "0",
            invoiceId,
            paymentId: "FREE-COUPON",
            courseCode: orderRes.data.courseCode,
            status: "paid",
          })}`
        );
      }

      // B. Paid → Razorpay Popup
      const { key, orderId, amount } = orderRes.data;

      await openRazorpay({
        key,
        amount: amount * 100,
        order_id: orderId,
        name: "XPrepPG",
        description: `${form.plan} - ${form.exams} exam(s)`,

        // Razorpay Success Handler
        handler: async (resp) => {
          const verifyRes = await PaymentAPI.verifyPayment({
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_signature: resp.razorpay_signature,
            mobile: form.phone,
            plan: form.plan,
            exams: form.exams,
            amount: finalAmount,
            originalAmount: form.amount,
            discount: discountApplied,
            discountCode,
          });

          return navigate(
            `/invoice/${invoiceId}?${new URLSearchParams({
              name: form.fullName,
              email: form.email,
              phone: form.phone,
              plan: form.plan,
              exams: String(form.exams),
              originalAmount: String(form.amount),
              discount: String(discountApplied),
              amount: String(finalAmount),
              discountCode,
              invoiceId,
              paymentId: resp.razorpay_payment_id,
              courseCode: verifyRes.data.courseCode,
              status: verifyRes.data.status ? "paid" : "failed",
            })}`
          );
        },

        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },

        theme: { color: "#10B981" },
      });
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <MainLayout>
      <section className="py-2 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto bg-white p-8">
          <h1 className="text-3xl font-bold mb-2">Enroll</h1>
          <p className="text-gray-600 mb-8">
            Your details are auto-filled from registration. Complete payment to
            generate invoice.
          </p>

          <form onSubmit={payAndGenerate} className="grid grid-cols-1 gap-6">
            {/* USER DETAILS */}
            <UserInfoSection form={form} />

            {/* COUPON SECTION */}
            <CouponSection
              form={form}
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
              couponLoading={couponLoading}
              couponError={couponError}
              couponSuccess={couponSuccess}
              discountApplied={discountApplied}
              finalAmount={finalAmount}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
            />

            {/* PLAN INFO */}
            <PlanSection form={form} finalAmount={finalAmount} />

            {/* PAY BUTTON */}
            <button
              disabled={loading}
              className="mt-2 w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:opacity-90 disabled:opacity-70"
            >
              {loading ? "Processing..." : "Pay & Generate Invoice"}
            </button>
          </form>
        </div>
      </section>
    </MainLayout>
  );
}

/* ---------------------------------------------------------
   SUB COMPONENTS (Cleaner UI)
---------------------------------------------------------- */

function UserInfoSection({ form }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {["fullName", "email"].map((field) => (
        <div key={field}>
          <label className="text-sm text-gray-700">
            {field === "fullName" ? "Full Name" : "Email"}
          </label>
          <input
            className="mt-1 w-full rounded-xl border p-3 bg-gray-50"
            value={form[field]}
            readOnly
          />
        </div>
      ))}

      <div className="md:col-span-2">
        <label className="text-sm text-gray-700">Phone</label>
        <input
          className="mt-1 w-full rounded-xl border p-3 bg-gray-50"
          value={form.phone}
          readOnly
        />
      </div>
    </div>
  );
}

function CouponSection({
  form,
  discountCode,
  setDiscountCode,
  couponLoading,
  couponError,
  couponSuccess,
  discountApplied,
  finalAmount,
  applyCoupon,
  removeCoupon,
}) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border shadow-sm">
      <label className="text-sm font-semibold text-gray-700">
        Have a Coupon?
      </label>

      <div className="flex gap-3 mt-3">
        <div className="relative w-full">
          <input
            className={`w-full rounded-xl border p-3 bg-white pr-10 transition-all ${couponError
              ? "border-red-400"
              : couponSuccess
              ? "border-emerald-500"
              : "border-gray-300"
            }`}
            placeholder="Enter discount code"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value.toUpperCase());
            }}
          />

          {couponLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {!discountApplied ? (
          <button
            type="button"
            onClick={applyCoupon}
            disabled={couponLoading}
            className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold"
          >
            Apply
          </button>
        ) : (
          <button
            type="button"
            onClick={removeCoupon}
            className="px-5 py-3 rounded-xl bg-red-500 text-white font-semibold"
          >
            Remove
          </button>
        )}
      </div>

      {couponError && (
        <p className="mt-2 text-sm text-red-600 font-medium">❌ {couponError}</p>
      )}

      {couponSuccess && (
        <p className="mt-2 text-sm text-emerald-600 font-semibold">
          🎉 {couponSuccess}
        </p>
      )}

      {discountApplied > 0 && (
        <div className="mt-4 p-4 bg-white rounded-xl border shadow-sm">
          <div className="flex justify-between text-gray-700">
            <span>Original Amount</span>
            <span>₹{form.amount}</span>
          </div>
          <div className="flex justify-between text-green-600 font-semibold mt-1">
            <span>Discount</span>
            <span>- ₹{discountApplied}</span>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between font-bold text-lg">
            <span>Final Amount</span>
            <span className="text-emerald-700">₹{finalAmount}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanSection({ form, finalAmount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div>
        <label className="text-sm text-gray-700">Plan</label>
        <input className="mt-1 w-full rounded-xl border p-3 bg-gray-50" value={form.plan} readOnly />
      </div>

      <div>
        <label className="text-sm text-gray-700">Exams</label>
        <input className="mt-1 w-full rounded-xl border p-3 bg-gray-50" value={form.exams} readOnly />
      </div>

      <div>
        <label className="text-sm text-gray-700">Amount (₹)</label>
        <input className="mt-1 w-full rounded-xl border p-3 bg-gray-50" value={finalAmount} readOnly />
      </div>
    </div>
  );
}
