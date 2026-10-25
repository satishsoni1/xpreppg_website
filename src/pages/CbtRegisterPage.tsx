import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Monitor, ChevronLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { PublicAPI } from "@/services/publicApi";
import { StudentAPI } from "@/services/studentApi";
import CityBottomSheet from "@/components/CitySelect";
import logo from "@/assets/logo.png";
import { CBT_STREAMS, CbtStream, cbtStream, isCbtStream } from "@/data/cbtStreams";

interface City {
  id: number;
  name: string;
  is_active: boolean;
}

// Highlights shown beside the form for each exam
const STREAM_POINTS: Record<CbtStream, string[]> = {
  neet_pg: ["200 Questions · 3.5 Hours", "NEET PG Pattern (+4 / -1 marking)"],
  neet_ug: ["180 Questions · 3 Hours", "Physics, Chemistry & Biology (+4 / -1)"],
  jee: ["75 Questions · 3 Hours", "Physics, Chemistry & Maths (+4 / -1)"],
};

export default function CbtRegisterPage() {
  const navigate = useNavigate();
  // /cbt-register?exam=neet_ug|jee preselects the exam from the CBT page
  const [params] = useSearchParams();
  const initialStream = isCbtStream(params.get("exam")) ? params.get("exam") as CbtStream : "neet_pg";
  const [cities, setCities] = useState<City[]>([]);
  const [openCityPicker, setOpenCityPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    exam_stream: initialStream,
    category: "",
    city: "",
    exam_mode: "" as "Online" | "On Centre" | "",
  });

  useEffect(() => {
    PublicAPI.getCities()
      .then(res => setCities(res.cities || []))
      .catch(() => setCities([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) { alert("Please select a category."); return; }
    if (!formData.exam_mode) { alert("Please select exam mode (Online or On Centre)."); return; }
    if (!formData.city) { alert("Please select your city."); return; }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("mobile", formData.mobile);
      body.append("email", formData.email);
      body.append("exam_stream", formData.exam_stream);
      body.append("category", formData.category);
      body.append("city", formData.city);
      body.append("registration_type", "CBT");
      body.append("exam_mode", formData.exam_mode);

      const res = await StudentAPI.register(body);
      if (!res.status) {
        alert(res.message || "Registration failed. Please try again.");
        return;
      }
      setSuccess(true);
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
            Thank you for registering for X PREP PG CBT. Our team will contact you shortly with your login credentials and exam schedule.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="https://wa.me/919370100887"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </a>
            <button
              onClick={() => navigate("/cbt")}
              className="border border-primary text-primary py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
            >
              Back to CBT Page
            </button>
          </div>
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
          onClick={() => navigate("/cbt")}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to CBT
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-start">

          {/* Left panel */}
          <div className="lg:w-2/5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Monitor className="w-5 h-5 text-accent" />
              </div>
              <span className="text-accent font-bold text-sm uppercase tracking-wider">X PREP PG CBT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              Register for <br /><span className="text-accent">Computer Based Test</span>
            </h1>
            <p className="text-white/70 mb-8 leading-relaxed">
              Full-length {cbtStream(formData.exam_stream).label} mock tests with instant results, all-India rank, and detailed subject-wise analysis.
            </p>
            <ul className="space-y-3">
              {[
                ...STREAM_POINTS[formData.exam_stream],
                "Instant Result & All-India Rank",
                "Solved Paper with Explanations",
                "Subject-wise Performance Report",
              ].map(point => (
                <li key={point} className="flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Right panel — form */}
          <div className="lg:w-3/5 w-full">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-navy mb-1">Create Your Account</h2>
              <p className="text-gray-400 text-sm mb-6">Fill in your details to get started with CBT</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Exam *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CBT_STREAMS.map(st => (
                      <button
                        key={st.value} type="button"
                        onClick={() => setFormData(p => ({ ...p, exam_stream: st.value, category: "" }))}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          formData.exam_stream === st.value
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input
                      type="text" name="name" value={formData.name}
                      onChange={handleChange} required
                      placeholder={formData.exam_stream === "neet_pg" ? "Dr. Ravi Sharma" : "Ravi Sharma"}
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
                    {cbtStream(formData.exam_stream).categories.map(cat => (
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
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Exam Mode *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["Online", "On Centre"] as const).map(mode => (
                      <button
                        key={mode} type="button"
                        onClick={() => setFormData(p => ({ ...p, exam_mode: mode }))}
                        className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                          formData.exam_mode === mode
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                        }`}
                      >
                        {mode === "Online" ? "💻 Online Exam" : "🏫 On Centre Exam"}
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primaryDark text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg transition-all disabled:opacity-60 mt-2"
                >
                  {loading ? "Registering…" : "Register for CBT"}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Already registered?{" "}
                  <button type="button" onClick={() => navigate("/student/login")} className="text-primary font-semibold hover:underline">
                    Student Login
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
