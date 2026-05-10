
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Pricing from "./components/Pricing";
import Schedule from "./components/Schedule";
import PostExam from "./components/PostExam";
import MainLayout from "./layouts/MainLayout";
import { useEffect } from "react";
import DemoVideo from "./components/DemoVideo";
import PrivacyPolicy from "./pages/PrivacyPage";

export default function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("register")) {
      // 1. Remove the query param so it doesn't persist on refresh
      window.history.replaceState({}, document.title, "/");
      // 2. Trigger the modal
      window.dispatchEvent(new Event("open-register-modal"));
    }
  }, []);
  return (
    <MainLayout>
      <Hero />
      <About />
      <Features />
      <Pricing />
      <Schedule />
      <DemoVideo />
      <PostExam />
    </MainLayout>
  );
}
