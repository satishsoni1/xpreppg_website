import { API_BASE_URL } from "@/config";// Ensure this matches your backend port

// Helper to get the token
const getAuthHeaders = () => {
  const token = localStorage.getItem("student_token");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

export const StudentAPI = {
  // 1. REGISTER (CBT)
  register: async (data: any) => {
    const isFormData = data instanceof FormData;
    const headers: any = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return res.json();
  },

  // 1b. REGISTER (XRevise)
  registerXrevise: async (data: any) => {
    const isFormData = data instanceof FormData;
    const headers: any = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE_URL}/xrevise/auth/register`, {
      method: "POST",
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return res.json();
  },

  // 2. LOGIN (CBT)
  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // 2b. LOGIN (XRevise)
  loginXrevise: async (credentials: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // 3. DASHBOARD
  getDashboard: async () => {
    const res = await fetch(`${API_BASE_URL}/student/dashboard`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 4. VIDEO ANALYTICS
  recordView: async (videoId: number) => {
    const res = await fetch(`${API_BASE_URL}/videos/${videoId}/view`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  /* ------------------------------------------------------------------
     NEW: ENROLLMENT & PAYMENTS (For StudentEnroll.tsx)
  ------------------------------------------------------------------ */
  
  // 5. GET PLANS
  getPlans: async () => {
    const res = await fetch(`${API_BASE_URL}/plans`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 6. VALIDATE COUPON
  validateCoupon: async (data: { 
    code: string; 
    amount: number; 
    planId: number; 
    selectedExamIds: number[] // <--- ADD THIS TYPE
}) => {
    const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // 7. CREATE RAZORPAY ORDER
  createOrder: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/payment/create-order`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // 8. VERIFY PAYMENT
  verifyPayment: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/payment/verify`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // 9. GET EXAMS (Added this!)
  getExams: async () => {
    const res = await fetch(`${API_BASE_URL}/exams`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  getInvoice: async (orderId: string) => {
    const res = await fetch(`${API_BASE_URL}/payment/invoice/${orderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  getOrderHistory: async () => {
    const res = await fetch(`${API_BASE_URL}/payment/history`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  getAdmitCard: async () => {
    const res = await fetch(`${API_BASE_URL}/student/admit-card`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  getReportList: async () => {
    const res = await fetch(`${API_BASE_URL}/student/reports`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 13. GET DETAILED REPORT FOR SPECIFIC EXAM
  getReportDetail: async (examId: number) => {
    const res = await fetch(`${API_BASE_URL}/student/reports/${examId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  getProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/student/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 15. UPDATE PROFILE
  updateProfile: async (data: any) => {
    // Check if data is FormData (has file) or JSON
    const isFormData = data instanceof FormData;
    const headers: any = getAuthHeaders();
    
    if (isFormData) {
      delete headers["Content-Type"]; // Let browser set multipart boundary
    }

    const res = await fetch(`${API_BASE_URL}/student/profile/update`, {
      method: "POST",
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return res.json();
  },
  getLibrary: async (subject?: string) => {
    const url = subject ? `${API_BASE_URL}/library?subject=${subject}` : `${API_BASE_URL}/library`;
    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  getVideo: async (videoId: string) => {
    const res = await fetch(`${API_BASE_URL}/library/${videoId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  getFullAnalysis: async (examId: string) => {
    const res = await fetch(`${API_BASE_URL}/student/analysis/${examId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  sendResetOTP: async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/student/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  verifyOTPAndReset: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/student/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // --- ADD THIS TO StudentAPI.ts ---
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await fetch(`${API_BASE_URL}/student/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // XRevise daily test — get exam + questions
  getExamQuestions: async (examId: string | number) => {
    const res = await fetch(`${API_BASE_URL}/student/exam/${examId}/questions`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // XRevise daily test — submit answers (JWT auth)
  submitDailyExam: async (data: { examId: string | number; answers: Record<string, string>; timeSpent: Record<string, number> }) => {
    const res = await fetch(`${API_BASE_URL}/student/daily-submit`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // XRevise attempt history
  getXreviseAttempts: async () => {
    const res = await fetch(`${API_BASE_URL}/student/xrevise/attempts`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // XRevise schedule (public)
  getXreviseSchedule: async () => {
    const res = await fetch(`${API_BASE_URL}/public/xrevise-schedule`, {
      method: "GET",
    });
    return res.json();
  },
};