const API_URL = "http://localhost:5001/api/admin";

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
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // --- DASHBOARD ---
  getStats: async () => {
    console.log("api getStats");
    const res = await fetch(`${API_URL}/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- STUDENTS ---
  getAllStudents: async () => {
    console.log("api getAllStudents");
    const res = await fetch(`${API_URL}/students`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- EXAMS ---
  getExams: async () => {
    const res = await fetch(`${API_URL}/exams`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createExam: async (data: any) => {
    const res = await fetch(`${API_URL}/exams`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- QUESTIONS ---
  getQuestions: async (examId: string | number) => {
    const res = await fetch(`${API_URL}/questions/${examId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addQuestion: async (data: any) => {
    const res = await fetch(`${API_URL}/questions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- CENTERS ---
  getCenters: async () => {
    const res = await fetch(`${API_URL}/centers`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addCenter: async (data: any) => {
    const res = await fetch(`${API_URL}/centers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- ENROLLMENTS ---
  getEnrollments: async () => {
    const res = await fetch(`${API_URL}/enrollments`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- FINANCE (PLANS & COUPONS) ---
  getPlans: async () => {
    const res = await fetch(`${API_URL}/plans`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createPlan: async (data: any) => {
    const res = await fetch(`${API_URL}/plans`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getCoupons: async () => {
    const res = await fetch(`${API_URL}/coupons`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createCoupon: async (data: any) => {
    const res = await fetch(`${API_URL}/coupons`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getCities: async () => {
    const res = await fetch(`${API_URL}/cities`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  addCity: async (name: string) => {
    const res = await fetch(`${API_URL}/cities`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  toggleCity: async (id: number, status: boolean) => {
    const res = await fetch(`${API_URL}/cities/${id}/status`, {
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
    const res = await fetch(`${API_URL}/reports?${params}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // ASSIGN CENTER
  assignCenter: async (enrollmentId: number, centerId: number) => {
    const res = await fetch(`${API_URL}/assign-center`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ enrollment_id: enrollmentId, center_id: centerId }),
    });
    return res.json();
  }
};