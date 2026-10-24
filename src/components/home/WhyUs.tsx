import { Target, CalendarCheck, BarChart3, PackageCheck } from "lucide-react";

const REASONS = [
  { icon: Target, title: "Built on what's asked", text: "XRevise is organised around previously asked topics, so every hour goes to high-yield content." },
  { icon: CalendarCheck, title: "A plan you can follow", text: "Day-wise schedules and daily tests keep revision consistent instead of last-minute." },
  { icon: BarChart3, title: "Know where you stand", text: "Subject and difficulty-wise analysis after every test shows exactly what to fix next." },
  { icon: PackageCheck, title: "Study material in hand", text: "Posters and flash cards are printed and shipped, so revision continues away from the screen." },
];

export default function WhyUs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-mist">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Why XPrepPG</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy">
            Focused preparation, without the noise
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REASONS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white rounded-3xl p-7 border border-gray-100 shadow-card">
              <span className="w-11 h-11 rounded-xl bg-secondary text-primary flex items-center justify-center mb-5">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-navy mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
