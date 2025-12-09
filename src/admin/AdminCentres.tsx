import { useEffect, useState } from "react";
import { CentreAPI } from "@/services/api";
import { X } from "lucide-react";

export default function AdminCentres() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
  });

  const loadCentres = async () => {
    setLoading(true);
    const res = await CentreAPI.list();
    if (res.data.status) setCentres(res.data.centres);
    setLoading(false);
  };

  useEffect(() => {
    loadCentres();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ username: "", password: "", name: "" });
    setModalOpen(true);
  };

  const openEdit = (centre: any) => {
    setEditingId(centre._id);
    setForm({
      username: centre.username,
      password: "", // blank password, only update if typed
      name: centre.name,
    });
    setModalOpen(true);
  };

  const saveCentre = async () => {
    if (!form.username || !form.name) return alert("Missing required fields");

    if (editingId) {
      await CentreAPI.update(editingId, form);
    } else {
      if (!form.password) return alert("Password required");
      await CentreAPI.create(form);
    }

    setModalOpen(false);
    loadCentres();
  };

  const deleteCentre = async (id: string) => {
    if (!confirm("Delete this centre?")) return;
    await CentreAPI.delete(id);
    loadCentres();
  };

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Centres</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700"
        >
          + Add Centre
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Centre ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {centres.map((c: any) => (
              <tr key={c._id} className="border-b">
                <td className="p-3">{c.centreId}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.username}</td>
                <td className="p-3">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteCentre(c._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!loading && centres.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  No centres added yet.
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
              {editingId ? "Edit Centre" : "Add New Centre"}
            </h2>

            <div className="space-y-4">

              <input
                className="w-full border p-3 rounded"
                placeholder="Centre Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />

              <input
                className="w-full border p-3 rounded"
                placeholder={editingId ? "New Password (Optional)" : "Password"}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <input
                className="w-full border p-3 rounded"
                placeholder="Centre Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <button
                onClick={saveCentre}
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
