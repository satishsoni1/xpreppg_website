import { useEffect, useState, useMemo } from "react";
import { 
  Download, Search, FileSpreadsheet, Loader2, RefreshCw, 
  Filter, X, Plus, UserPlus 
} from "lucide-react";
import { AdminAPI } from "@/services/adminApi";
import * as XLSX from "xlsx"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminEnrollments() {
  const [data, setData] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]); // For Manual Enroll Dropdown
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  // Manual Enroll States
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ email: "", examId: "" });
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [enrollRes, examRes] = await Promise.all([
         AdminAPI.getEnrollments(),
         AdminAPI.getExams()
      ]);

      if (enrollRes.status) setData(enrollRes.enrollments || []);
      if (examRes.status) setExams(examRes.exams || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // 1. FILTER LOGIC
  // ------------------------------------------------------------
  
  // Extract Unique Cities & Exams for Dropdowns
  const uniqueCities = useMemo(() => {
    const cities = data.map(item => item.student_city).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [data]);

  const uniqueExams = useMemo(() => {
    const exams = data.map(item => item.exam_title || "Plan Purchase").filter(Boolean);
    return Array.from(new Set(exams)).sort();
  }, [data]);

  const filteredData = data.filter(row => {
    const matchesSearch = 
      row.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCity = selectedCity ? row.student_city === selectedCity : true;
    const matchesExam = selectedExam ? (row.exam_title || "Plan Purchase") === selectedExam : true;

    return matchesSearch && matchesCity && matchesExam;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
    setSelectedExam("");
  };

  // ------------------------------------------------------------
  // 2. EXCEL EXPORT
  // ------------------------------------------------------------
  const handleExport = () => {
    const exportData = filteredData.map(row => ({
      "ID": row.id,
      "Date": new Date(row.enrolled_at).toLocaleDateString(),
      "Student Name": row.student_name,
      "City": row.student_city || "N/A",
      "Email": row.student_email,
      "Mobile": row.student_mobile,
      "Exam Name": row.exam_title || "Plan Purchase",
      "Txn ID": row.transaction_id,
      "Status": row.payment_status,
      "Total Amount": row.total_amount,
      "Discount": row.discount_amount,
      "Final Paid": row.paid_amount
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enrollments");
    XLSX.writeFile(workbook, `Enrollments_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ------------------------------------------------------------
  // 3. PDF INVOICE GENERATOR
  // ------------------------------------------------------------
  const generateInvoice = (row: any) => {
    const doc = new jsPDF();

    // Branding & Header
    doc.setFillColor(16, 185, 129); // Emerald Green
    doc.rect(0, 0, 210, 40, "F"); 
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("XPrepPG", 14, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Exam & Prep Portal", 14, 28);
    
    doc.setFontSize(24);
    doc.text("INVOICE", 180, 25, { align: "right" });

    // Meta Data
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Invoice ID: INV-${row.id}`, 14, 50);
    doc.text(`Date: ${new Date(row.enrolled_at).toLocaleDateString()}`, 14, 56);
    doc.text(`Txn ID: ${row.transaction_id || 'N/A'}`, 14, 62);
    
    // Student Info
    doc.text("Billed To:", 140, 50);
    doc.setFont("helvetica", "bold");
    doc.text(row.student_name || "Student", 140, 56);
    doc.setFont("helvetica", "normal");
    doc.text(row.student_email || "", 140, 62);
    doc.text(`${row.student_city || ''} ${row.student_mobile || ''}`, 140, 68);

    // Table
    autoTable(doc, {
        startY: 80,
        head: [['Description', 'Qty', 'Amount']],
        body: [
            [row.exam_title || "Exam Plan Subscription", "1", `Rs. ${row.total_amount || 0}`],
            ["Discount Applied", "", row.discount_amount > 0 ? `- Rs. ${row.discount_amount}` : "Rs. 0"],
            [{ content: "Total Paid", styles: { fontStyle: 'bold' } }, "", { content: `Rs. ${row.paid_amount}`, styles: { fontStyle: 'bold' } }]
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for choosing XPrepPG.", 105, finalY, { align: "center" });
    
    doc.save(`Invoice_${row.student_name}_${row.id}.pdf`);
  };

  // ------------------------------------------------------------
  // 4. MANUAL ENROLLMENT HANDLER
  // ------------------------------------------------------------
  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!manualForm.email || !manualForm.examId) return alert("Please fill all fields");

    setEnrolling(true);
    try {
        const res = await AdminAPI.manualEnroll({
            email: manualForm.email,
            type: 'exam',
            id: manualForm.examId
        });

        if (res.status) {
            alert(res.message);
            setShowManualModal(false);
            setManualForm({ email: "", examId: "" });
            fetchData(); // Refresh list
        } else {
            alert(res.message);
        }
    } catch (err) {
        alert("Enrollment failed. Ensure email exists.");
    } finally {
        setEnrolling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      
      {/* --- TOP HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Enrollments & Invoices</h1>
            <p className="text-gray-500 text-sm mt-1">
               Showing {filteredData.length} / {data.length} records
            </p>
         </div>

         <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button 
                onClick={fetchData} 
                className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition" 
                title="Refresh Data"
            >
               <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            
            <button 
                onClick={() => setShowManualModal(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition shadow-sm shadow-purple-200"
            >
               <UserPlus size={18} /> Manual Enroll
            </button>
         </div>
      </div>

      {/* --- FILTERS BAR --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
         
         {/* Search */}
         <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
               className="pl-9 pr-4 py-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
               placeholder="Search name, email, txn ID..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>

         {/* City Filter */}
         <div className="w-full md:w-48 relative">
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={14} />
            <select 
               className="pl-9 pr-8 py-2 border rounded-lg w-full text-sm appearance-none bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
               value={selectedCity}
               onChange={e => setSelectedCity(e.target.value)}
            >
               <option value="">All Cities</option>
               {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
         </div>

         {/* Exam Filter */}
         <div className="w-full md:w-64 relative">
             <Filter className="absolute left-3 top-2.5 text-gray-400" size={14} />
             <select 
               className="pl-9 pr-8 py-2 border rounded-lg w-full text-sm appearance-none bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
               value={selectedExam}
               onChange={e => setSelectedExam(e.target.value)}
            >
               <option value="">All Exams / Plans</option>
               {uniqueExams.map(exam => <option key={exam} value={exam}>{exam}</option>)}
            </select>
         </div>

         <div className="flex gap-2 ml-auto w-full md:w-auto">
             {/* Clear Filters */}
            {(searchTerm || selectedCity || selectedExam) && (
                <button 
                onClick={clearFilters}
                className="text-red-500 text-sm font-bold flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                >
                <X size={14} /> Clear
                </button>
            )}

            {/* Export Button */}
            <button 
               onClick={handleExport}
               className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition shadow-sm whitespace-nowrap text-sm"
            >
               <FileSpreadsheet size={16} /> Export Excel
            </button>
         </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
           <thead className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                 <th className="p-4 pl-6">ID / Date</th>
                 <th className="p-4">Student Details</th>
                 <th className="p-4">Item Enrolled</th>
                 <th className="p-4">Paid Amount</th>
                 <th className="p-4">Discount</th>
                 <th className="p-4">Status</th>
                 <th className="p-4 pr-6 text-right">Invoice</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
              {loading ? (
                  <tr><td colSpan={7} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600 w-8 h-8"/></td></tr>
              ) : filteredData.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center text-gray-400 italic">No records found matching filters.</td></tr>
              ) : (
                  filteredData.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition duration-150 group">
                        
                        {/* 1. ID & DATE */}
                        <td className="p-4 pl-6">
                           <div className="font-bold text-gray-800">#{row.transaction_id?.slice(-6).toUpperCase() || row.id}</div>
                           <div className="text-xs text-gray-500">{new Date(row.enrolled_at).toLocaleDateString('en-IN')}</div>
                        </td>

                        {/* 2. STUDENT INFO */}
                        <td className="p-4">
                           <div className="font-bold text-gray-900">{row.student_name}</div>
                           <div className="text-xs text-gray-500">{row.student_email}</div>
                           {row.student_city && (
                              <div className="text-[10px] text-emerald-600 font-bold mt-0.5 uppercase tracking-wide">
                                 📍 {row.student_city}
                              </div>
                           )}
                        </td>

                        {/* 3. ITEM */}
                        <td className="p-4">
                           <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs">
                              {row.exam_title ? (row.exam_title.length > 25 ? row.exam_title.substring(0,25)+'...' : row.exam_title) : "General Plan"}
                           </span>
                        </td>

                        {/* 4. AMOUNT PAID */}
                        <td className="p-4 font-bold text-gray-900">₹{row.paid_amount}</td>

                        {/* 5. DISCOUNT */}
                        <td className="p-4 text-xs">
                           {row.coupon_code ? (
                               <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-mono">
                                   {row.coupon_code}
                               </span>
                           ) : <span className="text-gray-400">-</span>}
                        </td>

                        {/* 6. STATUS */}
                        <td className="p-4">
                           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border tracking-wide ${
                               row.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                           }`}>
                              {row.payment_status}
                           </span>
                        </td>

                        {/* 7. INVOICE BUTTON */}
                        <td className="p-4 pr-6 text-right">
                           <button 
                              onClick={() => generateInvoice(row)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition flex items-center justify-end gap-1 ml-auto text-xs font-bold border border-transparent hover:border-blue-100"
                            >
                              <Download size={14} /> PDF
                           </button>
                        </td>
                    </tr>
                  ))
              )}
           </tbody>
        </table>
      </div>

      {/* --- MANUAL ENROLL MODAL --- */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-800">Manual Enrollment</h3>
                    <button onClick={() => setShowManualModal(false)}><X className="text-gray-400 hover:text-red-500" /></button>
                </div>

                <form onSubmit={handleManualEnroll} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Student Email</label>
                        <input 
                            required
                            type="email"
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="student@example.com"
                            value={manualForm.email}
                            onChange={e => setManualForm({...manualForm, email: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Note: User must already be registered in the system.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Select Exam</label>
                        <select 
                            required
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                            value={manualForm.examId}
                            onChange={e => setManualForm({...manualForm, examId: e.target.value})}
                        >
                            <option value="">-- Choose Exam --</option>
                            {exams.map(exam => (
                                <option key={exam.id} value={exam.id}>
                                    {exam.title} (₹{exam.price || 0})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                        <UserPlus size={16} className="shrink-0 mt-0.5" />
                        <p>This will grant the user full access to the exam with a status of 'paid'. Transaction ID will be marked as 'MANUAL_ADMIN'.</p>
                    </div>

                    <button 
                        type="submit"
                        disabled={enrolling}
                        className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition flex justify-center items-center gap-2 mt-2 shadow-lg shadow-purple-200"
                    >
                        {enrolling ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                        Confirm Enrollment
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}