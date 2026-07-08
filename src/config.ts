// 1. Try to get the URL from Environment Variables (Best for deployment)
// 2. Fallback to Localhost if env variable is missing
//Local
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

//staging
// export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://staging.xpreppg.com/api";
// export const BASE_URL = import.meta.env.VITE_API_URL || "https://staging.xpreppg.com";

//live
// export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://xpreppg.com/api";
// export const BASE_URL = import.meta.env.VITE_API_URL || "https://xpreppg.com";

// Helper for specific routes if needed
export const ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  ADMIN: `${API_BASE_URL}/admin`,
  STUDENT: `${API_BASE_URL}/student`,
  PUBLIC: `${API_BASE_URL}`, // for /plans, etc
}; 