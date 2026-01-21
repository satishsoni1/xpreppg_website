// 1. Try to get the URL from Environment Variables (Best for deployment)
// 2. Fallback to Localhost if env variable is missing
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Helper for specific routes if needed
export const ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  ADMIN: `${API_BASE_URL}/admin`,
  STUDENT: `${API_BASE_URL}/student`,
  PUBLIC: `${API_BASE_URL}`, // for /plans, etc
};