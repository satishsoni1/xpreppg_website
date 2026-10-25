import { ArrowUpRight, BookOpen, Monitor, Layers, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PROGRAMS = [
  {
    exam: "NEET PG",
    title: "XRevise",
    desc: "A structured revision program built around 800+ previously asked topics — daily MCQs, tests and analysis.",
    points: ["Day-wise revision schedule", "Daily tests & analytics", "Phase-wise plans"],
    to: "/xrevise-program",
    cta: "Explore XRevise",
    icon: BookOpen,
    tone: "bg-primary text-white",
  },
  {
    exam: "NEET PG · NEET UG · JEE",
    title: "CBT Mock Tests",
    desc: "Practice the real exam, before the real exam — computer-based tests that mirror NEET PG, NEET UG and JEE conditions.",
    points: ["Real exam interface", "Section timers", "Detailed result analysis"],
    to: "/cbt",
    cta: "View CBT plans",
    icon: Monitor,
    tone: "bg-navy text-white",
  },
  {
    exam: "NEET PG · INI-CET · FMGE",
    title: "Flash Cards",
    desc: "Printed, high-yield flash card sets for NEET PG, INI-CET and FMGE — revise anywhere, in minutes a day.",
    points: ["All 19 subjects", "Printed & shipped", "Exam-wise sets"],
    to: "/flashcards",
    cta: "Shop flash cards",
    icon: Layers,
    tone: "bg-accent text-navy",
    badge: "New",
  },
  {
    exam: "NEET PG",
    title: "Poster Store",
    desc: "High-yield visual revision posters for NEET PG, INI-CET & FMGE — subject combos and packs.",
    points: ["Short, medium & long packs", "Expert designed", "Delivered to you"],
    to: "/shop",
    cta: "Browse posters",
    icon: ShoppingBag,
    tone: "bg-secondaryMiddle text-primaryDeep",
  },
];

export default function ProgramGrid() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">What we offer</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy">
            Everything you need, from first revision to exam day
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROGRAMS.map(({ exam, title, desc, points, to, cta, icon: Icon, tone, badge }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="group relative text-left bg-white rounded-3xl border border-gray-100 p-6 shadow-card hover:shadow-lift hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {badge && (
                <span className="absolute top-5 right-5 bg-accent text-navy text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${tone}`}>
                <Icon className="w-6 h-6" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{exam}</span>
              <h3 className="text-xl font-extrabold text-navy mt-1 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{desc}</p>
              <ul className="space-y-1.5 mb-6">
                {points.map(p => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> {p}
                  </li>
                ))}
              </ul>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                {cta}
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
