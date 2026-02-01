import { useState, useEffect } from "react";
import { AdminAPI } from "@/services/adminApi";
import { Ticket, Power, Globe, Package, Loader2 } from "lucide-react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]); // ✅ Store list of plans
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  const [form, setForm] = useState({
    code: "",
    discount_type: "flat", 
    discount_value: "",
    min_order_amount: 0,
    valid_until: "",
    usage_limit: 100,
    specific_plan_id: "" // ✅ Changed from exam_id to plan_id based on requirement
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Coupons AND Plans
      const [couponRes, planRes] = await Promise.all([
        AdminAPI.getCoupons(),
        AdminAPI.getPlans() // ✅ Fetch plans here
      ]);

      if (couponRes.status) setCoupons(couponRes.coupons);
      if (planRes.status) setPlans(planRes.plans);

    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setCreating(true);
    
    // Ensure payload matches backend expectation
    const payload = {
        ...form,
        // Convert to number if selected, else null
        specific_plan_id: form.specific_plan_id ? Number(form.specific_plan_id) : null 
    };

    const res = await AdminAPI.createCoupon(payload);
    setCreating(false);

    if(res.status) {
      alert("Coupon Created Successfully");
      setForm({ ...form, code: "", discount_value: "", specific_plan_id: "" });
      fetchData(); // Refresh list
    } else {
      alert(res.message);
    }
  };

  const toggleStatus = async (id: number, current: boolean) => {
    const res = await AdminAPI.toggleCoupon(id, !current);
    if(res.status) {
       setCoupons(coupons.map(c => c.id === id ? {...c, is_active: !current} : c));
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
       <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Ticket className="text-purple-600" /> Coupon Management
      </h1>

      {/* CREATE FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
         <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Create New Coupon</h3>
         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Row 1 */}
            <div className="md:col-span-1">
               <label className="text-xs font-bold text-gray-500 uppercase">Coupon Code</label>
               <input 
                 required className="w-full border p-2.5 rounded-lg uppercase tracking-wider font-bold focus:ring-2 focus:ring-purple-500"
                 placeholder="SUMMER50"
                 value={form.code}
                 onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
               />
            </div>

            <div className="md:col-span-1">
               <label className="text-xs font-bold text-gray-500 uppercase">Applicable Plan</label>
               <select 
                  className="w-full border p-2.5 rounded-lg bg-white"
                  value={form.specific_plan_id}
                  onChange={e => setForm({...form, specific_plan_id: e.target.value})}
               >
                  <option value="">Global (All Plans)</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} (₹{plan.selling_price})
                    </option>
                  ))}
               </select>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                 <select 
                    className="w-full border p-2.5 rounded-lg bg-white"
                    value={form.discount_type}
                    onChange={e => setForm({...form, discount_type: e.target.value})}
                 >
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                 </select>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Value</label>
                 <input 
                    required type="number" className="w-full border p-2.5 rounded-lg"
                    placeholder="e.g. 50"
                    value={form.discount_value}
                    onChange={e => setForm({...form, discount_value: e.target.value})}
                 />
               </div>
            </div>

            {/* Row 2 */}
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Min Order Amt</label>
               <input 
                  type="number" className="w-full border p-2.5 rounded-lg"
                  value={form.min_order_amount}
                  onChange={e => setForm({...form, min_order_amount: Number(e.target.value)})}
               />
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Usage Limit</label>
               <input 
                  type="number" className="w-full border p-2.5 rounded-lg"
                  value={form.usage_limit}
                  onChange={e => setForm({...form, usage_limit: Number(e.target.value)})}
               />
            </div>
            <div className="md:col-span-2">
               <label className="text-xs font-bold text-gray-500 uppercase">Valid Until</label>
               <input 
                  type="date" className="w-full border p-2.5 rounded-lg"
                  value={form.valid_until}
                  onChange={e => setForm({...form, valid_until: e.target.value})}
               />
            </div>

            <button 
                type="submit"
                disabled={creating}
                className="md:col-span-4 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
               {creating ? <Loader2 className="animate-spin" /> : <Ticket />} Create Coupon
            </button>
         </form>
      </div>

      {/* LIST TABLE */}
      {loading ? (
          <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-purple-600" /></div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b font-bold text-gray-600">
               <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Applicability</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Expires</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y">
               {coupons.length === 0 && (
                   <tr><td colSpan={7} className="p-8 text-center text-gray-500">No coupons found. Create one above.</td></tr>
               )}
               {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                     <td className="p-4 font-bold text-gray-800 tracking-wide font-mono bg-gray-50/50">{c.code}</td>
                     
                     {/* SCOPE COLUMN */}
                     <td className="p-4">
                        {c.specific_plan_id ? (
                           <span className="flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded w-fit border border-blue-100">
                              <Package size={12} /> {c.plan_name || `Plan #${c.specific_plan_id}`}
                           </span>
                        ) : (
                           <span className="flex items-center gap-1 text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200">
                              <Globe size={12} /> Global
                           </span>
                        )}
                     </td>

                     <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold border border-emerald-200">
                           {c.discount_type === 'flat' ? '₹' : ''}{c.discount_value}{c.discount_type === 'percentage' ? '%' : ''} OFF
                        </span>
                     </td>
                     <td className="p-4 text-gray-600 font-medium">{c.used_count} / {c.usage_limit}</td>
                     <td className="p-4 text-gray-500">
                        {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'No Expiry'}
                     </td>
                     <td className="p-4">
                        {c.is_active 
                           ? <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">ACTIVE</span> 
                           : <span className="text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded">INACTIVE</span>
                        }
                     </td>
                     <td className="p-4">
                        <button 
                           onClick={() => toggleStatus(c.id, c.is_active)}
                           className={`p-2 rounded-full hover:bg-gray-100 transition ${c.is_active ? 'text-red-500 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-800'}`}
                           title={c.is_active ? "Deactivate" : "Activate"}
                        >
                           <Power size={18} />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
      )}
    </div>
  );
}