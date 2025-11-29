import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { openRazorpay } from "../lib/razorpay";
import MainLayout from "@/layouts/MainLayout";

export default function Enroll() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const mobile = localStorage.getItem("x_user_mobile");
  const name = localStorage.getItem("x_user_name");
  const email = localStorage.getItem("x_user_email");

  // Pre-filled plan from pricing page
  const prefill = useMemo(
    () => ({
      plan: sp.get("plan") || "",
      exams: Number(sp.get("exams") || 1),
      amount: Number(sp.get("amount") || 0),
      original: Number(sp.get("original") || 0),
    }),
    [sp]
  );

  // Main form state
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

  // Coupon UX states
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);
  const [finalAmount, setFinalAmount] = useState(prefill.amount);

  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Load registration info
  useEffect(() => {
    if (!mobile || !name || !email) {
      alert("Please register first.");
      return navigate("/");
    }

    const fetchUser = async () => {
      const res = await axios.get(
        `https://api.xpreppg.com/api/web/user/${mobile}`
      );  

      if (res.data.status) {
        const u = res.data.user;
        setForm((prev) => ({
          ...prev,
          fullName: u.name,
          email: u.email,
          phone: u.mobile,
        }));
      }
    };

    fetchUser();
  }, []);

  // Apply Coupon
  const applyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");

    if (!discountCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);

    try {
      const res = await axios.post(
        "https://api.xpreppg.com/api/coupon/validate",
        {
          code: discountCode,
          amount: form.amount,
        }
      );

      if (!res.data.valid) {
        setCouponError("Invalid or expired coupon.");
        setCouponLoading(false);
        return;
      }

      let discount = 0;

      if (res.data.discountType === "percent") {
        discount = (form.amount * res.data.discountValue) / 100;
      } else {
        discount = res.data.discountValue;
      }

      if (discount > form.amount) discount = form.amount;

      setDiscountApplied(discount);
      setFinalAmount(form.amount - discount);
      setCouponSuccess(`Coupon applied! You saved ₹${discount}.`);
    } catch (err) {
      setCouponError("Unable to apply coupon. Try again.");
    }

    setCouponLoading(false);
  };

  // Remove Coupon
  const removeCoupon = () => {
    setDiscountCode("");
    setDiscountApplied(0);
    setFinalAmount(form.amount);
    setCouponSuccess("Coupon removed.");
    setCouponError("");
  };

  // Handle Payment
  const payAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const invoiceId = String(Date.now());

    try {
      // Step A: Create order
      const orderRes = await axios.post(
        "https://api.xpreppg.com/api/pay/create-order",
        {
          mobile: form.phone,
          amount: finalAmount,
          originalAmount: form.amount,
          discount: discountApplied,
          discountCode: discountCode || "",
          plan: form.plan,
          exams: form.exams,
        }
      );

      // FREE enrollment
      if (orderRes.data.free === true) {
        navigate(
          `/invoice/${invoiceId}?${new URLSearchParams({
            name: form.fullName,
            email: form.email,
            phone: form.phone,
            plan: form.plan,
            exams: String(form.exams),
            amount: "0",
            discount: String(form.amount),
            originalAmount: String(form.amount),
            invoiceId,
            paymentId: "FREE-COUPON",
            courseCode: orderRes.data.courseCode,
            status: "paid",
          }).toString()}`
        );
        return;
      }

      // Razorpay normal flow
      const { key, orderId, amount } = orderRes.data;

      await openRazorpay({
        key,
        amount: amount * 100,
        name: "XPrepPG",
        description: `${form.plan} - ${form.exams} exam(s)`,

        handler: async (resp: any) => {
          const verifyRes = await axios.post(
            "https://api.xpreppg.com/api/pay/verify-payment",
            {
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_signature: resp.razorpay_signature,
              mobile: form.phone,
              plan: form.plan,
              exams: form.exams,
              amount: finalAmount,
              originalAmount: form.amount,
              discount: discountApplied,
              discountCode: discountCode || "", // discounted
            }
          );

          // navigate(
          //   `/invoice/${invoiceId}?${new URLSearchParams({
          //     name: form.fullName,
          //     email: form.email,
          //     phone: form.phone,
          //     plan: form.plan,
          //     exams: String(form.exams),
          //     amount: String(finalAmount),
          //     invoiceId,
          //     paymentId: resp.razorpay_payment_id,
          //     courseCode: verifyRes.data.courseCode,
          //     status: verifyRes.data.status ? "paid" : "failed",
          //   }).toString()}`
          navigate(
            `/invoice/${invoiceId}?${new URLSearchParams({
              name: form.fullName,
              email: form.email,
              phone: form.phone,
              plan: form.plan,
              exams: String(form.exams),
              originalAmount: String(form.amount),
              discount: String(discountApplied),
              amount: String(finalAmount),
              discountCode: discountCode || "",
              invoiceId,
              paymentId: resp.razorpay_payment_id,
              courseCode: verifyRes.data.courseCode,
              status: verifyRes.data.status ? "paid" : "failed",
            }).toString()}`
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

  return (
    <MainLayout>
      <section id="enroll" className="py-2 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto bg-white p-8">
          <h1 className="text-3xl font-bold mb-2">Enroll</h1>
          <p className="text-gray-600 mb-8">
            Your details are auto-filled from registration. Complete payment to
            generate invoice.
          </p>

          <form onSubmit={payAndGenerate} className="grid grid-cols-1 gap-6">
            {/* User details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-700">Full Name</label>
                <input
                  className="mt-1 w-full rounded-xl border p-3 bg-gray-50"
                  value={form.fullName}
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Email</label>
                <input
                  className="mt-1 w-full rounded-xl border p-3 bg-gray-50"
                  value={form.email}
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">Phone</label>
              <input
                className="mt-1 w-full rounded-xl border p-3 bg-gray-50"
                value={form.phone}
                readOnly
              />
            </div>

            {/* PREMIUM COUPON UX */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border shadow-sm">
              <label className="text-sm font-semibold text-gray-700">
                Have a Coupon?
              </label>

              <div className="flex gap-3 mt-3">
                <div className="relative w-full">
                  <input
                    className={`w-full rounded-xl border p-3 bg-white pr-10 transition-all duration-200 ${couponError
                        ? "border-red-400"
                        : couponSuccess
                          ? "border-emerald-500"
                          : "border-gray-300"
                      }`}
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      setCouponError("");
                      setCouponSuccess("");
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
                    className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Apply
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="px-5 py-3 rounded-xl bg-red-500 text-white font-semibold shadow hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Error */}
              {couponError && (
                <p className="mt-2 text-sm text-red-600 font-medium animate-fadeIn">
                  ❌ {couponError}
                </p>
              )}

              {/* Success */}
              {couponSuccess && (
                <p className="mt-2 text-sm text-emerald-600 font-semibold animate-fadeIn">
                  🎉 {couponSuccess}
                </p>
              )}

              {/* Amount Breakdown */}
              {discountApplied > 0 && (
                <div className="mt-4 p-4 bg-white rounded-xl border shadow-sm animate-slideUp">
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

            {/* Plan details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-sm text-gray-700">Plan</label>
                <input
                  className="mt-1 w-full rounded-xl border p-3 bg-gray-50"
                  value={form.plan}
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Exams</label>
                <input
                  className="mt-1 w-full rounded-xl border p-3 bg-gray-50"
                  value={form.exams}
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Amount (₹)</label>
                <input
                  className="mt-1 w-full rounded-xl border p-3 bg-gray-50"
                  value={finalAmount}
                  readOnly
                />
              </div>
            </div>

            {/* Pay button */}
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
