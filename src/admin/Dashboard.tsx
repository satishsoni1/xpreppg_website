import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  TicketPercent,
  ArrowRight
} from "lucide-react";
import { AdminAPI } from "@/services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    paid: 0,
    unpaid: 0,
    couponUses: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await AdminAPI.stats();

        if (res.data.status) {
          setStats(res.data.stats);
        } else {
          setError("Failed to load dashboard stats.");
        }
      } catch {
        setError("Unable to reach server. Check connection.");
      }
      setLoading(false);
    };

    loadStats();
  }, []);

  /* ---------- Skeleton ---------- */
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl p-6 shadow animate-pulse">
      <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
      <div className="h-8 w-20 bg-gray-300 rounded"></div>
    </div>
  );

  /* ---------- Stat Card ---------- */
  const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
    bg,
  }: {
    label: string;
    value: number | string;
    icon: any;
    color: string;
    bg: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of platform activity & performance
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              label="Total Users"
              value={stats.users}
              icon={Users}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <StatCard
              label="Paid Users"
              value={stats.paid}
              icon={UserCheck}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <StatCard
              label="Unpaid Users"
              value={stats.unpaid}
              icon={UserX}
              color="text-red-600"
              bg="bg-red-50"
            />
            <StatCard
              label="Coupon Uses"
              value={stats.couponUses}
              icon={TicketPercent}
              color="text-indigo-600"
              bg="bg-indigo-50"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/admin/users"
            className="group bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-transparent hover:border-blue-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Registered Users
                </h3>
                <p className="text-sm text-gray-600">
                  View and manage all users
                </p>
              </div>
              <ArrowRight className="text-blue-600 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/admin/coupons"
            className="group bg-white p-6 rounded-xl shadow hover:shadow-xl transition border border-transparent hover:border-emerald-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Coupon Analytics
                </h3>
                <p className="text-sm text-gray-600">
                  Manage coupons & usage stats
                </p>
              </div>
              <ArrowRight className="text-emerald-600 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
