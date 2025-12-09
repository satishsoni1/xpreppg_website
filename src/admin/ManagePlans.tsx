import { useEffect, useState } from "react";
import { AdminAPI } from "@/services/api";

export default function ManagePlans() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    exams: "",
    actualPrice: "",
    sellingPrice: "",
  });
  const [editingId, setEditingId] = useState(null);

  const loadPlans = () => {
    AdminAPI.getPlans().then((res) => setPlans(res.data.plans || []));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const savePlan = () => {
    if (!form.exams || !form.actualPrice || !form.sellingPrice) return;
    const payload = {
      exams: Number(form.exams),
      actualPrice: Number(form.actualPrice),
      sellingPrice: Number(form.sellingPrice),
    };
    if (editingId) {
      AdminAPI.updatePlan(editingId, payload).then(() => {
        resetForm();
        loadPlans();
      });
    } else {
      AdminAPI.createPlan(payload).then(() => {
        resetForm();
        loadPlans();
      });
    }
  };
  const resetForm = () => {
    setForm({ exams: "", actualPrice: "", sellingPrice: "" });
    setEditingId(null);
  };

  const deletePlan = (id: string) => {
    if (!confirm("Delete this plan?")) return;
    AdminAPI.deletePlan(id).then(loadPlans);
  };

  const startEdit = (plan: any) => {
    console.log(plan);
    console.log(editingId);
    setEditingId(plan._id);
    console.log(editingId);
    setForm({
      exams: plan.exams,
      actualPrice: plan.actualPrice,
      sellingPrice: plan.sellingPrice,
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">💰 Manage Pricing Plans</h2>

      {/* Add / Edit Form */}
      <div className="bg-white shadow p-6 rounded-lg mb-8 max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          {editingId ? "✏️ Edit Plan" : "➕ Add New Plan"}
        </h3>

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Number of exams"
          value={form.exams}
          onChange={(e) => setForm({ ...form, exams: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Actual Price"
          value={form.actualPrice}
          onChange={(e) => setForm({ ...form, actualPrice: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Selling Price"
          value={form.sellingPrice}
          onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
        />

        <button
          onClick={savePlan}
          className="w-full py-2 rounded bg-blue-600 text-white font-semibold"
        >
          {editingId ? "Update Plan" : "Add Plan"}
        </button>
      </div>

      {/* Plans Table */}
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-3 text-left">Exams</th>
            <th className="p-3 text-left">Actual Price</th>
            <th className="p-3 text-left">Selling Price</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p: any) => (
            <tr key={p.id} className="border-b">
              <td className="p-3">{p.exams}</td>
              <td className="p-3">₹{p.actualPrice}</td>
              <td className="p-3 font-semibold text-primary">₹{p.sellingPrice}</td>
              <td className="p-3 flex gap-3">
                <button
                  onClick={() => startEdit(p)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => deletePlan(p._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
