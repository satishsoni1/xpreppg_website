import { useState, useEffect } from "react";
import { AdminAPI } from "@/services/adminApi";
import { Ticket, Power, Globe, Package, Loader2, Edit, X } from "lucide-react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State to track editing mode
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    code: "",
    discount_type: "flat", 
    discount_value: "",
    min_order_amount: 0,
    valid_until: "",
    usage_limit: 100,
    specific_plan_id: "" 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Coupons AND Plans for the dropdown
      const [couponRes, planRes] = await Promise.all([
        AdminAPI.getCoupons(),
        AdminAPI.getPlans()
      ]);

      if (couponRes.status) setCoupons(couponRes.coupons);
      if (planRes.status) setPlans(planRes.plans);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ✅ Populate form for editing
  const handleEdit = (coupon: any) => {
    setEditingId(coupon.id);
    
    // Format date for input type="date" (YYYY-MM-DD)
    const validDate = coupon.valid_until 
      ? new Date(coupon.valid_until).toISOString().split('T')[0] 
      : "";

    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      valid_until: validDate,
      usage_limit: coupon.usage_limit,
      specific_plan_id: coupon.specific_plan_id || ""
    });

    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ 
        code: "", discount_type: "flat", discount_value: "", 
        min_order_amount: 0, valid_until: "", usage_limit: 100, specific_plan_id: "" 
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Convert inputs to correct types
    const payload = {
        ...form,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount),
        usage_limit: Number(form.usage_limit),
        specific_plan_id: form.specific_plan_id ? Number(form.specific_plan_id) : null 
    };

    let res;
    if (editingId) {
        // Update existing coupon
        res = await AdminAPI.updateCoupon(editingId, payload);
    } else {
        // Create new coupon
        res = await AdminAPI.createCoupon(payload);
    }

    setSubmitting(false);

    if(res.status) {
      alert(editingId ? "Coupon Updated Successfully" : "Coupon Created Successfully");
      resetForm();
      fetchData(); // Refresh list
    } else {
      alert(res.message);
    }
  };

  const toggleStatus = async (id: number, current: boolean) => {
    if(!window.confirm(`Are you sure you want to ${current ? 'deactivate' : 'activate'} this coupon?`)) return;

    const res = await AdminAPI.toggleCoupon(id, !current);
    if(res.status) {
       // Optimistic update
       setCoupons(coupons.map(c => c.id === id ? {...c, is_active: !current} : c));
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-10">
       <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Ticket className="text-purple-600" /> Coupon Management
      </h1>

      {/* --- FORM SECTION --- */}
      <div className={`p-6 rounded-xl shadow-sm border mb-8 transition-all duration-300 ${editingId ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200' : 'bg-white border-gray-200'}`}>
         
         <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200/50">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                {editingId ? <Edit size={20} className="text-purple-600"/> : <Ticket size={20} className="text-gray-400"/>}
                {editingId ? "Edit Coupon Details" : "Create New Coupon"}
            </h3>
            {editingId && (
                <button onClick={resetForm} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition flex items-center gap-2">
                    <X size={14} /> Cancel Edit
                </button>
            )}
         </div>

         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Row 1 */}
            <div className="md:col-span-1">
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Coupon Code</label>
               <input 
                 required 
                 className="w-full border p-3 rounded-lg uppercase tracking-wider font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                 placeholder="SUMMER50"
                 value={form.code}
                 onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
               />
            </div>

            <div className="md:col-span-1">
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Applicable Plan</label>
               <select 
                  className="w-full border p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Discount Type</label>
                 <select 
                    className="w-full border p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={form.discount_type}
                    onChange={e => setForm({...form, discount_type: e.target.value})}
                 >
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                 </select>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Value</label>
                 <input 
                    required type="number" 
                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. 50"
                    value={form.discount_value}
                    onChange={e => setForm({...form, discount_value: e.target.value})}
                 />
               </div>
            </div>

            {/* Row 2 */}
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Min Order Amt</label>
               <input 
                  type="number" 
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={form.min_order_amount}
                  onChange={e => setForm({...form, min_order_amount: Number(e.target.value)})}
               />
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Usage Limit</label>
               <input 
                  type="number" 
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={form.usage_limit}
                  onChange={e => setForm({...form, usage_limit: Number(e.target.value)})}
               />
            </div>
            <div className="md:col-span-2">
               <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Valid Until</label>
               <input 
                  type="date" 
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={form.valid_until}
                  onChange={e => setForm({...form, valid_until: e.target.value})}
               />
            </div>

            {/* Submit Button */}
            <button 
                type="submit"
                disabled={submitting}
                className={`md:col-span-4 text-white font-bold py-3.5 rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                    editingId 
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                }`}
            >
               {submitting ? <Loader2 className="animate-spin" /> : (editingId ? <Edit size={18}/> : <Ticket size={18}/>)} 
               {editingId ? "Update Coupon Details" : "Create New Coupon"}
            </button>
         </form>
      </div>

      {/* --- TABLE SECTION --- */}
      {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
             <Loader2 className="animate-spin text-purple-600 w-8 h-8 mb-2" />
             <p className="text-gray-500">Loading coupons...</p>
          </div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
         <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase text-xs tracking-wider">
               <tr>
                  <th className="p-4 pl-6">Code</th>
                  <th className="p-4">Applicability</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Created On</th>
                  <th className="p-4">Expires On</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {coupons.length === 0 && (
                   <tr><td colSpan={9} className="p-10 text-center text-gray-400 italic">No coupons found. Create your first one above.</td></tr>
               )}
               {coupons.map(c => (
                  <tr key={c.id} className={`hover:bg-gray-50 transition duration-150 ${editingId === c.id ? 'bg-purple-50/50' : ''}`}>
                     
                     {/* 1. CODE */}
                     <td className="p-4 pl-6">
                        <span className="font-bold text-gray-800 font-mono text-base bg-gray-100 px-2 py-1 rounded border border-gray-200">
                           {c.code}
                        </span>
                     </td>
                     
                     {/* 2. SCOPE */}
                     <td className="p-4">
                        {c.specific_plan_id ? (
                           <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 w-fit">
                              <Package size={14} /> 
                              {c.plan_name ? (c.plan_name.length > 20 ? c.plan_name.substring(0,20)+'...' : c.plan_name) : `Plan #${c.specific_plan_id}`}
                           </div>
                        ) : (
                           <div className="flex items-center gap-1.5 text-gray-600 text-xs font-bold bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 w-fit">
                              <Globe size={14} /> Global
                           </div>
                        )}
                     </td>

                     {/* 3. DISCOUNT */}
                     <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold border border-emerald-100">
                           {c.discount_type === 'flat' ? '₹' : ''}{c.discount_value}{c.discount_type === 'percentage' ? '%' : ''} OFF
                        </span>
                     </td>

                     {/* 4. MIN ORDER */}
                     <td className="p-4 text-gray-600 font-medium">
                        {c.min_order_amount > 0 ? `₹${c.min_order_amount}` : <span className="text-gray-400">-</span>}
                     </td>

                     {/* 5. USAGE BAR */}
                     <td className="p-4 text-gray-600 min-w-[140px]">
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs">
                                <span className="font-bold">{c.used_count} used</span>
                                <span className="text-gray-400">of {c.usage_limit}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${c.used_count >= c.usage_limit ? 'bg-red-500' : 'bg-purple-500'}`}
                                    style={{ width: `${Math.min((c.used_count / c.usage_limit) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                     </td>

                     {/* 6. CREATED */}
                     <td className="p-4 text-gray-500 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                     </td>

                     {/* 7. EXPIRY */}
                     <td className="p-4 text-gray-500 text-xs">
                        {c.valid_until ? (
                            <span className={`${new Date(c.valid_until) < new Date() ? 'text-red-500 font-bold bg-red-50 px-1 rounded' : ''}`}>
                                {new Date(c.valid_until).toLocaleDateString()}
                            </span>
                        ) : 'Never'}
                     </td>

                     {/* 8. STATUS */}
                     <td className="p-4 text-center">
                        {c.is_active 
                           ? <span className="text-emerald-700 font-bold text-[10px] uppercase bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 tracking-wide">Active</span> 
                           : <span className="text-red-600 font-bold text-[10px] uppercase bg-red-50 px-2 py-1 rounded-full border border-red-100 tracking-wide">Inactive</span>
                        }
                     </td>

                     {/* 9. ACTIONS */}
                     <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-1">
                            <button 
                                onClick={() => handleEdit(c)}
                                className="p-2 rounded-lg hover:bg-white hover:shadow border border-transparent hover:border-gray-200 text-gray-400 hover:text-indigo-600 transition"
                                title="Edit Coupon"
                            >
                                <Edit size={16} />
                            </button>

                            <button 
                                onClick={() => toggleStatus(c.id, c.is_active)}
                                className={`p-2 rounded-lg hover:bg-white hover:shadow border border-transparent hover:border-gray-200 transition ${c.is_active ? 'text-emerald-500 hover:text-red-600' : 'text-red-400 hover:text-emerald-600'}`}
                                title={c.is_active ? "Deactivate" : "Activate"}
                            >
                                <Power size={16} />
                            </button>
                        </div>
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