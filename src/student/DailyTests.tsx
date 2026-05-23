import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, Lock, PlayCircle, Calendar, Clock, BookOpen,
  Trophy, Flame, Star, ChevronRight, Info
} from "lucide-react";

interface DayPlan {
  day: number;
  subject: string;
  topic: string;
  questions: number;
  duration: number;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "completed" | "available" | "locked";
}

const SUBJECT_COLORS: Record<string, string> = {
  "Anatomy": "bg-blue-100 text-blue-700",
  "Physiology": "bg-green-100 text-green-700",
  "Biochemistry": "bg-yellow-100 text-yellow-700",
  "Pathology": "bg-red-100 text-red-700",
  "Pharmacology": "bg-purple-100 text-purple-700",
  "Microbiology": "bg-teal-100 text-teal-700",
  "Forensic Medicine": "bg-orange-100 text-orange-700",
  "Community Medicine": "bg-emerald-100 text-emerald-700",
  "ENT": "bg-pink-100 text-pink-700",
  "Ophthalmology": "bg-indigo-100 text-indigo-700",
  "Surgery": "bg-cyan-100 text-cyan-700",
  "Medicine": "bg-sky-100 text-sky-700",
  "OBG": "bg-rose-100 text-rose-700",
  "Psychiatry": "bg-violet-100 text-violet-700",
  "Pediatrics": "bg-lime-100 text-lime-700",
  "Dermatology": "bg-amber-100 text-amber-700",
  "Orthopedics": "bg-slate-100 text-slate-700",
  "Radiology": "bg-fuchsia-100 text-fuchsia-700",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-green-600 bg-green-50",
  Medium: "text-yellow-600 bg-yellow-50",
  Hard: "text-red-600 bg-red-50",
};

const dailyPlan: DayPlan[] = [
  { day: 1, subject: "Anatomy", topic: "Upper Limb — Muscles & Nerves", questions: 30, duration: 25, difficulty: "Easy", status: "completed" },
  { day: 2, subject: "Anatomy", topic: "Lower Limb — Bones & Joints", questions: 30, duration: 25, difficulty: "Easy", status: "completed" },
  { day: 3, subject: "Physiology", topic: "Cardiac Physiology & ECG", questions: 30, duration: 25, difficulty: "Medium", status: "completed" },
  { day: 4, subject: "Biochemistry", topic: "Glycolysis & TCA Cycle", questions: 30, duration: 25, difficulty: "Medium", status: "available" },
  { day: 5, subject: "Pathology", topic: "Cell Injury & Inflammation", questions: 30, duration: 25, difficulty: "Medium", status: "locked" },
  { day: 6, subject: "Pharmacology", topic: "Autonomic Pharmacology", questions: 30, duration: 25, difficulty: "Medium", status: "locked" },
  { day: 7, subject: "Microbiology", topic: "Bacteriology — High Yield", questions: 30, duration: 25, difficulty: "Hard", status: "locked" },
  { day: 8, subject: "Anatomy", topic: "Head & Neck — Cranial Nerves", questions: 30, duration: 25, difficulty: "Hard", status: "locked" },
  { day: 9, subject: "Physiology", topic: "Renal Physiology & Fluids", questions: 30, duration: 25, difficulty: "Medium", status: "locked" },
  { day: 10, subject: "Biochemistry", topic: "Vitamins & Minerals", questions: 30, duration: 25, difficulty: "Easy", status: "locked" },
  { day: 11, subject: "Pathology", topic: "Neoplasia & Tumor Markers", questions: 30, duration: 25, difficulty: "Hard", status: "locked" },
  { day: 12, subject: "Pharmacology", topic: "CVS Drugs — Beta blockers, ACE-I", questions: 30, duration: 25, difficulty: "Hard", status: "locked" },
  { day: 13, subject: "Forensic Medicine", topic: "IPC Sections & Medico-legal", questions: 30, duration: 25, difficulty: "Medium", status: "locked" },
  { day: 14, subject: "Community Medicine", topic: "Biostatistics & Epidemiology", questions: 30, duration: 25, difficulty: "Medium", status: "locked" },
  { day: 15, subject: "Medicine", topic: "Cardiology — IHD & Heart Failure", questions: 30, duration: 25, difficulty: "Hard", status: "locked" },
  { day: 16, subject: "Surgery", topic: "GI Surgery — High Yield", questions: 30, duration: 25, difficulty: "Hard", status: "locked" },
  { day: 17, subject: "OBG", topic: "Obstetrics — Normal Labour", questions: 30, duration: 25, difficulty: "Medium", status: "locked" },
  { day: 18, subject: "Pediatrics", topic: "Neonatology & Growth", questions: 30, duration: 25, difficulty: "Medium", status: "locked" },
  { day: 19, subject: "ENT", topic: "Ear — CSOM & Deafness", questions: 30, duration: 25, difficulty: "Easy", status: "locked" },
  { day: 20, subject: "Ophthalmology", topic: "Glaucoma & Retinal Disorders", questions: 30, duration: 25, difficulty: "Medium", status: "locked" },
  { day: 21, subject: "Psychiatry", topic: "Schizophrenia & Mood Disorders", questions: 30, duration: 25, difficulty: "Medium", status: "locked" },
  { day: 22, subject: "Dermatology", topic: "Infectious Dermatology", questions: 30, duration: 25, difficulty: "Easy", status: "locked" },
  { day: 23, subject: "Orthopedics", topic: "Fractures & Dislocations", questions: 30, duration: 25, difficulty: "Medium", status: "locked" },
  { day: 24, subject: "Radiology", topic: "X-Ray & CT Findings", questions: 30, duration: 25, difficulty: "Hard", status: "locked" },
  { day: 25, subject: "Medicine", topic: "Grand Revision — All 19 Subjects", questions: 60, duration: 60, difficulty: "Hard", status: "locked" },
];

export default function DailyTests() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);

  const completedDays = dailyPlan.filter(d => d.status === "completed").length;
  const availableDay = dailyPlan.find(d => d.status === "available");
  const streakDays = completedDays;

  return (
    <div className="max-w-4xl mx-auto pb-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          25-Day Daily Test Programme
        </h1>
        <p className="text-gray-500 mt-1">Complete one focused test every day to master NEET PG systematically.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-sky-100 shadow-sm text-center">
          <div className="text-3xl font-bold text-primary">{completedDays}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Days Done</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-sky-100 shadow-sm text-center">
          <div className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-1">
            <Flame className="w-6 h-6" />
            {streakDays}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Day Streak</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-sky-100 shadow-sm text-center">
          <div className="text-3xl font-bold text-gray-900">{25 - completedDays}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Days Left</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-sky-100 shadow-sm text-center">
          <div className="text-3xl font-bold text-green-600">
            {Math.round((completedDays / 25) * 100)}%
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Progress</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-5 border border-sky-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-primary">{completedDays}/25 days</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary to-primaryDark h-3 rounded-full transition-all duration-700"
            style={{ width: `${(completedDays / 25) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>Day 1</span>
          <span>Day 13</span>
          <span>Day 25</span>
        </div>
      </div>

      {/* Today's Test Highlight */}
      {availableDay && (
        <div className="bg-gradient-to-r from-primary to-primaryDark rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
                <span className="text-sky-100 text-sm font-semibold uppercase tracking-wider">Today's Test</span>
              </div>
              <h2 className="text-xl font-bold mb-1">Day {availableDay.day}: {availableDay.subject}</h2>
              <p className="text-sky-100 text-sm mb-4">{availableDay.topic}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> {availableDay.questions} Questions
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {availableDay.duration} Minutes
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> {availableDay.difficulty}
                </span>
              </div>
            </div>
            <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-sky-50 transition-colors shrink-0 flex items-center gap-2 ml-4">
              <PlayCircle className="w-5 h-5" />
              Start Test
            </button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-sky-800">
          <span className="font-semibold">How it works:</span> One test unlocks each day. Complete Day N to unlock Day N+1. Each test has 30 focused questions (Day 25 has 60). Tests are timed — just like NEET PG!
        </div>
      </div>

      {/* 25-Day Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Your 25-Day Schedule
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dailyPlan.map((day) => (
            <button
              key={day.day}
              disabled={day.status === "locked"}
              onClick={() => setSelectedDay(selectedDay?.day === day.day ? null : day)}
              className={`relative text-left rounded-xl border p-4 transition-all duration-200 group
                ${day.status === "completed"
                  ? "bg-green-50 border-green-200 hover:border-green-400 hover:shadow-md"
                  : day.status === "available"
                  ? "bg-white border-primary shadow-md hover:shadow-xl hover:border-primaryDark ring-2 ring-sky-100"
                  : "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                }
                ${selectedDay?.day === day.day ? "ring-2 ring-primary" : ""}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Day icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm
                    ${day.status === "completed" ? "bg-green-500 text-white" :
                      day.status === "available" ? "bg-primary text-white" :
                      "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {day.status === "completed" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : day.status === "locked" ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      day.day
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">Day {day.day}</span>
                      {day.status === "available" && (
                        <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-medium truncate">{day.subject} — {day.topic}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[day.difficulty]}`}>
                    {day.difficulty}
                  </span>
                  <span className="text-xs text-gray-400">{day.questions}Q • {day.duration}m</span>
                </div>
              </div>

              {/* Expanded Detail */}
              {selectedDay?.day === day.day && day.status !== "locked" && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${SUBJECT_COLORS[day.subject] || "bg-sky-100 text-sky-700"}`}>
                      {day.subject}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{day.topic}</p>
                  {day.status === "available" && (
                    <button className="w-full bg-primary text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-primaryDark transition-colors">
                      <PlayCircle className="w-4 h-4" />
                      Start Day {day.day} Test
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {day.status === "completed" && (
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 hover:bg-green-200 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">
                        Review Answers
                      </button>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Day 25 Special Callout */}
      <div className="mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 text-center">
        <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Day 25 — Grand Finale Test</h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto mb-3">
          60 questions across all 19 subjects. Complete all 25 days to unlock the Grand Revision Test and earn your <strong>25-Day Champion Badge</strong>.
        </p>
        <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-4 py-2 rounded-full">
          <Lock className="w-3.5 h-3.5" /> Unlock by completing Days 1–24
        </span>
      </div>
    </div>
  );
}
