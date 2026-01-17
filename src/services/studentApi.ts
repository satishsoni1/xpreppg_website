import { STUDENT_DATABASE } from "@/data/studentData";

export const StudentAPI = {
  // Login with Mobile + Password (optional)
  login: async (creds: { mobile: string; password?: string }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = STUDENT_DATABASE[creds.mobile];

        if (!data) {
          return resolve({ status: false, message: "Mobile number not registered." });
        }

        // Verify Password
        if (creds.password && creds.password !== data.user.password) {
          return resolve({ status: false, message: "Invalid Password." });
        }

        resolve({
          status: true,
          data: {
            token: "fake-jwt-" + Date.now(),
            user: data.user
          }
        });
      }, 600);
    });
  },

  // Get Result
  getResult: async (mobile: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = STUDENT_DATABASE[mobile];
        
        if (data && data.result) {
          resolve({ status: true, data: data.result });
        } else {
          resolve({ status: false, message: "Result not available for this student." });
        }
      }, 500);
    });
  }
};