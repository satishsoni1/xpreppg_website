import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import {
  BookOpen, CheckCircle, Tag, Loader2, ShoppingCart,
  AlertCircle, IndianRupee, Percent, Trophy, RotateCcw, Clock, Layers,
} from "lucide-react";

declare global { interface Window { Razorpay: any } }

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const ALL_PHASES = [1, 2, 3, 4];

export default function XReviseEnroll() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("student_user") || "{}");

  const [plans, setPlans]     = useState<any[]>([]);
  const [phases, setPhases]   = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<"plans" | "history">("plans");

  // Purchase state
  const [selected, setSelected]           = useState<any | null>(null);
  const [selectedPhases, setSelectedPhases] = useState<number[]>([]);
  const [coupon, setCoupon]               = useState("");
  const [couponResult, setCouponResult]   = useState<{ valid?: boolean; discountValue?: number; message?: string } | null>(null);
  const [validating, setValidating]       = useState(false);
  const [paying, setPaying]               = useState(false);
  const [payError, setPayError]           = useState("");
  const [success, setSuccess]             = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [pr, phr, hr] = await Promise.all([
      StudentAPI.xrevisePublic.getPlans(),
      StudentAPI.xrevisePublic.getPhases(),
      StudentAPI.xrevisePurchase.getHistory(),
    ]);
    if (pr.status)  setPlans(pr.plans || []);
    if (phr.status) setPhases(phr.phases || []);
    if (hr.status)  setHistory(hr.orders || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const phasesMap = phases.reduce((acc: Record<number, any>, p) => { acc[p.phase] = p; return acc; }, {});

  const selectPlan = (plan: any) => {
    setSelected(plan);
    setSelectedPhases([]);
    setCoupon("");
    setCouponResult(null);
    setPayError("");
    setSuccess(false);
  };

  const phasesAllowed = selected?.phases_allowed ?? 1;

  const togglePhase = (ph: number) => {
    setSelectedPhases(prev => {
      if (prev.includes(ph)) return prev.filter(p => p !== ph);
      if (prev.length >= phasesAllowed) {
        // replace last if single-select (basic), otherwise ignore if at max
        if (phasesAllowed === 1) return [ph];
        return prev;
      }
      return [...prev, ph];
    });
  };

  const phaseSelectionComplete = selected && selectedPhases.length === phasesAllowed;

  const handleValidateCoupon = async () => {
    if (!coupon.trim() || !selected) return;
    setValidating(true);
    setCouponResult(null);
    const r = await StudentAPI.xrevisePublic.validateCoupon({
      code: coupon.trim(),
      amount: parseFloat(selected.selling_price),
      plan_id: selected.id,
    });
    setCouponResult(r);
    setValidating(false);
  };

  const finalAmount = () => {
    if (!selected) return 0;
    const base = parseFloat(selected.selling_price);
    const disc = couponResult?.valid && couponResult.discountValue ? couponResult.discountValue : 0;
    return Math.max(0, base - disc);
  };

  const handlePay = async () => {
    if (!selected || !phaseSelectionComplete) return;
    setPayError("");
    setPaying(true);

    const ok = await loadRazorpay();
    if (!ok) { setPayError("Payment gateway failed to load. Please try again."); setPaying(false); return; }

    const amt = finalAmount();
    const r = await StudentAPI.xrevisePurchase.createOrder({
      plan_id: selected.id,
      amount: amt,
      original_amount: parseFloat(selected.selling_price),
      coupon_code: couponResult?.valid ? coupon.trim() : undefined,
      discount_amount: couponResult?.valid ? couponResult.discountValue : 0,
      selected_phases: selectedPhases,
    } as any);

    if (!r.status) { setPayError(r.message || "Order creation failed"); setPaying(false); return; }

    const rzp = new window.Razorpay({
      key: r.key,
      amount: Math.round(amt * 100),
      currency: "INR",
      name: "XRevise",
      description: selected.name,
      order_id: r.orderId,
      prefill: { name: user.name || "", email: user.email || "", contact: user.mobile || "" },
      theme: { color: "#059669" },
      handler: async (resp: any) => {
        const vr = await StudentAPI.xrevisePurchase.verifyPayment({
          razorpay_order_id: resp.razorpay_order_id,
          razorpay_payment_id: resp.razorpay_payment_id,
          razorpay_signature: resp.razorpay_signature,
        });
        setPaying(false);
        if (vr.status) {
          setSuccess(true);
          setSelected(null);
          setSelectedPhases([]);
          setCoupon("");
          setCouponResult(null);
          load();
        } else {
          setPayError(vr.message || "Payment verification failed");
        }
      },
      modal: { ondismiss: () => setPaying(false) },
    });
    rzp.open();
  };

  // Group plans by plan_type
  const typeGroups = plans.reduce((acc: Record<string, any[]>, p) => {
    const t = p.plan_type || "basic";
    if (!acc[t]) acc[t] = [];
    acc[t].push(p);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <Loader2 className="animate-spin mr-2" /> Loading plans…
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 animate-fade-in">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
        <p className="text-emerald-100 text-sm">Enroll for XRevise</p>
        <p className="text-2xl font-bold mt-0.5">Choose Your Plan</p>
        <p className="text-emerald-100 text-sm mt-1">Access day-wise tests, full analysis, and rank tracking</p>
      </div>

      {/* Success banner */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <CheckCircle className="text-emerald-600 shrink-0" size={22} />
          <div>
            <p className="text-emerald-800 font-bold">Payment successful! You're enrolled.</p>
            <p className="text-emerald-600 text-sm">All tests in your selected phases are now accessible from your dashboard.</p>
          </div>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="ml-auto text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold shrink-0"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {(["plans", "history"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition ${
              tab === t ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "plans" ? "Available Plans" : `My Purchases${history.length > 0 ? ` (${history.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* Plans tab */}
      {tab === "plans" && (
        <div className="space-y-8">
          {plans.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-2xl text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No plans available yet</p>
              <p className="text-sm mt-1">Check back later for XRevise subscription plans</p>
            </div>
          ) : (
            (["basic", "advance"] as const).filter(t => typeGroups[t]?.length > 0).map(planType => {
              const ps = typeGroups[planType];
              const allowedCount = planType === "advance" ? 3 : 1;
              return (
                <div key={planType} className="space-y-4">
                  {/* Plan type header */}
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-xl font-bold text-sm ${
                      planType === "advance"
                        ? "bg-violet-100 text-violet-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {planType === "advance" ? "Advance Plan" : "Basic Plan"}
                    </div>
                    <p className="text-gray-500 text-sm">
                      Select any <strong>{allowedCount}</strong> phase{allowedCount > 1 ? "s" : ""} of your choice
                    </p>
                  </div>

                  {/* Plan cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ps.map((plan: any) => (
                      <button
                        key={plan.id}
                        onClick={() => selectPlan(plan)}
                        className={`text-left bg-white rounded-2xl border-2 p-5 transition hover:shadow-md ${
                          selected?.id === plan.id ? "border-emerald-500 shadow-md" : "border-gray-200 hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900">{plan.name}</h3>
                            {plan.description && <p className="text-gray-500 text-sm mt-0.5">{plan.description}</p>}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-2xl font-bold text-emerald-700">₹{Number(plan.selling_price).toLocaleString()}</p>
                            {plan.original_price && Number(plan.original_price) > Number(plan.selling_price) && (
                              <p className="text-gray-400 line-through text-sm">₹{Number(plan.original_price).toLocaleString()}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><BookOpen size={13} /> {plan.exams_count} tests</span>
                          <span className="flex items-center gap-1"><Clock size={13} /> {plan.duration_days} days</span>
                          <span className="flex items-center gap-1">
                            <Layers size={13} /> {plan.phases_allowed} phase{plan.phases_allowed > 1 ? "s" : ""}
                          </span>
                        </div>

                        {Array.isArray(plan.features) && plan.features.length > 0 && (
                          <ul className="space-y-1">
                            {plan.features.map((f: string, i: number) => (
                              <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                                <CheckCircle size={11} className="text-emerald-500 shrink-0" /> {f}
                              </li>
                            ))}
                          </ul>
                        )}

                        {selected?.id === plan.id && (
                          <div className="mt-3 flex items-center gap-1.5 text-emerald-700 text-sm font-semibold">
                            <CheckCircle size={14} /> Selected
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* Phase Picker — shown after plan selection */}
          {selected && (
            <div className="bg-white rounded-2xl border-2 border-emerald-100 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-emerald-600" />
                <h3 className="font-bold text-gray-900">
                  Select Phase{phasesAllowed > 1 ? "s" : ""}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({selectedPhases.length}/{phasesAllowed} selected)
                  </span>
                </h3>
              </div>
              <p className="text-sm text-gray-500">
                {phasesAllowed === 1
                  ? "Choose 1 phase — you'll get access to all tests in that phase."
                  : `Choose any ${phasesAllowed} phases — you'll get access to all tests in those phases.`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ALL_PHASES.map(ph => {
                  const info = phasesMap[ph];
                  const isChosen = selectedPhases.includes(ph);
                  const atMax = selectedPhases.length >= phasesAllowed && !isChosen;
                  return (
                    <button
                      key={ph}
                      onClick={() => togglePhase(ph)}
                      disabled={atMax}
                      className={`rounded-2xl border-2 p-4 text-left transition ${
                        isChosen
                          ? "border-emerald-500 bg-emerald-50"
                          : atMax
                          ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                          : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                        isChosen ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {ph}
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">Phase {ph}</p>
                      {info ? (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {info.exam_count} test{info.exam_count !== 1 ? "s" : ""}
                          {info.start_date && ` · from ${new Date(info.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5">Coming soon</p>
                      )}
                      {isChosen && (
                        <div className="mt-1.5 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                          <CheckCircle size={11} /> Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Checkout panel */}
          {phaseSelectionComplete && (
            <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-lg p-6 space-y-5 sticky bottom-4">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-emerald-600" />
                <h3 className="font-bold text-gray-900">Complete Purchase</h3>
              </div>

              <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-900">{selected.name}</p>
                  <p className="text-emerald-600 text-sm">
                    Phase{selectedPhases.length > 1 ? "s" : ""} {selectedPhases.sort((a, b) => a - b).join(", ")} · {selected.exams_count} tests
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-800">₹{Number(selected.selling_price).toLocaleString()}</p>
                </div>
              </div>

              {/* Coupon */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Tag size={13} className="inline mr-1" />Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono uppercase"
                    placeholder="Enter code"
                    value={coupon}
                    onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponResult(null); }}
                    onKeyDown={e => e.key === "Enter" && handleValidateCoupon()}
                  />
                  <button
                    onClick={handleValidateCoupon}
                    disabled={!coupon.trim() || validating}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                  >
                    {validating ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponResult && (
                  <div className={`mt-2 flex items-center gap-2 text-sm font-semibold ${couponResult.valid ? "text-emerald-600" : "text-red-500"}`}>
                    {couponResult.valid ? (
                      <><CheckCircle size={14} /> {couponResult.message} — saving ₹{couponResult.discountValue}</>
                    ) : (
                      <><AlertCircle size={14} /> {couponResult.message}</>
                    )}
                  </div>
                )}
              </div>

              {/* Price summary */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Plan price</span>
                  <span>₹{Number(selected.selling_price).toLocaleString()}</span>
                </div>
                {couponResult?.valid && couponResult.discountValue ? (
                  <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1"><Percent size={12} /> Coupon discount</span>
                    <span>-₹{couponResult.discountValue}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-emerald-700">₹{finalAmount().toLocaleString()}</span>
                </div>
              </div>

              {payError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm flex items-center gap-2">
                  <AlertCircle size={14} /> {payError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setSelected(null); setSelectedPhases([]); setCouponResult(null); setCoupon(""); }}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                >
                  {paying ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing…</>
                  ) : (
                    <><IndianRupee size={16} /> Pay ₹{finalAmount().toLocaleString()} &amp; Enroll</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-2xl text-gray-400">
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No purchases yet</p>
              <p className="text-sm mt-1">Your payment history will appear here</p>
            </div>
          ) : (
            history.map(order => {
              const phases = Array.isArray(order.phases_selected) && order.phases_selected.length > 0
                ? order.phases_selected
                : order.phase ? [order.phase] : [];
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-bold text-gray-900">{order.plan_name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Phase{phases.length > 1 ? "s" : ""} {phases.sort((a: number, b: number) => a - b).join(", ")} · {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      {order.coupon_code && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1.5">
                          <Tag size={10} /> {order.coupon_code} applied
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">₹{Number(order.amount).toLocaleString()}</p>
                      {order.discount_amount > 0 && (
                        <p className="text-xs text-emerald-600">Saved ₹{Number(order.discount_amount).toLocaleString()}</p>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                        <Trophy size={10} /> Paid
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div className="text-center">
            <button onClick={load} className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-emerald-600 font-medium">
              <RotateCcw size={14} /> Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
