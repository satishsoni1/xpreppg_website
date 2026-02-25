import { useEffect, useState } from "react";
import { StudentAPI } from "@/services/studentApi";
import { 
  User, Mail, Phone, BookOpen, Camera, Save, X, 
  Loader2, Lock, Key, CheckCircle, AlertCircle 
} from "lucide-react";
import imageCompression from 'browser-image-compression';
import { API_BASE_URL } from "@/config"; 

export default function StudentProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Profile Edit States
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    photo: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Change Password States
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
      photo: null
    });
    setPhotoPreview(userData.photo_url ? `${API_BASE_URL}${userData.photo_url}` : null);
  };

  // 2. Handle Photo Change
  const handlePhotoChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));

    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800 });
      setFormData(prev => ({ ...prev, photo: compressedFile }));
    } catch (err) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  // 3. Save Profile Changes
  const handleProfileSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("category", formData.category);
      if (formData.photo) submitData.append("photo", formData.photo);

      const res = await StudentAPI.updateProfile(submitData);

      if (res.status) {
        setUser(res.user);
        setIsEditing(false);
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

  // 4. Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwdMessage({ text: "New passwords do not match.", type: 'error' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPwdMessage({ text: "New password must be at least 6 characters.", type: 'error' });
      return;
    }

    setPwdLoading(true);

    try {
      const res = await StudentAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });

      if (res.status) {
        setPwdMessage({ text: res.message, type: 'success' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwdMessage({ text: res.message || "Failed to update password.", type: 'error' });
      }
    } catch (error) {
      setPwdMessage({ text: "Server error. Please try again later.", type: 'error' });
    } finally {
      setPwdLoading(false);
      setTimeout(() => setPwdMessage(null), 3000);
    }
  };

  if (loading) return <div className="flex h-64 justify-center items-center"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      <div className="space-y-6">
        {/* ===================== PROFILE CARD ===================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700"></div>
          
          <div className="px-6 md:px-8 pb-8">
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
                  <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-emerald-700 shadow-lg transition-transform transform hover:scale-110">
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
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition shadow-sm text-sm"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setIsEditing(false); resetForm(user); }}
                      className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                      title="Cancel"
                    >
                      <X size={20} />
                    </button>
                    <button 
                      onClick={handleProfileSubmit}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition shadow-md"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition appearance-none outline-none"
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
                  <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={user?.mobile}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <Lock size={14} className="absolute right-4 top-4 text-gray-400" />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={user?.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <Lock size={14} className="absolute right-4 top-4 text-gray-400" />
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* ===================== CHANGE PASSWORD CARD ===================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center gap-2">
            <Key className="text-emerald-600" size={20} />
            <h2 className="font-bold text-lg text-gray-800">Security Details</h2>
          </div>

          <form onSubmit={handleChangePassword} className="p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2 max-w-md">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
                <input 
                  type="password" 
                  required
                  value={passwords.currentPassword}
                  onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwords.newPassword}
                  onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {/* Status Message */}
            {pwdMessage && (
              <div className={`p-4 rounded-xl text-sm font-bold flex items-start gap-2 ${pwdMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {pwdMessage.type === 'success' ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                <span>{pwdMessage.text}</span>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={pwdLoading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                className="w-full md:w-auto px-8 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 disabled:bg-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {pwdLoading ? <Loader2 size={18} className="animate-spin" /> : "Update Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}