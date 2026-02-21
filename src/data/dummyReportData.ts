export const DUMMY_REPORT_LIST = {
    status: true,
    reports: [
      {
        exam_id: 1,
        exam_name: "Grand CBT 1 (National Mock)",
        rank: 12,
        created_at: "2026-02-18T23:51:53.289Z",
        total_score: 525
      },
      {
        exam_id: 3,
        exam_name: "Subject-Wise: Anatomy & Physiology",
        rank: 5,
        created_at: "2026-02-12T14:30:00.000Z",
        total_score: 180
      }
    ]
  };
  
  export const DUMMY_REPORT_DETAIL = {
    status: true,
    report: {
      exam_id: 1,
      exam_name: "Grand CBT 1 (National Mock)",
      student_id: "7208613312",
      rank: 12,
      total_qs: 200,
      attempted: 185,
      unattempted: 15,
      correct: 142,
      incorrect: 43,
      accuracy: 76,
      total_time_seconds: 6840, // 1 hour 54 mins
      total_score: 525, // (142 * 4) - (43 * 1) = 525
      
      // Analyzed from your "answers" and "time_spent" JSONB columns
      tag_analysis: {
        "Single Best Answer": { total: 120, correct: 95, accuracy: 79, avg_time: 28 },
        "Image Based": { total: 40, correct: 25, accuracy: 62, avg_time: 42 },
        "Clinical Scenario": { total: 40, correct: 22, accuracy: 55, avg_time: 58 }
      },
      
      // Analyzed by joining questions table with attempt JSON
      subject_analysis: {
        "ANATOMY": { total: 15, correct: 12, score: 45, accuracy: 80 },
        "PHYSIOLOGY": { total: 15, correct: 10, score: 35, accuracy: 66 },
        "BIOCHEMISTRY": { total: 15, correct: 14, score: 55, accuracy: 93 },
        "PATHOLOGY": { total: 20, correct: 15, score: 55, accuracy: 75 },
        "PHARMACOLOGY": { total: 20, correct: 18, score: 70, accuracy: 90 },
        "MICROBIOLOGY": { total: 15, correct: 9, score: 31, accuracy: 60 },
        "MEDICINE": { total: 40, correct: 25, score: 85, accuracy: 62 },
        "SURGERY": { total: 30, correct: 22, score: 80, accuracy: 73 },
        "OBG": { total: 30, correct: 17, score: 57, accuracy: 56 }
      }
    },
    exam: null, // Add dummy exam data here later for the "Solved Paper" view
    attempt: null
  };