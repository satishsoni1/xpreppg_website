import { useState, useEffect } from "react";
import { PublicAPI } from "@/services/publicApi";
import { Calendar, AlertTriangle, Loader2, BookOpen } from "lucide-react";
import RevisionSchedule from "@/components/RevisionSchedule";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  postponed: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

// Admin-managed XRevise schedule; falls back to the standard 15-day schedule when none is set
export default function LiveSchedule() {
  const [apiSchedule, setApiSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState("");

  useEffect(() => {
    PublicAPI.getXreviseSchedule().then(res => {
      if (res.status) setApiSchedule(res.schedule || []);
    }).finally(() => setLoading(false));
  }, []);

  const subjects = Array.from(new Set(apiSchedule.map((e: any) => e.subject))).sort();
  const filtered = filterSubject ? apiSchedule.filter(e => e.subject === filterSubject) : apiSchedule;

  const grouped = filtered.reduce<Record<string, any[]>>((acc, e) => {
    if (!acc[e.subject]) acc[e.subject] = [];
    acc[e.subject].push(e);
    return acc;
  }, {});

  if (!loading && apiSchedule.length === 0) return <RevisionSchedule />;

  return (
    <section id="schedule" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">4 Phases · Structured Revision</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy">XRevise Schedule</h2>
          <p className="text-gray-500 mt-3">Day-wise, subject-wise revision plan — updated live.</p>
        </div>
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-3" size={32} />
            <p>Loading schedule…</p>
          </div>
        ) : (
          <>
            {/* Filter */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <label className="text-sm font-semibold text-gray-600">Filter by subject:</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterSubject("")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${!filterSubject ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-600 hover:border-primary"}`}>
                  All
                </button>
                {subjects.map(s => (
                  <button key={s} onClick={() => setFilterSubject(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterSubject === s ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-600 hover:border-primary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule cards */}
            <div className="space-y-6">
              {Object.entries(grouped).map(([subject, entries]) => (
                <div key={subject} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <BookOpen size={16} className="text-primary" />
                    <h3 className="font-bold text-gray-800">{subject}</h3>
                    <span className="text-xs text-gray-400">({entries.length} session{entries.length > 1 ? "s" : ""})</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {entries.map(entry => (
                      <div key={entry.id} className="px-5 py-4 flex items-start gap-4">
                        <div className="bg-primary/10 text-primary font-bold text-sm rounded-lg px-2.5 py-1.5 shrink-0 text-center min-w-[3.5rem]">
                          Day {entry.day_number}
                          {entry.day_label && <div className="text-[10px] font-normal text-primary/70">{entry.day_label}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{entry.topic}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {entry.scheduled_date && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar size={10} />
                                {new Date(entry.scheduled_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            )}
                            {entry.status === "postponed" && entry.postponed_to && (
                              <span className="text-xs text-yellow-600 flex items-center gap-1">
                                <AlertTriangle size={10} />
                                Postponed to {new Date(entry.postponed_to).toLocaleDateString("en-IN")}
                              </span>
                            )}
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[entry.status] || "bg-gray-100 text-gray-600"}`}>
                              {entry.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
