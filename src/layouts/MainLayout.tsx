import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Contact from "@/components/Contact";
import ScrollToTop from "@/components/ScrollToTop";
import { X } from "lucide-react";
import useRegisterUser from "@/hooks/useRegisterUser";
import { AdminAPI } from "@/services/api";
import CityBottomSheet from "@/components/CitySelect";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const { registerUser, loading, status } = useRegisterUser();

  const [cities, setCities] = useState([]);
  const [openCityPicker, setOpenCityPicker] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    mobile: "",
    email: "",
    city: "",
    photo: "",
  });

  // ------------------------------------------------------
  //  LOAD CITIES SAFELY
  // ------------------------------------------------------
  useEffect(() => {
    AdminAPI.getCities()
      .then((res) => {
        const data = res.data?.cities || res.data || [];
        setCities(Array.isArray(data) ? data : []);
      })
      .catch(() => setCities([]));
  }, []);

  // Generic Change Handler
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Photo Upload → Base64
  const handlePhotoUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setFormData((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = (e: any) => {
    e.preventDefault();

    registerUser(formData, (response) => {
      if (!response.status) {
        alert(response.message);
        return;
      }

      setTimeout(() => {
        window.location.href = "/enroll";
      }, 1500);
    });
  };

  // Listen for "open-register-modal" event
  useEffect(() => {
    const openModal = () => setShowForm(true);
    window.addEventListener("open-register-modal", openModal);

    return () => window.removeEventListener("open-register-modal", openModal);
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      <ScrollToTop />

      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Floating Button REMOVED to avoid conflict with WhatsApp */}

      {/* Page Content */}
      <div className="pt-28">{children}</div>

      {/* Footer */}
      <Contact />

      {/* Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative mx-auto mt-10 mb-10">

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

              {/* Name */}
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />

              {/* Mobile */}
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Email ID"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />

              {/* CATEGORY SELECTION CARDS */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Select Category
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1: Pre-Intern */}
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, category: "Pre-Intern" }))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.category === "Pre-Intern"
                      ? "border-primary bg-primary/10 shadow-md scale-105"
                      : "border-gray-300 hover:border-primary"
                      }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-primary text-3xl">📘</div>
                      <p className="font-semibold text-gray-700">Pre-Intern</p>
                    </div>
                  </div>

                  {/* Card 2: Intern */}
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, category: "Intern" }))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.category === "Intern"
                      ? "border-primary bg-primary/10 shadow-md scale-105"
                      : "border-gray-300 hover:border-primary"
                      }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-primary text-3xl">🩺</div>
                      <p className="font-semibold text-gray-700">Intern</p>
                    </div>
                  </div>

                  {/* Card 3: Post-Intern */}
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, category: "Post-Intern" }))}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.category === "Post-Intern"
                      ? "border-primary bg-primary/10 shadow-md scale-105"
                      : "border-gray-300 hover:border-primary"
                      }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-primary text-3xl">🎓</div>
                      <p className="font-semibold text-gray-700">Post-Intern</p>
                    </div>
                  </div>

                </div>
              </div>


              {/* CITY PICKER */}
              <div
                className="w-full border border-gray-300 rounded-lg p-3 cursor-pointer"
                onClick={() => setOpenCityPicker(true)}
              >
                {formData.city || "Select City"}
              </div>

              <CityBottomSheet
                cities={cities}
                value={formData.city}
                open={openCityPicker}
                setOpen={setOpenCityPicker}
                onSelect={(city: string) =>
                  setFormData((prev) => ({ ...prev, city }))
                }
              />

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo
                </label>

                <input type="file" accept="image/*" onChange={handlePhotoUpload} />

                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="mt-3 w-24 h-24 rounded-lg object-cover border"
                  />
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primaryDark text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg"
              >
                {loading ? "Submitting..." : "Submit Registration"}
              </button>

              {status && (
                <p className="text-center text-green-600 mt-3 font-medium">
                  {status}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}