import AdmitCard from "./AdmitCard";
import { tempStudents } from "./tempStudents";
import "./admit-card.css";

export default function TempAdmitCardBulk() {
  return (
    <div className="bg-gray-100 py-6">

      {/* PRINT BUTTON */}
      <div className="text-center mb-4 print-hide">
        <button
          onClick={() => window.print()}
          className="px-5 py-2 bg-blue-600 text-white rounded"
        >
          Print Admit Cards
        </button>
      </div>

      {tempStudents.map((student) => (
        <div key={student._id} className="page">
          <AdmitCard user={student} />
        </div>
      ))}
    </div>
  );
}
