import { useEffect, useState } from "react";
import {
  getAllUsers,
  getAllExams,
  getAllCentres,
  massAssignAPI,
  getAssignmentsByStudent,
} from "@/services/api";
import React from "react";

export default function AdminCandidates() {
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [centres, setCentres] = useState([]);

  const [selected, setSelected] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedCentre, setSelectedCentre] = useState("");

  // Expand assigned exam list
  const [openRow, setOpenRow] = useState<string | null>(null);

  // Cache assigned exam lists per student
  const [assignments, setAssignments] = useState<any>({});

  // -------------------------------
  // Load students/exams/centres
  // -------------------------------
  const loadData = async () => {
    const usersRes = await getAllUsers();
    const examsRes = await getAllExams();
    const centresRes = await getAllCentres();

    setStudents(usersRes.data.users || []);
    setExams(examsRes.data.exams || []);
    setCentres(centresRes.data.centres || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------
  // Checkbox selection logic
  // -------------------------------
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelected([]);

  // -------------------------------
  // Load assigned exams for a student
  // -------------------------------
  const loadAssignments = async (regId: string) => {
    if (assignments[regId]) return; // use cache

    const res = await getAssignmentsByStudent(regId);

    setAssignments((prev: any) => ({
      ...prev,
      [regId]: res.data.assignments || [],
    }));
  };

  const toggleRow = async (id: string) => {
    if (openRow === id) {
      setOpenRow(null);
      return;
    }

    setOpenRow(id);
    await loadAssignments(id);
  };

  // -------------------------------
  // Mass assignment
  // -------------------------------
  const massAssign = async () => {
    if (!selectedExam || !selectedCentre) {
      alert("Please select exam & centre.");
      return;
    }

    const res = await massAssignAPI({
      studentIds: selected,
      examId: selectedExam,
      centreId: selectedCentre,
    });

    alert("Mass assignment completed.");
    console.log(res.data);

    setSelected([]);
    setOpenModal(false);
    setSelectedExam("");
    setSelectedCentre("");
  };

  // -------------------------------
  // UI Rendering
  // -------------------------------
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Candidate Assignment</h1>

      {/* MASS ASSIGN BUTTON */}
      {selected.length > 0 && (
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => setOpenModal(true)}
            className="px-5 py-3 bg-primary text-white rounded-xl shadow hover:bg-primaryDark"
          >
            Assign Exam to {selected.length} Students
          </button>

          <button
            onClick={clearSelection}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* STUDENT TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? students.map((s: any) => s._id) : []
                    )
                  }
                  checked={
                    students.length > 0 &&
                    selected.length === students.length
                  }
                />
              </th>
              <th className="p-3">Student</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Exam Limit</th>
              <th className="p-3">Paid?</th>
              <th className="p-3">Assigned Exams</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s: any) => {
              const purchased = s.enrolledPlan?.exams || 0;

              return (
                <React.Fragment key={s._id}>
                  <tr key={s._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(s._id)}
                        onChange={() => toggleSelect(s._id)}
                      />
                    </td>

                    {/* STUDENT INFO */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {s.photo ? (
                            <img
                              src={s.photo}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            s.name?.charAt(0)
                          )}
                        </div>

                        <div>
                          <div className="font-semibold">{s.name}</div>
                          <div className="text-sm text-gray-500">
                            {s.mobile}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* PLAN */}
                    <td className="p-3">{s.enrolledPlan?.plan || "-"}</td>

                    {/* LIMIT */}
                    <td className="p-3">
                      {purchased > 0 ? (
                        purchased
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                          No Plan
                        </span>
                      )}
                    </td>

                    {/* PAYMENT */}
                    <td className="p-3">
                      {s.isPaid ? (
                        <span className="text-emerald-600 font-bold">
                          ✔ Paid
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold">
                          ✘ Unpaid
                        </span>
                      )}
                    </td>

                    {/* EXPAND BUTTON */}
                    <td className="p-3">
                      <button
                        onClick={() => toggleRow(s._id)}
                        className="text-blue-600 underline text-sm"
                      >
                        {openRow === s._id ? "Hide" : "Show"}
                      </button>
                    </td>
                  </tr>
                  
                  {/* ASSIGNED EXAM LIST */}
                  {openRow === s._id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="p-4">
                        {assignments[s._id] ? (
                          assignments[s._id].length > 0 ? (
                            <div className="space-y-3">
                              {assignments[s._id].map((a: any) => (
                                <div
                                  key={a._id}
                                  className="p-3 border rounded-xl bg-white shadow-sm flex items-center justify-between"
                                >
                                  <div>
                                    <p className="font-semibold text-gray-800">
                                      Exam: {a.examId}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Centre: {a.centreId}
                                    </p>
                                  </div>

                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      a.status === "completed"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : a.status === "started"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-200 text-gray-600"
                                    }`}
                                  >
                                    {a.status || "Pending"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">
                              No assigned exams yet.
                            </p>
                          )
                        ) : (
                          <p className="text-gray-500">Loading...</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MASS ASSIGN MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              Assign Exam to {selected.length} Students
            </h2>

            <select
              className="border p-3 rounded w-full mb-3"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">Select Exam</option>
              {exams.map((ex: any) => (
                <option key={ex.examId} value={ex.examId}>
                  {ex.title}
                </option>
              ))}
            </select>

            <select
              className="border p-3 rounded w-full mb-3"
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
            >
              <option value="">Select Centre</option>
              {centres.map((c: any) => (
                <option key={c.centreId} value={c.centreId}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={massAssign}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold mt-2"
            >
              Assign Now
            </button>

            <button
              className="w-full py-2 mt-3 text-gray-600"
              onClick={() => setOpenModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
