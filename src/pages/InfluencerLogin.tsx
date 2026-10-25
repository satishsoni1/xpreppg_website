import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn, UserCheck } from "lucide-react";
import logo from "@/assets/logo.png";
import { InfluencerAPI, INFLUENCER_TOKEN_KEY } from "@/services/influencerApi";

export default function InfluencerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await InfluencerAPI.login(email, password);
      if (!res.status) { setError(res.message || "Login failed."); return; }
      localStorage.setItem(INFLUENCER_TOKEN_KEY, res.token);
      localStorage.setItem("influencer_name", res.influencer.name);
      navigate("/influencer");
    } catch {
      setError("Something went wrong. Please check your connection.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navyLight flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <img src={logo} alt="XPrepPG" className="w-20 mx-auto mb-5 object-contain" />
        <div className="flex items-center justify-center gap-2 mb-1">
          <UserCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-navy">Influencer Login</h1>
        </div>
        <p className="text-sm text-gray-400 text-center mb-6">Track sales made with your promo codes</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
          <input
            type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <input
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-bold transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-5">Your login is created by the XPrepPG team.</p>
      </div>
    </div>
  );
}
