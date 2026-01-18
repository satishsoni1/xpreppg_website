type Props = {
    form: {
      amount: number;
    };
    discountCode: string;
    setDiscountCode: (v: string) => void;
    couponLoading: boolean;
    couponError: string;
    couponSuccess: string;
    discountApplied: number;
    finalAmount: number;
    applyCoupon: () => void;
    removeCoupon: () => void;
  };
  
  export default function CouponSection({
    form,
    discountCode,
    setDiscountCode,
    couponLoading,
    couponError,
    couponSuccess,
    discountApplied,
    finalAmount,
    applyCoupon,
    removeCoupon,
  }: Props) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border shadow-sm">
        <label className="text-sm font-semibold text-gray-800">
          Have a Coupon?
        </label>
  
        {/* INPUT + ACTION */}
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className={`w-full rounded-xl border p-3 pr-10 transition-all
                ${
                  couponError
                    ? "border-red-400"
                    : couponSuccess
                    ? "border-emerald-500"
                    : "border-gray-300"
                }`}
              disabled={discountApplied > 0}
            />
  
            {couponLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
              </div>
            )}
          </div>
  
          {discountApplied === 0 ? (
            <button
              type="button"
              onClick={applyCoupon}
              disabled={couponLoading}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
              Apply
            </button>
          ) : (
            <button
              type="button"
              onClick={removeCoupon}
              className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:opacity-90"
            >
              Remove
            </button>
          )}
        </div>
  
        {/* ERROR */}
        {couponError && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            ❌ {couponError}
          </p>
        )}
  
        {/* SUCCESS */}
        {couponSuccess && (
          <p className="mt-2 text-sm text-primary font-semibold">
            🎉 {couponSuccess}
          </p>
        )}
  
        {/* PRICE BREAKUP */}
        {discountApplied > 0 && (
          <div className="mt-5 bg-white rounded-xl border p-4 shadow-sm space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Original Amount</span>
              <span>₹{form.amount}</span>
            </div>
  
            <div className="flex justify-between text-primary font-semibold">
              <span>Discount</span>
              <span>- ₹{discountApplied}</span>
            </div>
  
            <hr />
  
            <div className="flex justify-between text-lg font-bold">
              <span>Final Amount</span>
              <span className="text-emerald-700">₹{finalAmount}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  