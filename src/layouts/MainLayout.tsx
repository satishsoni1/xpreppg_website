import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Contact from "@/components/Contact";
import ScrollToTop from "@/components/ScrollToTop";
import { X } from "lucide-react";
import useRegisterUser from "@/hooks/useRegisterUser";
import axios from "axios"; 

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [status, setStatus] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const { registerUser, loading, status } = useRegisterUser();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    mobile: "",
    email: "",
    city: "",
    photo: "",
  });
  const [cities, setCities] = useState([]);

  useEffect(() => {
    axios.get("https://api.xpreppg.com/api/cities").then((res) => {
      setCities(res.data);
    });
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();

    registerUser(formData, (response) => {
      if (!response.status) {
        alert(response.message); // Show message
        return;
      }
      setTimeout(() => {
        window.location.href = "/pricing";
      }, 1500);
    });
  };
  useEffect(() => {
    const openModal = () => setShowForm(true);

    window.addEventListener("open-register-modal", openModal);

    return () => {
      window.removeEventListener("open-register-modal", openModal);
    };
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Page content */}
      <div className="pt-28">
        {children}
      </div>

      {/* Contact footer shown on all pages */}
      <Contact />
      {/* Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">
              Register for NEET PG CBT
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />

              {/* <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              >
                <option value="">Select Category</option>
                <option>Pre Intern</option>
                <option>Intern</option>
                <option>Post Intern</option>
              </select> */}

              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email ID"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />
<select
  name="city"
  value={formData.city}
  onChange={handleChange}
  className="w-full border border-gray-300 rounded-lg p-3"
  required
>
  <option value="">Select City</option>
  {cities.map(city => (
    <option key={city._id} value={city.name}>
      {city.name}
    </option>
  ))}
</select>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="mt-3 w-24 h-24 rounded-lg object-cover border" />
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primaryDark text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg"
              >
                {loading ? "Submitting..." : "Submit Registration"}
              </button>

              {status && <p className="text-center text-green-600 mt-3 font-medium">{status}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
