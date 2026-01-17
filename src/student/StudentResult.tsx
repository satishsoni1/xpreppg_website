import { Download } from "lucide-react";

export default function StudentResult({ result, student }: any) {
  if (!result) return <div>Loading result...</div>;

  // Helper for progress bar color logic (Exact match to Python)
  const getAccColor = (acc: string) => {
    const val = parseFloat(acc);
    if (val > 70) return "bg-emerald-500"; // High (Green)
    if (val > 40) return "bg-amber-500";   // Mid (Yellow/Orange)
    return "bg-red-500";                   // Low (Red)
  };

  const getAccBadge = (acc: string) => {
    const val = parseFloat(acc);
    if (val > 70) return "bg-emerald-500 text-white";
    if (val > 40) return "bg-amber-500 text-white";
    return "bg-red-500 text-white";
  };

  // Sort difficulty manually to match order: Easy -> Medium -> Hard
  const diffOrder = { "EASY": 1, "MEDIUM": 2, "HARD ": 3, "HARD": 3 };
  const sortedDiff = result.difficulty.sort((a: any, b: any) => 
    (diffOrder[a.name as keyof typeof diffOrder] || 99) - (diffOrder[b.name as keyof typeof diffOrder] || 99)
  );

  return (
    <div className="max-w-[1000px] mx-auto bg-white shadow-lg rounded-xl overflow-hidden mb-10 font-sans print:shadow-none print:max-w-full">
      
      {/* HEADER (Matches .header in Python) */}
      <header className="bg-blue-600 text-white p-8 flex justify-between items-center print:bg-blue-600 print:text-white">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider m-0">XPrepPG</h1>
          <span className="opacity-80 text-sm block mt-1">Excellence in Medical PG Prep</span>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold m-0">{student.applicationNo}</h2>
          <div className="opacity-90 text-sm mt-1">
            AIR: <strong className="text-white text-lg">#{result.rank}</strong> / {result.totalStudents}
          </div>
        </div>
      </header>

      {/* HERO STATS (Matches .hero-stats in Python) */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-blue-50 border-b border-blue-100">
        <StatCard value={result.totalScore} label="Total Score" sub={`Rank #${result.rank}`} />
        <StatCard value={result.totalQs} label="Total Qs" />
        <StatCard value={result.totalTime} label="Total Time" />
        
        <StatCard 
          value={<span className="text-blue-800">{result.attempted} / {result.unattempted}</span>} 
          label="Att / Unatt" 
        />
        <StatCard 
          value={
            <span className="text-emerald-600">
              {result.correct} <span className="text-red-500 text-lg">/ {result.incorrect}</span>
            </span>
          } 
          label="Correct / Incorrect" 
        />
        <StatCard value={`${result.accuracy}%`} label="Accuracy" />
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* QUESTION TYPE ANALYSIS */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold text-blue-900 border-b-2 border-gray-200 pb-2 mb-4">
              Question Type Analysis
            </h3>
            <div className="space-y-4">
              {result.tags.map((item: any, idx: number) => (
                <AnalysisCard 
                  key={idx} 
                  title={item.name} 
                  acc={item.accuracy} 
                  correct={`${item.correct} / ${item.total}`}
                  avgTime={`${item.avgTime}`}
                  totalTime={item.totalTime}
                  colorClass={getAccColor(item.accuracy)}
                  badgeClass={getAccBadge(item.accuracy)}
                />
              ))}
            </div>
          </div>

          {/* DIFFICULTY ANALYSIS */}
          <div className="col-span-2">
            <h3 className="text-lg font-bold text-blue-900 border-b-2 border-gray-200 pb-2 mb-4">
              Difficulty Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedDiff.map((item: any, idx: number) => (
                <AnalysisCard 
                  key={idx} 
                  title={item.name} 
                  acc={item.accuracy} 
                  correct={`${item.correct} / ${item.total}`}
                  isSimple={true}
                  colorClass={getAccColor(item.accuracy)}
                  badgeClass={getAccBadge(item.accuracy)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* SUBJECT WISE PERFORMANCE */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-blue-900 border-b-2 border-gray-200 pb-2 mb-4">
            Subject-wise Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold text-left">
                  <th className="p-3">Subject</th>
                  <th className="p-3">Total Qs</th>
                  <th className="p-3">Correct</th>
                  <th className="p-3">Avg Time</th>
                  <th className="p-3">Total Time</th>
                  <th className="p-3">Score</th>
                  <th className="p-3 w-32">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.subjects.map((sub: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-800">{sub.subject}</td>
                    <td className="p-3 text-gray-600">{sub.totalQs}</td>
                    <td className="p-3 text-gray-600">{sub.correct}</td>
                    <td className="p-3 text-gray-600">{sub.avgTime}</td>
                    <td className="p-3 text-gray-600">{sub.totalTime}</td>
                    <td className="p-3 font-bold text-gray-800">{sub.score}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getAccColor(sub.accuracy)}`} 
                            style={{ width: `${sub.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold w-10 text-right">{sub.accuracy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-white p-5 text-center text-xs opacity-90 print:bg-gray-800 print:text-white">
        Generated by XPrepPG Analytics Engine | Computer-generated document
        <button onClick={() => window.print()} className="ml-4 underline text-blue-300 hover:text-blue-100 print:hidden">
          Download PDF
        </button>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS FOR CLEANER CODE ---

const StatCard = ({ value, label, sub }: any) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center flex flex-col justify-center">
    <span className="text-2xl font-bold text-blue-600 block mb-1">{value}</span>
    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
    {sub && <span className="text-xs text-gray-400 mt-1">{sub}</span>}
  </div>
);

const AnalysisCard = ({ title, acc, correct, avgTime, totalTime, isSimple, colorClass, badgeClass }: any) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
    <div className="flex justify-between items-center mb-2 font-semibold">
      <span className="text-gray-800">{title}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs ${badgeClass}`}>
        {acc}%
      </span>
    </div>
    
    <div className="text-xs text-gray-600 space-y-1 mb-2">
      <div className="flex justify-between">
        <span>Correct:</span> <strong>{correct}</strong>
      </div>
      {!isSimple && (
        <>
          <div className="flex justify-between">
            <span>Avg Time:</span> <strong>{avgTime}</strong>
          </div>
          <div className="flex justify-between">
            <span>Total Time:</span> <strong>{totalTime}</strong>
          </div>
        </>
      )}
    </div>

    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${acc}%` }}></div>
    </div>
  </div>
);