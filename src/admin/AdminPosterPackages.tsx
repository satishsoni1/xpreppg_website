import { useState, useEffect, useRef } from "react";
import { AdminAPI } from "@/services/adminApi";
import {
  Layers, Save, Loader2, Eye, EyeOff, Trash2, X, Plus, Tag, Pencil, ImageIcon,
} from "lucide-react";

// Product line → group labels shown as sections on that store page
const CATEGORY_OPTIONS = [
  { value: "poster",    label: "NEET PG Poster" },
  { value: "flashcard", label: "NEET UG Flash Cards" },
];

const SUBJECT_OPTIONS: Record<string, string[]> = {
  poster: ["Short Subject Combo", "Medium Subject Combo", "Long Subject Pack"],
  flashcard: ["Physics", "Chemistry", "Biology", "Complete NEET UG Set"],
};

const emptyForm = {
  category: "poster",
  title: "",
  subject: "",
  description: "",
  price: "",
  original_price: "",
  poster_count: "",
  poster_qty: "1",
  tags: "",
  sort_order: "0",
  image_url: "",
  image_url2: "",
};

export default function AdminPosterPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getPosterPackages();
      if (res.status) setPackages(res.packages ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setImageFile(null); setImagePreview(null);
    setImageFile2(null); setImagePreview2(null);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (pkg: any) => {
    setForm({
      category: pkg.category ?? "poster",
      title: pkg.title ?? "",
      subject: pkg.subject ?? "",
      description: pkg.description ?? "",
      price: String(pkg.price ?? ""),
      original_price: pkg.original_price ? String(pkg.original_price) : "",
      poster_count: pkg.poster_count ?? "",
      poster_qty: String(pkg.poster_qty ?? 1),
      tags: pkg.tags ?? "",
      sort_order: String(pkg.sort_order ?? 0),
      image_url: pkg.image_url ?? "",
      image_url2: pkg.image_url2 ?? "",
    });
    setImageFile(null); setImagePreview(pkg.image_url ?? null);
    setImageFile2(null); setImagePreview2(pkg.image_url2 ?? null);
    setEditingId(pkg.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setImageFile(null); setImagePreview(null);
    setImageFile2(null); setImagePreview2(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, which: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (which === 1) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    else { setImageFile2(file); setImagePreview2(URL.createObjectURL(file)); }
  };

  const uploadIfNeeded = async (file: File | null, existingUrl: string): Promise<string> => {
    if (!file) return existingUrl;
    const fd = new FormData();
    fd.append("image", file);
    const res = await AdminAPI.uploadImage(fd);
    if (!res.url) throw new Error(res.message || "Image upload failed");
    return res.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview && !imageFile) {
      alert("Please select a primary package image.");
      return;
    }
    setSaving(true);
    try {
      const imageUrl  = await uploadIfNeeded(imageFile, form.image_url);
      const imageUrl2 = imagePreview2 || form.image_url2
        ? await uploadIfNeeded(imageFile2, form.image_url2)
        : null;

      const payload = {
        category: form.category,
        title: form.title,
        subject: form.subject || null,
        description: form.description,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        image_url: imageUrl,
        image_url2: imageUrl2 || null,
        poster_count: form.poster_count || null,
        poster_qty: Number(form.poster_qty) || 1,
        tags: form.tags || null,
        sort_order: Number(form.sort_order) || 0,
      };

      const res = editingId
        ? await AdminAPI.updatePosterPackage(editingId, payload)
        : await AdminAPI.createPosterPackage(payload);

      if (res.status) {
        closeForm();
        fetchPackages();
      } else {
        alert(res.message || "Failed to save package.");
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    if (!window.confirm(`${current ? "Hide" : "Show"} this package on the website?`)) return;
    const res = await AdminAPI.togglePosterPackage(id, !current);
    if (res.status) fetchPackages();
    else alert(res.message);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Permanently delete this package? This cannot be undone.")) return;
    const res = await AdminAPI.deletePosterPackage(id);
    if (res.status) fetchPackages();
    else alert(res.message);
  };

  const discountPct = (price: string, orig: string) =>
    orig && Number(orig) > 0 ? Math.round((1 - Number(price) / Number(orig)) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Layers className="text-primary" /> Shop Products
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primaryDark transition shadow-sm"
        >
          <Plus size={18} /> Add Package
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[{ value: "all", label: "All" }, ...CATEGORY_OPTIONS].map(c => (
          <button
            key={c.value}
            onClick={() => setCategoryFilter(c.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
              categoryFilter === c.value ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Package" : "Add New Package"}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-700 transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Primary Image */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Primary Image *</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${imagePreview ? "border-primary" : "border-gray-300 hover:border-primary"}`}
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="py-6">
                      <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-primary font-semibold text-sm">Click to upload primary image</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageSelect(e, 1)} />
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageFile(null); setForm(f => ({ ...f, image_url: "" })); if (fileRef.current) fileRef.current.value = ""; }}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    Remove primary image
                  </button>
                )}
                {/* OR enter URL manually */}
                <input
                  placeholder="Or paste image URL"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm mt-2 focus:ring-2 focus:ring-primary outline-none text-gray-500"
                  value={imageFile ? "" : form.image_url}
                  disabled={!!imageFile}
                  onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value || null); }}
                />
              </div>

              {/* Secondary Image */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Second Image (Optional)</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${imagePreview2 ? "border-primary" : "border-gray-200 hover:border-primary"}`}
                  onClick={() => fileRef2.current?.click()}
                >
                  {imagePreview2 ? (
                    <img src={imagePreview2} alt="preview2" className="max-h-32 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="py-4">
                      <ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-1" />
                      <p className="text-sm text-gray-400">Click to upload second image</p>
                    </div>
                  )}
                  <input ref={fileRef2} type="file" accept="image/*" className="hidden" onChange={e => handleImageSelect(e, 2)} />
                </div>
                {imagePreview2 && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview2(null); setImageFile2(null); setForm(f => ({ ...f, image_url2: "" })); if (fileRef2.current) fileRef2.current.value = ""; }}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    Remove second image
                  </button>
                )}
                <input
                  placeholder="Or paste second image URL"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm mt-2 focus:ring-2 focus:ring-primary outline-none text-gray-500"
                  value={imageFile2 ? "" : form.image_url2}
                  disabled={!!imageFile2}
                  onChange={e => { setForm(f => ({ ...f, image_url2: e.target.value })); setImagePreview2(e.target.value || null); }}
                />
              </div>

              <input
                required
                placeholder="Package Title *"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />

              {/* Product line */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Line *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map(c => (
                    <button
                      key={c.value} type="button"
                      onClick={() => setForm(f => ({ ...f, category: c.value, subject: "" }))}
                      className={`p-3 rounded-lg border text-sm font-semibold transition ${
                        form.category === c.value ? "border-primary bg-secondary text-primary" : "border-gray-300 text-gray-600 hover:border-primary"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject / Group Label</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none bg-white"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                >
                  <option value="">— Select group —</option>
                  {(SUBJECT_OPTIONS[form.category] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{form.category === "flashcard" ? "Card Count Label" : "Poster Count Label"}</label>
                  <input
                    placeholder="e.g. 4 Posters, 7 Subjects"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                    value={form.poster_count}
                    onChange={e => setForm(f => ({ ...f, poster_count: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{form.category === "flashcard" ? "Shipping Qty (sets) *" : "Actual Poster Qty *"}</label>
                  <input
                    required type="number" min="1" placeholder="4"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                    value={form.poster_qty}
                    onChange={e => setForm(f => ({ ...f, poster_qty: e.target.value }))}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Used to calculate tiered shipping charge at checkout.</p>
                </div>
              </div>

              <div>
                <input
                  placeholder="Tags — comma separated (e.g. combo, pathology, neet pg)"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
                {form.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} className="bg-secondary text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-secondaryDark">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                required
                rows={3}
                placeholder="Description — what subjects / posters are in this package?"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none resize-none"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹) *</label>
                  <input
                    required type="number" min="1" placeholder="319"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none font-bold text-primary"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Original (₹)</label>
                  <input
                    type="number" min="1" placeholder="499"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-gray-400"
                    value={form.original_price}
                    onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sort Order</label>
                  <input
                    type="number" min="0" placeholder="0"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-gray-400"
                    value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                  />
                </div>
              </div>

              {form.price && form.original_price && discountPct(form.price, form.original_price) > 0 && (
                <p className="text-sm text-green-600 font-semibold">
                  {discountPct(form.price, form.original_price)}% discount will be shown on the website
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primaryDark transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? "Saving…" : editingId ? "Update Package" : "Save Package"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Package Grid ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-24 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p>Loading packages…</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
          <Layers className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold text-lg">No packages yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Run the DB migration then add or edit packages</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primaryDark transition"
          >
            <Plus size={16} /> Add First Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.filter(p => categoryFilter === "all" || (p.category ?? "poster") === categoryFilter).map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-xl border overflow-hidden shadow-sm transition ${
                pkg.is_active ? "bg-white border-gray-200 hover:shadow-md" : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <span className="absolute top-2 left-2 z-10 bg-white/90 text-navy text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {pkg.category === "flashcard" ? "NEET UG Flash Cards" : "NEET PG Poster"}
                </span>
                {pkg.image_url ? (
                  <div className="relative w-full h-full">
                    <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover" />
                    {pkg.image_url2 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5">
                        <img src={pkg.image_url2} alt="2nd" className="h-10 w-full object-cover rounded opacity-90" />
                        <p className="text-white text-[9px] text-center mt-0.5">2nd image</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full ${
                  pkg.is_active ? "bg-secondaryMiddle text-primary" : "bg-gray-200 text-gray-500"
                }`}>
                  {pkg.is_active ? "Live" : "Hidden"}
                </span>
                {pkg.subject && (
                  <span className="absolute bottom-2 left-2 bg-navy/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Tag size={10} /> {pkg.subject}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{pkg.title}</h3>
                  {pkg.poster_count && (
                    <span className="shrink-0 text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {pkg.poster_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{pkg.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-extrabold text-primary">₹{pkg.price}</span>
                  {pkg.original_price && (
                    <>
                      <span className="text-sm text-gray-400 line-through">₹{pkg.original_price}</span>
                      <span className="text-xs font-bold text-green-600">
                        {Math.round((1 - pkg.price / pkg.original_price) * 100)}% off
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-primary/30 text-primary hover:bg-secondary transition"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleToggle(pkg.id, pkg.is_active)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition border ${
                      pkg.is_active
                        ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                        : "border-primary text-primary hover:bg-secondary"
                    }`}
                  >
                    {pkg.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    {pkg.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                    title="Delete package"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
