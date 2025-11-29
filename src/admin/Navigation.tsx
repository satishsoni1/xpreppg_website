
import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png'; // <-- add this
import { useNavigate } from 'react-router-dom';



export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          <div className="flex items-center space-x-3">
            {/* <img src="https://portal.xpreppg.com/storage/site/logo.jpg" width="23%"/> */}
            <img 
              src={logo} 
              alt="Logo"
              className="w-24 object-contain"
              onClick={() => navigate("/")}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
