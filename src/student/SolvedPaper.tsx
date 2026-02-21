import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Tag, MinusCircle, AlertCircle, Filter, FileText } from 'lucide-react';
import { API_BASE_URL } from "@/config"; // Adjust this path if your config is elsewhere

export default function SolvedPaper({ exam, attempt }: { exam: any, attempt: any }) {
  const [filter, setFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL');

  if (!exam || !exam.questions || !attempt) {
    return <div className="p-8 text-center text-slate-500">Incomplete data provided to viewer.</div>;
  }

  // Helper to construct the full image URL
  const getFullImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('https')) return path; // Already an absolute URL
    
    // Remove '/api' from the end of API_BASE_URL if it exists to get the pure backend root
    const backendRoot = API_BASE_URL.replace(/\/api$/, ''); 
    return `${backendRoot}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Determine question status
  const getQuestionStatus = (q: any, index: number) => {
    const studentChoice = attempt.answers[index.toString()];
    
    if (studentChoice === undefined || studentChoice === null || studentChoice === "") {
      return 'SKIPPED';
    }
    
    const correctAnswer = q.correct_answer !== null ? q.correct_answer.toString() : null;
    if (correctAnswer !== null && studentChoice.toString() === correctAnswer) {
      return 'CORRECT';
    }
    
    return 'WRONG';
  };

  // Filter questions based on selection
  const filteredQuestions = exam.questions.map((q: any, index: number) => ({
    ...q,
    originalIndex: index,
    status: getQuestionStatus(q, index)
  })).filter((q: any) => filter === 'ALL' || q.status === filter);

  return (
    <div className="flex flex-col h-full animate-fade-in bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
      
      {/* Sticky Filter Header */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex flex-wrap gap-2 items-center justify-between shadow-sm">
        <div className="font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-blue-500" size={20} />
          {exam.title} Review
        </div>
        <div className="flex gap-2 text-sm font-bold">
          <FilterButton label="All" active={filter === 'ALL'} onClick={() => setFilter('ALL')} color="bg-slate-100 text-slate-700" />
          <FilterButton label="Correct" active={filter === 'CORRECT'} onClick={() => setFilter('CORRECT')} color="bg-emerald-50 text-emerald-700 border-emerald-200" icon={<CheckCircle size={14}/>} />
          <FilterButton label="Wrong" active={filter === 'WRONG'} onClick={() => setFilter('WRONG')} color="bg-red-50 text-red-700 border-red-200" icon={<XCircle size={14}/>} />
          <FilterButton label="Skipped" active={filter === 'SKIPPED'} onClick={() => setFilter('SKIPPED')} color="bg-gray-100 text-gray-500 border-gray-200" icon={<MinusCircle size={14}/>} />
        </div>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q: any) => {
            const indexStr = q.originalIndex.toString();
            const studentChoice = attempt.answers[indexStr];
            const timeTaken = attempt.timeSpent?.[indexStr] || attempt.time_spent?.[indexStr] || 0;
            const correctAnswer = q.correct_answer?.toString();

            // Handle both column naming conventions
            const imagePathRaw = q.image_url || q.image_path;

            return (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  q.status === 'CORRECT' ? 'bg-emerald-500' : 
                  q.status === 'WRONG' ? 'bg-red-500' : 'bg-slate-300'
                }`} />

                {/* Question Header Metadata */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4 ml-3 border-b border-slate-100 pb-3">
                  <span className="font-black text-slate-400 text-sm">Q {q.originalIndex + 1}</span>
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
                    {q.subject && <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{q.subject}</span>}
                    {q.difficulty && <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{q.difficulty}</span>}
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md">
                      <Clock size={12} /> {timeTaken}s
                    </span>
                  </div>
                </div>

                {/* Question Text & Image */}
                <div className="ml-3 mb-6 text-slate-800 text-lg font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                
                {/* 🟢 FIXED IMAGE RENDERER 🟢 */}
                {imagePathRaw && (
                  <div className="ml-3 mb-6">
                    <img 
                      src={getFullImageUrl(imagePathRaw)!} 
                      alt="Question Context" 
                      className="max-h-80 w-auto rounded-lg border border-slate-200 object-contain bg-slate-50 p-2 shadow-sm"
                      onError={(e) => {
                        // If image fails to load, hide it to keep UI clean
                        (e.target as HTMLImageElement).style.display = 'none';
                      }} 
                    />
                  </div>
                )}

                {/* Options List */}
                <div className="ml-3 space-y-3">
                  {q.options.map((opt: string, optIdx: number) => {
                    const optIdxStr = optIdx.toString();
                    const isStudentChoice = studentChoice?.toString() === optIdxStr;
                    const isCorrectAnswer = correctAnswer === optIdxStr;

                    let optStyle = "bg-slate-50 border-slate-200 text-slate-600";
                    let Icon = null;

                    if (isCorrectAnswer) {
                      optStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 font-bold";
                      Icon = <CheckCircle size={18} className="text-emerald-500" />;
                    } else if (isStudentChoice && !isCorrectAnswer) {
                      optStyle = "bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500";
                      Icon = <XCircle size={18} className="text-red-500" />;
                    }

                    return (
                      <div key={optIdx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${optStyle}`}>
                        <div className="flex items-center gap-3">
                           <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${isCorrectAnswer ? 'bg-emerald-500 text-white' : isStudentChoice ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                              {String.fromCharCode(65 + optIdx)}
                           </span>
                           <span dangerouslySetInnerHTML={{ __html: opt }} />
                        </div>
                        {Icon && <div>{Icon}</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Marks feedback */}
                <div className="ml-3 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    {q.status === 'CORRECT' ? (
                       <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={16}/> +{q.marks || 4} Marks Awarded</span>
                    ) : q.status === 'WRONG' ? (
                       <span className="text-red-600 flex items-center gap-1"><AlertCircle size={16}/> {q.negative_marks || -1} Penalty</span>
                    ) : (
                       <span className="text-slate-400">0 Marks (Unattempted)</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-slate-400 font-medium">
            <Filter size={48} className="mx-auto mb-4 opacity-20" />
            No questions match the current "{filter}" filter.
          </div>
        )}
      </div>
    </div>
  );
}

const FilterButton = ({ label, active, onClick, color, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${active ? color : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
  >
    {icon} {label}
  </button>
);