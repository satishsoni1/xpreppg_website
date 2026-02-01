import { useState, useEffect, useMemo } from "react";
import { 
  Plus, Calendar, Clock, Save, Edit, Trash2, X, 
  Loader2, MoreVertical, CheckCircle, PlayCircle, AlertCircle, Search 
} from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

export default function AdminExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "", date: "", duration_minutes: 180, total_marks: 800, price: 999, status: "upcoming"
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
        const res = await AdminAPI.getExams();
        if (res.status) setExams(res.exams);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    return {
        total: exams.length,
        live: exams.filter(e => e.status === 'live').length,
        upcoming: exams.filter(e => e.status === 'upcoming').length,
        completed: exams.filter(e => e.status === 'completed').length,
    };
  }, [exams]);

  // --- HANDLERS ---
  const handleStatusChange = async (exam: any, newStatus: string) => {
    // Optimistic Update
    const originalExams = [...exams];
    setExams(exams.map(e => e.id === exam.id ? { ...e, status: newStatus } : e));

    try {
        const payload = { ...exam, status: newStatus };
        // Ensure backend accepts the payload without mapping if names match, or map manually:
        const apiPayload = {
            title: exam.title,
            date: exam.date,
            duration_minutes: exam.duration || exam.duration_minutes,
            total_marks: exam.total_marks,
            status: newStatus 
        };
        
        await AdminAPI.updateExam(exam.id, apiPayload);
    } catch (err) {
        console.error(err);
        setExams(originalExams); // Revert
        alert("Failed to update status");
    }
  };

  const openEditModal = (exam: any) => {
    setEditingId(exam.id);
    setFormData({
        title: exam.title,
        date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : "", 
        duration_minutes: exam.duration_minutes || exam.duration, 
        total_marks: exam.total_marks,
        price: exam.price || 0,
        status: exam.status || "upcoming"
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: "", date: "", duration_minutes: 180, total_marks: 800, price: 999, status: "upcoming" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    setSubmitting(true);

    try {
        let res;
        if (editingId) res = await AdminAPI.updateExam(editingId, formData);
        else res = await AdminAPI.createExam(formData);

        if (res.status) {
            fetchExams();
            setIsModalOpen(false);
        } else {
            alert(res.message);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm("Are you sure you want to delete this exam?")) return;
    const res = await AdminAPI.deleteExam(id);
    if (res.status) setExams(exams.filter(e => e.id !== id)); 
  };

  const filteredExams = exams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      
      {/* --- TOP HEADER & STATS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Exam Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage, schedule and track your exams.</p>
        </div>
        <button 
            onClick={openCreateModal}
            className="bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 font-semibold"
        >
            <Plus size={20} /> Create New Exam
        </button>
      </div>

      {/* --- STATS WIDGETS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <StatCard label="Total Exams" value={stats.total} color="bg-blue-50 text-blue-700" icon={<Calendar size={20} />} />
         <StatCard label="Live Now" value={stats.live} color="bg-green-50 text-green-700" icon={<PlayCircle size={20} />} />
         <StatCard label="Upcoming" value={stats.upcoming} color="bg-purple-50 text-purple-700" icon={<Clock size={20} />} />
         <StatCard label="Completed" value={stats.completed} color="bg-gray-100 text-gray-700" icon={<CheckCircle size={20} />} />
      </div>

      {/* --- SEARCH & FILTER --- */}
      <div className="mb-6 relative">
         <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
         <input 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition"
            placeholder="Search exams by title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      {/* --- EXAM CARDS GRID --- */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600 w-10 h-10"/></div>
      ) : filteredExams.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400">No exams found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map(exam => (
                <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col">
                    
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-emerald-700 transition-colors line-clamp-2">
                                {exam.title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-400 text-xs mt-1 font-medium">
                                <Calendar size={12} /> {new Date(exam.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                        
                        {/* Status Dropdown */}
                        <div className="relative">
                            <select 
                                value={exam.status}
                                onChange={(e) => handleStatusChange(exam, e.target.value)}
                                className={`appearance-none pl-3 pr-8 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide cursor-pointer outline-none border transition-colors ${
                                    exam.status === 'live' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
                                    exam.status === 'completed' ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200' :
                                    'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                }`}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="live">Live</option>
                                <option value="completed">Ended</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="bg-gray-50 p-2 rounded-lg text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold">Duration</p>
                                <p className="text-sm font-semibold text-gray-800">{exam.duration || exam.duration_minutes}m</p>
                             </div>
                             <div className="bg-gray-50 p-2 rounded-lg text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold">Marks</p>
                                <p className="text-sm font-semibold text-gray-800">{exam.total_marks}</p>
                             </div>
                        </div>
                    </div>

                    {/* Card Footer (Actions) */}
                    <div className="p-4 border-t border-gray-50 flex gap-2">
                        <button 
                            onClick={() => openEditModal(exam)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-50 text-blue-600 font-semibold text-sm hover:bg-blue-100 transition"
                        >
                            <Edit size={16} /> Edit
                        </button>
                        <button 
                            onClick={() => handleDelete(exam.id)}
                            className="flex-none p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                            title="Delete Exam"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {editingId ? "Edit Exam" : "Create New Exam"}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Exam Title</label>
                        <input 
                            required
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="e.g. Grand Test - Anatomy"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                            <input 
                                required type="date"
                                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                            <select 
                                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="live">Live</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Mins)</label>
                            <input 
                                required type="number"
                                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.duration_minutes}
                                onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Total Marks</label>
                            <input 
                                required type="number"
                                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.total_marks}
                                onChange={e => setFormData({...formData, total_marks: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex justify-center items-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
                            {editingId ? "Update Changes" : "Create Exam"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

// Simple Helper Component for Stats
function StatCard({ label, value, color, icon }: any) {
    return (
        <div className={`p-4 rounded-2xl flex items-center justify-between ${color}`}>
            <div>
                <p className="text-xs font-bold uppercase opacity-70 mb-1">{label}</p>
                <p className="text-2xl font-extrabold">{value}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {icon}
            </div>
        </div>
    );
}