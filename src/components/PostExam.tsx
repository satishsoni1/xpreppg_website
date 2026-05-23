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
      icon: FileText,
      title: 'Concept Recap PDFs',
      description: 'Study materials from discussion sessions',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-navy mb-4">
            Analyze. Improve. Repeat.
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-navy mx-auto rounded-full"></div>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Every daily test is followed by detailed performance insights and expert video discussions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-secondary to-secondaryMiddle rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-secondaryDark"
            >
              <div className="bg-white rounded-xl p-4 inline-flex mb-6 shadow-md">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-navy to-primaryDeep rounded-2xl p-12 text-center shadow-2xl">
          <h3 className="text-3xl font-bold text-white mb-4">
            Join XREVISE — Revise. Test. Analyze. Improve.
          </h3>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Build recall through daily testing. Analyze your weak areas. Improve consistently across NEET PG, INI-CET, FMGE, AIIMS & PGI.
          </p>
          <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
          onClick={() => {
            window.dispatchEvent(new Event("open-register-modal"));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}>
            Start Revising Today
          </button>
        </div>
      </div>
    </section>
  );
}
