import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, ChevronRight, ChevronLeft, Flag, CheckCircle } from "lucide-react";

export default function StudentExamPortal() {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({}); // Local state for UI
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 180 mins default
  
  // Time Tracking Refs
  const questionStartTime = useRef<number>(Date.now());
  
  useEffect(() => {
    // 1. Fetch Questions for this exam
    // In real app, fetch from /api/student/exam/:id/questions
    // Mocking Data for now based on your Admin schema
    const mockQuestions = [
       { id: 101, text: "Which nerve innervates the Deltoid?", type: "mcq", options: [{id:"a", text:"Axillary"}, {id:"b", text:"Radial"}] },
       { id: 102, text: "Describe the circle of Willis.", type: "text" },
       // ... fetch real data
    ];
    setQuestions(mockQuestions);
  }, [examId]);

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
       setTimeLeft((prev) => {
          if (prev <= 0) {
             submitExam();
             return 0;
          }
          return prev - 1;
       });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- SAVE ANSWER LOGIC ---
  const saveCurrentAnswer = async () => {
     const q = questions[currentQIndex];
     const selected = answers[q.id];
     
     // Calculate time spent on THIS question
     const now = Date.now();
     const timeSpent = Math.floor((now - questionStartTime.current) / 1000);
     
     // Reset timer for next question
     questionStartTime.current = now;

     if (!selected) return; // Nothing to save

     try {
       await fetch("http://localhost:5001/api/student/exam/save-answer", {
         method: "POST",
         headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
         },
         body: JSON.stringify({
            exam_id: examId,
            question_id: q.id,
            selected_option: selected,
            time_spent_seconds: timeSpent
         })
       });
     } catch (err) {
       console.error("Auto-save failed", err);
     }
  };

  const handleNext = async () => {
    await saveCurrentAnswer();
    if (currentQIndex < questions.length - 1) {
       setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrev = async () => {
    await saveCurrentAnswer(); // Save before moving back too
    if (currentQIndex > 0) {
       setCurrentQIndex(prev => prev - 1);
    }
  };

  const submitExam = async () => {
    await saveCurrentAnswer(); // Save last question
    // Call Submit API
    await fetch("http://localhost:5001/api/student/exam/submit", {
         method: "POST",
         headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
         },
         body: JSON.stringify({
            exam_id: examId,
            total_time_seconds: (180 * 60) - timeLeft
         })
    });
    alert("Exam Submitted Successfully!");
    navigate("/student/report-card");
  };

  if (questions.length === 0) return <div>Loading Exam...</div>;

  const currentQ = questions[currentQIndex];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* LEFT: Question Area */}
      <div className="flex-1 flex flex-col">
         {/* Top Bar */}
         <div className="h-16 bg-white border-b px-6 flex justify-between items-center">
            <h2 className="font-bold text-lg">NEET PG Grand Test</h2>
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-primaryDark text-white px-4 py-2 rounded-lg font-mono">
               <Clock size={18} />
               {Math.floor(timeLeft / 3600)}:{Math.floor((timeLeft % 3600) / 60)}:{timeLeft % 60}
            </div>
         </div>

         {/* Question Content */}
         <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
               <div className="flex justify-between items-start mb-4">
                  <span className="font-bold text-gray-500">Question {currentQIndex + 1} of {questions.length}</span>
                  <span className="text-sm bg-gray-200 px-2 py-1 rounded">+4 / -1</span>
               </div>
               
               <p className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                  {currentQ.text}
               </p>

               {/* Options (if MCQ) */}
               {currentQ.type === 'mcq' ? (
                 <div className="space-y-3">
                    {currentQ.options?.map((opt: any) => (
                       <label 
                         key={opt.id} 
                         className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                            answers[currentQ.id] === opt.id 
                            ? "border-emerald-500 bg-emerald-50" 
                            : "border-gray-200 hover:border-emerald-200"
                         }`}
                       >
                          <input 
                            type="radio" 
                            name={`q-${currentQ.id}`} 
                            className="hidden"
                            onChange={() => setAnswers({...answers, [currentQ.id]: opt.id})}
                            checked={answers[currentQ.id] === opt.id}
                          />
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 font-bold ${
                             answers[currentQ.id] === opt.id ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"
                          }`}>
                             {opt.id.toUpperCase()}
                          </div>
                          <span className="text-lg text-gray-800">{opt.text}</span>
                       </label>
                    ))}
                 </div>
               ) : (
                 <textarea 
                    className="w-full h-40 border p-4 rounded-xl text-lg"
                    placeholder="Type your answer here..."
                    onChange={(e) => setAnswers({...answers, [currentQ.id]: e.target.value})}
                    value={answers[currentQ.id] || ""}
                 />
               )}
            </div>
         </div>

         {/* Footer Controls */}
         <div className="h-20 bg-white border-t px-8 flex justify-between items-center">
            <button 
               onClick={handlePrev} 
               disabled={currentQIndex === 0}
               className="flex items-center gap-2 text-gray-600 font-semibold hover:bg-gray-100 px-4 py-2 rounded-lg disabled:opacity-50"
            >
               <ChevronLeft /> Previous
            </button>

            <button className="flex items-center gap-2 text-orange-600 font-semibold hover:bg-orange-50 px-4 py-2 rounded-lg">
               <Flag size={18} /> Mark for Review
            </button>

            {currentQIndex === questions.length - 1 ? (
                <button 
                  onClick={submitExam}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg"
                >
                  Submit Exam
                </button>
            ) : (
                <button 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-primary to-primaryDark text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2"
                >
                  Save & Next <ChevronRight size={18} />
                </button>
            )}
         </div>
      </div>

      {/* RIGHT: Question Palette (Sidebar) */}
      <div className="w-80 bg-white border-l flex flex-col">
         <div className="p-4 border-b">
            <h3 className="font-bold text-gray-800">Question Palette</h3>
         </div>
         <div className="flex-1 p-4 grid grid-cols-4 gap-3 content-start overflow-y-auto">
            {questions.map((q, idx) => (
               <button
                  key={q.id}
                  onClick={() => { saveCurrentAnswer(); setCurrentQIndex(idx); }}
                  className={`h-10 w-10 rounded-lg font-bold text-sm flex items-center justify-center transition ${
                     currentQIndex === idx 
                        ? "ring-2 ring-slate-900" 
                        : ""
                  } ${
                     answers[q.id] 
                        ? "bg-emerald-500 text-white" // Answered
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200" // Not Answered
                  }`}
               >
                  {idx + 1}
               </button>
            ))}
         </div>
         <div className="p-4 bg-gray-50 border-t text-xs text-gray-500 space-y-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded"></div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 rounded"></div> Not Answered</div>
         </div>
      </div>

    </div>
  );
}