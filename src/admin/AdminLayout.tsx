import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, FileQuestion, Users, CreditCard, 
  MapPin, LogOut, FileText, Menu, ChevronLeft, 
  Package,
  Ticket,
  Upload,
  BarChart3
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Manage Exams", path: "/admin/exams", icon: <FileText size={20} /> },
    { name: "Upload JSON", path: "/admin/upload-json", icon: <Upload size={20} /> }, // ✅ New Item
    { name: "Question Bank", path: "/admin/questions", icon: <FileQuestion size={20} /> },
    { name: "Student List", path: "/admin/students", icon: <Users size={20} /> },
    { name: "Reports", path: "/admin/report", icon: <BarChart3 size={20} /> },
    { name: "Enrollments", path: "/admin/enrollments", icon: <CreditCard size={20} /> },
    { name: "Centers & Cities", path: "/admin/centers", icon: <MapPin size={20} /> },
    { name: "Plans", path: "/admin/plans", icon: <Package size={20} /> },
    { name: "Coupons", path: "/admin/coupons", icon: <Ticket size={20} /> },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      navigate("/admin/login");
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 text-white transition-all duration-300 flex flex-col fixed md:relative z-20 h-screen ${
          isOpen ? "w-64" : "w-20 hidden md:flex"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900">
          <h1 className={`font-bold text-xl tracking-tight ${!isOpen && "hidden"}`}>
            XPrep <span className="text-emerald-500">Admin</span>
          </h1>
          {/* Toggle Button (Desktop) */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition hidden md:block"
          >
            <ChevronLeft size={20} className={`transform transition-transform ${!isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menu.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!isOpen ? item.name : ""}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                  {item.icon}
                </div>
                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${!isOpen ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300 group`}
            title="Logout"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${!isOpen ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
           <div className="flex items-center gap-4">
             {/* Mobile Menu Toggle */}
             <button 
               onClick={() => setIsOpen(!isOpen)}
               className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
             >
               <Menu size={24} />
             </button>
             
             <h2 className="text-gray-800 font-bold text-lg capitalize flex items-center gap-2">
               {location.pathname.split("/")[2]?.replace("-", " ") || "Dashboard"}
             </h2>
           </div>

           <div className="flex items-center gap-3">
             <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-900">Super Admin</p>
                <p className="text-xs text-gray-500">admin@xprep.com</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                A
             </div>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}