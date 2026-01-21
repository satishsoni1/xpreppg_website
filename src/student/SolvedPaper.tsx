import { CheckCircle, XCircle, AlertCircle, HelpCircle } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[]; // ["Option A", "Option B"...]
  correctIndex: number;
  studentAnswer: number | null; // ✅ Value comes directly from DB now
  marks: number;
  imagePath?: string;
  difficulty?: string;
  subject?: string;
}

interface Section {
  id: string;
  title: string;
  questions: Question[];
}

interface SolvedPaperProps {
  exam: {
    title: string;
    sections: Section[];
  };
}

export default function SolvedPaper({ exam }: SolvedPaperProps) {
  if (!exam || !exam.sections) return <div>No data available</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Exam Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-slate-400 text-sm mt-1">Detailed Solutions & Analysis</p>
        </div>
      </div>

      {/* Sections Loop */}
      {exam.sections.map((section, secIndex) => (
        <div key={secIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Section Title */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">{section.title}</h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {section.questions.length} Questions
            </span>
          </div>

          {/* Questions Loop */}
          <div className="divide-y divide-gray-100">
            {section.questions.map((q, qIndex) => (
              <QuestionItem key={q.id} question={q} index={qIndex + 1} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Individual Question Item ---
function QuestionItem({ question, index }: { question: Question; index: number }) {
  const { text, options, correctIndex, studentAnswer, imagePath, marks } = question;

  // Logic Status
  const isUnattempted = studentAnswer === null;
  const isCorrect = studentAnswer === correctIndex;
  const isWrong = !isUnattempted && !isCorrect;

  return (
    <div className={`p-6 transition-colors ${
        isCorrect ? "bg-emerald-50/30" : isWrong ? "bg-red-50/30" : "hover:bg-gray-50"
      }`}
    >
      {/* Header Badge & Marks */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm">
            Q{index}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
            isCorrect ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
            isWrong ? "bg-red-100 text-red-700 border-red-200" :
            "bg-gray-100 text-gray-600 border-gray-200"
          }`}>
            {isCorrect && <><CheckCircle size={14} /> Correct (+{marks})</>}
            {isWrong && <><XCircle size={14} /> Incorrect (-1)</>}
            {isUnattempted && <><HelpCircle size={14} /> Unattempted</>}
          </span>
        </div>
      </div>

      {/* Question Body */}
      <div className="pl-11">
        <div className="text-gray-900 font-medium text-lg leading-relaxed whitespace-pre-wrap">
          {text}
        </div>

        {/* Image Display */}
        {imagePath && (
          <div className="mt-4 mb-6">
            <img 
              src={imagePath} 
              alt="Diagram" 
              className="max-h-80 rounded-lg border border-gray-200 shadow-sm"
              loading="lazy"
            />
          </div>
        )}

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
          {options.map((opt, idx) => {
            let optionClass = "border-gray-200 bg-white text-gray-700";
            let icon = null;

            // 1. Highlight Correct Answer (Always Green)
            if (idx === correctIndex) {
              optionClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium ring-1 ring-emerald-500";
              icon = <CheckCircle size={18} className="text-emerald-600" />;
            }
            
            // 2. Highlight Wrong Selection (Red)
            else if (idx === studentAnswer) {
              optionClass = "border-red-500 bg-red-50 text-red-900 font-medium ring-1 ring-red-500";
              icon = <XCircle size={18} className="text-red-600" />;
            }

            return (
              <div 
                key={idx} 
                className={`relative flex items-center justify-between p-3.5 rounded-lg border text-sm transition-all ${optionClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs border ${
                    idx === correctIndex ? "bg-emerald-200 border-emerald-300 text-emerald-800" :
                    idx === studentAnswer ? "bg-red-200 border-red-300 text-red-800" :
                    "bg-gray-100 border-gray-300 text-gray-500"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>
                {icon}
              </div>
            );
          })}
        </div>
        
        {/* Footer Tags */}
        <div className="mt-4 flex gap-2">
           {question.subject && <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">{question.subject}</span>}
           {question.difficulty && <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-2 py-1 rounded border border-purple-100">{question.difficulty}</span>}
        </div>
      </div>
    </div>
  );
}