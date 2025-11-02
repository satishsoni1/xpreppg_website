import { Target, Award, BookOpen, Users } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: Users, label: 'Active Aspirants', value: '10,000+' },
    { icon: BookOpen, label: 'Subjects Covered', value: '19' },
    { icon: Award, label: 'Success Rate', value: '95%' },
    { icon: Target, label: 'National Tests', value: '4' },
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            About SmartPrep PG CBT
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              SmartPrep PG CBT is India's first platform designed exclusively to conduct NEET PG-style Computer-Based Tests (CBTs).
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our mission is to provide medical aspirants with a true-to-exam experience, enabling them to perform confidently in the actual NEET PG and NExT examinations.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Every test follows the latest NEET PG/NExT pattern, covering all 19 subjects, and is conducted on a digital interface identical to the official NBE platform.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Following each CBT, aspirants can attend live YouTube discussions with subject experts for detailed analysis, concept reinforcement, and strategy enhancement.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Vision</h3>
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              At SmartPrep PG CBT, our vision is to empower NEET PG aspirants with the tools, experience, and confidence to excel in one of India's toughest medical exams.
            </p>
            <div className="mt-8 text-center">
              <p className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Practice with Purpose. Prepare with Precision. Perform with Confidence.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200">
              <stat.icon className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
