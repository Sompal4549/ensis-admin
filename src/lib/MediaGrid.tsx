"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { mediaApi, getImageUrl, type MediaFile } from "@/lib/api";
import {
  Copy,
  Loader2,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Layers,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  Volume2,
  X,
  Eye,
} from "lucide-react";
import Image from "next/image";

interface MediaGridProps {
  subDir?: string;
  refreshKey?: number | string;
  horizontal?: boolean;
  pageSize?: number;
}

type MediaType = "all" | "image" | "video" | "audio" | "pdf";

export function getFileType(file: MediaFile): "image" | "video" | "audio" | "pdf" | "document" {
  const mime = (file.mimetype || "").toLowerCase();
  const resType = (file.resourceType || "").toLowerCase();
  const urlOrName = `${file.name || ""} ${file.url || ""}`.toLowerCase();

  if (mime.startsWith("image/") || resType === "image" || /\.(jpg|jpeg|png|webp|svg|gif|avif|bmp)(\?.*)?$/i.test(urlOrName)) {
    return "image";
  }
  if (mime.startsWith("video/") || (resType === "video" && !/\.(mp3|wav|ogg|aac|m4a)/i.test(urlOrName)) || /\.(mp4|webm|mov|avi|mkv|m4v)(\?.*)?$/i.test(urlOrName)) {
    return "video";
  }
  if (mime.startsWith("audio/") || /\.(mp3|wav|ogg|aac|m4a|flac|wma)(\?.*)?$/i.test(urlOrName)) {
    return "audio";
  }
  if (mime === "application/pdf" || /\.pdf(\?.*)?$/i.test(urlOrName)) {
    return "pdf";
  }
  return "document";
}

export default function MediaGrid({
  subDir = "",
  refreshKey = 0,
  horizontal = false,
  pageSize = 24,
}: MediaGridProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<MediaType>("all");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [previewItem, setPreviewItem] = useState<{ file: MediaFile; type: string } | null>(null);

  const itemsPerPage = pageSize;

  const fetchFiles = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    setError("");
    try {
      // Fetch list from backend
      const data = await mediaApi.list(subDir, pageNum, 100);
      setFiles(data.files || []);
      setTotal(data.total || (data.files || []).length);
    } catch (err) {
      setError("Failed to load media files");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [subDir]);

  useEffect(() => {
    fetchFiles(1);
    setPage(1);
  }, [fetchFiles, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyFeedback(url);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Filter files by tab and search
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      if (!file) return false;
      const type = getFileType(file);

      // Tab filter
      if (activeTab === "image" && type !== "image") return false;
      if (activeTab === "video" && type !== "video") return false;
      if (activeTab === "audio" && type !== "audio") return false;
      if (activeTab === "pdf" && type !== "pdf" && type !== "document") return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = (file.name || "").toLowerCase().includes(query);
        const matchesUrl = (file.url || "").toLowerCase().includes(query);
        if (!matchesName && !matchesUrl) return false;
      }

      return true;
    });
  }, [files, activeTab, searchTerm]);

  // Counts for each tab
  const tabCounts = useMemo(() => {
    const counts = { all: files.length, image: 0, video: 0, audio: 0, pdf: 0 };
    files.forEach((file) => {
      const type = getFileType(file);
      if (type === "image") counts.image++;
      else if (type === "video") counts.video++;
      else if (type === "audio") counts.audio++;
      else if (type === "pdf" || type === "document") counts.pdf++;
    });
    return counts;
  }, [files]);

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageFiles = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const tabs: { id: MediaType; label: string; icon: any; count: number }[] = [
    { id: "all", label: "All Media", icon: Layers, count: tabCounts.all },
    { id: "image", label: "Images", icon: ImageIcon, count: tabCounts.image },
    { id: "video", label: "Videos", icon: Video, count: tabCounts.video },
    { id: "audio", label: "Audio", icon: Music, count: tabCounts.audio },
    { id: "pdf", label: "PDFs & Docs", icon: FileText, count: tabCounts.pdf },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#8d6a3a]">
        <Loader2 className="animate-spin mb-4" size={36} />
        <p className="font-bold uppercase tracking-widest text-xs">Loading Assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
        <p className="font-bold">{error}</p>
        <button onClick={() => fetchFiles(1)} className="mt-4 text-sm underline">Try again</button>
      </div>
    );
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-1 pt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 min-w-8 px-2 rounded-lg text-xs font-bold transition-all bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p, idx) =>
          typeof p === "string" ? (
            <span key={`ellipsis-${idx}`} className="h-8 min-w-8 flex items-center justify-center text-[10px] text-[#8d6a3a]">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`h-8 min-w-8 px-2 rounded-lg text-[11px] font-bold transition-all ${
                p === currentPage ? "bg-[#6f542f] text-white" : "bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce]"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 min-w-8 px-2 rounded-lg text-xs font-bold transition-all bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#ded3c4] shadow-sm">
        {/* Media Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#6f542f] text-white shadow-sm"
                    : "bg-[#fcfaf7] text-[#5f5a50] hover:bg-[#f3eee6] hover:text-[#1f261b] border border-[#eee5d9]"
                }`}
              >
                <Icon size={13} className={isActive ? "text-white" : "text-[#8d6a3a]"} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-black/5 text-[#8d6a3a]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side: Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8d6a3a]" size={13} />
            <input
              type="text"
              placeholder="Search file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#fcfaf7] border border-[#d9cdbb] rounded-lg pl-8 pr-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#8d6a3a] text-[#1f261b]"
            />
          </div>
          <button
            onClick={() => fetchFiles(1)}
            disabled={loading}
            className="flex items-center gap-1 rounded-lg border border-[#d9cdbb] bg-[#fcfaf7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6f542f] hover:bg-[#f3eee6] transition-all disabled:opacity-50 shrink-0"
            title="Refresh list"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-[#8d6a3a] font-bold uppercase tracking-wider text-[11px]">
          Showing {filteredFiles.length} {filteredFiles.length === 1 ? "item" : "items"}
          {activeTab !== "all" ? ` in ${activeTab}` : ""}
        </span>
      </div>

      {/* Media Grid / List */}
      {filteredFiles.length === 0 ? (
        <div className="bg-[#fcfaf7] border border-[#ded3c4] rounded-2xl p-16 text-center">
          <Layers className="mx-auto text-[#d9cdbb] mb-3" size={40} />
          <h3 className="text-sm font-bold text-[#1f261b]">No media found</h3>
          <p className="text-xs text-[#5f5a50] mt-1">
            {searchTerm
              ? `No files match your search "${searchTerm}" in this category.`
              : `No files found for this category. Upload files from above.`}
          </p>
        </div>
      ) : horizontal ? (
        /* Horizontal compact row style */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pageFiles.map((file, idx) => {
              const fileType = getFileType(file);
              const fullUrl = getImageUrl(file.url);
              const fileName = file.name || "Untitled";

              return (
                <div
                  key={idx}
                  className="group flex items-center gap-2.5 bg-white border border-[#ded3c4] rounded-xl p-2 hover:shadow-md transition-all hover:border-[#8d6a3a]"
                >
                  {/* Thumbnail / Media icon */}
                  <div
                    onClick={() => setPreviewItem({ file, type: fileType })}
                    className="h-12 w-12 rounded-lg bg-[#fcfaf7] border border-[#eee5d9] overflow-hidden relative shrink-0 cursor-pointer flex items-center justify-center group/thumb"
                  >
                    {fileType === "image" ? (
                      <Image
                        fill
                        src={fullUrl}
                        alt={fileName}
                        crossOrigin="anonymous"
                        loading="lazy"
                        sizes="48px"
                        className="object-cover group-hover/thumb:scale-105 transition-transform"
                      />
                    ) : fileType === "video" ? (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white">
                        <Play size={16} className="text-amber-400 fill-amber-400" />
                        <span className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">VID</span>
                      </div>
                    ) : fileType === "audio" ? (
                      <div className="w-full h-full bg-emerald-800 flex flex-col items-center justify-center text-white">
                        <Volume2 size={16} className="text-emerald-300" />
                        <span className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">AUDIO</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-rose-700 flex flex-col items-center justify-center text-white">
                        <FileText size={16} className="text-rose-200" />
                        <span className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">PDF</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye size={14} className="text-white" />
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-[#1f261b] truncate" title={fileName}>
                      {fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#f3eee6] text-[#6f542f]">
                        {fileType}
                      </span>
                      {file.size && (
                        <span className="text-[9px] text-[#8d6a3a] font-medium">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => copyToClipboard(file.url)}
                      className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all ${
                        copyFeedback === file.url
                          ? "bg-green-600 text-white"
                          : "bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce]"
                      }`}
                      title="Copy URL"
                    >
                      {copyFeedback === file.url ? "Copied!" : "Copy"}
                    </button>
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[#8d6a3a] hover:text-[#1f261b] hover:bg-[#f3eee6] rounded-lg transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          {renderPagination()}
        </div>
      ) : (
        /* Full Grid style */
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {pageFiles.map((file, idx) => {
              const fileType = getFileType(file);
              const fullUrl = getImageUrl(file.url);
              const fileName = file.name || "Untitled";

              return (
                <div
                  key={idx}
                  className="group relative bg-white border border-[#ded3c4] rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-[#8d6a3a] flex flex-col"
                >
                  {/* Thumbnail / Media Container */}
                  <div
                    onClick={() => setPreviewItem({ file, type: fileType })}
                    className="w-full h-32 bg-[#fcfaf7] relative cursor-pointer overflow-hidden flex items-center justify-center group/thumb"
                  >
                    {fileType === "image" ? (
                      <Image
                        fill
                        src={fullUrl}
                        alt={fileName}
                        crossOrigin="anonymous"
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover group-hover/thumb:scale-105 transition-transform"
                      />
                    ) : fileType === "video" ? (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 group-hover/thumb:scale-110 transition-transform">
                          <Play size={20} className="text-amber-400 fill-amber-400 translate-x-0.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Video</span>
                      </div>
                    ) : fileType === "audio" ? (
                      <div className="w-full h-full bg-emerald-900 flex flex-col items-center justify-center text-white p-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 group-hover/thumb:scale-110 transition-transform">
                          <Music size={20} className="text-emerald-300" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Audio</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-rose-900 flex flex-col items-center justify-center text-white p-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 group-hover/thumb:scale-110 transition-transform">
                          <FileText size={20} className="text-rose-200" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">PDF / Doc</span>
                      </div>
                    )}

                    {/* Overlay badge & quick actions */}
                    <div className="absolute top-1.5 left-1.5">
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                        {fileType}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewItem({ file, type: fileType });
                        }}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-[#1f261b] shadow-md transition-colors"
                        title="Preview"
                      >
                        <Eye size={13} />
                      </button>
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-lg text-[#1f261b] shadow-md transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>

                  {/* Info & Copy Button */}
                  <div className="p-2 flex-1 flex flex-col justify-between gap-1.5 bg-white">
                    <p className="text-[10px] font-bold text-[#1f261b] truncate" title={fileName}>
                      {fileName}
                    </p>
                    <button
                      onClick={() => copyToClipboard(file.url)}
                      className={`w-full text-[9px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all ${
                        copyFeedback === file.url
                          ? "bg-green-600 text-white"
                          : "bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce]"
                      }`}
                    >
                      {copyFeedback === file.url ? "Copied!" : "Copy URL"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {renderPagination()}
        </div>
      )}

      {/* Media Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#ded3c4]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 border-b border-[#eee5d9] flex items-center justify-between bg-[#fcfaf7]">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#6f542f] text-white">
                  {previewItem.type}
                </span>
                <h3 className="text-xs font-bold text-[#1f261b] truncate">
                  {previewItem.file.name || "Preview"}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 text-gray-400 hover:text-black rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex items-center justify-center bg-[#f7f4ee] min-h-[300px]">
              {previewItem.type === "image" ? (
                <div className="relative max-h-[60vh] max-w-full flex items-center justify-center">
                  <img
                    src={getImageUrl(previewItem.file.url)}
                    alt={previewItem.file.name}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
                  />
                </div>
              ) : previewItem.type === "video" ? (
                <video
                  controls
                  autoPlay
                  src={getImageUrl(previewItem.file.url)}
                  className="max-h-[60vh] max-w-full rounded-lg shadow-md bg-black"
                />
              ) : previewItem.type === "audio" ? (
                <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md border border-[#ded3c4] text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <Music size={32} />
                  </div>
                  <p className="font-bold text-sm text-[#1f261b]">{previewItem.file.name}</p>
                  <audio controls src={getImageUrl(previewItem.file.url)} className="w-full" />
                </div>
              ) : (
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-[#ded3c4] text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
                    <FileText size={32} />
                  </div>
                  <h4 className="font-bold text-sm text-[#1f261b]">{previewItem.file.name}</h4>
                  <p className="text-xs text-[#5f5a50]">PDF / Document cannot be directly embedded here.</p>
                  <a
                    href={getImageUrl(previewItem.file.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#6f542f] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#5b4324] transition-colors"
                  >
                    Open Document in New Tab <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#eee5d9] bg-white flex flex-col sm:flex-row items-center justify-between gap-2">
              <code className="text-[10px] text-[#5f5a50] font-mono truncate max-w-md bg-gray-50 px-2 py-1 rounded border border-gray-200">
                {previewItem.file.url}
              </code>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => copyToClipboard(previewItem.file.url)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#6f542f] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5b4324] transition-colors"
                >
                  <Copy size={12} />
                  {copyFeedback === previewItem.file.url ? "Copied!" : "Copy URL"}
                </button>
                <a
                  href={getImageUrl(previewItem.file.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg border border-[#d9cdbb] text-[#1f261b] text-xs font-bold uppercase tracking-wider hover:bg-[#fcfaf7] transition-colors"
                >
                  <ExternalLink size={12} /> Open
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}