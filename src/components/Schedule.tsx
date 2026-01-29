import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, Trophy, MapPin } from 'lucide-react';

export default function Schedule() {
  const exams = [
    {
      date: '11th January 2026',
      title: 'Grand CBT 1',
      description: 'Comprehensive test covering all 19 subjects',
      status: 'completed',
    },
    {
      date: '19th February 2026',
      title: 'Grand CBT 2',
      description: 'Full-syllabus pattern exam',
      status: 'upcoming',
    },
    {
      date: '15th March 2026',
      title: 'Grand CBT 3',
      description: 'Revision-oriented test',
      status: 'scheduled',
    },
    {
      date: '19th April 2026',
      title: 'Grand CBT 4',
      description: 'Mock – NEET pattern simulation',
      status: 'scheduled',
    },
    {
      date: '10th May 2026',
      title: 'Grand CBT 5',
      description: 'Revision-oriented test',
      status: 'scheduled',
    },
    {
      date: '7th June 2026',
      title: 'Grand CBT 6',
      description: 'Revision-oriented test',
      status: 'scheduled',
    },
    {
      date: '5th July 2026',
      title: 'Grand CBT 7',
      description: 'Revision-oriented test',
      status: 'scheduled',
    },
    {
      date: '2nd August 2026',
      title: 'Grand CBT 8',
      description: 'Final – NEET pattern simulation',
      status: 'scheduled',
    },
    {
      date: '30th August 2026',
      title: 'NEET PG 2026', 
      description: 'The Big Day - Victory Awaits',
      status: 'milestone',
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } },
  };

  return (
    <section id="schedule" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2 block">
            Roadmap to Success
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
            Exam Schedule <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">2025–26</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Every test is a stepping stone. Track your progress, stay consistent, and conquer the syllabus one exam at a time.
          </p>
        </motion.div>

        <div className="relative">
          {/* Central Timeline Line (Animated Gradient) */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-500 via-teal-400 to-blue-500"
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              viewport={{ once: true }}
            />
          </div>

          {/* FIX: This was opened as <motion.div> but previously closed as </div>. 
              It is now correctly closed as </motion.div> below.
          */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-12 md:space-y-24"
          >
            {exams.map((exam, index) => {
              const isEven = index % 2 === 0;
              const isUpcoming = exam.status === 'upcoming';
              const isCompleted = exam.status === 'completed';
              const isMilestone = exam.status === 'milestone';

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Content Card */}
                  <div className={`w-full md:w-5/12 ${isEven ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      className={`
                        relative p-8 rounded-3xl border transition-all duration-300 shadow-lg group
                        ${isUpcoming 
                          ? 'bg-white border-emerald-500 ring-4 ring-emerald-50 shadow-emerald-200' 
                          : isMilestone
                            ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white'
                            : isCompleted
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-white border-slate-100 hover:border-emerald-200'
                        }
                      `}
                    >
                      {/* Upcoming Badge */}
                      {isUpcoming && (
                        <div className={`absolute -top-4 ${isEven ? 'md:right-8 right-auto left-8' : 'left-8'} bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2`}>
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                          </span>
                          Target Lock
                        </div>
                      )}

                      <div className={`flex flex-col ${isEven ? 'md:items-end' : 'md:items-start'}`}>
                        <div className={`flex items-center space-x-2 mb-3 ${isMilestone ? 'text-emerald-300' : 'text-emerald-600'}`}>
                          <Calendar className="w-5 h-5" />
                          <span className="font-bold tracking-wide">{exam.date}</span>
                        </div>
                        
                        <h3 className={`text-2xl font-bold mb-3 ${isMilestone ? 'text-white' : 'text-slate-800'}`}>
                          {exam.title}
                        </h3>
                        
                        <p className={`text-base ${isMilestone ? 'text-slate-300' : 'text-slate-600'}`}>
                          {exam.description}
                        </p>

                        {/* Status Indicator inside Card */}
                        <div className="mt-4">
                          {isCompleted && (
                            <span className="inline-flex items-center text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Completed
                            </span>
                          )}
                          {exam.status === 'scheduled' && (
                            <span className="inline-flex items-center text-sm font-medium text-slate-400">
                              <Clock className="w-4 h-4 mr-2" /> Scheduled
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Center Node / Icon */}
                  <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className={`
                        w-14 h-14 rounded-full border-4 flex items-center justify-center z-10 shadow-xl
                        ${isUpcoming 
                          ? 'bg-emerald-600 border-white ring-4 ring-emerald-100' 
                          : isMilestone
                            ? 'bg-amber-400 border-white ring-4 ring-amber-100'
                            : isCompleted
                              ? 'bg-emerald-100 border-emerald-500'
                              : 'bg-white border-slate-200'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : isMilestone ? (
                        <Trophy className="w-6 h-6 text-white" />
                      ) : isUpcoming ? (
                        <MapPin className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-slate-400 font-bold font-mono">{index + 1}</span>
                      )}
                    </motion.div>
                  </div>

                  <div className="w-0 md:w-5/12"></div>
                </motion.div>
              );
            })}
          </motion.div> 
        </div>
      </div>
    </section>
  );
}