import { useEffect, useState } from "react";
import { Users, BookOpen, DollarSign, TrendingUp, Activity } from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    AdminAPI.getStats()
    .then((data) => {
      if (data.status) setStats(data.stats);
    })
    .catch((err) => console.error(err));
  }, []);

  if (!stats) return <div className="p-8">Loading Stats...</div>;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <StatCard title="Total Students" value={stats.total_users} icon={<Users />} color="bg-blue-500" />
         <StatCard title="Total Exams" value={stats.total_exams} icon={<BookOpen />} color="bg-orange-500" />
         <StatCard title="Total Revenue" value={`₹${stats.total_revenue.toLocaleString()}`} icon={<DollarSign />} color="bg-emerald-500" />
         <StatCard title="Active Enrollments" value={stats.active_enrollments} icon={<TrendingUp />} color="bg-purple-500" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-gray-400" /> Recent Enrollments
         </h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="text-gray-500 border-b">
                  <tr>
                     <th className="pb-3">Student</th>
                     <th className="pb-3">Exam/Plan</th>
                     <th className="pb-3">Amount</th>
                     <th className="pb-3">Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y">
                  {stats.recent_activity.map((item: any, idx: number) => (
                     <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="py-3 text-gray-600">{item.title}</td>
                        <td className="py-3 font-bold text-primary">₹{item.amount}</td>
                        <td className="py-3 text-gray-400">{new Date(item.created_at).toLocaleDateString()}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
       <div className={`p-4 rounded-full text-white shadow-lg ${color}`}>
          {icon}
       </div>
       <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
       </div>
    </div>
  );
}