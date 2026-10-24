import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomeCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto rounded-[2rem] bg-gradient-to-br from-primary to-primaryDeep px-6 py-14 sm:px-14 text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Start your preparation today
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-9">
            Join XRevise for NEET PG revision, take a CBT mock, or pick up NEET UG flash cards.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/xrevise-register")}
              className="group inline-flex items-center justify-center gap-2 bg-white text-primaryDeep px-7 py-4 rounded-xl font-bold hover:bg-secondary transition"
            >
              Register for XRevise
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/cbt-register")}
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white px-7 py-4 rounded-xl font-bold transition"
            >
              Register for CBT
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
