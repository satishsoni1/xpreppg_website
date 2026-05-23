import { BookOpen, CalendarCheck, PenLine, TrendingUp, Target, Layers } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: '800+ Previous Year Topics',
    description: 'Curated PYTs from NEET PG, INI-CET, FMGE, AIIMS & PGI — every repeatedly asked concept, nothing irrelevant.',
    gradient: 'from-primary to-primaryDark',
    tag: "Core",
  },
  { 
    icon: CalendarCheck,
    title: 'Daily Scheduled Tests',
    description: 'Systematic revision through a carefully planned 15-day cycle — each day has a clear focus, no guesswork.',
    gradient: 'from-navy to-primaryDeep',
    tag: "Structure",
  },
  {
    icon: PenLine,
    title: '50 MCQs Per Test',
    description: 'High-yield MCQs designed around the day\'s PYT topics — active recall that burns concepts into memory.',
    gradient: 'from-primaryDark to-primaryDeep',
    tag: "Active Recall",
  },
  {
    icon: TrendingUp,
    title: 'Performance Analysis',
    description: 'Score, accuracy, weak area identification, and revision insights after every test — data-driven improvement.',
    gradient: 'from-primary to-primaryDark',
    tag: "Insights",
  },
  {
    icon: Target,
    title: '750+ High-Yield MCQs',
    description: 'Expert-curated question bank from actual previous year papers — focused for rapid revision and active recall.',
    gradient: 'from-navyLight to-primary',
    tag: "MCQ Bank",
  },
  {
    icon: Layers,
    title: 'Multi-Exam Coverage',
    description: 'One structured program for NEET PG, INI-CET, FMGE, AIIMS & PGI — covering every major medical PG entrance.',
    gradient: 'from-primaryDeep to-navy',
    tag: "5 Exams",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 block">
            What's Inside
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy mb-4">
            What XREVISE Includes
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-navy mx-auto rounded-full mb-6" />
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for structured, consistent PYT revision — nothing you don't.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-secondaryMiddle hover:border-primary/20 transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
