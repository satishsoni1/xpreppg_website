import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import MainLayout from "@/layouts/MainLayout";

export default function Invoice() {
  const { invoiceId } = useParams();
  const [sp] = useSearchParams();

  const data = useMemo(
    () => ({
      invoiceId: invoiceId || "",
      name: sp.get("name") || "",
      email: sp.get("email") || "",
      phone: sp.get("phone") || "",
      plan: sp.get("plan") || "",
      exams: Number(sp.get("exams") || 1),

      originalAmount: Number(sp.get("originalAmount") || 0),
      discount: Number(sp.get("discount") || 0),

      amount: Number(sp.get("amount") || 0), // final payable

      paymentId: sp.get("paymentId") || "",
      courseCode: sp.get("courseCode") || "",
      status: sp.get("status") || "unpaid",

      issuedOn: new Date().toLocaleDateString(),
    }),
    [invoiceId, sp]
  );

  useEffect(() => {
    document.title = `Invoice ${data.invoiceId}`;
  }, [data.invoiceId]);

  const download = async () => {
    const el = document.getElementById("invoice-root");
    if (!el) return;
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);

    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    const x = (pageWidth - w) / 2;
    const y = 40;

    pdf.addImage(imgData, "PNG", x, y, w, h);
    pdf.save(`invoice-${data.invoiceId}.pdf`);
  };

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Invoice</h1>
            <button
              onClick={download}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:opacity-90"
            >
              Download PDF
            </button>
          </div>

          <section id="invoice-root" className="bg-white rounded-2xl shadow p-8">
            {/* HEADER */}
            <header className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">XPrepPG</h2>
                <p className="text-sm text-gray-600">Pune, IN</p>
                <p className="text-sm text-gray-600">info@xpreppg.com</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Invoice ID</p>
                <p className="text-lg font-semibold">{data.invoiceId}</p>

                <p className="text-sm text-gray-500 mt-2">Issued</p>
                <p className="font-medium">{data.issuedOn}</p>

                {data.courseCode && (
                  <p className="mt-4 text-sm font-semibold text-emerald-600">
                    Course Code: {data.courseCode}
                  </p>
                )}
              </div>
            </header>

            {/* BILLING + SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Billed To</h3>
                <p className="mt-1">{data.name}</p>
                <p className="text-gray-600 text-sm">{data.email}</p>
                <p className="text-gray-600 text-sm">{data.phone}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Summary</h3>
                <div className="mt-1 text-sm text-gray-700">
                  <p>
                    Plan: <span className="font-medium">{data.plan}</span>
                  </p>
                  <p>
                    Exams: <span className="font-medium">{data.exams}</span>
                  </p>
                  <p className="mt-2">
                    Payment:{" "}
                    <span className="font-medium">
                      {data.status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                    {data.paymentId ? ` · ${data.paymentId}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* INVOICE TABLE */}
            <table className="w-full text-left border-t">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="py-3">Item</th>
                  <th className="py-3">Qty</th>
                  <th className="py-3">Rate (₹)</th>
                  <th className="py-3 text-right">Amount (₹)</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t">
                  <td className="py-4">
                    {data.plan} – {data.exams} Exam(s)
                  </td>
                  <td className="py-4">1</td>
                  <td className="py-4">₹{data.originalAmount}</td>
                  <td className="py-4 text-right">₹{data.originalAmount}</td>
                </tr>

                {/* ORIGINAL PRICE */}
                <tr className="border-t">
                  <td className="py-4 text-gray-600" colSpan={3}>
                    Subtotal
                  </td>
                  <td className="py-4 text-right">₹{data.originalAmount}</td>
                </tr>

                {/* DISCOUNT ROW */}
                {data.discount > 0 && (
                  <tr className="border-t text-red-600 font-medium">
                    <td className="py-4" colSpan={3}>
                      Discount Applied
                    </td>
                    <td className="py-4 text-right">- ₹{data.discount}</td>
                  </tr>
                )}

                {/* FINAL TOTAL */}
                <tr className="border-t font-semibold">
                  <td className="py-4" colSpan={3}>
                    Total Payable
                  </td>
                  <td className="py-4 text-right text-emerald-700">₹{data.amount}</td>
                </tr>
              </tbody>

            </table>

            <p className="text-xs text-gray-500 mt-8">
              This is a sample invoice generated for demonstration. Add your actual
              tax breakdown and business details before sharing with customers.
            </p>
          </section>
        </div>
      </main>
    </MainLayout>
  );
}
