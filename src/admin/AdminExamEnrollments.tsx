import { useState, useEffect } from "react";
import {
  Users, Search, Plus, Trash2, Copy, Loader2, CheckCircle,
  AlertCircle, X, UserPlus, RefreshCw, ChevronDown,
} from "lucide-react";
import { ExamAPI, EnrollmentAPI } from "@/services/examApi";

export default function AdminExamEnrollments() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any|null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null);

  // Copy enrollments
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceId, setCopySourceId] = useState("");
  const [copyLoading, setCopyLoading] = useState(false);

  // Student picker for manual enroll
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerType, setPickerType] = useState<"cbt"|"xrevise">("xrevise");
  const [pickerStudents, setPickerStudents] = useState<any[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<Set<number>>(new Set());

  // Bulk by platform
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkType, setBulkType] = useState<"cbt"|"xrevise">("xrevise");
  const [bulkLoading, setBulkLoading] = useState(false);

  const notify = (msg:string, type:"success"|"error"="success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3500);
  };

  useEffect(() => {
    ExamAPI.getAll({ limit:100 }).then(r => { if (r.status) setExams(r.exams||[]); });
  }, []);

  useEffect(() => {
    if (selectedExam) fetchEnrollments();
  }, [selectedExam, search]);

  const fetchEnrollments = async () => {
    if (!selectedExam) return;
    setLoading(true);
    const r = await EnrollmentAPI.getEnrollments(selectedExam.id, search);
    if (r.status) setEnrollments(r.enrollments);
    setLoading(false);
  };

  useEffect(() => {
    if (!showPicker) return;
    setPickerLoading(true);
    EnrollmentAPI.getStudentsForPicker({
      type: pickerType, search: pickerSearch,
      exam_id: selectedExam?.id || "",
    }).then(r => { if (r.status) setPickerStudents(r.students); setPickerLoading(false); });
  }, [showPicker, pickerSearch, pickerType, selectedExam]);

  const enrollSelected = async () => {
    if (!selectedExam || !pickerSelected.size) return;
    const students = [...pickerSelected].map(id => ({ student_id: id, student_type: pickerType }));
    const r = await EnrollmentAPI.enrollBulk(selectedExam.id, students);
    if (r.status) {
      notify(`${r.enrolled} student(s) enrolled`);
      setShowPicker(false); setPickerSelected(new Set());
      fetchEnrollments();
    } else notify(r.message||"Failed","error");
  };

  const unenroll = async (s: any) => {
    if (!selectedExam) return;
    const r = await EnrollmentAPI.unenroll(selectedExam.id, s.student_id, s.student_type);
    if (r.status) { notify("Student unenrolled"); fetchEnrollments(); }
    else notify(r.message||"Failed","error");
  };

  const handleCopyEnrollments = async () => {
    if (!selectedExam || !copySourceId) return;
    setCopyLoading(true);
    const r = await EnrollmentAPI.copyEnrollments(parseInt(copySourceId), selectedExam.id);
    setCopyLoading(false);
    if (r.status) { notify(`${r.copied} enrollment(s) copied`); setShowCopyModal(false); setCopySourceId(""); fetchEnrollments(); }
    else notify(r.message||"Failed","error");
  };

  const handleBulkEnroll = async () => {
    if (!selectedExam) return;
    setBulkLoading(true);
    const r = await EnrollmentAPI.enrollByPlatform(selectedExam.id, bulkType);
    setBulkLoading(false);
    if (r.status) { notify(`${r.enrolled} student(s) enrolled`); setShowBulkModal(false); fetchEnrollments(); }
    else notify(r.message||"Failed","error");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-sm ${toast.type==="success"?"bg-emerald-600 text-white":"bg-red-600 text-white"}`}>
          {toast.type==="success"?<CheckCircle size={16}/>:<AlertCircle size={16}/>} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-violet-600" size={22}/>
          <h1 className="text-xl font-bold text-slate-800">Exam Enrollments</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-1">Select Exam</label>
            <select value={selectedExam?.id||""} onChange={e=>{
                const ex=exams.find(x=>x.id===parseInt(e.target.value));
                setSelectedExam(ex||null); setSearch("");
              }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400">
              <option value="">— Choose an exam —</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>[{ex.platform?.toUpperCase()}] {ex.title}</option>)}
            </select>
          </div>
          {selectedExam && (
            <>
              <div className="relative flex-1 min-w-[180px] self-end">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search enrolled students…"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-400"/>
              </div>
              <div className="flex gap-2 self-end">
                <button onClick={() => setShowPicker(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm">
                  <UserPlus size={14}/> Add Students
                </button>
                <button onClick={() => setShowBulkModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm">
                  <Users size={14}/> Bulk Enroll
                </button>
                <button onClick={() => setShowCopyModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm">
                  <Copy size={14}/> Copy From
                </button>
                <button onClick={fetchEnrollments} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"><RefreshCw size={16}/></button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enrollments Table */}
      {selectedExam && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">{enrollments.length} student{enrollments.length!==1?"s":""} enrolled in <span className="font-bold text-slate-800">{selectedExam.title}</span></p>
          </div>
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="animate-spin text-slate-400 mx-auto" size={28}/></div>
          ) : enrollments.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users size={36} className="mx-auto mb-2 text-slate-200"/>
              <p>No students enrolled yet</p>
              <button onClick={() => setShowPicker(true)} className="mt-3 text-violet-600 text-sm font-semibold hover:underline">Add students</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Name","Mobile","Email","City","Type","Attempt","Score","Rank","Enrolled","Action"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enrollments.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{e.student_name||"—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{e.mobile||"—"}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap max-w-[160px] truncate">{e.email||"—"}</td>
                      <td className="px-4 py-3 text-slate-500">{e.city||"—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.student_type==="cbt"?"bg-blue-100 text-blue-700":"bg-emerald-100 text-emerald-700"}`}>{e.student_type?.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3">
                        {e.attempt_status ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.attempt_status==="submitted"||e.attempt_status==="auto_submitted"?"bg-slate-100 text-slate-600":"bg-amber-100 text-amber-700"}`}>{e.attempt_status}</span>
                        ) : <span className="text-xs text-slate-300">Not started</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">{e.final_marks!=null?`${e.final_marks} (${e.percentage}%)`:"—"}</td>
                      <td className="px-4 py-3 text-slate-500">{e.rank||"—"}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(e.enrolled_at).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => unenroll(e)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Student Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Add Students</h2>
              <button onClick={() => { setShowPicker(false); setPickerSelected(new Set()); }}><X size={20} className="text-slate-400"/></button>
            </div>
            <div className="p-4 flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={pickerSearch} onChange={e=>setPickerSearch(e.target.value)} placeholder="Search by name or mobile…"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-300"/>
              </div>
              <select value={pickerType} onChange={e=>setPickerType(e.target.value as any)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
                <option value="xrevise">XRevise</option>
                <option value="cbt">CBT</option>
              </select>
            </div>
            {pickerSelected.size > 0 && (
              <div className="px-4 pb-2 flex items-center gap-3 bg-violet-50 mx-4 rounded-xl py-2 border border-violet-100">
                <span className="text-xs font-bold text-violet-700">{pickerSelected.size} selected</span>
                <button onClick={enrollSelected} className="ml-auto px-4 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold">Enroll Now</button>
                <button onClick={() => setPickerSelected(new Set())} className="text-xs text-slate-500 hover:text-red-500">Clear</button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {pickerLoading ? <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" size={24}/></div>
              : pickerStudents.length === 0 ? <div className="py-8 text-center text-slate-400 text-sm">No students found</div>
              : pickerStudents.map(s => (
                <div key={s.id} onClick={() => {
                  setPickerSelected(prev => { const n=new Set(prev); if(n.has(s.id))n.delete(s.id);else n.add(s.id); return n; });
                }} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 ${pickerSelected.has(s.id)?"bg-violet-50":""}`}>
                  <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${pickerSelected.has(s.id)?"border-violet-600 bg-violet-600":"border-slate-300"}`}>
                    {pickerSelected.has(s.id) && <CheckCircle size={10} className="text-white"/>}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.mobile} {s.city ? `· ${s.city}`:""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Enroll Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="font-bold text-slate-800 mb-4">Bulk Enroll All Students</h2>
            <p className="text-sm text-slate-600 mb-4">Enroll ALL students of a platform into <strong>{selectedExam?.title}</strong></p>
            <select value={bulkType} onChange={e=>setBulkType(e.target.value as any)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-4 outline-none">
              <option value="xrevise">All XRevise Students</option>
              <option value="cbt">All CBT Students</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold">Cancel</button>
              <button onClick={handleBulkEnroll} disabled={bulkLoading}
                className="flex-1 py-2.5 bg-violet-600 text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                {bulkLoading && <Loader2 size={14} className="animate-spin"/>} {bulkLoading?"Enrolling…":"Enroll All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Enrollments Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="font-bold text-slate-800 mb-1">Copy Enrollments</h2>
            <p className="text-sm text-slate-500 mb-4">Copy all enrollments from another exam into <strong>{selectedExam?.title}</strong></p>
            <label className="block text-xs font-bold text-slate-500 mb-1">Source Exam</label>
            <select value={copySourceId} onChange={e=>setCopySourceId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-4 outline-none">
              <option value="">— Select source exam —</option>
              {exams.filter(ex=>ex.id!==selectedExam?.id).map(ex =>
                <option key={ex.id} value={ex.id}>[{ex.platform?.toUpperCase()}] {ex.title}</option>
              )}
            </select>
            <div className="flex gap-3">
              <button onClick={() => { setShowCopyModal(false); setCopySourceId(""); }} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold">Cancel</button>
              <button onClick={handleCopyEnrollments} disabled={copyLoading || !copySourceId}
                className="flex-1 py-2.5 bg-violet-600 text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                {copyLoading && <Loader2 size={14} className="animate-spin"/>} Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
