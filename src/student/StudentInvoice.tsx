import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import { ArrowLeft, Download, Loader2, Printer, CheckCircle } from "lucide-react";

export default function StudentInvoice() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!invoiceId) return;

    StudentAPI.getInvoice(invoiceId)
      .then((res) => {
        if (res.status) {
          setData(res.invoice);
        } else {
          setError(res.message || "Invoice not found");
        }
      })
      .catch(() => setError("Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const downloadPDF = async () => {
    const el = document.getElementById("invoice-root");
    if (!el) return;
    
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
    const width = imgProps.width * ratio;
    const height = imgProps.height * ratio;
    
    // Add margin top
    pdf.addImage(imgData, "PNG", (pdfWidth - width) / 2, 40, width, height);
    pdf.save(`XPrepPG-Invoice-${invoiceId}.pdf`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <h2 className="text-2xl text-red-600 font-bold mb-2">Invoice Unavailable</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button onClick={() => navigate("/student/dashboard")} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
        Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in bg-gray-50 min-h-screen">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button 
          onClick={() => navigate("/student/dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 transition font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </button>
        
        <div className="flex gap-3">
          {/* <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            <Printer size={18} /> Print
          </button> */}
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-sm"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      {/* INVOICE PAPER */}
      <div id="invoice-root" className="bg-white rounded-none shadow-xl p-8 md:p-12 border border-gray-200 relative overflow-hidden">
        
        {/* Paid Stamp */}
        {data.status === 'paid' && (
          <div className="absolute top-12 right-12 opacity-10 pointer-events-none transform rotate-[-15deg] border-4 border-emerald-600 text-primary font-black text-6xl px-4 py-2 rounded-xl uppercase tracking-widest z-0">
            PAID
          </div>
        )}

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start border-b-2 border-emerald-600 pb-8 mb-8 relative z-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-emerald-800 tracking-tight">XPrepPG</h1>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider">Exam Portal Invoice</p>
          </div>
          
          <div className="mt-6 md:mt-0 text-right space-y-1">
            <h2 className="text-gray-900 font-bold text-lg">XPrepPG Pvt Ltd.</h2>
            <p className="text-sm text-gray-500">123, Medical Hub, Tech Park</p>
            <p className="text-sm text-gray-500">New Delhi, India - 110001</p>
            <p className="text-sm text-gray-500">support@xpreppg.com</p>
            <p className="text-sm text-gray-500 mt-2">GSTIN: <span className="font-mono text-gray-700">27ABCDE1234F1Z5</span></p>
          </div>
        </header>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
            {/* Left: Student Info */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2 w-2/3">Student Details</h3>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-gray-900">{data.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-medium text-gray-400 w-16">Email:</span> {data.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-medium text-gray-400 w-16">Mobile:</span> {data.phone}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-medium text-gray-400 w-16">Reg ID:</span> STU-{data.phone.slice(-4)}
                  </p>
                </div>
            </div>

            {/* Right: Invoice Meta */}
            <div className="md:text-right">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2 md:ml-auto md:w-2/3">Payment Info</h3>
                <div className="space-y-2 inline-block text-left md:text-right">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-400 mr-2">Invoice #:</span> 
                    <span className="font-mono font-bold text-gray-900">{data.invoiceId}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-400 mr-2">Date:</span> 
                    <span className="font-medium text-gray-900">{new Date(data.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-400 mr-2">Method:</span> 
                    <span className="font-medium text-gray-900 uppercase">Razorpay / Online</span>
                  </p>
                  <div className="mt-2 pt-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        data.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {data.status === 'paid' && <CheckCircle size={12} />}
                        {data.status}
                    </span>
                  </div>
                </div>
            </div>
        </div>

        {/* Line Items Table */}
        <div className="border rounded-lg overflow-hidden mb-8 relative z-10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold w-1/2">Exam / Description</th>
                <th className="py-4 px-6 font-semibold text-center">Type</th>
                <th className="py-4 px-6 font-semibold text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-5 px-6">
                  <p className="font-bold text-gray-900 text-base mb-1">{data.description || "Exam Enrollment Plan"}</p>
                  <p className="text-sm text-gray-500">Access to Grand CBT Schedule</p>
                </td>
                <td className="py-5 px-6 text-center text-sm text-gray-600">Plan Purchase</td>
                <td className="py-5 px-6 text-right font-medium text-gray-900">₹{data.amount}</td>
              </tr>
            </tbody>
            {/* Totals Footer */}
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="py-4 px-6 text-right text-sm font-medium text-gray-500 border-t border-gray-200">Subtotal</td>
                <td className="py-4 px-6 text-right font-medium text-gray-900 border-t border-gray-200">₹{data.amount}</td>
              </tr>
              <tr>
                <td colSpan={2} className="py-4 px-6 text-right text-sm font-medium text-gray-500">Tax (18% GST Included)</td>
                <td className="py-4 px-6 text-right font-medium text-gray-900">₹0.00</td>
              </tr>
              <tr className="bg-emerald-50 border-t border-emerald-100">
                <td colSpan={2} className="py-5 px-6 text-right text-lg font-bold text-emerald-900">Total Paid</td>
                <td className="py-5 px-6 text-right text-lg font-bold text-emerald-900">₹{data.amount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Notes */}
        <div className="mt-12 text-center relative z-10">
          <p className="text-gray-900 font-medium mb-1">Thank you for choosing XPrepPG!</p>
          <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            Please retain this invoice for your records. For any discrepancies, contact our support team within 7 days.
            Good luck with your exams!
          </p>
          <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between text-xs text-gray-400">
            <p>© 2024 XPrepPG. All rights reserved.</p>
            <p>System Generated Invoice • No Signature Required</p>
          </div>
        </div>

      </div>
    </div>
  );
}