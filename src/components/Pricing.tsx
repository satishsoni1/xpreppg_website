import { Check, Star } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Individual",
      popular: true,
      tiers: [
        { exams: 1, original: 1200, discount: 949 },
        { exams: 2, original: 2400, discount: 1849 },
        { exams: 3, original: 3600, discount: 2799 },
      ],
    },
    {
      name: "Group of 3 Students",
      popular: false,
      tiers: [
        { exams: 1, original: 3600, discount: 2699 },
        { exams: 2, original: 7200, discount: 5299 },
        { exams: 3, original: 10800, discount: 7999 },
      ],
    },
    {
      name: "Group of 5 Students",
      popular: false,
      tiers: [
        { exams: 1, original: 6000, discount: 4349 },
        { exams: 2, original: 12000, discount: 8599 },
      ],
    },
  ];

  const features = [
    "Live discussion sessions",
    "Score analysis & reports",
    "Performance analytics",
    "National leaderboard",
    "Subject-wise breakdown",
    "Downloadable reports",
  ];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Pricing Plans</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto my-4 rounded-full" />
        <p className="text-lg text-gray-600 mb-16">Choose according to number of students</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular ? "border-emerald-500 shadow-xl scale-[1.03]" : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Most Selected
                </div>
              )}

              <h3 className="text-2xl font-semibold text-gray-900 mb-6">{plan.name}</h3>

              <div className="space-y-4 mb-6">
                {plan.tiers.map((tier) => (
                  <div key={tier.exams} className="text-left border rounded-xl p-4 bg-gray-50">
                    <p className="text-gray-700 font-medium">{tier.exams} Exam{tier.exams > 1 && "s"}</p>
                    <p className="text-sm line-through text-gray-500">₹{tier.original}</p>
                    <p className="text-3xl font-extrabold text-emerald-600">₹{tier.discount}</p>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Enroll Now
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-10 shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">All Plans Include</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
