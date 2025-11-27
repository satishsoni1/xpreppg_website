import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function NavigationInner() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-26">
          
          {/* Logo */}
          <img
            src={logo}
            alt="Logo"
            className="w-24 cursor-pointer"
            onClick={() => navigate("/")}
          />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate("/")}
              className="text-gray-700 hover:text-primary font-medium"
            >
              Home
            </button>

            <button
              onClick={() => {
                window.dispatchEvent(new Event("open-register-modal"));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-primary text-white px-6 py-2 rounded-lg font-semibold shadow hover:opacity-90"
            >
              Register Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => {
                navigate("/");
                setOpen(false);
              }}
              className="block text-gray-700 text-left w-full py-2"
            >
              Home
            </button>

            <button
              onClick={() => {
                window.dispatchEvent(new Event("open-register-modal"));
                window.scrollTo({ top: 0, behavior: "smooth" });
                setOpen(false);
              }}
              className="block w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold"
            >
              Register Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
