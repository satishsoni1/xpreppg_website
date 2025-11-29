import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    paid: 0,
    unpaid: 0,
    couponUses: 0, 
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    axios
      .get("https://api.xpreppg.com/api/admin/stats", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        if (res.data.status) {
          setStats(res.data.stats);
        }
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-3xl font-bold">{stats.users}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">Paid Users</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.paid}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">Unpaid Users</p>
          <p className="text-3xl font-bold text-red-500">{stats.unpaid}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">Coupon Uses</p>
          <p className="text-3xl font-bold text-blue-600">{stats.couponUses}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition block"
        >
          <h2 className="text-xl font-semibold mb-2">Registered Users</h2>
          <p className="text-gray-600 text-sm">View all registered students.</p>
        </Link>

        <Link
          to="/admin/coupons"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition block"
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
