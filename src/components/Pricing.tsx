import { useEffect, useState } from "react";
import { Check, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlansAPI } from "@/services/api";

export default function Pricing() {
  const navigate = useNavigate();

  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await PlansAPI.list();
        if (res.data.status) {
          setTiers(res.data.plans);
        } else {
          setError("Unable to load pricing plans.");
        }
      } catch (err) {
        setError("Failed to connect to server.");
      }
      setLoading(false);
    };

    loadPlans();
  }, []);

  // Go to enrollment
  const goToEnroll = (tier: any) => {
    const mobile = localStorage.getItem("x_user_mobile");
    const name = localStorage.getItem("x_user_name");
    const email = localStorage.getItem("x_user_email");

    const selectedPlan = {
      plan: "Individual",
      exams: tier.exams,
      amount: tier.sellingPrice,
      original: tier.actualPrice,
    };

    // User not logged in → open registration modal
    if (!mobile || !name || !email) {
      localStorage.setItem("x_selected_plan", JSON.stringify(selectedPlan));
      window.dispatchEvent(new Event("open-register-modal"));
      return;
    }

    // Already registered → Go to Enroll Page
    const params = new URLSearchParams({
      ...selectedPlan,
      mobile,
      name,
      email,
    });

    navigate(`/enroll?${params.toString()}`);
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Pricing Plans
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-primaryDark mx-auto my-4 rounded-full" />

        <p className="text-lg text-gray-600 mb-16">
          Choose according to number of exams
        </p>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <div className="w-10 h-10 mx-auto border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-600">Loading plans...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <p className="text-red-600 text-lg font-semibold py-10">{error}</p>
        )}

        {/* Plans */}
        {!loading && !error && (
          <div className="flex justify-center mb-14">
            <div className="max-w-md w-full">
              <div className="relative rounded-2xl border bg-white p-8 shadow-xl border-primary">

                <div className="absolute -top-4 left-1/2 -translate-x-1/2 
                  bg-gradient-to-r from-primary to-primaryDark 
                  text-white px-4 py-1 rounded-full text-sm font-semibold
                  flex items-center gap-1 shadow-lg">
                  <Star className="w-4 h-4" />
                  Most Selected
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Individual Student
                </h3>

                <div className="space-y-4 mb-6">
                  {tiers.map((tier) => (
                    <div
                      key={tier.exams}
                      className="text-left border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <p className="text-gray-700 font-medium">
                        {tier.exams} Exam(s)
                      </p>

                      <p className="text-sm line-through text-gray-500">
                        ₹{tier.actualPrice}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-3xl font-extrabold text-primary">
                          ₹{tier.sellingPrice}
                        </p>

                        <button
                          onClick={() => goToEnroll(tier)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r 
                            from-primary to-primaryDark text-white font-semibold 
                            hover:opacity-90 shadow"
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

        {/* Features */}
        <div className="bg-gradient-to-br from-secondary to-secondaryMiddle rounded-2xl p-10 shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            All Plans Include
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {[
              "Live discussion sessions",
              "Score analysis",
              "Performance analytics",
              "Leaderboard",
              "Subject-wise breakdown",
              "Download reports",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
