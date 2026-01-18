import { useState, useEffect } from "react";
import { AdminAPI } from "@/services/adminApi";
import { Ticket, Power, Globe, FileText } from "lucide-react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]); // Store list of exams
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    code: "",
    discount_type: "flat", 
    discount_value: "",
    min_order_amount: 0,
    valid_until: "",
    usage_limit: 100,
    specific_exam_id: "" // New Field
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Coupons AND Exams (for the dropdown)
      const [couponRes, examRes] = await Promise.all([
        AdminAPI.getCoupons(),
        AdminAPI.getExams() // Ensure this method exists in AdminAPI
      ]);

      if (couponRes.status) setCoupons(couponRes.coupons);
      if (examRes.status) setExams(examRes.exams);

    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await AdminAPI.createCoupon(form);
    if(res.status) {
      alert("Coupon Created");
      // Reset form (keep generic settings, clear specific ones)
      setForm({ ...form, code: "", discount_value: "", specific_exam_id: "" });
      // Re-fetch to get the new list with exam names joined
      const updatedList = await AdminAPI.getCoupons();
      if(updatedList.status) setCoupons(updatedList.coupons);
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
         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Row 1 */}
            <div className="md:col-span-1">
               <label className="text-xs font-bold text-gray-500 uppercase">Coupon Code</label>
               <input 
                 required className="w-full border p-2.5 rounded-lg uppercase tracking-wider font-bold"
                 placeholder="SUMMER50"
                 value={form.code}
                 onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
               />
            </div>

            <div className="md:col-span-1">
               <label className="text-xs font-bold text-gray-500 uppercase">Applicability</label>
               <select 
                  className="w-full border p-2.5 rounded-lg bg-white"
                  value={form.specific_exam_id}
                  onChange={e => setForm({...form, specific_exam_id: e.target.value})}
               >
                  <option value="">Global (All Exams)</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.title}
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

            <button className="md:col-span-4 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition">
               Create Coupon
            </button>
         </form>
      </div>

      {/* LIST TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b font-bold text-gray-600">
               <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Scope</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Expires</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y">
               {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                     <td className="p-4 font-bold text-gray-800 tracking-wide">{c.code}</td>
                     
                     {/* SCOPE COLUMN */}
                     <td className="p-4">
                        {c.specific_exam_id ? (
                           <span className="flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded w-fit">
                              <FileText size={12} /> {c.exam_name || `Exam #${c.specific_exam_id}`}
                           </span>
                        ) : (
                           <span className="flex items-center gap-1 text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded w-fit">
                              <Globe size={12} /> Global
                           </span>
                        )}
                     </td>

                     <td className="p-4">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                           {c.discount_type === 'flat' ? '₹' : ''}{c.discount_value}{c.discount_type === 'percentage' ? '%' : ''} OFF
                        </span>
                     </td>
                     <td className="p-4 text-gray-500">{c.used_count} / {c.usage_limit}</td>
                     <td className="p-4 text-gray-500">
                        {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'No Expiry'}
                     </td>
                     <td className="p-4">
                        {c.is_active 
                           ? <span className="text-green-600 font-bold text-xs">ACTIVE</span> 
                           : <span className="text-red-500 font-bold text-xs">INACTIVE</span>
                        }
                     </td>
                     <td className="p-4">
                        <button 
                           onClick={() => toggleStatus(c.id, c.is_active)}
                           className={`p-2 rounded hover:bg-gray-200 ${c.is_active ? 'text-red-500' : 'text-green-600'}`}
                           title="Toggle Status"
                        >
                           <Power size={18} />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}