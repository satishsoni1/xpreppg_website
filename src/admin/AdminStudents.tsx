import { useEffect, useState } from "react";
import { Search, Mail, Phone, MoreHorizontal } from "lucide-react";
import { AdminAPI } from "@/services/adminApi"; // ✅ Import the Service

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
     // ✅ Use the Service Method
     const data = await AdminAPI.getAllStudents();
     
     if (data.status) {
       setStudents(data.students || []);
     } else {
       console.error("Failed to load students:", data.message);
     }
   } catch (err) {
     console.error("Connection error:", err);
   } finally {
     setLoading(false);
   }
 };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(term.toLowerCase()) || 
    s.email.toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
         <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-emerald-500"
              placeholder="Search students..."
              value={term}
              onChange={e => setTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b font-bold text-gray-600">
               <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y">
               {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                     <td className="p-4 font-bold text-gray-900">{s.name}</td>
                     <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                           <Mail size={14} /> {s.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                           <Phone size={14} /> {s.mobile}
                        </div>
                     </td>
                     <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                           {s.category || "General"}
                        </span>
                     </td>
                     <td className="p-4 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                     <td className="p-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600">
                           <MoreHorizontal size={20} />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}