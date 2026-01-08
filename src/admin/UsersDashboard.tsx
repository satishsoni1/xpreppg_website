import { useEffect, useState } from "react";
import { AdminAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";

export default function UsersDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  // Selection
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    AdminAPI.getUsers().then((res) => {
      setUsers(res.data.users || []);
      setLoading(false);
    });
  }, []);

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

  // Dynamic filter options
  const cities = Array.from(
    new Set(users.map((u) => u.city).filter(Boolean))
  );

  const plans = Array.from(
    new Set(users.map((u) => u.enrolledPlan?.plan).filter(Boolean))
  );

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const searchMatch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.includes(search) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "all"
        ? true
        : statusFilter === "paid"
        ? u.isPaid
        : !u.isPaid;

    const cityMatch =
      cityFilter === "all" ? true : u.city === cityFilter;

    const planMatch =
      planFilter === "all"
        ? true
        : u.enrolledPlan?.plan === planFilter;

    return searchMatch && statusMatch && cityMatch && planMatch;
  });

  // Selection helpers
  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredUsers
      .filter((u) => u.isPaid)
      .map((u) => u._id);
    setSelectedUsers(ids);
  };

  const clearSelection = () => setSelectedUsers([]);

  const printSelected = () => {
    const usersToPrint = filteredUsers.filter(
      (u) => selectedUsers.includes(u._id) && u.isPaid
    );

    if (!usersToPrint.length) {
      alert("No paid students selected");
      return;
    }

    navigate("/admin/admit-card-bulk", {
      state: { users: usersToPrint },
    });
  };

  const openAdmitCard = (user: any) => {
    navigate("/admin/admit-card", {
      state: { user },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Registered Users
      </h1>

      {/* ================= FILTERS ================= */}
      <div className="bg-white rounded-xl shadow border p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search name / mobile / email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Plans</option>
            {plans.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= BULK ACTIONS ================= */}
      <div className="flex flex-wrap gap-3 items-center mb-3">
        <button
          onClick={selectAllFiltered}
          className="px-3 py-1 bg-gray-200 rounded text-sm"
        >
          Select All (Paid & Filtered)
        </button>

        <button
          onClick={clearSelection}
          className="px-3 py-1 bg-gray-200 rounded text-sm"
        >
          Clear Selection
        </button>

        <button
          onClick={printSelected}
          disabled={!selectedUsers.length}
          className={`px-4 py-1 rounded text-sm text-white ${
            selectedUsers.length
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Print Selected Admit Cards ({selectedUsers.length})
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        Showing {filteredUsers.length} of {users.length} users
      </p>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-600">
                <th className="py-3 px-4">Select</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Admit Card</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr
                  key={u._id}
                  className={`border-b hover:bg-gray-50 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                  }`}
                >
                  <td className="px-4">
                    {u.isPaid ? (
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u._id)}
                        onChange={() => toggleUser(u._id)}
                      />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden">
                        {u.photo ? (
                          <img
                            src={u.photo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          u.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.mobile}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4">{u.city || "—"}</td>

                  <td className="px-4">
                    {u.enrolledPlan?.plan ? (
                      <>
                        <div className="font-medium">{u.enrolledPlan.plan}</div>
                        <div className="text-xs text-gray-500">
                          {u.enrolledPlan.exams} Exam(s)
                        </div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4">
                    {u.isPaid ? (
                      <>
                        <b>₹{Math.round(u.enrolledPlan?.finalAmount)}</b>
                        <div className="text-xs text-gray-500">
                          Orig: ₹{Math.round(u.enrolledPlan?.originalAmount)}
                        </div>
                        <div className="text-xs text-emerald-600">
                          Save: ₹{Math.round(u.enrolledPlan?.discount)}
                        </div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>

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

                  <td className="px-4">
                    {u.isPaid ? (
                      <button
                        onClick={() => openAdmitCard(u)}
                        className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Generate
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        Not Available
                      </span>
                    )}
                  </td>

                  <td className="px-4 text-xs text-gray-600">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
