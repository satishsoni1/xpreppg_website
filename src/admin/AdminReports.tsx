import { useState, useEffect } from "react";
import { AdminAPI } from "@/services/adminApi";
import { Download, Filter, MapPin, Search, UserCheck } from "lucide-react";
import * as XLSX from "xlsx"; // You might need: npm install xlsx

export default function AdminReports() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dropdown Data
  const [exams, setExams] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Filter State
  const [filters, setFilters] = useState({
    exam_id: "all",
    payment_status: "all",
    city: "all",
    center_id: "all",
    sort_by: "date"
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]); // Refetch whenever filters change

  const loadInitialData = async () => {
    // Load Exams, Centers, Cities for Dropdowns
    const [examRes, centerRes, cityRes] = await Promise.all([
      AdminAPI.getExams(),
      AdminAPI.getCenters(),
      AdminAPI.getCities()
    ]);
    if(examRes.status) setExams(examRes.exams);
    if(centerRes.status) setCenters(centerRes.centers);
    if(cityRes.status) setCities(cityRes.cities);
  };

  const fetchReports = async () => {
    setLoading(true);
    const res = await AdminAPI.getReports(filters);
    if(res.status) setData(res.data);
    setLoading(false);
  };

  // Handle Center Assignment directly in table
  const handleAssignCenter = async (enrollmentId: number, centerId: string) => {
    if(!centerId) return;
    const res = await AdminAPI.assignCenter(enrollmentId, parseInt(centerId));
    if(res.status) {
       alert("Center Assigned Successfully");
       fetchReports(); // Refresh data
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "Student_Reports.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      <div className="flex justify-between items-end mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Advanced Reports</h1>
           <p className="text-gray-500 text-sm">Filter, Analyze, Assign Centers & Export Results.</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        
        {/* Exam Filter */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Exam</label>
          <select 
            className="w-full border p-2 rounded-lg text-sm"
            value={filters.exam_id}
            onChange={e => setFilters({...filters, exam_id: e.target.value})}
          >
            <option value="all">All Exams</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        {/* Payment Filter */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Status</label>
          <select 
            className="w-full border p-2 rounded-lg text-sm"
            value={filters.payment_status}
            onChange={e => setFilters({...filters, payment_status: e.target.value})}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Unpaid / Pending</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">City</label>
          <select 
            className="w-full border p-2 rounded-lg text-sm"
            value={filters.city}
            onChange={e => setFilters({...filters, city: e.target.value, center_id: "all"})}
          >
            <option value="all">All Cities</option>
            {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Center Filter */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Center</label>
          <select 
            className="w-full border p-2 rounded-lg text-sm"
            value={filters.center_id}
            onChange={e => setFilters({...filters, center_id: e.target.value})}
          >
            <option value="all">All Centers</option>
            {centers
              .filter(c => filters.city === "all" || c.city === filters.city)
              .map(c => <option key={c.id} value={c.id}>{c.center_name}</option>)}
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Sort By</label>
          <select 
            className="w-full border p-2 rounded-lg text-sm"
            value={filters.sort_by}
            onChange={e => setFilters({...filters, sort_by: e.target.value})}
          >
            <option value="date">Enrolled Date</option>
            <option value="rank">Rank (High to Low)</option>
            <option value="score">Score</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-600 font-bold border-b">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Exam</th>
              <th className="p-4">Score</th>
              <th className="p-4">Stats (C/W/Un)</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Assigned Center</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
               <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading Report Data...</td></tr>
            ) : data.length === 0 ? (
               <tr><td colSpan={7} className="p-8 text-center text-gray-500">No records found matching filters.</td></tr>
            ) : (
               data.map((row) => (
                <tr key={row.enrollment_id} className="hover:bg-gray-50">
                   {/* Rank */}
                   <td className="p-4">
                      {row.rank ? (
                        <span className="bg-gradient-to-r from-primary to-primaryDark text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs">
                          #{row.rank}
                        </span>
                      ) : "-"}
                   </td>

                   {/* Student */}
                   <td className="p-4">
                      <div className="font-bold text-gray-900">{row.student_name}</div>
                      <div className="text-xs text-gray-500">{row.mobile}</div>
                   </td>

                   {/* Exam */}
                   <td className="p-4 text-gray-700">{row.exam_title}</td>

                   {/* Score */}
                   <td className="p-4 font-bold text-primary">
                      {row.total_score !== null ? row.total_score : "N/A"}
                   </td>

                   {/* Stats */}
                   <td className="p-4 text-xs">
                      {row.correct !== null ? (
                        <div className="flex gap-2">
                           <span className="text-green-600 font-bold">✓ {row.correct}</span>
                           <span className="text-red-500 font-bold">✗ {row.incorrect}</span>
                        </div>
                      ) : "Not Attempted"}
                   </td>

                   {/* Payment */}
                   <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                         row.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                         {row.payment_status}
                      </span>
                   </td>

                   {/* Center Assignment Dropdown */}
                   <td className="p-4">
                      <select 
                        className={`border rounded p-1 text-xs max-w-[150px] ${row.center_name ? 'bg-white' : 'bg-yellow-50 border-yellow-300'}`}
                        value={row.center_id || ""}
                        onChange={(e) => handleAssignCenter(row.enrollment_id, e.target.value)}
                        disabled={row.payment_status !== 'paid'} // Can only assign center if paid
                      >
                         <option value="">-- Assign --</option>
                         {centers.map(c => (
                            <option key={c.id} value={c.id}>{c.center_name}</option>
                         ))}
                      </select>
                      {row.city && <div className="text-xs text-gray-400 mt-1"><MapPin size={10} className="inline"/> {row.city}</div>}
                   </td>
                </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}