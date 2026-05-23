import { useState, useEffect } from "react";
import { ShoppingCart, X, MessageCircle, Tag, ZoomIn, ShieldCheck, Lock } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { PublicAPI } from "@/services/publicApi";

interface Poster {
  id: number;
  title: string;
  subject: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  is_active: boolean;
}

// ── Image copy-protection component ──────────────────────────────────────────
function ProtectedImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={`relative select-none overflow-hidden ${className ?? ""}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <img
        src={src}
        alt={alt}
        draggable="false"
        className="w-full h-full object-cover"
        style={{ pointerEvents: "none", userSelect: "none" }}
      />
      {/* Repeating diagonal watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-around">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="text-white/20 font-bold text-xs whitespace-nowrap tracking-widest select-none"
            style={{ transform: "rotate(-35deg)" }}
          >
            © XREVISE — Preview Only
          </span>
        ))}
      </div>
      {/* Top-left lock badge */}
      <div className="absolute top-2 left-2 bg-black/40 text-white/80 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none select-none">
        <Lock size={9} /> Protected
      </div>
    </div>
  );
}

// ── Poster detail modal ───────────────────────────────────────────────────────
function PosterModal({ poster, onClose }: { poster: Poster; onClose: () => void }) {
  const discount = poster.original_price
    ? Math.round((1 - poster.price / poster.original_price) * 100)
    : 0;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hello XREVISE! I'd like to purchase:\n\n📌 *${poster.title}*\nPrice: ₹${poster.price}\n\nPlease confirm my order and share delivery details.`
    );
    window.open(`https://wa.me/918446036521?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Protected image panel */}
        <div className="md:w-1/2 bg-navy shrink-0">
          <ProtectedImage src={poster.image_url} alt={poster.title} className="w-full h-64 md:h-full" />
        </div>

        {/* Info panel */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto">
          <div className="flex items-start justify-between mb-3">
            {poster.subject && (
              <span className="inline-flex items-center gap-1 bg-secondary text-primary text-xs font-bold px-3 py-1 rounded-full">
                <Tag size={11} /> {poster.subject}
              </span>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition ml-auto">
              <X size={22} />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-navy mb-3 leading-tight">{poster.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{poster.description}</p>

          {/* Copy-protection notice */}
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 mb-5 text-xs text-primary font-medium">
            <ShieldCheck size={14} className="shrink-0" />
            Preview is watermarked. Full quality poster delivered after purchase.
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-extrabold text-navy">₹{poster.price}</span>
            {poster.original_price && (
              <>
                <span className="text-lg text-gray-400 line-through mb-1">₹{poster.original_price}</span>
                {discount > 0 && (
                  <span className="text-sm font-bold text-green-600 mb-1">{discount}% OFF</span>
                )}
              </>
            )}
          </div>

          <button
            onClick={handleWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md mb-3"
          >
            <MessageCircle size={20} />
            Order via WhatsApp
          </button>
          <p className="text-center text-xs text-gray-400">
            Our team will confirm and arrange delivery within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main ShopPage ─────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Poster | null>(null);
  const [cart, setCart] = useState<Poster[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    PublicAPI.getPosters()
      .then((res) => {
        if (res.status && Array.isArray(res.posters)) setPosters(res.posters);
      })
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (poster: Poster) => {
    setCart((prev) => prev.some((p) => p.id === poster.id) ? prev : [...prev, poster]);
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((p) => p.id !== id));

  const cartTotal = cart.reduce((s, p) => s + p.price, 0);

  const handleCartWhatsApp = () => {
    const lines = cart.map((p) => `• ${p.title} — ₹${p.price}`).join("\n");
    const msg = encodeURIComponent(
      `Hello XREVISE! I'd like to order these posters:\n\n${lines}\n\nTotal: ₹${cartTotal}\n\nPlease confirm and share delivery details.`
    );
    window.open(`https://wa.me/918446036521?text=${msg}`, "_blank");
  };

  return (
    <MainLayout>
      {/* ── Cart Sidebar ───────────────────────────────────────────── */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" /> Cart ({cart.length})
              </h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-16">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl border border-secondaryDark">
                    <div
                      className="w-14 h-14 rounded-lg overflow-hidden shrink-0 select-none"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        draggable="false"
                        className="w-full h-full object-cover"
                        style={{ pointerEvents: "none" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{item.title}</p>
                      <p className="text-primary font-bold text-sm mt-0.5">₹{item.price}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-2xl font-bold text-navy">₹{cartTotal}</span>
                </div>
                <button
                  onClick={handleCartWhatsApp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> Order via WhatsApp
                </button>
                <p className="text-xs text-center text-gray-400">Confirm & deliver within 24 hrs</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Detail Modal ───────────────────────────────────────────── */}
      {selected && <PosterModal poster={selected} onClose={() => setSelected(null)} />}

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-navy to-navyLight pt-36 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="bg-primary/20 text-accent text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-block border border-primary/30">
            Medical Study Materials
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Medical Poster Store
          </h1>
          <p className="text-white/70 text-xl max-w-xl mx-auto mb-8">
            High-yield visual posters for NEET PG, INI-CET & FMGE. Designed by expert faculty.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["📦 Fast Delivery", "🎨 Expert Designed", "🔒 Copyright Protected"].map((t) => (
              <span key={t} className="bg-white/10 border border-white/20 text-white/80 px-4 py-2 rounded-full text-sm font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky toolbar ─────────────────────────────────────────── */}
      <div className="sticky top-24 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            {loading ? "Loading…" : `${posters.length} poster${posters.length !== 1 ? "s" : ""} available`}
          </p>
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primaryDark transition-colors shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Poster Grid ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="bg-gray-200 aspect-[3/4]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posters.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No posters available yet</h3>
            <p className="text-sm">Check back soon — new study materials are being added.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posters.map((poster) => {
              const discount = poster.original_price
                ? Math.round((1 - poster.price / poster.original_price) * 100)
                : 0;
              const inCart = cart.some((p) => p.id === poster.id);

              return (
                <div
                  key={poster.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-secondaryDark transition-all duration-300 overflow-hidden group flex flex-col"
                >
                  {/* Protected thumbnail */}
                  <div
                    className="relative aspect-[3/4] cursor-pointer overflow-hidden"
                    onClick={() => setSelected(poster)}
                  >
                    <ProtectedImage src={poster.image_url} alt={poster.title} className="w-full h-full" />
                    {/* Hover zoom hint */}
                    <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/30 transition-all duration-300 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 text-navy text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                        <ZoomIn size={13} /> View Details
                      </div>
                    </div>
                    {discount > 0 && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Card info */}
                  <div className="p-4 flex flex-col flex-1">
                    {poster.subject && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-secondary px-2.5 py-0.5 rounded-full mb-2 w-fit">
                        <Tag size={10} /> {poster.subject}
                      </span>
                    )}
                    <h3
                      className="font-bold text-gray-900 text-sm leading-snug mb-1.5 cursor-pointer hover:text-primary transition-colors line-clamp-2"
                      onClick={() => setSelected(poster)}
                    >
                      {poster.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
                      {poster.description}
                    </p>

                    {/* Price row */}
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-xl font-extrabold text-navy">₹{poster.price}</span>
                      {poster.original_price && (
                        <span className="text-sm text-gray-400 line-through mb-0.5">₹{poster.original_price}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelected(poster)}
                        className="flex-1 border border-primary text-primary py-2 rounded-lg font-semibold text-sm hover:bg-secondary transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => inCart ? setShowCart(true) : addToCart(poster)}
                        className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 ${
                          inCart
                            ? "bg-secondaryMiddle text-primary border border-secondaryDark"
                            : "bg-primary hover:bg-primaryDark text-white shadow-sm"
                        }`}
                      >
                        <ShoppingCart size={14} />
                        {inCart ? "In Cart" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Bottom CTA ─────────────────────────────────────────── */}
        {!loading && posters.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-navy to-primaryDeep rounded-2xl p-10 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-3">Need a Custom Poster?</h3>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              Contact us on WhatsApp for bulk orders, custom subject posters, or faculty recommendations.
            </p>
            <a
              href="https://wa.me/918446036521"
              target="_blank"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </a>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
