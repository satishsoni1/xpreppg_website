import { useState } from "react";
import { ExamService } from "@/services/examService";
import { Upload, FileJson } from "lucide-react";

export default function AdminJsonUpload() {
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      setLoading(true);
      const parsed = JSON.parse(jsonInput);
      const res = await ExamService.uploadExamJson(parsed);
      
      if (res.status) {
        alert(`Success! Exam Created ID: ${res.internal_id}`);
        setJsonInput("");
      } else {
        alert("Error: " + res.message);
      }
    } catch (err) {
      alert("Invalid JSON Format");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileJson className="text-blue-600" /> Upload Exam JSON
      </h2>
      
      <textarea
        className="w-full h-96 p-4 border rounded-lg font-mono text-xs bg-gray-50"
        placeholder="Paste the full Exam JSON here..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      
      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
      >
        <Upload size={18} /> {loading ? "Processing..." : "Import Exam"}
      </button>
    </div>
  );
}