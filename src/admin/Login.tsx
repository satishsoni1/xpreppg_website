import { useState } from "react";
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

    } catch (err) {
      setError("Unable to login. Check connection or credentials.");
      setLoading(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") login();
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="bg-white p-8 shadow-lg rounded-xl w-full max-w-md">

          <h1 className="text-2xl font-bold mb-5 text-center text-gray-800">
            Admin Login
          </h1>

          {error && (
            <p className="text-red-600 mb-3 text-center font-medium">{error}</p>
          )}

          {/* Email Input */}
          <input
            className="border p-3 w-full rounded mb-3 focus:ring-2 focus:ring-emerald-500"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyPress={handleKeyPress}
          />

          {/* Password Input */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              className="border p-3 w-full rounded focus:ring-2 focus:ring-emerald-500"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyPress={handleKeyPress}
            />

            {/* Show Password Toggle */}
            <span
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Login Button */}
          <button
            onClick={login}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold 
            ${loading ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
