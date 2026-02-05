import { useEffect, useState } from "react";
import { Check, Star, Loader2, Zap, Shield, Crown } from "lucide-react";
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

  // ✅ UPDATED: Always redirect to Register
  const handleEnrollClick = (tier: any) => {
    // 1. Prepare Plan Data
    const selectedPlan = {
      planId: tier.id,
      title: tier.name,
      amount: tier.selling_price,
      originalAmount: tier.original_price,
      examCount: tier.exams_count
    };

    // 2. Save plan to local storage so the Register Modal knows what to buy after signup
    localStorage.setItem("x_selected_plan", JSON.stringify(selectedPlan));

    // 3. Trigger the Registration Modal (or navigate to /register page)
    window.dispatchEvent(new Event("open-register-modal"));
    
    // Optional: If you use a separate page instead of a modal, use this:
    // navigate("/student/register");
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute top-48 -left-24 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Choose Your Success Plan
          </h2>
          <div className="w-20 h-1.5 bg-emerald-500 mx-auto my-6 rounded-full" />
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Flexible packages designed for every stage of your preparation.
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

        {/* --- PRICING GRID --- */}
        {!loading && !error && tiers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-20">
            {tiers.map((tier, index) => {
              // Highlight the middle plan (Standard) or manually check name
              const isPopular = index === 1 || tier.name === "Standard"; 

              return (
                <div 
                  key={tier.id}
                  className={`relative flex flex-col bg-white rounded-3xl transition-all duration-300 overflow-hidden
                    ${isPopular 
                      ? "shadow-2xl border-2 border-emerald-500 transform md:-translate-y-4 z-10" 
                      : "shadow-lg border border-slate-200 hover:shadow-xl hover:border-emerald-200"
                    }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
                  )}
                  {isPopular && (
                    <div className="absolute top-5 right-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-l-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Star size={12} fill="currentColor" /> Most Popular
                    </div>
                  )}

                  <div className="p-8 flex-grow">
                    {/* Plan Name */}
                    <h3 className={`text-2xl font-bold mb-2 ${isPopular ? "text-emerald-700" : "text-slate-800"}`}>
                      {tier.name}
                    </h3>
                    <p className="text-slate-500 text-sm h-10">
                      {tier.exams_count === 1 ? "Perfect for a quick assessment." : 
                       tier.exams_count > 5 ? "Comprehensive mastery package." : 
                       "Balanced practice for serious aspirants."}
                    </p>

                    {/* Pricing */}
                    <div className="my-6 flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-extrabold text-slate-900">
                        ₹{tier.selling_price}
                      </span>
                      {tier.original_price && (
                        <span className="text-lg text-slate-400 line-through">
                          ₹{tier.original_price}
                        </span>
                      )}
                    </div>

                    {/* Features List */}
                    <ul className="space-y-4 text-left mb-8">
                      <li className="flex items-start gap-3">
                        <div className={`p-1 rounded-full shrink-0 ${isPopular ? "bg-emerald-100" : "bg-slate-100"}`}>
                          <Zap className={`w-3.5 h-3.5 ${isPopular ? "text-emerald-600" : "text-slate-500"}`} fill="currentColor" />
                        </div>
                        <span className="text-slate-700 font-bold">
                          {tier.exams_count} Full-Length CBT Exam{tier.exams_count > 1 ? 's' : ''}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className={`p-1 rounded-full shrink-0 ${isPopular ? "bg-blue-100" : "bg-slate-100"}`}>
                          <Shield className={`w-3.5 h-3.5 ${isPopular ? "text-blue-600" : "text-slate-500"}`} />
                        </div>
                        <span className="text-slate-600 text-sm">Detailed Analytics Report</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className={`p-1 rounded-full shrink-0 ${isPopular ? "bg-yellow-100" : "bg-slate-100"}`}>
                          <Crown className={`w-3.5 h-3.5 ${isPopular ? "text-yellow-600" : "text-slate-500"}`} />
                        </div>
                        <span className="text-slate-600 text-sm">All India Rank Generation</span>
                      </li>
                       <li className="flex items-start gap-3">
                        <div className="bg-slate-100 p-1 rounded-full shrink-0">
                          <Check className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="text-slate-600 text-sm">Unlimited Revision Mode</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="p-6 pt-0 mt-auto">
                    <button
                      onClick={() => handleEnrollClick(tier)}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2
                        ${isPopular 
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-200" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Features Grid */}
        <div className="max-w-5xl mx-auto border-t border-slate-200 pt-16">
          <h3 className="text-lg font-bold text-slate-700 mb-8 uppercase tracking-widest text-center">
            Why Students Trust Us
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