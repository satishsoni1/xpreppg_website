import { useState } from "react";
import { AuthAPI } from "@/services/api";

export default function useRegisterUser() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const registerUser = async (formData: any, onComplete?: (res: any) => void) => {
    setLoading(true);
    setStatus("");

    try {
      const res = await AuthAPI.userRegister(formData);
      const response = res.data;

      if (response.status) {
        setStatus("Registration successful! Redirecting to plans...");

        // Save to storage
        localStorage.setItem("x_user_mobile", formData.mobile);
        localStorage.setItem("x_user_email", formData.email);
        localStorage.setItem("x_user_name", formData.name);
      } else {
        setStatus(response.message || "Registration failed.");
      }

      // Always return the result to caller
      if (onComplete) onComplete(response);

    } catch (err) {
      console.error("Registration error", err);
      setStatus("Error submitting form. Please try again.");

      if (onComplete) {
        onComplete({ status: false, message: "Network error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return { registerUser, loading, status };
}
