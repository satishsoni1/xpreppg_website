import { ArrowRight, Calendar, Brain, X } from "lucide-react";
import { useState } from "react";


export default function Hero() {
  const [status, setStatus] = useState("");


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
            <span className="text-sm font-semibold text-gray-700">India's First NEET PG CBT Platform</span>
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-primary transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center space-x-4">
                <Calendar className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium">Upcoming Exam</p>
                  <p className="text-2xl font-bold text-gray-900">19th January 2026</p>
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
            {/* <a
              href="https://portal.xpreppg.com/login"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-white text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-2 border-gray-200">
                Get Exam Ready
              </button>
            </a> */}

          </div>
          {status && <p className="text-center text-green-600 mt-3 font-medium">{status}</p>}
        </div>
      </div>


    </section>
  );
}
