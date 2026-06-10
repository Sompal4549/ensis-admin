"use client";
import { useRef } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { getImageUrl, uploadImage } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import Image from "next/image";

export const ImageUploadField = ({
  label,
  value,
  fieldKey,
  onUpload,
  uploadingField,
  onUploadingChange,
  onError,
}: {
  label: string;
  value: string | undefined;
  fieldKey: string;
  onUpload: (url: string) => void;
  uploadingField: string | null;
  onUploadingChange: (field: string | null) => void;
  onError: (message: string) => void;
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const displayValue = typeof value === 'string' ? value : '';
  const imgUrl = getImageUrl(displayValue);

  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between gap-3">
        <label className={labelClass}>{label}</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-2 py-1 text-[10px] font-bold text-[#263016] hover:bg-[#fcfaf7]"
        >
          {uploadingField === fieldKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
          Upload Image
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try {
            onUploadingChange(fieldKey);
            const url = await uploadImage(file);
            onUpload(url);
          } catch (error) {
            onError((error as Error).message || "Image upload failed.");
          } finally {
            onUploadingChange(null);
          }
        }}
      />
      <input 
        className={fieldClass} 
        type="text" 
        value={displayValue} 
        onChange={(e) => onUpload(e.target.value)} 
        placeholder="Paste image URL or use upload button" 
      />
      {imgUrl ? (
        <Image height={80} width={128} src={imgUrl} alt={label} className="mt-3 h-20 w-32 rounded-md object-cover border border-[#eee5d9]" unoptimized crossOrigin="anonymous" />
      ) : null}
    </div>
  );
};
