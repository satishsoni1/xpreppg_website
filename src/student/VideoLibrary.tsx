import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StudentAPI } from "@/services/studentApi";
import { 
  PlayCircle, FileText, Lock, Clock, Search, 
  Filter, ChevronRight, BookOpen, Video 
} from "lucide-react";

export default function VideoLibrary() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Subjects List (You could also fetch this from DB)
  const subjects = ["All", "Anatomy", "Surgery", "Medicine", "Pathology"];

  useEffect(() => {
    fetchLibrary();
  }, [activeTab]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await StudentAPI.getLibrary(activeTab === "All" ? undefined : activeTab);
      if (res.status) {
        setItems(res.items);
      }
    } catch (error) {
      console.error("Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  // Filter by Search
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 px-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-100 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Library</h1>
          <p className="text-gray-500 mt-1">Access high-yield videos and PDF notes.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveTab(sub)}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === sub
                ? "bg-emerald-600 text-white shadow-md transform scale-105"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading resources...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
           <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
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

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      
      {/* Thumbnail Area */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {/* Image */}
        <img 
          src={item.thumbnail_url || (isVideo ? "/video-placeholder.jpg" : "/pdf-placeholder.jpg")} 
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e: any) => e.target.src = "https://via.placeholder.com/400x200?text=No+Image"} 
        />
        
        {/* Overlay Icon */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
          <div className="bg-white/90 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-110 transition text-primary">
            {isVideo ? <PlayCircle size={32} fill="currentColor" className="text-white" /> : <FileText size={32} />}
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center">
           {isVideo ? <Clock size={12} className="mr-1" /> : <BookOpen size={12} className="mr-1" />}
           {item.duration || (isVideo ? "10:00" : "5 Pages")}
        </div>
      </div>

      {/* Details Area */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              isVideo ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
           }`}>
              {isVideo ? "Video Lecture" : "PDF Notes"}
           </span>
           {item.is_locked && <Lock size={14} className="text-red-400" />}
        </div>

        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-emerald-700 transition">
          {item.title}
        </h3>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
          {item.description || "Comprehensive study material for NEET PG preparation."}
        </p>

        {/* Action Button */}
        {isVideo ? (
          <Link 
            to={`/student/videos/${item.id}`} // Links to player
            className="w-full mt-auto flex items-center justify-center gap-2 bg-gray-50 hover:bg-emerald-600 hover:text-white text-gray-700 font-semibold py-2.5 rounded-lg transition"
          >
            <PlayCircle size={18} /> Watch Now
          </Link>
        ) : (
          <a 
            href={item.url} // Direct link to PDF
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-auto flex items-center justify-center gap-2 bg-gray-50 hover:bg-orange-500 hover:text-white text-gray-700 font-semibold py-2.5 rounded-lg transition"
          >
            <FileText size={18} /> Read PDF
          </a>
        )}
      </div>
    </div>
  );
}