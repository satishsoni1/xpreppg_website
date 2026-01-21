import { Check } from "lucide-react";

type Props = {
  plans: any[];
  selectedPlan: any;
  onSelect: (plan: any) => void;
};

export default function PlanSelector({ plans, selectedPlan, onSelect }: Props) {
  if (!plans || plans.length === 0) {
    return <div className="text-gray-500 py-4">Loading plans...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          // Determine if selected
          const isSelected = selectedPlan?.id === p.id;

          // Calculate discount percentage if original price exists
          const discount = p.original_price
            ? Math.round(((p.original_price - p.selling_price) / p.original_price) * 100)
            : 0;

          return (
            <button
              type="button"
              key={p.id}
              onClick={() => onSelect({
                id: p.id,
                name: p.name,
                exams: p.exams_count, // Normalize this for the parent component
                sellingPrice: Number(p.selling_price),
                originalPrice: Number(p.original_price)
              })}
              className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between h-full group
                ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 shadow-md ring-1 ring-emerald-600"
                    : "border-gray-100 bg-white hover:border-emerald-300 hover:shadow-lg"
                }`}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute -top-3 -right-3 bg-emerald-600 text-white rounded-full p-1 shadow-sm">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-3 right-3 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {discount}% OFF
                </div>
              )}

              <div>
                <h4 className={`font-bold text-lg mb-1 ${isSelected ? 'text-emerald-900' : 'text-gray-800'}`}>
                  {p.name}
                </h4>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-extrabold text-gray-900">
                    ₹{parseInt(p.selling_price)}
                  </span>
                  {p.original_price && (
                    <span className="text-sm line-through text-gray-400">
                      ₹{parseInt(p.original_price)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-gray-100/50 w-full">
                <p className={`text-sm font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-500'}`}>
                  Includes {p.exams_count} Exam{p.exams_count > 1 ? 's' : ''}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}