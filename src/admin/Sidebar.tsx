import { NavLink } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png'; // <-- add this
export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <div className="w-64 bg-white shadow-xl p-6 h-screen">
      <div className="flex items-center space-x-3 justify-center mb-8">
            {/* <img src="https://portal.xpreppg.com/storage/site/logo.jpg" width="23%"/> */}
            <img 
              src={logo} 
              alt="Logo"
              className="w-24 object-contain"
              onClick={() => navigate("/")}
            />
          </div>
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
        <NavLink
          to="/admin/cities"
          className={({ isActive }) =>
            `block py-2 px-2 rounded-md ${
              isActive ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700"
            }`
          }
        >
           📍 Manage Cities
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
