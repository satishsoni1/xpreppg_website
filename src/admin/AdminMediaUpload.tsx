import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  UploadCloud, Image as ImageIcon, Copy, CheckCircle,
  Trash2, Loader2, Link2, Download, X, FolderOpen,
} from "lucide-react";
import { AdminAPI } from "@/services/adminApi";

interface UploadedImage {
  original_name: string;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
}

export default function AdminMediaUpload() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<"upload" | "history">("upload");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await AdminAPI.getMediaUploads();
      if (res.status) setHistory(res.uploads);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return alert("Please select image files only.");
    setUploading(true);
    try {
      const res = await AdminAPI.uploadMultipleImages(imageFiles);
      if (res.status) {
        setImages(prev => [...res.images, ...prev]);
      } else {
        alert("Upload failed: " + res.message);
      }
    } catch {
      alert("Server error during upload.");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const copyAllUrls = () => {
    const urls = images.map(i => i.url).join("\n");
    navigator.clipboard.writeText(urls);
    alert(`${images.length} URLs copied to clipboard. Paste into Excel column.`);
  };

  const removeFromSession = (url: string) => {
    setImages(prev => prev.filter(i => i.url !== url));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const exportUrlsAsText = () => {
    const content = images.map(i => i.url).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image_urls.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="text-purple-600" /> Media Upload — Bulk Image Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload multiple images at once. Copy URLs to paste into your question CSV / Excel sheet.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("upload")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${tab === "upload" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Upload
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1 ${tab === "history" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            <FolderOpen size={15} /> History
          </button>
        </div>
      </div>

      {tab === "upload" && (
        <>
          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
              dragging
                ? "border-purple-400 bg-purple-50 scale-[1.01]"
                : "border-slate-300 bg-slate-50 hover:border-purple-400 hover:bg-purple-50/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3 text-purple-600">
                <Loader2 className="animate-spin" size={48} />
                <p className="font-bold text-lg">Uploading images…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <UploadCloud size={52} className={dragging ? "text-purple-500" : ""} />
                <p className="font-bold text-xl text-slate-600">
                  {dragging ? "Drop images here" : "Drag & drop images or click to browse"}
                </p>
                <p className="text-sm">Supports JPG, PNG, WEBP, GIF — multiple files at once</p>
              </div>
            )}
          </div>

          {/* Action bar */}
          {images.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-slate-700 font-semibold">{images.length} image{images.length > 1 ? "s" : ""} uploaded this session</span>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={copyAllUrls}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm"
                >
                  <Copy size={15} /> Copy All URLs
                </button>
                <button
                  onClick={exportUrlsAsText}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm"
                >
                  <Download size={15} /> Export .txt
                </button>
                <button
                  onClick={() => setImages([])}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm"
                >
                  <X size={15} /> Clear
                </button>
              </div>
            </div>
          )}

          {/* Uploaded images grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                  <div className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.original_name}
                      className="w-full h-full object-contain p-2"
                    />
                    <button
                      onClick={() => removeFromSession(img.url)}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-red-50 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-slate-500 truncate font-medium" title={img.original_name}>
                      {img.original_name}
                    </p>
                    <p className="text-[11px] text-slate-400">{formatSize(img.size)}</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={img.url}
                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 truncate"
                      />
                      <button
                        onClick={() => copyUrl(img.url)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                          copiedUrl === img.url
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-purple-100 hover:bg-purple-200 text-purple-700"
                        }`}
                      >
                        {copiedUrl === img.url ? <CheckCircle size={13} /> : <Copy size={13} />}
                        {copiedUrl === img.url ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* How to use instructions */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-2">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
              <Link2 size={16} /> How to use image URLs in question upload
            </h3>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Upload all images here and copy their URLs.</li>
              <li>Download the Sample CSV from the Questions Manager page.</li>
              <li>In the <code className="bg-blue-100 px-1 rounded">image_url</code> column, paste the corresponding URL for each question.</li>
              <li>Upload the completed CSV in the Bulk Upload tab of the Questions Manager.</li>
            </ol>
            <p className="text-xs text-blue-500 mt-2">
              Tip: Use "Copy All URLs" to get all URLs at once, then assign them to the correct questions in Excel.
            </p>
          </div>
        </>
      )}

      {tab === "history" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-700">Upload History</h2>
            <button onClick={fetchHistory} className="text-sm text-purple-600 hover:underline flex items-center gap-1">
              <Loader2 size={14} className={loadingHistory ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
          {loadingHistory ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-purple-500" size={32} /> Loading…
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No uploads yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map(h => (
                <div key={h.id} className="flex items-center gap-4 p-3 hover:bg-slate-50">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={h.url} alt={h.filename} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{h.filename}</p>
                    <p className="text-xs text-slate-400">{new Date(h.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyUrl(h.url)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                        copiedUrl === h.url ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {copiedUrl === h.url ? <CheckCircle size={12} /> : <Copy size={12} />}
                      {copiedUrl === h.url ? "Copied!" : "Copy URL"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
