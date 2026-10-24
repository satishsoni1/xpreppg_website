import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Atom, FlaskConical, Leaf, MessageCircle, Truck, ShieldCheck, Repeat } from "lucide-react";
import { PublicAPI } from "@/services/publicApi";
import { PosterPackage } from "@/data/posterPackages";

const SUBJECTS = [
  { name: "Physics", icon: Atom, note: "Formulas, units & key concepts" },
  { name: "Chemistry", icon: FlaskConical, note: "Reactions, trends & exceptions" },
  { name: "Biology", icon: Leaf, note: "NCERT facts, diagrams & terms" },
];

const PERKS = [
  { icon: Repeat, text: "Built for quick, repeated daily revision" },
  { icon: Truck, text: "Printed sets shipped to your address" },
  { icon: ShieldCheck, text: "Secure online payment" },
];

export default function FlashcardSpotlight() {
  const navigate = useNavigate();
  const [sets, setSets] = useState<PosterPackage[]>([]);

  useEffect(() => {
    PublicAPI.getPosterPackages("flashcard")
      .then(res => { if (res.status) setSets((res.packages || []).slice(0, 3)); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-navy relative overflow-hidden">
      <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-5 gap-12 items-center">
        <div className="lg:col-span-2">
          <span className="inline-block bg-accent text-navy text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            New · NEET UG
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Flash cards that make NEET UG revision stick
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Short, focused cards for Physics, Chemistry and Biology. Flip, recall, repeat — a few minutes a day adds up.
          </p>
          <ul className="space-y-3 mb-9">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/85">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/neet-ug-flashcards")}
              className="group inline-flex items-center justify-center gap-2 bg-accent hover:brightness-95 text-navy px-7 py-4 rounded-xl font-bold transition"
            >
              Shop flash cards
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="https://wa.me/919370100887?text=Hi%2C%20I%27m%20interested%20in%20NEET%20UG%20flash%20cards"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 text-white px-7 py-4 rounded-xl font-semibold transition"
            >
              <MessageCircle className="w-5 h-5" /> Ask on WhatsApp
            </a>
          </div>
        </div>

        <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
          {sets.length > 0
            ? sets.map(set => (
                <button
                  key={set.id}
                  onClick={() => navigate("/neet-ug-flashcards")}
                  className="group text-left bg-white rounded-3xl overflow-hidden shadow-lift hover:-translate-y-1 transition-transform"
                >
                  <div className="aspect-[4/3] bg-secondary overflow-hidden">
                    <img src={set.image_url} alt={set.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" draggable="false" />
                  </div>
                  <div className="p-5">
                    {set.subject && <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">{set.subject}</p>}
                    <h3 className="font-bold text-navy leading-snug line-clamp-2 mb-3">{set.title}</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-extrabold text-navy">₹{set.price}</span>
                      {set.original_price && <span className="text-xs text-gray-400 line-through mb-0.5">₹{set.original_price}</span>}
                    </div>
                  </div>
                </button>
              ))
            : SUBJECTS.map(({ name, icon: Icon, note }, i) => (
                <div
                  key={name}
                  className={`rounded-3xl p-6 min-h-[13rem] flex flex-col shadow-lift ${
                    i === 1 ? "bg-primary text-white sm:-translate-y-4" : "bg-white text-navy"
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-6 ${i === 1 ? "text-accent" : "text-primary"}`} />
                  <h3 className="text-2xl font-extrabold mb-2">{name}</h3>
                  <p className={`text-sm leading-relaxed ${i === 1 ? "text-white/75" : "text-gray-500"}`}>{note}</p>
                  <span className={`mt-auto pt-6 text-xs font-bold uppercase tracking-widest ${i === 1 ? "text-accent" : "text-primary"}`}>
                    Launching soon
                  </span>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
