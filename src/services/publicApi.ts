import { API_BASE_URL } from "@/config";

export const PublicAPI = {
  // 1. Get All Active Plans (Public)
  getPlans: async () => {
    // Note: Ensure your backend has a public route: app.get('/api/plans', ...)
    // If using the admin route, it won't work without a token.
    // Assuming you have a public endpoint:
    const res = await fetch(`${API_BASE_URL}/plans`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },
  getCities: async () => {
    const res = await fetch(`${API_BASE_URL}/cities`, {
      method: "GET",
    });
    return res.json();
  },
  getUpcomingExam: async () => {
    const res = await fetch(`${API_BASE_URL}/public/upcoming-exam`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },
  getExams: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/public/exams`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching exams:", error);
      return { status: false, exams: [] };
    }
  },

  getPosters: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/posters`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching posters:", error);
      return { status: false, posters: [] };
    }
  },
};