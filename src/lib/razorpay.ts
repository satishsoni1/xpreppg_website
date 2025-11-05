export function loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
        const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existing) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export type RazorpayOptions = {
    key: string; // VITE_RAZORPAY_KEY_ID
    amount: number; // in paise
    currency?: string; // default INR
    name?: string;
    description?: string;
    image?: string;
    order_id?: string; // (not used in lightweight flow)
    handler: (response: any) => void;
    prefill?: { name?: string; email?: string; contact?: string };
    notes?: Record<string, string>;
    theme?: { color?: string };
};

export async function openRazorpay(options: RazorpayOptions) {
    const ok = await loadRazorpay();
    if (!ok) throw new Error("Razorpay SDK failed to load");
    // @ts-ignore
    const rzp = new window.Razorpay({
        currency: "INR",
        ...options,
    });
    rzp.open();
}