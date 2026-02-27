import React, { useState, useEffect, useRef } from "react";
import { Save, CheckCircle, Image as ImageIcon, BookOpen, FileText, UploadCloud, Loader2 } from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

export default function AdminQuestions() {
  const [exams, setExams] = useState<any[]>([]);
  const [examId, setExamId] = useState("");
  const [isUploading, setIsUploading] = useState({ question: false, explanation: false });
  
  const [formData, setFormData] = useState({
    type: "CB",
    question_text: "",
    image_url: "",
    options: ["", "", "", ""],
    correct_answer: "",
    marks: 4,
    negative_marks: -1,
    subject: "ANATOMY",
    difficulty: "MEDIUM",
    description: "",
    description_image: ""
  });

  const questionFileInputRef = useRef<HTMLInputElement>(null);
  const explanationFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await AdminAPI.getExams();
        if (data.status) {
          setExams(data.exams);
          if (data.exams.length > 0) setExamId(data.exams[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to fetch exams", err);
      }
    };
    fetchExams();
  }, []);

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = val;
    setFormData({ ...formData, options: newOptions });
  };

  // 🟢 Handle File Upload to Backend using AdminAPI 🟢
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'image_url' | 'description_image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadType = targetField === 'image_url' ? 'question' : 'explanation';
    setIsUploading(prev => ({ ...prev, [uploadType]: true }));

    const payload = new FormData();
    payload.append("image", file);

    try {
      const data = await AdminAPI.uploadImage(payload);

      if (data.status) {
        // Update the form data with the returned public URL
        setFormData(prev => ({ ...prev, [targetField]: data.url }));
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file to server.");
    } finally {
      setIsUploading(prev => ({ ...prev, [uploadType]: false }));
      // Reset input value so same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!examId) return alert("Please select an exam first.");
    if (!formData.question_text || formData.correct_answer === "") {
      return alert("Please fill the question text and select a correct answer.");
    }

    try {
      const res = await AdminAPI.addQuestion({ ...formData, exam_id: examId });
      
      if (res.status) {
        alert("Question Saved Successfully!");
        setFormData({ 
          ...formData, 
          question_text: "", 
          image_url: "", 
          options: ["", "", "", ""], 
          correct_answer: "",
          description: "",
          description_image: ""
        });
      } else {
        alert("Error saving question: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-blue-600" /> Add New Question
        </h1>
        <div className="flex items-center gap-3">
          <label className="font-semibold text-slate-600">Select Exam:</label>
          <select 
            className="border-2 border-slate-200 p-2 rounded-lg bg-slate-50 font-medium outline-none focus:border-blue-500"
            value={examId} 
            onChange={(e) => setExamId(e.target.value)}
          >
            {exams.length === 0 && <option value="">Loading exams...</option>}
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">
        
        {/* Row 1: Type & Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
            <input 
              className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all" 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Question Type</label>
            <select 
              className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="CB">Multiple Choice (MCQ)</option>
            </select>
          </div>
        </div>

        {/* Question Text & Image */}
        <div className="space-y-4">
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Question Text *</label>
             <textarea 
               className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all h-32" 
               placeholder="Type the question here..."
               value={formData.question_text}
               onChange={(e) => setFormData({...formData, question_text: e.target.value})}
             />
           </div>
           
           {/* Question Image Upload UI */}
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
               <ImageIcon size={16}/> Question Image
             </label>
             <div className="flex gap-2 items-center">
               <input 
                 className="flex-1 border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all" 
                 placeholder="Public Image URL (Upload or paste URL here)"
                 value={formData.image_url}
                 onChange={(e) => setFormData({...formData, image_url: e.target.value})}
               />
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 ref={questionFileInputRef}
                 onChange={(e) => handleImageUpload(e, 'image_url')}
               />
               <button 
                 onClick={() => questionFileInputRef.current?.click()}
                 className="px-4 py-3 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-xl flex items-center gap-2 transition-all"
                 disabled={isUploading.question}
               >
                 {isUploading.question ? <Loader2 className="animate-spin" size={20}/> : <UploadCloud size={20}/>}
                 Upload
               </button>
             </div>
             {formData.image_url && <img src={formData.image_url} alt="Preview" className="mt-3 h-24 rounded-lg border shadow-sm" />}
           </div>
        </div>

        {/* Dynamic Options */}
        {formData.type === "CB" && (
          <div className="space-y-3 bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <CheckCircle size={18}/> Answer Options (Select correct answer)
            </h3>
            {formData.options.map((opt, idx) => {
              const isCorrect = formData.correct_answer === idx.toString();
              return (
                <div key={idx} className="flex gap-3 items-center">
                  <button 
                    onClick={() => setFormData({...formData, correct_answer: idx.toString()})}
                    className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full font-bold transition-all border-2 ${
                      isCorrect ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : "bg-white text-slate-400 border-slate-200"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </button>
                  <input 
                    className={`flex-1 border-2 p-3 rounded-xl outline-none transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white focus:border-blue-500'}`}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Explanation Section */}
        <div className="space-y-4 bg-indigo-50/50 border border-indigo-100 p-6 rounded-2xl">
           <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
             <FileText size={18}/> Explanation / Solution (Optional)
           </h3>
           <div>
             <label className="block text-sm font-semibold text-indigo-800 mb-2">Explanation Text</label>
             <textarea 
               className="w-full border-2 border-indigo-200 p-3 rounded-xl bg-white focus:border-indigo-500 outline-none transition-all h-28" 
               placeholder="Detailed explanation..."
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
             />
           </div>

           {/* Explanation Image Upload UI */}
           <div>
             <label className="block text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-1">
               <ImageIcon size={16}/> Explanation Image
             </label>
             <div className="flex gap-2 items-center">
               <input 
                 className="flex-1 border-2 border-indigo-200 p-3 rounded-xl bg-white focus:border-indigo-500 outline-none transition-all" 
                 placeholder="Public Explanation Image URL"
                 value={formData.description_image}
                 onChange={(e) => setFormData({...formData, description_image: e.target.value})}
               />
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 ref={explanationFileInputRef}
                 onChange={(e) => handleImageUpload(e, 'description_image')}
               />
               <button 
                 onClick={() => explanationFileInputRef.current?.click()}
                 className="px-4 py-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold rounded-xl flex items-center gap-2 transition-all"
                 disabled={isUploading.explanation}
               >
                 {isUploading.explanation ? <Loader2 className="animate-spin" size={20}/> : <UploadCloud size={20}/>}
                 Upload
               </button>
             </div>
             {formData.description_image && <img src={formData.description_image} alt="Preview" className="mt-3 h-24 rounded-lg border shadow-sm" />}
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
            <select 
              className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white outline-none"
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Marks (+)</label>
            <input 
              type="number" 
              className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white outline-none"
              value={formData.marks}
              onChange={(e) => setFormData({...formData, marks: Number(e.target.value)})}
            />
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Negative Marks (-)</label>
             <input 
               type="number"
               step="0.1" 
               className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white outline-none"
               value={formData.negative_marks}
               onChange={(e) => setFormData({...formData, negative_marks: Number(e.target.value)})}
             />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Save size={24} /> Save Question to Database
        </button>

      </div>
    </div>
  );
}