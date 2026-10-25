import { ShoppingBag, Layers, Image as ImageIcon, IndianRupee, Tag, EyeOff } from "lucide-react";
import type { InfluencerDashboard, DashboardColumn } from "@/services/influencerApi";

const MONEY_FIELDS = new Set(["revenue", "discount", "sales_value", "amount"]);

const SUMMARY_ICONS: Record<string, typeof ShoppingBag> = {
  orders: ShoppingBag,
  poster_units: ImageIcon,
  flashcard_units: Layers,
  revenue: IndianRupee,
  discount: Tag,
};

function formatCell(key: string, value: any) {
  if (value == null || value === "") return "—";
  if (MONEY_FIELDS.has(key)) return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  if (key === "order_date") {
    return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  return String(value);
}

function Table({ title, columns, rows, empty }: { title: string; columns: DashboardColumn[]; rows: Record<string, any>[]; empty: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-400">{rows.length} rows</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              {columns.map(c => (
                <th key={c.key} className={`px-4 py-3 font-semibold whitespace-nowrap ${MONEY_FIELDS.has(c.key) || c.key === "units_sold" ? "text-right" : "text-left"}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map(c => (
                  <td key={c.key} className={`px-4 py-3 text-gray-700 ${MONEY_FIELDS.has(c.key) || c.key === "units_sold" ? "text-right font-semibold" : ""}`}>
                    {formatCell(c.key, r[c.key])}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={columns.length} className="text-center py-10 text-gray-400">{empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Renders only the sections/columns the server returned — the server has
// already removed everything the admin did not allow.
export default function InfluencerDashboardView({ data }: { data: InfluencerDashboard }) {
  const { summary, products, orders } = data.sections;
  const nothingShared = !summary && !products && !orders;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500">Your promo codes:</span>
        {data.promo_codes.length
          ? data.promo_codes.map(c => (
              <span key={c} className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-xs px-2.5 py-1 rounded-full">{c}</span>
            ))
          : <span className="text-gray-400">None assigned yet</span>}
      </div>

      {nothingShared && (
        <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
          <EyeOff className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-semibold text-gray-500">No reports have been shared with you yet</p>
          <p className="text-sm mt-1">Please contact the XPrepPG team.</p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {summary.columns.map(c => {
            const Icon = SUMMARY_ICONS[c.key] || ShoppingBag;
            return (
              <div key={c.key} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <Icon className="w-5 h-5 text-emerald-600 mb-3" />
                <p className="text-2xl font-extrabold text-gray-900">{formatCell(c.key, summary.values[c.key] ?? 0)}</p>
                <p className="text-xs text-gray-500 mt-1">{c.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {products && <Table title={products.label} columns={products.columns} rows={products.rows} empty="No sales with your promo codes yet." />}
      {orders && <Table title={orders.label} columns={orders.columns} rows={orders.rows} empty="No orders with your promo codes yet." />}
    </div>
  );
}
