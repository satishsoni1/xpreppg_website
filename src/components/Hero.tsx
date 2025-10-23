import { useState } from 'react';
import { ArrowRight, Calendar, Brain, X, Camera } from 'lucide-react';

export default function Hero() {
  const [showForm, setShowForm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 opacity-70"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm mb-8 border border-emerald-100">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-semibold text-gray-700">India's First NEET PG CBT Platform</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Experience the Real
          <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            NEET PG Exam
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Full-length CBT simulations, in-depth performance analytics, and expert-led live discussions after every exam.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-emerald-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-emerald-600" />
              <div className="text-left">
                <p className="text-sm text-gray-500 font-medium">Upcoming Exam</p>
                <p className="text-2xl font-bold text-gray-900">27th December 2025</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2"
          >
            <Brain className="w-6 h-6" />
            <span>Register Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="bg-white text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-2 border-gray-200">
            Get Exam Ready
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">Register for NEET PG CBT</h2>

            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500" required>
                  <option value="">Select Category</option>
                  <option>Pre Intern</option>
                  <option>Intern</option>
                  <option>Post Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input type="tel" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500" required>
                  <option value="">Select City</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bengaluru</option>
                  <option>Chennai</option>
                  <option>Pune</option>
                  <option>Hyderabad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
                  <button
                    type="button"
                    onClick={() => document.querySelector<HTMLInputElement>('#cameraInput')?.click()}
                    className="flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Camera</span>
                  </button>
                  <input id="cameraInput" type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                </div>
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="mt-3 w-24 h-24 rounded-lg object-cover border" />
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                Submit Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
