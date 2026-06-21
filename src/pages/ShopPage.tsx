import { useState } from "react";
import {
  ShoppingCart, X, MessageCircle, Tag, ZoomIn,
  ShieldCheck, Lock, Package, ChevronRight, CreditCard, Loader2, CheckCircle2, Percent,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { POSTER_PACKAGES, PosterPackage } from "@/data/posterPackages";
import ImageSlider from "@/components/ImageSlider";
import { API_BASE_URL } from "@/config";
import { loadRazorpay } from "@/lib/razorpay";

const SHIPPING = 150;

// ── Image copy-protection ──────────────────────────────────────────────────────
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

// ── Checkout Modal ─────────────────────────────────────────────────────────────
interface ShipForm {
  name: string; email: string; mobile: string;
  address: string; city: string; state: string; pincode: string;
}

function CheckoutModal({ cart, onClose }: { cart: PosterPackage[]; onClose: () => void }) {
  const subtotal = cart.reduce((s, p) => s + p.price, 0);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ship, setShip] = useState<ShipForm>({
    name: "", email: "", mobile: "", address: "", city: "", state: "", pincode: "",
  });

  const grandTotal = Math.max(0, subtotal + SHIPPING - discount);

  const handleShipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setShip(p => ({ ...p, [e.target.name]: e.target.value }));

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true); setPromoMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/poster-orders/validate-promo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setPromoMsg(`✓ ${data.message} — ₹${data.discount} off`);
      } else {
        setDiscount(0);
        setPromoMsg(data.message || "Invalid code");
      }
    } catch { setPromoMsg("Failed to validate. Try again."); }
    finally { setPromoLoading(false); }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingOut(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) { alert("Failed to load payment gateway. Please try again."); return; }

      const createRes = await fetch(`${API_BASE_URL}/poster-orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ship,
          items: cart.map(p => ({ id: p.id, title: p.title, price: p.price })),
          promo_code: promoCode || null,
          discount,
        }),
      });
      const order = await createRes.json();
      if (!order.status) { alert(order.message || "Order creation failed"); return; }

      // @ts-ignore
      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "XPrepPG Poster Store",
        description: `${cart.length} poster(s)`,
        order_id: order.order_id,
        prefill: { name: ship.name, email: ship.email, contact: ship.mobile },
        theme: { color: "#22c55e" },
        handler: async (response: any) => {
          const verifyRes = await fetch(`${API_BASE_URL}/poster-orders/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, db_order_id: order.db_order_id }),
          });
          const verify = await verifyRes.json();
          if (verify.status) {
            setSuccess(true);
          } else {
            alert("Payment verification failed. Contact support with payment ID: " + response.razorpay_payment_id);
          }
        },
      });
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <CreditCard size={20} className="text-primary" /> Checkout
          </h2>
          <button onClick={onClose}><X size={22} className="text-gray-400 hover:text-gray-700" /></button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-16 text-center px-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-navy mb-2">Order Confirmed!</h3>
            <p className="text-gray-600 mb-2">Thank you for your purchase. We'll deliver your posters within 5–7 business days.</p>
            <p className="text-sm text-gray-400">You'll receive a confirmation on your WhatsApp/email.</p>
            <button onClick={onClose} className="mt-8 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primaryDark transition">
              Continue Shopping
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="p-5 space-y-5">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Summary</p>
              {cart.map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-gray-700 line-clamp-1">{p.title}</span>
                  <span className="font-semibold text-navy shrink-0">₹{p.price}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>₹{SHIPPING}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Promo Discount</span><span>-₹{discount}</span></div>}
                <div className="flex justify-between font-bold text-navy text-base pt-1"><span>Total</span><span>₹{grandTotal}</span></div>
              </div>
            </div>

            {/* Promo Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button type="button" onClick={applyPromo} disabled={promoLoading}
                  className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primaryDark transition disabled:opacity-60 flex items-center gap-1.5">
                  {promoLoading ? <Loader2 size={14} className="animate-spin" /> : <Percent size={14} />} Apply
                </button>
              </div>
              {promoMsg && <p className={`text-xs mt-1.5 font-medium ${discount > 0 ? "text-green-600" : "text-red-500"}`}>{promoMsg}</p>}
            </div>

            {/* Shipping Details */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Shipping Address</p>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Full Name *</label>
                    <input required name="name" value={ship.name} onChange={handleShipChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Dr. Ravi Sharma" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mobile *</label>
                    <input required name="mobile" value={ship.mobile} onChange={handleShipChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="10-digit number" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email (optional)</label>
                  <input type="email" name="email" value={ship.email} onChange={handleShipChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="for order updates" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full Address *</label>
                  <textarea required name="address" value={ship.address} onChange={e => setShip(p => ({ ...p, address: e.target.value }))}
                    rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Flat/House No., Street, Locality" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">City *</label>
                    <input required name="city" value={ship.city} onChange={handleShipChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">State *</label>
                    <input required name="state" value={ship.state} onChange={handleShipChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Maharashtra" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Pincode *</label>
                    <input required name="pincode" value={ship.pincode} onChange={handleShipChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="400001" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={checkingOut}
              className="w-full bg-gradient-to-r from-primary to-primaryDark text-white py-4 rounded-xl font-bold text-base hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {checkingOut ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
              {checkingOut ? "Initiating Payment…" : `Pay ₹${grandTotal} via Razorpay`}
            </button>
            <p className="text-center text-xs text-gray-400">Secured by Razorpay · 256-bit SSL</p>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Poster detail modal ───────────────────────────────────────────────────────
function PosterModal({ poster, onClose, onAdd, inCart }: {
  poster: PosterPackage; onClose: () => void;
  onAdd: (p: PosterPackage) => void; inCart: boolean;
}) {
  const discount = poster.original_price
    ? Math.round((1 - poster.price / poster.original_price) * 100) : 0;
  const tags = poster.tags ? poster.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  const handleWhatsApp = () => {
    const total = poster.price + SHIPPING;
    const msg = encodeURIComponent(
      `Hello XREVISE! I'd like to purchase:\n\n📌 *${poster.title}*\nSubject: ${poster.subject}\nPrice: ₹${poster.price}\n🚚 Flat Delivery: ₹${SHIPPING}\n💰 Total Payable: ₹${total}\n\nPlease confirm my order and share delivery/payment details.`
    );
    window.open(`https://wa.me/919370100887?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
        <div className="md:w-5/12 bg-navy shrink-0 min-h-[14rem] md:min-h-0">
          <ImageSlider
            images={[poster.image_url, ...(poster.image_url2 ? [poster.image_url2] : [])]}
            alt={poster.title}
            className="w-full h-56 md:h-full"
            intervalMs={2500}
          />
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
function CartSidebar({ cart, onRemove, onClose, onCheckout, onWhatsApp }: {
  cart: PosterPackage[]; onRemove: (id: number) => void;
  onClose: () => void; onCheckout: () => void; onWhatsApp: () => void;
}) {
  const subtotal = cart.reduce((s, p) => s + p.price, 0);
  const grandTotal = subtotal + SHIPPING;

  const bySubject = cart.reduce<Record<string, PosterPackage[]>>((acc, p) => {
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
              <p className="text-xs mt-1">Add packs from the list below</p>
            </div>
          ) : (
            Object.entries(bySubject).map(([subject, packs]) => (
              <div key={subject}>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Tag size={10} /> {subject} ({packs.length})
                </p>
                <div className="space-y-2">
                  {packs.map(item => (
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
                <span>Subtotal:</span><span className="font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Flat Delivery Charge:</span><span className="font-bold">₹{SHIPPING}</span>
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
            <button
              onClick={() => { onClose(); onCheckout(); }}
              className="w-full bg-gradient-to-r from-primary to-primaryDark text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard className="w-5 h-5" /> Proceed to Checkout
            </button>
            <button onClick={onWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-sm">
              <MessageCircle className="w-4 h-4" /> Order via WhatsApp instead
            </button>
            <p className="text-center text-[10px] text-gray-400">Secured Razorpay checkout · Fast delivery</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 px-3 py-1 bg-gray-100 rounded-full">{label}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

// ── Main ShopPage ─────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [selected, setSelected] = useState<PosterPackage | null>(null);
  const [cart, setCart] = useState<PosterPackage[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const addToCart = (p: PosterPackage) => setCart(prev => prev.some(c => c.id === p.id) ? prev : [...prev, p]);
  const removeFromCart = (id: number) => setCart(prev => prev.filter(p => p.id !== id));

  const handleWhatsApp = () => {
    const lines = cart.map(p => `• ${p.title} (${p.posterCount}) — ₹${p.price}`).join("\n");
    const subtotal = cart.reduce((s, p) => s + p.price, 0);
    const total = subtotal + SHIPPING;
    const msg = encodeURIComponent(
      `Hello XREVISE! I'd like to order this poster bundle:\n\n${lines}\n\n-------------------------\n📊 Subtotal: ₹${subtotal}\n🚚 Flat Delivery: ₹${SHIPPING}\n💰 Total Payable: ₹${total}\n-------------------------\n\nPlease confirm my order and share delivery/payment details.`
    );
    window.open(`https://wa.me/919370100887?text=${msg}`, "_blank");
  };

  const shortCombo = POSTER_PACKAGES.filter(p => p.subject === "Short Subject Combo");
  const mediumCombos = POSTER_PACKAGES.filter(p => p.subject === "Medium Subject Combo");
  const longPacks = POSTER_PACKAGES.filter(p => p.subject === "Long Subject Pack");

  return (
    <MainLayout>
      {selected && (
        <PosterModal
          poster={selected} onClose={() => setSelected(null)}
          onAdd={addToCart} inCart={cart.some(c => c.id === selected.id)}
        />
      )}
      {showCart && (
        <CartSidebar
          cart={cart} onRemove={removeFromCart}
          onClose={() => setShowCart(false)}
          onCheckout={() => setShowCheckout(true)}
          onWhatsApp={handleWhatsApp}
        />
      )}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          onClose={() => { setShowCheckout(false); if (cart.length > 0) setShowCart(true); }}
        />
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
                High-yield visual posters for NEET PG, INI-CET & FMGE. Choose your combo or pack, order in minutes.
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

      {/* ── Delivery banner ───────────────────────────────────── */}
      <div className="bg-yellow-50 border-b border-yellow-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="text-sm text-gray-700 font-medium">
            <span className="text-yellow-600 font-bold">✨ Flat ₹150 delivery charge</span> — pay online via Razorpay or order via WhatsApp!
          </p>
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primaryDark transition-colors shadow-md shrink-0 self-start md:self-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            Bundle Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Bundle prompt bar ─────────────────────────────────── */}
      {cart.length >= 1 && (
        <div
          onClick={() => setShowCart(true)}
          className="bg-gradient-to-r from-primary to-primaryDark text-white px-4 py-3 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">{cart.length} item{cart.length > 1 ? "s" : ""} in your bundle</p>
                <p className="text-white/70 text-xs">Total ₹{cart.reduce((s, p) => s + p.price, 0)} + ₹150 delivery · Tap to review & checkout</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 shrink-0" />
          </div>
        </div>
      )}

      {/* ── Products ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

        {shortCombo.length > 0 && (
          <div>
            <SectionLabel label="Short Subject Combo" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shortCombo.map(pack => <PackCard key={pack.id} pack={pack} cart={cart} onSelect={setSelected} onAdd={addToCart} onShowCart={() => setShowCart(true)} />)}
            </div>
          </div>
        )}

        {mediumCombos.length > 0 && (
          <div>
            <SectionLabel label="Medium Subject Combos" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediumCombos.map(pack => <PackCard key={pack.id} pack={pack} cart={cart} onSelect={setSelected} onAdd={addToCart} onShowCart={() => setShowCart(true)} />)}
            </div>
          </div>
        )}

        {longPacks.length > 0 && (
          <div>
            <SectionLabel label="Long Subject Packs" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {longPacks.map(pack => <PackCard key={pack.id} pack={pack} cart={cart} onSelect={setSelected} onAdd={addToCart} onShowCart={() => setShowCart(true)} />)}
            </div>
          </div>
        )}

        <div className="mt-6 bg-gradient-to-r from-navy to-navyLight rounded-2xl p-10 text-center shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-2">Want a Custom Bundle?</h3>
          <p className="text-white/70 mb-6 max-w-lg mx-auto">Contact us for bulk orders, institution packs, or specific subject combinations.</p>
          <a href="https://wa.me/919370100887" target="_blank" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg">
            <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </MainLayout>
  );
}

// ── Pack card ─────────────────────────────────────────────────────────────────
function PackCard({ pack, cart, onSelect, onAdd, onShowCart }: {
  pack: PosterPackage;
  cart: PosterPackage[];
  onSelect: (p: PosterPackage) => void;
  onAdd: (p: PosterPackage) => void;
  onShowCart: () => void;
}) {
  const discount = pack.original_price ? Math.round((1 - pack.price / pack.original_price) * 100) : 0;
  const inCart = cart.some(c => c.id === pack.id);

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-xl hover:border-secondaryDark transition-all duration-300 overflow-hidden group flex flex-col">
      <div className="relative aspect-[4/3] cursor-pointer overflow-hidden" onClick={() => onSelect(pack)}>
        <ImageSlider
          images={[pack.image_url, ...(pack.image_url2 ? [pack.image_url2] : [])]}
          alt={pack.title}
          className="w-full h-full"
          intervalMs={3000}
        />
        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/25 transition-all duration-300 flex items-center justify-center pointer-events-none z-40">
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
        <h3
          className="font-bold text-gray-900 text-base leading-snug mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-2"
          onClick={() => onSelect(pack)}
        >
          {pack.title}
        </h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1 line-clamp-2">{pack.description}</p>

        <div className="flex items-end justify-between pt-3 border-t border-gray-100 mt-auto">
          <div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-extrabold text-navy">₹{pack.price}</span>
              {pack.original_price && <span className="text-xs text-gray-400 line-through mb-0.5">₹{pack.original_price}</span>}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">+ ₹150 Delivery · {pack.posterCount}</p>
          </div>
          <button
            onClick={() => inCart ? onShowCart() : onAdd(pack)}
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
}
