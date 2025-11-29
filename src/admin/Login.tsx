import { useState } from "react";
import axios from "axios";
import Navigation from "./Navigation";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const login = async () => {
    setError("");
    const res = await axios.post("https://api.xpreppg.com/api/admin/login", form);

    if (!res.data.status) {
      setError(res.data.message);
      return;
    }

    localStorage.setItem("admin_token", res.data.token);
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen">
    <Navigation/>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      <div className="bg-white p-8 shadow-lg rounded-xl w-96">

        <h1 className="text-2xl font-bold mb-5 text-center">Admin Login</h1>

        {error && <p className="text-red-600 mb-3 text-center">{error}</p>}

        <input
          className="border p-3 w-full rounded mb-3"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="border p-3 w-full rounded mb-4"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={login}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg"
        >
          Login
        </button>
      </div>
    </div>
    </div>
  );
}
