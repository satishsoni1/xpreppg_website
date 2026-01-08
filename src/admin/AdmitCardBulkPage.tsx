import { useLocation } from "react-router-dom";
import AdmitCard from "./AdmitCard";

export default function AdmitCardBulkPage() {
    const { state } = useLocation();
    const users = state?.users || [];
  
    if (!users.length) {
      return <div className="p-10 text-center">No students selected</div>;
    }
  
    return (
      <div className="bulk-print-root">
  
        {/* PRINT BUTTON (hidden in print) */}
        <div className="print-hide text-center mb-4">
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-blue-600 text-white rounded"
          >
            Print / Save PDF
          </button>
        </div>
  
        {/* BULK CARDS */}
        <div className="bulk-cards">
          {users.map((user: any) => (
            <div key={user._id} className="page">
              <AdmitCard user={user} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  