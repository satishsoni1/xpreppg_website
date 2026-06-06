import { Menu, X, LogIn, ShoppingBag, Monitor, BookOpen, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import logo from '@/assets/logo.png';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const NAV_ITEMS: { label: string; to: string; badge?: string }[] = [
  { label: 'About', to: '/about' },
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Schedule', to: '/schedule' },
  { label: 'Post Exam', to: '/post-exam' },
  { label: 'Poster Shop', to: '/shop', badge: 'New' },
  { label: 'Contact', to: '/contact' },
];

export default function Navigation({ mobileMenuOpen, setMobileMenuOpen }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [cbtOpen, setCbtOpen] = useState(false);
  const registerRef = useRef<HTMLDivElement>(null);
  const cbtRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (registerRef.current && !registerRef.current.contains(e.target as Node)) setRegisterOpen(false);
      if (cbtRef.current && !cbtRef.current.contains(e.target as Node)) setCbtOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setRegisterOpen(false);
    setCbtOpen(false);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">

          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => go('/')}>
            <img src={logo} alt="Logo" className="w-24 object-contain" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-5">
            {NAV_ITEMS.map(item =>
              item.badge ? (
                <a
                  key={item.label}
                  onClick={() => go(item.to)}
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
                  onClick={() => go(item.to)}
                  className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 cursor-pointer text-sm"
                >
                  {item.label}
                </a>
              )
            )}

            {/* CBT Dropdown */}
            <div className="relative" ref={cbtRef}>
              <button
                onClick={() => setCbtOpen(o => !o)}
                className="relative flex items-center gap-1.5 cursor-pointer group"
              >
                <span className="flex items-center gap-1 bg-gradient-to-r from-navy to-navyLight text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-md group-hover:-translate-y-0.5 transition-all duration-200">
                  <Monitor className="w-3.5 h-3.5" />
                  CBT
                  <ChevronDown className={`w-3 h-3 transition-transform ${cbtOpen ? 'rotate-180' : ''}`} />
                </span>
                <span className="absolute -top-2 -right-2 bg-green-400 text-green-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide animate-bounce shadow-sm">
                  New
                </span>
              </button>

              {cbtOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                  <button
                    onClick={() => go('/cbt')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">About CBT</p>
                      <p className="text-[10px] text-gray-400">Features & Plans</p>
                    </div>
                  </button>
                  <button
                    onClick={() => go('/cbt-register')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">Register for CBT</p>
                      <p className="text-[10px] text-gray-400">Create your account</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Student Login */}
            <button
              onClick={() => go('/student/login')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:border-primary hover:text-primary transition-all duration-200 text-sm"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>

            {/* Register Dropdown */}
            <div className="relative" ref={registerRef}>
              <button
                onClick={() => setRegisterOpen(o => !o)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-primaryDark text-white px-5 py-2.5 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
              >
                Register Now
                <ChevronDown className={`w-4 h-4 transition-transform ${registerOpen ? 'rotate-180' : ''}`} />
              </button>

              {registerOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Choose Program</p>
                  </div>
                  <button
                    onClick={() => go('/cbt-register')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-navy/10 rounded-xl flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">CBT</p>
                      <p className="text-[10px] text-gray-400">Computer Based Test</p>
                    </div>
                  </button>
                  <button
                    onClick={() => go('/xrevise-register')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">XREVISE</p>
                      <p className="text-[10px] text-gray-400">Poster Program</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
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
          <div className="px-4 py-6 space-y-1">
            {NAV_ITEMS.map(item => (
              <a
                key={item.label}
                onClick={() => go(item.to)}
                className="flex items-center justify-between py-3 px-3 rounded-xl cursor-pointer hover:bg-secondary transition-colors"
              >
                <span className={`font-medium text-sm ${item.badge ? 'text-primary' : 'text-gray-700'}`}>
                  {item.badge && <ShoppingBag className="w-4 h-4 inline mr-1.5" />}
                  {item.label}
                </span>
                {item.badge && (
                  <span className="bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}

            {/* CBT section in mobile */}
            <div className="border-t border-gray-100 pt-3 mt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">CBT — Computer Based Test</p>
              <a
                onClick={() => go('/cbt')}
                className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer hover:bg-secondary transition-colors"
              >
                <Monitor className="w-4 h-4 text-navy" />
                <span className="font-semibold text-sm text-navy">About CBT</span>
                <span className="ml-auto bg-green-400 text-green-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>
              </a>
              <a
                onClick={() => go('/cbt-register')}
                className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer hover:bg-secondary transition-colors"
              >
                <Monitor className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-primary">Register for CBT</span>
              </a>
            </div>

            <hr className="border-secondaryMiddle my-2" />

            <button
              onClick={() => go('/student/login')}
              className="w-full flex items-center justify-center gap-2 bg-white border border-secondaryDark text-primary px-6 py-3 rounded-xl font-semibold hover:bg-secondary transition-all"
            >
              <LogIn className="w-5 h-5" />
              Student Login
            </button>

            {/* Register options in mobile */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => go('/cbt-register')}
                className="flex items-center justify-center gap-1.5 bg-navy text-white px-4 py-3 rounded-xl font-semibold text-sm"
              >
                <Monitor className="w-4 h-4" /> CBT
              </button>
              <button
                onClick={() => go('/xrevise-register')}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary to-primaryDark text-white px-4 py-3 rounded-xl font-semibold text-sm"
              >
                <BookOpen className="w-4 h-4" /> XREVISE
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
