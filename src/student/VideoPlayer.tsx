import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, ThumbsUp, Eye, Loader2, AlertCircle, FileText } from "lucide-react";
import { StudentAPI } from "@/services/studentApi";

export default function VideoPlayer() {
  const { id } = useParams();
  
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasCountedView, setHasCountedView] = useState(false);

  useEffect(() => {
    if (id) fetchVideoDetails(id);
  }, [id]);

  const fetchVideoDetails = async (videoId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await StudentAPI.getVideo(videoId);
      if (res.status && res.video) {
        setVideo(res.video);
      } else {
        setError(res.message || "Video content unavailable.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load video details.");
    } finally {
      setLoading(false);
    }
  };

  // ANALYTICS: Simple View Counter Logic
  const handleVideoStart = () => {
    if (!hasCountedView && video) {
      // Optional: Call an API to increment view count on backend
      // StudentAPI.trackView(video.id); 
      setHasCountedView(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading class...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-800">Content Unavailable</h2>
        <p className="text-gray-500 mt-2">{error || "The requested video could not be found."}</p>
        <Link to="/student/videos" className="mt-6 px-6 py-2 bg-gray-100 rounded-lg font-bold text-gray-700 hover:bg-gray-200">
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12 px-4">
      
      {/* Back Navigation */}
      <Link to="/student/videos" className="inline-flex items-center text-gray-500 hover:text-emerald-600 mb-4 transition font-medium text-sm">
        <ArrowLeft size={18} className="mr-1" /> Back to Library
      </Link>

      {/* --- VIDEO PLAYER CONTAINER --- */}
      <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group border border-gray-800">
        <video 
          controls 
          autoPlay={false}
          className="w-full h-full object-contain"
          poster={video.thumbnail_url || "https://placehold.co/1280x720/111827/ffffff?text=XPrepPG+Player"}
          onPlay={handleVideoStart}
          preload="metadata"
        >
          {/* ✅ DYNAMIC URL INSERTION */}
          <source src={video.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* --- DETAILS SECTION --- */}
      <div className="mt-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Metadata */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
             <div>
                <span className="text-emerald-600 font-bold uppercase text-xs tracking-wider mb-2 block">
                  {video.subject || "General"} Lecture
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                  {video.title}
                </h1>
             </div>
          </div>
          
          {/* Tutor / Meta info */}
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 border-b border-gray-100 pb-6">
             {video.duration && <span>⏱ {video.duration}</span>}
             <span>•</span>
             <span>Uploaded {new Date(video.created_at).toLocaleDateString()}</span>
          </div>

          {/* Description */}
          <div className="mt-6 prose prose-slate max-w-none text-gray-600">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Class Notes & Summary</h3>
            <p className="whitespace-pre-wrap leading-relaxed">
              {video.description || "No description provided for this session."}
            </p>
          </div>
        </div>

        {/* Right: Sidebar / Actions */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          
          {/* Stats Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <Eye className="text-emerald-500" size={20} />
              <span className="text-2xl font-bold text-gray-900">
                {/* Randomize or fetch view count */}
                {video.views ? video.views.toLocaleString() : "1,240"}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Students Watched</p>
          </div>

          {/* Action Buttons */}
          {/* <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold transition text-sm">
              <ThumbsUp size={18} /> Like
            </button>
            <button className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold transition text-sm">
              <Share2 size={18} /> Share
            </button>
          </div> */}

          {/* Download Resources (If any PDF attached) */}
          {/* <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
             <h4 className="font-bold text-gray-800 text-sm mb-3">Supplementary Material</h4>
             <button className="w-full flex items-center gap-3 bg-white border border-gray-200 hover:border-emerald-500 p-3 rounded-lg transition group">
                <div className="bg-red-50 text-red-500 p-2 rounded-lg">
                   <FileText size={18} />
                </div>
                <div className="text-left">
                   <p className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">Lecture Notes.pdf</p>
                   <p className="text-xs text-gray-400">2.4 MB</p>
                </div>
             </button>
          </div> */}

        </div>
      </div>
    </div>
  );
}