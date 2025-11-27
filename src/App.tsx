
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Pricing from "./components/Pricing";
import Schedule from "./components/Schedule";
import PostExam from "./components/PostExam";
import MainLayout from "./layouts/MainLayout";

export default function App() {

  return (
    <MainLayout>
      <Hero />
      <About />
      <Features />
      <Pricing />
      <Schedule />
      <PostExam />
    </MainLayout>
  );
}
