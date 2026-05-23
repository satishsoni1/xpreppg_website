import { useState } from "react";
import { ShoppingCart, Star, Package, Layers, X, CheckCircle, Phone, MessageCircle } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

type Category = "all" | "posters" | "flashcards";

interface Product {
  id: number;
  name: string;
  category: "posters" | "flashcards";
  subject: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  highlights: string[];
  tag: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Anatomy High-Yield Poster Set",
    category: "posters",
    subject: "Anatomy",
    price: 299,
    originalPrice: 499,
    rating: 4.9,
    reviews: 128,
    badge: "Best Seller",
    description: "Comprehensive A2-size colour coded poster covering all major anatomical regions — ideal for quick visual revision.",
    highlights: ["A2 size, laminated", "Colour-coded diagrams", "High-yield NEET topics", "Covers 8 regions"],
    tag: "Anatomy",
  },
  {
    id: 2,
    name: "Physiology Concept Poster",
    category: "posters",
    subject: "Physiology",
    price: 249,
    originalPrice: 399,
    rating: 4.7,
    reviews: 86,
    description: "Visual summary of all key physiology concepts — heart, kidney, neuro, and more in a single poster.",
    highlights: ["A2 laminated poster", "All organ systems", "Mnemonics included", "NEET PG pattern"],
    tag: "Physiology",
  },
  {
    id: 3,
    name: "Pharmacology Drug Chart Poster",
    category: "posters",
    subject: "Pharmacology",
    price: 349,
    originalPrice: 549,
    rating: 4.8,
    reviews: 105,
    badge: "New",
    description: "Drug classification, MOA, side effects, and high-yield drug facts in a compact visual chart format.",
    highlights: ["Drug classes & MOA", "Side effects chart", "High-yield facts", "USMLE + NEET PG"],
    tag: "Pharmacology",
  },
  {
    id: 4,
    name: "Pathology Rapid Revision Poster",
    category: "posters",
    subject: "Pathology",
    price: 299,
    originalPrice: 449,
    rating: 4.6,
    reviews: 74,
    description: "Covers neoplasia, inflammation, cell injury, and high-yield pathology topics with diagrams.",
    highlights: ["Cell injury & neoplasia", "Lab values included", "Visual flowcharts", "Exam-ready format"],
    tag: "Pathology",
  },
  {
    id: 5,
    name: "Biochemistry Metabolic Pathways Poster",
    category: "posters",
    subject: "Biochemistry",
    price: 329,
    originalPrice: 499,
    rating: 4.8,
    reviews: 93,
    badge: "Popular",
    description: "All major metabolic pathways — glycolysis, TCA, fatty acid metabolism — in a single A2 visual map.",
    highlights: ["Glycolysis & TCA cycle", "Amino acid metabolism", "Enzyme deficiencies", "A2 laminated"],
    tag: "Biochemistry",
  },
  {
    id: 6,
    name: "NEET PG Anatomy Flashcard Set (100 cards)",
    category: "flashcards",
    subject: "Anatomy",
    price: 399,
    originalPrice: 649,
    rating: 4.9,
    reviews: 212,
    badge: "Best Seller",
    description: "100 pocket-sized flashcards with diagrams on front and answers with explanations on back — perfect for daily revision.",
    highlights: ["100 premium cards", "Diagram + answer format", "Pocket-sized", "Spaced repetition ready"],
    tag: "Anatomy",
  },
  {
    id: 7,
    name: "Physiology Flashcard Set (80 cards)",
    category: "flashcards",
    subject: "Physiology",
    price: 349,
    originalPrice: 549,
    rating: 4.7,
    reviews: 156,
    description: "80 high-yield physiology Q&A flashcards covering all systems — heart, lung, kidney, GI, neuro.",
    highlights: ["80 cards", "Q&A format", "Color-coded by system", "NEET PG focused"],
    tag: "Physiology",
  },
  {
    id: 8,
    name: "Pharmacology Drug Flashcard Set (120 cards)",
    category: "flashcards",
    subject: "Pharmacology",
    price: 449,
    originalPrice: 699,
    rating: 4.8,
    reviews: 178,
    badge: "New",
    description: "120 drug flashcards — each card has drug name, class, MOA, and key side effects for rapid memorisation.",
    highlights: ["120 drug cards", "MOA + side effects", "Drug of choice cards", "Pocket sized"],
    tag: "Pharmacology",
  },
  {
    id: 9,
    name: "Complete NEET PG Flashcard Mega Pack",
    category: "flashcards",
    subject: "All Subjects",
    price: 999,
    originalPrice: 1999,
    rating: 5.0,
    reviews: 64,
    badge: "Best Value",
    description: "The ultimate flashcard pack — 500+ cards across all 19 NEET PG subjects, curated by our expert faculty.",
    highlights: ["500+ cards", "All 19 subjects", "Expert curated", "Perfect for last-minute revision"],
    tag: "All Subjects",
  },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const filtered = products.filter(p =>
    activeCategory === "all" ? true : p.category === activeCategory
  );

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  };

  const handleWhatsAppOrder = () => {
    const itemList = cart.map(i => `• ${i.product.name} x${i.qty} = ₹${i.product.price * i.qty}`).join("\n");
    const msg = encodeURIComponent(`Hello XprepPG! I'd like to order:\n\n${itemList}\n\nTotal: ₹${cartTotal}\n\nPlease confirm my order.`);
    window.open(`https://wa.me/918446036521?text=${msg}`, "_blank");
  };

  return (
    <MainLayout>
      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" /> Your Cart ({cartCount})
              </h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex items-start gap-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
                    <div className="bg-sky-200 rounded-lg w-12 h-12 flex items-center justify-center shrink-0">
                      {item.product.category === "posters" ? (
                        <Layers className="w-6 h-6 text-primaryDark" />
                      ) : (
                        <Package className="w-6 h-6 text-primaryDark" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{item.product.name}</p>
                      <p className="text-primary font-bold mt-1">₹{item.product.price} × {item.qty}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-2xl font-bold text-gray-900">₹{cartTotal}</span>
                </div>
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Order via WhatsApp
                </button>
                <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3" />
                  We'll confirm & arrange delivery
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary to-primaryDeep pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-block">
            Study Materials
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            NEET PG Study Material Shop
          </h1>
          <p className="text-sky-100 text-xl max-w-2xl mx-auto mb-8">
            Expert-designed posters and flashcards for every NEET PG subject. Quick delivery, premium quality.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-white/15 text-white px-4 py-2 rounded-full text-sm font-medium">
              📦 Free Delivery on ₹999+
            </div>
            <div className="bg-white/15 text-white px-4 py-2 rounded-full text-sm font-medium">
              ✅ Expert Faculty Curated
            </div>
            <div className="bg-white/15 text-white px-4 py-2 rounded-full text-sm font-medium">
              🚀 Ships in 2-3 Days
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Cart Button + Filter Bar */}
      <div className="sticky top-24 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Category Filter */}
          <div className="flex gap-2">
            {(["all", "posters", "flashcards"] as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-sky-50 hover:text-primary"
                }`}
              >
                {cat === "all" ? "All Products" : cat === "posters" ? "📌 Posters" : "🃏 Flashcards"}
              </button>
            ))}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primaryDark transition-colors shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {orderPlaced && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700">
            <CheckCircle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold">Order Sent via WhatsApp!</p>
              <p className="text-sm">Our team will confirm and arrange delivery within 24 hours.</p>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300 overflow-hidden group"
            >
              {/* Product Visual */}
              <div className="relative bg-gradient-to-br from-sky-50 to-secondaryMiddle p-8 flex items-center justify-center h-44">
                {product.badge && (
                  <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${
                    product.badge === "Best Seller" ? "bg-orange-100 text-orange-700" :
                    product.badge === "New" ? "bg-green-100 text-green-700" :
                    product.badge === "Best Value" ? "bg-primary text-white" :
                    "bg-sky-100 text-primary"
                  }`}>
                    {product.badge}
                  </span>
                )}
                <div className="text-center">
                  {product.category === "posters" ? (
                    <Layers className="w-16 h-16 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Package className="w-16 h-16 text-primaryDark mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-xs font-semibold text-primary bg-white/80 px-3 py-1 rounded-full">
                    {product.tag}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-base leading-tight flex-1">{product.name}</h3>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({product.reviews} reviews)</span>
                </div>

                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{product.description}</p>

                {/* Highlights */}
                <ul className="space-y-1.5 mb-5">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Price + Cart */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-400 line-through ml-2">₹{product.originalPrice}</span>
                    <span className="ml-2 text-xs font-bold text-green-600">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primaryDark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm hover:shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-sky-50 to-secondaryMiddle rounded-2xl p-10 text-center border border-sky-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Need Help Choosing?</h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Our team is available on WhatsApp to help you pick the right study materials based on your syllabus and exam date.
          </p>
          <a
            href="https://wa.me/918446036521"
            target="_blank"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Us on WhatsApp
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
