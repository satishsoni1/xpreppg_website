import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Play, CheckSquare, Square, 
  Loader2, CheckCircle, AlertCircle, FileText, User 
} from 'lucide-react';
import { AdminAPI } from '@/services/adminApi';

export default function PendingAttemptsTable() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchRawAttempts();
  }, []);

  const fetchRawAttempts = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const data = await AdminAPI.getPendingAttempts();
      setAttempts(data.attempts);
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', msg: 'Failed to load raw attempts from server.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Checkbox Selection
  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === attempts.length) {
      setSelectedIds([]); // Deselect all
    } else {
      setSelectedIds(attempts.map(a => a.raw_attempt_id)); // Select all
    }
  };

  // Submit Evaluation
  const handleGenerateResults = async () => {
    if (selectedIds.length === 0) return;
    
    setEvaluating(true);
    setNotification(null);

    try {
      const data = await AdminAPI.evaluateSelectedAttempts(selectedIds);
      setNotification({ type: data.success ? 'success' : 'error', msg: data.message });
    } catch (error) {
      setNotification({ type: 'error', msg: 'Server connection failed.' });
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
      
      {/* Header & Bulk Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Database className="text-blue-500" size={28} />
            Attempts Queue
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Select rows below to process and generate final scorecards.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            {selectedIds.length} Selected
          </span>
          <button
            onClick={handleGenerateResults}
            disabled={evaluating || selectedIds.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
          >
            {evaluating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
            Generate Results
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl border flex items-center gap-3 font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.msg}
        </motion.div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
            <p className="text-slate-500 font-medium">Fetching raw attempt data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 w-16">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600 transition-colors">
                      {selectedIds.length === attempts.length && attempts.length > 0 
                        ? <CheckSquare size={20} className="text-blue-600" /> 
                        : <Square size={20} />
                      }
                    </button>
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Raw ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Details</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Details</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.length > 0 ? (
                  attempts.map((row) => {
                    const isSelected = selectedIds.includes(row.raw_attempt_id);
                    return (
                      <tr 
                        key={row.raw_attempt_id} 
                        onClick={() => toggleSelection(row.raw_attempt_id)}
                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'}`}
                      >
                        <td className="py-4 px-6">
                          {isSelected 
                            ? <CheckSquare size={20} className="text-blue-600" /> 
                            : <Square size={20} className="text-slate-300" />
                          }
                        </td>
                        <td className="py-4 px-6 font-mono text-sm text-slate-500">
                          #{row.raw_attempt_id}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                              <User size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{row.student_name || 'Unknown Student'}</p>
                              <p className="text-xs text-slate-500 font-mono">Mobile: {row.mobile}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <FileText size={16} className="text-slate-400" />
                            {row.exam_title || `Exam ID: ${row.exam_id}`}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded-lg">
                            {new Date(row.submitted_at).toLocaleString('en-US', { 
                               month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      <Database className="mx-auto text-slate-300 mb-3" size={48} />
                      <p className="font-bold text-lg text-slate-700">Queue is Empty</p>
                      <p className="text-sm mt-1">No pending V2 attempts found in the database.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}