import { useEffect, useState } from "react";
import { StudentAPI } from "@/services/studentApi";
import { 
  Loader2, Trophy, Clock, Target, CheckCircle, 
  ChevronRight, BarChart2, ArrowLeft, FileText 
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import SolvedPaper from "./SolvedPaper"; // Ensure this path is correct

export default function StudentReportCard() {
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // State for Detailed Analysis (Solved Paper)
  const [examFullData, setExamFullData] = useState<any>(null);
  const [attemptFullData, setAttemptFullData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'paper'>('summary'); 
  const [paperLoading, setPaperLoading] = useState(false); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Fetch List on Mount
  useEffect(() => {
    fetchReportList();
  }, []);

  const fetchReportList = async () => {
    try {
      const res = await StudentAPI.getReportList(); 
      if (res.status && Array.isArray(res.reports)) { 
        setReportsList(res.reports);
        
        // Auto-select if only 1 report exists
        if (res.reports.length === 1) {
            fetchReportDetail(res.reports[0].exam_id);
        } else {
            setLoading(false);
        }
      } else {
        setError("No reports available yet.");
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to load reports.");
      setLoading(false);
    }
  };

  const fetchReportDetail = async (examId: number) => {
    setLoading(true);
    // Reset previous detail data
    setExamFullData(null);
    setAttemptFullData(null);
    setViewMode('summary');

    try {
      const res = await StudentAPI.getReportDetail(examId); 
      if (res.status) {
        setSelectedReport(res.report); // Stats Summary
        
        // If the API returns full data immediately, store it
        if (res.exam && res.attempt) {
            setExamFullData(res.exam);
            setAttemptFullData(res.attempt);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch Full Analysis on Button Click
  const handleViewSolvedPaper = async () => {
    setViewMode('paper');
    if (examFullData && attemptFullData) return; // Don't refetch if already loaded

    setPaperLoading(true);
    try {
      // Use the exam_id from the selected report to fetch full details
      const res = await StudentAPI.getFullAnalysis(selectedReport.exam_id); 
      
      if (res.status) {
        setExamFullData(res.exam);
        // The backend endpoint should return 'attempt' data as well
        if (res.attempt) {
            setAttemptFullData(res.attempt);
        }
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

  // -----------------------------------------------------------
  // VIEW 3: SOLVED PAPER (Question Wise)
  // -----------------------------------------------------------
  if (selectedReport && viewMode === 'paper') {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setViewMode('summary')}
            className="flex items-center text-gray-600 hover:text-emerald-600 transition font-medium"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Summary
          </button>
          <div className="text-right">
            <h2 className="text-lg font-bold text-gray-900">{selectedReport.exam_name}</h2>
            <p className="text-sm text-gray-500">Solved Paper View</p>
          </div>
        </div>

        {paperLoading ? (
           <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
              <p className="text-gray-500 font-medium">Loading Question Paper...</p>
           </div>
        ) : (examFullData && attemptFullData ? (
          <SolvedPaper exam={examFullData} attempt={attemptFullData} />
       ) : (
           <div className="p-10 text-center text-gray-500 bg-white rounded-xl border">
              <p className="mb-2 font-semibold">Data Unavailable</p>
              <p className="text-sm">The question paper data could not be loaded.</p>
              <button 
                onClick={handleViewSolvedPaper} 
                className="mt-4 text-emerald-600 hover:underline text-sm font-bold"
              >
                Retry Loading
              </button>
           </div>
        ))}
      </div>
    );
  }

  // -----------------------------------------------------------
  // LOADING STATE
  // -----------------------------------------------------------
  if (loading) return <div className="flex h-64 justify-center items-center"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;

  // -----------------------------------------------------------
  // VIEW 1: SELECT EXAM (List)
  // -----------------------------------------------------------
  if (!selectedReport) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Performance Reports</h1>
        <p className="text-gray-500 mb-8">Select an exam to view detailed analysis and performance.</p>

        {error ? (
          <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500 border border-gray-200">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportsList.map((item) => (
              <div 
                key={item.exam_id} 
                onClick={() => fetchReportDetail(item.exam_id)}
                className="bg-white border border-gray-200 p-6 rounded-xl hover:shadow-md hover:border-emerald-500 cursor-pointer transition group"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="bg-emerald-100 p-3 rounded-full text-emerald-700">
                      <BarChart2 size={24} />
                   </div>
                   <div className="text-right">
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                         Rank #{item.rank}
                      </span>
                   </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition">
                  {item.exam_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                   Taken on {new Date(item.created_at).toLocaleDateString()}
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                   <div className="text-sm">
                      <span className="text-gray-400">Score: </span>
                      <span className="font-bold text-gray-900">{item.total_score}</span>
                   </div>
                   <div className="text-sm text-emerald-600 font-semibold flex items-center">
                      View Analysis <ChevronRight size={16} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // -----------------------------------------------------------
  // VIEW 2: DETAILED SUMMARY DASHBOARD
  // -----------------------------------------------------------
  const formatTime = (seconds: number) => {
    if (!seconds) return "-";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const pieData = [
    { name: 'Correct', value: selectedReport.correct, color: '#10B981' }, 
    { name: 'Incorrect', value: selectedReport.incorrect, color: '#EF4444' }, 
    { name: 'Unattempted', value: selectedReport.unattempted, color: '#E5E7EB' }, 
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 px-4">
      
      <button 
        onClick={() => setSelectedReport(null)}
        className="flex items-center text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Reports List
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedReport.exam_name}</h1>
            <p className="text-gray-500 mt-1">Student ID: <span className="font-mono text-emerald-700">{selectedReport.student_id}</span></p>
          </div>
          
          <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3">
             <div className="bg-emerald-50 text-emerald-800 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-100">
               <Trophy size={20} /> Rank #{selectedReport.rank}
             </div>
             
             {/* ✅ Button is always visible */}
             <button 
                onClick={handleViewSolvedPaper}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-200"
             >
                <FileText size={18} /> View Solved Paper
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
           <StatCard label="Score" value={selectedReport.total_score} sub={`/ ${selectedReport.total_qs * 4}`} icon={<Target size={20} className="text-blue-500"/>} />
           <StatCard label="Accuracy" value={`${selectedReport.accuracy}%`} icon={<CheckCircle size={20} className="text-emerald-500"/>} />
           <StatCard label="Attempted" value={selectedReport.attempted} sub={`/ ${selectedReport.total_qs}`} icon={<BarChart2 size={20} className="text-purple-500"/>} />
           <StatCard label="Time" value={formatTime(selectedReport.total_time_seconds)} icon={<Clock size={20} className="text-orange-500"/>} />
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
           <h3 className="font-bold text-gray-800 w-full mb-4">Attempt Summary</h3>
           <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedReport.total_qs}</p>
                    <p className="text-xs text-gray-400 uppercase">Total Qs</p>
                 </div>
              </div>
           </div>
           <div className="flex justify-center gap-4 mt-6 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Correct</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Incorrect</div>
           </div>
        </div>

        {/* Question Type Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
           <h3 className="font-bold text-gray-800 mb-6">Question Type Analysis</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 font-semibold">
                 <tr>
                   <th className="p-3 rounded-l-lg">Type</th>
                   <th className="p-3">Accuracy</th>
                   <th className="p-3">Correct / Total</th>
                   <th className="p-3 rounded-r-lg">Avg Time</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {selectedReport.tag_analysis && Object.entries(selectedReport.tag_analysis).map(([tag, data]: any) => (
                   <tr key={tag}>
                     <td className="p-3 font-medium">{tag}</td>
                     <td className="p-3">
                        <div className="flex items-center gap-2">
                           <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${data.accuracy}%` }}></div>
                           </div>
                           <span className="text-xs font-bold">{data.accuracy}%</span>
                        </div>
                     </td>
                     <td className="p-3 text-gray-600">{data.correct} / {data.total}</td>
                     <td className="p-3 text-gray-600">{data.avg_time}s</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>

      {/* Subject Analysis Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
         <h3 className="font-bold text-gray-800 mb-4">Subject Wise Performance</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                  <tr>
                     <th className="p-3 rounded-l-lg">Subject</th>
                     <th className="p-3">Accuracy</th>
                     <th className="p-3">Score</th>
                     <th className="p-3 text-green-600">Correct</th>
                     <th className="p-3 text-red-500">Incorrect</th>
                     <th className="p-3 rounded-r-lg">Total Qs</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {selectedReport.subject_analysis && Object.entries(selectedReport.subject_analysis)
                    .sort((a: any, b: any) => b[1].accuracy - a[1].accuracy)
                    .map(([subject, data]: any) => {
                       const estCorrect = Math.round((data.accuracy / 100) * data.total);
                       const estIncorrect = data.total - estCorrect;
                       return (
                        <tr key={subject} className="hover:bg-gray-50 transition">
                           <td className="p-3 font-medium capitalize text-gray-700">{subject.replace(/_/g, ' ').toLowerCase()}</td>
                           <td className="p-3 font-bold">{data.accuracy}%</td>
                           <td className="p-3">{data.score}</td>
                           <td className="p-3 text-green-600 font-bold">{estCorrect}</td>
                           <td className="p-3 text-red-500 font-bold">{estIncorrect}</td>
                           <td className="p-3 text-gray-500">{data.total}</td>
                        </tr>
                       );
                    })}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}

// Simple Stat Card
function StatCard({ label, value, sub, icon }: any) {
   return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center items-center text-center">
         <div className="mb-2 bg-white p-2 rounded-full shadow-sm">{icon}</div>
         <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{label}</p>
         <p className="text-2xl font-extrabold text-gray-900 mt-1">
            {value} <span className="text-sm font-medium text-gray-400">{sub}</span>
         </p>
      </div>
   );
}