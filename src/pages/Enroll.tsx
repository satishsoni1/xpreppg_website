import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { openRazorpay } from "../lib/razorpay";
import Navigation from "../components/Navigation";
import NavigationInner from "../components/NavigationInner";

export default function Enroll() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobile = localStorage.getItem("x_user_mobile");
  const name = localStorage.getItem("x_user_name");
  const email = localStorage.getItem("x_user_email");

  // Pre-filled from pricing page
  const prefill = useMemo(
    () => ({
      plan: sp.get("plan") || "",
      exams: Number(sp.get("exams") || 1),
      amount: Number(sp.get("amount") || 0),
      original: Number(sp.get("original") || 0),
    }),
    [sp]
  );

  // User + plan form state
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

  // Discount code state
  const [discountCode, setDiscountCode] = useState("");

  // 🔥 1️⃣ Auto-fill from backend (registration DB)
  useEffect(() => {
    if (!mobile || !name || !email) {
      alert("Please register first.");
      return navigate("/");
    }

    const fetchUser = async () => {
      const res = await axios.get(`https://api.xpreppg.com/api/web/user/${mobile}`);

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

  // 🔥 2️⃣ Payment & Enrollment
  const payAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const invoiceId = String(Date.now());

    try {
      // Step A → Request order from backend
      const orderRes = await axios.post(
        "https://api.xpreppg.com/api/pay/create-order",
        {
          mobile: form.phone,
          amount: form.amount,
          discountCode,
          plan: form.plan,
          exams: form.exams,
        }
      );

      // ⚡ FREE COURSE HANDLING (no Razorpay popup)
      if (orderRes.data.free === true) {
        navigate(
          `/invoice/${invoiceId}?${new URLSearchParams({
            name: form.fullName,
            email: form.email,
            phone: form.phone,
            plan: form.plan,
            exams: String(form.exams),
            amount: "0",
            invoiceId,
            paymentId: "FREE-COUPON",
            courseCode: orderRes.data.courseCode,
            status: "paid",
          }).toString()}`
        );
        return;
      }

      // Normal paid flow...
      const { key, orderId, amount } = orderRes.data;

      await openRazorpay({
        key,
        amount: amount * 100,
        name: "Smart Prep PG",
        description: `${form.plan} – ${form.exams} exam(s)`,

        handler: async (resp: any) => {
          // Step B → Verify payment
          const verifyRes = await axios.post(
            "https://api.xpreppg.com/api/pay/verify-payment",
            {
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_signature: resp.razorpay_signature,
              mobile: form.phone,
              plan: form.plan,
              exams: form.exams,
              amount: form.amount,
            }
          );

          navigate(
            `/invoice/${invoiceId}?${new URLSearchParams({
              name: form.fullName,
              email: form.email,
              phone: form.phone,
              plan: form.plan,
              exams: String(form.exams),
              amount: String(form.amount),
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
    <div className="min-h-screen bg-white">
      
      <NavigationInner />

      <section id="enroll" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto bg-white p-8">
          <h1 className="text-3xl font-bold mb-2">Enroll</h1>
          <p className="text-gray-600 mb-8">
            Your details are auto-filled from registration. Complete payment to generate invoice.
          </p>

          <form onSubmit={payAndGenerate} className="grid grid-cols-1 gap-5">
            {/* Auto-filled details */}
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

            {/* Discount Code */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Discount Code (optional)
              </label>
              <input
                className="mt-1 w-full rounded-xl border p-3"
                placeholder="Enter discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
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
                  value={form.amount}
                  readOnly
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="mt-2 w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:opacity-90 disabled:opacity-70"
            >
              {loading ? "Processing..." : "Pay & Generate Invoice"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
