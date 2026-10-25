import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, RefreshCw } from "lucide-react";
import logo from "@/assets/logo.png";
import InfluencerDashboardView from "@/components/InfluencerDashboardView";
import { InfluencerAPI, INFLUENCER_TOKEN_KEY, InfluencerDashboard } from "@/services/influencerApi";

export default function InfluencerPortal() {
  const navigate = useNavigate();
  const [data, setData] = useState<InfluencerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem(INFLUENCER_TOKEN_KEY);
    localStorage.removeItem("influencer_name");
    navigate("/influencer/login");
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await InfluencerAPI.getDashboard({ from, to });
      // Expired token or account disabled by admin → back to login
      if (res.httpStatus === 401 || res.httpStatus === 403) { logout(); return; }
      if (res.status) setData(res); else setError(res.message || "Could not load your dashboard.");
    } catch {
      setError("Something went wrong. Please check your connection.");
    } finally { setLoading(false); }
  }, [from, to, logout]);

  useEffect(() => {
    if (!localStorage.getItem(INFLUENCER_TOKEN_KEY)) { navigate("/influencer/login"); return; }
    load();
  }, [load, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="XPrepPG" className="w-14 object-contain" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-navy truncate">{data?.name || localStorage.getItem("influencer_name") || "Influencer"}</p>
              <p className="text-xs text-gray-400">Influencer dashboard</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your sales</h1>
            <p className="text-sm text-gray-500">Poster and flash card orders paid with your promo codes</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-gray-500">
              From
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="block mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
            </label>
            <label className="text-xs text-gray-500">
              To
              <input type="date" value={to} onChange={e => setTo(e.target.value)} className="block mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
            </label>
            <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</p>}
        {loading && !data ? (
          <div className="text-center py-20 text-gray-400"><Loader2 className="animate-spin mx-auto" /></div>
        ) : data && (
          <InfluencerDashboardView data={data} />
        )}
      </main>
    </div>
  );
}
