import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import { Info, Loader2, Key, X, CheckCircle } from "lucide-react";
import { PublicAPI } from "@/services/publicApi";

interface City {
  id: number;
  name: string;
  is_active: boolean;
}

export default function StudentLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ mobile: "", password: "" });
  const [cities, setCities] = useState<City[]>([]);
  
  // Forgot Password States
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // Step 1: Email, Step 2: OTP
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  // Data State
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOTP, setForgotOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    PublicAPI.getCities()
      .then((res) => setCities(res.cities))
      .catch(() => console.error("Failed to load cities"));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const data = await StudentAPI.login(formData);
  
      if (data.token) {
        localStorage.setItem("student_token", data.token);
        localStorage.setItem("student_user", JSON.stringify(data.user));
        
        const cityStatus = cities.find((c: any) => c.name === data.user.city);
        if (cityStatus && !cityStatus.is_active) {
          alert(`Login Restricted.\n\nThe slots for "${data.user.city}" are currently full. Our team will contact you directly.`);
          localStorage.removeItem("student_token");
          localStorage.removeItem("student_user");
          setLoading(false);
          return; 
        }
        
        localStorage.setItem("x_user_mobile", data.user.mobile); 

        const pendingPlan = localStorage.getItem("x_selected_plan");
        if (pendingPlan) {
            localStorage.removeItem("x_selected_plan");
            navigate("/student/dashboard");
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

  // Step 1: Request OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);

    try {
      const data = await StudentAPI.sendResetOTP(forgotEmail);
      if (data.status) {
        setForgotMessage({ msg: "OTP sent to your email!", type: 'success' });
        setForgotStep(2); // Move to Step 2
      } else {
        setForgotMessage({ msg: data.message || "Email not found.", type: 'error' });
      }
    } catch (error) {
      setForgotMessage({ msg: "Server error. Try again.", type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify & Reset
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);

    try {
      const payload = { email: forgotEmail, otp: forgotOTP, newPassword: newPassword };
      const data = await StudentAPI.verifyOTPAndReset(payload);
      
      if (data.status) {
        setForgotMessage({ msg: data.message, type: 'success' });
        setTimeout(() => {
            // Reset and close
            setIsForgotModalOpen(false);
            setForgotStep(1);
            setForgotEmail("");
            setForgotOTP("");
            setNewPassword("");
            setForgotMessage(null);
        }, 2500);
      } else {
        setForgotMessage({ msg: data.message || "Invalid OTP.", type: 'error' });
      }
    } catch (error) {
      setForgotMessage({ msg: "Server error. Try again.", type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setIsForgotModalOpen(false);
    setForgotStep(1);
    setForgotMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-fade-in relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Student Login</h1>
          <p className="text-gray-500 mt-2">Welcome back! Please login to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input 
              type="tel" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Enter registered mobile"
              value={formData.mobile}
              onChange={e => setFormData({...formData, mobile: e.target.value})}
            />
          </div>
          
          <div>
             <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {/* 🟢 Forgot Password Link */}
                <button 
                  type="button" 
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-primary hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
             </div>
             <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Enter password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <div className="mt-2 flex items-start gap-2 text-xs text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
              <p>
                <strong>Default Password:</strong> First 4 letters of Name (CAPS) + Last 4 digits of Mobile No. <br />
                <span className="text-blue-500/80">(e.g., If Name: <strong>Rahul</strong>, Mobile: ...<strong>1234</strong> → Pass: <strong>RAHU1234</strong>)</span>
              </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Login to Dashboard"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            First time here?{" "}
            <button 
              onClick={() => navigate("/?register=true")} 
              className="text-emerald-600 font-bold hover:underline"
            >
              Register Now
            </button>
          </p>
        </div>
      </div>

      {/* 🟢 2-STEP EMAIL OTP FORGOT PASSWORD MODAL 🟢 */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-lg text-emerald-800 flex items-center gap-2">
                <Key size={20} className="text-emerald-600" /> Password Reset
              </h2>
              <button onClick={closeForgotModal} className="text-emerald-600 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* STEP 1: REQUEST OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <p className="text-sm text-slate-500 mb-2">
                    Enter your registered email address to receive a 6-digit verification code.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Registered Email</label>
                    <input 
                      required type="email" 
                      value={forgotEmail} 
                      onChange={e => setForgotEmail(e.target.value)} 
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="e.g. student@gmail.com"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={forgotLoading || !forgotEmail} 
                    className="w-full mt-2 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-secondary disabled:bg-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {forgotLoading ? <Loader2 size={20} className="animate-spin"/> : "Send OTP to Email"}
                  </button>
                </form>
              )}

              {/* STEP 2: VERIFY OTP & SET PASSWORD */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <p className="text-sm text-slate-500 mb-2">
                    Code sent to <strong className="text-slate-800">{forgotEmail}</strong>. Please check your inbox/spam folder.
                  </p>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">6-Digit OTP</label>
                    <input 
                      required type="text" 
                      maxLength={6}
                      value={forgotOTP} 
                      onChange={e => setForgotOTP(e.target.value.replace(/\D/g, ''))} // Numeric only
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono text-center tracking-widest text-lg font-bold"
                      placeholder="• • • • • •"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Create New Password</label>
                    <input 
                      required type="text" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      className="w-full mt-1 p-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold transition-all"
                      placeholder="Enter new password"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={forgotLoading || forgotOTP.length < 6 || !newPassword} 
                    className="w-full mt-2 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-secondary disabled:bg-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {forgotLoading ? <Loader2 size={20} className="animate-spin"/> : "Verify & Reset Password"}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => { setForgotStep(1); setForgotMessage(null); }}
                    className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 mt-2"
                  >
                    Wrong Email? Go back
                  </button>
                </form>
              )}

              {/* Status Message */}
              {forgotMessage && (
                <div className={`mt-4 p-3 rounded-xl text-sm font-bold flex items-start gap-2 ${forgotMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                  {forgotMessage.type === 'success' ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <Info size={18} className="mt-0.5 shrink-0" />}
                  <span>{forgotMessage.msg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}