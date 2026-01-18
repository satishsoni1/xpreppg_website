import { useEffect, useState } from "react";
import { Check, Star, Loader2 } from "lucide-react";
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
    const token = localStorage.getItem("token"); // Check for Auth Token
    const user = localStorage.getItem("x_user_name");

    // 1. Prepare Plan Data (Matches DB Schema)
    const selectedPlan = {
      planId: tier.id,
      title: tier.name, // DB: name
      amount: tier.selling_price, // DB: selling_price
      originalAmount: tier.original_price, // DB: original_price
      examCount: tier.exams_count // DB: exams_count
    };

    // 2. Logic: If NOT logged in, save plan & open Auth Modal
    if (!token || !user) {
      // Save plan to storage so we can redirect AFTER they login/register
      localStorage.setItem("x_selected_plan", JSON.stringify(selectedPlan));
      
      // Trigger the existing Auth Modal (ensure your Modal handles Login/Register switching)
      window.dispatchEvent(new Event("open-register-modal"));
      return;
    }

    // 3. Logic: If Already Logged in, go to Payment Page
    const params = new URLSearchParams({
      planId: String(selectedPlan.planId),
      amount: String(selectedPlan.amount),
      title: selectedPlan.title
    });

    navigate(`/enroll?${params.toString()}`);
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto text-center">
        
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Pricing Plans
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto my-4 rounded-full" />

        <p className="text-lg text-gray-600 mb-16">
          Choose the best package for your preparation
        </p>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-10 flex flex-col items-center">
            <Loader2 className="animate-spin text-primary w-10 h-10 mb-3" />
            <p className="text-gray-600 font-medium">Fetching latest plans...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-10 bg-red-50 rounded-xl border border-red-100 max-w-lg mx-auto">
            <p className="text-red-600 text-lg font-semibold">{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        {!loading && !error && tiers.length > 0 && (
          <div className="flex justify-center mb-14">
            <div className="max-w-md w-full">
              <div className="relative rounded-2xl border bg-white p-8 shadow-xl border-emerald-500 ring-4 ring-emerald-50 transition hover:scale-105 duration-300">

                <div className="absolute -top-4 left-1/2 -translate-x-1/2 
                  bg-gradient-to-r from-emerald-600 to-teal-600 
                  text-white px-4 py-1 rounded-full text-sm font-semibold
                  flex items-center gap-1 shadow-lg">
                  <Star className="w-4 h-4" fill="currentColor" />
                  Most Popular
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Standard Packages
                </h3>

                <div className="space-y-4 mb-6">
                  {tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="text-left border border-gray-100 rounded-xl p-5 bg-gray-50 hover:bg-white hover:shadow-md hover:border-emerald-200 transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div>
                           <p className="text-primary font-bold text-lg">
                             {tier.name}
                           </p>
                           <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 w-fit px-2 py-0.5 rounded">
                             Includes {tier.exams_count} Exam{tier.exams_count > 1 ? 's' : ''}
                           </p>
                        </div>
                        {tier.original_price && (
                          <p className="text-sm line-through text-gray-400 mt-1">
                            ₹{tier.original_price}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <p className="text-3xl font-extrabold text-gray-900 group-hover:text-primary transition-colors">
                          ₹{tier.selling_price}
                        </p>

                        <button
                          onClick={() => handleEnrollClick(tier)}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primaryDark text-white font-semibold 
                            hover:bg-emerald-600 shadow-lg shadow-gray-200 hover:shadow-emerald-200 
                            transition-all transform hover:-translate-y-0.5"
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 shadow-inner border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">
            All Plans Include
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-left max-w-4xl mx-auto">
            {[
              "Detailed Score Analysis",
              "Subject-wise Performance",
              "All India Rank (AIR)",
              "Difficulty Level Breakdown",
              "Unlimited Revision Mode",
              "24/7 Support Access",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition">
                <div className="bg-emerald-100 p-1 rounded-full">
                  <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                </div>
                <span className="text-gray-700 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}