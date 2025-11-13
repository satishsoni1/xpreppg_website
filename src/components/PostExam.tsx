import { BarChart3, Trophy, FileText, Video, Download, TrendingUp } from 'lucide-react';

export default function PostExam() {
  const features = [
    {
      icon: BarChart3,
      title: 'Instant Result & Percentile',
      description: 'Get your scores immediately after the exam',
    },
    {
      icon: Trophy,
      title: 'National Leaderboard',
      description: 'Compare your performance nationwide',
    },
    {
      icon: TrendingUp,
      title: 'Subject-wise Analytics',
      description: 'Detailed breakdown of your strengths and weaknesses',
    },
    {
      icon: Download,
      title: 'Downloadable Reports',
      description: 'Access comprehensive performance reports',
    },
    {
      icon: Video,
      title: 'Live Video Analysis',
      description: 'Expert doctors discuss solutions on YouTube',
    },
    {
      icon: FileText,
      title: 'Concept Recap PDFs',
      description: 'Study materials from discussion sessions',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Post-Exam Features
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primaryDark mx-auto rounded-full"></div>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Each exam is followed by a Live Discussion Session on YouTube with subject experts
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-secondary to-secondaryMiddle rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-emerald-100"
            >
              <div className="bg-white rounded-xl p-4 inline-flex mb-6 shadow-md">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-primary to-primaryDark rounded-2xl p-12 text-center shadow-2xl">
          <h3 className="text-3xl font-bold text-white mb-4">
            Join the SmartPrep Movement
          </h3>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            Get ahead of thousands of aspirants with real-time exam simulation and personalized feedback
          </p>
          <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
            Secure Your Seat Today
          </button>
        </div>
      </div>
    </section>
  );
}
