import { useState } from "react";
import { ArrowRight, Calendar, Brain, X } from "lucide-react";
import axios from "axios";

export default function Hero() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    mobile: "",
    email: "",
    city: "",
    photo: "",
  });

  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e:any) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await axios.post("https://api.xpreppg.com/api/web/register", formData);
      // if (res.data.status) {
      //   setStatus("Registration successful! Team will connect you shortly.");
      //   setFormData({ name: "", category: "", mobile: "", email: "", city: "", photo: "" });
      //   setPhotoPreview(null);
      //   setShowForm(false);
      // }
      if (res.data.status) {
        setStatus("Registration successful! Redirecting to plans...");
      
        setTimeout(() => {
          // Store mobile for enrollment phase
          localStorage.setItem("x_user_mobile", formData.mobile);
          localStorage.setItem("x_user_email", formData.email);
          localStorage.setItem("x_user_name", formData.name);
      
          window.location.href = "/pricing";
        }, 1500);
      } else {
        setStatus("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondaryMiddle to-secondaryDark opacity-70"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 left-10 w-72 h-72 bg-secondaryDark rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-secondaryMiddle rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm mb-8 border border-emerald-100">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm font-semibold text-gray-700">India's First NEET PG CBT Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Experience the Real
            <span className="block bg-gradient-to-r from-primary to-primaryDark bg-clip-text text-transparent">
              NEET PG Exam
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Full-length CBT simulations, in-depth performance analytics, and expert-led live discussions after every exam.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-primary transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center space-x-4">
                <Calendar className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium">Upcoming Exam</p>
                  <p className="text-2xl font-bold text-gray-900">15th January 2026</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="group bg-gradient-to-r from-primary to-primaryDark text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2"
            >
              <Brain className="w-6 h-6" />
              <span>Register Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
  href="https://portal.xpreppg.com/login"
  target="_blank"
  rel="noopener noreferrer"
>
  <button className="bg-white text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-2 border-gray-200">
    Get Exam Ready
  </button>
</a>
            
          </div>
          {status && <p className="text-center text-green-600 mt-3 font-medium">{status}</p>}
        </div>
      </div>

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
                <option>Agartala</option>
<option>Agra</option>
<option>Agroha</option>
<option>Ahmedabad</option>
<option>Alappuzha</option>
<option>Amaravati</option>
<option>Ambajogai</option>
<option>Amritsar</option>
<option>Aurangabad</option>
<option>Bareilly</option>
<option>Behrampur</option>
<option>Belgaum</option>
<option>Bhatinda</option>
<option>Bengaluru</option>
<option>Bhavnagar</option>
<option>Bhopal</option>
<option>Bikaner</option>
<option>Bilaspur</option>
<option>Burla</option>
<option>Calicut</option>
<option>Chandigarh</option>
<option>Chennai</option>
<option>Cochin</option>
<option>Coimbatore</option>
<option>Davangere</option>
<option>Dehradun</option>
<option>Delhi</option>
<option>Dhanbad</option>
<option>Dibrugarh</option>
<option>Goa</option>
<option>Gorakhpur</option>
<option>Gulbarga</option>
<option>Gurgaon</option>
<option>Guwahati</option>
<option>Gwalior</option>
<option>Haldwani</option>
<option>Hubli</option>
<option>Hyderabad</option>
<option>Imphal</option>
<option>Indore</option>
<option>Jabalpur</option>
<option>Jaipur</option>
<option>Jammu</option>
<option>Jamnagar</option>
<option>Jamshedpur</option>
<option>Jodhpur</option>
<option>Jorhat</option>
<option>Kannur</option>
<option>Kanpur</option>
<option>Kolhapur</option>
<option>Kolkata</option>
<option>Kollam</option>
<option>Kottayam</option>
<option>Kota</option>
<option>Latur</option>
<option>Lucknow</option>
<option>Ludhiana</option>
<option>Madurai</option>
<option>Malappuram</option>
<option>Mangalore</option>
<option>Manipal</option>
<option>Meerut</option>
<option>Miraj</option>
<option>Mumbai</option>
<option>Mysore</option>
<option>Nagercoil</option>
<option>Nagpur</option>
<option>Nanded</option>
<option>Nashik</option>
<option>Noida</option>
<option>Patiala</option>
<option>Patna</option>
<option>Pondicherry</option>
<option>Prayagraj</option>
<option>Pune</option>
<option>Raipur</option>
<option>Rajkot</option>
<option>Ranchi</option>
<option>Rewa</option>
<option>Sagar</option>
<option>Salem</option>
<option>Sangli</option>
<option>Shillong</option>
<option>Silchar</option>
<option>Siliguri</option>
<option>Srikakulam</option>
<option>Srinagar</option>
<option>Surat</option>
<option>Tanda</option>
<option>Thrissur</option>
<option>Tirunelveli</option>
<option>Tirupati</option>
<option>Trichy</option>
<option>Trivandrum</option>
<option>Udaipur</option>
<option>Ujjain</option>
<option>Vadodara</option>
<option>Varanasi</option>
<option>Vijayawada</option>
<option>Visakhapatnam</option>
<option>Warangal</option>
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
    </section>
  );
}
