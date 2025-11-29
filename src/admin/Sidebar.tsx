import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-xl p-6">
      <h1 className="text-xl font-bold mb-6">Admin Panel</h1>

      <nav className="space-y-3">
        <NavLink className="block py-2 text-gray-700" to="/admin/coupons">
          📦 Coupon Dashboard
        </NavLink>

        <NavLink className="block py-2 text-gray-700" to="/admin/users">
          👥 Registered Users
        </NavLink>

        <button
          className="block py-2 text-red-600 mt-6"
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
