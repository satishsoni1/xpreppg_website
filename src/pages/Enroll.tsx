import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import { PlansAPI, WebAPI, CouponAPI, PaymentAPI } from "@/services/api";
import { openRazorpay } from "@/lib/razorpay";

import PlanSelector from "@/components/enroll/PlanSelector";
import ExamDateSelector from "@/components/enroll/ExamDateSelector";
import UserInfoSection from "@/components/enroll/UserInfoSection";
import CouponSection from "@/components/enroll/CouponSection";
import PlanSummary from "@/components/enroll/PlanSummary";

export default function Enroll() {
  const navigate = useNavigate();

  const mobile = localStorage.getItem("x_user_mobile");
  const name = localStorage.getItem("x_user_name");
  const email = localStorage.getItem("x_user_email");

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);

  const [form, setForm] = useState({
    fullName: name || "",
    email: email || "",
    phone: mobile || "",
    plan: "",
    exams: 0,
    amount: 0,
  });

  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------
     AUTH CHECK + USER LOAD
  ------------------------------------------------------- */
  useEffect(() => {
    if (!mobile || !name || !email) {
      alert("Please register first.");
      navigate("/");
      return;
    }

    WebAPI.getUser(mobile).then((res) => {
      if (res.data?.status) {
        const u = res.data.user;
        setForm((f) => ({
          ...f,
          fullName: u.name,
          email: u.email,
          phone: u.mobile,
        }));
      }
    });
  }, []);

  /* -------------------------------------------------------
     LOAD PLANS
  ------------------------------------------------------- */
  useEffect(() => {
    PlansAPI.list().then((res) => {
      if (res.data.status) setPlans(res.data.plans);
    });
  }, []);

  /* -------------------------------------------------------
     WHEN PLAN CHANGES
  ------------------------------------------------------- */
  useEffect(() => {
    if (!selectedPlan) return;

    setForm((f) => ({
      ...f,
      plan: "Individual",
      exams: selectedPlan.exams,
      amount: selectedPlan.sellingPrice,
    }));

    setSelectedExamIds([]);
    setDiscountCode("");
    setDiscountApplied(0);
    setFinalAmount(selectedPlan.sellingPrice);
    setCouponError("");
    setCouponSuccess("");
  }, [selectedPlan]);

  /* -------------------------------------------------------
     APPLY COUPON
  ------------------------------------------------------- */
  const applyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");

    if (!discountCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);

    try {
      const res = await CouponAPI.validate({
        code: discountCode,
        amount: form.amount,
        exams: form.exams,
      });

      if (!res.data.valid) {
        setCouponError("Invalid or expired coupon.");
        setCouponLoading(false);
        return;
      }

      let discount = 0;
      if (res.data.discountType === "percent") {
        discount = (form.amount * res.data.discountValue) / 100;
      } else {
        discount = res.data.discountValue;
      }

      if (discount > form.amount) discount = form.amount;

      setDiscountApplied(discount);
      setFinalAmount(form.amount - discount);
      setCouponSuccess(`Coupon applied! You saved ₹${discount}`);
    } catch {
      setCouponError("Unable to apply coupon.");
    }

    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setDiscountCode("");
    setDiscountApplied(0);
    setFinalAmount(form.amount);
    setCouponSuccess("Coupon removed.");
  };

  /* -------------------------------------------------------
     PAYMENT
  ------------------------------------------------------- */
  const payAndGenerate = async (e: any) => {
    e.preventDefault();

    if (selectedExamIds.length !== form.exams) {
      alert(`Please select ${form.exams} exam date(s).`);
      return;
    }

    setLoading(true);
    const invoiceId = String(Date.now());

    try {
      const orderRes = await PaymentAPI.createOrder({
        mobile: form.phone,
        plan: form.plan,
        exams: form.exams,
        examDates: selectedExamIds,
        amount: finalAmount,
        originalAmount: form.amount,
        discount: discountApplied,
        discountCode,
      });

      if (orderRes.data.free) {
        return navigate(
          `/invoice/${invoiceId}?${new URLSearchParams({
            name: form.fullName,
            email: form.email,
            phone: form.phone,
            plan: form.plan,
            exams: String(form.exams),
            amount: "0",
            invoiceId,
            paymentId: "FREE",
            status: "paid",
          })}`
        );
      }

      const { key, orderId, amount } = orderRes.data;

      await openRazorpay({
        key,
        order_id: orderId,
        amount: amount * 100,
        name: "XPrepPG",
        description: `${form.plan} – ${form.exams} Exam(s)`,
        handler: async (resp) => {
          const verifyRes = await PaymentAPI.verifyPayment({
            ...resp,
            mobile: form.phone,
            plan: form.plan,
            exams: form.exams,
            examDates: selectedExamIds,
            amount: finalAmount,
            discount: discountApplied,
            discountCode,
          });

          navigate(
            `/invoice/${invoiceId}?${new URLSearchParams({
              name: form.fullName,
              email: form.email,
              phone: form.phone,
              plan: form.plan,
              exams: String(form.exams),
              amount: String(finalAmount),
              invoiceId,
              paymentId: resp.razorpay_payment_id,
              status: verifyRes.data.status ? "paid" : "failed",
            })}`
          );
        },
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#10B981" },
      });
    } catch (err) {
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  return (
    <MainLayout>
      <section className="py-8 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 space-y-8">

          <header>
            <h1 className="text-3xl font-bold">Enroll for Grand CBT</h1>
            <p className="text-gray-600 mt-1">
              Select plan, choose exam dates, apply coupon & complete payment
            </p>
          </header>

          {/* STEP 1 */}
          <Step title="1. Your Details">
            <UserInfoSection form={form} />
          </Step>

          {/* STEP 2 */}
          <Step title="2. Select Plan">
            <PlanSelector
              plans={plans}
              selectedPlan={selectedPlan}
              onSelect={setSelectedPlan}
            />
          </Step>

          {/* STEP 3 */}
          {selectedPlan && (
            <Step title="3. Select Exam Dates">
              <ExamDateSelector
                max={selectedPlan.exams}
                selected={selectedExamIds}
                onChange={setSelectedExamIds}
              />
            </Step>
          )}

          {/* STEP 4 */}
          {selectedPlan &&
            selectedExamIds.length === selectedPlan.exams && (
              <>
                <Step title="4. Apply Coupon (Optional)">
                  <CouponSection
                    form={form}
                    discountCode={discountCode}
                    setDiscountCode={setDiscountCode}
                    couponLoading={couponLoading}
                    couponError={couponError}
                    couponSuccess={couponSuccess}
                    discountApplied={discountApplied}
                    finalAmount={finalAmount}
                    applyCoupon={applyCoupon}
                    removeCoupon={removeCoupon}
                  />
                </Step>

                <Step title="5. Summary & Payment">
                  <PlanSummary
                    exams={form.exams}
                    examDates={selectedExamIds}
                    amount={finalAmount}
                  />

                  <button
                    onClick={payAndGenerate}
                    disabled={loading}
                    className="mt-6 w-full md:w-auto px-8 py-4 rounded-xl bg-emerald-600 text-white font-bold hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Processing..." : "Pay & Generate Invoice"}
                  </button>
                </Step>
              </>
            )}
        </div>
      </section>
    </MainLayout>
  );
}

/* -------------------------------------------------------
   STEP WRAPPER
------------------------------------------------------- */
function Step({ title, children }: any) {
  return (
    <div className="border rounded-2xl p-6 bg-gray-50">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}
