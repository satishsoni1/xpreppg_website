import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import { CreditCard, Calendar, Download, Clock, FileText, BarChart2 } from "lucide-react";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check Local Auth
    const storedUser = localStorage.getItem("student_user");
    if (!storedUser) {
      navigate("/student/login");
      return;
    }
    setUser(JSON.parse(storedUser));

    // 2. Fetch All Data
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.all([
        StudentAPI.getDashboard(),
        StudentAPI.getOrderHistory()
      ]);

      setStats(statsRes);
      
      if (historyRes.status) {
        setOrders(historyRes.orders);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here is your exam overview.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Exams Enrolled */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Enrolled Exams</div>
            <div className="text-3xl font-bold text-gray-900">{stats?.total_exams || 0}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <Calendar size={24} />
          </div>
        </div>

        {/* Card 2: Next Upcoming Exam */}
        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Next Exam</div>
          <div className="font-bold text-gray-900 truncate">
             {stats?.enrollments?.[0]?.title || "No Active Exam"}
          </div>
          <div className="mt-1 text-sm text-gray-500">
             {stats?.enrollments?.[0]?.date 
                ? new Date(stats.enrollments[0].date).toDateString() 
                : "Browse plans to enroll"}
          </div>
        </div> */}

        {/* Card 3: Admit Card Status */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-xl shadow-sm text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-lg font-semibold mb-1">Admit Card</div>
            {stats?.enrollments?.[0]?.admit_card_generated ? (
              <>
                <p className="text-emerald-100 text-sm mb-3">Ready for download.</p>
                <Link to="/student/admit-card" className="bg-white text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2">
                  <Download size={16} /> Download
                </Link>
              </>
            ) : (
              <p className="text-emerald-100 text-sm">Not generated yet.</p>
            )}
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Quick Actions Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-800">Quick Actions</h2>
        </div>
        
        {/* Changed to GRID layout for side-by-side cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Enroll */}
          <Link 
            to="/student/enroll" 
            className="flex items-center p-4 border rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition group cursor-pointer"
          >
            <div className="bg-emerald-100 p-3 rounded-full text-primary mr-4 group-hover:bg-white group-hover:shadow-sm transition">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-emerald-700">Enroll in New Exam</h3>
              <p className="text-sm text-gray-500">Purchase a new plan, select dates & get invoice.</p>
            </div>
          </Link>

          {/* Card 2: Report Card (New) */}
          <Link 
            to="/student/report-card" 
            className="flex items-center p-4 border rounded-xl hover:border-purple-500 hover:bg-purple-50 transition group cursor-pointer"
          >
            <div className="bg-purple-100 p-3 rounded-full text-purple-600 mr-4 group-hover:bg-white group-hover:shadow-sm transition">
              <BarChart2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-purple-700">View Result Analysis</h3>
              <p className="text-sm text-gray-500">Check your latest Grand Test performance & rank.</p>
            </div>
          </Link>
          
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" /> 
            Recent Payments
          </h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No payment history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₹{order.amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/student/invoice/${order.order_id}`}
                        className="inline-flex items-center gap-1 text-primary hover:text-emerald-800 font-medium bg-emerald-50 px-3 py-1 rounded-md"
                      >
                        <FileText size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enrollments List */}
      {stats?.enrollments?.length > 0 && (
         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
               <h2 className="font-bold text-gray-800">My Exams</h2>
            </div>
            <div className="divide-y divide-gray-100">
               {stats.enrollments.map((enrol: any) => (
                  <div key={enrol.enrollment_id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                     <div>
                        <p className="font-medium text-gray-900">{enrol.title}</p>
                        <p className="text-xs text-gray-500">{new Date(enrol.date).toDateString()}</p>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        enrol.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                     }`}>
                        {enrol.payment_status}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
}