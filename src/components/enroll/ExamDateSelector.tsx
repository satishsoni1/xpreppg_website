// src/components/enroll/ExamDateSelector.tsx

import { Check } from "lucide-react";

interface Exam {
  id: number;
  title: string;
  label: string;
  date: string;
}

interface Props {
  exams: Exam[]; // 👈 Receive exams from parent
  max: number;
  selected: number[];
  onChange: (ids: number[]) => void;
}

export default function ExamDateSelector({ exams, max, selected, onChange }: Props) {
  
  const toggleExam = (examId: number) => {
    if (selected.includes(examId)) {
      onChange(selected.filter((id) => id !== examId));
    } else {
      if (selected.length >= max) {
        alert(`You can only select ${max} exam(s) with this plan.`);
        return;
      }
      onChange([...selected, examId]);
    }
  };

  if (exams.length === 0) {
    return <div className="text-gray-500 py-4">Loading available exams...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {exams.map((exam) => {
        const isSelected = selected.includes(exam.id);
        return (
          <div
            key={exam.id}
            onClick={() => toggleExam(exam.id)}
            className={`cursor-pointer border-2 rounded-xl p-4 transition-all flex justify-between items-center group
              ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-gray-200 hover:border-emerald-200 hover:bg-gray-50"
              }
            `}
          >
            <div>
              <h3 className={`font-bold ${isSelected ? "text-emerald-800" : "text-gray-800"}`}>
                {exam.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{exam.label}</p>
            </div>

            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                ${
                  isSelected
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-gray-300 group-hover:border-emerald-400"
                }
              `}
            >
              {isSelected && <Check size={14} strokeWidth={3} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}