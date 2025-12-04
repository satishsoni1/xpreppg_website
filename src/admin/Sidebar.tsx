import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-xl p-6 h-screen">
      <h1 className="text-xl font-bold mb-6">Admin Panel</h1>

      <nav className="space-y-3">

        <NavLink
          to="/admin/coupons"
          className={({ isActive }) =>
            `block py-2 px-2 rounded-md ${
              isActive ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700"
            }`
          }
        >
          📦 Coupon Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `block py-2 px-2 rounded-md ${
              isActive ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700"
            }`
          }
        >
          👥 Registered Users
        </NavLink>

        <NavLink
          to="/admin/plans"
          className={({ isActive }) =>
            `block py-2 px-2 rounded-md ${
              isActive ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700"
            }`
          }
        >
          💰 Manage Pricing Plans
        </NavLink>

        <button
          className="block w-full text-left py-2 px-2 text-red-600 mt-6 hover:bg-red-100 rounded-md"
          onClick={() => {
            localStorage.removeItem("admin_token");
            window.location.href = "/admin/login";
          }}
        >
          🔒 Logout
        </button>

      </nav>
    </div>
  );
}
