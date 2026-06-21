import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2, BookOpen, Monitor } from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

type Portal = "XRevise" | "CBT";

const PORTAL_CONFIG = {
  XRevise: {
    label: "XRevise Admin",
    subtitle: "Manage revision schedule, students & questions",
    icon: <BookOpen size={28} className="text-emerald-400" />,
    accent: "text-emerald-400",
    ring: "focus:ring-emerald-500",
    btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20",
    border: "border-emerald-500",
  },
  CBT: {
    label: "CBT Admin",
    subtitle: "Manage Computer Based Test exams & results",
    icon: <Monitor size={28} className="text-blue-400" />,
    accent: "text-blue-400",
    ring: "focus:ring-blue-500",
    btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-900/20",
    border: "border-blue-500",
  },
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const [portal, setPortal] = useState<Portal | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cfg = portal ? PORTAL_CONFIG[portal] : null;

  const handlePortalSelect = (p: Portal) => {
    setPortal(p);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portal) return;
    setLoading(true);
    setError("");
    try {
      const data = await AdminAPI.login(formData);
      if (data.status) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.admin));
        localStorage.setItem("admin_portal", portal);
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-10">
      <div className="w-full max-w-md space-y-6 animate-fade-in">

        {/* Brand */}
        <div className="text-center">
          <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-slate-700">
            <ShieldCheck size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">XPrep<span className="text-emerald-400">PG</span></h1>
          <p className="text-slate-400 mt-1 text-sm">Secure admin access</p>
        </div>

        {/* Step 1 — Portal Selection */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">
            {portal ? "Selected Portal" : "Step 1 — Choose your portal"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["XRevise", "CBT"] as Portal[]).map((p) => {
              const c = PORTAL_CONFIG[p];
              const isSelected = portal === p;
              return (
                <button
                  key={p}
                  onClick={() => handlePortalSelect(p)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? `${c.border} bg-slate-700`
                      : "border-slate-700 hover:border-slate-500 hover:bg-slate-750"
                  }`}
                >
                  {c.icon}
                  <span className={`font-bold text-sm ${isSelected ? c.accent : "text-slate-300"}`}>{c.label}</span>
                  <span className="text-slate-500 text-[10px] text-center leading-tight">{c.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Login Form (only shown after portal selected) */}
        {portal && cfg && (
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 animate-fade-in">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 text-center">
              Step 2 — Login to <span className={cfg.accent}>{cfg.label}</span>
            </p>

            {error && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="email" required
                    className={`w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 ${cfg.ring} focus:border-transparent outline-none transition-all placeholder:text-slate-600`}
                    placeholder="admin@xpreppg.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    type="password" required
                    className={`w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 ${cfg.ring} focus:border-transparent outline-none transition-all placeholder:text-slate-600`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className={`w-full ${cfg.btn} text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Enter {cfg.label} <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-slate-500 text-xs">
          Authorized personnel only. All activities are monitored.
        </p>
      </div>
    </div>
  );
}
