import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import { ArrowLeft, Download, Printer, Loader2, User, MapPin } from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function StudentAdmitCard() {
  const navigate = useNavigate();
  
  const [admitCards, setAdmitCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    StudentAPI.getAdmitCard()
      .then((res) => {
        if (res.status && Array.isArray(res.admitCards)) {
          setAdmitCards(res.admitCards);
          if (res.admitCards.length === 1) setSelectedCard(res.admitCards[0]);
        } else {
          setError(res.message || "Admit Card not generated yet.");
        }
      })
      .catch(() => setError("Failed to fetch Admit Cards."))
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = async () => {
    const el = document.getElementById("admit-card-root");
    if (!el) return;

    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    // Use higher scale for better clarity on text
    const canvas = await html2canvas(el, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add slight top margin (10mm)
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`HallTicket-${selectedCard?.rollNumber}.pdf`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <h2 className="text-xl text-red-600 font-bold mb-2">No Admit Card Found</h2>
      <p className="text-gray-500 mb-6">{error}</p>
      <button onClick={() => navigate("/student/dashboard")} className="px-6 py-2 bg-emerald-600 text-white rounded-lg">
        Back to Dashboard
      </button>
    </div>
  );

  // SELECTION VIEW (If multiple exams)
  if (!selectedCard) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in">
        <button onClick={() => navigate("/student/dashboard")} className="flex items-center text-gray-500 hover:text-gray-900 mb-8 transition">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Hall Ticket</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {admitCards.map((card) => (
            <div key={card.enrollment_id} onClick={() => setSelectedCard(card)} className="bg-white border p-6 rounded-xl shadow-sm hover:border-emerald-500 cursor-pointer transition">
              <h3 className="text-lg font-bold text-gray-900">{card.exam_name}</h3>
              <p className="text-gray-500 text-sm mt-1">Roll: {card.rollNumber}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Generate a mock password if not provided by backend (First 4 letters + Last 4 digits of ID)
  const mockPassword = (selectedCard.name.substring(0, 4) + selectedCard.enrollment_id).toUpperCase();

  // ACTUAL HALL TICKET VIEW
  return (
    <div className="max-w-[210mm] mx-auto py-8 px-4">
      {/* Controls */}
      <div className="flex justify-between mb-6 no-print">
        <button 
          onClick={() => admitCards.length > 1 ? setSelectedCard(null) : navigate("/student/dashboard")} 
          className="flex items-center text-gray-600 hover:text-black font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> 
          {admitCards.length > 1 ? "Back to List" : "Dashboard"}
        </button>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 font-medium">
            <Printer size={18} /> Print
          </button>
          <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm">
            <Download size={18} /> Download
          </button>
        </div>
      </div>

      {/* HALL TICKET CANVAS */}
      <div id="admit-card-root" className="bg-white text-black p-8 shadow-2xl border border-gray-300 relative font-sans">
        
        {/* 1. Header Section [cite: 3, 4] */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-extrabold uppercase tracking-wide text-black">
            XPREPPG PRACTICE TEST HALL TICKET
          </h1>
          <h2 className="text-xl font-bold uppercase text-black mt-1">
            FOR NEET PG 2026
          </h2>
        </div>

        {/* 2. Candidate Details & Photo Grid [cite: 1, 5, 6] */}
        <div className="flex border-b-2 border-black pb-6 mb-6">
          
          {/* Left: Text Details */}
          <div className="flex-1 pr-6">
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr>
                  <td className="py-2 font-bold w-40 align-top">Application Number:</td>
                  <td className="py-2 font-mono text-lg">{selectedCard.enrollment_id}c</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold align-top">Roll Number:</td>
                  <td className="py-2 font-mono text-lg font-bold">{selectedCard.rollNumber}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold align-top">Candidate Name:</td>
                  <td className="py-2 font-bold text-lg uppercase">{selectedCard.name}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold align-top">Password:</td>
                  <td className="py-2 font-mono text-lg">{mockPassword}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Photo */}
          <div className="w-40 flex-shrink-0">
             <div className="w-40 h-48 border border-black bg-gray-100 flex items-center justify-center overflow-hidden">
               {selectedCard.photo_url ? (
                 <img src={`${API_BASE_URL}${selectedCard.photo_url}`} alt="Candidate" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-16 h-16 text-gray-400" />
               )}
            </div>
            <p className="text-center text-xs font-bold mt-1 uppercase">Candidate Photo</p>
          </div>
        </div>

        {/* 3. Examination Centre Details [cite: 8-17] */}
        <div className="border-b-2 border-black pb-6 mb-6">
           <table className="w-full text-left">
             <tbody>
               {/* Exam Date */}
               <tr>
                 <td className="py-2 font-bold w-40 align-top text-lg">Exam Date:</td>
                 <td className="py-2 font-bold text-lg">
                   {new Date(selectedCard.exam_date).toLocaleDateString('en-GB')} 
                   {/* e.g., 13/01/2026 */}
                 </td>
               </tr>

               {/* Centre Name */}
               <tr>
                 <td className="py-2 font-bold align-top">Examination Centre:</td>
                 <td className="py-2 font-bold uppercase text-lg">
                   {selectedCard.centerName || "Nagpur-Central India Nursing College"}
                 </td>
               </tr>

               {/* Address */}
               <tr>
                 <td className="py-2 font-bold align-top">Address:</td>
                 <td className="py-2 text-gray-800">
                   {selectedCard.centerAddress || "Khasra No 25/1B, Mouza Lonara, Lake Koradi Road, Lonara, Nagpur."}
                   <br/>
                   <span className="font-semibold">Landmark: Near Lonara Lake</span>
                 </td>
               </tr>

               {/* Centre Code */}
               <tr>
                 <td className="py-2 font-bold align-top">Centre Code:</td>
                 <td className="py-2 font-bold">N003</td>
               </tr>

               {/* Google Map Link */}
               <tr>
                 <td className="py-2 font-bold align-top">Google Map Link:</td>
                 <td className="py-2">
                   <a href="#" className="text-blue-600 underline flex items-center gap-1 font-medium">
                     <MapPin size={16} /> Click here to go to the location of your examination centre
                   </a>
                 </td>
               </tr>
             </tbody>
           </table>
        </div>

        {/* 4. Timings & Warnings [cite: 18-20] */}
        <div className="bg-gray-50 border border-gray-300 p-4 mb-6">
          <div className="flex justify-between items-center mb-2 border-b border-gray-300 pb-2">
            <span className="font-bold text-gray-700">Entry to Exam Centre Closes at:</span>
            <span className="font-bold text-xl text-red-600">01:45 PM</span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-gray-700">Examination Timings:</span>
            <span className="font-bold text-xl text-black">02:00 PM to 05:30 PM</span>
          </div>

          <p className="text-center font-bold text-red-600 uppercase text-sm border-t border-gray-300 pt-2">
             No entry in the exam centre after 01:45 PM under any circumstances.
          </p>
        </div>

        {/* 5. Footer Note & Signature [cite: 21, 22] */}
        <div className="flex justify-between items-end mt-12">
           <div className="text-sm font-bold border-2 border-black px-4 py-2 inline-block">
              NOTE: Only XEROX COPY of the admit card is required.
           </div>

           <div className="text-center">
              {/* Placeholder for digital signature if available */}
              <div className="w-40 h-10 border-b border-black mb-1"></div>
              <p className="font-bold text-sm uppercase">Candidate Signature</p>
           </div>
        </div>

      </div>
    </div>
  );
}