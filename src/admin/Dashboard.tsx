import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      } catch (err) {
        setError("Unable to reach server. Check connection.");
      }

      setLoading(false);
    };

    loadStats();
  }, []);

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="p-6 bg-white rounded-xl shadow animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-4"></div>
      <div className="h-8 bg-gray-300 rounded w-16 mx-auto"></div>
    </div>
  );

  // Dashboard Card Component
  const StatCard = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number | string;
    color?: string;
  }) => (
    <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition text-center cursor-default">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className={`text-3xl font-bold ${color || "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* ERROR */}
      {error && (
        <p className="text-red-600 bg-red-100 px-4 py-3 rounded-lg mb-6">
          {error}
        </p>
      )}

      {/* STATS GRID */}
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
            <StatCard label="Total Users" value={stats.users} />
            <StatCard
              label="Paid Users"
              value={stats.paid}
              color="text-emerald-600"
            />
            <StatCard
              label="Unpaid Users"
              value={stats.unpaid}
              color="text-red-500"
            />
            <StatCard
              label="Coupon Uses"
              value={stats.couponUses}
              color="text-blue-600"
            />
          </>
        )}
      </div>

      {/* QUICK LINKS */}
      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="p-6 bg-white rounded-xl shadow hover:shadow-xl transition block border border-transparent hover:border-blue-300"
        >
          <h2 className="text-xl font-semibold mb-2">Registered Users</h2>
          <p className="text-gray-600 text-sm">View all registered students.</p>
        </Link>

        <Link
          to="/admin/coupons"
          className="p-6 bg-white rounded-xl shadow hover:shadow-xl transition block border border-transparent hover:border-emerald-300"
        >
          <h2 className="text-xl font-semibold mb-2">Coupon Analytics</h2>
          <p className="text-gray-600 text-sm">
            Manage coupons & view analytics.
          </p>
        </Link>
      </div>

    </div>
  );
}
