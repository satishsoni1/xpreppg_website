import { useEffect, useState } from "react";
import { Search, Mail, Phone, MapPin, Download, Loader2, Plus, Key, X, CheckCircle } from "lucide-react"; 
import { AdminAPI } from "@/services/adminApi"; 
import * as XLSX from 'xlsx';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '', category: '', city: '' });
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
   fetchStudents();
  }, []);

  const fetchStudents = async () => {
   setLoading(true);
   try {
     const data = await AdminAPI.getAllStudents();
     if (data.status) setStudents(data.students || []);
   } catch (err) {
     console.error(err);
   } finally {
     setLoading(false);
   }
  };

  const filtered = students.filter(s => 
    s.name?.toLowerCase().includes(term.toLowerCase()) || 
    s.email?.toLowerCase().includes(term.toLowerCase()) ||
    s.mobile?.includes(term)
  );

  const handleExport = () => {
    const dataToExport = filtered.map(s => ({
        "Student ID": s.id, "Name": s.name, "Email": s.email, "Mobile": s.mobile,
        "City": s.city || "N/A", "Category": s.category || "General",
        "Joined Date": new Date(s.created_at).toLocaleDateString('en-IN')
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, `Students_List_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await AdminAPI.createStudent(formData);
      if (res.status) {
        setNotification({ msg: "Student registered successfully!", type: 'success' });
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', mobile: '', password: '', category: '', city: '' });
        fetchStudents();
      } else {
        setNotification({ msg: res.message || "Registration failed.", type: 'error' });
      }
    } catch (err) {
      setNotification({ msg: "Server Error", type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newPassword) return;
    setSubmitting(true);
    try {
      const res = await AdminAPI.resetStudentPassword(selectedStudent.id, newPassword);
      if (res.status) {
        setNotification({ msg: `Password reset for ${selectedStudent.name}!`, type: 'success' });
        setIsResetModalOpen(false);
        setNewPassword("");
      } else {
        setNotification({ msg: res.message || "Failed to reset password.", type: 'error' });
      }
    } catch (err) {
      setNotification({ msg: "Server Error", type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in relative">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 font-medium text-white transition-all ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} Students found</p>
         </div>
         
         <div className="flex flex-wrap justify-end gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                className="pl-10 pr-4 py-2 border rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
                placeholder="Search..."
                value={term}
                onChange={e => setTerm(e.target.value)}
                />
            </div>
            
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm whitespace-nowrap">
                <Plus size={18} /> Add Student
            </button>

            <button onClick={handleExport} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition shadow-sm whitespace-nowrap">
                <Download size={18} /> Export
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                    <th className="p-4 pl-6">Student Profile</th>
                    <th className="p-4">Contact Details</th>
                    <th className="p-4">Location & Type</th>
                    <th className="p-4">Joined On</th>
                    <th className="p-4 text-center pr-6">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600"/></td></tr>
                ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">No students found.</td></tr>
                ) : (
                    filtered.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50 transition duration-150 group">
                            <td className="p-4 pl-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                                        {s.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{s.name}</p>
                                        <p className="text-xs text-gray-400 font-mono">ID: {s.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-gray-600"><Mail size={14} className="text-gray-400"/> {s.email}</div>
                                    <div className="flex items-center gap-2 text-gray-600"><Phone size={14} className="text-gray-400"/> {s.mobile}</div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1.5 items-start">
                                    {s.city ? <span className="flex items-center gap-1 text-gray-600 text-xs font-medium"><MapPin size={12}/>{s.city}</span> : <span className="text-gray-400 text-xs">-</span>}
                                    <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{s.category || "General"}</span>
                                </div>
                            </td>
                            <td className="p-4 text-gray-500 text-xs font-medium">
                                {new Date(s.created_at).toLocaleDateString('en-GB')}
                            </td>
                            <td className="p-4 pr-6 text-center">
                                <button 
                                  onClick={() => { setSelectedStudent(s); setIsResetModalOpen(true); }}
                                  title="Reset Password"
                                  className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-colors border border-amber-100"
                                >
                                    <Key size={16} />
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
         </div>
      </div>

      {/* --- ADD STUDENT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Plus size={20} className="text-blue-500"/> Register Student</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500">Full Name *</label><input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                <div><label className="text-xs font-bold text-slate-500">Mobile Number *</label><input required type="tel" value={formData.mobile} onChange={e=>setFormData({...formData, mobile: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
              </div>
              <div><label className="text-xs font-bold text-slate-500">Email Address *</label><input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
              <div><label className="text-xs font-bold text-slate-500">Password *</label><input required type="text" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500">Category</label><input type="text" placeholder="e.g. Pre-Intern" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                <div><label className="text-xs font-bold text-slate-500">City</label><input type="text" placeholder="e.g. Mumbai" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin"/> : "Register Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESET PASSWORD MODAL --- */}
      {isResetModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-lg text-amber-800 flex items-center gap-2"><Key size={20}/> Reset Password</h2>
              <button onClick={() => setIsResetModalOpen(false)} className="text-amber-600 hover:text-red-500"><X size={20}/></button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium">Resetting password for <span className="font-bold text-slate-900">{selectedStudent.name}</span></p>
              <div>
                <label className="text-xs font-bold text-slate-500">New Password *</label>
                <input required type="text" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-mono"/>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsResetModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:bg-amber-300 flex items-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin"/> : "Confirm Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}