import { Menu, X, LogIn, ChevronDown, Monitor, BookOpen, Layers, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import logo from '@/assets/logo.png';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

type NavLink = { label: string; to: string; hint?: string; badge?: string };

const NAV_ITEMS: NavLink[] = [
  { label: 'XRevise', to: '/xrevise-program', hint: 'NEET PG' },
  { label: 'CBT Mock', to: '/cbt', hint: 'NEET PG' },
  { label: 'Flash Cards', to: '/neet-ug-flashcards', hint: 'NEET UG', badge: 'New' },
  { label: 'Poster Store', to: '/shop', hint: 'NEET PG' },
  { label: 'Contact', to: '/contact' },
];

const REGISTER_OPTIONS = [
  { label: 'XRevise', desc: 'NEET PG revision program', to: '/xrevise-register', icon: BookOpen },
  { label: 'CBT', desc: 'Computer-based mock tests', to: '/cbt-register', icon: Monitor },
];

export default function Navigation({ mobileMenuOpen, setMobileMenuOpen }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const registerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (registerRef.current && !registerRef.current.contains(e.target as Node)) setRegisterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setRegisterOpen(false);
  };

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/');

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-card' : 'bg-white'} border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <button className="flex items-center shrink-0" onClick={() => go('/')} aria-label="XPrepPG home">
            <img src={logo} alt="XPrepPG" className="h-14 w-auto object-contain" />
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.to}
                onClick={() => go(item.to)}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(item.to) ? 'text-primary bg-secondary' : 'text-ink/80 hover:text-primary hover:bg-mist'
                }`}
              >
                <span className="flex flex-col items-start leading-tight">
                  {item.hint && <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{item.hint}</span>}
                  {item.label}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-accent text-navy text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => go('/student/login')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-navy hover:bg-mist transition"
            >
              <LogIn className="w-4 h-4" /> Login
            </button>

            <div className="relative" ref={registerRef}>
              <button
                onClick={() => setRegisterOpen(o => !o)}
                className="flex items-center gap-1.5 bg-navy hover:bg-navyLight text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-card"
              >
                Register
                <ChevronDown className={`w-4 h-4 transition-transform ${registerOpen ? 'rotate-180' : ''}`} />
              </button>

              {registerOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-lift border border-gray-100 p-2 z-50">
                  {REGISTER_OPTIONS.map(({ label, desc, to, icon: Icon }) => (
                    <button
                      key={to}
                      onClick={() => go(to)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition text-left"
                    >
                      <span className="w-9 h-9 bg-secondary text-primary rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-navy">{label}</span>
                        <span className="block text-xs text-gray-500">{desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -mr-2 text-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lift max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.to === '/neet-ug-flashcards' ? Layers : item.to === '/shop' ? ShoppingBag : item.to === '/cbt' ? Monitor : BookOpen;
              return (
                <button
                  key={item.to}
                  onClick={() => go(item.to)}
                  className={`w-full flex items-center gap-3 py-3 px-3 rounded-xl text-left transition ${isActive(item.to) ? 'bg-secondary' : 'hover:bg-mist'}`}
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-navy">{item.label}</span>
                    {item.hint && <span className="block text-[11px] text-gray-400">{item.hint}</span>}
                  </span>
                  {item.badge && (
                    <span className="bg-accent text-navy text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">{item.badge}</span>
                  )}
                </button>
              );
            })}

            <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
              <button
                onClick={() => go('/student/login')}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-navy px-6 py-3 rounded-xl font-semibold hover:bg-mist transition"
              >
                <LogIn className="w-4 h-4" /> Student Login
              </button>
              <div className="grid grid-cols-2 gap-2">
                {REGISTER_OPTIONS.map(({ label, to }) => (
                  <button
                    key={to}
                    onClick={() => go(to)}
                    className="flex items-center justify-center gap-1.5 bg-navy text-white px-4 py-3 rounded-xl font-semibold text-sm"
                  >
                    {label} <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
