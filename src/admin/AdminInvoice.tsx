import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import MainLayout from "@/layouts/MainLayout";

export default function AdminInvoice() {
  const { invoiceId } = useParams();
  const [sp] = useSearchParams();

  const data = useMemo(
    () => ({
      invoiceId: invoiceId || "",
      name: sp.get("name") || "",
      email: sp.get("email") || "",
      phone: sp.get("phone") || "",

      planName: sp.get("plan") || "",
      exams: Number(sp.get("exams") || 0),

      originalAmount: Number(sp.get("originalAmount") || 0),
      discount: Number(sp.get("discount") || 0),
      amount: Number(sp.get("amount") || 0),

      registrationSource: sp.get("source") || "offline", // online / offline
      paymentMode: sp.get("paymentMode") || "offline", // online / offline
      paymentRef: sp.get("paymentRef") || "",

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

    const pdf = new jsPDF("p", "pt", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 20, w, h);
    pdf.save(`invoice-${data.invoiceId}.pdf`);
  };

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Invoice (Admin)</h1>
            <button
              onClick={download}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
            >
              Download PDF
            </button>
          </div>

          {/* Invoice */}
          <section
            id="invoice-root"
            className="bg-white rounded-2xl shadow p-8"
          >
            {/* Company */}
            <div className="flex justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">XPrepPG</h2>
                <p className="text-sm text-gray-600">Pune, India</p>
                <p className="text-sm text-gray-600">info@xpreppg.com</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Invoice No</p>
                <p className="font-semibold">{data.invoiceId}</p>

                <p className="text-sm text-gray-500 mt-2">Issued On</p>
                <p>{data.issuedOn}</p>
              </div>
            </div>

            {/* Customer */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold">Billed To</h3>
                <p>{data.name}</p>
                <p className="text-sm text-gray-600">{data.email}</p>
                <p className="text-sm text-gray-600">{data.phone}</p>
              </div>

              <div>
                <h3 className="font-semibold">Details</h3>
                <p className="text-sm">
                  Registration:{" "}
                  <span className="font-medium capitalize">
                    {data.registrationSource}
                  </span>
                </p>
                <p className="text-sm">
                  Payment Mode:{" "}
                  <span className="font-medium capitalize">
                    {data.paymentMode}
                  </span>
                </p>
                {data.paymentRef && (
                  <p className="text-sm">Ref: {data.paymentRef}</p>
                )}
              </div>
            </div>

            {/* Table */}
            <table className="w-full border-t">
              <thead className="text-sm text-gray-500">
                <tr>
                  <th className="py-3 text-left">Item</th>
                  <th className="py-3">Qty</th>
                  <th className="py-3">Rate</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-4">
                    {data.planName} ({data.exams} Exams)
                  </td>
                  <td className="py-4">1</td>
                  <td className="py-4">₹{data.originalAmount}</td>
                  <td className="py-4 text-right">₹{data.originalAmount}</td>
                </tr>

                <tr className="border-t">
                  <td colSpan={3} className="py-3 text-right">
                    Subtotal
                  </td>
                  <td className="py-3 text-right">
                    ₹{data.originalAmount}
                  </td>
                </tr>

                {data.discount > 0 && (
                  <tr className="border-t text-red-600">
                    <td colSpan={3} className="py-3 text-right">
                      Discount
                    </td>
                    <td className="py-3 text-right">
                      -₹{data.discount}
                    </td>
                  </tr>
                )}

                <tr className="border-t font-semibold">
                  <td colSpan={3} className="py-4 text-right">
                    Total Payable
                  </td>
                  <td className="py-4 text-right text-emerald-700">
                    ₹{data.amount}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="text-xs text-gray-500 mt-8">
              * This invoice is system generated for administrative purposes.
            </p>
          </section>
        </div>
      </main>
    </MainLayout>
  );
}
