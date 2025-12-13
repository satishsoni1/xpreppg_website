import { Monitor, BookOpen, TrendingUp, Video, Clock, DollarSign } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Monitor,
      title: 'Authentic CBT Interface',
      description: 'Real exam-like platform to build familiarity and reduce anxiety.',
      gradient: 'from-primary to-secondaryDark0',
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Coverage',
      description: 'All 19 NEET PG subjects covered systematically.',
      gradient: 'from-secondary to-secondaryMiddle',
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Instant results with percentile, rank, and subject-wise breakdown.',
      gradient: 'from-primary to-primaryDark',
    },
    {
      icon: Clock,
      title: 'Strategic Scheduling',
      description: 'Four national-level CBTs to match your revision timeline.',
      gradient: 'from-teal-500 to-secondary0',
    },
    {
      icon: DollarSign,
      title: 'Affordable Access',
      description: 'Transparent, inclusive pricing with GST.',
      gradient: 'from-green-500 to-secondary0',
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Why Choose XprepPG CBT
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primaryDark mx-auto rounded-full"></div>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Get ahead of thousands of aspirants with real-time exam simulation and personalized feedback.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
