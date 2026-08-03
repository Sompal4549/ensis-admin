"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, RefreshCw, Save, Trash2, ExternalLink } from "lucide-react";
import RichTextEditor from "@/components/common/RichTextEditor";
import { componentContentApi, getImageUrl, uploadImage, type ComponentContent } from "@/lib/api";
import { type HomepageComponentKey, type HomepageData } from "@/lib/homepageContent";
import { HomepageContentProvider, useHomepageContent } from "./HomepageContentContext";
import Image from "next/image";

// Compact local classes for this editor only
const smallFieldClass =
  "w-full rounded border border-slate-200 px-1.5 py-1 text-[11px] focus:border-[#8d6a3a] focus:ring-1 focus:ring-[#8d6a3a] outline-none";
const smallLabelClass = "block text-[10px] font-semibold text-[#263016] mb-0.5";
const smallCardClass = "rounded-lg border border-[#efe3d1] bg-white p-2.5 shadow-sm";

type EditableValue = string | number | boolean | null | EditableValue[] | { [key: string]: EditableValue };

const titleize = (value: string) =>
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();

const isObject = (value: EditableValue): value is { [key: string]: EditableValue } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const updateAtPath = (source: EditableValue, path: Array<string | number>, value: EditableValue): EditableValue => {
  if (!path.length) return value;
  const [head, ...rest] = path;
  if (Array.isArray(source)) {
    const next = [...source];
    next[head as number] = updateAtPath(next[head as number], rest, value);
    return next;
  }
  if (isObject(source)) {
    return { ...source, [head]: updateAtPath(source[head as string], rest, value) };
  }
  return source;
};

const removeAtPath = (source: EditableValue, path: Array<string | number>, index: number): EditableValue => {
  const current = getAtPath(source, path);
  if (!Array.isArray(current)) return source;
  return updateAtPath(source, path, current.filter((_, itemIndex) => itemIndex !== index));
};

const moveAtPath = (source: EditableValue, path: Array<string | number>, index: number, direction: number): EditableValue => {
  const current = getAtPath(source, path);
  if (!Array.isArray(current)) return source;
  const target = index + direction;
  if (target < 0 || target >= current.length) return source;
  const next = [...current];
  const item = next.splice(index, 1)[0];
  next.splice(target, 0, item);
  return updateAtPath(source, path, next);
};

const getAtPath = (source: EditableValue, path: Array<string | number>): EditableValue =>
  path.reduce<EditableValue>((current, key) => {
    if (Array.isArray(current)) return current[key as number];
    if (isObject(current)) return current[key as string];
    return "";
  }, source);

const emptyFromSample = (sample: EditableValue): EditableValue => {
  if (Array.isArray(sample)) return [];
  if (isObject(sample)) {
    return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, key === "id" ? `${Date.now()}` : emptyFromSample(value)]));
  }
  if (typeof sample === "boolean") return false;
  if (typeof sample === "number") return 0;
  return "";
};

const emptyArrayItemForPath = (path: Array<string | number>, sample: EditableValue): EditableValue => {
  const lastKey = String(path[path.length - 1] || "").toLowerCase();
  if (lastKey === "projects" || lastKey === "mfgimages") {
    return { image: "", title: "" };
  }
  return emptyFromSample(sample);
};

const isImageField = (path: Array<string | number>) => {
  const last = path[path.length - 1];
  const name = String(last || "").toLowerCase();
  const parentName = path.length > 1 ? String(path[path.length - 2] || "").toLowerCase() : "";

  const check = (key: string) => {
    const normalized = key.replace(/[^a-z0-9]/g, "");
    return (
      normalized === "image" ||
      normalized === "imgurl" ||
      normalized === "welcomeimage" ||
      normalized === "backgroundimage" ||
      normalized === "ctabgimage" ||
      normalized === "mfgimages" ||
      normalized === "projimages" ||
      /^mfgimage[1-3]$/.test(normalized) ||
      /^projimage[1-5]$/.test(normalized)
    );
  };

  if (typeof last === "number") return check(parentName);
  return check(name);
};

const isRatingField = (path: Array<string | number>) => {
  const last = path[path.length - 1];
  const name = String(last || "").toLowerCase();
  const normalized = name.replace(/[^a-z]/g, "");
  
  const check = (val: string) => val.includes("rating") || val === "stars" || val === "star" || val === "score" || val === "rate";
  
  if (typeof last === "number" && path.length > 1) {
    return check(String(path[path.length - 2] || "").toLowerCase().replace(/[^a-z]/g, ""));
  }
  return check(normalized);
};

const isRichTextField = (path: Array<string | number>) => {
  const last = path[path.length - 1];
  const name = String(last || "").toLowerCase();
  const parentName = path.length > 1 ? String(path[path.length - 2] || "").toLowerCase() : "";

  const check = (key: string) => {
    const normalized = key.replace(/[^a-z0-9]/g, "");
    if (normalized.includes("button") || normalized.includes("btn") || normalized.includes("link")) return false;
    return (
      normalized.includes("description") ||
      normalized.includes("desc") ||
      normalized.includes("text") ||
      normalized.includes("content")
    );
  };

  if (typeof last === "number") return check(parentName);
  return check(name);
};

function ImageField({
  label,
  path,
  value,
  onChange,
}: {
  label: string;
  path: Array<string | number>;
  value: string;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between gap-2">
        <label className={smallLabelClass}>{label}</label>
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded-md border border-[#d9cdbb] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#263016]">
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
          Upload
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
            setUploading(true);
            setError("");
            const url = await uploadImage(file);
            onChange(url);
          } catch (uploadError) {
            setError((uploadError as Error).message || "Image upload failed.");
          } finally {
            setUploading(false);
          }
        }}
      />
      <input className={smallFieldClass} value={value} onChange={(event) => onChange(event.target.value)} placeholder={`${path.join(".")} path`} />
      {value ? <Image height={64} width={64} src={getImageUrl(value)} alt={label} className="mt-1 h-12 w-full max-w-[120px] rounded-md object-cover shadow-sm" unoptimized crossOrigin="anonymous" /> : null}
      {error ? <p className="mt-0.5 text-[10px] font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

function StructuredField({
  path,
  value,
  root,
  onRootChange,
}: {
  path: Array<string | number>;
  value: EditableValue;
  root: EditableValue;
  onRootChange: (value: EditableValue) => void;
}) {
  const label = titleize(String(path[path.length - 1] || "Content"));
  const setPathValue = (nextValue: EditableValue) => onRootChange(updateAtPath(root, path, nextValue));

  if (Array.isArray(value)) {
    const sample = value[0] ?? "";
    const lastKey = String(path[path.length - 1] || "").toLowerCase();
    const isSlidesArray = lastKey === "slides";
    return (
      <section className="rounded-lg border border-[#efe3d1] bg-[#fbf7ef] p-2">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#263016]">{label}</h3>
          <button type="button" onClick={() => setPathValue([...value, emptyArrayItemForPath(path, sample)])} className="inline-flex items-center gap-1 rounded-md bg-[#263016] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            <Plus size={10} /> Add
          </button>
        </div>
        <div className={isSlidesArray ? "grid grid-cols-1 gap-1.5" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5"}>
          {value.map((item, index) => (
            <div key={index} className="rounded-lg border border-[#e3d5bf] bg-white p-1.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold text-[#1f261b]">{label} {index + 1}</p>
                <div className="flex items-center gap-0.5">
                  <button type="button" disabled={index === 0} onClick={() => onRootChange(moveAtPath(root, path, index, -1))} className="rounded-md border border-[#d9cdbb] p-0.5 disabled:opacity-50">
                    <ArrowUp size={10} />
                  </button>
                  <button type="button" disabled={index === value.length - 1} onClick={() => onRootChange(moveAtPath(root, path, index, 1))} className="rounded-md border border-[#d9cdbb] p-0.5 disabled:opacity-50">
                    <ArrowDown size={10} />
                  </button>
                  <button type="button" onClick={() => onRootChange(removeAtPath(root, path, index))} className="rounded-md border border-[#e0b4a0] p-0.5 text-[#9b2e2e]">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
              <StructuredField path={[...path, index]} value={item} root={root} onRootChange={onRootChange} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isObject(value)) {
    const parentKey = path.length > 1 ? String(path[path.length - 2] || "").toLowerCase() : "";
    const isSlideItem = parentKey === "slides" && typeof path[path.length - 1] === "number";

    if (!isSlideItem) {
      return (
        <div className="grid gap-1.5">
          {Object.entries(value)
            .filter(([key]) => key !== "id")
            .map(([key, childValue]) => (
              <StructuredField key={key} path={[...path, key]} value={childValue} root={root} onRootChange={onRootChange} />
            ))}
        </div>
      );
    }

    const isWideField = (key: string, childValue: EditableValue) => {
      if (Array.isArray(childValue) || isObject(childValue)) return true;
      const childPath = [...path, key];
      if (isImageField(childPath) || isRichTextField(childPath)) return true;
      const lowerKey = key.toLowerCase();
      const longKeys = ["description", "desc", "text", "content", "heading", "tagline", "address", "copyright"];
      if (longKeys.some((k) => lowerKey.includes(k)) && !["button", "btn", "link"].some((k) => lowerKey.includes(k))) return true;
      return typeof childValue === "string" && childValue.length > 90;
    };

    return (
      <div className="grid gap-1.5 sm:grid-cols-2">
        {Object.entries(value)
          .filter(([key]) => key !== "id")
          .map(([key, childValue]) => (
            <div key={key} className={isWideField(key, childValue) ? "sm:col-span-2" : ""}>
              <StructuredField path={[...path, key]} value={childValue} root={root} onRootChange={onRootChange} />
            </div>
          ))}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#263016]">
        <input type="checkbox" checked={value} onChange={(event) => setPathValue(event.target.checked)} />
        {label}
      </label>
    );
  }

  if (isImageField(path)) {
    return <ImageField label={label} path={path} value={String(value || "")} onChange={setPathValue} />;
  }

  if (isRatingField(path)) {
    return (
      <label className={smallLabelClass}>
        {label}
        <input
          type="number"
          min="0"
          max="5"
          step="0.5"
          className={`${smallFieldClass} mt-0.5`}
          value={typeof value === 'number' ? value : (Number(value) || 0)}
          onChange={(event) => setPathValue(Number(event.target.value))}
        />
      </label>
    );
  }

  const stringValue = String(value ?? "");

  if (isRichTextField(path)) {
    return (
      <div className="space-y-0.5">
        <label className={smallLabelClass}>{label}</label>
        <RichTextEditor
          value={stringValue}
          onChange={setPathValue}
          placeholder={`Enter ${label}...`}
          minHeight="100px"
        />
      </div>
    );
  }

  const lastKey = String(path[path.length - 1] || "").toLowerCase();
  const isLong =
    (["description", "desc", "text", "content", "heading", "tagline", "address", "copyright"].some((k) => lastKey.includes(k)) && 
     !["button", "btn", "link"].some(k => lastKey.includes(k))) || 
    stringValue.length > 90;

  return (
    <label className={smallLabelClass}>
      {label}
      {isLong ? (
        <textarea className={`${smallFieldClass} mt-0.5 min-h-12`} value={stringValue} onChange={(event) => setPathValue(event.target.value)} />
      ) : (
        <input className={`${smallFieldClass} mt-0.5`} value={stringValue} onChange={(event) => setPathValue(event.target.value)} />
      )}
    </label>
  );
}


function EditorInner({ title }: { title: string }) {
  const { errors, form, loading, message, refresh, save, setData, setForm } = useHomepageContent();
  const isBlogComponent = title.toLowerCase().includes("blog");
  const isManufacturingComponent = title.toLowerCase().includes("manufacturing");
  const isRoomSetupsComponent = title.toLowerCase().includes("room setups");
  const isReadyToBuildComponent = title.toLowerCase().includes("ready to build");
  const isTestimonialsComponent = title.toLowerCase().includes("testimonials");

  return (
    <div className="px-2 space-y-2">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8d6a3a]">Homepage Component</p>
          <h1 className="mt-0.5 text-base font-bold text-gray-900">{title}</h1>
          <p className="mt-0.5 text-[11px] text-gray-500">{form.description}</p>
        </div>
        <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-1 rounded-md border border-[#d9cdbb] bg-white px-2 py-1 text-[11px] font-semibold text-[#263016] disabled:opacity-60">
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <section className={smallCardClass}>
        <div className="grid gap-1.5 sm:grid-cols-2">
          <label className={smallLabelClass}>
            Label
            <input className={`${smallFieldClass} mt-0.5`} value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} />
          </label>
          <label className={smallLabelClass}>
            Page
            <input className={`${smallFieldClass} mt-0.5`} value={form.page} onChange={(event) => setForm((current) => ({ ...current, page: event.target.value }))} />
          </label>
        </div>
        <label className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-[#263016]">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
          Active on page
        </label>
      </section>

      <section className={`${smallCardClass} space-y-1.5`}>
        {isBlogComponent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 p-2 bg-[#fcfaf7] rounded-xl border border-[#efe3d1] mb-1.5">
            <div className="col-span-full mb-0.5">
              <h3 className="text-[10px] font-bold text-[#8d6a3a] uppercase tracking-wider">Button Configuration</h3>
              <p className="text-[9px] text-gray-500">Configure the main call-to-action for the blog section.</p>
            </div>
            <label className={smallLabelClass}>CTA Text 
              <input className={`${smallFieldClass} mt-0.5`} value={(form.data as any).ctaText || ""} onChange={e => setData({...form.data as any, ctaText: e.target.value})} placeholder="e.g. View All Blogs" />
            </label>
            <label className={smallLabelClass}>CTA Link 
              <input className={`${smallFieldClass} mt-0.5`} value={(form.data as any).ctaLink || ""} onChange={e => setData({...form.data as any, ctaLink: e.target.value})} placeholder="e.g. /blog" />
            </label>
          </div>
        )}
        
        <StructuredField path={[]} value={form.data as EditableValue} root={form.data as EditableValue} onRootChange={(value) => setData(value as HomepageData)} />
      </section>

      {errors.length ? (
        <div className="rounded-lg border border-[#f0d6d8] bg-[#fff1f3] p-1.5 text-[10px] text-[#9b2e2e]">
          <p className="font-semibold">Please fix these fields:</p>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-3">
            {errors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={save} disabled={loading} className="inline-flex items-center gap-1 rounded-md bg-[#6f542f] px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save size={12} />}
          Save Changes
        </button>
        {message ? <p className="text-[11px] font-semibold text-[#6f542f]">{message}</p> : null}
      </div>
    </div>
  );
}

export default function HomepageComponentRouteEditor({
  componentKey,
  title,
}: {
  componentKey: HomepageComponentKey;
  title: string;
}) {
  return (
    <Suspense fallback={<div className="flex justify-center p-6"><Loader2 className="animate-spin text-[#8d6a3a]" size={24} /></div>}>
    <HomepageContentProvider componentKey={componentKey}>
      <EditorInner title={title} />
    </HomepageContentProvider>
    </Suspense>
  );
}