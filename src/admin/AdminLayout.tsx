import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileQuestion, Users, CreditCard,
  MapPin, LogOut, FileText, Menu, ChevronLeft,
  Package, Ticket, BarChart3, Award, ImageIcon,
  CalendarDays, MessageSquare, Monitor, Tag, ShoppingBag, Bell,
  BookOpen, ChevronRight, Upload, Database, GraduationCap,
  ListChecks, Play, PieChart, Layers,
} from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

type Portal = "XRevise" | "CBT";

const PORTAL_COLOR: Record<Portal, string> = {
  XRevise: "text-emerald-400",
  CBT: "text-blue-400",
};

const PORTAL_BADGE_CLASS: Record<Portal, string> = {
  XRevise: "bg-primary/10 text-primary",
  CBT: "bg-blue-100 text-blue-700",
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [badges, setBadges] = useState({ xrevise_new: 0, cbt_new: 0 });
  const [portal, setPortal] = useState<Portal>(() => {
    return (localStorage.getItem("admin_portal") as Portal) || "XRevise";
  });

  useEffect(() => {
    if (window.innerWidth < 768) setIsOpen(false);
  }, []);

  useEffect(() => {
    AdminAPI.getStats().then(res => {
      if (res.status && res.stats) {
        setBadges({
          xrevise_new: res.stats.xrevise?.new_24h || 0,
          cbt_new: res.stats.cbt?.new_24h || 0,
        });
      }
    }).catch(() => {});
  }, [location.pathname]);

  const switchPortal = (p: Portal) => {
    setPortal(p);
    localStorage.setItem("admin_portal", p);
    navigate("/admin/dashboard");
  };

  // Menus per portal
  const xreviseMenu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "XRevise Students", path: "/admin/xrevise/students", icon: <Users size={18} />, badge: badges.xrevise_new },
    { name: "XRevise Enrollments", path: "/admin/xrevise/enrollments", icon: <ListChecks size={18} /> },
    { name: "XRevise Exams", path: "/admin/xrevise/exams", icon: <FileText size={18} /> },
    { name: "XRevise Schedule", path: "/admin/xrevise/schedule", icon: <CalendarDays size={18} /> },
    { name: "XRevise Questions", path: "/admin/xrevise/questions", icon: <FileQuestion size={18} /> },
    { name: "XRevise Phases", path: "/admin/xrevise/phases", icon: <Layers size={18} /> },
    { name: "XRevise Plans", path: "/admin/xrevise/plans", icon: <Package size={18} /> },
    { name: "XRevise Coupons", path: "/admin/xrevise/coupons", icon: <Ticket size={18} /> },
    { name: "XRevise Orders", path: "/admin/xrevise/orders", icon: <CreditCard size={18} /> },
    { name: "Media Upload", path: "/admin/media", icon: <ImageIcon size={18} /> },
    { name: "─── Exam Manager ───", path: "", icon: null },
    { name: "Question Bank", path: "/admin/em/question-bank", icon: <Database size={18} /> },
    { name: "Enrollments (EM)", path: "/admin/em/enrollments", icon: <ListChecks size={18} /> },
    { name: "Analytics (EM)", path: "/admin/em/analytics", icon: <PieChart size={18} /> },
    { name: "Exam Simulator", path: "/admin/em/simulator", icon: <Play size={18} /> },
    { name: "─── Platform ───", path: "", icon: null },
    { name: "Enrollments", path: "/admin/enrollments", icon: <CreditCard size={18} /> },
    { name: "Plans", path: "/admin/plans", icon: <Package size={18} /> },
    { name: "Coupons", path: "/admin/coupons", icon: <Ticket size={18} /> },
    { name: "Posters", path: "/admin/posters", icon: <ImageIcon size={18} /> },
    { name: "Poster Packages", path: "/admin/poster-packages", icon: <Package size={18} /> },
    { name: "Poster Promos", path: "/admin/poster-promos", icon: <Tag size={18} /> },
    { name: "Poster Orders", path: "/admin/poster-orders", icon: <ShoppingBag size={18} /> },
    { name: "WhatsApp Scheduler", path: "/admin/whatsapp-scheduler", icon: <MessageSquare size={18} /> },
    { name: "Reports", path: "/admin/report", icon: <BarChart3 size={18} /> },
  ];

  const cbtMenu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "CBT Students", path: "/admin/cbt/students", icon: <Users size={18} />, badge: badges.cbt_new },
    { name: "CBT Exams", path: "/admin/exams", icon: <Monitor size={18} /> },
    { name: "CBT Questions", path: "/admin/questions", icon: <FileQuestion size={18} /> },
    { name: "Media Upload", path: "/admin/media", icon: <ImageIcon size={18} /> },
    { name: "─── Exam Manager ───", path: "", icon: null },
    { name: "Question Bank", path: "/admin/em/question-bank", icon: <Database size={18} /> },
    { name: "CBT Exams (EM)", path: "/admin/em/exams", icon: <GraduationCap size={18} /> },
    { name: "Enrollments (EM)", path: "/admin/em/enrollments", icon: <ListChecks size={18} /> },
    { name: "Analytics (EM)", path: "/admin/em/analytics", icon: <PieChart size={18} /> },
    { name: "Exam Simulator", path: "/admin/em/simulator", icon: <Play size={18} /> },
    { name: "─── Platform ───", path: "", icon: null },
    { name: "Attempted Result", path: "/admin/attempt", icon: <Award size={18} /> },
    { name: "Generate Result", path: "/admin/result-generate", icon: <Upload size={18} /> },
    { name: "Enrollments", path: "/admin/enrollments", icon: <CreditCard size={18} /> },
    { name: "Plans", path: "/admin/plans", icon: <Package size={18} /> },
    { name: "Coupons", path: "/admin/coupons", icon: <Ticket size={18} /> },
    { name: "Centers & Cities", path: "/admin/centers", icon: <MapPin size={18} /> },
    { name: "WhatsApp Scheduler", path: "/admin/whatsapp-scheduler", icon: <MessageSquare size={18} /> },
    { name: "Reports", path: "/admin/report", icon: <BarChart3 size={18} /> },
  ];

  const menuItems = portal === "XRevise" ? xreviseMenu : cbtMenu;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("admin_portal");
      navigate("/admin/login");
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) setIsOpen(false);
  };

  const NavLink = ({ item }: { item: { name: string; path: string; icon: React.ReactNode | null; badge?: number } }) => {
    if (!item.path) {
      if (!isOpen) return null;
      return (
        <div className="px-3 pt-3 pb-1">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest truncate">{item.name.replace(/─/g,"").trim()}</p>
        </div>
      );
    }
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
    return (
      <Link
        to={item.path}
        onClick={handleLinkClick}
        title={!isOpen ? item.name : ""}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
          isActive
            ? portal === "XRevise" ? "bg-emerald-600 text-white shadow-md" : "bg-blue-600 text-white shadow-md"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <div className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white transition-colors"}`}>
          {item.icon}
        </div>
        <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 text-sm ${!isOpen ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
          {item.name}
        </span>
        {item.badge != null && item.badge > 0 && isOpen && (
          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shrink-0">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
      </Link>
    );
  };

  const portalBadgeNew = portal === "XRevise" ? badges.xrevise_new : badges.cbt_new;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans relative overflow-hidden">

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col fixed md:relative z-30 h-screen shadow-2xl md:shadow-none ${
          isOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 w-20 hidden md:flex"
        }`}
      >
        {/* Logo + Portal Switcher */}
        <div className="h-auto flex flex-col border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="h-14 flex items-center justify-between px-4">
            <h1 className={`font-bold text-xl tracking-tight ${!isOpen && "hidden"}`}>
              <span className={portal === "XRevise" ? "text-emerald-400" : "text-blue-400"}>X</span>
              <span className="text-white">PrepPG</span>
            </h1>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition hidden md:flex items-center justify-center"
            >
              <ChevronLeft size={20} className={`transform transition-transform ${!isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Portal toggle inside sidebar */}
          {isOpen && (
            <div className="px-3 pb-3">
              <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs font-bold">
                <button
                  onClick={() => switchPortal("XRevise")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
                    portal === "XRevise" ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <BookOpen size={13} /> XRevise
                </button>
                <button
                  onClick={() => switchPortal("CBT")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
                    portal === "CBT" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <Monitor size={13} /> CBT
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink key={item.path + item.name} item={item} />
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 bg-slate-900 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 group"
            title="Logout"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform shrink-0" />
            <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${!isOpen ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 relative w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            {/* Portal badge in header */}
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              portal === "XRevise" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
            }`}>
              {portal === "XRevise" ? <BookOpen size={11} className="inline mr-1" /> : <Monitor size={11} className="inline mr-1" />}
              {portal} Portal
            </span>
            <h2 className="text-gray-700 font-semibold text-sm capitalize hidden sm:block">
              {location.pathname.split("/").slice(2).join(" / ").replace(/-/g, " ") || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Switch portal button */}
            <button
              onClick={() => switchPortal(portal === "XRevise" ? "CBT" : "XRevise")}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                portal === "XRevise"
                  ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              Switch to {portal === "XRevise" ? "CBT" : "XRevise"} <ChevronRight size={13} />
            </button>

            {portalBadgeNew > 0 && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${PORTAL_BADGE_CLASS[portal]}`}>
                <Bell size={10} /> {portalBadgeNew} new
              </span>
            )}

            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-gray-900 leading-tight">Super Admin</p>
              <p className={`text-xs font-medium ${PORTAL_COLOR[portal]}`}>{portal} Portal</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border shadow-sm ${
              portal === "XRevise" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-100 text-blue-700 border-blue-200"
            }`}>
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
