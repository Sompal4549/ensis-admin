"use client";

import React, { useEffect, useState } from "react";
import { mediaApi, getImageUrl, type MediaFile } from "@/lib/api";
import { Copy, Loader2, Image as ImageIcon, Search } from "lucide-react";
import Image from "next/image";

interface MediaGridProps {
  subDir?: string;
}

export default function MediaGrid({ subDir = "" }: MediaGridProps) {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const data = await mediaApi.list(subDir);
        setImages(data);
      } catch (err) {
        setError("Failed to load images");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [subDir]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyFeedback(url);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const filteredImages = images.filter((img) => 
    img?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8d6a3a]" size={18} />
        <input
          type="text"
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-[#d9cdbb] rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#8d6a3a] text-[#1f261b]"
        />
      </div>

      {filteredImages.length === 0 ? (
        <div className="bg-[#fcfaf7] border border-[#ded3c4] rounded-2xl p-20 text-center">
          <ImageIcon className="mx-auto text-[#d9cdbb] mb-4" size={48} />
          <p className="text-[#5f5a50]">No images found in this directory.</p>
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
                <div className="p-4">
                  <p className="text-xs font-bold text-[#1f261b] truncate mb-1" title={fileName}>{fileName}</p>
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