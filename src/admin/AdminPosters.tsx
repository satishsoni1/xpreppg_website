import { useState, useEffect, useRef } from "react";
import { AdminAPI } from "@/services/adminApi";
import { ImageIcon, Save, Loader2, Eye, EyeOff, Trash2, X, Plus, Tag } from "lucide-react";

export default function AdminPosters() {
  const [posters, setPosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);

  const emptyForm = { title: "", description: "", price: "", original_price: "", subject: "", tags: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchPosters(); }, []);

  const fetchPosters = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getPosters();
      if (res.status) setPosters(res.posters ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleImageSelect = (e: any, which: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (which === 1) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    else { setImageFile2(file); setImagePreview2(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!imageFile) { alert("Please select a primary poster image."); return; }
    setCreating(true);
    try {
      const fd1 = new FormData();
      fd1.append("image", imageFile);
      const uploadRes1 = await AdminAPI.uploadImage(fd1);
      if (!uploadRes1.url) throw new Error(uploadRes1.message || "Primary image upload failed");

      let imageUrl2 = null;
      if (imageFile2) {
        const fd2 = new FormData();
        fd2.append("image", imageFile2);
        const uploadRes2 = await AdminAPI.uploadImage(fd2);
        imageUrl2 = uploadRes2.url || null;
      }

      const res = await AdminAPI.createPoster({
        ...form,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        image_url: uploadRes1.url,
        image_url2: imageUrl2,
      });

      if (res.status) {
        setForm(emptyForm);
        setImageFile(null); setImagePreview(null);
        setImageFile2(null); setImagePreview2(null);
        setShowForm(false);
        fetchPosters();
      } else {
        alert(res.message || "Failed to create poster.");
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    if (!window.confirm(`${current ? "Hide" : "Show"} this poster on the store?`)) return;
    const res = await AdminAPI.togglePoster(id, !current);
    if (res.status) fetchPosters();
    else alert(res.message);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Permanently delete this poster? This cannot be undone.")) return;
    const res = await AdminAPI.deletePoster(id);
    if (res.status) fetchPosters();
    else alert(res.message);
  };

  const discount = (price: string, orig: string) =>
    orig && Number(orig) > 0
      ? Math.round((1 - Number(price) / Number(orig)) * 100)
      : 0;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ImageIcon className="text-primary" /> XRevise Posters
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primaryDark transition shadow-sm"
        >
          <Plus size={18} /> Add Poster
        </button>
      </div>

      {/* ── Create Modal ─────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Add New Poster</h2>
              <button onClick={() => { setShowForm(false); setImagePreview(null); setImageFile(null); setImagePreview2(null); setImageFile2(null); }} className="text-gray-400 hover:text-gray-700 transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Primary image */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Primary Image (Thumbnail) *</label>
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
                      <p className="text-xs text-gray-400 mt-1">Used as thumbnail card image</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageSelect(e, 1)} />
                </div>
                {imagePreview && (
                  <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs text-red-500 hover:underline mt-1">
                    Remove primary image
                  </button>
                )}
              </div>

              {/* Secondary image */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Second Image (Optional — for slide/multi-subject view)</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${imagePreview2 ? "border-primary" : "border-gray-200 hover:border-primary"}`}
                  onClick={() => fileRef2.current?.click()}
                >
                  {imagePreview2 ? (
                    <img src={imagePreview2} alt="preview2" className="max-h-40 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="py-4">
                      <ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-1" />
                      <p className="text-sm text-gray-400">Click to upload second image</p>
                    </div>
                  )}
                  <input ref={fileRef2} type="file" accept="image/*" className="hidden" onChange={e => handleImageSelect(e, 2)} />
                </div>
                {imagePreview2 && (
                  <button type="button" onClick={() => { setImagePreview2(null); setImageFile2(null); if (fileRef2.current) fileRef2.current.value = ""; }} className="text-xs text-red-500 hover:underline mt-1">
                    Remove second image
                  </button>
                )}
              </div>

              <input
                required
                placeholder="Poster Title (e.g. Anatomy High-Yield Poster)"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />

              <input
                placeholder="Subject (e.g. Anatomy, Pharmacology, Pathology)"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              />

              <div>
                <input
                  placeholder="Tags — comma separated (e.g. high-yield, neet pg, flow chart, mnemonics)"
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
                placeholder="Description — what topics does this poster cover?"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none resize-none"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (₹) *</label>
                  <input
                    required type="number" min="1" placeholder="299"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none font-bold text-primary"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Original Price (₹)</label>
                  <input
                    type="number" min="1" placeholder="499"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-gray-400"
                    value={form.original_price}
                    onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
                  />
                </div>
              </div>

              {form.price && form.original_price && discount(form.price, form.original_price) > 0 && (
                <p className="text-sm text-green-600 font-semibold">
                  {discount(form.price, form.original_price)}% discount will be shown on the store
                </p>
              )}

              <button
                type="submit" disabled={creating}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primaryDark transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {creating ? "Uploading & Saving…" : "Save Poster"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Poster Grid ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-24 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p>Loading posters…</p>
        </div>
      ) : posters.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
          <ImageIcon className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold text-lg">No posters yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Add your first poster to display it in the store</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primaryDark transition"
          >
            <Plus size={16} /> Add First Poster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className={`rounded-xl border overflow-hidden shadow-sm transition ${
                poster.is_active ? "bg-white border-gray-200 hover:shadow-md" : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              {/* Poster Images */}
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                {poster.image_url ? (
                  <div className="relative w-full h-full">
                    <img src={poster.image_url} alt={poster.title} className="w-full h-full object-cover" />
                    {poster.image_url2 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5">
                        <img src={poster.image_url2} alt="2nd" className="h-12 w-full object-cover rounded opacity-90" />
                        <p className="text-white text-[9px] text-center mt-0.5">2nd image</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full ${
                  poster.is_active ? "bg-secondaryMiddle text-primary" : "bg-gray-200 text-gray-500"
                }`}>
                  {poster.is_active ? "Live" : "Hidden"}
                </span>
                {poster.subject && (
                  <span className="absolute bottom-2 left-2 bg-navy/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Tag size={10} /> {poster.subject}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{poster.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{poster.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-extrabold text-primary">₹{poster.price}</span>
                  {poster.original_price && (
                    <>
                      <span className="text-sm text-gray-400 line-through">₹{poster.original_price}</span>
                      <span className="text-xs font-bold text-green-600">
                        {Math.round((1 - poster.price / poster.original_price) * 100)}% off
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(poster.id, poster.is_active)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition border ${
                      poster.is_active
                        ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                        : "border-primary text-primary hover:bg-secondary"
                    }`}
                  >
                    {poster.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    {poster.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => handleDelete(poster.id)}
                    className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                    title="Delete poster"
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
