import { Menu, X, LogIn, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Navigation({ mobileMenuOpen, setMobileMenuOpen }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; to: string; badge?: string }[] = [
    { label: 'About', to: '/about' },
    { label: 'Features', to: '/features' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Schedule', to: '/schedule' },
    { label: 'Post Exam', to: '/post-exam' },
    { label: 'Poster Shop', to: '/shop', badge: 'New' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
            <img 
              src={logo} 
              alt="Logo"
              className="w-24 object-contain"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) =>
              item.badge ? (
                <a
                  key={item.label}
                  onClick={() => navigate(item.to)}
                  className="relative flex items-center gap-1.5 cursor-pointer group"
                >
                  <span className="flex items-center gap-1 bg-gradient-to-r from-primary to-primaryDark text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-md shadow-primary/30 group-hover:shadow-primary/50 group-hover:-translate-y-0.5 transition-all duration-200">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide animate-bounce shadow-sm">
                    {item.badge}
                  </span>
                </a>
              ) : (
                <a
                  key={item.label}
                  onClick={() => navigate(item.to)}
                  className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 cursor-pointer"
                >
                  {item.label}
                </a>
              )
            )}

            {/* Student Login Button (Desktop) */}
            <button
              onClick={() => navigate("/student/login")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:border-primary hover:text-primary transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>

            {/* Register Button (Desktop) */}
            <button 
             onClick={() => {
              window.dispatchEvent(new Event("open-register-modal"));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
             className="bg-gradient-to-r from-primary to-primaryDark text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
              Register Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-secondaryMiddle shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) =>
              item.badge ? (
                <a
                  key={item.label}
                  onClick={() => { navigate(item.to); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between py-2 cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-primary font-semibold">
                    <ShoppingBag className="w-4 h-4" />
                    {item.label}
                  </span>
                  <span className="bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {item.badge}
                  </span>
                </a>
              ) : (
                <a
                  key={item.label}
                  onClick={() => { navigate(item.to); setMobileMenuOpen(false); }}
                  className="block text-gray-700 hover:text-primary font-medium py-2 cursor-pointer"
                >
                  {item.label}
                </a>
              )
            )}

            <hr className="border-secondaryMiddle my-2" />

            <button
              onClick={() => { navigate("/student/login"); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 bg-white border border-secondaryDark text-primary px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-all"
            >
              <LogIn className="w-5 h-5" />
              Student Login
            </button>

            <button
              onClick={() => {
                window.dispatchEvent(new Event("open-register-modal"));
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-navy to-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md"
            >
              Start Revising
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}