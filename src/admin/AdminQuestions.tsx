import { useState } from "react";
import { Plus, Trash2, Save, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function AdminQuestions() {
  const [examId, setExamId] = useState("1"); // Default or fetched from dropdown
  
  const [formData, setFormData] = useState({
    type: "mcq",
    question_text: "",
    options: [
      { id: "a", text: "" },
      { id: "b", text: "" },
      { id: "c", text: "" },
      { id: "d", text: "" }
    ],
    correct_answer: "",
    marks: 4,
    subject: "Anatomy",
    difficulty: "medium"
  });

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...formData.options];
    newOptions[index].text = val;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.question_text || !formData.correct_answer) {
      alert("Please fill question text and correct answer");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, exam_id: examId })
      });
      
      const res = await response.json();
      if (res.status) {
        alert("Question Saved Successfully!");
        // Reset form or keep some fields?
        setFormData({ ...formData, question_text: "", correct_answer: "" });
      } else {
        alert("Error saving question");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Add New Question</h1>
        <select 
          className="border p-2 rounded-lg bg-white"
          value={examId} 
          onChange={(e) => setExamId(e.target.value)}
        >
          <option value="1">NEET PG Grand Test 1</option>
          <option value="2">Surgery Speed Test</option>
        </select>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        
        {/* Row 1: Type & Subject */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Question Type</label>
            <select 
              className="w-full border p-2 rounded-lg"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="text">Text Based</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Subject</label>
            <input 
              className="w-full border p-2 rounded-lg" 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="e.g. Anatomy"
            />
          </div>
        </div>

        {/* Question Text */}
        <div>
           <label className="block text-sm font-semibold mb-1">Question Text</label>
           <textarea 
             className="w-full border p-2 rounded-lg h-32" 
             placeholder="Type the question here..."
             value={formData.question_text}
             onChange={(e) => setFormData({...formData, question_text: e.target.value})}
           ></textarea>
        </div>

        {/* Dynamic Options (Only for MCQ) */}
        {formData.type === "mcq" && (
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700">Options</h3>
            {formData.options.map((opt, idx) => (
              <div key={opt.id} className="flex gap-3 items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full font-bold text-gray-600 uppercase">
                  {opt.id}
                </div>
                <input 
                  className="flex-1 border p-2 rounded-lg" 
                  placeholder={`Option ${opt.id.toUpperCase()}`}
                  value={opt.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                />
                <button 
                  onClick={() => setFormData({...formData, correct_answer: opt.id})}
                  className={`p-2 rounded-full transition ${
                    formData.correct_answer === opt.id 
                    ? "bg-green-100 text-green-600" 
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                  title="Mark as Correct"
                >
                  <CheckCircle size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Settings: Difficulty & Marks */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Difficulty</label>
            <select 
              className="w-full border p-2 rounded-lg"
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Marks</label>
            <input 
              type="number" 
              className="w-full border p-2 rounded-lg"
              value={formData.marks}
              onChange={(e) => setFormData({...formData, marks: Number(e.target.value)})}
            />
          </div>
          <div>
             <label className="block text-sm font-semibold mb-1">Correct Answer Key</label>
             <input 
               className="w-full border p-2 rounded-lg bg-gray-50"
               value={formData.correct_answer}
               readOnly={formData.type === 'mcq'} // Read only for MCQ (set via buttons)
               onChange={(e) => setFormData({...formData, correct_answer: e.target.value})}
               placeholder={formData.type === 'mcq' ? "Select option above" : "Type correct answer"}
             />
          </div>
        </div>

        {/* Submit */}
        <button 
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-primary to-primaryDark text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
        >
          <Save size={20} /> Save Question to Bank
        </button>

      </div>
    </div>
  );
}