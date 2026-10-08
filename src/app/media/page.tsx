"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  X,
  Copy,
  Loader2,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Layers
} from "lucide-react";
import { uploadImage } from "@/lib/api";
import MediaGrid, { getFileType } from "@/lib/MediaGrid";
import Image from "next/image";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface FileUploadState {
  file: File;
  status: UploadStatus;
  url?: string;
  error?: string;
  preview: string;
  fileType: "image" | "video" | "audio" | "pdf" | "document";
}

export default function BulkMediaUploadPage() {
  const [fileStates, setFileStates] = useState<FileUploadState[]>([]);
  const [globalMessage, setGlobalMessage] = useState("");
  const [subDir, setSubDir] = useState("");
  const [selectedPage, setSelectedPage] = useState("products");
  const [isUploadingGlobal, setIsUploadingGlobal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);
  const [gridRefreshKey, setGridRefreshKey] = useState(0);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      fileStates.forEach((state) => {
        if (state.preview) URL.revokeObjectURL(state.preview);
      });
    };
  }, [fileStates]);

  const detectFileType = (file: File): "image" | "video" | "audio" | "pdf" | "document" => {
    const mime = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (mime.startsWith("image/") || /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(name)) return "image";
    if (mime.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv)$/i.test(name)) return "video";
    if (mime.startsWith("audio/") || /\.(mp3|wav|ogg|aac|m4a|flac)$/i.test(name)) return "audio";
    if (mime === "application/pdf" || /\.pdf$/i.test(name)) return "pdf";
    return "document";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => {
        const type = detectFileType(file);
        let preview = "";
        try {
          preview = URL.createObjectURL(file);
        } catch {
          preview = "";
        }
        return {
          file,
          status: "idle" as UploadStatus,
          preview,
          fileType: type,
        };
      });
      setFileStates((prev) => [...prev, ...newFiles]);
      setGlobalMessage("");
    }
  };

  const removeFile = (index: number) => {
    setFileStates((prev) => {
      const updated = [...prev];
      if (updated[index]?.preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const uploadFile = async (index: number) => {
    const state = fileStates[index];
    if (state.status === "success") return;

    setFileStates((prev) => {
      const next = [...prev];
      next[index].status = "uploading";
      return next;
    });

    try {
      const fullPath = subDir ? `${selectedPage}/${subDir}` : selectedPage;
      const url = await uploadImage(state.file, fullPath);

      setFileStates((prev) => {
        const next = [...prev];
        next[index].status = "success";
        next[index].url = url;
        return next;
      });
      setGridRefreshKey((k) => k + 1);
    } catch (error) {
      setFileStates((prev) => {
        const next = [...prev];
        next[index].status = "error";
        next[index].error = (error as Error).message;
        return next;
      });
    }
  };

  const handleBulkUpload = async () => {
    setIsUploadingGlobal(true);
    setGlobalMessage("Starting bulk upload...");

    for (let i = 0; i < fileStates.length; i++) {
      if (fileStates[i].status !== "success") {
        await uploadFile(i);
      }
    }

    setIsUploadingGlobal(false);
    setGlobalMessage("Upload process completed.");
  };

  const copyToClipboard = (text: string, index: number | "all") => {
    navigator.clipboard.writeText(text);
    if (typeof index === "number") {
      setCopyFeedback(index);
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  const copyAllUrls = () => {
    const urls = fileStates
      .filter((s) => s.status === "success" && s.url)
      .map((s) => s.url)
      .join(", ");

    if (urls) {
      copyToClipboard(urls, "all");
      setGlobalMessage("All uploaded URLs copied to clipboard (comma separated).");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <header className="mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8d6a3a]">Assets</span>
        <h1 className="text-xl text-[#1f261b] font-bold tracking-tight">Media & Asset Manager</h1>
        <p className="mt-0.5 text-xs text-[#5f5a50] max-w-2xl leading-relaxed">
          Upload and manage Images, Videos, Audio tracks, PDFs, and Documents. Once uploaded, copy the direct URLs
          to use across product catalogs, blog posts, or website sections.
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Left Column: Dropzone & Global Controls */}
        <aside className="space-y-2.5">
          <div className="rounded-xl border-2 border-dashed border-[#d9cdbb] bg-white p-3.5 text-center hover:border-[#8d6a3a] transition-all group cursor-pointer relative shadow-xs">
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              id="bulk-upload-input"
            />
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#f3eee6] text-[#6f542f] mb-1.5 group-hover:scale-110 transition-transform">
              <Upload size={18} />
            </div>
            <p className="text-[11px] font-bold text-[#1f261b] uppercase tracking-wider">Select Media Files</p>
            <p className="text-[9.5px] text-[#5f5a50] mt-0.5 leading-tight">
              Images, Videos, Audio, PDFs & Docs
            </p>
            <span className="inline-block mt-1.5 text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f3eee6] text-[#6f542f]">
              Drag & Drop or Browse
            </span>
          </div>

          <div className="rounded-xl border border-[#ded3c4] bg-white p-2.5 shadow-xs space-y-2">
            <h2 className="text-[8.5px] font-bold uppercase tracking-widest text-[#8d6a3a] border-b border-[#f3eee6] pb-1.5">
              Upload Target Folder
            </h2>

            <div className="space-y-0.5">
              <label className="text-[8px] font-bold uppercase tracking-widest text-[#5f5a50] ml-0.5">
                Target Section
              </label>
              <div className="relative">
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  disabled={isUploadingGlobal}
                  className="w-full bg-[#fcfaf7] border border-[#d9cdbb] rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#8d6a3a] text-[#1f261b] appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="products">Products</option>
                  <option value="home">Home Page</option>
                  <option value="about">About Page</option>
                  <option value="turnkey">Turnkey Solutions</option>
                  <option value="consultancy">Consultancy</option>
                  <option value="blogs">Blogs</option>
                  <option value="documents">Documents & Brochures</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8d6a3a] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[8px] font-bold uppercase tracking-widest text-[#5f5a50] ml-0.5">
                Subfolder (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. brochures or catalogs"
                value={subDir}
                onChange={(e) => setSubDir(e.target.value)}
                disabled={isUploadingGlobal}
                className="w-full bg-[#fcfaf7] border border-[#d9cdbb] rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#8d6a3a] text-[#1f261b] placeholder:text-gray-300 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                onClick={handleBulkUpload}
                disabled={isUploadingGlobal || fileStates.length === 0}
                className="w-full flex items-center justify-center gap-1 bg-[#6f542f] text-white py-1.5 rounded-lg font-bold text-[8.5px] uppercase tracking-wider hover:bg-[#5b4324] transition-all disabled:opacity-50 shadow-xs"
              >
                {isUploadingGlobal ? <Loader2 className="animate-spin" size={10} /> : <Upload size={10} />}
                <span>Upload All</span>
              </button>

              <button
                onClick={copyAllUrls}
                disabled={!fileStates.some((s) => s.status === "success")}
                className="w-full flex items-center justify-center gap-1 border border-[#d9cdbb] text-[#263016] py-1.5 rounded-lg font-bold text-[8.5px] uppercase tracking-wider hover:bg-[#fcfaf7] transition-all disabled:opacity-50"
              >
                <Copy size={10} />
                <span>Copy URLs</span>
              </button>
            </div>

            <button
              onClick={() => {
                fileStates.forEach((s) => {
                  if (s.preview) URL.revokeObjectURL(s.preview);
                });
                setFileStates([]);
                setGlobalMessage("");
              }}
              className="w-full text-[8.5px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest text-center pt-0.5"
            >
              Clear Queue
            </button>
          </div>

          {globalMessage && (
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-[#f3eee6] border border-[#d9cdbb]">
              <AlertCircle size={13} className="text-[#6f542f] shrink-0 mt-0.5" />
              <p className="text-[9.5px] font-bold text-[#6f542f] leading-relaxed italic">{globalMessage}</p>
            </div>
          )}
        </aside>

        {/* Right Column: Upload Queue */}
        <section className="min-w-0 w-full">
          {fileStates.length === 0 ? (
            <div className="h-full min-h-[160px] rounded-xl border border-[#ded3c4] bg-[#fcfaf7] flex flex-col items-center justify-center text-center p-4">
              <div className="bg-white p-2 rounded-full shadow-xs mb-1.5 border border-[#eee5d9]">
                <Layers size={18} className="text-[#d9cdbb]" />
              </div>
              <h3 className="text-xs font-bold text-[#1f261b]">Upload Queue is empty</h3>
              <p className="text-[11px] text-[#5f5a50] mt-0.5 max-w-xs">
                Select or drag any images, videos, audio clips, or PDF documents to upload.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#ded3c4] shadow-xs overflow-hidden w-full min-w-0">
              <div className="bg-[#fcfaf7] px-3.5 py-2 border-b border-[#eee5d9] flex justify-between items-center">
                <span className="text-[9.5px] font-bold text-[#5f5a50] uppercase tracking-widest">
                  {fileStates.length} items in upload queue
                </span>
              </div>
              <div className="divide-y divide-[#eee5d9] max-h-[220px] overflow-y-auto">
                {fileStates.map((state, index) => (
                  <div key={index} className="p-2 flex items-center gap-2.5 hover:bg-[#fcfaf7] transition-colors min-w-0 w-full">
                    {/* Media Type Preview Icon / Image */}
                    <div className="h-9 w-9 rounded-lg bg-gray-50 border border-[#eee5d9] overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                      {state.fileType === "image" ? (
                        <Image
                          height={80}
                          width={80}
                          src={state.preview}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                      ) : state.fileType === "video" ? (
                        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white">
                          <Video size={14} className="text-amber-400" />
                        </div>
                      ) : state.fileType === "audio" ? (
                        <div className="w-full h-full bg-emerald-800 flex flex-col items-center justify-center text-white">
                          <Music size={14} className="text-emerald-300" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-rose-700 flex flex-col items-center justify-center text-white">
                          <FileText size={14} className="text-rose-200" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h4 className="text-[11px] font-bold text-[#1f261b] truncate max-w-full block" title={state.file.name}>
                        {state.file.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#f3eee6] text-[#6f542f]">
                          {state.fileType}
                        </span>
                        <span className="text-[8.5px] font-bold text-[#8d6a3a]">
                          {(state.file.size / 1024).toFixed(0)} KB
                        </span>
                        {state.status === "success" && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase tracking-widest">
                            <CheckCircle2 size={11} /> Success
                          </span>
                        )}
                        {state.status === "error" && (
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Failed</span>
                        )}
                      </div>

                      {state.status === "success" && state.url && (
                        <div className="mt-1 flex items-center bg-gray-50 rounded-md border border-[#eee5d9] overflow-hidden min-w-0 max-w-full">
                          <code className="flex-1 min-w-0 text-[9px] px-2 py-0.5 text-[#5f5a50] truncate font-mono block" title={state.url}>
                            {state.url}
                          </code>
                          <button
                            onClick={() => copyToClipboard(state.url || "", index)}
                            className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase transition-all shrink-0 ${
                              copyFeedback === index
                                ? "bg-green-600 text-white"
                                : "bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce]"
                            }`}
                          >
                            {copyFeedback === index ? "Copied" : "Copy"}
                          </button>
                        </div>
                      )}
                      {state.status === "error" && (
                        <p className="text-[9.5px] font-medium text-red-500 mt-0.5 italic truncate">{state.error}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {state.status === "idle" && (
                        <button
                          onClick={() => uploadFile(index)}
                          className="px-2.5 py-1 rounded-md bg-[#f3eee6] text-[#6f542f] text-[9px] font-bold uppercase tracking-wider hover:bg-[#eadfce] transition-all"
                        >
                          Upload
                        </button>
                      )}

                      {state.status === "uploading" && (
                        <div className="p-1 text-[#8d6a3a]">
                          <Loader2 className="animate-spin" size={16} />
                        </div>
                      )}

                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Uploaded Library Section with Tabs and Grid */}
      <section className="pt-0.5">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="h-px flex-1 bg-[#ded3c4]" />
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#8d6a3a] whitespace-nowrap">
            Uploaded Media Library
          </h2>
          <div className="h-px flex-1 bg-[#ded3c4]" />
        </div>
        <MediaGrid horizontal={false} pageSize={24} refreshKey={gridRefreshKey} />
      </section>
    </div>
  );
}