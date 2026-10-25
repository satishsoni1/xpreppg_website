import { useEffect, useState } from "react";
import {
  UserCheck, Plus, Pencil, Trash2, Eye, X, Loader2, Save, ToggleLeft, ToggleRight, Copy, Check, KeyRound,
} from "lucide-react";
import { AdminAPI } from "@/services/adminApi";
import InfluencerDashboardView from "@/components/InfluencerDashboardView";
import type { InfluencerDashboard } from "@/services/influencerApi";

interface FieldDef { key: string; label: string; }
interface SectionDef { key: string; label: string; fields: FieldDef[]; }
type Permissions = Record<string, { enabled: boolean; fields: string[] }>;

interface Influencer {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  is_active: boolean;
  promo_codes: string[];
  permissions: Permissions;
  notes: string | null;
  last_login_at: string | null;
  created_at: string;
  orders: number;
  poster_units: number;
  flashcard_units: number;
}

const emptyForm = {
  name: "", email: "", mobile: "", password: "", notes: "",
  is_active: true, promo_codes: [] as string[], permissions: {} as Permissions,
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never";

export default function AdminInfluencers() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [sections, setSections] = useState<SectionDef[]>([]);
  const [defaultPermissions, setDefaultPermissions] = useState<Permissions>({});
  const [promoOptions, setPromoOptions] = useState<{ code: string; is_active: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newCode, setNewCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [preview, setPreview] = useState<{ name: string; data: InfluencerDashboard | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const loginUrl = `${window.location.origin}/influencer/login`;

  const load = async () => {
    setLoading(true);
    try {
      const [list, meta] = await Promise.all([AdminAPI.getInfluencers(), AdminAPI.getInfluencerMeta()]);
      if (list.status) setInfluencers(list.influencers);
      if (meta.status) {
        setSections(meta.sections);
        setDefaultPermissions(meta.default_permissions);
        setPromoOptions(meta.promo_codes);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, permissions: structuredClone(defaultPermissions) });
    setEditingId(null); setError(""); setNewCode("");
    setShowForm(true);
  };

  const openEdit = (inf: Influencer) => {
    setForm({
      name: inf.name, email: inf.email, mobile: inf.mobile || "", password: "", notes: inf.notes || "",
      is_active: inf.is_active, promo_codes: [...inf.promo_codes], permissions: structuredClone(inf.permissions || {}),
    });
    setEditingId(inf.id); setError(""); setNewCode("");
    setShowForm(true);
  };

  const toggleCode = (code: string) =>
    setForm(f => ({
      ...f,
      promo_codes: f.promo_codes.includes(code) ? f.promo_codes.filter(c => c !== code) : [...f.promo_codes, code],
    }));

  const addCode = () => {
    const code = newCode.trim().toUpperCase();
    if (code && !form.promo_codes.includes(code)) setForm(f => ({ ...f, promo_codes: [...f.promo_codes, code] }));
    setNewCode("");
  };

  const section = (key: string) => form.permissions[key] || { enabled: false, fields: [] };

  const setSection = (key: string, next: { enabled: boolean; fields: string[] }) =>
    setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: next } }));

  const toggleSection = (s: SectionDef) => {
    const cur = section(s.key);
    // Turning a section on with nothing ticked would show nothing, so tick every field
    setSection(s.key, { enabled: !cur.enabled, fields: !cur.enabled && cur.fields.length === 0 ? s.fields.map(f => f.key) : cur.fields });
  };

  const toggleField = (s: SectionDef, field: string) => {
    const cur = section(s.key);
    const fields = cur.fields.includes(field) ? cur.fields.filter(f => f !== field) : [...cur.fields, field];
    setSection(s.key, { enabled: fields.length > 0 && cur.enabled, fields });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = { ...form, password: form.password || undefined };
      const res = editingId ? await AdminAPI.updateInfluencer(editingId, payload) : await AdminAPI.createInfluencer(payload);
      if (!res.status) { setError(res.message || "Failed to save."); return; }
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally { setSaving(false); }
  };

  const handleToggle = async (inf: Influencer) => {
    if (!window.confirm(`${inf.is_active ? "Disable" : "Enable"} login for ${inf.name}?`)) return;
    const res = await AdminAPI.toggleInfluencer(inf.id, !inf.is_active);
    if (res.status) load(); else alert(res.message);
  };

  const handleDelete = async (inf: Influencer) => {
    if (!window.confirm(`Permanently delete ${inf.name}'s login? This cannot be undone.`)) return;
    const res = await AdminAPI.deleteInfluencer(inf.id);
    if (res.status) load(); else alert(res.message);
  };

  const openPreview = async (inf: Influencer) => {
    setPreview({ name: inf.name, data: null });
    const res = await AdminAPI.previewInfluencer(inf.id);
    if (res.status) setPreview({ name: inf.name, data: res });
    else { alert(res.message); setPreview(null); }
  };

  const copyLoginUrl = () => {
    navigator.clipboard.writeText(loginUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  const allCodes = [...new Set([...promoOptions.map(p => p.code), ...form.promo_codes])];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="text-primary" /> Influencers
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Logins for influencers. Each one sees poster &amp; flash card sales made with their promo codes — only the sections and fields you allow.
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primaryDark transition shadow-sm">
          <Plus size={18} /> Add Influencer
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm">
        <KeyRound size={16} className="text-gray-400" />
        <span className="text-gray-500">Influencer login page:</span>
        <code className="font-mono text-gray-800 break-all">{loginUrl}</code>
        <button onClick={copyLoginUrl} className="ml-auto flex items-center gap-1 text-primary font-semibold hover:underline">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={28} />Loading…</div>
      ) : influencers.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <UserCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No influencer logins yet</p>
          <button onClick={openCreate} className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-primaryDark transition">
            <Plus size={16} /> Add First Influencer
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {["Influencer", "Promo codes", "Posters sold", "Flash cards sold", "Orders", "Can see", "Last login", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {influencers.map(inf => (
                <tr key={inf.id} className={inf.is_active ? "" : "opacity-60"}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{inf.name}</p>
                    <p className="text-xs text-gray-500">{inf.email}{inf.mobile ? ` · ${inf.mobile}` : ""}</p>
                    {!inf.is_active && <span className="text-[10px] font-bold uppercase text-red-500">Disabled</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {inf.promo_codes.length
                        ? inf.promo_codes.map(c => <span key={c} className="font-mono text-[11px] font-bold bg-secondary text-primary px-2 py-0.5 rounded-full">{c}</span>)
                        : <span className="text-xs text-amber-600">None — sees no sales</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">{inf.poster_units}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{inf.flashcard_units}</td>
                  <td className="px-4 py-3 text-gray-700">{inf.orders}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {sections.filter(s => inf.permissions?.[s.key]?.enabled).map(s => s.label).join(", ") || <span className="text-gray-400">Nothing</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(inf.last_login_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => openPreview(inf)} title="See what they see" className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye size={16} /></button>
                      <button onClick={() => openEdit(inf)} title="Edit" className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"><Pencil size={16} /></button>
                      <button onClick={() => handleToggle(inf)} title={inf.is_active ? "Disable login" : "Enable login"}
                        className={`p-2 rounded-lg ${inf.is_active ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                        {inf.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button onClick={() => handleDelete(inf)} title="Delete" className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit ─────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit Influencer" : "Add Influencer"}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
            </div>

            <div className="p-5 space-y-6">
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

              {/* Login details */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile</label>
                  <input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Login email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{editingId ? "New password" : "Password *"}</label>
                  <input type="text" required={!editingId} minLength={6} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder={editingId ? "Leave blank to keep current" : "Min 6 characters"}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                Login enabled
              </label>

              {/* Promo codes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Linked promo codes</label>
                <p className="text-xs text-gray-400 mb-2">Poster &amp; flash card orders paid with these codes are counted for this influencer. Create codes under Poster Promos.</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {allCodes.length === 0 && <span className="text-xs text-gray-400">No promo codes exist yet.</span>}
                  {allCodes.map(code => {
                    const on = form.promo_codes.includes(code);
                    const inactive = promoOptions.find(p => p.code === code)?.is_active === false;
                    return (
                      <button key={code} type="button" onClick={() => toggleCode(code)}
                        className={`font-mono text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                          on ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"
                        }`}>
                        {code}{inactive ? " (inactive)" : ""}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input value={newCode} onChange={e => setNewCode(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCode(); } }}
                    placeholder="Or type a code"
                    className="flex-1 border border-gray-300 rounded-lg p-2 text-sm font-mono uppercase focus:ring-2 focus:ring-primary outline-none" />
                  <button type="button" onClick={addCode} className="px-4 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-secondary">Add</button>
                </div>
              </div>

              {/* What they can see */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">What this influencer can see</label>
                <p className="text-xs text-gray-400 mb-3">Untick anything they should not see. Changes apply on their next page load.</p>
                <div className="space-y-3">
                  {sections.map(s => {
                    const cur = section(s.key);
                    return (
                      <div key={s.key} className={`rounded-xl border p-4 transition ${cur.enabled ? "border-emerald-300 bg-emerald-50/40" : "border-gray-200"}`}>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="font-semibold text-gray-800">{s.label}</span>
                          <span className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            {cur.enabled ? "Visible" : "Hidden"}
                            <input type="checkbox" checked={cur.enabled} onChange={() => toggleSection(s)} className="w-4 h-4 accent-emerald-600" />
                          </span>
                        </label>
                        {cur.enabled && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                            {s.fields.map(f => (
                              <label key={f.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={cur.fields.includes(f.key)} onChange={() => toggleField(s, f.key)} className="w-4 h-4 accent-emerald-600" />
                                {f.label}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Internal notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Only visible to admins (e.g. commission terms)"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>
            </div>

            <div className="p-5 border-t sticky bottom-0 bg-white">
              <button type="submit" disabled={saving}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primaryDark transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? "Saving…" : editingId ? "Update Influencer" : "Create Login"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Preview: exactly what the influencer sees ─────────────────────── */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-50 rounded-2xl w-full max-w-5xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{preview.name}'s view</h2>
                <p className="text-xs text-gray-500">Exactly what this influencer sees after logging in</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
            </div>
            <div className="p-5">
              {preview.data
                ? <InfluencerDashboardView data={preview.data} />
                : <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto" /></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
