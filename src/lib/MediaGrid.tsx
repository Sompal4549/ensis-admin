"use client";

import React, { useCallback, useEffect, useState } from "react";
import { mediaApi, getImageUrl, type MediaFile } from "@/lib/api";
import { Copy, Loader2, Image as ImageIcon, RefreshCw, Search } from "lucide-react";
import Image from "next/image";

interface MediaGridProps {
  subDir?: string;
  refreshKey?: number | string;
  horizontal?: boolean;
  pageSize?: number;
}

export default function MediaGrid({ subDir = "", refreshKey = 0, horizontal = false, pageSize = 10 }: MediaGridProps) {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await mediaApi.list(subDir);
      setImages(data);
    } catch (err) {
      setError("Failed to load images");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [subDir]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, subDir]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyFeedback(url);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const filteredImages = images.filter((img) => 
    img?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageImages = horizontal
    ? filteredImages.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredImages;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#8d6a3a]">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold uppercase tracking-widest text-xs">Loading Assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
        <p className="font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm underline">Try again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d6a3a]" size={14} />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-[#d9cdbb] rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#8d6a3a] text-[#1f261b]"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-[#8d6a3a]">
          {images.length} {images.length === 1 ? "image" : "images"}
        </p>
        <button
          onClick={fetchImages}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-[#d9cdbb] bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#6f542f] hover:bg-[#fcfaf7] transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span className="text-[10px]">

          Refresh
          </span>
        </button>
      </div>

      {filteredImages.length === 0 ? (
        <div className="bg-[#fcfaf7] border border-[#ded3c4] rounded-2xl p-20 text-center">
          <ImageIcon className="mx-auto text-[#d9cdbb] mb-4" size={48} />
          <p className="text-[#5f5a50]">No images found in this directory.</p>
        </div>
      ) : horizontal ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pageImages.map((img, idx) => {
              if (!img) return null;

              const fullUrl = getImageUrl(img.url);
              const fileName = img.name || "Untitled";

              return (
                <div key={idx} className="group flex items-center gap-2 bg-white border border-[#ded3c4] rounded-xl overflow-hidden hover:shadow-md transition-all">
                  <div className="h-10 w-10 shrink-0 bg-[#fcfaf7] overflow-hidden relative">
                    <Image fill
                      src={fullUrl}
                      alt={fileName}
                      crossOrigin="anonymous"
                      loading="lazy"
                      sizes="40px"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <p className="flex-1 min-w-0 text-[10px] font-bold text-[#1f261b] break-all leading-snug line-clamp-2" title={fileName}>
                    {fileName}
                  </p>
                  <button
                    onClick={() => copyToClipboard(img.url)}
                    className={`shrink-0 mr-2 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg transition-all ${
                      copyFeedback === img.url ? 'bg-green-600 text-white' : 'bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce]'
                    }`}
                  >
                    <span className="text-[10px]">

                    {copyFeedback === img.url ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <p className="text-[10px] font-bold text-[#8d6a3a] uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-6 min-w-6 px-1.5 rounded-md text-[10px] font-bold transition-all ${
                      p === currentPage
                        ? "bg-[#6f542f] text-white"
                        : "bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((img, idx) => {
            if (!img) return null;

            const fullUrl = getImageUrl(img.url);
            const fileName = img.name || "Untitled";

            return (
              <div key={idx} className="group bg-white border border-[#ded3c4] rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-square bg-[#fcfaf7] overflow-hidden border-b border-[#eee5d9] relative">
                  <Image fill
                    src={fullUrl}
                    alt={fileName}
                    crossOrigin="anonymous"
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => copyToClipboard(img.url)}
                      className="p-2 bg-white rounded-lg text-[#1f261b] hover:bg-[#f3eee6] transition-colors shadow-lg"
                      title="Copy Path"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <p className="text-xs font-bold text-[#1f261b] break-all leading-snug" title={fileName}>
                    {fileName}
                  </p>
                  <button
                    onClick={() => copyToClipboard(img.url)}
                    className={`w-full text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-all ${
                      copyFeedback === img.url ? 'bg-green-600 text-white' : 'bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce]'
                    }`}
                  >
                    {copyFeedback === img.url ? "Copied!" : "Copy Path"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}