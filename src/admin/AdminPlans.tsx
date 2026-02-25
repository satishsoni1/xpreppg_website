import { useState, useEffect } from "react";
import { AdminAPI } from "@/services/adminApi";
import { Plus, Package, Save, Loader2, Eye, EyeOff } from "lucide-react"; // Replaced Trash2 with Eye/EyeOff

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Form State
  const [form, setForm] = useState({
    name: "",
    exams_count: 1,
    selling_price: "",
    original_price: ""
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await AdminAPI.getPlans();
      if (res.status) setPlans(res.plans);
    } catch(err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setCreating(true);
    const res = await AdminAPI.createPlan(form);
    setCreating(false);
    
    if (res.status) {
      setForm({ name: "", exams_count: 1, selling_price: "", original_price: "" });
      fetchPlans();
    } else {
      alert(res.message);
    }
  };

  // NEW: Reusable toggle handler for both hiding and unhiding
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? "activate" : "hide";
    
    if(!window.confirm(`Are you sure you want to ${actionText} this plan?`)) return;
    
    const res = await AdminAPI.togglePlan(id, newStatus);
    if(res.status) {
      fetchPlans(); // Refresh the list
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Package className="text-primary" /> Plan Management
      </h1>

      {/* CREATE FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h3 className="font-bold text-gray-800 mb-4">Create New Package</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Plan Name</label>
            <input 
              required
              placeholder="e.g. Gold Pack (5 Exams)" 
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500" 
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Exams Count</label>
            <input 
              required
              type="number"
              placeholder="1" 
              className="w-full border p-2.5 rounded-lg" 
              value={form.exams_count}
              onChange={e => setForm({...form, exams_count: Number(e.target.value)})}
            />
          </div>

          <div>
             <label className="text-xs font-bold text-gray-500 uppercase">Selling Price</label>
             <input 
              required
              type="number"
              placeholder="₹ 999" 
              className="w-full border p-2.5 rounded-lg font-bold text-primary" 
              value={form.selling_price}
              onChange={e => setForm({...form, selling_price: e.target.value})}
            />
          </div>

          <div>
             <label className="text-xs font-bold text-gray-500 uppercase">Original Price</label>
             <input 
              type="number"
              placeholder="₹ 1999" 
              className="w-full border p-2.5 rounded-lg text-gray-400 line-through" 
              value={form.original_price}
              onChange={e => setForm({...form, original_price: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={creating}
            className="md:col-span-5 bg-gradient-to-r from-primary to-primaryDark text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex justify-center items-center gap-2"
          >
            {creating ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Plan
          </button>
        </form>
      </div>

      {/* PLANS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            // Apply a grayed-out background and lower opacity if the plan is inactive
            className={`rounded-xl shadow-sm border p-6 transition group ${
              plan.is_active 
                ? "bg-white border-gray-200 hover:shadow-md" 
                : "bg-gray-50 border-gray-200 opacity-70"
            }`}
          >
             <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      plan.is_active ? "bg-blue-50 text-blue-600" : "bg-gray-200 text-gray-500"
                    }`}>
                       {plan.exams_count}
                    </div>
                    {/* Status Badge */}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      plan.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}>
                      {plan.is_active ? "Active" : "Hidden"}
                    </span>
                </div>
                
                {/* Toggle Visibility Button */}
                <button 
                  onClick={() => handleToggleStatus(plan.id, plan.is_active)} 
                  title={plan.is_active ? "Hide Plan" : "Activate Plan"}
                  className={`p-2 rounded-lg transition ${
                    plan.is_active 
                      ? "text-gray-400 hover:text-orange-500 hover:bg-orange-50" 
                      : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                   {plan.is_active ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
             </div>
             
             <h3 className={`text-xl font-bold mb-1 ${plan.is_active ? "text-gray-900" : "text-gray-600"}`}>
               {plan.name}
             </h3>
             <p className="text-sm text-gray-500 mb-4">{plan.exams_count} Exams included</p>
             
             <div className="flex items-end gap-2 border-t pt-4">
                <span className={`text-3xl font-extrabold ${plan.is_active ? "text-gray-900" : "text-gray-500"}`}>
                  ₹{plan.selling_price}
                </span>
                {plan.original_price && (
                   <span className="text-sm text-gray-400 line-through mb-1">₹{plan.original_price}</span>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}