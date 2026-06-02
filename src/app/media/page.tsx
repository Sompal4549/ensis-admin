"use client";

import React, { useState, useEffect } from "react";
import { 
  Upload, 
  X, 
  Copy, 
  Loader2, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import { authStore, uploadImage } from "@/lib/api";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface FileUploadState {
  file: File;
  status: UploadStatus;
  url?: string;
  error?: string;
  preview: string;
}

export default function BulkImageUploadPage() {
  const [fileStates, setFileStates] = useState<FileUploadState[]>([]);
  const [globalMessage, setGlobalMessage] = useState("");
  const [subDir, setSubDir] = useState("");
  const [selectedPage, setSelectedPage] = useState("home");
  const [isUploadingGlobal, setIsUploadingGlobal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      fileStates.forEach(state => URL.revokeObjectURL(state.preview));
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        status: "idle" as UploadStatus,
        preview: URL.createObjectURL(file),
      }));
      setFileStates((prev) => [...prev, ...newFiles]);
      setGlobalMessage("");
    }
  };

  const removeFile = (index: number) => {
    setFileStates((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
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

  const copyToClipboard = (text: string, index: number | 'all') => {
    navigator.clipboard.writeText(text);
    if (typeof index === 'number') {
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
      copyToClipboard(urls, 'all');
      setGlobalMessage("All uploaded URLs copied to clipboard (comma separated).");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8d6a3a]">Assets</span>
        <h1 className="font-serif text-4xl text-[#1f261b] mt-1">Bulk Image Upload</h1>
        <p className="mt-3 text-[#5f5a50] max-w-2xl leading-relaxed">
          Upload multiple high-quality images. Once uploaded, you can copy the generated paths 
          to paste into your product images field or homepage content forms.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Left Column: Dropzone & Global Controls */}
        <aside className="space-y-6">
          <div className="rounded-2xl border-2 border-dashed border-[#d9cdbb] bg-white p-8 text-center hover:border-[#8d6a3a] transition-all group cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              id="bulk-upload-input"
            />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3eee6] text-[#6f542f] mb-4 group-hover:scale-110 transition-transform">
              <Upload size={30} />
            </div>
            <p className="text-sm font-bold text-[#1f261b] uppercase tracking-wider">Select Media</p>
            <p className="text-[11px] text-[#5f5a50] mt-2 leading-tight">Drag and drop or click to browse files</p>
          </div>

          <div className="rounded-2xl border border-[#ded3c4] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#8d6a3a] border-b border-[#f3eee6] pb-3 mb-2">Global Actions</h2>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#5f5a50] ml-1">Target Page</label>
              <div className="relative">
                <select 
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  disabled={isUploadingGlobal}
                  className="w-full bg-[#fcfaf7] border border-[#d9cdbb] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8d6a3a] text-[#1f261b] appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="home">Home Page</option>
                  <option value="about">About Page</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8d6a3a] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5 mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#5f5a50] ml-1">Folder Name (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. products/summer"
                value={subDir}
                onChange={(e) => setSubDir(e.target.value)}
                disabled={isUploadingGlobal}
                className="w-full bg-[#fcfaf7] border border-[#d9cdbb] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8d6a3a] text-[#1f261b] placeholder:text-gray-300 disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleBulkUpload}
              disabled={isUploadingGlobal || fileStates.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-[#6f542f] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {isUploadingGlobal ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              Upload All
            </button>

            <button
              onClick={copyAllUrls}
              disabled={!fileStates.some(s => s.status === 'success')}
              className="w-full flex items-center justify-center gap-2 border border-[#d9cdbb] text-[#263016] py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#fcfaf7] transition-all disabled:opacity-50"
            >
              <Copy size={18} />
              Copy All URLs
            </button>

            <button
              onClick={() => {
                fileStates.forEach(s => URL.revokeObjectURL(s.preview));
                setFileStates([]);
                setGlobalMessage("");
              }}
              className="w-full text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-[0.2em] text-center pt-2"
            >
              Reset List
            </button>
          </div>

          {globalMessage && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f3eee6] border border-[#d9cdbb]">
              <AlertCircle size={16} className="text-[#6f542f] shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-[#6f542f] leading-relaxed italic">{globalMessage}</p>
            </div>
          )}
        </aside>

        {/* Right Column: Dynamic File List */}
        <section>
          {fileStates.length === 0 ? (
            <div className="h-[450px] rounded-2xl border border-[#ded3c4] bg-[#fcfaf7] flex flex-col items-center justify-center text-center p-10">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6 border border-[#eee5d9]">
                <ImageIcon size={40} className="text-[#d9cdbb]" />
              </div>
              <h3 className="text-xl font-serif text-[#1f261b]">Queue is empty</h3>
              <p className="text-sm text-[#5f5a50] mt-2 max-w-xs">Select some images from the left panel to begin the upload process.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#ded3c4] shadow-sm overflow-hidden">
              <div className="bg-[#fcfaf7] px-6 py-4 border-b border-[#eee5d9] flex justify-between items-center">
                <span className="text-xs font-bold text-[#5f5a50] uppercase tracking-widest">{fileStates.length} items in queue</span>
              </div>
              <div className="divide-y divide-[#eee5d9]">
                {fileStates.map((state, index) => (
                  <div key={index} className="p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:bg-[#fcfaf7] transition-colors">
                    <div className="h-20 w-20 rounded-xl bg-gray-50 border border-[#eee5d9] overflow-hidden shrink-0 shadow-inner">
                      <img src={state.preview} alt="preview" className="h-full w-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#1f261b] truncate">{state.file.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-[#8d6a3a] uppercase tracking-tighter">{(state.file.size / 1024).toFixed(0)} KB</span>
                        {state.status === "success" && <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest"><CheckCircle2 size={12}/> Success</span>}
                        {state.status === "error" && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Failed</span>}
                      </div>
                      
                      {state.status === "success" && state.url && (
                        <div className="mt-3 flex items-center bg-gray-50 rounded-lg border border-[#eee5d9] overflow-hidden">
                          <code className="flex-1 text-[11px] px-3 py-2 text-[#5f5a50] truncate font-mono">{state.url}</code>
                          <button 
                            onClick={() => copyToClipboard(state.url || "", index)}
                            className={`px-4 py-2 text-[10px] font-bold uppercase transition-all ${copyFeedback === index ? 'bg-green-600 text-white' : 'bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce]'}`}
                          >
                            {copyFeedback === index ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                      {state.status === "error" && (
                        <p className="text-[11px] font-medium text-red-500 mt-2 italic">{state.error}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {state.status === "idle" && (
                        <button
                          onClick={() => uploadFile(index)}
                          className="px-5 py-2 rounded-lg bg-[#f3eee6] text-[#6f542f] text-xs font-bold uppercase tracking-widest hover:bg-[#eadfce] transition-all"
                        >
                          Upload
                        </button>
                      )}

                      {state.status === "uploading" && (
                        <div className="p-2 text-[#8d6a3a]">
                          <Loader2 className="animate-spin" size={24} />
                        </div>
                      )}

                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}