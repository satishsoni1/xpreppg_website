import HomeHero from "./components/home/HomeHero";
import ProgramGrid from "./components/home/ProgramGrid";
import FlashcardSpotlight from "./components/home/FlashcardSpotlight";
import WhyUs from "./components/home/WhyUs";
import HomeCTA from "./components/home/HomeCTA";
import PosterShopSection from "./components/PosterShopSection";
import MainLayout from "./layouts/MainLayout";
import { useEffect } from "react";

// Home page: overview of every product. The full XRevise program lives on /xrevise-program.
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
      <HomeHero />
      <ProgramGrid />
      <FlashcardSpotlight />
      <WhyUs />
      <PosterShopSection />
      <HomeCTA />
    </MainLayout>
  );
}
