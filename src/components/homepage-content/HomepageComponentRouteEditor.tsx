"use client";

import { Suspense, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/common/RichTextEditor";
import { getImageUrl, uploadImage } from "@/lib/api";
import { type HomepageComponentKey, type HomepageData } from "@/lib/homepageContent";
import { HomepageContentProvider, useHomepageContent } from "./HomepageContentContext";
import { fieldClass, labelClass, cardClass } from "@/constants";
import Image from "next/image";



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

const isRichTextField = (path: Array<string | number>) => {
  const last = path[path.length - 1];
  const name = String(last || "").toLowerCase();
  const parentName = path.length > 1 ? String(path[path.length - 2] || "").toLowerCase() : "";

  const check = (key: string) => {
    const normalized = key.replace(/[^a-z0-9]/g, "");
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
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className={labelClass}>{label}</label>
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-3 py-2 text-xs font-semibold text-[#263016]">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
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
      <input className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)} placeholder={`${path.join(".")} path`} />
      {value ? <Image height={96} width={96} src={getImageUrl(value)} alt={label} className="mt-3 h-24 w-full max-w-xs rounded-md object-cover shadow-sm" crossOrigin="anonymous" /> : null}
      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
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
    return (
      <section className="rounded-lg border border-[#efe3d1] bg-[#fbf7ef] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#263016]">{label}</h3>
          <button type="button" onClick={() => setPathValue([...value, emptyFromSample(sample)])} className="inline-flex items-center gap-2 rounded-md bg-[#263016] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            <Plus size={14} /> Add
          </button>
        </div>
        <div className="space-y-4">
          {value.map((item, index) => (
            <div key={index} className="rounded-lg border border-[#e3d5bf] bg-white p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#1f261b]">{label} {index + 1}</p>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={index === 0} onClick={() => onRootChange(moveAtPath(root, path, index, -1))} className="rounded-md border border-[#d9cdbb] p-2 disabled:opacity-50">
                    <ArrowUp size={15} />
                  </button>
                  <button type="button" disabled={index === value.length - 1} onClick={() => onRootChange(moveAtPath(root, path, index, 1))} className="rounded-md border border-[#d9cdbb] p-2 disabled:opacity-50">
                    <ArrowDown size={15} />
                  </button>
                  <button type="button" onClick={() => onRootChange(removeAtPath(root, path, index))} className="rounded-md border border-[#e0b4a0] p-2 text-[#9b2e2e]">
                    <Trash2 size={15} />
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
    return (
      <div className="grid gap-4">
        {Object.entries(value)
          .filter(([key]) => key !== "id")
          .map(([key, childValue]) => (
            <StructuredField key={key} path={[...path, key]} value={childValue} root={root} onRootChange={onRootChange} />
          ))}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-3 text-sm font-semibold text-[#263016]">
        <input type="checkbox" checked={value} onChange={(event) => setPathValue(event.target.checked)} />
        {label}
      </label>
    );
  }

  if (isImageField(path)) {
    return <ImageField label={label} path={path} value={String(value || "")} onChange={setPathValue} />;
  }

  const stringValue = String(value ?? "");

  if (isRichTextField(path)) {
    return (
      <div className="space-y-2">
        <label className={labelClass}>{label}</label>
        <RichTextEditor
          value={stringValue}
          onChange={setPathValue}
          placeholder={`Enter ${label}...`}
          minHeight="200px"
        />
      </div>
    );
  }

  const lastKey = String(path[path.length - 1] || "").toLowerCase();
  const isLong =
    ["description", "desc", "text", "content", "heading", "tagline", "address", "copyright"].some((k) =>
      lastKey.includes(k)
    ) || stringValue.length > 90;

  return (
    <label className={labelClass}>
      {label}
      {isLong ? (
        <textarea className={`${fieldClass} mt-2 min-h-24`} value={stringValue} onChange={(event) => setPathValue(event.target.value)} />
      ) : (
        <input className={`${fieldClass} mt-2`} value={stringValue} onChange={(event) => setPathValue(event.target.value)} />
      )}
    </label>
  );
}

function EditorInner({ title }: { title: string }) {
  const { errors, form, loading, message, refresh, save, setData, setForm } = useHomepageContent();

  return (
    <div className="px-4 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8d6a3a]">Homepage Component</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{form.description}</p>
        </div>
        <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-4 py-2 text-sm font-semibold text-[#263016] disabled:opacity-60">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <section className={cardClass}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Label
            <input className={`${fieldClass} mt-2`} value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} />
          </label>
          <label className={labelClass}>
            Page
            <input className={`${fieldClass} mt-2`} value={form.page} onChange={(event) => setForm((current) => ({ ...current, page: event.target.value }))} />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-[#263016]">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
          Active on page
        </label>
      </section>

      <section className={`${cardClass} space-y-5`}>
        <StructuredField path={[]} value={form.data as EditableValue} root={form.data as EditableValue} onRootChange={(value) => setData(value as HomepageData)} />
      </section>

      {errors.length ? (
        <div className="rounded-lg border border-[#f0d6d8] bg-[#fff1f3] p-4 text-sm text-[#9b2e2e]">
          <p className="font-semibold">Please fix these fields:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-[#6f542f] px-6 py-3 text-sm font-bold text-white disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
        {message ? <p className="text-sm font-semibold text-[#6f542f]">{message}</p> : null}
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
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#8d6a3a]" size={40} /></div>}>
    <HomepageContentProvider componentKey={componentKey}>
      <EditorInner title={title} />
    </HomepageContentProvider>
    </Suspense>
  );
}
