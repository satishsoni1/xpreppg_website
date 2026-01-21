// src/pages/student/ReportCardDetail.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import SolvedPaper from "./SolvedPaper";

export default function ReportCardDetail() {
  const { examId } = useParams();
  const [examData, setExamData] = useState<any>(null);
  const [attemptData, setAttemptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // You need an endpoint that returns BOTH the exam structure and the student's attempt
        // OR fetch them separately
        const response = await StudentAPI.getReportDetail(examId);
        
        if (response.status) {
          setExamData(response.exam);       // The Question Set JSON
          setAttemptData(response.attempt); // The Attempt JSON
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [examId]);

  if (loading) return <div>Loading Analysis...</div>;
  if (!examData || !attemptData) return <div>Data not found</div>;

  return <SolvedPaper exam={examData} attempt={attemptData} />;
}