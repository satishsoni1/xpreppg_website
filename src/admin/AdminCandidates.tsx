import { useEffect, useState } from "react";
import React from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
} from "lucide-react";
import {
  getAllUsers,
  getAllExams,
  getAllCentres,
  massAssignAPI,
  getAssignmentsByStudent,
} from "@/services/api";

export default function AdminCandidates() {
  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedCentre, setSelectedCentre] = useState("");
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<any>({});

  useEffect(() => {
    (async () => {
      const usersRes = await getAllUsers();
      const examsRes = await getAllExams();
      const centresRes = await getAllCentres();
      setStudents(usersRes.data.users || []);
      setExams(examsRes.data.exams || []);
      setCentres(centresRes.data.centres || []);
    })();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const loadAssignments = async (id: string) => {
    if (assignments[id]) return;
    const res = await getAssignmentsByStudent(id);
    setAssignments((prev: any) => ({
      ...prev,
      [id]: res.data.assignments || [],
    }));
  };

  const toggleRow = async (id: string) => {
    setOpenRow(openRow === id ? null : id);
    await loadAssignments(id);
  };

  const massAssign = async () => {
    if (!selectedExam || !selectedCentre) return alert("Select exam & centre");
    await massAssignAPI({
      studentIds: selected,
      examId: selectedExam,
      centreId: selectedCentre,
    });
    setOpenModal(false);
    setSelected([]);
    setSelectedExam("");
    setSelectedCentre("");
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Candidate Assignment
        </h1>
        <p className="text-gray-500 mt-1">
          Assign exams and centres to registered candidates
        </p>
      </div>

      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="mb-4 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
          <p className="text-sm font-medium text-emerald-700">
            {selected.length} students selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700"
            >
              Assign Exam
            </button>
            <button
              onClick={() => setSelected([])}
              className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? students.map((s) => s._id) : []
                    )
                  }
                  checked={
                    students.length > 0 &&
                    selected.length === students.length
                  }
                />
              </th>
              <th className="p-3">Candidate</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Exam Limit</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Assignments</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <React.Fragment key={s._id}>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(s._id)}
                      onChange={() => toggleSelect(s._id)}
                    />
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                        {s.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.mobile}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">{s.enrolledPlan?.plan || "-"}</td>

                  <td className="p-3">
                    {s.enrolledPlan?.exams || (
                      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                        No Plan
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    {s.isPaid ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle size={14} /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                        <XCircle size={14} /> Unpaid
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => toggleRow(s._id)}
                      className="text-blue-600 text-sm flex items-center gap-1"
                    >
                      {openRow === s._id ? (
                        <>
                          <ChevronUp size={16} /> Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} /> View
                        </>
                      )}
                    </button>
                  </td>
                </tr>

                {openRow === s._id && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="p-4">
                      <div className="space-y-3">
                        {(assignments[s._id] || []).length > 0 ? (
                          assignments[s._id].map((a: any) => (
                            <div
                              key={a._id}
                              className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm"
                            >
                              <div>
                                <p className="font-semibold">
                                  Exam: {a.examId}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Centre: {a.centreId}
                                </p>
                              </div>
                              <span className="px-3 py-1 text-xs rounded-full bg-gray-100">
                                {a.status || "Pending"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No exams assigned yet.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ClipboardList size={20} />
              Assign Exam
            </h2>

            <select
              className="w-full border p-3 rounded-lg mb-3"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">Select Exam</option>
              {exams.map((ex) => (
                <option key={ex.examId} value={ex.examId}>
                  {ex.title}
                </option>
              ))}
            </select>

            <select
              className="w-full border p-3 rounded-lg mb-4"
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
            >
              <option value="">Select Centre</option>
              {centres.map((c) => (
                <option key={c.centreId} value={c.centreId}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={massAssign}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700"
            >
              Assign Now
            </button>

            <button
              onClick={() => setOpenModal(false)}
              className="w-full mt-3 text-sm text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
