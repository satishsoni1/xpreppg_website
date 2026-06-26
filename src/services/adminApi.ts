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
const getUploadHeaders = () => {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    throw new Error("Admin token not found. Please login.");
  }
  return {
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
  getExams: async (type?: 'cbt' | 'xrevise') => {
    const url = type ? `${API_BASE_URL}/admin/exams?type=${type}` : `${API_BASE_URL}/admin/exams`;
    const res = await fetch(url, { method: "GET", headers: getAuthHeaders() });
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

  deleteExam: async (id: number, type?: string) => {
    const url = type
      ? `${API_BASE_URL}/admin/exams/${id}?type=${type}`
      : `${API_BASE_URL}/admin/exams/${id}`;
    const res = await fetch(url, { method: "DELETE", headers: getAuthHeaders() });
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

  bulkAddQuestions: async (examId: string | number, questions: any[]) => {
    const res = await fetch(`${API_BASE_URL}/admin/questions/bulk`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ exam_id: examId, questions }),
    });
    return res.json();
  },

  uploadQuestionsCSV: async (examId: string | number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('exam_id', String(examId));

    const res = await fetch(`${API_BASE_URL}/admin/questions/upload-csv`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
      },
      body: formData,
    });
    return res.json();
  },

  editQuestion: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteQuestion: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
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
  getPlans: async (type?: 'cbt' | 'xrevise') => {
    const url = type ? `${API_BASE_URL}/admin/plans?type=${type}` : `${API_BASE_URL}/admin/plans`;
    const res = await fetch(url, { method: "GET", headers: getAuthHeaders() });
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
  getCoupons: async (type?: 'cbt' | 'xrevise') => {
    const url = type ? `${API_BASE_URL}/admin/coupons?type=${type}` : `${API_BASE_URL}/admin/coupons`;
    const res = await fetch(url, { method: "GET", headers: getAuthHeaders() });
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
  },
  uploadImage: async (formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/admin/upload-image`, {
      method: "POST",
      headers: getUploadHeaders(),
      body: formData,
    });
    return res.json();
  },

  // --- POSTERS ---
  getPosters: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/posters`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createPoster: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/posters`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  togglePoster: async (id: number, status: boolean) => {
    const res = await fetch(`${API_BASE_URL}/admin/posters/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: status }),
    });
    return res.json();
  },

  deletePoster: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/admin/posters/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- POSTER PACKAGES ---
  getPosterPackages: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/poster-packages`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  createPosterPackage: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/poster-packages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updatePosterPackage: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/poster-packages/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  togglePosterPackage: async (id: number, status: boolean) => {
    const res = await fetch(`${API_BASE_URL}/admin/poster-packages/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: status }),
    });
    return res.json();
  },
  deletePosterPackage: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/admin/poster-packages/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- STUDENTS BY TYPE ---
  getStudentsByType: async (type: 'CBT' | 'XRevise') => {
    const res = await fetch(`${API_BASE_URL}/admin/students?type=${type}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- POSTER ORDERS ---
  getPosterOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/poster-orders`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- POSTER PROMO CODES ---
  getPosterPromos: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/poster-promos`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  createPosterPromo: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/poster-promos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updatePosterPromo: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/poster-promos/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deletePosterPromo: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/admin/poster-promos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- XREVISE SCHEDULE ---
  getXreviseSchedule: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/xrevise-schedule`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  createScheduleEntry: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/xrevise-schedule`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateScheduleEntry: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/xrevise-schedule/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteScheduleEntry: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/admin/xrevise-schedule/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- PUBLISH EXAM RESULT ---
  publishResult: async (examId: number, type?: string) => {
    const url = type
      ? `${API_BASE_URL}/admin/exams/${examId}/publish-result?type=${type}`
      : `${API_BASE_URL}/admin/exams/${examId}/publish-result`;
    const res = await fetch(url, { method: "POST", headers: getAuthHeaders() });
    return res.json();
  },

  // --- WHATSAPP SCHEDULER ---
  getWhatsAppMessages: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/whatsapp-messages`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
  sendWhatsAppMessage: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/whatsapp-messages/send`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- MEDIA UPLOADS ---
  uploadMultipleImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append("images", f));
    const res = await fetch(`${API_BASE_URL}/admin/media/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      body: formData,
    });
    return res.json();
  },

  getMediaUploads: async (limit = 100) => {
    const res = await fetch(`${API_BASE_URL}/admin/media?limit=${limit}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  deleteMediaUpload: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/admin/media/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// XRevise API — Completely separate namespace (/api/xrevise/...)
// ─────────────────────────────────────────────────────────────────────────────
export const XReviseAPI = {

  // --- AUTH ---
  register: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  login: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- EXAMS ---
  getExams: async () => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/exams`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createExam: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/exams`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateExam: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/exams/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteExam: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/exams/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  publishResult: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/exams/${id}/publish-result`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- QUESTIONS ---
  getQuestions: async (examId: string | number) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/questions/${examId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addQuestion: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/questions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  editQuestion: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/questions/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteQuestion: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/questions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  bulkAddQuestions: async (examId: string | number, questions: any[]) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/questions/bulk`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ exam_id: examId, questions }),
    });
    return res.json();
  },

  uploadQuestionsCSV: async (examId: string | number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("exam_id", String(examId));
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/questions/upload-csv`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      body: formData,
    });
    return res.json();
  },

  uploadImage: async (formData: FormData) => {
    const res = await fetch(`${API_BASE_URL}/admin/upload-image`, {
      method: "POST",
      headers: getUploadHeaders(),
      body: formData,
    });
    return res.json();
  },

  // --- STUDENTS ---
  getAllStudents: async () => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/students`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createStudent: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/students`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  resetStudentPassword: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/students/${id}/reset-password`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- ENROLLMENTS ---
  getEnrollments: async () => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/enrollments`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  manualEnroll: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/enrollments/manual`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- ATTEMPTS & RANKS ---
  getAttempts: async (examId: number) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/attempts/${examId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  generateRanks: async (examId: number) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/generate-ranks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ examId }),
    });
    return res.json();
  },

  // --- PLANS ---
  getPlans: async () => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/plans`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createPlan: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/plans`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  togglePlan: async (id: number, status: boolean) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/plans/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: status }),
    });
    return res.json();
  },

  // --- COUPONS ---
  getCoupons: async () => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/coupons`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createCoupon: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/coupons`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateCoupon: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/coupons/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- CENTERS ---
  getCenters: async () => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/centers`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addCenter: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/centers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- CITIES ---
  getCities: async () => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/cities`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addCity: async (name: string) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/cities`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  toggleCity: async (id: number, status: boolean) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/cities/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: status }),
    });
    return res.json();
  },

  // --- SCHEDULE ---
  getSchedule: async () => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/schedule`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createScheduleEntry: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/schedule`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateScheduleEntry: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/schedule/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteScheduleEntry: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/xrevise/admin/schedule/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
