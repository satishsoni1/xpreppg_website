import React, { useState, useEffect } from 'react';
import { AdminAPI } from '@/services/adminApi';
import { Search, Filter, Eye, Loader2, Award, X, TrendingUp, CheckCircle, FileText, ArrowLeft } from 'lucide-react';
import StudentResult from '@/student/StudentResult'; // Adjust path if needed
import SolvedPaper from '@/student/SolvedPaper'; // Adjust path if needed

export default function StudentAttemptsList() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('');
  
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  // Solved Paper States inside Modal
  const [viewMode, setViewMode] = useState<'summary' | 'paper'>('summary');
  const [paperLoading, setPaperLoading] = useState(false);
  const [examFullData, setExamFullData] = useState<any>(null);
  const [attemptFullData, setAttemptFullData] = useState<any>(null);

  // Rank Generation State
  const [showRankModal, setShowRankModal] = useState(false);
  const [rankExamId, setRankExamId] = useState('');
  const [rankTotalStudents, setRankTotalStudents] = useState<number | ''>(2653);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankMessage, setRankMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
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

  const uniqueExams = Array.from(new Map(results.map(r => [r.exam_id, { id: r.exam_id, name: r.exam_name }])).values());

  const filteredResults = results.filter(row => {
    const matchesSearch = row.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.student_mobile?.includes(searchTerm);
    const matchesExam = selectedExamFilter ? row.exam_id.toString() === selectedExamFilter : true;
    return matchesSearch && matchesExam;
  });

  const handleGenerateRanks = async () => {
    if (!rankExamId || !rankTotalStudents) return;
    
    setRankLoading(true);
    setRankMessage(null);
    try {
      const res = await AdminAPI.generateRanks(Number(rankExamId), Number(rankTotalStudents));
      if (res.success) {
        setRankMessage(res.message);
        fetchResults();
      } else {
        setRankMessage("Error: " + res.message);
      }
    } catch (error) {
      setRankMessage("Server connection failed.");
    } finally {
      setRankLoading(false);
    }
  };

  // --- NEW: Fetch Solved Paper for specific student ---
  const handleViewSolvedPaper = async () => {
    setViewMode('paper');
    if (examFullData && attemptFullData) return; // Don't refetch if already loaded

    setPaperLoading(true);
    try {
      // Admin needs to pass BOTH examId and studentId to get the specific attempt
      const res = await AdminAPI.getStudentAttemptPaper(selectedResult.exam_id, selectedResult.student_id); 
      
      if (res.status || res.success) {
        setExamFullData(res.exam);
        setAttemptFullData(res.attempt);
      } else {
        alert("Failed to load paper details.");
        setViewMode('summary');
      }
    } catch (error) {
      console.error(error);
      alert("Error loading paper.");
      setViewMode('summary');
    } finally {
      setPaperLoading(false);
    }
  };

  // Helper to close modal and reset states
  const closeResultModal = () => {
    setSelectedResult(null);
    setViewMode('summary');
    setExamFullData(null);
    setAttemptFullData(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 font-sans relative animate-fade-in">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Award className="text-emerald-500" size={32} />
            Evaluated Attempts
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">View report cards and generate cohort rankings.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <button 
            onClick={() => setShowRankModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all"
          >
            <TrendingUp size={18} /> Generate Ranks
          </button>

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
              {uniqueExams.map((exam: any) => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
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
                  <th className="py-4 px-6 text-xs font-bold text-indigo-500 uppercase tracking-wider text-center">Calculated Rank</th>
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
                        {row.rank ? (
                          <span className="bg-indigo-50 text-indigo-700 font-black px-3 py-1 rounded-lg">#{row.rank}</span>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">Not Ranked</span>
                        )}
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

      {/* Rank Generation Modal (Hidden for brevity, but stays exactly as you had it) */}
      {showRankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="text-indigo-500"/> Generate Cohort Ranks</h2>
              <button onClick={() => setShowRankModal(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Exam</label>
                <select value={rankExamId} onChange={e => setRankExamId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">-- Choose Exam --</option>
                  {uniqueExams.map((exam: any) => (
                    <option key={exam.id} value={exam.id}>{exam.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Total Manual Cohort Size</label>
                <input type="number" value={rankTotalStudents} onChange={e => setRankTotalStudents(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., 2653" />
              </div>

              <button 
                onClick={handleGenerateRanks} 
                disabled={rankLoading || !rankExamId || !rankTotalStudents}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl mt-4 flex justify-center items-center gap-2 transition-all"
              >
                {rankLoading ? <Loader2 className="animate-spin" size={20}/> : "Execute Rank Automation"}
              </button>

              {rankMessage && (
                <div className={`p-3 rounded-lg text-sm font-medium mt-4 flex items-start gap-2 ${rankMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {rankMessage.includes('Error') ? <X size={18}/> : <CheckCircle size={18} className="mt-0.5 shrink-0"/>}
                  <span>{rankMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Student Result & Solved Paper */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-100 w-full max-w-6xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-200 shadow-sm z-10">
              <h2 className="font-bold text-slate-800">
                {viewMode === 'summary' ? "Student Report Card" : "Solved Paper View"}
              </h2>
              <div className="flex items-center gap-4">
                
                {/* Toggle Button for Solved Paper */}
                {viewMode === 'summary' ? (
                  <button 
                    onClick={handleViewSolvedPaper}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md"
                  >
                    <FileText size={16} /> View Solved Paper
                  </button>
                ) : (
                  <button 
                    onClick={() => setViewMode('summary')}
                    className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                  >
                    <ArrowLeft size={16} /> Back to Summary
                  </button>
                )}

                <button onClick={closeResultModal} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 flex-1 bg-slate-50">
              {viewMode === 'summary' ? (
                <StudentResult 
                  result={formatResultDataForPDF(selectedResult)} 
                  student={{ applicationNo: selectedResult.student_mobile }} 
                />
              ) : (
                paperLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Loading Full Paper Analysis...</p>
                  </div>
                ) : examFullData ? (
                  <SolvedPaper exam={examFullData} attempt={attemptFullData} />
                ) : (
                  <div className="p-10 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                    <p className="mb-2 font-bold text-lg">Data Unavailable</p>
                    <p className="text-sm">The detailed question paper data could not be loaded.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper function to map DB row to your StudentResult props ---
function formatResultDataForPDF(dbRow: any) {
  if (!dbRow) return null;

  const formatTime = (secs: number) => {
    if (!secs) return "0m 0s";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const parsedTags = typeof dbRow.tag_analysis === 'string' ? JSON.parse(dbRow.tag_analysis) : (dbRow.tag_analysis || {});
  const parsedSubjects = typeof dbRow.subject_analysis === 'string' ? JSON.parse(dbRow.subject_analysis) : (dbRow.subject_analysis || {});
  const parsedDiff = typeof dbRow.difficulty_analysis === 'string' ? JSON.parse(dbRow.difficulty_analysis) : (dbRow.difficulty_analysis || {});

  const mappedTags = Object.entries(parsedTags).map(([key, val]: any) => ({
    name: key,
    accuracy: val.accuracy || 0,
    correct: val.correct || 0,
    total: val.total || 0,
    avgTime: formatTime(val.avg_time || 0),
    totalTime: formatTime((val.avg_time || 0) * (val.total || 0)) 
  }));

  const mappedSubjects = Object.entries(parsedSubjects).map(([key, val]: any) => ({
    subject: key.replace(/_/g, ' '),
    totalQs: val.total || 0,
    correct: val.correct || 0,
    score: val.score || 0,
    accuracy: val.accuracy || 0,
    avgTime: formatTime(val.avg_time || 0),
    totalTime: formatTime((val.avg_time || 0) * (val.total || 0))
  }));

  const mappedDiff = Object.entries(parsedDiff).map(([key, val]: any) => ({
    name: key,
    accuracy: val.accuracy || 0,
    correct: val.correct || 0,
    total: val.total || 0
  }));

  return {
    rank: dbRow.rank || "N/A",
    totalStudents: 2653,
    totalScore: dbRow.total_score || 0,
    totalQs: dbRow.total_qs || 0,
    attempted: dbRow.attempted || 0,
    unattempted: dbRow.unattempted || 0,
    correct: dbRow.correct || 0,
    incorrect: dbRow.incorrect || 0,
    accuracy: dbRow.accuracy || 0,
    totalTime: formatTime(dbRow.total_time_seconds || 0),
    tags: mappedTags,
    difficulty: mappedDiff,
    subjects: mappedSubjects
  };
}