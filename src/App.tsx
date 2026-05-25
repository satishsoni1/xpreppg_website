
import Hero from "./components/Hero";
import WhyXRevise from "./components/WhyXRevise";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import RevisionSchedule from "./components/RevisionSchedule";
import PerformanceSection from "./components/PerformanceSection";
import Pricing from "./components/Pricing";
import PosterShopSection from "./components/PosterShopSection";
import PosterAnnouncementBar from "./components/PosterAnnouncementBar";
import DemoVideo from "./components/DemoVideo";
import MissionCTA from "./components/MissionCTA";
import MainLayout from "./layouts/MainLayout";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("register")) {
      window.history.replaceState({}, document.title, "/");
      window.dispatchEvent(new Event("open-register-modal"));
    }
  }, []);

  return (
    <MainLayout>
      <PosterAnnouncementBar />
      <Hero />
      <PosterShopSection />
      <WhyXRevise />
      
      <HowItWorks />
      <Features />
      <RevisionSchedule />
      <PerformanceSection />
      <Pricing />
      
      <DemoVideo />
      <MissionCTA />
    </MainLayout>
  );
}
