import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { LayoutDashboard, FileText, CreditCard, User, LogOut, Menu, X, PlayCircle, BarChart2 } from "lucide-react";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Basic Check for Auth (Replace with your actual Auth Context/Hook)
  useEffect(() => {
    const token = localStorage.getItem("student_token");
    if (!token) {
      navigate("/student/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("student_token");
    localStorage.removeItem("student_user");
    navigate("/student/login");
  };

  // const navItems = [
  //   { name: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard size={20} /> },
  //   { name: "Discussions", path: "/student/videos", icon: <PlayCircle size={20} /> }, // NEW
  //   { name: "Exams & Payment", path: "/student/exams", icon: <CreditCard size={20} /> },
  //   { name: "Admit Card", path: "/student/admit-card", icon: <FileText size={20} /> },
  //   { name: "Profile & Settings", path: "/student/profile", icon: <User size={20} /> },
  // ];
  const navItems = [
    { name: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "My Exams", path: "/student/enroll", icon: <CreditCard size={20} /> },
    { name: "Admit Card", path: "/student/admit-card", icon: <FileText size={20} /> },
    { name: "Performance Report", path: "/student/report-card", icon: <BarChart2 size={20} /> }, // ✅ NEW
    { name: "Discussions", path: "/student/videos", icon: <PlayCircle size={20} /> },
    { name: "Profile", path: "/student/profile", icon: <User size={20} /> },
  ];
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-emerald-700">Student Portal</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header (Mobile Only) */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-gray-800">Student Panel</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}