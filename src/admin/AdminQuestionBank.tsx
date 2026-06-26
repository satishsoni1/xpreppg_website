import { useState, useEffect, useRef } from "react";
import {
  BookOpen, Search, Plus, Edit2, Trash2, Upload, Download,
  ChevronLeft, ChevronRight, Filter, X, CheckCircle, AlertCircle,
  Image as ImageIcon, BarChart3, Loader2, Eye, EyeOff,
} from "lucide-react";
import { QuestionBankAPI } from "@/services/examApi";

const SUBJECTS = ["Anatomy","Physiology","Biochemistry","Pathology","Pharmacology",
  "Microbiology","Forensic Medicine","Community Medicine","ENT","Ophthalmology",
  "General Medicine","Surgery","Obs & Gynae","Paediatrics","Orthopaedics",
  "Anaesthesia","Radiology","Psychiatry","Dermatology","PSM"];
const DIFFICULTIES = ["easy","medium","hard"];
const emptyQ = {
  question_text:"",option_a:"",option_b:"",option_c:"",option_d:"",
  correct_answer:"A",explanation:"",explanation_image:"",image_url:"",
  subject:"",chapter:"",topic:"",difficulty:"medium",
  default_marks:1,default_negative:0,source_platform:"shared",
};

export default function AdminQuestionBank() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({ search:"",subject:"",chapter:"",topic:"",difficulty:"",platform:"" });
  const [filterOptions, setFilterOptions] = useState<any>({ subjects:[], chapters:[], topics:[] });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number|null>(null);
  const [form, setForm] = useState({ ...emptyQ });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [delConfirm, setDelConfirm] = useState<number|null>(null);
  const [previewQ, setPreviewQ] = useState<any|null>(null);
  const [uploading, setUploading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchQuestions(); }, [page, filters]);
  useEffect(() => {
    QuestionBankAPI.getFilterOptions().then(r => { if (r.status) setFilterOptions(r); });
    QuestionBankAPI.getStats().then(r => { if (r.status) setStats(r.stats); });
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const r = await QuestionBankAPI.getQuestions({ page, limit, ...filters });
      if (r.status) { setQuestions(r.questions); setTotal(r.total); }
    } finally { setLoading(false); }
  };

  const notify = (msg: string, type: "success"|"error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openAdd = () => { setEditId(null); setForm({ ...emptyQ }); setShowForm(true); };
  const openEdit = (q: any) => {
    setEditId(q.id);
    setForm({
      question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d, correct_answer: q.correct_answer,
      explanation: q.explanation || "", explanation_image: q.explanation_image || "",
      image_url: q.image_url || "", subject: q.subject || "", chapter: q.chapter || "",
      topic: q.topic || "", difficulty: q.difficulty || "medium",
      default_marks: q.default_marks || 1, default_negative: q.default_negative || 0,
      source_platform: q.source_platform || "shared",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question_text || !form.option_a || !form.option_b || !form.option_c || !form.option_d)
      return notify("All question fields are required", "error");
    setSaving(true);
    try {
      const r = editId
        ? await QuestionBankAPI.editQuestion(editId, form)
        : await QuestionBankAPI.addQuestion(form);
      if (r.status) {
        notify(editId ? "Question updated" : "Question added");
        setShowForm(false);
        fetchQuestions();
        QuestionBankAPI.getStats().then(sr => { if (sr.status) setStats(sr.stats); });
      } else notify(r.message || "Save failed", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    const r = await QuestionBankAPI.deleteQuestion(id);
    if (r.status) { notify("Question deleted"); setDelConfirm(null); fetchQuestions(); }
    else notify(r.message || "Delete failed", "error");
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const r = await QuestionBankAPI.bulkUploadExcel(e.target.files[0], { source_platform: "shared" });
    setUploading(false);
    e.target.value = "";
    if (r.status) {
      notify(`${r.inserted} questions uploaded${r.errors?.length ? `, ${r.errors.length} skipped` : ""}`);
      fetchQuestions();
      QuestionBankAPI.getStats().then(sr => { if (sr.status) setStats(sr.stats); });
    } else notify(r.message || "Upload failed", "error");
  };

  const totalPages = Math.ceil(total / limit);
  const DIFF_COLORS: Record<string,string> = { easy:"bg-green-100 text-green-700", medium:"bg-yellow-100 text-yellow-700", hard:"bg-red-100 text-red-700" };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-sm ${toast.type==="success"?"bg-emerald-600 text-white":"bg-red-600 text-white"}`}>
          {toast.type==="success"?<CheckCircle size={16}/>:<AlertCircle size={16}/>} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-violet-600" size={22}/>
            <h1 className="text-xl font-bold text-slate-800">Question Bank</h1>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">Shared</span>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button onClick={() => QuestionBankAPI.downloadTemplate()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm">
              <Download size={14}/> Template
            </button>
            <button onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
              {uploading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>} Bulk Upload
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleBulkUpload}/>
            <button onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm">
              <Plus size={14}/> Add Question
            </button>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            {[
              { label:"Total", value: stats.total, color:"text-violet-600" },
              { label:"Active", value: stats.active, color:"text-emerald-600" },
              { label:"Easy", value: stats.easy, color:"text-green-600" },
              { label:"Medium", value: stats.medium, color:"text-yellow-600" },
              { label:"Hard", value: stats.hard, color:"text-red-600" },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={filters.search} onChange={e => { setFilters(f=>({...f,search:e.target.value})); setPage(1); }}
              placeholder="Search questions, subjects, topics…"
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"/>
          </div>
          <button onClick={() => setShowFilters(f=>!f)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border ${showFilters?"bg-violet-50 border-violet-300 text-violet-700":"border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Filter size={14}/> Filters
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label:"Subject",    key:"subject",    opts: filterOptions.subjects },
              { label:"Chapter",    key:"chapter",    opts: filterOptions.chapters },
              { label:"Topic",      key:"topic",      opts: filterOptions.topics },
              { label:"Difficulty", key:"difficulty", opts: DIFFICULTIES },
              { label:"Platform",   key:"platform",   opts: ["cbt","xrevise","shared"] },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-slate-500 mb-1">{f.label}</label>
                <select value={(filters as any)[f.key]}
                  onChange={e => { setFilters(prev=>({...prev,[f.key]:e.target.value})); setPage(1); }}
                  className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300">
                  <option value="">All</option>
                  {f.opts.map((o:string) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
        {(filters.search||filters.subject||filters.chapter||filters.topic||filters.difficulty||filters.platform) && (
          <button onClick={() => { setFilters({search:"",subject:"",chapter:"",topic:"",difficulty:"",platform:""}); setPage(1); }}
            className="text-xs text-red-500 hover:underline flex items-center gap-1">
            <X size={12}/> Clear all filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-600">{total} question{total!==1?"s":""} found</p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            Page {page} of {totalPages || 1}
            <button disabled={page<=1} onClick={() => setPage(p=>p-1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft size={16}/></button>
            <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={16}/></button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" size={28}/>Loading…</div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 text-slate-200"/>
            <p className="font-semibold">No questions found</p>
            <button onClick={openAdd} className="mt-3 text-violet-600 text-sm font-semibold hover:underline">Add your first question</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {questions.map((q, idx) => (
              <div key={q.id} className="px-5 py-4 hover:bg-slate-50 transition flex items-start gap-4">
                <span className="text-xs font-bold text-slate-400 min-w-[28px] mt-1">#{(page-1)*limit+idx+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm line-clamp-2 leading-relaxed">{q.question_text}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {q.subject && <span className="text-[11px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-semibold">{q.subject}</span>}
                    {q.topic && <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{q.topic}</span>}
                    {q.difficulty && <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${DIFF_COLORS[q.difficulty]||""}`}>{q.difficulty}</span>}
                    <span className="text-[11px] text-slate-400">{q.default_marks}M / -{q.default_negative}M</span>
                    {q.image_url && <ImageIcon size={12} className="text-slate-400"/>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${q.correct_answer==="A"?"bg-green-100 text-green-700":"bg-blue-50 text-blue-700"}`}>
                      Ans: {q.correct_answer}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setPreviewQ(q)} title="Preview"
                    className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"><Eye size={15}/></button>
                  <button onClick={() => openEdit(q)} title="Edit"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={15}/></button>
                  <button onClick={() => setDelConfirm(q.id)} title="Delete"
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={15}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{editId?"Edit Question":"Add Question"}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400 hover:text-slate-700"/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Question Text *</label>
                <textarea required rows={3} value={form.question_text}
                  onChange={e => setForm(f=>({...f,question_text:e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                  placeholder="Enter the complete question…"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL (optional)</label>
                <input value={form.image_url} onChange={e => setForm(f=>({...f,image_url:e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="https://…"/>
                {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-24 rounded-lg object-contain border"/>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["A","B","C","D"] as const).map(opt => (
                  <div key={opt}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Option {opt} *</label>
                    <input required value={(form as any)[`option_${opt.toLowerCase()}`]}
                      onChange={e => setForm(f=>({...f,[`option_${opt.toLowerCase()}`]:e.target.value}))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
                      placeholder={`Option ${opt}`}/>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correct Answer *</label>
                <div className="flex gap-2">
                  {["A","B","C","D"].map(o => (
                    <button key={o} type="button"
                      onClick={() => setForm(f=>({...f,correct_answer:o}))}
                      className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 transition ${form.correct_answer===o?"border-emerald-500 bg-emerald-50 text-emerald-700":"border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                  <select value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400">
                    <option value="">Select…</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chapter</label>
                  <input value={form.chapter} onChange={e => setForm(f=>({...f,chapter:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400" placeholder="Chapter name"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Topic</label>
                  <input value={form.topic} onChange={e => setForm(f=>({...f,topic:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400" placeholder="Topic"/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm(f=>({...f,difficulty:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400">
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marks</label>
                  <input type="number" step="0.25" min="0" value={form.default_marks}
                    onChange={e => setForm(f=>({...f,default_marks:parseFloat(e.target.value)||1}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Negative Marks</label>
                  <input type="number" step="0.25" min="0" value={form.default_negative}
                    onChange={e => setForm(f=>({...f,default_negative:parseFloat(e.target.value)||0}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Explanation</label>
                <textarea rows={2} value={form.explanation} onChange={e => setForm(f=>({...f,explanation:e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400 resize-none" placeholder="Explanation for correct answer…"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Explanation Image URL</label>
                <input value={form.explanation_image} onChange={e => setForm(f=>({...f,explanation_image:e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400" placeholder="https://…"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={15} className="animate-spin"/>}
                  {saving ? "Saving…" : editId ? "Update Question" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewQ && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-slate-700 text-lg">Question Preview</span>
              <button onClick={() => setPreviewQ(null)}><X size={20} className="text-slate-400"/></button>
            </div>
            {previewQ.image_url && <img src={previewQ.image_url} alt="" className="w-full rounded-xl mb-4 max-h-48 object-contain border"/>}
            <p className="font-semibold text-slate-800 mb-4 leading-relaxed">{previewQ.question_text}</p>
            <div className="space-y-2">
              {["A","B","C","D"].map(opt => (
                <div key={opt} className={`flex items-start gap-3 p-3 rounded-xl border ${previewQ.correct_answer===opt?"border-emerald-400 bg-emerald-50":"border-slate-100 bg-slate-50"}`}>
                  <span className={`font-bold text-sm min-w-[20px] ${previewQ.correct_answer===opt?"text-emerald-600":"text-slate-500"}`}>{opt}.</span>
                  <span className="text-sm text-slate-700">{(previewQ as any)[`option_${opt.toLowerCase()}`]}</span>
                </div>
              ))}
            </div>
            {previewQ.explanation && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-700 mb-1">EXPLANATION</p>
                <p className="text-sm text-blue-800">{previewQ.explanation}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {previewQ.subject && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{previewQ.subject}</span>}
              {previewQ.chapter && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{previewQ.chapter}</span>}
              {previewQ.topic && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{previewQ.topic}</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full ${DIFF_COLORS[previewQ.difficulty]||""}`}>{previewQ.difficulty}</span>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setPreviewQ(null); openEdit(previewQ); }}
                className="flex-1 py-2 bg-violet-600 text-white rounded-xl font-semibold text-sm">Edit Question</button>
              <button onClick={() => setPreviewQ(null)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <p className="font-bold text-slate-800 mb-2">Delete Question?</p>
            <p className="text-sm text-slate-500 mb-5">This will soft-delete the question from the bank. It will NOT be removed from exams that already use it.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelConfirm(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold">Cancel</button>
              <button onClick={() => handleDelete(delConfirm)} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
