import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState({ mobile: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res: any = await StudentAPI.login(creds);
      if (res.status) {
        localStorage.setItem("student_user", JSON.stringify(res.data.user));
        navigate("/student/dashboard");
      } else {
        setError(res.message || "Invalid Mobile Number or Password");
      }
    } catch (err) {
      setError("Unable to sign in. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-emerald-800 tracking-tight">Student Portal</h1>
          <p className="text-gray-500 text-sm mt-2">
            Sign in to access your Admit Card and Exam Results
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Mobile Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="e.g. 9876543210"
              value={creds.mobile}
              onChange={(e) => setCreds({ ...creds, mobile: e.target.value })}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 p-3 rounded-lg pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="Enter your password"
                value={creds.password}
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password Helper Text */}
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              <span className="font-medium text-gray-700">Format:</span> First 4 letters of your Name + Last 4 digits of Mobile <br/>
              <span className="italic text-gray-400">(e.g., Name: Rahul, Mobile: 9999... &rarr; Password: RAHU9999)</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}