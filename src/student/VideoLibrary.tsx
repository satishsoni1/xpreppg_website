import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import { 
  PlayCircle, FileText, Lock, Clock, Search, 
  BookOpen, AlertCircle 
} from "lucide-react";

export default function VideoLibrary() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await StudentAPI.getLibrary();
      if (res.status) {
        setItems(res.items);
      }
    } catch (error) {
      console.error("Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  // 1. Dynamic Subjects (Extract from data)
  const subjects = useMemo(() => {
    const allSubjects = items.map(i => i.subject).filter(Boolean);
    return ["All", ...Array.from(new Set(allSubjects))];
  }, [items]);

  // 2. Filter Logic (Search + Tab)
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "All" || item.subject === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 px-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-100 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Library</h1>
          <p className="text-gray-500 mt-1">High-yield video lectures and notes.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveTab(sub)}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
              activeTab === sub
                ? "bg-primary text-white border-emerald-600 shadow-md transform scale-105"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading your library...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
           <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-3">
              <BookOpen className="text-gray-300" size={32} />
           </div>
           <p className="text-gray-500 font-medium">No resources found for "{activeTab}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <LibraryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------
// Smart Card Component
// ------------------------------------
function LibraryCard({ item }: any) {
  const isVideo = item.type === 'video';
  const isLocked = item.is_locked;

  const handleLockedClick = (e: any) => {
    if (isLocked) {
      e.preventDefault();
      alert("This content is locked. Please upgrade your plan to access.");
    }
  };

  return (
    <div className={`group bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full ${isLocked ? 'border-gray-200 opacity-90' : 'border-gray-100'}`}>
      
      {/* Thumbnail Area */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {/* Image */}
        <img 
          src={item.thumbnail_url || (isVideo ? "https://placehold.co/600x400/e2e8f0/64748b?text=Video+Lecture" : "https://placehold.co/600x400/fff7ed/ea580c?text=PDF+Notes")} 
          alt={item.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${!isLocked && 'group-hover:scale-105'}`}
        />
        
        {/* Overlay Icon */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition flex items-center justify-center">
          {isLocked ? (
             <div className="bg-gray-900/80 p-3 rounded-full shadow-lg backdrop-blur-sm">
                <Lock size={24} className="text-white" />
             </div>
          ) : (
             <div className="bg-white/90 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-110 transition text-emerald-600 opacity-0 group-hover:opacity-100">
                {isVideo ? <PlayCircle size={32} fill="currentColor" /> : <FileText size={32} />}
             </div>
          )}
        </div>

        {/* Duration Badge */}
        {item.duration && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center shadow-sm">
             {isVideo ? <Clock size={10} className="mr-1" /> : <BookOpen size={10} className="mr-1" />}
             {item.duration}
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
              isVideo ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'
           }`}>
              {isVideo ? "Video" : "Notes"}
           </span>
           {item.subject && (
             <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
               {item.subject}
             </span>
           )}
        </div>

        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-primary transition line-clamp-2">
          {item.title}
        </h3>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
          {item.description || "Comprehensive study material for NEET PG preparation."}
        </p>

        {/* Action Button */}
        {isLocked ? (
           <button 
             onClick={handleLockedClick}
             className="w-full mt-auto flex items-center justify-center gap-2 bg-gray-100 text-gray-500 font-semibold py-2.5 rounded-lg cursor-not-allowed"
           >
             <Lock size={16} /> Unlock Access
           </button>
        ) : isVideo ? (
          <Link 
            to={`/student/videos/${item.id}`} 
            className="w-full mt-auto flex items-center justify-center gap-2 bg-emerald-50 hover:bg-primary hover:text-white text-primary border border-emerald-100 hover:border-emerald-600 font-bold py-2.5 rounded-lg transition"
          >
            <PlayCircle size={18} /> Watch Class
          </Link>
        ) : (
          <a 
            href={item.url} 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-auto flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-700 border border-orange-100 hover:border-orange-500 font-bold py-2.5 rounded-lg transition"
          >
            <FileText size={18} /> Open PDF
          </a>
        )}
      </div>
    </div>
  );
}