import React, { useState, useEffect, useRef } from "react";
import { Save, CheckCircle, Image as ImageIcon, BookOpen, FileText, UploadCloud, Loader2, List, PlusCircle, AlertCircle, Clock } from "lucide-react";
import { AdminAPI } from "@/services/adminApi"; // Adjust path if needed

export default function AdminQuestions() {
  const [exams, setExams] = useState<any[]>([]);
  const [examId, setExamId] = useState("");
  
  // Tabs & Existing Questions State
  const [activeTab, setActiveTab] = useState<'ADD' | 'VIEW'>('ADD');
  const [existingQuestions, setExistingQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const [isUploading, setIsUploading] = useState({ question: false, explanation: false });
  
  const [formData, setFormData] = useState({
    type: "CB", // Adjusted to your default
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

  // 1. Fetch Exams on Mount
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

  // 2. Fetch Questions when Exam changes
  useEffect(() => {
    if (examId) {
      fetchQuestions(examId);
    }
  }, [examId]);

  const fetchQuestions = async (id: string) => {
    setIsLoadingQuestions(true);
    try {
      const res = await AdminAPI.getQuestions(id);
      // Adjust according to your exact API response structure (res.data or res.questions)
      if (res.status) {
        setExistingQuestions(res.questions || res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch questions", err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = val;
    setFormData({ ...formData, options: newOptions });
  };

  // Handle File Upload to Backend using AdminAPI
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
        setFormData(prev => ({ ...prev, [targetField]: data.url }));
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file to server.");
    } finally {
      setIsUploading(prev => ({ ...prev, [uploadType]: false }));
      if (e.target) e.target.value = '';
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
        // Reset form
        setFormData({ 
          ...formData, 
          question_text: "", 
          image_url: "", 
          options: ["", "", "", ""], 
          correct_answer: "",
          description: "",
          description_image: ""
        });
        // Refresh the questions list automatically
        fetchQuestions(examId);
        // Optionally switch to view tab: setActiveTab('VIEW');
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
      
      {/* HEADER & EXAM SELECTOR */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-blue-600" /> Exam Questions Manager
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="font-semibold text-slate-600 whitespace-nowrap">Select Exam:</label>
          <select 
            className="w-full md:w-auto border-2 border-slate-200 p-2 rounded-lg bg-slate-50 font-medium outline-none focus:border-blue-500"
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

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <button 
          onClick={() => setActiveTab('ADD')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 font-bold rounded-lg transition-all ${activeTab === 'ADD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
        >
          <PlusCircle size={18} /> Add New Question
        </button>
        <button 
          onClick={() => setActiveTab('VIEW')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 font-bold rounded-lg transition-all ${activeTab === 'VIEW' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
        >
          <List size={18} /> Question Bank ({existingQuestions.length})
        </button>
      </div>

      {/* TAB CONTENT: ADD NEW QUESTION */}
      {activeTab === 'ADD' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8 animate-fade-in">
          
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
               {formData.image_url && <img src={formData.image_url} alt="Preview" className="mt-3 h-24 rounded-lg border shadow-sm object-contain bg-slate-50 p-2" />}
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
               {formData.description_image && <img src={formData.description_image} alt="Preview" className="mt-3 h-24 rounded-lg border shadow-sm object-contain bg-white p-2" />}
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
      )}

      {/* TAB CONTENT: VIEW EXISTING QUESTIONS */}
      {activeTab === 'VIEW' && (
        <div className="space-y-6 animate-fade-in">
          {isLoadingQuestions ? (
            <div className="text-center py-20 text-slate-400 font-bold flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              Loading Questions...
            </div>
          ) : existingQuestions.length === 0 ? (
            <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              No questions found for this exam.
            </div>
          ) : (
            existingQuestions.map((q, idx) => {
              // Parse options if they are stored as JSON string
              let parsedOptions: string[] = [];
              try {
                parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
              } catch (e) {
                console.error("Failed to parse options for question", q.id);
              }

              return (
                <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                  
                  {/* Meta Bar */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-slate-100 pb-3">
                    <span className="font-black text-slate-400 text-sm">Q {idx + 1}</span>
                    <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
                      {q.subject && <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{q.subject}</span>}
                      {q.difficulty && <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{q.difficulty}</span>}
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+{q.marks || 4} Marks</span>
                      <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">{q.negative_marks || -1} Penalty</span>
                    </div>
                  </div>

                  {/* Question Text & Image */}
                  <div className="text-slate-800 text-lg font-medium leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                  {q.image_url && (
                    <div className="mb-6">
                      <img src={q.image_url} alt="Question" className="max-h-64 w-auto rounded-lg border border-slate-200 object-contain bg-slate-50 p-2" />
                    </div>
                  )}

                  {/* Options List */}
                  <div className="space-y-3 mb-6">
                    {parsedOptions.map((opt: string, optIdx: number) => {
                      const isCorrectAnswer = q.correct_answer?.toString() === optIdx.toString();
                      
                      return (
                        <div key={optIdx} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          isCorrectAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                           <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${isCorrectAnswer ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                              {String.fromCharCode(65 + optIdx)}
                           </span>
                           <span dangerouslySetInnerHTML={{ __html: opt }} />
                           {isCorrectAnswer && <CheckCircle size={18} className="text-emerald-500 ml-auto" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Section */}
                  {(q.description || q.description_image) && (
                    <div className="mt-4 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold mb-3 text-sm tracking-wide">
                        <FileText size={16} className="text-indigo-500" /> Explanation
                      </div>
                      {q.description && (
                        <div className="text-slate-700 text-sm leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: q.description }} />
                      )}
                      {q.description_image && (
                        <img src={q.description_image} alt="Explanation" className="max-h-64 w-auto rounded-lg border border-indigo-200 object-contain bg-white p-2" />
                      )}
                    </div>
                  )}

                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  );
}