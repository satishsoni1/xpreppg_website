import { Check, Star } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Basic',
      exams: 1,
      price: 1000,
      popular: false,
    },
    {
      name: 'Standard',
      exams: 2,
      price: 1700,
      popular: false,
    },
    {
      name: 'Advanced',
      exams: 3,
      price: 2200,
      popular: true,
    },
    {
      name: 'Premium',
      exams: 4,
      price: 2700,
      popular: false,
    },
  ];

  const allFeatures = [
    'Live discussion sessions',
    'Score analysis & reports',
    'Performance analytics',
    'National leaderboard',
    'Subject-wise breakdown',
    'Downloadable reports',
  ];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Pricing Plans
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-xl text-gray-600">
            Choose the plan that fits your preparation timeline
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-xl border-2 transform hover:scale-105 transition-all duration-300 ${
                plan.popular
                  ? 'border-emerald-500 shadow-2xl'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.exams} Exam{plan.exams > 1 ? 's' : ''}</p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-500 ml-2">incl. GST</span>
                </div>

                <button className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">All Plans Include</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allFeatures.map((feature) => (
              <div key={feature} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
