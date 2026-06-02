import { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart, X, MessageCircle, Tag, ZoomIn,
  ShieldCheck, Lock, Package, ChevronRight, Search,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { PublicAPI } from "@/services/publicApi";
import { useNavigate } from "react-router-dom";

interface Poster {
  id: number;
  title: string;
  subject: string;
  tags: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
}

// ── Shared image copy-protection ─────────────────────────────────────────────
export function ProtectedImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={`relative select-none overflow-hidden ${className ?? ""}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <img
        src={src} alt={alt} draggable="false"
        className="w-full h-full object-cover"
        style={{ pointerEvents: "none", userSelect: "none" }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-around">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-white/20 font-bold text-xs whitespace-nowrap tracking-widest select-none" style={{ transform: "rotate(-35deg)" }}>
            © XREVISE — Preview Only
          </span>
        ))}
      </div>
      <div className="absolute top-2 left-2 bg-black/40 text-white/80 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none select-none">
        <Lock size={9} /> Protected
      </div>
    </div>
  );
}

// ── XREVISE Combos & Packs data ──────────────────────────────────────────────
export const POSTER_PACKAGES: Poster[] = [
  {
    id: 9001,
    title: "Short Subject Combo",
    subject: "Combo Pack",
    tags: "combo, short, packages",
    description: "Curated combo package including 7 Ortho, Psychiatry, Forensic Medicine & Toxicology, Radiology, Dermatology, Pediatrics, and Anesthesiology posters.",
    price: 549,
    original_price: 850,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600"
  },
  {
    id: 9002,
    title: "Pathology + Biochemistry Combo",
    subject: "Combo Pack",
    tags: "combo, medium, pathology, biochemistry",
    description: "Curated combo package including Pathology (2 posters) + Biochemistry (2 posters). High-yield revision details.",
    price: 319,
    original_price: 499,
    image_url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600"
  },
  {
    id: 9003,
    title: "Anatomy + Physiology Combo",
    subject: "Combo Pack",
    tags: "combo, medium, anatomy, physiology",
    description: "Curated combo package including Anatomy (2 posters) + Physiology (1 poster) to master basic sciences.",
    price: 239,
    original_price: 399,
    image_url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600"
  },
  {
    id: 9004,
    title: "Microbiology + Pharmacology Combo",
    subject: "Combo Pack",
    tags: "combo, medium, microbiology, pharmacology",
    description: "Curated combo package including Microbiology (2 posters) + Pharmacology (2 posters). High-yield micro and drugs.",
    price: 319,
    original_price: 499,
    image_url: "https://images.unsplash.com/photo-1581091870622-0a373b579a23?w=600"
  },
  {
    id: 9005,
    title: "ENT + Ophthalmology Combo",
    subject: "Combo Pack",
    tags: "combo, medium, ent, ophthalmology",
    description: "Curated combo package including Otorhinolaryngology/ENT (2 posters) + Ophthalmology (2 posters) for core specialities.",
    price: 319,
    original_price: 499,
    image_url: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=600"
  },
  {
    id: 9006,
    title: "Obstetrics and Gynecology Pack",
    subject: "Long Subject Pack",
    tags: "long, obg, gynecology, obstetrics",
    description: "Individual subject revision poster set containing 4 high-yield posters dedicated to Obstetrics and Gynecology.",
    price: 319,
    original_price: 499,
    image_url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600"
  },
  {
    id: 9007,
    title: "General Medicine Pack",
    subject: "Long Subject Pack",
    tags: "long, medicine",
    description: "Individual subject revision poster set containing 4 high-yield posters dedicated to General Medicine.",
    price: 319,
    original_price: 499,
    image_url: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=600"
  },
  {
    id: 9008,
    title: "General Surgery Pack",
    subject: "Long Subject Pack",
    tags: "long, surgery",
    description: "Individual subject revision poster set containing 4 high-yield posters dedicated to General Surgery.",
    price: 319,
    original_price: 499,
    image_url: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600"
  },
  {
    id: 9009,
    title: "Community Medicine Pack",
    subject: "Long Subject Pack",
    tags: "long, psm, community-medicine",
    description: "Individual subject revision poster set containing 4 high-yield posters dedicated to Community Medicine / PSM.",
    price: 319,
    original_price: 499,
    image_url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600"
  }
];

// ── Poster detail modal ───────────────────────────────────────────────────────
function PosterModal({ poster, onClose, onAdd, inCart }: {
  poster: Poster; onClose: () => void;
  onAdd: (p: Poster) => void; inCart: boolean;
}) {
  const discount = poster.original_price
    ? Math.round((1 - poster.price / poster.original_price) * 100) : 0;
  const tags = poster.tags ? poster.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  const handleWhatsApp = () => {
    const delivery = 150;
    const total = poster.price + delivery;
    const msg = encodeURIComponent(
      `Hello XREVISE! I'd like to purchase:\n\n📌 *${poster.title}*\nSubject: ${poster.subject || "Package"}\nPrice: ₹${poster.price}\n🚚 Flat Delivery: ₹${delivery}\n💰 Total Payable: ₹${total}\n\nPlease confirm my order and share delivery/payment details.`
    );
    window.open(`https://wa.me/918446036521?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
        <div className="md:w-5/12 bg-navy shrink-0">
          <ProtectedImage src={poster.image_url} alt={poster.title} className="w-full h-56 md:h-full" />
        </div>
        <div className="flex-1 p-6 flex flex-col overflow-y-auto text-left">
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-wrap gap-1.5">
              {poster.subject && (
                <span className="bg-secondary text-primary text-xs font-bold px-3 py-1 rounded-full border border-secondaryDark">
                  {poster.subject}
                </span>
              )}
              {tags.map(t => (
                <span key={t} className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                  #{t}
                </span>
              ))}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition ml-2 shrink-0"><X size={22} /></button>
          </div>

          <h2 className="text-xl font-bold text-navy mb-3 leading-snug">{poster.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">{poster.description}</p>

          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 mb-5 text-xs text-primary font-medium">
            <ShieldCheck size={14} className="shrink-0" />
            Preview is watermarked. Full quality poster delivered after purchase.
          </div>

          <div className="flex items-end gap-3 mb-5">
            <span className="text-3xl font-extrabold text-navy">₹{poster.price}</span>
            {poster.original_price && (
              <>
                <span className="text-lg text-gray-400 line-through mb-0.5">₹{poster.original_price}</span>
                {discount > 0 && <span className="text-sm font-bold text-green-600 mb-0.5">{discount}% OFF</span>}
              </>
            )}
          </div>

          <button
            onClick={() => { onAdd(poster); onClose(); }}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition mb-2 ${
              inCart ? "bg-secondaryMiddle text-primary border border-secondaryDark" : "bg-primary hover:bg-primaryDark text-white shadow-md"
            }`}
          >
            <ShoppingCart size={18} />
            {inCart ? "Added to Cart" : "Add to Cart"}
          </button>
          <button onClick={handleWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <MessageCircle size={18} /> Order via WhatsApp
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">Delivery confirmed within 24 hrs</p>
        </div>
      </div>
    </div>
  );
}

// ── Cart sidebar ──────────────────────────────────────────────────────────────
function CartSidebar({ cart, onRemove, onClose, onWhatsApp }: {
  cart: Poster[]; onRemove: (id: number) => void;
  onClose: () => void; onWhatsApp: () => void;
}) {
  const subtotal = cart.reduce((s, p) => s + p.price, 0);
  const deliveryCharge = 150;
  const grandTotal = subtotal + deliveryCharge;

  const bySubject = cart.reduce<Record<string, Poster[]>>((acc, p) => {
    const key = p.subject || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" /> Your Bundle ({cart.length})
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Your bundle is empty</p>
              <p className="text-xs mt-1">Add posters from any subject</p>
            </div>
          ) : (
            Object.entries(bySubject).map(([subject, posters]) => (
              <div key={subject}>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Tag size={10} /> {subject} ({posters.length})
                </p>
                <div className="space-y-2">
                  {posters.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 bg-secondary rounded-xl border border-secondaryDark text-left">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 select-none" onContextMenu={e => e.preventDefault()}>
                        <img src={item.image_url} alt={item.title} draggable="false" className="w-full h-full object-cover" style={{ pointerEvents: "none" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs leading-tight line-clamp-2">{item.title}</p>
                        <p className="text-primary font-bold text-sm mt-0.5">₹{item.price}</p>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 transition shrink-0"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50 text-left">
            <div className="space-y-1.5 border-b border-gray-200 pb-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Flat Delivery Charge:</span>
                <span className="font-bold">₹{deliveryCharge}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1.5">
              <div>
                <p className="text-[10px] text-gray-400">Total Payable Amount</p>
                <p className="text-2xl font-extrabold text-navy">₹{grandTotal}</p>
              </div>
              {cart.length >= 2 && (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full">Bundle Deal</span>
              )}
            </div>
            <button onClick={onWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <MessageCircle className="w-5 h-5" /> Order Bundle via WhatsApp
            </button>
            <p className="text-center text-[10px] text-gray-400">Confirm & arrange delivery within 24 hrs</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ShopPage ─────────────────────────────────────────────────────────────
export default function ShopPage() {
  const navigate = useNavigate();
  const [allPosters, setAllPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Poster | null>(null);
  const [cart, setCart] = useState<Poster[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeStoreTab, setActiveStoreTab] = useState<'individual' | 'combos'>('individual');

  const initialSubject = new URLSearchParams(window.location.search).get("subject") ?? "All";
  const [activeSubject, setActiveSubject] = useState(initialSubject);

  useEffect(() => {
    PublicAPI.getPosters()
      .then(res => { if (res.status && Array.isArray(res.posters)) setAllPosters(res.posters); })
      .finally(() => setLoading(false));
  }, []);

  // Derive subjects from data
  const subjects = useMemo(() => {
    const map: Record<string, number> = {};
    allPosters.forEach(p => { if (p.subject) map[p.subject] = (map[p.subject] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allPosters]);

  // Derive all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    allPosters.forEach(p => p.tags?.split(",").map(t => t.trim()).filter(Boolean).forEach(t => set.add(t)));
    return [...set].sort();
  }, [allPosters]);

  // Filtered posters
  const filtered = useMemo(() => {
    return allPosters.filter(p => {
      const matchSubject = activeSubject === "All" || p.subject === activeSubject;
      const matchTags = activeTags.length === 0 || activeTags.every(t =>
        p.tags?.toLowerCase().includes(t.toLowerCase())
      );
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.subject?.toLowerCase().includes(search.toLowerCase());
      return matchSubject && matchTags && matchSearch;
    });
  }, [allPosters, activeSubject, activeTags, search]);

  const toggleTag = (tag: string) =>
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const addToCart = (p: Poster) => setCart(prev => prev.some(c => c.id === p.id) ? prev : [...prev, p]);
  const removeFromCart = (id: number) => setCart(prev => prev.filter(p => p.id !== id));

  const handleWhatsApp = () => {
    const lines = cart.map(p => `• ${p.title} (${p.subject || "Package"}) — ₹${p.price}`).join("\n");
    const subtotal = cart.reduce((s, p) => s + p.price, 0);
    const delivery = 150;
    const total = subtotal + delivery;
    const msg = encodeURIComponent(
      `Hello XREVISE! I'd like to order this poster bundle:\n\n${lines}\n\n-------------------------\n📊 Subtotal: ₹${subtotal}\n🚚 Flat Delivery: ₹${delivery}\n💰 Total Payable: ₹${total}\n-------------------------\n\nPlease confirm my order and share delivery/payment details.`
    );
    window.open(`https://wa.me/918446036521?text=${msg}`, "_blank");
  };

  return (
    <MainLayout>
      {selected && (
        <PosterModal
          poster={selected} onClose={() => setSelected(null)}
          onAdd={addToCart} inCart={cart.some(c => c.id === selected.id)}
        />
      )}
      {showCart && (
        <CartSidebar cart={cart} onRemove={removeFromCart} onClose={() => setShowCart(false)} onWhatsApp={handleWhatsApp} />
      )}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-navy to-navyLight pt-36 pb-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="bg-primary/20 text-accent text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-block border border-primary/30">
                Medical Study Materials
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Medical Poster Store</h1>
              <p className="text-white/70 text-lg max-w-xl">
                High-yield visual posters for NEET PG, INI-CET & FMGE. Browse by subject, build your bundle, order in minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              {["📦 Fast Delivery", "🎨 Expert Designed", "🔒 Copy Protected"].map(t => (
                <span key={t} className="bg-white/10 border border-white/20 text-white/80 px-3 py-1.5 rounded-full text-sm font-medium">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Catalog Mode Switcher */}
      <div className="bg-secondary border-b border-secondaryDark py-5 px-4">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="bg-white p-1 rounded-full border border-secondaryDark shadow-sm flex gap-1">
            <button
              onClick={() => setActiveStoreTab('individual')}
              className={`px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 ${
                activeStoreTab === 'individual'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:text-primary hover:bg-secondary/50'
              }`}
            >
              <Tag className="w-4 h-4" />
              Individual Posters
            </button>
            <button
              onClick={() => setActiveStoreTab('combos')}
              className={`px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 ${
                activeStoreTab === 'combos'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:text-primary hover:bg-secondary/50'
              }`}
            >
              <Package className="w-4 h-4" />
              Curated Combos & Packs
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeStoreTab === 'individual' ? (
          <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">

            {/* ── Subject Sidebar (desktop) ─────────────────────── */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-28 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Browse by Subject</p>
                <ul className="space-y-1">
                  {[["All", allPosters.length], ...subjects].map(([subj, count]) => (
                    <li key={subj}>
                      <button
                        onClick={() => setActiveSubject(subj as string)}
                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          activeSubject === subj
                            ? "bg-primary text-white shadow-sm"
                            : "text-gray-700 hover:bg-secondary hover:text-primary"
                        }`}
                      >
                        <span>{subj}</span>
                        <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${activeSubject === subj ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                          {count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {allTags.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter by Tag</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-all ${
                            activeTags.includes(tag)
                              ? "bg-primary text-white border-primary"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* ── Main content ──────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search posters…"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                {/* Cart button */}
                <button
                  onClick={() => setShowCart(true)}
                  className="relative flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primaryDark transition-colors shadow-md shrink-0"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Bundle Cart
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>
                  )}
                </button>
              </div>

              {/* Mobile subject pills */}
              <div className="lg:hidden overflow-x-auto pb-2 mb-3">
                <div className="flex gap-2 w-max">
                  {[["All", allPosters.length], ...subjects].map(([subj, count]) => (
                    <button
                      key={subj}
                      onClick={() => setActiveSubject(subj as string)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                        activeSubject === subj ? "bg-primary text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {subj} <span className="text-xs opacity-70">({count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile tag chips */}
              {allTags.length > 0 && (
                <div className="lg:hidden flex flex-wrap gap-1.5 mb-4">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-all ${
                        activeTags.includes(tag) ? "bg-primary text-white border-primary" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Active filters summary */}
              {(activeSubject !== "All" || activeTags.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-secondary rounded-xl border border-secondaryDark text-sm text-left">
                  <span className="text-gray-500 font-medium">Filtered:</span>
                  {activeSubject !== "All" && (
                    <span className="flex items-center gap-1 bg-primary text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                      {activeSubject} <button onClick={() => setActiveSubject("All")} className="ml-1"><X size={10} /></button>
                    </span>
                  )}
                  {activeTags.map(t => (
                    <span key={t} className="flex items-center gap-1 bg-white border border-primaryDark text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                      #{t} <button onClick={() => toggleTag(t)}><X size={10} /></button>
                    </span>
                  ))}
                  <span className="text-gray-500 ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
                </div>
              )}

              {/* Bundle prompt */}
              {cart.length >= 1 && (
                <div
                  onClick={() => setShowCart(true)}
                  className="mb-5 flex items-center justify-between bg-gradient-to-r from-primary to-primaryDark text-white px-4 py-3 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">{cart.length} poster{cart.length > 1 ? "s" : ""} in your bundle</p>
                      <p className="text-white/70 text-xs">Total ₹{cart.reduce((s, p) => s + p.price, 0)} · Tap to review & order</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 shrink-0" />
                </div>
              )}

              {/* Grid */}
              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                      <div className="bg-gray-200 aspect-[3/4]" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingCart className="w-14 h-14 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No posters found</h3>
                  <p className="text-sm">Try a different subject or clear the filters.</p>
                  <button onClick={() => { setActiveSubject("All"); setActiveTags([]); setSearch(""); }} className="mt-4 text-primary font-semibold hover:underline text-sm">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map(poster => {
                    const discount = poster.original_price ? Math.round((1 - poster.price / poster.original_price) * 100) : 0;
                    const inCart = cart.some(c => c.id === poster.id);
                    const tags = poster.tags ? poster.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

                    return (
                      <div key={poster.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-secondaryDark transition-all duration-300 overflow-hidden group flex flex-col">
                        <div className="relative aspect-[3/4] cursor-pointer overflow-hidden" onClick={() => setSelected(poster)}>
                          <ProtectedImage src={poster.image_url} alt={poster.title} className="w-full h-full" />
                          <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/25 transition-all duration-300 flex items-center justify-center pointer-events-none">
                            <div className="bg-white/90 text-navy text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-300">
                              <ZoomIn size={12} /> View Details
                            </div>
                          </div>
                          {discount > 0 && (
                            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
                          )}
                          {inCart && (
                            <span className="absolute bottom-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShoppingCart size={9} /> In Bundle
                            </span>
                          )}
                        </div>

                        <div className="p-4 flex flex-col flex-1 text-left">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {poster.subject && (
                              <button onClick={() => setActiveSubject(poster.subject)} className="text-xs font-semibold text-primary bg-secondary px-2.5 py-0.5 rounded-full border border-secondaryDark hover:bg-secondaryMiddle transition-colors">
                                {poster.subject}
                              </button>
                            )}
                            {tags.slice(0, 2).map(t => (
                              <button key={t} onClick={() => toggleTag(t)} className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full hover:bg-gray-200 transition-colors">
                                #{t}
                              </button>
                            ))}
                          </div>

                          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-2 flex-1" onClick={() => setSelected(poster)}>
                            {poster.title}
                          </h3>
                          <p className="text-gray-500 text-xs mb-3 line-clamp-2">{poster.description}</p>

                          <div className="flex items-end gap-2 mb-3">
                            <span className="text-xl font-extrabold text-navy">₹{poster.price}</span>
                            {poster.original_price && <span className="text-sm text-gray-400 line-through mb-0.5">₹{poster.original_price}</span>}
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => setSelected(poster)} className="flex-1 border border-primary text-primary py-2 rounded-lg font-semibold text-sm hover:bg-secondary transition-colors">
                              View
                            </button>
                            <button
                              onClick={() => inCart ? setShowCart(true) : addToCart(poster)}
                              className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 ${
                                inCart ? "bg-secondaryMiddle text-primary border border-secondaryDark" : "bg-primary hover:bg-primaryDark text-white shadow-sm"
                              }`}
                            >
                              <ShoppingCart size={13} />
                              {inCart ? "In Bundle" : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom CTA */}
              {!loading && allPosters.length > 0 && (
                <div className="mt-14 bg-gradient-to-r from-navy to-navyLight rounded-2xl p-10 text-center shadow-xl">
                  <h3 className="text-2xl font-bold text-white mb-2">Want a Custom Bundle?</h3>
                  <p className="text-white/70 mb-6 max-w-lg mx-auto">Contact us for bulk orders, institution packs, or specific subject combinations.</p>
                  <a href="https://wa.me/918446036521" target="_blank" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg">
                    <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-fadeIn">
            {/* Delivery Alert Banner */}
            <div className="bg-yellow-50/50 border border-yellow-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                  <span className="text-yellow-500 font-bold">✨</span> XREVISE Bundle Delivery Policy
                </h3>
                <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                  Add multiple combos or long subject packs to your bundle. A flat **₹150 delivery charge** is applied only once during final payment, no matter how many items you add!
                </p>
              </div>
              <button 
                onClick={() => setShowCart(true)}
                className="bg-white hover:bg-gray-50 border border-secondaryDark text-primary px-5 py-2.5 rounded-xl font-bold text-sm shrink-0 flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> View Bundle ({cart.length})
              </button>
            </div>

            {/* Packs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {POSTER_PACKAGES.map(pack => {
                const discount = pack.original_price ? Math.round((1 - pack.price / pack.original_price) * 100) : 0;
                const inCart = cart.some(c => c.id === pack.id);

                return (
                  <div key={pack.id} className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-xl hover:border-secondaryDark transition-all duration-300 overflow-hidden group flex flex-col">
                    <div className="relative aspect-[4/3] cursor-pointer overflow-hidden" onClick={() => setSelected(pack)}>
                      <ProtectedImage src={pack.image_url} alt={pack.title} className="w-full h-full" />
                      <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/25 transition-all duration-300 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 text-navy text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ZoomIn size={12} /> View Pack Details
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {pack.subject}
                      </span>
                      {discount > 0 && (
                        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{discount}% OFF</span>
                      )}
                      {inCart && (
                        <span className="absolute bottom-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShoppingCart size={9} /> In Bundle
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1 text-left">
                      <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-2" onClick={() => setSelected(pack)}>
                        {pack.title}
                      </h3>
                      <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1 line-clamp-2">{pack.description}</p>

                      <div className="flex items-end justify-between items-center pt-3 border-t border-gray-100 mt-auto">
                        <div>
                          <div className="flex items-end gap-2">
                            <span className="text-2xl font-extrabold text-navy">₹{pack.price}</span>
                            {pack.original_price && <span className="text-xs text-gray-400 line-through mb-0.5">₹{pack.original_price}</span>}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">Flat +₹150 Delivery Fee</p>
                        </div>
                        <button
                          onClick={() => inCart ? setShowCart(true) : addToCart(pack)}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                            inCart ? "bg-secondaryMiddle text-primary border border-secondaryDark" : "bg-primary hover:bg-primaryDark text-white shadow-sm"
                          }`}
                        >
                          <ShoppingCart size={12} />
                          {inCart ? "In Bundle" : "Add to Bundle"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Custom Combo Callout */}
            <div className="mt-14 bg-gradient-to-r from-navy to-navyLight rounded-2xl p-10 text-center shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-2">Want a Custom Bundle?</h3>
              <p className="text-white/70 mb-6 max-w-lg mx-auto">Contact us for bulk orders, institution packs, or specific subject combinations.</p>
              <a href="https://wa.me/918446036521" target="_blank" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg">
                <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
