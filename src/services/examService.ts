
import { API_BASE_URL } from "@/config";// Assuming base config here

export const ExamService = {
  // Upload the big JSON file
  uploadExamJson: async (jsonData: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/create-exam-json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
      },
      body: JSON.stringify(jsonData)
    });
    return res.json();
  },

  // Submit the student's answers
  submitExamJson: async (submissionData: any) => {
    const res = await fetch(`${API_BASE_URL}/student/submit-exam-json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}` // Student Token
      },
      body: JSON.stringify(submissionData)
    });
    return res.json();
  }
};