import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, ThumbsUp, Eye } from "lucide-react";

export default function VideoPlayer() {
  const { id } = useParams();
  const [hasCountedView, setHasCountedView] = useState(false);
  const [views, setViews] = useState(1240); // Mock initial view count

  // Mock Video Data
  const videoData = {
    id: id,
    title: "NEET PG Grand Mock 1 - Anatomy Discussion",
    url: "https://www.w3schools.com/html/mov_bbb.mp4", // Replace with real URL/HLS stream
    description: "Detailed discussion on the Anatomy section of Grand Mock 1. Dr. Sharma covers high-yield topics including Neuroanatomy and Embryology.",
    tutor: "Dr. A. Sharma"
  };

  // ANALYTICS LOGIC: Count view only once per session
  const handleVideoStart = () => {
    if (!hasCountedView) {
      // 1. Send API Request to increment view count
      console.log("Analytics: +1 View Sent to Server");
      
      // 2. Update local state
      setHasCountedView(true);
      setViews(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Back Button */}
      <Link to="/student/videos" className="inline-flex items-center text-gray-500 hover:text-primary mb-4 transition">
        <ArrowLeft size={18} className="mr-1" /> Back to Library
      </Link>

      {/* Video Container */}
      <div className="bg-black rounded-xl overflow-hidden shadow-2xl aspect-video relative group">
        <video 
          controls 
          className="w-full h-full object-contain"
          poster="https://placehold.co/1280x720/111827/ffffff?text=Click+to+Play"
          onPlay={handleVideoStart}
        >
          <source src={videoData.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Info & Analytics Bar */}
      <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{videoData.title}</h1>
          <p className="text-emerald-700 font-medium mt-1">{videoData.tutor}</p>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed border border-gray-100">
            {videoData.description}
          </div>
        </div>

        {/* Analytics & Actions Sidebar */}
        <div className="flex flex-row md:flex-col gap-3 min-w-[200px]">
          {/* Analytics Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Analytics</span>
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Eye className="text-emerald-500" size={24} />
              {views.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total Class Views</p>
          </div>

          {/* Action Buttons */}
          <button className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition">
            <ThumbsUp size={18} /> Like Class
          </button>
          <button className="flex items-center justify-center gap-2 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-3 rounded-lg font-medium transition">
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}