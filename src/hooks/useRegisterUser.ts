// src/hooks/useRegisterUser.ts
import { useState } from "react";
import axios from "axios";

export default function useRegisterUser() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const registerUser = async (formData: any, onSuccess?: () => void) => {
    setLoading(true);
    setStatus("");

    try {
      const res = await axios.post(
        "https://api.xpreppg.com/api/web/register",
        formData
      );

      if (res.data.status) {
        setStatus("Registration successful! Redirecting to plans...");

        // Save to storage
        localStorage.setItem("x_user_mobile", formData.mobile);
        localStorage.setItem("x_user_email", formData.email);
        localStorage.setItem("x_user_name", formData.name);

        // Callback for the page using it
        if (onSuccess) onSuccess();
      } else {
        setStatus("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { registerUser, loading, status };
}
