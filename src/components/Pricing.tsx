import { useEffect, useState } from "react";
import { Check, Star, Loader2, Zap, Shield, Crown } from "lucide-react";
import { PublicAPI } from "@/services/publicApi";

export default function Pricing() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleEnrollClick = (tier: any) => {
    localStorage.setItem("x_selected_plan", JSON.stringify({
      planId: tier.id, title: tier.name,
      amount: tier.selling_price, originalAmount: tier.original_price,
      examCount: tier.exams_count,
    }));
    window.dispatchEvent(new Event("open-register-modal"));
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary relative overflow-hidden">
      {/* Background decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondaryMiddle rounded-full mix-blend-multiply filter blur-3xl opacity-60" />
        <div className="absolute top-48 -left-24 w-72 h-72 bg-secondaryDark rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        {/* Header */}
        <div className="mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 block">
            Flexible Plans
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-navy tracking-tight">
            Join XREVISE
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-navy mx-auto my-6 rounded-full" />
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Affordable plans to access the full 15-day structured PYT recall program.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary w-12 h-12 mb-4" />
            <p className="text-gray-500 font-medium">Loading best offers...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block font-medium border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && tiers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-20">
            {tiers.map((tier, index) => {
              const isPopular = index === 1 || tier.name === "Standard";
              return (
                <div
                  key={tier.id}
                  className={`relative flex flex-col bg-white rounded-3xl transition-all duration-300 overflow-hidden
                    ${isPopular
                      ? "shadow-2xl border-2 border-primary transform md:-translate-y-4 z-10"
                      : "shadow-lg border border-secondaryDark hover:shadow-xl hover:border-primary/30"
                    }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-navy" />
                  )}
                  {isPopular && (
                    <div className="absolute top-5 right-0 bg-secondaryMiddle text-primary text-xs font-bold px-3 py-1 rounded-l-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Star size={12} fill="currentColor" /> Most Popular
                    </div>
                  )}

                  <div className="p-8 flex-grow">
                    <h3 className={`text-2xl font-bold mb-2 ${isPopular ? "text-primary" : "text-navy"}`}>
                      {tier.name}
                    </h3>
                    <p className="text-gray-500 text-sm h-10">
                      {tier.exams_count === 1 ? "Perfect for a quick start."
                       : tier.exams_count > 5 ? "Comprehensive mastery package."
                       : "Balanced practice for serious aspirants."}
                    </p>

                    <div className="my-6 flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-extrabold text-navy">₹{tier.selling_price}</span>
                      {tier.original_price && (
                        <span className="text-lg text-gray-400 line-through">₹{tier.original_price}</span>
                      )}
                    </div>

                    <ul className="space-y-4 text-left mb-8">
                      <li className="flex items-start gap-3">
                        <div className={`p-1 rounded-full shrink-0 ${isPopular ? "bg-secondaryMiddle" : "bg-gray-100"}`}>
                          <Zap className={`w-3.5 h-3.5 ${isPopular ? "text-primary" : "text-gray-500"}`} fill="currentColor" />
                        </div>
                        <span className="text-gray-700 font-bold">
                          {tier.exams_count} Daily Test Session{tier.exams_count > 1 ? "s" : ""}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className={`p-1 rounded-full shrink-0 ${isPopular ? "bg-secondary" : "bg-gray-100"}`}>
                          <Shield className={`w-3.5 h-3.5 ${isPopular ? "text-primaryDark" : "text-gray-500"}`} />
                        </div>
                        <span className="text-gray-600 text-sm">Detailed Performance Analysis</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className={`p-1 rounded-full shrink-0 ${isPopular ? "bg-secondaryMiddle" : "bg-gray-100"}`}>
                          <Crown className={`w-3.5 h-3.5 ${isPopular ? "text-primary" : "text-gray-500"}`} />
                        </div>
                        <span className="text-gray-600 text-sm">Weak Area Identification</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-gray-100 p-1 rounded-full shrink-0">
                          <Check className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="text-gray-600 text-sm">15-Day Revision Schedule Access</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    <button
                      onClick={() => handleEnrollClick(tier)}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform active:scale-95
                        ${isPopular
                          ? "bg-gradient-to-r from-navy to-primary text-white hover:shadow-lg hover:shadow-primary/30"
                          : "bg-secondary text-primary hover:bg-secondaryMiddle border border-secondaryDark"
                        }`}
                    >
                      Start Revising
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom features grid */}
        <div className="max-w-5xl mx-auto border-t border-secondaryDark pt-16">
          <h3 className="text-lg font-bold text-navy mb-8 uppercase tracking-widest text-center">
            What's Included in Every Plan
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { t: "800+ PYT Topics", d: "Previous Year Topics from NEET PG, INI-CET, FMGE, AIIMS & PGI." },
              { t: "15-Day Revision Schedule", d: "Structured day-wise plan from Anatomy to OBG." },
              { t: "50 MCQs per Daily Test", d: "Active recall builds stronger retention." },
              { t: "Performance Analysis", d: "Score, accuracy, weak areas, and revision insights." },
              { t: "4000+ High-Yield MCQs", d: "Expert-curated from actual previous year papers." },
              { t: "Multi-Exam Coverage", d: "NEET PG · INI-CET · FMGE · AIIMS · PGI." },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-secondaryMiddle shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex gap-4 items-start">
                <div className="bg-secondary p-2 rounded-lg text-primary shrink-0">
                  <Check className="w-5 h-5" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-navy text-sm">{feature.t}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{feature.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
