import { Calendar, CheckCircle, Award, TrendingUp, Video, Users, Clock, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Schedule from './components/Schedule';
import PostExam from './components/PostExam';
import Contact from './components/Contact';
import Navigation from './components/Navigation';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Hero />
      <About />
      <Pricing />
      <Features />
      
      <Schedule />
      <PostExam />
      <Contact />
    </div>
  );
}

export default App;
