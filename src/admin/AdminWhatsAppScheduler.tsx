import { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2, Plus, Clock, CheckCircle2, X } from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

const TEMPLATES = {
  xrevise_reminder: (topic: string, date: string) =>
    `📚 *XREVISE Reminder!*\n\nHello! Your XRevise session is scheduled in *3 hours* today.\n\n📖 Topic: *${topic}*\n📅 Date: ${date}\n\nPlease revise your notes and be ready. Good luck! 💪\n\n— XPREPPG Team`,
  cbt_reminder: (examTitle: string, date: string) =>
    `🏆 *CBT Exam Alert!*\n\nHello! Your CBT Exam is in *2 days*.\n\n📝 Exam: *${examTitle}*\n📅 Date: ${date}\n\nMake sure you have your admit card ready. Review your preparation checklist. Best of luck! 🍀\n\n— XPREPPG Team`,
  custom: () => "",
};

export default function AdminWhatsAppScheduler() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    exam_type: "XRevise",
    type: "xrevise_reminder",
    param1: "",
    param2: "",
    message: "",
    scheduled_at: "",
  });

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getWhatsAppMessages();
      if (res.status) setMessages(res.messages || []);
    } finally { setLoading(false); }
  };

  const getPreview = () => {
    if (form.type === "xrevise_reminder") return TEMPLATES.xrevise_reminder(form.param1 || "Topic", form.param2 || "Today");
    if (form.type === "cbt_reminder") return TEMPLATES.cbt_reminder(form.param1 || "CBT Exam", form.param2 || "Date");
    return form.message;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const finalMessage = form.type === "custom" ? form.message : getPreview();
      const res = await AdminAPI.sendWhatsAppMessage({
        type: form.type,
        message: finalMessage,
        scheduled_at: form.scheduled_at || null,
        exam_type: form.exam_type,
      });
      if (res.status) { setShowCompose(false); fetchMessages(); }
      else alert(res.message || "Failed to schedule");
    } finally { setSending(false); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-green-600" size={22} /> WhatsApp Scheduler
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Schedule reminder messages for XRevise (3hr before) and CBT (2 days before)</p>
        </div>
        <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition">
          <Plus size={16} /> Compose Message
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
        <strong>Note:</strong> This module schedules messages to be sent via WhatsApp Business API. Messages are saved here and can be triggered manually or via a cron job connected to your WhatsApp API provider (e.g., Gupshup, Wati, Twilio).
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={28} /></div>
      ) : (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
              <MessageSquare className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">No messages scheduled yet</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.exam_type === "CBT" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                }`}>
                  <MessageSquare size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      msg.exam_type === "CBT" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>{msg.exam_type || "All"}</span>
                    <span className="text-xs text-gray-400">{msg.type?.replace("_", " ")}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-auto ${
                      msg.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {msg.status === "sent" ? <><CheckCircle2 size={10} className="inline mr-0.5" />Sent</> : <><Clock size={10} className="inline mr-0.5" />Scheduled</>}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {msg.scheduled_at ? `Scheduled: ${new Date(msg.scheduled_at).toLocaleString("en-IN")}` : "Immediate"}
                    · Added {new Date(msg.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showCompose && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Compose WhatsApp Message</h2>
              <button onClick={() => setShowCompose(false)}><X size={22} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Type</label>
                  <select value={form.exam_type} onChange={e => setForm(f => ({ ...f, exam_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="XRevise">XRevise (3hr before)</option>
                    <option value="CBT">CBT (2 days before)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Template</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="xrevise_reminder">XRevise Reminder</option>
                    <option value="cbt_reminder">CBT Reminder</option>
                    <option value="custom">Custom Message</option>
                  </select>
                </div>
              </div>

              {form.type !== "custom" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      {form.type === "xrevise_reminder" ? "Topic" : "Exam Name"}
                    </label>
                    <input value={form.param1} onChange={e => setForm(f => ({ ...f, param1: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                      placeholder={form.type === "xrevise_reminder" ? "Pharmacology" : "CBT-5"} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                    <input type="date" value={form.param2} onChange={e => setForm(f => ({ ...f, param2: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Message *</label>
                  <textarea required={form.type === "custom"} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Type your WhatsApp message here…" />
                </div>
              )}

              {form.type !== "custom" && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-green-700 mb-2 uppercase">Message Preview</p>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{getPreview()}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Schedule At (optional)</label>
                <input type="datetime-local" value={form.scheduled_at}
                  onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none" />
                <p className="text-xs text-gray-400 mt-1">Leave blank to save as draft for manual trigger</p>
              </div>

              <button type="submit" disabled={sending}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                {sending ? "Saving…" : "Schedule Message"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
