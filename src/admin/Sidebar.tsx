import { NavLink, useNavigate } from "react-router-dom";
import {
  TicketPercent,
  Users,
  IndianRupee,
  MapPin,
  FileText,
  Building2,
  UserCheck,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import logo from "@/assets/logo.png";

const menuItemClass =
  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 h-screen bg-white border-r shadow-sm flex flex-col">
      
      {/* Logo */}
      <div
        className="flex items-center justify-center py-6 border-b cursor-pointer hover:bg-gray-50 transition"
        onClick={() => navigate("/admin")}
      >
        <img src={logo} alt="Logo" className="w-28 object-contain" />
      </div>

      {/* Title */}
      <div className="px-6 py-4">
        <h1 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Admin Panel
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `${menuItemClass} ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/coupons"
          className={({ isActive }) =>
            `${menuItemClass} ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <TicketPercent size={18} />
          Coupon Dashboard
        </NavLink>

        <NavLink
          to="/admin/offline_registration"
          className={({ isActive }) =>
            `${menuItemClass} ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <Users size={18} />
          Registered Users(Offline)
        </NavLink>
        <NavLink
          to="/admin/online_registration"
          className={({ isActive }) =>
            `${menuItemClass} ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <Users size={18} />
          Registered Users(Online)
        </NavLink>
        <NavLink
          to="/admin/temp-admit-cards"
          className={({ isActive }) =>
            `${menuItemClass} ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <Users size={18} />
          Offlien Student Admin Card
        </NavLink>

        <NavLink
          to="/admin/plans"
          className={({ isActive }) =>
            `${menuItemClass} ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <IndianRupee size={18} />
          Pricing Plans
        </NavLink>

        <NavLink
          to="/admin/cities"
          className={({ isActive }) =>
            `${menuItemClass} ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <MapPin size={18} />
          Cities
        </NavLink>

        <NavLink
          to="/admin/exams"
          className={({ isActive }) =>
            `${menuItemClass} ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <FileText size={18} />
          Exams
        </NavLink>

        <NavLink
          to="/admin/centre"
          className={({ isActive }) =>
            `${menuItemClass} ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <Building2 size={18} />
          Centres
        </NavLink>

        <NavLink
          to="/admin/candidates"
          className={({ isActive }) =>
            `${menuItemClass} ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <UserCheck size={18} />
          Candidates
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            window.location.href = "/admin/login";
          }}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
