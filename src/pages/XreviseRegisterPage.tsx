import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, CheckCircle2, UploadCloud, MessageCircle } from "lucide-react";
import imageCompression from "browser-image-compression";
import { PublicAPI } from "@/services/publicApi";
import { StudentAPI } from "@/services/studentApi";
import CityBottomSheet from "@/components/CitySelect";
import logo from "@/assets/logo.png";

interface City {
  id: number;
  name: string;
  is_active: boolean;
}

const CATEGORIES = ["Pre-Intern", "Intern", "Post-Intern"];

export default function XreviseRegisterPage() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [openCityPicker, setOpenCityPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    category: "",
    city: "",
    photo: null as File | null,
  });

  useEffect(() => {
    PublicAPI.getCities()
      .then(res => setCities(res.cities || []))
      .catch(() => setCities([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 1000, useWebWorker: true });
      setFormData(prev => ({ ...prev, photo: compressed }));
    } catch {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) { alert("Please select a category."); return; }
    if (!formData.city) { alert("Please select your city."); return; }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("mobile", formData.mobile);
      body.append("email", formData.email);
      body.append("category", formData.category);
      body.append("city", formData.city);
      if (formData.photo) body.append("photo", formData.photo);

      const res = await StudentAPI.registerXrevise(body);
      if (!res.status) {
        alert(res.message || "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/student/login"), 2000);
    } catch {
      alert("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy to-navyLight flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Welcome to X PREP PG! You'll receive your login credentials shortly. Redirecting to login…
          </p>
          <button
            onClick={() => navigate("/student/login")}
            className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-bold transition-colors"
          >
            Go to Student Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navyLight flex flex-col">
      {/* Top bar */}
      <div className="px-4 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <img src={logo} alt="X PREP PG" className="w-20 object-contain" />
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Home
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-start">

          {/* Left panel */}
          <div className="lg:w-2/5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <span className="text-accent font-bold text-sm uppercase tracking-wider">X REVISE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              Register for <br /><span className="text-accent">XREVISE Program</span>
            </h1>
            <p className="text-white/70 mb-8 leading-relaxed">
              High-yield visual posters, revision schedules, and performance tracking — everything you need for NEET PG success.
            </p>
            <ul className="space-y-3">
              {[
                "High-yield visual revision posters",
                "Subject-wise revision schedule",
                "Online mock tests (CBT)",
                "Performance tracking & reports",
                "Expert-designed exam content",
              ].map(point => (
                <li key={point} className="flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/50 text-xs mb-3">Also want to register for CBT?</p>
              <button
                onClick={() => navigate("/cbt-register")}
                className="flex items-center gap-2 text-accent hover:text-white text-sm font-semibold transition-colors"
              >
                Go to CBT Registration <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>

          {/* Right panel — form */}
          <div className="lg:w-3/5 w-full">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-navy mb-1">Create Your Account</h2>
              <p className="text-gray-400 text-sm mb-6">Fill in your details to get started with XREVISE</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input
                      type="text" name="name" value={formData.name}
                      onChange={handleChange} required
                      placeholder="Dr. Ravi Sharma"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Mobile Number *</label>
                    <input
                      type="tel" name="mobile" value={formData.mobile}
                      onChange={handleChange} required
                      placeholder="10-digit mobile"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email ID *</label>
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleChange} required
                    placeholder="your@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat} type="button"
                        onClick={() => setFormData(p => ({ ...p, category: cat }))}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          formData.category === cat
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">City *</label>
                  <button
                    type="button"
                    onClick={() => setOpenCityPicker(true)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-left hover:border-primary transition-colors focus:ring-2 focus:ring-primary outline-none"
                  >
                    {formData.city || <span className="text-gray-400">Select your city</span>}
                  </button>
                  <CityBottomSheet
                    cities={cities}
                    value={formData.city}
                    open={openCityPicker}
                    setOpen={setOpenCityPicker}
                    onSelect={(c: string) => setFormData(p => ({ ...p, city: c }))}
                  />
                </div>

                {/* Photo upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Photo (Optional)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition">
                    <input
                      type="file" id="photo-upload" accept="image/*"
                      onChange={handlePhotoUpload} className="hidden"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer block">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-secondaryMiddle" />
                      ) : (
                        <div className="py-3">
                          <UploadCloud className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <span className="text-primary font-medium text-sm">Click to upload photo</span>
                          <p className="text-xs text-gray-400 mt-0.5">Max 5MB · Auto-compressed</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primaryDark text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg transition-all disabled:opacity-60 mt-2"
                >
                  {loading ? "Registering…" : "Register for XREVISE"}
                </button>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                  <button type="button" onClick={() => navigate("/student/login")} className="text-primary font-semibold hover:underline">
                    Already registered? Login
                  </button>
                  <a href="https://wa.me/919370100887" target="_blank" className="flex items-center gap-1 hover:text-green-600 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> Need help?
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
