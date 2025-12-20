type Props = {
    exams: number;
    examDates: number[];
    amount: number;
  };
  
  export default function PlanSummary({ exams, examDates, amount }: Props) {
    return (
      <div className="bg-gray-50 p-5 rounded-xl border">
        <h3 className="font-bold mb-2">Summary</h3>
  
        <div className="flex justify-between">
          <span>Exams Selected</span>
          <span>{exams}</span>
        </div>
  
        <div className="flex justify-between mt-1">
          <span>Exam Dates</span>
          <span>{examDates.length}</span>
        </div>
  
        <hr className="my-3" />
  
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-emerald-600">₹{amount}</span>
        </div>
      </div>
    );
  }
  