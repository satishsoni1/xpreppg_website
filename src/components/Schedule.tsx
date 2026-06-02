import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, Trophy, MapPin, Loader2, Radio } from 'lucide-react';
import { PublicAPI } from '@/services/publicApi'; 
import RevisionSchedule from './RevisionSchedule';

export default function Schedule() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cbt' | 'xrevise'>('cbt');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await PublicAPI.getExams(); 
      
      if (res.status && res.exams) {
        processExams(res.exams);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to load schedule:", error);
      setLoading(false);
    }
  };

  const processExams = (rawExams: any[]) => {
    // Sort exams by the JSON's 'date' field ascending
    const sortedExams = [...rawExams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const processed = sortedExams.map((exam: any) => {
      const examDate = new Date(exam.date);
      
      // We use 'timelineType' strictly for the visual rendering of the Node/Card
      let timelineType = exam.status; // 'completed', 'live', or 'open'

      // Special visual override for the final exam
      if (exam.title.toLowerCase().includes('neet pg')) {
        timelineType = 'milestone';
      }

      // Format date beautifully (e.g., 19th February 2026)
      const day = examDate.getDate();
      const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3 ? 0 : (day % 100 - day % 10 !== 10) ? day % 10 : 0)];
      const formattedDate = `${day}${suffix} ${examDate.toLocaleString('default', { month: 'long' })} ${examDate.getFullYear()}`;

      return {
        ...exam,
        formattedDate,
        timelineType,
        description: `CBT Examination • Duration: ${exam.duration} Minutes`
      };
    });

    setExams(processed);
    setLoading(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } },
  };

  const isDark = activeTab === 'xrevise';

  const title = activeTab === 'cbt' ? (
    <>XPREPPG CBT <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Schedule 2026</span></>
  ) : (
    <>XREVISE <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Recall Schedule</span></>
  );

  const category = activeTab === 'cbt' ? 'Exam Schedule' : 'Structured Revision';
  const subtitle = activeTab === 'cbt' 
    ? 'Simulate real exam pressure with our grand computer-based tests designed to mimic NEET PG.'
    : '4 Phases · 60 Days · Stick, revise, and recall your way to success with targeted daily practice.';

  return (
    <section 
      id="schedule" 
      className={`py-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen transition-all duration-500 ease-in-out ${
        isDark ? 'bg-gradient-to-br from-navy to-navyDark text-white' : 'bg-secondary text-navy'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className={`font-bold tracking-wider uppercase text-xs sm:text-sm mb-2 block transition-colors duration-300 ${
            isDark ? 'text-accent' : 'text-primary'
          }`}>
            {category}
          </span>
          <h2 className={`text-3xl md:text-5xl font-extrabold mb-4 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-navy'
          }`}>
            {title}
          </h2>
          <p className={`max-w-xl mx-auto text-base sm:text-lg transition-colors duration-300 ${
            isDark ? 'text-white/70' : 'text-gray-600'
          }`}>
            {subtitle}
          </p>
        </motion.div>

        {/* Sub-Schedule Switcher */}
        <div className="flex justify-center mb-16">
          <div className={`p-1.5 rounded-full border transition-all duration-300 flex gap-1 ${
            isDark 
              ? 'bg-white/5 border-white/10 backdrop-blur-md shadow-xl' 
              : 'bg-white border-secondaryDark shadow-md'
          }`}>
            <button
              onClick={() => setActiveTab('cbt')}
              className={`px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'cbt'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                  : isDark
                    ? 'text-white/60 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-primary hover:bg-secondary/50'
              }`}
            >
              <Radio className={`w-4 h-4 ${activeTab === 'cbt' ? 'animate-pulse' : ''}`} />
              XPREPPG CBT
            </button>
            <button
              onClick={() => setActiveTab('xrevise')}
              className={`px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'xrevise'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                  : isDark
                    ? 'text-white/60 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-primary hover:bg-secondary/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              XREVISE Schedule
            </button>
          </div>
        </div>

        {activeTab === 'cbt' ? (
          loading ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
              <Loader2 className="animate-spin text-primary mb-4" size={48} />
              <p className="text-sm font-medium text-gray-500">Loading exam schedule...</p>
            </div>
          ) : (
            <div className="relative animate-fadeIn">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-secondaryDark rounded-full">
                <motion.div
                  className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-primaryDark to-navy rounded-full"
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
                  
                  // Booleans based on our processed visual types & API status
                  const isLive = (exam.status === 'live' || exam.status === 'upcoming');
                  const isCompleted = exam.status === 'completed';
                  const isOpen = exam.status === 'open';
                  const isMilestone = exam.timelineType === 'milestone';

                  return (
                    <motion.div
                      key={exam.id || index}
                      variants={itemVariants as any}
                      className={`relative flex items-center md:justify-between ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                    >
                      {/* Empty Spacer for Desktop Layout */}
                      <div className="hidden md:block md:w-5/12"></div>

                      {/* Center Node / Icon */}
                      <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className={`
                            w-10 h-10 md:w-14 md:h-14 rounded-full border-4 flex items-center justify-center shadow-md transition-colors duration-300
                            ${isLive
                              ? 'bg-primary border-white ring-4 ring-secondaryMiddle scale-110'
                              : isMilestone
                                ? 'bg-navy border-white ring-4 ring-secondaryDark'
                                : isCompleted
                                  ? 'bg-secondaryMiddle border-primary'
                                  : 'bg-white border-secondaryDark'
                            }
                          `}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                          ) : isMilestone ? (
                            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          ) : isLive ? (
                            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          ) : (
                            <span className="text-gray-400 font-bold font-mono text-sm md:text-base">{index + 1}</span>
                          )}
                        </motion.div>
                      </div>

                      {/* Content Card */}
                      <div className={`w-full pl-20 md:pl-0 md:w-5/12`}>
                        <motion.div
                          whileHover={{ y: -5 }}
                          className={`
                            relative p-6 rounded-2xl border transition-all duration-300 shadow-sm group
                            ${isEven ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}
                            text-left
                            ${isLive
                              ? 'bg-white border-primary ring-2 md:ring-4 ring-secondary shadow-primary/10'
                              : isMilestone
                                ? 'bg-navy border-navyLight text-white'
                                : isCompleted
                                  ? 'bg-secondary border-secondaryDark'
                                  : 'bg-white border-secondaryMiddle hover:border-primary/20'
                            }
                          `}
                        >
                           {/* Floating Live Badge */}
                           {isLive && (
                            <div className={`
                              absolute -top-3 left-6 
                              md:-top-4 
                              ${isEven ? 'md:left-auto md:right-8' : 'md:left-8'}
                              bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-2
                            `}>
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </span>
                              Live Now
                            </div>
                          )}

                          <div className={`flex flex-col ${isEven ? 'md:items-end' : 'md:items-start'} items-start`}>
                            <div className={`flex items-center gap-2 mb-2 text-sm font-bold tracking-wide ${isMilestone ? 'text-accent' : isLive ? 'text-primary' : 'text-gray-500'}`}>
                              <Calendar className="w-4 h-4" />
                              <span>{exam.formattedDate}</span>
                            </div>
                            
                            <h3 className={`text-xl font-bold mb-2 ${isMilestone ? 'text-white' : 'text-navy'}`}>
                              {exam.title}
                            </h3>

                            <p className={`text-sm leading-relaxed ${isMilestone ? 'text-white/70' : 'text-gray-500'}`}>
                              {exam.description}
                            </p>

                            {/* Tag rendering based directly on exact status string */}
                            <div className="mt-4 flex flex-wrap gap-2">
                              
                              {isCompleted && (
                                <span className="inline-flex items-center text-xs font-bold text-primaryDark bg-secondaryMiddle px-2.5 py-1.5 rounded-md border border-secondaryDark">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Completed
                                </span>
                              )}

                              {isOpen && (
                                <span className="inline-flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-md border border-gray-200">
                                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Scheduled
                                </span>
                              )}

                              {isLive && (
                                <span className="inline-flex items-center text-xs font-bold text-primary bg-secondary px-2.5 py-1.5 rounded-md border border-secondaryDark">
                                  <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse text-primary" /> Currently Open
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
          )
        ) : (
          <RevisionSchedule standalone={false} />
        )}
      </div>
    </section>
  );
}