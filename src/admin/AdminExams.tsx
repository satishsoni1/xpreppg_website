import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, DollarSign, Save } from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

export default function AdminExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "", date: "", duration_minutes: 180, total_marks: 800, price: 999
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const res = await AdminAPI.getExams();
    if (res.status) setExams(res.exams);
  };

  const handleSubmit = async () => {
    const res = await AdminAPI.createExam(formData);
    if (res.status) {
      alert("Exam Created!");
      fetchExams();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Exam Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700"
        >
          <Plus size={20} /> Create Exam
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 animate-fade-in">
          <h3 className="font-bold text-lg mb-4">New Exam Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
              <input 
                className="w-full border p-2 rounded-lg" 
                placeholder="e.g. NEET PG Grand Test 5"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date"
                className="w-full border p-2 rounded-lg" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Mins)</label>
              <input 
                type="number"
                className="w-full border p-2 rounded-lg" 
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
              <input 
                type="number"
                className="w-full border p-2 rounded-lg" 
                value={formData.total_marks}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            className="mt-6 w-full bg-gradient-to-r from-primary to-primaryDark text-white py-2 rounded-lg font-bold hover:bg-slate-800"
          >
            Save Exam
          </button>
        </div>
      )}

      {/* EXAMS LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Exam Title</th>
              <th className="p-4">Date</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Total Marks</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {exams.map((exam) => (
              <tr key={exam.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{exam.title}</td>
                <td className="p-4 text-gray-500">{new Date(exam.date).toLocaleDateString()}</td>
                <td className="p-4 text-gray-500">{exam.duration} mins</td>
                <td className="p-4 text-gray-500">{exam.total_marks}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                    {exam.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {exams.length === 0 && <div className="p-8 text-center text-gray-500">No exams created yet.</div>}
      </div>
    </div>
  );
}