import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Save, CheckCircle, Image as ImageIcon, BookOpen, FileText,
  UploadCloud, Loader2, List, PlusCircle, AlertCircle, Trash2,
  Pencil, X, Download, Link2,
} from "lucide-react";
import { XReviseAPI } from "@/services/adminApi";

const SUBJECTS = [
  "ANATOMY","PHYSIOLOGY","BIOCHEMISTRY","PHARMACOLOGY","PATHOLOGY",
  "MICROBIOLOGY","FORENSIC MEDICINE","COMMUNITY MEDICINE","MEDICINE",
  "SURGERY","OBS & GNY","PEDIATRICS","PSYCHIATRY","DERMATOLOGY",
  "ORTHO","ENT","OPHTHALMOLOGY","RADIOLOGY","ANESTHESIA",
];

const EMPTY_FORM = {
  type: "CB",
  question_text: "",
  image_url: "",
  options: ["", "", "", ""],
  correct_answer: "",
  marks: 4,
  negative_marks: -1,
  subject: "ANATOMY",
  difficulty: "MEDIUM",
  description: "",
  description_image: "",
  tag: "",
};

const SAMPLE_CSV = `question_text,option1,option2,option3,option4,correct_answer,subject,difficulty,marks,negative_marks,image_url,explanation,description_image
Which is the most common site for ectopic pregnancy?,Ampulla of fallopian tube,Isthmus,Interstitial,Ovary,A,OBS & GNY,MEDIUM,4,-1,,Ampullary ectopic is commonest (70%),
Drug of choice for malaria prophylaxis?,Chloroquine,Primaquine,Doxycycline,Mefloquine,A,PHARMACOLOGY,EASY,4,-1,,,
`;

export default function AdminXreviseQuestions() {
  const [searchParams] = useSearchParams();
  const [exams, setExams] = useState<any[]>([]);
  const [examId, setExamId] = useState("");
  const [activeTab, setActiveTab] = useState<"ADD" | "VIEW" | "BULK">("ADD");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQs, setLoadingQs] = useState(false);

  // Add / Edit form
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState({ question: false, explanation: false });
  const [saving, setSaving] = useState(false);

  // Bulk
  const [bulkJson, setBulkJson] = useState("");
  const [bulkStatus, setBulkStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvFileName, setCsvFileName] = useState("");

  const questionFileRef = useRef<HTMLInputElement>(null);
  const explanationFileRef = useRef<HTMLInputElement>(null);
  const bulkJsonFileRef = useRef<HTMLInputElement>(null);
  const csvFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    XReviseAPI.getExams().then((d: any) => {
      if (d.status) {
        setExams(d.exams);
        const paramExam = searchParams.get("exam");
        if (paramExam) {
          setExamId(paramExam);
        } else if (d.exams.length > 0) {
          setExamId(d.exams[0].id.toString());
        }
      }
    });
  }, []);

  useEffect(() => {
    if (examId) fetchQuestions(examId);
  }, [examId]);

  const fetchQuestions = async (id: string) => {
    setLoadingQs(true);
    try {
      const res = await XReviseAPI.getQuestions(id);
      if (res.status) setQuestions(res.questions || []);
    } finally {
      setLoadingQs(false);
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const opts = [...formData.options];
    opts[idx] = val;
    setFormData({ ...formData, options: opts });
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image_url" | "description_image"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const kind = field === "image_url" ? "question" : "explanation";
    setIsUploading(p => ({ ...p, [kind]: true }));
    const fd = new FormData();
    fd.append("image", file);
    try {
      const data = await XReviseAPI.uploadImage(fd);
      if (data.status) setFormData(p => ({ ...p, [field]: data.url }));
      else alert("Upload failed: " + data.message);
    } catch {
      alert("Error uploading image.");
    } finally {
      setIsUploading(p => ({ ...p, [kind]: false }));
      if (e.target) e.target.value = "";
    }
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!examId) return alert("Select an exam first.");
    if (!formData.question_text || formData.correct_answer === "") {
      return alert("Fill question text and select the correct answer.");
    }
    setSaving(true);
    try {
      const payload = { ...formData, exam_id: examId };
      const res = editingId
        ? await XReviseAPI.editQuestion(editingId, payload)
        : await XReviseAPI.addQuestion(payload);
      if (res.status) {
        alert(editingId ? "Question updated!" : "Question saved!");
        resetForm();
        fetchQuestions(examId);
      } else {
        alert("Error: " + res.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (q: any) => {
    let opts: string[] = [];
    try { opts = typeof q.options === "string" ? JSON.parse(q.options) : q.options; } catch {}
    setFormData({
      type: q.type || "CB",
      question_text: q.question_text || "",
      image_url: q.image_path || "",
      options: opts.length ? opts : ["", "", "", ""],
      correct_answer: q.correct_answer?.toString() || "",
      marks: q.marks ?? 4,
      negative_marks: q.negative_marks ?? -1,
      subject: q.subject || "ANATOMY",
      difficulty: q.difficulty || "MEDIUM",
      description: q.description || "",
      description_image: q.description_image || "",
      tag: q.tag || "",
    });
    setEditingId(q.id);
    setActiveTab("ADD");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this question?")) return;
    await XReviseAPI.deleteQuestion(id);
    fetchQuestions(examId);
  };

  // ── Bulk JSON upload ──
  const handleBulkJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setBulkJson((ev.target?.result as string) || "");
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const handleBulkUpload = async () => {
    if (!examId) return alert("Select an exam first.");
    let qs: any[];
    try {
      const parsed = JSON.parse(bulkJson);
      qs = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(qs)) throw new Error("Must be an array");
    } catch (err: any) {
      setBulkStatus({ type: "error", msg: "Invalid JSON: " + err.message });
      return;
    }
    setBulkLoading(true);
    setBulkStatus(null);
    try {
      const res = await XReviseAPI.bulkAddQuestions(examId, qs);
      setBulkStatus({ type: res.status ? "success" : "error", msg: res.message });
      if (res.status) { setBulkJson(""); fetchQuestions(examId); }
    } finally {
      setBulkLoading(false);
    }
  };

  // ── CSV upload ──
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setCsvFileName(file.name);
    if (e.target) e.target.value = "";
  };

  const handleCsvUpload = async () => {
    if (!examId) return alert("Select an exam first.");
    if (!csvFile) return alert("Choose a CSV file first.");
    setBulkLoading(true);
    setBulkStatus(null);
    try {
      const res = await XReviseAPI.uploadQuestionsCSV(examId, csvFile);
      setBulkStatus({ type: res.status ? "success" : "error", msg: res.message || "CSV upload failed" });
      if (res.status) { setCsvFile(null); setCsvFileName(""); fetchQuestions(examId); }
    } catch {
      setBulkStatus({ type: "error", msg: "CSV upload failed" });
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "xrevise_questions_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const addImageUrlToBulkJson = () => {
    const url = prompt("Paste the image URL to add to all questions in this JSON (leave empty to skip):");
    if (!url) return;
    try {
      const parsed = JSON.parse(bulkJson);
      const qs = Array.isArray(parsed) ? parsed : parsed.questions;
      const updated = qs.map((q: any) => ({ ...q, image_url: q.image_url || url }));
      setBulkJson(JSON.stringify(updated, null, 2));
    } catch {
      alert("Parse the JSON first before adding an image URL.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-violet-200 gap-4">
        <h1 className="text-xl font-bold text-violet-800 flex items-center gap-2">
          <BookOpen className="text-violet-600" /> XRevise Questions Manager
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="font-semibold text-slate-600 whitespace-nowrap">Select Exam:</label>
          <select
            className="w-full md:w-auto border-2 border-violet-200 p-2 rounded-lg bg-violet-50 font-medium outline-none focus:border-violet-500"
            value={examId}
            onChange={e => setExamId(e.target.value)}
          >
            {exams.length === 0 && <option value="">No XRevise exams yet</option>}
            {exams.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <button
          onClick={() => { resetForm(); setActiveTab("ADD"); }}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 font-bold rounded-lg transition-all ${activeTab === "ADD" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          <PlusCircle size={18} /> {editingId ? "Edit Question" : "Add Question"}
        </button>
        <button
          onClick={() => setActiveTab("VIEW")}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 font-bold rounded-lg transition-all ${activeTab === "VIEW" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          <List size={18} /> Question Bank ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab("BULK")}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 font-bold rounded-lg transition-all ${activeTab === "BULK" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
        >
          <UploadCloud size={18} /> Bulk Upload
        </button>
      </div>

      {/* ── ADD / EDIT TAB ── */}
      {activeTab === "ADD" && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">
          {editingId && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg">
              <span className="text-amber-700 font-semibold flex items-center gap-2">
                <Pencil size={16} /> Editing Question #{editingId}
              </span>
              <button onClick={resetForm} className="text-slate-500 hover:text-red-500">
                <X size={18} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
              <select
                className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-violet-500 outline-none"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tag (optional)</label>
              <input
                className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-violet-500 outline-none"
                placeholder="e.g. Clinical Based, Image Based"
                value={formData.tag}
                onChange={e => setFormData({ ...formData, tag: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Question Text *</label>
              <textarea
                className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-violet-500 outline-none h-32"
                placeholder="Type the question here..."
                value={formData.question_text}
                onChange={e => setFormData({ ...formData, question_text: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                <ImageIcon size={16} /> Question Image
              </label>
              <div className="flex gap-2 items-center">
                <input
                  className="flex-1 border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-violet-500 outline-none"
                  placeholder="Paste image URL or upload file"
                  value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                />
                <input type="file" accept="image/*" className="hidden" ref={questionFileRef} onChange={e => handleImageUpload(e, "image_url")} />
                <button
                  onClick={() => questionFileRef.current?.click()}
                  disabled={isUploading.question}
                  className="px-4 py-3 bg-violet-100 text-violet-700 hover:bg-violet-200 font-bold rounded-xl flex items-center gap-2"
                >
                  {isUploading.question ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />} Upload
                </button>
              </div>
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-3 h-24 rounded-lg border object-contain bg-slate-50 p-2" />
              )}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 bg-violet-50/50 border border-violet-100 p-6 rounded-2xl">
            <h3 className="font-bold text-violet-900 mb-4 flex items-center gap-2">
              <CheckCircle size={18} /> Answer Options
            </h3>
            {formData.options.map((opt, idx) => {
              const isCorrect = formData.correct_answer === idx.toString();
              return (
                <div key={idx} className="flex gap-3 items-center">
                  <button
                    onClick={() => setFormData({ ...formData, correct_answer: idx.toString() })}
                    className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full font-bold border-2 ${isCorrect ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-400 border-slate-200"}`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </button>
                  <input
                    className={`flex-1 border-2 p-3 rounded-xl outline-none ${isCorrect ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-white focus:border-violet-500"}`}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="space-y-4 bg-indigo-50/50 border border-indigo-100 p-6 rounded-2xl">
            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <FileText size={18} /> Explanation / Solution
            </h3>
            <textarea
              className="w-full border-2 border-indigo-200 p-3 rounded-xl bg-white focus:border-indigo-500 outline-none h-28"
              placeholder="Detailed explanation..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="flex gap-2 items-center">
              <input
                className="flex-1 border-2 border-indigo-200 p-3 rounded-xl bg-white focus:border-indigo-500 outline-none"
                placeholder="Explanation image URL or upload"
                value={formData.description_image}
                onChange={e => setFormData({ ...formData, description_image: e.target.value })}
              />
              <input type="file" accept="image/*" className="hidden" ref={explanationFileRef} onChange={e => handleImageUpload(e, "description_image")} />
              <button
                onClick={() => explanationFileRef.current?.click()}
                disabled={isUploading.explanation}
                className="px-4 py-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold rounded-xl flex items-center gap-2"
              >
                {isUploading.explanation ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />} Upload
              </button>
            </div>
            {formData.description_image && (
              <img src={formData.description_image} alt="Explanation" className="mt-3 h-24 rounded-lg border object-contain bg-white p-2" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
              <select
                className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 outline-none"
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Marks (+)</label>
              <input type="number" className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 outline-none"
                value={formData.marks} onChange={e => setFormData({ ...formData, marks: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Negative Marks (-)</label>
              <input type="number" step="0.1" className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 outline-none"
                value={formData.negative_marks} onChange={e => setFormData({ ...formData, negative_marks: Number(e.target.value) })} />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            {editingId ? "Update Question" : "Save Question"}
          </button>
        </div>
      )}

      {/* ── VIEW TAB ── */}
      {activeTab === "VIEW" && (
        <div className="space-y-6">
          {loadingQs ? (
            <div className="text-center py-20 flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="animate-spin text-violet-500" size={40} /> Loading...
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 text-slate-500">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" /> No questions yet.
            </div>
          ) : (
            questions.map((q, idx) => {
              let opts: string[] = [];
              try { opts = typeof q.options === "string" ? JSON.parse(q.options) : q.options; } catch {}
              return (
                <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-slate-100 pb-3">
                    <span className="font-black text-slate-400 text-sm">Q {idx + 1}</span>
                    <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase items-center">
                      {q.subject && <span className="bg-violet-50 text-violet-600 px-2 py-1 rounded-md">{q.subject}</span>}
                      {q.difficulty && <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{q.difficulty}</span>}
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+{q.marks || 4}</span>
                      <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">{q.negative_marks ?? -1}</span>
                      <button onClick={() => startEdit(q)} className="ml-1 text-violet-500 hover:text-violet-700" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-600" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="text-slate-800 text-lg font-medium leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                  {q.image_path && (
                    <div className="mb-6">
                      <img src={q.image_path} alt="Question" className="max-h-64 w-auto rounded-lg border object-contain bg-slate-50 p-2" />
                    </div>
                  )}
                  <div className="space-y-2 mb-4">
                    {opts.map((opt, oi) => {
                      const correct = q.correct_answer?.toString() === oi.toString();
                      return (
                        <div key={oi} className={`flex items-center gap-3 p-3 rounded-xl border ${correct ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${correct ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span dangerouslySetInnerHTML={{ __html: opt }} />
                          {correct && <CheckCircle size={16} className="text-emerald-500 ml-auto" />}
                        </div>
                      );
                    })}
                  </div>
                  {(q.description || q.description_image) && (
                    <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div className="text-indigo-700 font-bold text-sm mb-2 flex items-center gap-2">
                        <FileText size={14} /> Explanation
                      </div>
                      {q.description && <div className="text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: q.description }} />}
                      {q.description_image && (
                        <img src={q.description_image} alt="Explanation" className="mt-2 max-h-48 rounded-lg border object-contain bg-white p-2" />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── BULK TAB ── */}
      {activeTab === "BULK" && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UploadCloud className="text-emerald-600" size={20} /> Bulk Question Upload
              </h2>
              <p className="text-sm text-slate-500 mt-1">JSON array or CSV file — both support image_url field.</p>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              <Download size={16} /> Sample CSV
            </button>
          </div>

          {/* JSON reference */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-600 overflow-x-auto">
{`[{
  "question_text": "Which is NOT a beta blocker?",
  "options": ["Atenolol","Metoprolol","Amlodipine","Propranolol"],
  "correct_answer": "2",
  "subject": "PHARMACOLOGY",
  "marks": 4,
  "negative_marks": -1,
  "difficulty": "MEDIUM",
  "image_url": "https://example.com/image.jpg",
  "description": "Amlodipine is a calcium channel blocker."
}]`}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <input ref={bulkJsonFileRef} type="file" accept=".json" className="hidden" onChange={handleBulkJsonFile} />
            <button
              onClick={() => bulkJsonFileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              <FileText size={16} /> Load JSON File
            </button>
            <button
              onClick={addImageUrlToBulkJson}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl"
              title="Add a single image URL to all questions in the JSON"
            >
              <Link2 size={16} /> Add Image URL to JSON
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Paste JSON here</label>
            <textarea
              className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-emerald-500 outline-none font-mono text-xs h-48 resize-y"
              placeholder='[{"question_text":"...","options":[...],"correct_answer":"0",...}]'
              value={bulkJson}
              onChange={e => setBulkJson(e.target.value)}
            />
          </div>

          <button
            onClick={handleBulkUpload}
            disabled={bulkLoading || !bulkJson.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
          >
            {bulkLoading ? <Loader2 className="animate-spin" size={22} /> : <UploadCloud size={22} />}
            {bulkLoading ? "Uploading…" : "Upload JSON Questions"}
          </button>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-1">CSV Upload</h3>
            <p className="text-sm text-slate-500 mb-3">
              Columns: <code className="bg-slate-100 px-1 rounded">question_text</code>, <code className="bg-slate-100 px-1 rounded">option1–4</code>, <code className="bg-slate-100 px-1 rounded">correct_answer</code> (A/B/C/D or 1/2/3/4), <code className="bg-slate-100 px-1 rounded">subject</code>, <code className="bg-slate-100 px-1 rounded">difficulty</code>, <code className="bg-slate-100 px-1 rounded">marks</code>, <code className="bg-slate-100 px-1 rounded">image_url</code>, <code className="bg-slate-100 px-1 rounded">explanation</code>.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <input ref={csvFileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvFile} />
              <button
                onClick={() => csvFileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                <FileText size={16} /> Choose CSV File
              </button>
              {csvFileName && <span className="text-sm text-slate-700">Selected: <strong>{csvFileName}</strong></span>}
              <button
                onClick={handleCsvUpload}
                disabled={bulkLoading || !csvFile}
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center gap-2"
              >
                {bulkLoading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />} Upload CSV
              </button>
            </div>
          </div>

          {bulkStatus && (
            <div className={`flex items-center gap-2 p-4 rounded-xl border text-sm font-medium ${bulkStatus.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              {bulkStatus.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {bulkStatus.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
