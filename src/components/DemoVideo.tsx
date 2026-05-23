import { PlayCircle } from "lucide-react";

export default function DemoVideo() {
  const videoUrl = "https://xpreppg.s3.ap-south-1.amazonaws.com/cbt-1/X+PREP+PG+(CBT+1)+Anatomy+Discussion+by+Dr.+Ravindra+Marathe+-+X+PREP+PG+(720p%2C+h264).mp4";

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Experience Our Live Sessions
          </h2>
          <p className="text-gray-500 mt-2 text-lg max-w-2xl mx-auto">
            Watch a recording of a recent Anatomy discussion by Dr. Ravindra Marathe.
          </p>
        </div>

        {/* Video Container */}
        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-secondaryDark ring-1 ring-secondaryMiddle bg-navy aspect-video">
          
          {/* ✅ HTML5 Video Tag for S3 MP4 */}
          <video 
            className="w-full h-full object-cover"
            controls
            playsInline
            preload="metadata"
            // poster="/path-to-thumbnail.jpg" // Optional: Add a thumbnail image here
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

        </div>

        {/* CTA Below Video */}
        <div className="mt-10">
          <p className="text-gray-600 mb-4">Master high-yield topics with experts.</p>
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-navy to-primary text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-primary/30 transition"
          >
            <PlayCircle size={20} /> Enroll for Next Session
          </button>
        </div>

      </div>
    </section>
  );
}