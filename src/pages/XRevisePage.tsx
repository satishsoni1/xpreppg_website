import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WhyXRevise from "@/components/WhyXRevise";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import LiveSchedule from "@/components/LiveSchedule";
import PerformanceSection from "@/components/PerformanceSection";
import Pricing from "@/components/Pricing";
import PostExam from "@/components/PostExam";
import DemoVideo from "@/components/DemoVideo";
import MissionCTA from "@/components/MissionCTA";

// Anchor ids of the sections below (About, Features, Schedule and Pricing set their own)
const SECTIONS = [
  { id: "about", label: "Overview" },
  { id: "how-it-works", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "schedule", label: "Schedule" },
  { id: "pricing", label: "Pricing" },
  { id: "performance", label: "Results" },
  { id: "post-exam", label: "After the exam" },
];

// The whole XRevise program on one page. Old routes (/about, /features, /pricing,
// /schedule, /post-exam) render this page and pass `section` to scroll there.
export default function XRevisePage({ section }: { section?: string }) {
  const { hash } = useLocation();
  const [active, setActive] = useState("");

  useEffect(() => {
    const target = section || hash.replace("#", "");
    if (!target) return;
    // Wait a frame so lazily-sized sections (schedule) have rendered
    const t = setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }), 150);
    return () => clearTimeout(t);
  }, [section, hash]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <MainLayout>
      <Hero />

      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${
                  active === s.id ? "bg-primary text-white" : "text-gray-600 hover:bg-mist hover:text-navy"
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <About />
      <WhyXRevise />
      <div id="how-it-works"><HowItWorks /></div>
      <Features />
      <LiveSchedule />
      <Pricing />
      <div id="performance"><PerformanceSection /></div>
      <div id="post-exam"><PostExam /></div>
      <DemoVideo />
      <MissionCTA />
    </MainLayout>
  );
}
