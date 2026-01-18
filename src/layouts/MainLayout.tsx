import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Contact from "@/components/Contact";
import ScrollToTop from "@/components/ScrollToTop";
import { X, UploadCloud } from "lucide-react";
import CityBottomSheet from "@/components/CitySelect";
import { StudentAPI } from "@/services/studentApi";
import imageCompression from 'browser-image-compression'; // 1. Import Compression
import { AdminAPI } from "@/services/adminApi";
import { PublicAPI } from "@/services/publicApi";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // We keep loading state local since we are calling API directly here now
  const [loading, setLoading] = useState(false);

  const [cities, setCities] = useState([]);
  const [openCityPicker, setOpenCityPicker] = useState(false);

  // 2. Change 'photo' to hold the FILE object, not string
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    mobile: "",
    email: "",
    city: "",
    photo: null as File | null, 
  });

  // Load Cities 
  useEffect(() => {
    PublicAPI.getCities()
      .then((res) => {
        setCities(res.cities)
      })
      .catch(() => setCities([]));
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. UPDATED: Compress & Handle File
  const handlePhotoUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately (using object URL is faster than Base64)
    setPhotoPreview(URL.createObjectURL(file));

    try {
      const options = {
        maxSizeMB: 0.2, // Limit to 200KB
        maxWidthOrHeight: 1000, // Limit dimensions
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      setFormData((prev) => ({ ...prev, photo: compressedFile }));
    } catch (error) {
      console.error("Compression failed:", error);
      // Fallback to original file if compression fails
      setFormData((prev) => ({ ...prev, photo: file }));
    }
  };

  // 4. UPDATED: Submit as FormData
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Create FormData object (Standard for file uploads)
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("mobile", formData.mobile);
      submitData.append("email", formData.email);
      submitData.append("category", formData.category);
      submitData.append("city", formData.city);
      
      // Only append photo if it exists
      if (formData.photo) {
        submitData.append("photo", formData.photo);
      }

      // Send to API
      const response = await StudentAPI.register(submitData);
  
      if (!response.status) {
        alert(response.message || "Registration failed");
        return;
      }
  
      alert("Registration Successful! Please Login.");
      setShowForm(false);
      
      setTimeout(() => {
        window.location.href = "/student/login";
      }, 1000);
  
    } catch (error) {
      console.error("API Error:", error);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Listen for modal open event
  useEffect(() => {
    const openModal = () => setShowForm(true);
    window.addEventListener("open-register-modal", openModal);
    return () => window.removeEventListener("open-register-modal", openModal);
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      <ScrollToTop />
      <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="pt-28">{children}</div>
      <Contact />

      {/* Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">

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
              {/* Inputs */}
              <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" required />
              <input type="tel" name="mobile" placeholder="Mobile Number" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" required />
              <input type="email" name="email" placeholder="Email ID" onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" required />

              {/* Category (Simplified for brevity) */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                   {["Pre-Intern", "Intern", "Post-Intern"].map(cat => (
                     <div key={cat} 
                          onClick={() => setFormData(p => ({...p, category: cat}))}
                          className={`p-2 rounded border text-center cursor-pointer text-sm ${formData.category === cat ? 'bg-emerald-100 border-emerald-500' : ''}`}>
                        {cat}
                     </div>
                   ))}
                </div>
              </div>

              {/* City Picker Trigger */}
              <div className="w-full border border-gray-300 rounded-lg p-3 cursor-pointer" onClick={() => setOpenCityPicker(true)}>
                {formData.city || "Select City"}
              </div>
              <CityBottomSheet cities={cities} value={formData.city} open={openCityPicker} setOpen={setOpenCityPicker} onSelect={(c:any) => setFormData(p => ({ ...p, city: c }))} />

              {/* Photo Upload UI */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition">
                <input 
                  type="file" 
                  id="photo-upload" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                />
                
                <label htmlFor="photo-upload" className="cursor-pointer block">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-emerald-100" />
                  ) : (
                    <div className="py-4">
                      <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <span className="text-primary font-medium">Click to upload photo</span>
                      <p className="text-xs text-gray-400 mt-1">Max 5MB (Auto-compressed)</p>
                    </div>
                  )}
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50">
                {loading ? "Processing..." : "Register Now"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}