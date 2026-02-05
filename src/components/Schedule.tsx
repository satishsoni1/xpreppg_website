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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } },
  };

  return (
    <section id="schedule" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-600 font-bold tracking-wider uppercase text-xs sm:text-sm mb-2 block">
            Roadmap to Success
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Exam Schedule <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">2025–26</span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-base sm:text-lg">
            Track your progress, stay consistent, and conquer the syllabus step by step.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          {/* Mobile: Left aligned (left-8). Desktop: Center aligned (left-1/2) */}
          <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-slate-200 rounded-full">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-500 via-teal-400 to-blue-500 rounded-full"
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              viewport={{ once: true }}
            />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-8 md:space-y-20"
          >
            {exams.map((exam, index) => {
              const isEven = index % 2 === 0;
              const isUpcoming = exam.status === 'upcoming';
              const isCompleted = exam.status === 'completed';
              const isMilestone = exam.status === 'milestone';

              return (
                <motion.div
                  key={index}
                  variants={itemVariants as any}
                  // Mobile: Always flex-row. Desktop: Alternating.
                  className={`relative flex items-center md:justify-between ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Empty Spacer for Desktop Layout (Keeps layout balanced) */}
                  <div className="hidden md:block md:w-5/12"></div>

                  {/* Center Node / Icon */}
                  {/* Mobile: Left aligned (left-8). Desktop: Center aligned (left-1/2) */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className={`
                        w-10 h-10 md:w-14 md:h-14 rounded-full border-4 flex items-center justify-center shadow-md transition-colors duration-300
                        ${isUpcoming 
                          ? 'bg-emerald-600 border-white ring-4 ring-emerald-100 scale-110' 
                          : isMilestone
                            ? 'bg-amber-400 border-white ring-4 ring-amber-100'
                            : isCompleted
                              ? 'bg-emerald-100 border-emerald-500'
                              : 'bg-white border-slate-200'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                      ) : isMilestone ? (
                        <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      ) : isUpcoming ? (
                        <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      ) : (
                        <span className="text-slate-400 font-bold font-mono text-sm md:text-base">{index + 1}</span>
                      )}
                    </motion.div>
                  </div>

                  {/* Content Card */}
                  {/* Mobile: Full width with left padding. Desktop: 5/12 width */}
                  <div className={`w-full pl-20 md:pl-0 md:w-5/12`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className={`
                        relative p-6 rounded-2xl border transition-all duration-300 shadow-sm group
                        ${isEven ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}
                        text-left
                        ${isUpcoming 
                          ? 'bg-white border-emerald-500 ring-2 md:ring-4 ring-emerald-50 shadow-emerald-100' 
                          : isMilestone
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : isCompleted
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-white border-slate-100 hover:border-emerald-200'
                        }
                      `}
                    >
                       {/* Upcoming Badge - Mobile optimized positioning */}
                       {isUpcoming && (
                        <div className={`
                          absolute -top-3 left-6 
                          md:-top-4 
                          ${isEven ? 'md:left-auto md:right-8' : 'md:left-8'}
                          bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-2
                        `}>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          Target
                        </div>
                      )}

                      <div className={`flex flex-col ${isEven ? 'md:items-end' : 'md:items-start'} items-start`}>
                        <div className={`flex items-center gap-2 mb-2 text-sm font-bold tracking-wide ${isMilestone ? 'text-emerald-300' : 'text-emerald-600'}`}>
                          <Calendar className="w-4 h-4" />
                          <span>{exam.date}</span>
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-2 ${isMilestone ? 'text-white' : 'text-slate-800'}`}>
                          {exam.title}
                        </h3>
                        
                        <p className={`text-sm leading-relaxed ${isMilestone ? 'text-slate-300' : 'text-slate-500'}`}>
                          {exam.description}
                        </p>

                        {/* Status Tags */}
                        <div className="mt-3">
                          {isCompleted && (
                            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                            </span>
                          )}
                          {exam.status === 'scheduled' && (
                            <span className="inline-flex items-center text-xs font-medium text-slate-400">
                              <Clock className="w-3 h-3 mr-1" /> Scheduled
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div> 
        </div>
      </div>
    </section>
  );
}