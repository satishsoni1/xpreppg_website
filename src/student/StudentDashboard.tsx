import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdmitCard from "@/admin/AdmitCard";
import StudentResult from "./StudentResult";
import { StudentAPI } from "@/services/studentApi";
import { LogOut, Ticket, Award, AlertCircle } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("result");
  const [user, setUser] = useState<any>(null);
  
  // New states for result handling
  const [result, setResult] = useState<any>(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [resultError, setResultError] = useState("");

  useEffect(() => {
    // 1. Check Auth
    const storedUser = localStorage.getItem("student_user");
    if (!storedUser) {
      navigate("/student/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // 2. Fetch Result if tab is active
    if (activeTab === "result" && !result && !loadingResult) {
      setLoadingResult(true);
      setResultError("");
      
      StudentAPI.getResult(parsedUser.mobile)
        .then((res: any) => {
          if (res.status) {
            setResult(res.data);
          } else {
            setResultError(res.message || "Result not found for this candidate.");
          }
        })
        .catch(() => {
          setResultError("Failed to load result. Please try again later.");
        })
        .finally(() => {
          setLoadingResult(false);
        });
    }
  }, [activeTab, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("student_user");
    navigate("/student/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex justify-between items-center shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">App No: {user.applicationNo}</div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
        >
          <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto p-4 print:p-0">
        <div className="flex gap-2 mb-6 print:hidden">
          <TabButton 
            active={activeTab === "result"} 
            onClick={() => setActiveTab("result")} 
            icon={<Award size={18} />}
            label="Exam Result" 
          />
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in duration-300">
          {activeTab === "admit-card" && (
            <div className="bg-white p-1 rounded-xl shadow-sm print:shadow-none">
               <AdmitCard user={user} />
            </div>
          )}

          {activeTab === "result" && (
            <div className="print:w-full">
               {loadingResult && (
                 <div className="p-12 text-center text-gray-500">
                   <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                   Fetching your result...
                 </div>
               )}

               {!loadingResult && resultError && (
                 <div className="bg-white p-8 rounded-xl text-center border shadow-sm">
                   <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                   <h3 className="text-xl font-bold text-gray-800 mb-2">Result Unavailable</h3>
                   <p className="text-gray-600">{resultError}</p>
                   <p className="text-xs text-gray-400 mt-4">Candidate ID: {user.applicationNo}</p>
                 </div>
               )}

               {!loadingResult && result && (
                 <StudentResult result={result} student={user} />
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
      active 
        ? "bg-emerald-600 text-white shadow-md" 
        : "bg-white text-gray-600 border hover:bg-gray-50"
    }`}
  >
    {icon} {label}
  </button>
);