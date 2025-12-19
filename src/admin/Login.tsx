import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { AuthAPI } from "@/services/api";
import Navigation from "./Navigation";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    if (!form.email || !form.password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await AuthAPI.adminLogin(form);

      if (!res.data.status) {
        setError(res.data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_token", res.data.token);
      window.location.href = "/admin";
    } catch {
      setError("Unable to login. Check connection or credentials.");
      setLoading(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-100">
      <Navigation />

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
              <ShieldCheck className="text-emerald-600" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
            <p className="text-sm text-gray-500 mt-1">
              Secure access to admin dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="admin@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={login}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all
              ${loading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-md"
              }`}
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </span>
            ) : (
              "Login to Admin Panel"
            )}
          </button>

          {/* Footer */}
          <p className="text-xs text-center text-gray-400 mt-6">
            Authorized personnel only
          </p>

        </div>
      </div>
    </div>
  );
}
