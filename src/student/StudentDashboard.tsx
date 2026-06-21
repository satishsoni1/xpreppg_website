import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import {
  CreditCard, Calendar, Download, Clock, FileText, BarChart2,
  CheckCircle, AlertCircle, ChevronRight, BookOpen, Award
} from "lucide-react";

function ExamStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    live:      "bg-green-100 text-green-700",
    upcoming:  "bg-blue-100 text-blue-700",
    completed: "bg-gray-100 text-gray-600",
    open:      "bg-emerald-100 text-emerald-700",
  };
  const cls = map[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cls}`}>
      {status}
    </span>
  );
}

export default function StudentDashboard() {
  const [user, setUser]     = useState<any>(null);
  const [stats, setStats]   = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const portal = localStorage.getItem("student_active_portal") || "CBT";

  useEffect(() => {
    const storedUser = localStorage.getItem("student_user");
    if (!storedUser) { navigate("/student/login"); return; }
    setUser(JSON.parse(storedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.all([
        StudentAPI.getDashboard(),
        StudentAPI.getOrderHistory(),
      ]);
      setStats(statsRes);
      if (historyRes.status) setOrders(historyRes.orders);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mr-3" />
        Loading Dashboard...
      </div>
    );
  }

  const enrollments: any[] = stats?.enrollments || [];
  const admitCardReady = enrollments.filter(e => e.admit_card_generated && e.payment_status === "paid");
  const pendingExams   = enrollments.filter(e => !e.admit_card_generated);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {portal === "XRevise" ? "XRevise Portal" : "CBT Exam Portal"} — {new Date().toDateString()}
          </p>
        </div>
        <Link
          to="/student/enroll"
          className="hidden md:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primaryDark transition shadow-sm"
        >
          <CreditCard size={16} /> Enroll New Exam
        </Link>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Calendar size={20} />} label="Enrolled Exams" value={enrollments.length} color="blue" />
        <StatCard icon={<CheckCircle size={20} />} label="Admit Cards Ready" value={admitCardReady.length} color="emerald" />
        <StatCard icon={<AlertCircle size={20} />} label="Pending" value={pendingExams.length} color="amber" />
        <StatCard icon={<Award size={20} />} label="Payments" value={orders.length} color="purple" />
      </div>

      {/* ── My Enrolled Exams ── */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-primary" /> My Enrolled Exams
        </h2>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 py-14 text-center text-gray-400">
            <Calendar size={40} className="mx-auto mb-2 opacity-30" />
            <p className="font-medium">No exams enrolled yet.</p>
            <Link to="/student/enroll" className="mt-3 inline-block text-sm font-bold text-primary hover:underline">
              Browse & Enroll Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enrol: any) => (
              <ExamCard key={enrol.enrollment_id} enrol={enrol} />
            ))}
          </div>
        )}
      </section>

      {/* ── Quick Actions ── */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-800">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/student/enroll"
            className="flex items-center p-4 border rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition group"
          >
            <div className="bg-emerald-100 p-3 rounded-full text-primary mr-4 group-hover:bg-white group-hover:shadow-sm transition">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-primary">Enroll in New Exam</h3>
              <p className="text-sm text-gray-500">Purchase a plan, select dates & get invoice.</p>
            </div>
            <ChevronRight size={18} className="ml-auto text-gray-300 group-hover:text-primary" />
          </Link>

          <Link
            to="/student/report-card"
            className="flex items-center p-4 border rounded-xl hover:border-purple-500 hover:bg-purple-50 transition group"
          >
            <div className="bg-purple-100 p-3 rounded-full text-purple-600 mr-4 group-hover:bg-white group-hover:shadow-sm transition">
              <BarChart2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-purple-700">View Result Analysis</h3>
              <p className="text-sm text-gray-500">Check your latest Grand Test performance & rank.</p>
            </div>
            <ChevronRight size={18} className="ml-auto text-gray-300 group-hover:text-purple-500" />
          </Link>
        </div>
      </section>

      {/* ── Recent Payments ── */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" /> Recent Payments
          </h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No payment history found.</div>
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
                {orders.map(order => (
                  <tr key={order.order_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">{order.order_id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{order.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/student/invoice/${order.order_id}`}
                        className="inline-flex items-center gap-1 text-primary font-medium bg-emerald-50 px-3 py-1 rounded-md hover:bg-emerald-100 transition"
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
      </section>
    </div>
  );
}

/* ── Exam Card ── */
function ExamCard({ enrol }: { enrol: any }) {
  const examDate = enrol.date ? new Date(enrol.date) : null;
  const isPaid   = enrol.payment_status === "paid";
  const hasCard  = enrol.admit_card_generated;
  const resultPublished = enrol.result_published;

  return (
    <div className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition hover:shadow-md ${
      hasCard ? "border-emerald-400" : isPaid ? "border-blue-200" : "border-gray-200"
    }`}>
      {/* Top color bar */}
      <div className={`h-1.5 w-full ${hasCard ? "bg-emerald-500" : isPaid ? "bg-blue-500" : "bg-gray-300"}`} />

      <div className="p-5">
        {/* Exam name + status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">{enrol.title}</h3>
          <ExamStatusBadge status={enrol.exam_status || "upcoming"} />
        </div>

        {/* Date + payment */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {examDate ? examDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}
          </span>
          <span className={`font-bold capitalize px-2 py-0.5 rounded-full ${
            isPaid ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
          }`}>
            {enrol.payment_status}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {hasCard && isPaid ? (
            <Link
              to="/student/admit-card"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow-sm"
            >
              <Download size={13} /> Download Admit Card
            </Link>
          ) : isPaid ? (
            <span className="text-xs text-gray-400 italic flex items-center gap-1">
              <AlertCircle size={12} /> Admit card not generated yet
            </span>
          ) : null}

          {resultPublished && (
            <Link
              to="/student/report-card"
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow-sm"
            >
              <BarChart2 size={13} /> View Result
            </Link>
          )}

          {enrol.invoice_url && (
            <a
              href={enrol.invoice_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:border-gray-400 text-xs font-bold px-3 py-2 rounded-lg transition"
            >
              <FileText size={13} /> Invoice
            </a>
          )}

          {!isPaid && (
            <Link
              to="/student/enroll"
              className="flex items-center gap-1.5 border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold px-3 py-2 rounded-lg transition"
            >
              <CreditCard size={13} /> Complete Payment
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue:    "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber:   "bg-amber-50 text-amber-600",
    purple:  "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
      <div className={`p-2.5 rounded-full ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
