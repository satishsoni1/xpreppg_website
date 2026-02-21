import React, { useState, useEffect } from 'react';
import { AdminAPI } from '@/services/adminApi';
import { Search, Filter, Eye, Loader2, Award, X } from 'lucide-react';
import StudentResult from '@/student/StudentResult';

export default function StudentAttemptsList() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('');
  
  // State for the Result Modal
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Assuming you add this endpoint to AdminAPI (see backend code below)
      const res = await AdminAPI.getEvaluatedResults();
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch results", err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique exam names for the filter dropdown
  const uniqueExams = Array.from(new Set(results.map(r => r.exam_name)));

  // Filter logic
  const filteredResults = results.filter(row => {
    const matchesSearch = row.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.student_mobile.includes(searchTerm);
    const matchesExam = selectedExamFilter ? row.exam_name === selectedExamFilter : true;
    return matchesSearch && matchesExam;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 font-sans">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Award className="text-emerald-500" size={32} />
            Evaluated Attempts
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">View and analyze final student report cards.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Name or Mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={selectedExamFilter}
              onChange={(e) => setSelectedExamFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Exams</option>
              {uniqueExams.map(exam => (
                <option key={exam as string} value={exam as string}>{exam}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-64">
             <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
             <p className="text-slate-500 font-medium">Loading records...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Rank</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Score</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Accuracy</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.length > 0 ? (
                  filteredResults.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{row.student_name}</p>
                        <p className="text-xs text-slate-500 font-mono">{row.student_mobile}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                          {row.exam_name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-black text-slate-700">#{row.rank || '-'}</span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-emerald-600">
                        {row.total_score}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full ${row.accuracy >= 70 ? 'bg-emerald-500' : row.accuracy >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${row.accuracy}%` }} />
                          </div>
                          <span className="text-xs font-bold">{row.accuracy}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => setSelectedResult(row)}
                          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                        >
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No evaluated attempts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Student Result */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-100 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Student Report Card</h2>
              <button 
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Renders the component you provided) */}
            <div className="overflow-y-auto p-6 flex-1">
              <StudentResult 
                result={formatResultDataForPDF(selectedResult)} 
                student={{ applicationNo: selectedResult.student_mobile }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper function to map DB row to your StudentResult props ---
function formatResultDataForPDF(dbRow: any) {
  // Convert seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  // Map Tag Analysis
  const parsedTags = typeof dbRow.tag_analysis === 'string' ? JSON.parse(dbRow.tag_analysis) : dbRow.tag_analysis;
  const mappedTags = Object.entries(parsedTags || {}).map(([key, val]: any) => ({
    name: key,
    accuracy: val.accuracy,
    correct: val.correct,
    total: val.total,
    avgTime: formatTime(val.avg_time || 0),
    totalTime: formatTime((val.avg_time || 0) * val.total) // Approximation if total time per tag isn't saved directly
  }));

  // Map Subject Analysis
  const parsedSubjects = typeof dbRow.subject_analysis === 'string' ? JSON.parse(dbRow.subject_analysis) : dbRow.subject_analysis;
  const mappedSubjects = Object.entries(parsedSubjects || {}).map(([key, val]: any) => ({
    subject: key.replace(/_/g, ' '),
    totalQs: val.total,
    correct: val.correct,
    score: val.score || 0,
    accuracy: val.accuracy,
    avgTime: formatTime(val.avg_time || 0),
    totalTime: formatTime((val.avg_time || 0) * val.total)
  }));

  // Map Difficulty Analysis
  const parsedDiff = typeof dbRow.difficulty_analysis === 'string' ? JSON.parse(dbRow.difficulty_analysis) : dbRow.difficulty_analysis;
  const mappedDiff = Object.entries(parsedDiff || {}).map(([key, val]: any) => ({
    name: key,
    accuracy: val.accuracy,
    correct: val.correct,
    total: val.total
  }));

  return {
    rank: dbRow.rank || 1,
    totalStudents: 1500, // You can make this dynamic later
    totalScore: dbRow.total_score,
    totalQs: dbRow.total_qs,
    attempted: dbRow.attempted,
    unattempted: dbRow.unattempted,
    correct: dbRow.correct,
    incorrect: dbRow.incorrect,
    accuracy: dbRow.accuracy,
    totalTime: formatTime(dbRow.total_time_seconds || 0),
    tags: mappedTags,
    difficulty: mappedDiff,
    subjects: mappedSubjects
  };
}