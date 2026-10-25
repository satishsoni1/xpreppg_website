import { API_BASE_URL } from "@/config";

// Influencer portal — separate token from admin_token / student_token
export const INFLUENCER_TOKEN_KEY = "influencer_token";

export const InfluencerAPI = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/influencer/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  getDashboard: async (filters: { from?: string; to?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();
    const res = await fetch(`${API_BASE_URL}/influencer/dashboard${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(INFLUENCER_TOKEN_KEY) || ""}` },
    });
    return { httpStatus: res.status, ...(await res.json()) };
  },
};

// Shape returned by GET /influencer/dashboard and /admin/influencers/:id/preview
export interface DashboardColumn { key: string; label: string; }
export interface InfluencerDashboard {
  name: string;
  promo_codes: string[];
  sections: {
    summary?: { label: string; columns: DashboardColumn[]; values: Record<string, number> };
    products?: { label: string; columns: DashboardColumn[]; rows: Record<string, any>[] };
    orders?: { label: string; columns: DashboardColumn[]; rows: Record<string, any>[] };
  };
}
