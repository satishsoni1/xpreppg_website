import { useEffect, useState } from "react";
import { Check, Star, Loader2, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PublicAPI } from "@/services/publicApi";

export default function Pricing() {
  const navigate = useNavigate();

  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load plans
  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        const res = await PublicAPI.getPlans();
        if (res.status && Array.isArray(res.plans)) {
          setTiers(res.plans);
        } else {
          setError("No active plans available at the moment.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load pricing plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  // Handle Enrollment Click
  const handleEnrollClick = (tier: any) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("x_user_name");

    // 1. Prepare Plan Data
    const selectedPlan = {
      planId: tier.id,
      title: tier.name,
      amount: tier.selling_price,
      originalAmount: tier.original_price,
      examCount: tier.exams_count
    };

    // 2. Logic: If NOT logged in, save plan & open Auth Modal
    if (!token || !user) {
      localStorage.setItem("x_selected_plan", JSON.stringify(selectedPlan));
      // Dispatch event to open the register modal available in the layout
      window.dispatchEvent(new Event("open-register-modal"));
      return;
    }

    // 3. Logic: If Already Logged in, go to Payment Page
    const params = new URLSearchParams({
      planId: String(selectedPlan.planId),
      amount: String(selectedPlan.amount),
      title: selectedPlan.title
    });

    navigate(`/student/login`);
  };

  // We take the first active plan to display (assuming the 999 plan is the primary one)
  const primaryPlan = tiers.length > 0 ? tiers[0] : null;

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute top-48 -left-24 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <div className="w-20 h-1.5 bg-emerald-500 mx-auto my-6 rounded-full" />
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get instant access to high-yield CBT exams and analytics. No hidden fees.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600 w-12 h-12 mb-4" />
            <p className="text-slate-500 font-medium">Loading best offers...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* --- MAIN PRICING CARD --- */}
        {!loading && !error && primaryPlan && (
          <div className="flex justify-center mb-20">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 transform transition-all hover:scale-[1.02] duration-300 overflow-hidden">
              
              {/* Badge */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              <div className="absolute top-6 right-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-l-full uppercase tracking-wider border-l border-y border-emerald-200 shadow-sm flex items-center gap-1">
                <Star size={12} fill="currentColor" /> Best Value
              </div>

              <div className="p-8 sm:p-10">
                {/* Plan Title */}
                <div className="text-left mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    {primaryPlan.name || "Grand CBT Pack"}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Complete access to all mock exams
                  </p>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-extrabold text-slate-900">
                    ₹{primaryPlan.selling_price}
                  </span>
                  {primaryPlan.original_price && (
                    <span className="text-lg text-slate-400 line-through decoration-slate-400/50">
                      ₹{primaryPlan.original_price}
                    </span>
                  )}
                </div>

                {/* Feature Highlights inside Card */}
                <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100 text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 p-1 rounded-full shrink-0 mt-0.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium">Access to {primaryPlan.exams_count || "All"} Full-Length Exams</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full shrink-0 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600" fill="currentColor" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium">Detailed Analytics & AI Insights</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleEnrollClick(primaryPlan)}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg 
                    hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-200 
                    transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2"
                >
                  Register Now
                </button>
                <p className="text-xs text-center text-slate-400 mt-4">
                  Secure payment via Razorpay. Instant activation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global Features Grid */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-lg font-bold text-slate-700 mb-8 uppercase tracking-widest text-center">
            Everything you need to succeed
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { t: "Real Exam Interface", d: "Simulate the exact NBE exam environment." },
              { t: "Subject-wise Analytics", d: "Identify weak areas with precision." },
              { t: "All India Rank", d: "Compare your performance with thousands." },
              { t: "Expert Explanations", d: "Detailed solutions for every question." },
              { t: "Mobile Friendly", d: "Practice anywhere, anytime on any device." },
              { t: "24/7 Support", d: "Dedicated team to help you succeed." },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4 items-start">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 shrink-0">
                  <Check className="w-5 h-5" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{feature.t}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{feature.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}