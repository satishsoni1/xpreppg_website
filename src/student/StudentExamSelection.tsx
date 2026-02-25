import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import { FileText, Loader2, AlertCircle } from "lucide-react";

export default function StudentExamSelection() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch available exams and payment history in parallel
      const [examsData, historyData] = await Promise.all([
        StudentAPI.getExams(),
        StudentAPI.getOrderHistory()
      ]);

      if (Array.isArray(examsData)) {
        setExams(examsData);
      }

      if (historyData.status && Array.isArray(historyData.orders)) {
        setHistory(historyData.orders);
      }
    } catch (error) {
      console.error("Failed to load exam data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = () => {
    // Redirect to the main enrollment wizard which handles Plans, Coupons & Razorpay
    navigate("/student/enroll");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      
      {/* 1. AVAILABLE EXAMS SECTION */}
      <section>
        <div className="flex justify-between items-end mb-6">
           <div>
             <h2 className="text-2xl font-bold text-gray-800">Available Exams</h2>
             <p className="text-gray-500 mt-1">Browse upcoming Grand CBTs and Speed Tests</p>
           </div>
           <button 
             onClick={handleEnrollClick}
             className="hidden md:block text-primary font-semibold hover:underline"
           >
             View Plans & Pricing →
           </button>
        </div>
        
        {exams.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-xl text-center text-gray-500 border border-gray-200">
            No exams are currently scheduled. Please check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-200 transition group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition">
                        {exam.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded capitalize ${
                      exam.status === 'open' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                  
                  <div className="flex items-end justify-between mt-6 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Status</p>
                      <p className="font-medium text-gray-700 capitalize">{exam.status}</p>
                    </div>
                    <button 
                      onClick={handleEnrollClick}
                      className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. PAYMENT HISTORY SECTION */}
      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Payment & Order History</h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="p-10 text-center">
               <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="text-gray-400" size={24} />
               </div>
               <p className="text-gray-500 font-medium">No past payments found.</p>
               <button 
                 onClick={handleEnrollClick} 
                 className="mt-3 text-primary font-semibold hover:underline"
               >
                 Purchase a plan to get started
               </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order Date</th>
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                        {order.order_id}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-bold">
                        ₹{order.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {order.status === 'paid' && (
                          <Link 
                            to={`/student/invoice/${order.order_id}`}
                            className="inline-flex items-center gap-1 text-primary hover:text-emerald-800 font-medium transition"
                          >
                            <FileText size={16} /> Download
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}