import { useEffect, useState } from "react";
import { StudentAPI } from "@/services/studentApi";
import { User, Mail, Phone, BookOpen, Camera, Save, X, Loader2, Lock } from "lucide-react";
import imageCompression from 'browser-image-compression';
import { API_BASE_URL } from "@/config"; 

export default function StudentProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    password: "", // Optional
    photo: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // 1. Fetch Profile on Mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await StudentAPI.getProfile();
      if (res.status) {
        setUser(res.user);
        resetForm(res.user);
        // Update LocalStorage to keep session fresh
        localStorage.setItem("student_user", JSON.stringify(res.user));
      }
    } catch (err) {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (userData: any) => {
    setFormData({
      name: userData.name,
      category: userData.category || "Pre-Intern",
      password: "",
      photo: null
    });
    setPhotoPreview(userData.photo_url ? `${API_BASE_URL}${userData.photo_url}` : null);
  };

  // 2. Handle Photo Change
  const handlePhotoChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file)); // Immediate preview

    // Compress
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800 });
      setFormData(prev => ({ ...prev, photo: compressedFile }));
    } catch (err) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  // 3. Save Changes
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("category", formData.category);
      if (formData.password) submitData.append("password", formData.password);
      if (formData.photo) submitData.append("photo", formData.photo);

      const res = await StudentAPI.updateProfile(submitData);

      if (res.status) {
        setUser(res.user);
        setIsEditing(false);
        // Update Local Storage
        localStorage.setItem("student_user", JSON.stringify(res.user));
        alert("Profile updated successfully!");
      } else {
        alert(res.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 justify-center items-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Banner / Header */}
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            
            {/* Profile Photo */}
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-md">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={48} />
                  </div>
                )}
              </div>
              
              {/* Photo Upload Button (Only in Edit Mode) */}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 shadow-lg transition-transform transform hover:scale-110">
                  <Camera size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
            </div>

            {/* Edit/Cancel Buttons */}
            <div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                   <button 
                    onClick={() => { setIsEditing(false); resetForm(user); }}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                    title="Cancel"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition shadow-md"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 text-gray-400" size={18} />
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition appearance-none"
                >
                   <option value="Pre-Intern">Pre-Intern</option>
                   <option value="Intern">Intern</option>
                   <option value="Post-Intern">Post-Intern</option>
                </select>
              </div>
            </div>

            {/* Mobile (Read Only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={user?.mobile}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <Lock size={14} className="absolute right-3 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Email ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={user?.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <Lock size={14} className="absolute right-3 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* Password Reset (Only Edit Mode) */}
            {isEditing && (
              <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Change Password (Optional)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="Enter new password to change"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}