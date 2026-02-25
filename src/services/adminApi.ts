import { API_BASE_URL } from "@/config";

// Helper to get Admin Headers automatically
const getAuthHeaders = () => {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    throw new Error("Admin token not found. Please login.");
  }
  console.log("totkencount"+token);
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

export const AdminAPI = {
  
  // --- AUTHENTICATION ---
  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // --- DASHBOARD ---
  getStats: async () => {
    console.log("api getStats");
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- STUDENTS ---
  getAllStudents: async () => {
    console.log("api getAllStudents");
    const res = await fetch(`${API_BASE_URL}/admin/students`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  // --- ADD TO AdminAPI.ts ---
  createStudent: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/students`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  resetStudentPassword: async (id: number, newPassword: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/students/${id}/reset-password`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    return res.json();
  },

  // --- EXAMS ---
  getExams: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/exams`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createExam: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/exams`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateExam: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/exams/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteExam: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/admin/exams/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  // --- QUESTIONS ---
  getQuestions: async (examId: string | number) => {
    const res = await fetch(`${API_BASE_URL}/admin/questions/${examId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addQuestion: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/questions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- CENTERS ---
  getCenters: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/centers`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addCenter: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/centers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- ENROLLMENTS ---
  getEnrollments: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/enrollments`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  manualEnroll: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/enrollments/manual`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // --- FINANCE (PLANS & COUPONS) ---
  getPlans: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/plans`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createPlan: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/plans`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  togglePlan: async (id: number, status: boolean) => {
    const res = await fetch(`${API_BASE_URL}/admin/plans/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: status }),
    });
    return res.json();
  },
  getCoupons: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createCoupon: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateCoupon: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getCities: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/cities`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addCity: async (name: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/cities`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  toggleCity: async (id: number, status: boolean) => {
    const res = await fetch(`${API_BASE_URL}/admin/cities/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: status }),
    });
    return res.json();
  },
  // REPORTS
  getReports: async (filters: any) => {
    // Convert object { exam_id: 1, city: 'Delhi' } to query string ?exam_id=1&city=Delhi
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE_URL}/admin/reports?${params}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // ASSIGN CENTER
  assignCenter: async (enrollmentId: number, centerId: number) => {
    const res = await fetch(`${API_BASE_URL}/admin/assign-center`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ enrollment_id: enrollmentId, center_id: centerId }),
    });
    return res.json();
  },
  // --- EVALUATION ENGINE (Raw Attempts V2 -> Final Reports) ---
  
  // 1. Fetch Dropdown Filters (Students & Exams)
  getEvaluationFilters: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/evaluation-filters`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 2. Fetch Raw Pending Attempts for the Queue Table
  getPendingAttempts: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/pending-attempts`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 3. Evaluate Specific Student/Exam (From Dropdown Page)
  evaluateTargetedResults: async (data: { studentId?: string | null, examId?: string | null }) => {
    const res = await fetch(`${API_BASE_URL}/admin/evaluate-results`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // 4. Evaluate Specific Selected Rows (From Checkbox Table Page)
  evaluateSelectedAttempts: async (attemptIds: number[]) => {
    const res = await fetch(`${API_BASE_URL}/admin/evaluate-selected`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ attemptIds }),
    });
    return res.json();
  },
  getEvaluatedResults: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/evaluated-results`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  // --- RANKING ENGINE ---
  generateRanks: async (examId: number, totalStudents: number) => {
    const res = await fetch(`${API_BASE_URL}/admin/generate-ranks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ examId, totalStudents }),
    });
    return res.json();
  },
  // --- FETCH SOLVED PAPER DETAILS (For Admin Viewer) ---
  getStudentAttemptPaper: async (examId: number, studentId: number | string) => {
    const res = await fetch(`${API_BASE_URL}/admin/student-attempt-paper?examId=${examId}&studentId=${studentId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  }
};
