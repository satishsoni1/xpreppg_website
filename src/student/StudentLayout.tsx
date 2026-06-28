import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, FileText, CreditCard, User, LogOut,
  Menu, X, PlayCircle, BarChart2, Calendar, BookOpen, Monitor, ChevronRight,
} from "lucide-react";


type PortalMode = "XRevise" | "CBT";

const NAV_CBT = [
  { name: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "CBT Exams", path: "/student/cbt-exams", icon: <Monitor size={20} /> },
  { name: "My Exams", path: "/student/enroll", icon: <CreditCard size={20} /> },
  { name: "Admit Card", path: "/student/admit-card", icon: <FileText size={20} /> },
  { name: "Performance Report", path: "/student/report-card", icon: <BarChart2 size={20} /> },
  { name: "Profile", path: "/student/profile", icon: <User size={20} /> },
];

const NAV_XREVISE = [
  { name: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Enroll", path: "/student/xrevise-enroll", icon: <CreditCard size={20} /> },
  { name: "Daily Tests", path: "/student/daily-tests", icon: <Calendar size={20} /> },
  { name: "My Results", path: "/student/xrevise-attempts", icon: <BarChart2 size={20} /> },
  { name: "Profile", path: "/student/profile", icon: <User size={20} /> },
];

const PORTAL_CFG = {
  XRevise: {
    activeClass: "bg-emerald-50 text-emerald-700",
    accent: "text-emerald-600",
    badgeClass: "bg-emerald-100 text-emerald-700",
    icon: <BookOpen size={14} />,
    switchLabel: "Switch to CBT",
    switchTarget: "CBT" as PortalMode,
  },
  CBT: {
    activeClass: "bg-blue-50 text-blue-700",
    accent: "text-blue-600",
    badgeClass: "bg-blue-100 text-blue-700",
    icon: <Monitor size={14} />,
    switchLabel: "Switch to XRevise",
    switchTarget: "XRevise" as PortalMode,
  },
};

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [portal, setPortal] = useState<PortalMode>("XRevise");
  const [hasBoth, setHasBoth] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("student_token");
    if (!token) { navigate("/student/login"); return; }

    const stored = localStorage.getItem("student_user");
    if (stored) {
      const u = JSON.parse(stored);
      const regType: string = u.registration_type || "XRevise";
      const both = regType === "Both";
      setHasBoth(both);

      // Use the portal that was selected at login time
      const savedPortal = localStorage.getItem("student_active_portal") as PortalMode | null;
      if (savedPortal) {
        setPortal(savedPortal);
      } else {
        setPortal(regType === "CBT" ? "CBT" : "XRevise");
      }
    }
  }, [navigate]);

  const switchPortal = (mode: PortalMode) => {
    setPortal(mode);
    localStorage.setItem("student_active_portal", mode);
    navigate("/student/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("student_token");
    localStorage.removeItem("student_user");
    localStorage.removeItem("student_portal");
    localStorage.removeItem("student_active_portal");
    navigate("/student/login");
  };

  const navItems = portal === "CBT" ? NAV_CBT : NAV_XREVISE;
  const cfg = PORTAL_CFG[portal];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${portal === "XRevise" ? "bg-emerald-100" : "bg-blue-100"}`}>
              {portal === "XRevise" ? <BookOpen size={16} className="text-emerald-600" /> : <Monitor size={16} className="text-blue-600" />}
            </span>
            <span className={`text-base font-bold ${cfg.accent}`}>
              {portal} Portal
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X size={22} /></button>
        </div>

        {/* Portal switcher — only if registered for Both */}
        {hasBoth && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-bold">
              <button
                onClick={() => switchPortal("XRevise")}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 transition-colors ${
                  portal === "XRevise" ? "bg-emerald-600 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <BookOpen size={12} /> XRevise
              </button>
              <button
                onClick={() => switchPortal("CBT")}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 transition-colors ${
                  portal === "CBT" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Monitor size={12} /> CBT
              </button>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? cfg.activeClass
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 lg:hidden">
            <Menu size={24} />
          </button>

          {/* Portal badge */}
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${cfg.badgeClass}`}>
            {cfg.icon} {portal} Portal
          </span>

          {/* Switch portal button — if Both registered */}
          {hasBoth && (
            <button
              onClick={() => switchPortal(cfg.switchTarget)}
              className={`hidden sm:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ml-auto transition-colors ${
                portal === "XRevise"
                  ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {cfg.switchLabel} <ChevronRight size={12} />
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet context={{ portal }} />
        </main>
      </div>
    </div>
  );
}
