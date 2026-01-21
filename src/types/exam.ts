// src/types/exam.ts

export interface Question {
    id: string;
    text: string;
    type: "MCQ" | "TEXT";
    options: string[];
    correctIndex: number;
    marks: number;
    imagePath?: string | null;
    subject?: string;
    difficulty?: string;
    tag?: string;
  }
  
  export interface Section {
    id: string;
    title: string;
    questions: Question[];
  }
  
  export interface ExamData {
    examId: string;
    title: string;
    sections: Section[];
  }
  
  export interface AttemptData {
    studentId: string;
    examId: string;
    // Mapping of Global Question Index (string) -> Selected Option Index (number)
    answers: Record<string, number>; 
    score?: number;
    totalQuestions?: number;
    correctCount?: number;
    wrongCount?: number;
  }