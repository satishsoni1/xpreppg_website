import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

export default function AdminEnrollments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      // ✅ Use the Service Method
      const res = await AdminAPI.getEnrollments();
      
      if (res.status) {
        setData(res.enrollments || []);
      } else {
        setError("Failed to load enrollments.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Enrollments & Invoices</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-gray-50 border-b text-sm font-bold text-gray-600">
              <tr>
                 <th className="p-4">Date</th>
                 <th className="p-4">Student</th>
                 <th className="p-4">Exam/Plan</th>
                 <th className="p-4">Amount</th>
                 <th className="p-4">Status</th>
                 <th className="p-4">Action</th>
              </tr>
           </thead>
           <tbody className="divide-y text-sm">
              {data.map(row => (
                 <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-4">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                       <div className="font-bold">{row.student_name}</div>
                       <div className="text-xs text-gray-500">{row.email}</div>
                    </td>
                    <td className="p-4">{row.exam_title || "Plan Purchase"}</td>
                    <td className="p-4">₹{row.amount}</td>
                    <td className="p-4">
                       <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">{row.payment_status}</span>
                    </td>
                    <td className="p-4">
                       <button className="text-blue-600 hover:underline flex items-center gap-1">
                          <Download size={14} /> Invoice
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