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
};