// src/hooks/useRegisterUser.ts
import { useState } from "react";
import axios from "axios";

export default function useRegisterUser() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const registerUser = async (formData: any, onSuccess?: (res: any) => void) => {
    setLoading(true);
    setStatus("");

    try {
      // const res = await axios.post(
      //   "http://127.0.0.1:5002/api/web/register",
      //   formData
      // );
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
        if (onSuccess) onSuccess(res.data);
      } else {
        if (onSuccess) onSuccess(res.data);   // 🔥 also send response on failure
        setStatus(res.data.message);
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
