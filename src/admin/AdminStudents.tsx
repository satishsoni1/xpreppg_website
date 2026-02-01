import { useEffect, useState } from "react";
import { Search, Mail, Phone, MoreHorizontal, MapPin, Download, Loader2 } from "lucide-react"; // ✅ Added Download Icon
import { AdminAPI } from "@/services/adminApi"; 
import * as XLSX from 'xlsx'; // ✅ Import XLSX

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   fetchStudents();
 }, []);

  const fetchStudents = async () => {
   setLoading(true);
   try {
     const data = await AdminAPI.getAllStudents();
     if (data.status) {
       setStudents(data.students || []);
     }
   } catch (err) {
     console.error("Connection error:", err);
   } finally {
     setLoading(false);
   }
 };

  const filtered = students.filter(s => 
    s.name?.toLowerCase().includes(term.toLowerCase()) || 
    s.email?.toLowerCase().includes(term.toLowerCase()) ||
    s.mobile?.includes(term)
  );

  // ✅ EXPORT FUNCTION
  const handleExport = () => {
    // 1. Format data for Excel (Select specific columns)
    const dataToExport = filtered.map(s => ({
        "Student ID": s.id,
        "Name": s.name,
        "Email": s.email,
        "Mobile": s.mobile,
        "City": s.city || "N/A",
        "Category": s.category || "General",
        "Joined Date": new Date(s.created_at).toLocaleDateString('en-IN')
    }));

    // 2. Create Sheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // 3. Download File
    XLSX.writeFile(workbook, `Students_List_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} Students found</p>
         </div>
         
         <div className="flex gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                className="pl-10 pr-4 py-2 border rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
                placeholder="Search..."
                value={term}
                onChange={e => setTerm(e.target.value)}
                />
            </div>

            {/* ✅ Export Button */}
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition shadow-sm whitespace-nowrap"
            >
                <Download size={18} /> Export Excel
            </button>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                    <th className="p-4 pl-6">Student Profile</th>
                    <th className="p-4">Contact Details</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Joined On</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {loading ? (
                    <tr><td colSpan={6} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600"/></td></tr>
                ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">No students found.</td></tr>
                ) : (
                    filtered.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50 transition duration-150 group">
                            <td className="p-4 pl-6">
                                <div className="flex items-center gap-3">
                                    {s.photo_url ? (
                                        <img src={s.photo_url} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                            {s.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-900">{s.name}</p>
                                        <p className="text-xs text-gray-400">ID: {s.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail size={14} className="text-gray-400"/> {s.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone size={14} className="text-gray-400"/> {s.mobile}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                {s.city ? (
                                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full w-fit text-xs font-medium">
                                        <MapPin size={12} /> {s.city}
                                    </div>
                                ) : <span className="text-gray-400 text-xs">-</span>}
                            </td>
                            <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                                    s.category === 'Pro' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                    'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                    {s.category || "General"}
                                </span>
                            </td>
                            <td className="p-4 text-gray-500 text-xs">
                                {new Date(s.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 pr-6 text-right">
                                <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-700 transition">
                                    <MoreHorizontal size={18} />
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}