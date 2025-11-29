import { useEffect, useState } from "react";
import axios from "axios";

export default function UsersDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("https://api.xpreppg.com/api/admin/users", {
        headers: { Authorization: "Bearer " + localStorage.getItem("admin_token") }
      })
      .then((res) => setUsers(res.data.users));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Registered Users</h1>

      <table className="w-full text-left bg-white shadow rounded-xl">
        <thead>
          <tr className="border-b text-sm">
            <th className="py-3">Name</th>
            <th className="py-3">Mobile</th>
            <th className="py-3">Email</th>
            <th className="py-3">City</th>
            <th className="py-3">Plan</th>
            <th className="py-3">Paid?</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u: any) => (
            <tr key={u._id} className="border-b">
              <td className="py-3">{u.name}</td>
              <td>{u.mobile}</td>
              <td>{u.email}</td>
              <td>{u.city}</td>
              <td>{u.enrolledPlan?.plan || "-"}</td>
              <td>{u.isPaid ? "✔" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
