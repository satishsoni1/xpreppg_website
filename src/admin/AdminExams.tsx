import { useEffect, useState } from "react";
import { ExamsAPI } from "@/services/api";
import { X } from "lucide-react";

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    examId: "",
    title: "",
    date: "",
    startTime: "",
    durationMinutes: "",
  });

  const loadExams = async () => {
    setLoading(true);
    const res = await ExamsAPI.list();
    if (res.data.status) setExams(res.data.exams);
    setLoading(false);
  };

  useEffect(() => {
    loadExams();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({
      examId: "",
      title: "",
      date: "",
      startTime: "",
      durationMinutes: "",
    });
    setModalOpen(true);
  };

  const openEdit = (exam: any) => {
    setEditingId(exam._id);
    setForm({
      examId: exam.examId,
      title: exam.title,
      date: exam.date?.slice(0, 10),
      startTime: exam.startTime,
      durationMinutes: exam.durationMinutes,
    });
    setModalOpen(true);
  };

  const saveExam = async () => {
    if (editingId) {
      await ExamsAPI.update(editingId, form);
    } else {
      await ExamsAPI.create(form);
    }

    setModalOpen(false);
    loadExams();
  };

  const deleteExam = async (id: string) => {
    if (!confirm("Delete this exam?")) return;
    await ExamsAPI.delete(id);
    loadExams();
  };

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Exams</h1>

        <button
          onClick={openNew}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700"
        >
          + Add Exam
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Exam ID</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Date</th> 
              <th className="p-3 text-left">Start Time</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {exams.map((exam: any) => (
              <tr key={exam._id} className="border-b">
                <td className="p-3">{exam.examId}</td>
                <td className="p-3">{exam.title}</td>
                <td className="p-3">{new Date(exam.date).toLocaleDateString()}</td>
                <td className="p-3">{exam.startTime}</td>
                <td className="p-3">{exam.durationMinutes} min</td>

                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => openEdit(exam)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteExam(exam._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!loading && exams.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
                  No exams added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && (
          <p className="text-center p-6 text-gray-500">Loading...</p>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg relative">

            <button
              className="absolute right-4 top-4 text-gray-500"
              onClick={() => setModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Exam" : "Add New Exam"}
            </h2>

            <div className="space-y-4">
              <input
                className="w-full border p-3 rounded"
                placeholder="Exam ID"
                value={form.examId}
                onChange={(e) => setForm({ ...form, examId: e.target.value })}
              />

              <input
                className="w-full border p-3 rounded"
                placeholder="Exam Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <input
                type="date"
                className="w-full border p-3 rounded"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />

              <input
                className="w-full border p-3 rounded"
                placeholder="Start Time (e.g. 09:00 AM)"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />

              <input
                type="number"
                className="w-full border p-3 rounded"
                placeholder="Duration (minutes)"
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: e.target.value })
                }
              />

              <button
                onClick={saveExam}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
