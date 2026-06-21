import { useState, useEffect } from "react";
import { ShoppingBag, Loader2, CheckCircle2, Clock, X } from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

export default function AdminPosterOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);
  const [term, setTerm] = useState("");

  useEffect(() => {
    AdminAPI.getPosterOrders().then(res => {
      if (res.status) setOrders(res.orders || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o =>
    o.name?.toLowerCase().includes(term.toLowerCase()) ||
    o.mobile?.includes(term) ||
    o.razorpay_order_id?.includes(term)
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="text-primary" size={22} /> Poster Orders
        </h1>
        <input value={term} onChange={e => setTerm(e.target.value)}
          placeholder="Search name / mobile / order ID…"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-primary outline-none" />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={28} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {["#", "Customer", "Mobile", "Items", "Subtotal", "Ship", "Total", "Status", "Date", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((o, i) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{o.name}</td>
                    <td className="px-4 py-3 text-gray-600">{o.mobile}</td>
                    <td className="px-4 py-3 text-gray-600">{Array.isArray(o.items) ? o.items.length : "—"}</td>
                    <td className="px-4 py-3">₹{o.subtotal}</td>
                    <td className="px-4 py-3">₹{o.shipping_charge}</td>
                    <td className="px-4 py-3 font-bold text-navy">₹{o.grand_total}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${
                        o.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {o.payment_status === "paid" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDetail(o)} className="text-xs text-primary hover:underline">View</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-12 text-gray-400">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Order Details</h3>
              <button onClick={() => setDetail(null)}><X size={22} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Name:</span> <strong>{detail.name}</strong></div>
                <div><span className="text-gray-500">Mobile:</span> <strong>{detail.mobile}</strong></div>
                <div><span className="text-gray-500">Email:</span> {detail.email || "—"}</div>
                <div><span className="text-gray-500">Status:</span>
                  <span className={`ml-1 font-bold ${detail.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                    {detail.payment_status}
                  </span>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold text-gray-700 mb-1">Shipping Address</p>
                <p className="text-gray-600">{detail.address}, {detail.city}, {detail.state} - {detail.pincode}</p>
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold text-gray-700 mb-2">Items Ordered</p>
                <div className="space-y-1">
                  {(Array.isArray(detail.items) ? detail.items : []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-gray-600 text-xs">
                      <span>{item.title}</span>
                      <span className="font-semibold">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3 space-y-1 text-xs text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{detail.subtotal}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>₹{detail.shipping_charge}</span></div>
                {detail.discount > 0 && <div className="flex justify-between text-green-600"><span>Promo ({detail.promo_code})</span><span>-₹{detail.discount}</span></div>}
                <div className="flex justify-between font-bold text-base text-navy pt-1 border-t"><span>Total</span><span>₹{detail.grand_total}</span></div>
              </div>
              {detail.razorpay_order_id && (
                <div className="border-t pt-3 text-xs text-gray-400">
                  <p>Razorpay Order: {detail.razorpay_order_id}</p>
                  {detail.razorpay_payment_id && <p>Payment ID: {detail.razorpay_payment_id}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
