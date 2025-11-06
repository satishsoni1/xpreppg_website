import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { openRazorpay } from "../lib/razorpay";
import Navigation from "../components/Navigation";

export default function Enroll() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const prefill = useMemo(() => ({
    plan: sp.get("plan") || "",
    exams: Number(sp.get("exams") || 1),
    amount: Number(sp.get("amount") || 0),
    original: Number(sp.get("original") || 0),
  }), [sp]);

  const [form, setForm] = useState({
    fullName: "satish soni",
    email: "sonisatish119@gmail.com",
    phone: "7208613316",
    studentCount: prefill.plan.toLowerCase().includes("group of 5") ? 5 : prefill.plan.toLowerCase().includes("group of 3") ? 3 : 1,
    plan: prefill.plan,
    exams: prefill.exams,
    amount: prefill.amount,
  });

  const payAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID as string;
    if (!key) {
      alert("Missing VITE_RAZORPAY_KEY_ID in .env");
      return;
    }

    setLoading(true);
    const invoiceId = `${Date.now()}`;

    try {
     
      await openRazorpay({
        key,
        amount: Math.round(form.amount * 100), // paise
        name: "Smart Prep PG",
        description: `${form.plan} – ${form.exams} exam(s)`,
        handler: (resp: any) => {
          const params = new URLSearchParams({
            ...form,
            amount: String(form.amount),
            exams: String(form.exams),
            invoiceId,
            paymentId: resp.razorpay_payment_id || "",
            status: "paid",
          });
          navigate(`/invoice/${invoiceId}?${params.toString()}`);
        },
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        notes: { plan: form.plan, exams: String(form.exams) },
        theme: { color: "#10B981" },
      });
    } catch (err) {
      console.error(err);
      alert("Payment failed to initialize. Try again.");
    } finally {
      setLoading(false);
      // const params = new URLSearchParams({
      //   ...form,
      //   amount: String(form.amount),
      //   exams: String(form.exams),
      //   invoiceId,
      //   paymentId: "",
      //   status: "paid",
      // });
      // navigate(`/invoice/${invoiceId}?${params.toString()}`);
    }
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <section id="enroll" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto bg-white  p-8">
          <h1 className="text-3xl font-bold mb-2">Enroll</h1>
          <p className="text-gray-600 mb-8">Complete your details, pay securely, and we'll generate a sample invoice.</p>
          <form onSubmit={payAndGenerate} className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input required className="mt-1 w-full rounded-xl border p-3" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" required className="mt-1 w-full rounded-xl border p-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input required className="mt-1 w-full rounded-xl border p-3" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Students</label>
                <input type="number" min={1} className="mt-1 w-full rounded-xl border p-3" value={form.studentCount} onChange={(e) => setForm({ ...form, studentCount: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan</label>
                <input className="mt-1 w-full rounded-xl border p-3 bg-gray-50" value={form.plan} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Exams</label>
                <input className="mt-1 w-full rounded-xl border p-3 bg-gray-50" value={form.exams} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                <input className="mt-1 w-full rounded-xl border p-3 bg-gray-50" value={form.amount} readOnly />
              </div>
            </div>
            <button disabled={loading} className="mt-2 w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:opacity-90 disabled:opacity-70">
              {loading ? "Processing..." : "Pay & Generate Invoice"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}