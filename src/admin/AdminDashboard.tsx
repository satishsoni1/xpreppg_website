import { useEffect, useState } from "react";
import {
  Users, BookOpen, IndianRupee, TrendingUp, Activity,
  GraduationCap, ClipboardList, UserCheck, BadgePlus,
} from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    AdminAPI.getStats().then((data) => {
      if (data.status) setStats(data.stats);
    });
  }, []);

  if (!stats) return <div className="p-8 text-gray-400">Loading dashboard…</div>;

  const xrevise = stats.xrevise || { students: 0, exams: 0, revenue: 0, new_24h: 0 };
  const cbt = stats.cbt || { students: 0, exams: 0, revenue: 0, new_24h: 0 };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Combined totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.total_users} icon={<Users size={20} />} color="bg-slate-600" />
        <StatCard title="Total Exams" value={stats.total_exams} icon={<BookOpen size={20} />} color="bg-orange-500" />
        <StatCard title="Total Revenue" value={`₹${(stats.total_revenue || 0).toLocaleString("en-IN")}`} icon={<IndianRupee size={20} />} color="bg-emerald-600" />
        <StatCard title="Enrollments" value={stats.active_enrollments} icon={<TrendingUp size={20} />} color="bg-purple-600" />
      </div>

      {/* Split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XRevise */}
        <SectionCard
          title="XRevise"
          accentClass="border-t-primary"
          badge={xrevise.new_24h}
          badgeLabel="new today"
          rows={[
            { label: "Students", value: xrevise.students, icon: <GraduationCap size={16} /> },
            { label: "Exams", value: xrevise.exams, icon: <ClipboardList size={16} /> },
            { label: "Revenue", value: `₹${(xrevise.revenue || 0).toLocaleString("en-IN")}`, icon: <IndianRupee size={16} /> },
            { label: "New (24h)", value: xrevise.new_24h, icon: <BadgePlus size={16} /> },
          ]}
        />

        {/* CBT */}
        <SectionCard
          title="CBT"
          accentClass="border-t-blue-600"
          badge={cbt.new_24h}
          badgeLabel="new today"
          rows={[
            { label: "Students", value: cbt.students, icon: <GraduationCap size={16} /> },
            { label: "Exams", value: cbt.exams, icon: <ClipboardList size={16} /> },
            { label: "Revenue", value: `₹${(cbt.revenue || 0).toLocaleString("en-IN")}`, icon: <IndianRupee size={16} /> },
            { label: "New (24h)", value: cbt.new_24h, icon: <BadgePlus size={16} /> },
          ]}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-gray-400" /> Recent Enrollments
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="pb-3 font-semibold">Student</th>
                <th className="pb-3 font-semibold">Exam</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats.recent_activity || []).map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="py-3 text-gray-600">{item.title}</td>
                  <td className="py-3 font-bold text-emerald-600">₹{Number(item.amount).toLocaleString("en-IN")}</td>
                  <td className="py-3 text-gray-400">{new Date(item.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
              {!(stats.recent_activity?.length) && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No enrollments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: any; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
      <div className={`p-3 rounded-lg text-white ${color}`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-xs font-medium">{title}</p>
        <h3 className="text-xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}

function SectionCard({
  title, accentClass, badge, badgeLabel, rows,
}: {
  title: string;
  accentClass: string;
  badge: number;
  badgeLabel: string;
  rows: { label: string; value: any; icon: React.ReactNode }[];
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${accentClass} p-6`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <UserCheck size={18} className="text-gray-400" /> {title}
        </h2>
        {badge > 0 && (
          <span className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
            +{badge} {badgeLabel}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {rows.map(({ label, value, icon }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
              {icon} {label}
            </div>
            <p className="text-xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
