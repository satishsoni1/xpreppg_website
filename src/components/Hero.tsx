import { ArrowRight, Calendar, Brain, Users } from "lucide-react";
import { useState, useEffect } from "react";

export default function Hero() {
  const [status, setStatus] = useState("");
  const [aspirantCount, setAspirantCount] = useState(2500);

  // Logic to calculate aspirants
  useEffect(() => {
    const calculateAspirants = () => {
      const baseCount = 1800;
      const minDailyIncrease = 30;
      const maxDailyIncrease = 50;
      const avgIncrease = (minDailyIncrease + maxDailyIncrease) / 2;

      // Fixed start date for the calculation (e.g., Jan 1, 2026, or a date in the past)
      // This ensures the number is consistent for every user on the same day
      const startDate = new Date("2026-01-01"); 
      const examDate = new Date("2026-02-19");
      const today = new Date();

      // If today is past the exam, stop increasing at the exam date
      const targetDate = today > examDate ? examDate : today;

      // Calculate days passed
      const timeDiff = targetDate.getTime() - startDate.getTime();
      const daysPassed = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));

      // Calculate total: Base + (Days * Average Increase)
      // We add a little randomness based on the day of the month so it's not a perfectly round number
      const dayRandomness = (targetDate.getDate() * 3) % 20; 
      const totalCount = baseCount + (daysPassed * avgIncrease) + dayRandomness;

      setAspirantCount(Math.floor(totalCount));
    };

    calculateAspirants();
  }, []);

  function setShowForm(p0: boolean): void {
    window.dispatchEvent(new Event("open-register-modal"));
  }

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondaryMiddle to-secondaryDark opacity-70"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 left-10 w-72 h-72 bg-secondaryDark rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-secondaryMiddle rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm mb-8 border border-emerald-100">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm font-semibold text-gray-700">
              India's First NEET PG CBT Platform
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Experience the Real
            <span className="block bg-gradient-to-r from-primary to-primaryDark bg-clip-text text-transparent">
              NEET PG Exam
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Full-length CBT simulations, and in-depth performance analytics after every exam.
          </p>

          {/* Stats Cards Container */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            
            {/* Exam Date Card */}
            <div className="bg-white rounded-2xl shadow-xl p-5 border-2 border-primary w-full max-w-xs transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium">Upcoming Exam</p>
                  <p className="text-xl font-bold text-gray-900">19th Feb 2026</p>
                </div>
              </div>
            </div>

            {/* Active Aspirants Card */}
            <div className="bg-white rounded-2xl shadow-xl p-5 border-2 border-blue-500 w-full max-w-xs transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium">Active Aspirants</p>
                  <p className="text-xl font-bold text-gray-900">
                    {aspirantCount.toLocaleString()}+
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="group bg-gradient-to-r from-primary to-primaryDark text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2"
            >
              <Brain className="w-6 h-6" />
              <span>Register Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          {status && (
            <p className="text-center text-green-600 mt-3 font-medium">
              {status}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}