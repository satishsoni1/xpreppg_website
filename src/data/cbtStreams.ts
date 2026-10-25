// CBT exam streams — mirrors STREAMS in backend cbtExamController.js
export type CbtStream = "neet_pg" | "neet_ug" | "jee";

export interface CbtStreamInfo {
  value: CbtStream;
  label: string;
  short: string;
  pattern: string;        // one-line exam pattern shown to students
  sectionRule: string;    // how the timer works in our CBT
  categories: string[];   // registration "category" choices for this stream
  badgeClass: string;
}

export const CBT_STREAMS: CbtStreamInfo[] = [
  {
    value: "neet_pg",
    label: "NEET PG",
    short: "NEET PG",
    pattern: "200 questions · 3 hrs 30 min · +4 / −1",
    sectionRule: "5 sections · 42-minute timer per section",
    categories: ["Pre-Intern", "Intern", "Post-Intern"],
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    value: "neet_ug",
    label: "NEET UG",
    short: "NEET UG",
    pattern: "180 questions · 3 hrs · Physics, Chemistry, Biology · +4 / −1",
    sectionRule: "Single paper · 180-minute timer",
    categories: ["Class 11", "Class 12", "Dropper"],
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "jee",
    label: "JEE Main",
    short: "JEE",
    pattern: "75 questions · 3 hrs · Physics, Chemistry, Maths · +4 / −1",
    sectionRule: "Single paper · 180-minute timer",
    categories: ["Class 11", "Class 12", "Dropper"],
    badgeClass: "bg-orange-100 text-orange-700",
  },
];

export function cbtStream(value?: string | null): CbtStreamInfo {
  return CBT_STREAMS.find(s => s.value === value) || CBT_STREAMS[0];
}

export function isCbtStream(value?: string | null): value is CbtStream {
  return CBT_STREAMS.some(s => s.value === value);
}
