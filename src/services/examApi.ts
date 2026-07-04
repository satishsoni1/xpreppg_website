import { API_BASE_URL } from "@/config";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("admin_token") || localStorage.getItem("xrevise_token") || ""}`,
});
const uploadHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}`,
});

const get  = (url: string) => fetch(`${API_BASE_URL}${url}`, { headers: authHeaders() }).then(r => r.json());
const post = (url: string, data?: any) => fetch(`${API_BASE_URL}${url}`, { method: "POST", headers: authHeaders(), body: data ? JSON.stringify(data) : undefined }).then(r => r.json());
const put  = (url: string, data?: any) => fetch(`${API_BASE_URL}${url}`, { method: "PUT",  headers: authHeaders(), body: data ? JSON.stringify(data) : undefined }).then(r => r.json());
const del  = (url: string, data?: any) => fetch(`${API_BASE_URL}${url}`, { method: "DELETE", headers: authHeaders(), body: data ? JSON.stringify(data) : undefined }).then(r => r.json());
const patch = (url: string, data?: any) => fetch(`${API_BASE_URL}${url}`, { method: "PATCH", headers: authHeaders(), body: data ? JSON.stringify(data) : undefined }).then(r => r.json());

// ── Exam Simulator ────────────────────────────────────────────────────────
export const SimulatorAPI = {
  getAllExams: () => get("/admin/simulator/exams"),
  getExam: (id: number, source: string) =>
    get(`/admin/simulator/exams/${id}?source=${source}`),
};

// ── Exam Management ───────────────────────────────────────────────────────
export const ExamAPI = {
  getAll:   (params: Record<string, any> = {}) =>
    get(`/em/exams?${new URLSearchParams(params as any).toString()}`),
  getOne:   (id: number) => get(`/em/exams/${id}`),
  create:   (data: any) => post("/em/exams", data),
  update:   (id: number, data: any) => put(`/em/exams/${id}`, data),
  remove:   (id: number) => del(`/em/exams/${id}`),
  restore:  (id: number) => patch(`/em/exams/${id}/restore`),
  publishResult: (id: number) => post(`/em/exams/${id}/publish-result`),

  // Questions in exam
  removeQuestion:     (examId: number, questionId: number, platform: string) =>
    del(`/em/exams/${examId}/questions/${questionId}?platform=${platform}`),
  reorderQuestions:   (examId: number, ordered_ids: number[]) =>
    put(`/em/exams/${examId}/reorder`, { ordered_ids }),
  importQuestionsXlsx: (examId: number, file: File, platform: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("exam_id", String(examId));
    fd.append("platform", platform);
    return fetch(`${API_BASE_URL}/em/exams/${examId}/import-questions`, {
      method: "POST", headers: uploadHeaders(), body: fd,
    }).then(r => r.json());
  },
  downloadQuestionsTemplate: async () => {
    const res = await fetch(`${API_BASE_URL}/em/exams/questions-template`, { headers: uploadHeaders() });
    if (!res.ok) throw new Error("Failed to download template");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam_questions_template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  },

  // Operations
  copy:     (id: number, new_title?: string) => post(`/em/exams/${id}/copy`, { new_title }),
  transfer: (id: number, new_title?: string) => post(`/em/exams/${id}/transfer`, { new_title }),
  move:     (id: number) => post(`/em/exams/${id}/move`),
};

// ── Enrollment Management ─────────────────────────────────────────────────
export const EnrollmentAPI = {
  getEnrollments:   (examId: number, search?: string) =>
    get(`/em/enrollments/${examId}${search ? `?search=${search}` : ""}`),
  enrollStudent:    (data: any) => post("/em/enrollments", data),
  enrollBulk:       (exam_id: number, students: any[]) =>
    post("/em/enrollments/bulk", { exam_id, students }),
  enrollByPlatform: (exam_id: number, student_type: string) =>
    post("/em/enrollments/by-platform", { exam_id, student_type }),
  copyEnrollments:  (source: number, destination: number) =>
    post("/em/enrollments/copy", { source_exam_id: source, destination_exam_id: destination }),
  unenroll:         (exam_id: number, student_id: number, student_type: string) =>
    del("/em/enrollments", { exam_id, student_id, student_type }),
  getStudentsForPicker: (params: Record<string, any>) =>
    get(`/em/students-picker?${new URLSearchParams(params as any).toString()}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────
export const AnalyticsAPI = {
  getDashboard:     (platform?: string) =>
    get(`/em/analytics/dashboard${platform ? `?platform=${platform}` : ""}`),
  getExamStats:     (examId: number) => get(`/em/analytics/exam/${examId}`),
  getStudentResults:(examId: number, params: Record<string, any> = {}) =>
    get(`/em/analytics/exam/${examId}/results?${new URLSearchParams(params as any).toString()}`),
};

// ── Student Portal ────────────────────────────────────────────────────────
export const StudentPortalAPI = {
  getMyExams: () => get("/em/student/exams"),
  startExam:  (examId: number) => post(`/em/student/exams/${examId}/start`),
  saveAnswer: (data: any) => post("/em/student/save-answer", data),
  warn:       (data: any) => post("/em/student/warn", data),
  submit:     (data: any) => post("/em/student/submit", data),
  getResult:  (attemptId: number) => get(`/em/student/result/${attemptId}`),
  getAnalysis:(attemptId: number) => get(`/em/student/analysis/${attemptId}`),
};
