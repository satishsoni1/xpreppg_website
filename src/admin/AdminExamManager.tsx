import { useState, useEffect, useRef } from "react";
import {
  Monitor, BookOpen, Plus, Edit2, Trash2, Copy, ArrowRightLeft,
  MoveRight, Search, ChevronLeft, ChevronRight, X, Loader2,
  CheckCircle, AlertCircle, Upload, Users, BarChart3, RotateCcw,
  Clock, FileQuestion, RefreshCw, Eye, Filter, ChevronDown,
} from "lucide-react";
import { ExamAPI, QuestionBankAPI, EnrollmentAPI } from "@/services/examApi";

type Platform = "cbt" | "xrevise";

const STATUS_COLORS: Record<string,string> = {
  draft:     "bg-slate-100 text-slate-500",
  upcoming:  "bg-blue-100 text-blue-600",
  running:   "bg-emerald-100 text-emerald-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

const EMPTY_EXAM = {
  title:"", category:"", subject:"", batch:"", duration_minutes:60,
  total_marks:"", passing_marks:"", instructions:"",
  negative_marking:false, global_negative_value:0.25,
  shuffle_questions:false, shuffle_options:false, calculator_allowed:false,
  start_time:"", end_time:"", resume_allowed:true, max_warnings:3,
  auto_submit_on_warnings:true, show_result_immediately:true,
  phase:1, day_number:"",
};

interface Props { platform: Platform; }

export default function AdminExamManager({ platform }: Props) {
  const [exams, setExams] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deleted, setDeleted] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editExam, setEditExam] = useState<any|null>(null);
  const [form, setForm] = useState({ ...EMPTY_EXAM });
  const [saving, setSaving] = useState(false);

  // Selected exam detail view
  const [selectedExam, setSelectedExam] = useState<any|null>(null);
  const [examDetail, setExamDetail] = useState<{exam:any,questions:any[]}|null>(null);
  const [detailTab, setDetailTab] = useState<"questions"|"add-from-bank">("questions");
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Question bank picker
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [bankSearch, setBankSearch] = useState("");
  const [bankSubject, setBankSubject] = useState("");
  const [selectedBankQIds, setSelectedBankQIds] = useState<Set<number>>(new Set());
  const [loadingBank, setLoadingBank] = useState(false);

  // Operations
  const [opModal, setOpModal] = useState<{type:"copy"|"transfer"|"move"|"delete"|"restore";exam:any}|null>(null);
  const [opTitle, setOpTitle] = useState("");
  const [opLoading, setOpLoading] = useState(false);

  // Excel import into exam
  const importRef = useRef<HTMLInputElement>(null);
  const [importingExam, setImportingExam] = useState<number|null>(null);

  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null);

  const notify = (msg:string, type:"success"|"error"="success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3500);
  };

  useEffect(() => { fetchExams(); }, [page, statusFilter, search, deleted]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const r = await ExamAPI.getAll({ platform, page, limit, status: statusFilter, search, deleted: deleted ? "true":"false" });
      if (r.status) { setExams(r.exams); setTotal(r.total); }
    } finally { setLoading(false); }
  };

  const openAddExam = () => {
    setEditExam(null);
    setForm({ ...EMPTY_EXAM });
    setShowForm(true);
  };
  const openEditExam = (ex: any) => {
    setEditExam(ex);
    setForm({
      title: ex.title, category: ex.category||"", subject: ex.subject||"",
      batch: ex.batch||"", duration_minutes: ex.duration_minutes||60,
      total_marks: ex.total_marks||"", passing_marks: ex.passing_marks||"",
      instructions: ex.instructions||"",
      negative_marking: ex.negative_marking||false,
      global_negative_value: ex.global_negative_value||0.25,
      shuffle_questions: ex.shuffle_questions||false,
      shuffle_options: ex.shuffle_options||false,
      calculator_allowed: ex.calculator_allowed||false,
      start_time: ex.start_time ? ex.start_time.slice(0,16):"",
      end_time: ex.end_time ? ex.end_time.slice(0,16):"",
      resume_allowed: ex.resume_allowed !== false,
      max_warnings: ex.max_warnings||3,
      auto_submit_on_warnings: ex.auto_submit_on_warnings !== false,
      show_result_immediately: ex.show_result_immediately !== false,
      phase: ex.phase || 1,
      day_number: ex.day_number || "",
    });
    setShowForm(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, platform };
      const r = editExam
        ? await ExamAPI.update(editExam.id, payload)
        : await ExamAPI.create(payload);
      if (r.status) {
        notify(editExam ? "Exam updated" : "Exam created");
        setShowForm(false); fetchExams();
      } else notify(r.message||"Save failed","error");
    } finally { setSaving(false); }
  };

  const openDetail = async (ex: any) => {
    setSelectedExam(ex);
    setDetailTab("questions");
    setLoadingDetail(true);
    const r = await ExamAPI.getOne(ex.id);
    if (r.status) setExamDetail({ exam: r.exam, questions: r.questions });
    setLoadingDetail(false);
  };

  const loadBankQuestions = async () => {
    setLoadingBank(true);
    const r = await QuestionBankAPI.getQuestions({ search: bankSearch, subject: bankSubject, limit: 50 });
    if (r.status) setBankQuestions(r.questions);
    setLoadingBank(false);
  };
  useEffect(() => { if (detailTab === "add-from-bank") loadBankQuestions(); }, [detailTab, bankSearch, bankSubject]);

  const addFromBank = async () => {
    if (!selectedBankQIds.size || !examDetail) return;
    const r = await ExamAPI.addQuestions(examDetail.exam.id, [...selectedBankQIds]);
    if (r.status) {
      notify(`${r.added?.length} question(s) added`);
      setSelectedBankQIds(new Set());
      const dr = await ExamAPI.getOne(examDetail.exam.id);
      if (dr.status) setExamDetail({ exam: dr.exam, questions: dr.questions });
    } else notify(r.message||"Failed","error");
  };

  const removeQuestion = async (examId: number, questionId: number) => {
    const r = await ExamAPI.removeQuestion(examId, questionId);
    if (r.status) {
      const dr = await ExamAPI.getOne(examId);
      if (dr.status) setExamDetail({ exam: dr.exam, questions: dr.questions });
      notify("Question removed from exam");
    }
  };

  const handleOperation = async () => {
    if (!opModal) return;
    setOpLoading(true);
    try {
      let r: any;
      if (opModal.type === "copy")     r = await ExamAPI.copy(opModal.exam.id, opTitle || undefined);
      if (opModal.type === "transfer") r = await ExamAPI.transfer(opModal.exam.id, opTitle || undefined);
      if (opModal.type === "move")     r = await ExamAPI.move(opModal.exam.id);
      if (opModal.type === "delete")   r = await ExamAPI.remove(opModal.exam.id);
      if (opModal.type === "restore")  r = await ExamAPI.restore(opModal.exam.id);

      if (r?.status) {
        notify(r.message || "Done");
        setOpModal(null); setOpTitle("");
        fetchExams();
      } else notify(r?.message || "Operation failed", "error");
    } finally { setOpLoading(false); }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !importingExam) return;
    const r = await ExamAPI.importQuestionsXlsx(importingExam, e.target.files[0]);
    e.target.value = "";
    if (r.status) {
      notify(`${r.inserted} questions imported`);
      if (selectedExam?.id === importingExam) {
        const dr = await ExamAPI.getOne(importingExam);
        if (dr.status) setExamDetail({ exam: dr.exam, questions: dr.questions });
      }
    } else notify(r.message||"Import failed","error");
    setImportingExam(null);
  };

  const pColor = platform === "cbt" ? "blue" : "emerald";
  const pBg = platform === "cbt" ? "bg-blue-600" : "bg-emerald-600";
  const pBgHover = platform === "cbt" ? "hover:bg-blue-700" : "hover:bg-emerald-700";
  const pText = platform === "cbt" ? "text-blue-600" : "text-emerald-600";
  const pBorder = platform === "cbt" ? "border-blue-300" : "border-emerald-300";
  const pRing = platform === "cbt" ? "focus:ring-blue-400" : "focus:ring-emerald-400";

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-sm ${toast.type==="success"?"bg-emerald-600 text-white":"bg-red-600 text-white"}`}>
          {toast.type==="success"?<CheckCircle size={16}/>:<AlertCircle size={16}/>} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {platform==="cbt"?<Monitor className="text-blue-600" size={22}/>:<BookOpen className="text-emerald-600" size={22}/>}
            <h1 className="text-xl font-bold text-slate-800">{platform==="cbt"?"CBT":"XRevise"} Exam Manager</h1>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel}/>
            <button onClick={() => setDeleted(d=>!d)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border ${deleted?"bg-red-50 border-red-300 text-red-600":"border-slate-200 text-slate-600"}`}>
              <Trash2 size={14}/> {deleted?"Active Exams":"Deleted Exams"}
            </button>
            <button onClick={fetchExams}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
              <RefreshCw size={16}/>
            </button>
            <button onClick={openAddExam}
              className={`flex items-center gap-1.5 px-4 py-2 ${pBg} ${pBgHover} text-white font-bold rounded-xl text-sm`}>
              <Plus size={14}/> Create Exam
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
              placeholder="Search exams…"
              className={`w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ${pRing}`}/>
          </div>
          {["","draft","upcoming","running","completed","cancelled"].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${statusFilter===s?`${pBg} text-white border-transparent`:"border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {s||"All"}
            </button>
          ))}
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-sm">
          <p className="font-semibold text-slate-600">{total} exam{total!==1?"s":""} {deleted?"(deleted)":""}</p>
          <div className="flex items-center gap-2 text-slate-500">
            Pg {page}/{totalPages||1}
            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft size={15}/></button>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={15}/></button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" size={28}/>Loading…</div>
        ) : exams.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            {platform==="cbt"?<Monitor size={40} className="mx-auto mb-3 text-slate-200"/>:<BookOpen size={40} className="mx-auto mb-3 text-slate-200"/>}
            <p className="font-semibold">No exams found</p>
            {!deleted && <button onClick={openAddExam} className={`mt-3 ${pText} text-sm font-semibold hover:underline`}>Create first exam</button>}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {exams.map(ex => (
              <div key={ex.id} className="px-5 py-4 hover:bg-slate-50 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 text-sm">{ex.title}</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[ex.status]||""}`}>{ex.status}</span>
                    {ex.result_published && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Results Published</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                    {ex.subject && <span>{ex.subject}</span>}
                    {ex.batch && <span>Batch: {ex.batch}</span>}
                    <span className="flex items-center gap-1"><Clock size={11}/>{ex.duration_minutes} min</span>
                    <span className="flex items-center gap-1"><FileQuestion size={11}/>{ex.question_count||0} Qs</span>
                    <span className="flex items-center gap-1"><Users size={11}/>{ex.enrollment_count||0} enrolled</span>
                    {ex.start_time && <span>📅 {new Date(ex.start_time).toLocaleDateString("en-IN")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                  {deleted ? (
                    <button onClick={() => setOpModal({type:"restore",exam:ex})}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                      <RotateCcw size={13}/> Restore
                    </button>
                  ) : (
                    <>
                      <button onClick={() => openDetail(ex)} title="Open Detail" className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg"><Eye size={15}/></button>
                      <button onClick={() => openEditExam(ex)} title="Edit" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15}/></button>
                      <button onClick={() => { setOpModal({type:"copy",exam:ex}); setOpTitle(`Copy of ${ex.title}`); }} title="Copy" className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Copy size={15}/></button>
                      <button onClick={() => { setOpModal({type:"transfer",exam:ex}); setOpTitle(`[${platform==="cbt"?"XRevise":"CBT"}] ${ex.title}`); }} title={`Transfer to ${platform==="cbt"?"XRevise":"CBT"}`} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><ArrowRightLeft size={15}/></button>
                      <button onClick={() => setOpModal({type:"move",exam:ex})} title={`Move to ${platform==="cbt"?"XRevise":"CBT"}`} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><MoveRight size={15}/></button>
                      <button onClick={() => setOpModal({type:"delete",exam:ex})} title="Delete" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam Detail Drawer */}
      {selectedExam && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <button onClick={() => { setSelectedExam(null); setExamDetail(null); }}><X size={20} className="text-slate-400"/></button>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{selectedExam.title}</p>
                <p className="text-xs text-slate-500">{platform.toUpperCase()} — {selectedExam.status}</p>
              </div>
              {examDetail && !examDetail.exam.result_published && (
                <button onClick={async()=>{ const r=await ExamAPI.publishResult(selectedExam.id); if(r.status){notify("Result published");openDetail(selectedExam);} else notify(r.message||"Failed","error");}}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                  <CheckCircle size={13}/> Publish Result
                </button>
              )}
            </div>

            {loadingDetail ? (
              <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={32}/></div>
            ) : examDetail ? (
              <div className="flex-1 overflow-y-auto">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 p-4">
                  {[
                    { label:"Questions", value: examDetail.questions.length },
                    { label:"Total Marks", value: examDetail.exam.total_marks||"—" },
                    { label:"Duration", value: `${examDetail.exam.duration_minutes} min` },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                      <p className="text-xl font-bold text-slate-800">{s.value}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-4">
                  {(["questions","add-from-bank"] as const).map(t => (
                    <button key={t} onClick={() => setDetailTab(t)}
                      className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${detailTab===t?`border-${pColor}-500 ${pText}`:"border-transparent text-slate-500 hover:text-slate-700"}`}>
                      {t==="questions"?"Exam Questions":"Add from Bank"}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center gap-2 py-2">
                    <button onClick={() => { setImportingExam(examDetail.exam.id); importRef.current?.click(); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold">
                      <Upload size={12}/> Import Excel
                    </button>
                  </div>
                </div>

                {detailTab === "questions" && (
                  <div className="divide-y divide-slate-50">
                    {examDetail.questions.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <FileQuestion size={32} className="mx-auto mb-2 text-slate-200"/>
                        <p>No questions yet — add from Question Bank</p>
                      </div>
                    ) : examDetail.questions.map((q, i) => (
                      <div key={q.question_id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50">
                        <span className="text-xs font-bold text-slate-400 min-w-[24px] mt-0.5">Q{i+1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 line-clamp-2">{q.question_text}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {q.subject && <span className="text-[10px] bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-full">{q.subject}</span>}
                            <span className="text-[10px] text-slate-400">{q.marks}M / -{q.negative_marks}M</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">Ans:{q.correct_answer}</span>
                          </div>
                        </div>
                        <button onClick={() => removeQuestion(examDetail.exam.id, q.question_id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0"><X size={13}/></button>
                      </div>
                    ))}
                  </div>
                )}

                {detailTab === "add-from-bank" && (
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input value={bankSearch} onChange={e=>{setBankSearch(e.target.value);}} placeholder="Search questions…"
                          className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-300"/>
                      </div>
                      <input value={bankSubject} onChange={e=>setBankSubject(e.target.value)} placeholder="Subject filter"
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none w-36"/>
                    </div>
                    {selectedBankQIds.size > 0 && (
                      <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2">
                        <span className="text-xs font-bold text-violet-700">{selectedBankQIds.size} selected</span>
                        <button onClick={addFromBank}
                          className="ml-auto px-3 py-1 bg-violet-600 text-white rounded-lg text-xs font-bold">Add to Exam</button>
                        <button onClick={() => setSelectedBankQIds(new Set())} className="text-xs text-slate-500 hover:text-red-500">Clear</button>
                      </div>
                    )}
                    {loadingBank ? <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-slate-400" size={24}/></div> : (
                      <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto border border-slate-100 rounded-xl">
                        {bankQuestions.map(q => {
                          const alreadyAdded = examDetail.questions.some(eq => eq.question_id === q.id);
                          const selected = selectedBankQIds.has(q.id);
                          return (
                            <div key={q.id} onClick={() => {
                              if (alreadyAdded) return;
                              setSelectedBankQIds(prev => { const n=new Set(prev); if(n.has(q.id))n.delete(q.id);else n.add(q.id); return n; });
                            }} className={`flex items-start gap-3 px-3 py-3 cursor-pointer transition ${alreadyAdded?"opacity-40 cursor-not-allowed":selected?"bg-violet-50":""}`}>
                              <div className={`w-4 h-4 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center ${selected?"border-violet-600 bg-violet-600":alreadyAdded?"border-gray-300 bg-gray-100":"border-slate-300"}`}>
                                {selected && <CheckCircle size={10} className="text-white"/>}
                                {alreadyAdded && <span className="text-[8px] text-gray-400">✓</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-700 line-clamp-1">{q.question_text}</p>
                                <div className="flex gap-1.5 mt-0.5">
                                  {q.subject && <span className="text-[10px] text-violet-600">{q.subject}</span>}
                                  <span className="text-[10px] text-slate-400">{q.difficulty} · {q.default_marks}M</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Operation Modal */}
      {opModal && (
        <div className="fixed inset-0 bg-black/60 z-[55] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              {opModal.type==="copy" && <Copy size={20} className="text-amber-600"/>}
              {opModal.type==="transfer" && <ArrowRightLeft size={20} className="text-purple-600"/>}
              {opModal.type==="move" && <MoveRight size={20} className="text-indigo-600"/>}
              {opModal.type==="delete" && <Trash2 size={20} className="text-red-600"/>}
              {opModal.type==="restore" && <RotateCcw size={20} className="text-emerald-600"/>}
              <h2 className="font-bold text-slate-800 text-lg capitalize">{opModal.type} Exam</h2>
            </div>
            <p className="text-sm text-slate-600 mb-1">
              <span className="font-semibold">"{opModal.exam.title}"</span>
            </p>
            {opModal.type==="copy" && <p className="text-xs text-slate-500 mb-3">Creates a duplicate in <strong>{platform.toUpperCase()}</strong>. Original is unchanged.</p>}
            {opModal.type==="transfer" && <p className="text-xs text-slate-500 mb-3">Creates a copy in <strong>{platform==="cbt"?"XRevise":"CBT"}</strong> with all questions. Original stays.</p>}
            {opModal.type==="move" && <p className="text-xs text-slate-500 mb-3">Moves this exam to <strong>{platform==="cbt"?"XRevise":"CBT"}</strong>. It will be removed from {platform.toUpperCase()}.</p>}
            {opModal.type==="delete" && <p className="text-xs text-red-500 mb-3">This exam will be soft-deleted. Questions in the bank are NOT affected.</p>}
            {opModal.type==="restore" && <p className="text-xs text-slate-500 mb-3">Restore this exam to active status.</p>}

            {(opModal.type==="copy"||opModal.type==="transfer") && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1">New Exam Title</label>
                <input value={opTitle} onChange={e=>setOpTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"/>
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setOpModal(null); setOpTitle(""); }}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold">Cancel</button>
              <button onClick={handleOperation} disabled={opLoading}
                className={`flex-1 py-2.5 font-bold rounded-xl text-white disabled:opacity-60 flex items-center justify-center gap-2 ${opModal.type==="delete"?"bg-red-600 hover:bg-red-700":opModal.type==="restore"?"bg-emerald-600 hover:bg-emerald-700":`${pBg} ${pBgHover}`}`}>
                {opLoading && <Loader2 size={15} className="animate-spin"/>}
                {opLoading?"Processing…":opModal.type==="copy"?"Copy"
                  :opModal.type==="transfer"?"Transfer"
                  :opModal.type==="move"?"Move"
                  :opModal.type==="delete"?"Delete"
                  :"Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Exam Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{editExam?"Edit Exam":"Create Exam"}</h2>
              <button onClick={()=>setShowForm(false)}><X size={20} className="text-slate-400"/></button>
            </div>
            <form onSubmit={handleSaveExam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Exam Title *</label>
                <input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                  className={`w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ${pRing}`} placeholder="e.g. NEET PG Mock Test 1"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                    className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${pRing}`} placeholder="e.g. Grand Test"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                  <input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}
                    className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${pRing}`} placeholder="e.g. Anatomy"/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batch</label>
                  <input value={form.batch} onChange={e=>setForm(f=>({...f,batch:e.target.value}))}
                    className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${pRing}`} placeholder="Batch 2025"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (min) *</label>
                  <input type="number" required min={1} value={form.duration_minutes} onChange={e=>setForm(f=>({...f,duration_minutes:parseInt(e.target.value)||60}))}
                    className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${pRing}`}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Passing Marks</label>
                  <input type="number" min={0} value={form.passing_marks} onChange={e=>setForm(f=>({...f,passing_marks:e.target.value}))}
                    className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${pRing}`}/>
                </div>
              </div>
              {platform === "xrevise" && (
                <div className="grid grid-cols-2 gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Phase *</label>
                    <select value={form.phase} onChange={e=>setForm(f=>({...f,phase:parseInt(e.target.value)||1}))}
                      className="w-full border border-emerald-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400">
                      {[1,2,3,4].map(p=><option key={p} value={p}>Phase {p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Day Number</label>
                    <input type="number" min={1} value={form.day_number} onChange={e=>setForm(f=>({...f,day_number:e.target.value}))}
                      className="w-full border border-emerald-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400" placeholder="1"/>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                  <input type="datetime-local" value={form.start_time} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))}
                    className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${pRing}`}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                  <input type="datetime-local" value={form.end_time} onChange={e=>setForm(f=>({...f,end_time:e.target.value}))}
                    className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${pRing}`}/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructions</label>
                <textarea rows={3} value={form.instructions} onChange={e=>setForm(f=>({...f,instructions:e.target.value}))}
                  className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${pRing} resize-none`} placeholder="Exam instructions for students…"/>
              </div>
              {/* Settings toggles */}
              <div className="border border-slate-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Settings</p>
                {[
                  { key:"negative_marking", label:"Enable Negative Marking" },
                  { key:"shuffle_questions", label:"Shuffle Questions" },
                  { key:"shuffle_options", label:"Shuffle Options" },
                  { key:"calculator_allowed", label:"Allow Calculator" },
                  { key:"resume_allowed", label:"Allow Resume" },
                  { key:"auto_submit_on_warnings", label:"Auto-submit on Max Warnings" },
                  { key:"show_result_immediately", label:"Show Result Immediately After Submit" },
                ].map(s => (
                  <label key={s.key} className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setForm(f=>({...f,[s.key]:!(f as any)[s.key]}))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${(form as any)[s.key]?pBg:"bg-slate-200"}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${(form as any)[s.key]?"translate-x-5":"translate-x-0"}`}/>
                    </div>
                    <span className="text-sm text-slate-700">{s.label}</span>
                  </label>
                ))}
                {(form as any).negative_marking && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Negative Mark Value (per wrong answer)</label>
                    <input type="number" step="0.25" min="0" value={form.global_negative_value}
                      onChange={e=>setForm(f=>({...f,global_negative_value:parseFloat(e.target.value)||0}))}
                      className={`w-32 border border-slate-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 ${pRing}`}/>
                  </div>
                )}
                {(form as any).auto_submit_on_warnings && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Max Warnings before Auto-submit</label>
                    <input type="number" min="1" max="10" value={form.max_warnings}
                      onChange={e=>setForm(f=>({...f,max_warnings:parseInt(e.target.value)||3}))}
                      className={`w-24 border border-slate-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 ${pRing}`}/>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600">Cancel</button>
                <button type="submit" disabled={saving} className={`flex-1 py-2.5 ${pBg} ${pBgHover} text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2`}>
                  {saving && <Loader2 size={15} className="animate-spin"/>}
                  {saving ? "Saving…" : editExam ? "Update Exam" : "Create Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
