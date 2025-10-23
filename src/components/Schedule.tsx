import { Calendar } from 'lucide-react';

export default function Schedule() {
  const exams = [
    {
      date: '27th December 2025',
      title: 'Grand CBT 1',
      description: 'Comprehensive test covering all 19 subjects',
      status: 'upcoming',
    },
    {
      date: '25th January 2026',
      title: 'Grand CBT 2',
      description: 'Full-syllabus pattern exam',
      status: 'scheduled',
    },
    {
      date: '28th February 2026',
      title: 'Grand CBT 3',
      description: 'Revision-oriented test',
      status: 'scheduled',
    },
    {
      date: '29th March 2026',
      title: 'Grand CBT 4',
      description: 'Final Mock – NEET pattern simulation',
      status: 'scheduled',
    },
  ];

  return (
    <section id="schedule" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Exam Schedule 2025–26
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>

          <div className="space-y-12">
            {exams.map((exam, index) => (
              <div
                key={index}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-emerald-100">
                    {exam.status === 'upcoming' && (
                      <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold mb-4">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Next Exam</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-6 h-6 text-emerald-600" />
                      <span className="text-lg font-bold text-emerald-600">{exam.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                    <p className="text-gray-600">{exam.description}</p>
                  </div>
                </div>

                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full border-4 border-white shadow-lg">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>

                <div className="hidden md:block w-5/12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
