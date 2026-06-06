import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import {
  Monitor, Clock, BarChart2, ShieldCheck, CheckCircle2,
  BookOpen, Calendar, Users, Award, ChevronRight,
  Zap, Target, FileText, MessageCircle,
} from "lucide-react";

const FEATURES = [
  {
    icon: Monitor,
    title: "Fully Online Exam",
    desc: "Attempt the test from anywhere on your laptop, desktop, or tablet — just like the real NEET PG CBT interface.",
    color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100",
  },
  {
    icon: Clock,
    title: "Timed & Proctored",
    desc: "Real exam-like timer, auto-submit, and strict session tracking to replicate actual exam pressure.",
    color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100",
  },
  {
    icon: BarChart2,
    title: "Instant Result & Rank",
    desc: "Detailed subject-wise performance analysis, percentile rank, and comparison with all test takers immediately after submission.",
    color: "text-green-600", bg: "bg-green-50", border: "border-green-100",
  },
  {
    icon: ShieldCheck,
    title: "Exam-Pattern Questions",
    desc: "Questions curated by NEET PG toppers and faculty — exact pattern, difficulty level, and topic distribution.",
    color: "text-primary", bg: "bg-secondary", border: "border-secondaryDark",
  },
  {
    icon: Target,
    title: "Subject-Wise Analysis",
    desc: "Know exactly which subjects and topics need more attention with granular performance breakdowns.",
    color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100",
  },
  {
    icon: FileText,
    title: "Solved Paper PDF",
    desc: "Download a fully solved paper with explanations for every question after each test attempt.",
    color: "text-red-600", bg: "bg-red-50", border: "border-red-100",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Register", desc: "Fill in your details and register for the X PREP PG CBT program." },
  { step: "02", title: "Get Login Credentials", desc: "Receive your student login ID and password on your registered mobile/email." },
  { step: "03", title: "Attempt the Test", desc: "Login to the student portal, select your scheduled exam, and attempt the CBT at the scheduled time." },
  { step: "04", title: "View Results & Analysis", desc: "Instantly see your score, rank, and a detailed subject-wise performance report after submission." },
];

const PLANS = [
  {
    name: "Single Test",
    price: "₹199",
    features: ["1 Full-length CBT", "Instant Results", "Solved Paper PDF", "Basic Subject Analysis"],
    highlight: false,
  },
  {
    name: "Monthly Pack",
    price: "₹499",
    original: "₹799",
    features: ["4 Full-length CBTs", "Instant Results + Rank", "Solved Paper PDF", "Detailed Subject Analysis", "Percentile Report"],
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "3-Month Pack",
    price: "₹1199",
    original: "₹2399",
    features: ["12 Full-length CBTs", "Instant Results + Rank", "Solved Paper PDFs", "Detailed Subject Analysis", "Percentile Reports", "Performance Trend Graph"],
    highlight: false,
  },
];

export default function CbtPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-navy via-navyLight to-primary pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="flex-1">
              <span className="bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-5 inline-flex items-center gap-2 border border-white/30">
                <Monitor className="w-3.5 h-3.5" /> Computer Based Test
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                X PREP PG <span className="text-accent">CBT</span>
              </h1>
              <p className="text-white/80 text-xl mb-8 max-w-xl leading-relaxed">
                Full-length online mock tests for NEET PG — real exam interface, instant results, and detailed performance analysis to help you rank higher.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/cbt-register")}
                  className="flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full font-bold hover:bg-secondary transition-colors shadow-xl text-base"
                >
                  Register for CBT <ChevronRight className="w-5 h-5" />
                </button>
                <a
                  href="https://wa.me/918446036521"
                  target="_blank"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3.5 rounded-full font-bold transition-colors shadow-lg text-base"
                >
                  <MessageCircle className="w-5 h-5" /> Ask on WhatsApp
                </a>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:w-72 shrink-0">
              {[
                { icon: Users, value: "5000+", label: "Students Tested" },
                { icon: FileText, value: "100+", label: "Tests Conducted" },
                { icon: Award, value: "Top 10", label: "Rank Achievers" },
                { icon: BookOpen, value: "19", label: "Subjects Covered" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Icon className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-extrabold text-white">{value}</p>
                  <p className="text-white/70 text-xs font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">

        {/* ── What is CBT ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <span className="text-primary text-xs font-bold uppercase tracking-widest mb-3 block">What is X PREP PG CBT?</span>
            <h2 className="text-3xl font-bold text-navy mb-5 leading-snug">
              Practice the Real Exam, <br />Before the Real Exam
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              X PREP PG CBT (Computer Based Test) is our full-length online mock exam platform designed specifically for NEET PG aspirants. Every test is modeled on the actual NEET PG exam pattern — same number of questions, same marking scheme, same time limit.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              After each test you receive an instant result, your all-India rank among test takers, and a fully solved paper with explanations — so you know exactly what to revise next.
            </p>
            <ul className="space-y-2">
              {[
                "200 questions | 3 hours 30 minutes",
                "NEET PG-pattern marking scheme (+4 / -1)",
                "All 19 NEET PG subjects covered",
                "Immediate result with rank & percentile",
              ].map(point => (
                <li key={point} className="flex items-start gap-2 text-gray-700 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { icon: Zap, label: "Full-Length Tests", sub: "200 Qs · 3.5 hrs", color: "text-yellow-500", bg: "bg-yellow-50" },
              { icon: BarChart2, label: "Instant Analytics", sub: "Score + Rank", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Calendar, label: "Regular Schedule", sub: "Weekly Tests", color: "text-green-600", bg: "bg-green-50" },
              { icon: FileText, label: "Solved PDFs", sub: "With Explanations", color: "text-primary", bg: "bg-secondary" },
            ].map(({ icon: Icon, label, sub, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-5 text-center`}>
                <Icon className={`w-8 h-8 ${color} mx-auto mb-3`} />
                <p className="font-bold text-gray-900 text-sm">{label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ─────────────────────────────────────────────── */}
        <div>
          <div className="text-center mb-10">
            <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2 block">Why Choose X PREP PG CBT</span>
            <h2 className="text-3xl font-bold text-navy">Everything You Need to Crack NEET PG</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className={`rounded-2xl border ${f.border} bg-white p-6 hover:shadow-lg transition-all duration-300 group`}>
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── How It Works ─────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-navy to-navyLight rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <span className="text-accent text-xs font-bold uppercase tracking-widest mb-2 block">Simple Process</span>
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="text-center relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-white/20" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-accent">{step.step}</span>
                </div>
                <h3 className="font-bold text-white text-base mb-2">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Plans ────────────────────────────────────────────────── */}
        <div>
          <div className="text-center mb-10">
            <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2 block">Pricing</span>
            <h2 className="text-3xl font-bold text-navy">CBT Plans</h2>
            <p className="text-gray-500 mt-2">Choose a plan that fits your preparation timeline</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 flex flex-col relative ${
                  plan.highlight
                    ? "border-primary bg-gradient-to-b from-primary/5 to-white shadow-xl shadow-primary/10"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <h3 className="font-bold text-navy text-lg mb-1">{plan.name}</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-extrabold text-navy">{plan.price}</span>
                  {plan.original && (
                    <span className="text-gray-400 line-through text-sm mb-1">{plan.original}</span>
                  )}
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/cbt-register")}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-primary hover:bg-primaryDark text-white shadow-md"
                      : "border border-primary text-primary hover:bg-secondary"
                  }`}
                >
                  Register Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-primary to-primaryDark rounded-2xl p-10 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Ready to Test Yourself?</h3>
          <p className="text-white/70 mb-6 max-w-lg mx-auto">Register today and start practicing with full-length NEET PG mock tests.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/cbt-register")}
              className="flex items-center justify-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full font-bold hover:bg-secondary transition-colors shadow-lg"
            >
              Register for CBT <ChevronRight className="w-5 h-5" />
            </button>
            <a
              href="https://wa.me/918446036521"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-3.5 rounded-full font-bold hover:bg-white/20 transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
