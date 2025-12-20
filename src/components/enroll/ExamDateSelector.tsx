import { EXAMS } from "@/config/exams";

type Props = {
  max: number;
  selected: number[];
  onChange: (ids: number[]) => void;
};

export default function ExamDateSelector({ max, selected, onChange }: Props) {
  const toggle = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      if (selected.length >= max) return;
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-3">
        Select {max} Exam Date{max > 1 ? "s" : ""}
      </h3>

      <div className="space-y-3">
        {EXAMS.map((e) => {
          const active = selected.includes(e.id);
          const disabled = !active && selected.length >= max;

          return (
            <button
              type="button"
              key={e.id}
              disabled={disabled}
              onClick={() => toggle(e.id)}
              className={`w-full text-left p-4 rounded-xl border transition
                ${
                  active
                    ? "border-emerald-600 bg-emerald-50"
                    : disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:border-gray-400"
                }`}
            >
              <p className="font-semibold">{e.title}</p>
              <p className="text-sm text-gray-600">{e.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
