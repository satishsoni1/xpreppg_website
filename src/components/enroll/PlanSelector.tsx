type Props = {
    plans: any[];
    selectedPlan: any;
    onSelect: (plan: any) => void;
  };
  
  export default function PlanSelector({ plans, selectedPlan, onSelect }: Props) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-3">Select Plan</h3>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <button
              type="button"
              key={p.exams}
              onClick={() => onSelect(p)}
              className={`p-5 rounded-xl border text-left transition
                ${
                  selectedPlan?.exams === p.exams
                    ? "border-emerald-600 bg-emerald-50"
                    : "hover:border-gray-400"
                }`}
            >
              <p className="font-semibold">{p.exams} Exam(s)</p>
              <p className="text-sm line-through text-gray-400">
                ₹{p.actualPrice}
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                ₹{p.sellingPrice}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }
  