"use client";

import React, { useCallback, useEffect, useState } from "react";
import { mediaApi, getImageUrl, type MediaFile } from "@/lib/api";
import { Copy, Loader2, Image as ImageIcon, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface MediaGridProps {
  subDir?: string;
  refreshKey?: number | string;
  horizontal?: boolean;
  pageSize?: number;
}

export default function MediaGrid({ subDir = "", refreshKey = 0, horizontal = false, pageSize = 25 }: MediaGridProps) {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const itemsPerPage = pageSize;

  const fetchImages = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      const data = await mediaApi.list(subDir, pageNum, itemsPerPage);
      if (append) {
        setImages((prev) => [...prev, ...data.files]);
      } else {
        setImages(data.files);
      }
      setTotal(data.total);
    } catch (err) {
      setError("Failed to load images");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [subDir, itemsPerPage]);

  useEffect(() => {
    fetchImages(1, false);
    setPage(1);
  }, [fetchImages, refreshKey]);

  useEffect(() => {
    setPage(1);
    fetchImages(1, false);
  }, [searchTerm]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyFeedback(url);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const filteredImages = horizontal
    ? images.filter((img) =>
        img?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : images;

  const totalPages = horizontal
    ? Math.max(1, Math.ceil(filteredImages.length / itemsPerPage))
    : Math.max(1, Math.ceil(total / itemsPerPage));
  const currentPage = horizontal ? Math.min(page, totalPages) : page;
  const pageImages = horizontal
    ? filteredImages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredImages;

  const handlePageChange = (newPage: number) => {
    if (horizontal) {
      setPage(newPage);
    } else {
      setPage(newPage);
      fetchImages(newPage, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  const renderPagination = () => {
    const totalPagesToShow = horizontal ? totalPages : Math.ceil(total / itemsPerPage);
    if (totalPagesToShow <= 1) return null;

    const pages: (number | string)[] = [];
    if (totalPagesToShow <= 7) {
      for (let i = 1; i <= totalPagesToShow; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPagesToShow - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPagesToShow - 2) pages.push('...');
      pages.push(totalPagesToShow);
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
          typeof p === 'string' ? (
            <span key={`ellipsis-${idx}`} className="h-8 min-w-8 flex items-center justify-center text-[10px] text-[#8d6a3a]">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`h-8 min-w-8 px-2 rounded-lg text-[11px] font-bold transition-all ${
                p === currentPage
                  ? "bg-[#6f542f] text-white"
                  : "bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce]"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPagesToShow}
          className="h-8 min-w-8 px-2 rounded-lg text-xs font-bold transition-all bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
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
          {horizontal ? filteredImages.length : total} {(horizontal ? filteredImages.length : total) === 1 ? "image" : "images"}
        </p>
        <button
          onClick={() => fetchImages(1, false)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-[#d9cdbb] bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#6f542f] hover:bg-[#fcfaf7] transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span className="text-[10px]">Refresh</span>
        </button>
      </div>

      {filteredImages.length === 0 && !loadingMore ? (
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
          {renderPagination()}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
            {pageImages.map((img, idx) => {
              if (!img) return null;

              const fullUrl = getImageUrl(img.url);
              const fileName = img.name || "Untitled";

              return (
                <div key={idx} className="group relative bg-white border border-[#ded3c4] rounded-lg overflow-hidden hover:shadow-md transition-all">
                  <div className="w-full h-[100px] bg-[#fcfaf7] overflow-hidden relative">
                    <Image fill
                      src={fullUrl}
                      alt={fileName}
                      crossOrigin="anonymous"
                      loading="lazy"
                      sizes="100px"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        onClick={() => copyToClipboard(img.url)}
                        className="p-1.5 bg-white rounded-md text-[#1f261b] hover:bg-[#f3eee6] transition-colors shadow-lg"
                        title="Copy Path"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="p-1">
                    <p className="text-[8px] font-bold text-[#1f261b] truncate" title={fileName}>
                      {fileName}
                    </p>
                    <button
                      onClick={() => copyToClipboard(img.url)}
                      className={`w-full text-[7px] font-bold uppercase tracking-widest py-1 rounded transition-all ${
                        copyFeedback === img.url ? 'bg-green-600 text-white' : 'bg-[#f3eee6] text-[#6f542f] hover:bg-[#eadfce]'
                      }`}
                    >
                      {copyFeedback === img.url ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {loadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-[#8d6a3a]" size={20} />
              <span className="ml-2 text-xs text-[#8d6a3a]">Loading more...</span>
            </div>
          )}
          {renderPagination()}
        </div>
      )}
    </div>
  );
}