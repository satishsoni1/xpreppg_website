import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { StudentAPI } from "@/services/studentApi";
import { Info, Loader2 } from "lucide-react";

export default function StudentLogin() {
  const navigate = useNavigate(); // ✅ Initialize hook
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ mobile: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const data = await StudentAPI.login(formData);
  
      if (data.status) {
        // ✅ SUCCESS
        localStorage.setItem("token", data.token);
        localStorage.setItem("x_user_name", data.user.name);
        localStorage.setItem("x_user_email", data.user.email);
        localStorage.setItem("x_user_mobile", formData.mobile);
        
        // Check for pending enrollment
        const pendingPlan = localStorage.getItem("x_selected_plan");
        if (pendingPlan) {
            const plan = JSON.parse(pendingPlan);
            const params = new URLSearchParams({
                planId: String(plan.planId),
                amount: String(plan.amount),
                title: plan.title,
                mobile: formData.mobile,
                name: data.user.name,
                email: data.user.email
            });
            localStorage.removeItem("x_selected_plan");
            navigate(`/enroll?${params.toString()}`);
        } else {
            navigate("/student/dashboard");
        }
      } else {
        alert(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700">Student Login</h1>
          <p className="text-gray-500 mt-2">Welcome back! Please login to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input 
              type="tel" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Enter registered mobile"
              value={formData.mobile}
              onChange={e => setFormData({...formData, mobile: e.target.value})}
            />
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
             <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Enter password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div className="mt-2 flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>
                <strong>Default Password:</strong> First 4 letters of Name + Last 4 digits of Mobile No. <br />
                <span className="text-blue-400">(e.g., If Name: <strong>Rahul</strong>, Mobile: ...<strong>1234</strong> → Pass: <strong>RAHU1234</strong>)</span>
              </p>
            </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            First time here?{" "}
            {/* ✅ FIX: Redirect to Index Page for Registration */}
            <button 
              onClick={() => navigate("/?register=true")} 
              className="text-emerald-600 font-semibold hover:underline"
            >
              Register Now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}