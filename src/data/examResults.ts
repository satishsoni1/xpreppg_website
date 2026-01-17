// src/data/examResults.ts

export interface SubjectPerformance {
    subject: string;
    totalQs: number;
    correct: number;
    avgTime: string;
    totalTime: string;
    score: number;
    accuracy: string;
  }
  
  export interface ExamResult {
    candidateId: string; // e.g., ABHI0331
    rank: number;
    totalScore: number;
    totalQs: number;
    totalTime: string;
    attempted: number;
    unattempted: number;
    correct: number;
    incorrect: number;
    accuracy: string;
    
    // Analysis Sections
    difficulty: {
      easy: { percentage: string; correct: string };
      medium: { percentage: string; correct: string };
      hard: { percentage: string; correct: string };
    };
    
    questionType: {
      clinical: { percentage: string; correct: string; avgTime?: string; totalTime: string };
      image: { percentage: string; correct: string; avgTime: string; totalTime: string };
      oneLiner: { percentage: string; correct: string; avgTime: string; totalTime: string };
    };
  
    subjects: SubjectPerformance[];
  }
  
  // ------------------------------------------------------------------
  // PASTE YOUR FULL DATA BELOW (Converted from CSV)
  // ------------------------------------------------------------------
  export const EXAM_RESULTS: Record<string, ExamResult> = {
    "ABHI0331": {
      candidateId: "ABHI0331",
      rank: 551,
      totalScore: 286,
      totalQs: 200,
      totalTime: "3h 28m 18s",
      attempted: 199,
      unattempted: 1,
      correct: 97,
      incorrect: 102,
      accuracy: "48.7%",
      difficulty: {
        easy: { percentage: "52.1%", correct: "37/71" },
        medium: { percentage: "50.0%", correct: "31/62" },
        hard: { percentage: "43.3%", correct: "29/67" }
      },
      questionType: {
        clinical: { percentage: "51.3%", correct: "39/76", totalTime: "1h 57m 7s" },
        image: { percentage: "39.6%", correct: "19/48", avgTime: "65.6s", totalTime: "52m 31s" },
        oneLiner: { percentage: "51.3%", correct: "39/76", avgTime: "30.5s", totalTime: "38m 40s" }
      },
      subjects: [
        { subject: "ENT", totalQs: 7, correct: 5, avgTime: "74.7s", totalTime: "8m 43s", score: 18, accuracy: "71.4%" },
        { subject: "BIOCHEMISTRY", totalQs: 15, correct: 10, avgTime: "57.3s", totalTime: "14m 19s", score: 35, accuracy: "66.7%" },
        { subject: "FMT", totalQs: 8, correct: 5, avgTime: "64.0s", totalTime: "8m 32s", score: 17, accuracy: "62.5%" },
        { subject: "COMMUNITY MEDICINE", totalQs: 8, correct: 5, avgTime: "43.8s", totalTime: "5m 50s", score: 17, accuracy: "62.5%" },
        { subject: "PHARMACOLOGY", totalQs: 10, correct: 6, avgTime: "77.3s", totalTime: "12m 53s", score: 20, accuracy: "60.0%" },
        { subject: "ORTHO", totalQs: 5, correct: 3, avgTime: "48.4s", totalTime: "4m 2s", score: 10, accuracy: "60.0%" },
        { subject: "OPTHALMOLOGY", totalQs: 5, correct: 3, avgTime: "69.8s", totalTime: "5m 49s", score: 10, accuracy: "60.0%" },
        { subject: "OBS & GYN", totalQs: 23, correct: 13, avgTime: "76.3s", totalTime: "29m 14s", score: 42, accuracy: "56.5%" },
        { subject: "SURGERY", totalQs: 20, correct: 10, avgTime: "52.8s", totalTime: "17m 36s", score: 31, accuracy: "50.0%" },
        { subject: "PHYSIOLOGY", totalQs: 8, correct: 4, avgTime: "57.1s", totalTime: "7m 37s", score: 12, accuracy: "50.0%" },
        { subject: "MEDICINE", totalQs: 20, correct: 10, avgTime: "70.5s", totalTime: "23m 30s", score: 30, accuracy: "50.0%" },
        { subject: "PATHOLOGY", totalQs: 12, correct: 6, avgTime: "61.4s", totalTime: "12m 17s", score: 18, accuracy: "50.0%" },
        { subject: "PSYCHIATRY", totalQs: 5, correct: 2, avgTime: "91.0s", totalTime: "7m 35s", score: 5, accuracy: "40.0%" },
        { subject: "PEDIATRICS", totalQs: 5, correct: 2, avgTime: "47.6s", totalTime: "3m 58s", score: 5, accuracy: "40.0%" }
      ]
    },
    // Add other students (YUGA0864, SUJI4434, etc.) here following the same structure
  };