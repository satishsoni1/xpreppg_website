import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi"; 
import { openRazorpay } from "@/lib/razorpay";

// Keep existing UI components
import PlanSelector from "@/components/enroll/PlanSelector";
import ExamDateSelector from "@/components/enroll/ExamDateSelector";
import CouponSection from "@/components/enroll/CouponSection";
import PlanSummary from "@/components/enroll/PlanSummary";

export default function StudentEnroll() {
  const navigate = useNavigate();

  // 1. GET LOGGED IN STUDENT DATA
  const [student, setStudent] = useState<any>(null);
  const [availableExams, setAvailableExams] = useState<any[]>([]);

  // Load User
  useEffect(() => {
    const storedUser = localStorage.getItem("student_user");
    if (!storedUser) {
      alert("Session expired. Please login.");
      navigate("/student/login");
      return;
    }
    setStudent(JSON.parse(storedUser));
  }, [navigate]);

  // Load Exams (Grand CBTs)
  useEffect(() => {
    StudentAPI.getExams()
      .then((data: any) => {
        setAvailableExams(Array.isArray(data) ? data : []);
      })
      .catch((err: any) => console.error("Failed to load exams", err));
  }, []);

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
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
     INIT USER FORM
  ------------------------------------------------------- */
  useEffect(() => {
    if (student) {
      setForm((prev) => ({
        ...prev,
        fullName: student.name || "",
        email: student.email || "",
        phone: student.mobile || "",
      }));
    }
  }, [student]);

  /* -------------------------------------------------------
     LOAD PLANS
  ------------------------------------------------------- */
  useEffect(() => {
    StudentAPI.getPlans()
      .then((res: any) => {
        const data = res.plans || res.data || [];
        setPlans(Array.isArray(data) ? data : []);
      })
      .catch(() => console.error("Failed to load plans"));
  }, []);

  /* -------------------------------------------------------
     WHEN PLAN CHANGES (Auto-Select Logic Added Here)
  ------------------------------------------------------- */
  useEffect(() => {
    if (!selectedPlan) return;

    setForm((f) => ({
      ...f,
      plan: selectedPlan.name || "Individual",
      exams: selectedPlan.exams,
      amount: selectedPlan.sellingPrice,
    }));

    // ✅ NEW LOGIC: Auto-select all exams if plan count matches available exams
    if (availableExams.length > 0 && selectedPlan.exams === availableExams.length) {
      setSelectedExamIds(availableExams.map((e) => e.id));
    } else {
      setSelectedExamIds([]);
    }

    setDiscountCode("");
    setDiscountApplied(0);
    setFinalAmount(selectedPlan.sellingPrice);
    setCouponError("");
    setCouponSuccess("");
  }, [selectedPlan, availableExams]);

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
      // ✅ PASS planId HERE (from selectedPlan object)
      const res = await StudentAPI.validateCoupon({
        code: discountCode,
        amount: form.amount,
        planId: selectedPlan?.id || selectedPlan?.planId, // Send the Plan ID
        selectedExamIds: selectedExamIds 
      });

      if (!res.valid) {
        setCouponError(res.message);
        setCouponLoading(false);
        // Reset discount if invalid
        setDiscountApplied(0);
        setFinalAmount(form.amount);
        return;
      }

      const discount = res.discountValue;

      setDiscountApplied(discount);
      setFinalAmount(form.amount - discount);
      setCouponSuccess(res.message);
    } catch (err) {
      console.error(err);
      setCouponError("Unable to apply coupon.");
    } finally {
      setCouponLoading(false);
    }
  };
  // const applyCoupon = async () => {
  //   setCouponError("");
  //   setCouponSuccess("");

  //   if (!discountCode.trim()) {
  //     setCouponError("Please enter a coupon code.");
  //     return;
  //   }

  //   setCouponLoading(true);

  //   try {
  //     const res = await StudentAPI.validateCoupon({
  //       code: discountCode,
  //       amount: form.amount,
  //       exams: form.exams,
  //       selectedExamIds: selectedExamIds 
  //     });

  //     if (!res.valid) {
  //       setCouponError(res.message);
  //       setCouponLoading(false);
  //       return;
  //     }

  //     const discount = res.discountValue;

  //     setDiscountApplied(discount);
  //     setFinalAmount(form.amount - discount);
  //     setCouponSuccess(res.message || `Coupon applied! You saved ₹${discount}`);
  //   } catch (err) {
  //     console.error(err);
  //     setCouponError("Unable to apply coupon.");
  //   } finally {
  //     setCouponLoading(false);
  //   }
  // };

  const removeCoupon = () => {
    setDiscountCode("");
    setDiscountApplied(0);
    setFinalAmount(form.amount);
    setCouponSuccess("Coupon removed.");
  };

  /* -------------------------------------------------------
     PAYMENT
  ------------------------------------------------------- */
  const payAndGenerate = async () => {
    if (selectedExamIds.length !== form.exams) {
      alert(`Please select ${form.exams} exam date(s).`);
      return;
    }

    setLoading(true);
    const invoiceId = String(Date.now());

    try {
      const orderRes = await StudentAPI.createOrder({
        mobile: form.phone,
        plan: form.plan,
        exams: form.exams,
        examDates: selectedExamIds,
        amount: finalAmount,
        originalAmount: form.amount,
        discount: discountApplied,
        discountCode,
      });

      if (orderRes.free) {
        navigate(`/invoice/${invoiceId}?status=paid&paymentId=FREE`);
        return;
      }

      const { key, orderId, amount } = orderRes;

      await openRazorpay({
        key,
        order_id: orderId,
        amount: amount * 100,
        name: "XPrepPG Exam Portal",
        description: `${form.plan}`,
        handler: async (resp: any) => {
          await StudentAPI.verifyPayment({
            ...resp,
            mobile: form.phone,
            plan: form.plan,
            exams: form.exams,
            examDates: selectedExamIds,
            amount: finalAmount,
            discount: discountApplied,
            discountCode,
          });

          navigate(`/student/invoice/${resp.razorpay_order_id}`);
        },
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#10B981" },
      });
    } catch (err) {
      console.error(err);
      alert("Payment initiation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Purchase Exam Plan</h1>
        <p className="text-gray-500 mt-1">Select a package and schedule your exams.</p>
      </header>

      {/* STEP 1: Plan Selector */}
      <Step title="1. Select Your Plan">
        <PlanSelector
          plans={plans}
          selectedPlan={selectedPlan}
          onSelect={setSelectedPlan}
        />
      </Step>

      {/* STEP 2: Exam Dates (Only if plan selected) */}
      {selectedPlan && (
        <Step title="2. Select Exam Dates">
          <ExamDateSelector
            exams={availableExams}
            max={selectedPlan.exams}
            selected={selectedExamIds}
            onChange={setSelectedExamIds}
          />
        </Step>
      )}

      {/* STEP 3: Coupon & Payment */}
      {selectedPlan && selectedExamIds.length === selectedPlan.exams && (
        <>
          <Step title="3. Apply Coupon">
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

          <Step title="4. Summary & Payment">
            <PlanSummary
              exams={form.exams}
              examDates={selectedExamIds}
              amount={finalAmount}
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={payAndGenerate}
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
              >
                {loading ? "Processing..." : `Pay ₹${finalAmount}`}
              </button>
            </div>
          </Step>
        </>
      )}
    </div>
  );
}

function Step({ title, children }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}