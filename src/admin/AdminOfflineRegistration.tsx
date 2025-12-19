import { useEffect, useState } from "react";
import { ClipboardList, IndianRupee } from "lucide-react";
import { AdminAPI } from "@/services/api";

export default function AdminOfflineRegistration() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    planId: "",
    planName:"",
    examLimit: "",
    paymentMode: "",
    amount: "",
    paymentDate: "",
    referenceNo: "",
    remark: "",
    generateInvoice: true,
  });

  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    AdminAPI.getPlans().then(res => {
      setPlans(res.data.plans || []);
    });
  }, []);

  const submitForm = () => {
    if (!form.name || !form.mobile || !form.planId || !form.amount) {
      alert("Please fill all mandatory fields");
      return;
    }

    // API CALL PLACEHOLDER
    console.log({
      ...form,
      registration_source: "offline",
      payment_mode: "offline",
    });

    alert("Offline registration created successfully");
  };

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Offline Registration
        </h1>
        <p className="text-gray-500 mt-1">
          Manually register candidates with offline payment
        </p>
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
        <ClipboardList size={14} />
        OFFLINE REGISTRATION
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow p-6 space-y-6">

        {/* Candidate Info */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Candidate Details</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Full Name *"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Mobile Number *"
              className="input"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            />
            <input
              placeholder="Email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="City"
              className="input"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
        </section>

        {/* Plan */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Plan Details</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              className="input"
              value={form.planId}
              onChange={(e) => {
                const plan = plans.find(p => p._id === e.target.value);
                setForm({
                  ...form,
                  planId: plan._id,
                  planName: plan.planName,
                  examLimit: plan.exams,
                  amount: plan.sellingPrice,
                }); 
              }}
            >
              <option value="">Select Plan</option>
              {plans.map(plan => (
                <option key={plan._id} value={plan._id}>
                  {plan.planName} – ₹{plan.sellingPrice}
                </option>
              ))}
            </select>


            <input
              className="input"
              value={form.examLimit}
              disabled
            />
          </div>
        </section>

        {/* Payment */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <IndianRupee size={18} />
            Offline Payment
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              className="input"
              value={form.paymentMode}
              onChange={(e) =>
                setForm({ ...form, paymentMode: e.target.value })
              }
            >
              <option value="">Payment Mode *</option>
              <option>Cash</option>
              <option>UPI</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
            </select>

            <input
              type="number"
              placeholder="Amount Paid *"
              className="input"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
            />

            <input
              type="date"
              className="input"
              value={form.paymentDate}
              onChange={(e) =>
                setForm({ ...form, paymentDate: e.target.value })
              }
            />

            <input
              placeholder="Reference No (optional)"
              className="input"
              value={form.referenceNo}
              onChange={(e) =>
                setForm({ ...form, referenceNo: e.target.value })
              }
            />
          </div>

          <textarea
            placeholder="Remark / Notes *"
            className="input mt-4"
            rows={3}
            value={form.remark}
            onChange={(e) =>
              setForm({ ...form, remark: e.target.value })
            }
          />
        </section>

        {/* Invoice */}
        <section className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.generateInvoice}
            onChange={() =>
              setForm({
                ...form,
                generateInvoice: !form.generateInvoice,
              })
            }
          />
          <label className="text-sm font-medium">
            Generate Invoice for this offline payment
          </label>
        </section>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={submitForm}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
          >
            Save Offline Registration
          </button>

          <button
            className="px-6 py-3 bg-gray-200 rounded-lg"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
