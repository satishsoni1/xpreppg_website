import axios from "axios";

const API = axios.create({
  baseURL: "https://api.xpreppg.com/api",
  // baseURL: "http://localhost:5002/api",
});

// Attach Token Automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});
export const AuthAPI = {
  adminLogin: (data: any) => API.post("/admin/login", data),
};
export const WebAPI = {
  getUser: (mobile: string) => API.get(`/web/user/${mobile}`),
  register: (data: any) => API.post("/web/register", data),
};
export const PlansAPI = {
  list: () => API.get("/plans"),
};
export const CandidateAPI = {
  assign: (data: any) => API.post("/candidates/assign", data),
};

export const UsersAPI = {
  list: () => API.get("/admin/users"),
};
// ---------------- USERS ----------------
export const getAllUsers = () => API.get("/admin/users");

// ---------------- EXAMS ----------------
export const getAllExams = () => API.get("/admin/exams");

// ---------------- CENTRES ----------------
export const getAllCentres = () => API.get("/admin/centres");

export const massAssignAPI = (payload: any) =>
  API.post("/candidates/mass-assign", payload);

// Get assigned exams for a student
export const getAssignmentsByStudent = (registrationId: string) =>
  API.get(`/candidates/by-student/${registrationId}`);


export const ExamsAPI = {
  list: () => API.get("/admin/exams"),
  create: (data: any) => API.post("/admin/exams", data),
  update: (id: string, data: any) => API.put(`/admin/exams/${id}`, data),
  delete: (id: string) => API.delete(`/admin/exams/${id}`),
};

export const CentreAPI = {
  list: () => API.get("/admin/centres"),
  create: (data: any) => API.post("/admin/centres", data),
  update: (id: string, data: any) => API.put(`/admin/centres/${id}`, data),
  delete: (id: string) => API.delete(`/admin/centres/${id}`)
};


// Coupon API
export const CouponAPI = {
  validate: (data: any) => API.post("/coupon/validate", data),
};

// Payment API
export const PaymentAPI = {
  createOrder: (data: any) => API.post("/pay/create-order", data),
  verifyPayment: (data: any) => API.post("/pay/verify-payment", data),
};
// ADMIN API Services
export const AdminAPI = {
  stats: () => API.get("/admin/stats"),
  // users
  getUsers: () => API.get("/admin/users"),

  // cities
  getCities: () => API.get("/cities"),
  toggleCity: (id: string, allowed: boolean) => API.patch(`/cities/${id}`, { allowed }),

  // COUPONS
  getCouponAnalytics: () => API.get("/coupon-analytics"),
  getCoupons: () => API.get("/coupon-dashboard/list"),
  createCoupon: (data: any) => API.post("/coupon-dashboard/create", data),
  deleteCoupon: (id: string) => API.delete(`/coupon-dashboard/delete/${id}`),
  toggleCoupon: (id: string) => API.patch(`/coupon-dashboard/toggle/${id}`),


  // Plans
  getPlans: () => API.get("/plans"),
  createPlan: (data: any) => API.post("/plans", data),
  updatePlan: (id: string, data: any) => API.put(`/plans/${id}`, data),
  deletePlan: (id: string) => API.delete(`/plans/${id}`),
  
};

export default API;
