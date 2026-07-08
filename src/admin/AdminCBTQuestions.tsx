import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2, X, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { CbtModuleAPI } from "@/services/adminApi";

interface Question {
  id: number;
  question_text: string;
  options: string[] | Record<string, string>;
  correct_answer: string;
  marks: number;
  negative_marks: number;
  subject: string;
  difficulty: string;
  explanation: string;
  question_order: number;
  section_index?: number;
}

const OPTION_KEYS = ["A", "B", "C", "D"];
const EMPTY_Q = {
  question_text: "",
  optionA: "", optionB: "", optionC: "", optionD: "",
  correct_answer: "A",
  marks: "4",
  negative_marks: "0",
  subject: "",
  difficulty: "medium",
  explanation: "",
  question_order: "",
};

const TOTAL_SECTIONS = 5;
const sectionSizeFor = (total: number) => Math.max(1, Math.ceil(total / TOTAL_SECTIONS));

function optionVal(opts: any, key: string): string {
  if (!opts) return "";
  if (Array.isArray(opts)) {
    const idx = OPTION_KEYS.indexOf(key);
    return opts[idx] || "";
  }
  return opts[key] || "";
}

export default function AdminCBTQuestions() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [form, setForm] = useState({ ...EMPTY_Q });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [uploadingExpl, setUploadingExpl] = useState(false);
  const [explMsg, setExplMsg] = useState("");

  const load = async () => {
    if (!examId) return;
    setLoading(true);
    const r = await CbtModuleAPI.getQuestions(Number(examId));
    if (r.status) setQuestions(r.questions);
    setLoading(false);
  };

  useEffect(() => { load(); }, [examId]);

  const openCreate = () => {
    setEditQ(null);
    const nextOrder = questions.length + 1;
    setForm({ ...EMPTY_Q, question_order: String(nextOrder) });
    setErr("");
    setShowModal(true);
  };

  const openEdit = (q: Question) => {
    setEditQ(q);
    const opts = q.options;
    setForm({
      question_text: q.question_text,
      optionA: optionVal(opts, "A"),
      optionB: optionVal(opts, "B"),
      optionC: optionVal(opts, "C"),
      optionD: optionVal(opts, "D"),
      correct_answer: q.correct_answer,
      marks: String(q.marks),
      negative_marks: String(q.negative_marks),
      subject: q.subject || "",
      difficulty: q.difficulty || "medium",
      explanation: q.explanation || "",
      question_order: String(q.question_order || ""),
    });
    setErr("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.question_text.trim()) { setErr("Question text is required"); return; }
    if (!form.optionA || !form.optionB || !form.optionC || !form.optionD) { setErr("All 4 options are required"); return; }
    setSaving(true); setErr("");
    const payload = {
      question_text: form.question_text.trim(),
      options: { A: form.optionA, B: form.optionB, C: form.optionC, D: form.optionD },
      correct_answer: form.correct_answer,
      marks: Number(form.marks) || 4,
      negative_marks: Number(form.negative_marks) || 0,
      subject: form.subject.trim() || null,
      difficulty: form.difficulty,
      explanation: form.explanation.trim() || null,
      question_order: form.question_order ? Number(form.question_order) : undefined,
    };
    const r = editQ
      ? await CbtModuleAPI.updateQuestion(editQ.id, payload)
      : await CbtModuleAPI.addQuestion(Number(examId), payload);
    setSaving(false);
    if (!r.status) { setErr(r.message || "Error"); return; }
    setShowModal(false);
    load();
  };

  const handleDelete = async (q: Question) => {
    if (!confirm("Delete this question?")) return;
    const r = await CbtModuleAPI.deleteQuestion(q.id);
    if (r.status) load();
  };

  const handleExplanationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !examId) return;
    setUploadingExpl(true);
    setExplMsg("");
    const r = await CbtModuleAPI.bulkUpdateExplanations(Number(examId), file);
    setUploadingExpl(false);
    setExplMsg(r.message || (r.status ? "Done" : "Upload failed"));
    if (r.status) load();
  };

  const sectionSize = sectionSizeFor(questions.length);
  const sectionOf = (idx: number) => Math.floor(idx / sectionSize) + 1;

  const grouped: Record<number, Question[]> = {};
  questions.forEach((q, i) => {
    const sec = Math.floor(i / sectionSize) + 1;
    if (!grouped[sec]) grouped[sec] = [];
    grouped[sec].push(q);
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/admin/cbt/exams")} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">CBT Questions — Exam #{examId}</h1>
          <p className="text-sm text-gray-500">{questions.length} questions · {Math.ceil(questions.length / sectionSize)} sections</p>
        </div>
        <label
          title="CSV columns: question_id (or question_text) + explanation"
          className={`flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-semibold hover:bg-amber-100 transition cursor-pointer ${uploadingExpl ? "opacity-50 pointer-events-none" : ""}`}
        >
          <Upload size={16} /> {uploadingExpl ? "Uploading..." : "Bulk Upload Explanations"}
          <input type="file" accept=".csv" className="hidden" onChange={handleExplanationUpload} disabled={uploadingExpl} />
        </label>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          <Plus size={16} /> Add Question
        </button>
      </div>

      {explMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${explMsg.toLowerCase().includes("fail") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {explMsg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">Loading...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No questions yet. Add your first question.</p>
          <button onClick={openCreate} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Add Question</button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([sec, qs]) => (
            <div key={sec} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-700">Section {sec} ({qs.length} questions · 42 min)</h3>
                <span className="text-xs text-blue-500">Q {(Number(sec)-1)*sectionSize+1} – {Math.min(Number(sec)*sectionSize, questions.length)}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {qs.map((q, qi) => {
                  const globalIdx = (Number(sec)-1)*sectionSize + qi;
                  const opts = q.options;
                  return (
                    <div key={q.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">
                          {globalIdx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium leading-snug line-clamp-2">{q.question_text}</p>
                          <div className="flex gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                            {q.subject && <span>{q.subject}</span>}
                            <span className="capitalize">{q.difficulty}</span>
                            <span className="text-green-600 font-medium">+{q.marks}</span>
                            {q.negative_marks > 0 && <span className="text-red-500">-{q.negative_marks}</span>}
                            <span className="text-blue-600 font-bold">Ans: {q.correct_answer}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setExpanded(expanded === q.id ? null : q.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                            {expanded === q.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(q)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      {expanded === q.id && (
                        <div className="mt-3 ml-11 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {OPTION_KEYS.map(key => (
                            <div key={key} className={`flex gap-2 p-2 rounded-lg ${q.correct_answer === key ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}>
                              <span className={`font-bold ${q.correct_answer === key ? "text-green-600" : "text-gray-500"}`}>{key}.</span>
                              <span className="text-gray-700">{optionVal(opts, key)}</span>
                            </div>
                          ))}
                          {q.explanation && (
                            <div className="col-span-full mt-1 text-xs text-gray-500 bg-amber-50 rounded-lg p-2">
                              <span className="font-bold text-amber-700">Explanation: </span>{q.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editQ ? "Edit Question" : "Add Question"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {err && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{err}</p>}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Question Text *</label>
                <textarea value={form.question_text} onChange={e => setForm(f => ({...f, question_text: e.target.value}))}
                  rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter question text..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OPTION_KEYS.map(key => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Option {key} *</label>
                    <input value={(form as any)[`option${key}`]}
                      onChange={e => setForm(f => ({...f, [`option${key}`]: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${key}`} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Correct Answer</label>
                  <select value={form.correct_answer} onChange={e => setForm(f => ({...f, correct_answer: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {OPTION_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Marks</label>
                  <input type="number" value={form.marks} onChange={e => setForm(f => ({...f, marks: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Neg. Marks</label>
                  <input type="number" step="0.25" value={form.negative_marks} onChange={e => setForm(f => ({...f, negative_marks: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Order</label>
                  <input type="number" value={form.question_order} onChange={e => setForm(f => ({...f, question_order: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Subject</label>
                  <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Anatomy" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Explanation</label>
                <textarea value={form.explanation} onChange={e => setForm(f => ({...f, explanation: e.target.value}))}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Optional explanation for the correct answer" />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Saving..." : editQ ? "Update" : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
