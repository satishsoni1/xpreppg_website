// X PREP flash card sets (NEET PG · INI-CET · FMGE). `name` is the group label
// used on shop products (poster_packages.subject); `description` is the
// default product description the admin form fills in.
export interface FlashcardSubject {
  name: string;
  short: string;
  note: string;
  description: string;
  box: string;      // tile colours matching the printed box
  boxText: string;
}

export const FLASHCARD_SUBJECTS: FlashcardSubject[] = [
  {
    name: "General Medicine",
    short: "Medicine",
    note: "Clinical images, tables & flowcharts for tough concepts",
    box: "bg-[#1E9BE0]",
    boxText: "text-navy",
    description:
      "X PREP General Medicine Flash Cards make difficult medical concepts easier to understand and revise. High-yield points, clinical images, tables and flowcharts help you recall important topics quickly. Ideal for rapid revision before NEET PG, INI-CET and FMGE.",
  },
  {
    name: "Surgery",
    short: "Surgery",
    note: "Exam-focused surgical topics with visual recall",
    box: "bg-[#D7191F]",
    boxText: "text-white",
    description:
      "X PREP Surgery Flash Cards provide quick, exam-focused revision of important surgical topics. Clinical images, tables and flowcharts make learning faster and improve visual recall. A practical revision companion for NEET PG, INI-CET and FMGE aspirants.",
  },
  {
    name: "Obstetrics & Gynecology",
    short: "OBGY",
    note: "High-yield OBGY points for long-term recall",
    box: "bg-[#E5157E]",
    boxText: "text-navy",
    description:
      "X PREP Obstetrics & Gynecology Flash Cards simplify important OBGY concepts through images, tables, flowcharts and high-yield points. The cards are designed for faster revision and better long-term recall. Perfect for last-minute preparation for NEET PG, INI-CET and FMGE.",
  },
  {
    name: "Community Medicine",
    short: "PSM",
    note: "Programmes, vaccines, screening & epidemiology",
    box: "bg-[#C59A62]",
    boxText: "text-navy",
    description:
      "X PREP Community Medicine Flash Cards make facts, national health programmes, vaccines, screening guidelines and epidemiology easier to remember. Colourful tables, charts and concise exam-focused notes help you revise more in less time. Ideal for NEET PG, INI-CET and FMGE preparation.",
  },
];
