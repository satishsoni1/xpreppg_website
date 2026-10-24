import { useState, useEffect, useCallback } from "react";
import { AdminAPI } from "@/services/adminApi";
import {
  Wallet, Plus, Pencil, Trash2, X, Loader2, Save, ArrowDownCircle, ArrowUpCircle,
  Search, Download, Globe,
} from "lucide-react";

type EntryType = "income" | "expense";

interface Entry {
  id: number;
  type: EntryType;
  category: string;
  amount: string;
  entry_date: string;
  payment_mode: string | null;
  party: string | null;
  reference: string | null;
  description: string | null;
}

interface LedgerData {
  entries: Entry[];
  totals: { income: number; expense: number; net: number; count: number };
  website: { shop: number; cbt: number; xrevise: number; total: number };
  byCategory: { type: EntryType; category: string; total: number; count: number }[];
  monthly: { month: string; income: number; expense: number }[];
  categories: string[];
}

// Suggestions only — admins can type any category
const CATEGORY_PRESETS: Record<EntryType, string[]> = {
  income: ["Offline Course Fees", "Coaching / Classes", "Sponsorship", "Book & Material Sales", "Consulting", "Refund Received", "Other Income"],
  expense: ["Salaries", "Rent", "Printing", "Courier & Shipping", "Marketing & Ads", "Software & Hosting", "Exam Centre Costs", "Utilities", "Travel", "Office Supplies", "Payment Gateway Fees", "Taxes", "Other Expense"],
};

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card", "Cheque", "Other"];

const inr = (n: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const toISO = (d: Date) => {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

function rangeFor(preset: string): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  switch (preset) {
    case "this-month": return { from: toISO(new Date(y, m, 1)), to: toISO(new Date(y, m + 1, 0)) };
    case "last-month": return { from: toISO(new Date(y, m - 1, 1)), to: toISO(new Date(y, m, 0)) };
    // Indian financial year: 1 Apr – 31 Mar
    case "this-fy": {
      const start = m >= 3 ? y : y - 1;
      return { from: `${start}-04-01`, to: `${start + 1}-03-31` };
    }
    default: return { from: "", to: "" };
  }
}

const PRESETS = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "this-fy", label: "This FY" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
];

const emptyForm = {
  type: "expense" as EntryType,
  category: "",
  amount: "",
  entry_date: toISO(new Date()),
  payment_mode: "",
  party: "",
  reference: "",
  description: "",
};

export default function AdminFinance() {
  const [data, setData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [preset, setPreset] = useState("this-month");
  const [from, setFrom] = useState(rangeFor("this-month").from);
  const [to, setTo] = useState(rangeFor("this-month").to);
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await AdminAPI.getLedger({ from, to, type: typeFilter, category: categoryFilter, q: search });
      if (res.status) setData(res); else setError(res.message || "Failed to load");
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [from, to, typeFilter, categoryFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const choosePreset = (p: string) => {
    setPreset(p);
    if (p !== "custom") { const r = rangeFor(p); setFrom(r.from); setTo(r.to); }
  };

  const openCreate = (type: EntryType) => {
    setEditingId(null);
    setForm({ ...emptyForm, type, entry_date: toISO(new Date()) });
    setShowForm(true);
  };

  const openEdit = (e: Entry) => {
    setEditingId(e.id);
    setForm({
      type: e.type,
      category: e.category,
      amount: String(Number(e.amount)),
      entry_date: e.entry_date.slice(0, 10),
      payment_mode: e.payment_mode ?? "",
      party: e.party ?? "",
      reference: e.reference ?? "",
      description: e.description ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      const res = editingId
        ? await AdminAPI.updateLedgerEntry(editingId, payload)
        : await AdminAPI.createLedgerEntry(payload);
      if (!res.status) { alert(res.message || "Save failed"); return; }
      setShowForm(false);
      load();
    } catch (e: any) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: Entry) => {
    if (!window.confirm(`Delete this ${e.type} of ${inr(Number(e.amount))} (${e.category})?`)) return;
    const res = await AdminAPI.deleteLedgerEntry(e.id);
    if (!res.status) { alert(res.message || "Delete failed"); return; }
    load();
  };

  const exportCsv = () => {
    if (!data?.entries.length) return;
    const cols = ["Date", "Type", "Category", "Amount", "Payment Mode", "Party", "Reference", "Description"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = data.entries.map(e => [
      e.entry_date.slice(0, 10), e.type, e.category, Number(e.amount),
      e.payment_mode, e.party, e.reference, e.description,
    ].map(esc).join(","));
    const blob = new Blob([[cols.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `income-expense_${from || "all"}_${to || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const categoryOptions = Array.from(new Set([...CATEGORY_PRESETS[form.type], ...(data?.categories || [])]));
  const totals = data?.totals;
  const website = data?.website;
  const overallNet = (website?.total || 0) + (totals?.income || 0) - (totals?.expense || 0);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-primary" /> Income & Expenses
          </h1>
          <p className="text-sm text-gray-500 mt-1">Record money that doesn't come through the website — offline income and business expenses.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openCreate("income")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm">
            <Plus size={18} /> Income
          </button>
          <button onClick={() => openCreate("expense")}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition shadow-sm">
            <Plus size={18} /> Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.value} onClick={() => choosePreset(p.value)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition ${
                preset === p.value ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPreset("custom"); }}
            className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" aria-label="From date" />
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPreset("custom"); }}
            className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" aria-label="To date" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-primary outline-none">
            <option value="">Income & expense</option>
            <option value="income">Income only</option>
            <option value="expense">Expense only</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-primary outline-none">
            <option value="">All categories</option>
            {(data?.categories || []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative col-span-2 md:col-span-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search party, ref, note"
              className="w-full border border-gray-300 rounded-lg p-2.5 pl-9 text-sm focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">{error}</div>}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Other income" value={inr(totals?.income || 0)} tone="text-green-600" icon={<ArrowDownCircle className="text-green-600" size={20} />} />
        <SummaryCard label="Expenses" value={inr(totals?.expense || 0)} tone="text-red-600" icon={<ArrowUpCircle className="text-red-600" size={20} />} />
        <SummaryCard
          label="Website revenue"
          value={inr(website?.total || 0)}
          tone="text-gray-800"
          icon={<Globe className="text-primary" size={20} />}
          sub={website ? `Shop ${inr(website.shop)} · CBT ${inr(website.cbt)} · XRevise ${inr(website.xrevise)}` : ""}
        />
        <SummaryCard
          label="Overall net"
          value={inr(overallNet)}
          tone={overallNet >= 0 ? "text-green-700" : "text-red-700"}
          icon={<Wallet className="text-primary" size={20} />}
          sub="Website + other income − expenses"
        />
      </div>

      {/* Breakdowns */}
      {data && (data.monthly.length > 0 || data.byCategory.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <h2 className="px-4 py-3 border-b border-gray-100 font-bold text-gray-800">By month</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr><th className="text-left p-3">Month</th><th className="text-right p-3">Income</th><th className="text-right p-3">Expense</th><th className="text-right p-3">Net</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.monthly.map(m => (
                  <tr key={m.month}>
                    <td className="p-3 text-gray-700">{new Date(m.month + "-01").toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</td>
                    <td className="p-3 text-right text-green-600 tabular-nums">{inr(m.income)}</td>
                    <td className="p-3 text-right text-red-600 tabular-nums">{inr(m.expense)}</td>
                    <td className={`p-3 text-right font-semibold tabular-nums ${m.income - m.expense >= 0 ? "text-gray-800" : "text-red-700"}`}>{inr(m.income - m.expense)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <h2 className="px-4 py-3 border-b border-gray-100 font-bold text-gray-800">By category</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr><th className="text-left p-3">Category</th><th className="text-left p-3">Type</th><th className="text-right p-3">Entries</th><th className="text-right p-3">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.byCategory.map(c => (
                  <tr key={c.type + c.category}>
                    <td className="p-3 text-gray-700">{c.category}</td>
                    <td className="p-3"><TypeBadge type={c.type} /></td>
                    <td className="p-3 text-right text-gray-500 tabular-nums">{c.count}</td>
                    <td className={`p-3 text-right font-semibold tabular-nums ${c.type === "income" ? "text-green-600" : "text-red-600"}`}>{inr(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Entries {totals ? <span className="text-gray-400 font-normal">({totals.count})</span> : null}</h2>
          <button onClick={exportCsv} disabled={!data?.entries.length}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline disabled:text-gray-300 disabled:no-underline">
            <Download size={16} /> Export CSV
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" /> Loading…</div>
        ) : !data?.entries.length ? (
          <div className="py-16 text-center text-gray-400">
            <Wallet className="mx-auto mb-3 opacity-30" size={40} />
            <p className="font-medium">No entries for these filters</p>
            <p className="text-xs mt-1">Use the Income or Expense button to add one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Party / Note</th>
                  <th className="text-left p-3">Mode</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.entries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="p-3 whitespace-nowrap text-gray-700">
                      {new Date(e.entry_date.slice(0, 10) + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-3"><TypeBadge type={e.type} /></td>
                    <td className="p-3 text-gray-700">{e.category}</td>
                    <td className="p-3 max-w-xs">
                      {e.party && <p className="text-gray-800 font-medium truncate">{e.party}</p>}
                      {e.description && <p className="text-gray-500 text-xs truncate">{e.description}</p>}
                      {e.reference && <p className="text-gray-400 text-xs truncate">Ref: {e.reference}</p>}
                    </td>
                    <td className="p-3 text-gray-500">{e.payment_mode || "—"}</td>
                    <td className={`p-3 text-right font-bold tabular-nums whitespace-nowrap ${e.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {e.type === "income" ? "+" : "−"}{inr(Number(e.amount))}
                    </td>
                    <td className="p-3 whitespace-nowrap text-right">
                      <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-primary" aria-label="Edit"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(e)} className="p-1.5 text-gray-400 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? "Edit entry" : `Add ${form.type}`}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={22} className="text-gray-400 hover:text-gray-700" /></button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(["income", "expense"] as EntryType[]).map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`p-3 rounded-lg border text-sm font-semibold capitalize transition ${
                      form.type === t
                        ? t === "income" ? "border-green-600 bg-green-50 text-green-700" : "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-300 text-gray-600"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹) *</label>
                  <input required type="number" min="0.01" step="0.01" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date *</label>
                  <input required type="date" value={form.entry_date}
                    onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category *</label>
                <input required list="ledger-categories" value={form.category} placeholder="Choose or type a category"
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none" />
                <datalist id="ledger-categories">
                  {categoryOptions.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment mode</label>
                  <select value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-primary outline-none">
                    <option value="">—</option>
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{form.type === "income" ? "Received from" : "Paid to"}</label>
                  <input value={form.party} onChange={e => setForm(f => ({ ...f, party: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reference (invoice / UTR / cheque no.)</label>
                <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
            </div>

            <div className="p-5 border-t flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primaryDark transition disabled:opacity-60">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone, icon, sub }: { label: string; value: string; tone: string; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
        {icon}
      </div>
      <p className={`text-2xl font-extrabold tabular-nums ${tone}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1 leading-snug">{sub}</p>}
    </div>
  );
}

function TypeBadge({ type }: { type: EntryType }) {
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
      type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}>
      {type}
    </span>
  );
}
