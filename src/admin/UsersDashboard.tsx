import { useEffect, useState } from "react";
import { AdminAPI } from "@/services/api";


export default function UsersDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    AdminAPI.getUsers().then((res) => {

      setUsers(res.data.users);
      setLoading(false);
    });
  }, []);
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading data...</p>
      </div>

    );
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (

    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Registered Users</h1>

      <div className="bg-white rounded-xl shadow border overflow-hidden">

        {/* Sticky Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b">
              <tr className="text-gray-600">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>

              </tr>
            </thead>

            <tbody>
              {users.map((u, idx) => (
                <tr
                  key={u._id}
                  className={`border-b hover:bg-gray-50 transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    }`}
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {u.photo ? (
                          <img
                            src={u.photo}
                            alt={u.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          u.name?.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Text */}
                      <div>
                        <div className="font-semibold text-gray-900">{u.name}</div>
                        <div className="text-gray-500 text-sm">{u.mobile}</div>
                        <div className="text-gray-500 text-sm">{u.email}</div>
                      </div>

                    </div>
                  </td>

                  {/* City */}
                  <td className="px-4">{u.city}</td>

                  {/* Plan & Exam Count */}
                  <td className="px-4">
                    {u.enrolledPlan?.plan ? (
                      <>
                        <span className="font-medium">
                          {u.enrolledPlan.plan}
                        </span>
                        <br />
                        <span className="text-gray-500 text-xs">
                          {u.enrolledPlan.exams} Exam(s)
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Amount Section */}
                  <td className="px-4">
                    {u.isPaid ? (
                      <div className="text-sm">
                        <div className="text-gray-800">
                          <b>₹{Math.round(u.enrolledPlan?.finalAmount)}</b>
                        </div>
                        <div className="text-xs text-gray-500">
                          Orig: ₹{Math.round(u.enrolledPlan?.originalAmount)}
                        </div>
                        <div className="text-xs text-emerald-600">
                          Save: ₹{Math.round(u.enrolledPlan?.discount)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4">
                    {u.isPaid ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                        Paid
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="px-4 text-gray-600 text-sm">
                    {formatDate(u.createdAt)}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
