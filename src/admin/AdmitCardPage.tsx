import { useLocation } from "react-router-dom";
import AdmitCard from "./AdmitCard";

export default function AdmitCardPage() {
  const { state } = useLocation();

  if (!state?.user) {
    return <div className="p-10 text-red-600">No user data</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Print Admit Card
        </button>
      </div>

      <AdmitCard user={state.user} />
    </div>
  );
}
