"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Save, ImagePlus, Loader2 } from "lucide-react";
// Correctly importing the exported member and function
import { pageApi, type PageData, uploadImage, getImageUrl } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";

const optionalSeoFields = ["metaKeywords", "canonical", "ogTitle", "ogDescription", "ogImage"] as const;

interface SEOEditorProps {
  slug: string;
  title: string;
}

export default function SEOEditor({ slug, title }: SEOEditorProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    pageName: "",
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      h1: "",
      canonical: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
    },
    robots: "index, follow",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Slug 'home' is handled as '/' in your backend logic
      const data = await pageApi.get(slug);
      if (data && Object.keys(data).length > 0) {
        setPageData(data);
        setForm({
          pageName: data.pageName || "",
          seo: {
            metaTitle: data.seo?.metaTitle || "",
            metaDescription: data.seo?.metaDescription || "",
            metaKeywords: data.seo?.metaKeywords || "",
            h1: data.seo?.h1 || "",
            canonical: data.seo?.canonical || "",
            ogTitle: data.seo?.ogTitle || "",
            ogDescription: data.seo?.ogDescription || "",
            ogImage: data.seo?.ogImage || "",
          },
          robots: data.robots || "index, follow",
        });
      }
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to load SEO data");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOgImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadImage(file);
      setForm({ ...form, seo: { ...form.seo, ogImage: url } });
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");

      const seoPayload: PageData["seo"] = {
        metaTitle: form.seo.metaTitle.trim(),
        metaDescription: form.seo.metaDescription.trim(),
        h1: form.seo.h1.trim(),
      };

      optionalSeoFields.forEach((field) => {
        const value = form.seo[field]?.trim();
        if (value) {
          seoPayload[field] = value;
        }
      });

      const payload = {
        ...form,
        pageName: form.pageName.trim(),
        seo: seoPayload,
      };

      if (payload.seo.metaTitle.length > 65) {
        setMessage("Meta Title should not exceed 65 characters");
        return;
      }

      if (payload.seo.metaDescription.length > 155) {
        setMessage("Meta Description should not exceed 155 characters");
        return;
      }
      
      if (pageData) {
        await pageApi.update(pageData._id, payload);
        setMessage("SEO settings updated successfully!");
      } else {
        // Handle creation if it doesn't exist yet
        await pageApi.create({ ...payload, slug: slug === 'home' ? '/' : slug });
        setMessage("SEO page created and settings saved!");
        loadData();
      }
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pageData) return <div className="p-10 text-center">Loading SEO Settings...</div>;

  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500">Update metadata and social sharing settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white p-6 rounded-xl border border-[#ded3c4] shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase text-[#8d6a3a] mb-4 border-b pb-2">Core SEO Meta</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Page Name <input className={`${fieldClass} mt-2`} value={form.pageName} onChange={(e) => setForm({...form, pageName: e.target.value})} required /></label>
            <label className={labelClass}>H1 Tag Content <input className={`${fieldClass} mt-2`} value={form.seo.h1} onChange={(e) => setForm({...form, seo: {...form.seo, h1: e.target.value}})} required /></label>
            <label className={labelClass}>Meta Title <input className={`${fieldClass} mt-2`} value={form.seo.metaTitle} onChange={(e) => setForm({...form, seo: {...form.seo, metaTitle: e.target.value}})} required /></label>
            <label className={labelClass}>Meta Keywords <input className={`${fieldClass} mt-2`} value={form.seo.metaKeywords} onChange={(e) => setForm({...form, seo: {...form.seo, metaKeywords: e.target.value}})} /></label>
          </div>
          <label className={labelClass}>Meta Description <textarea className={`${fieldClass} mt-2 h-24`} value={form.seo.metaDescription} onChange={(e) => setForm({...form, seo: {...form.seo, metaDescription: e.target.value}})} required /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Canonical URL <input className={`${fieldClass} mt-2`} value={form.seo.canonical} onChange={(e) => setForm({...form, seo: {...form.seo, canonical: e.target.value}})} /></label>
            <label className={labelClass}>Robots <select className={`${fieldClass} mt-2`} value={form.robots} onChange={(e) => setForm({...form, robots: e.target.value})}>
              <option value="index, follow">index, follow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select></label>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-[#ded3c4] shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase text-[#8d6a3a] mb-4 border-b pb-2">Open Graph (Social)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>OG Title <input className={`${fieldClass} mt-2`} value={form.seo.ogTitle} onChange={(e) => setForm({...form, seo: {...form.seo, ogTitle: e.target.value}})} /></label>
            <div>
              <label className={labelClass}>Social Sharing Image (OG Image)</label>
              <div className="mt-2 flex items-center gap-4">
                {form.seo.ogImage && <Image width={80} height={48} src={getImageUrl(form.seo.ogImage)} alt="OG Preview" className="h-12 w-20 object-cover rounded border" />}
                <label className="cursor-pointer flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-dashed border-gray-300 text-sm">
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <ImagePlus size={16} />}
                  {form.seo.ogImage ? "Change" : "Upload"}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleOgImageUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
          </div>
          <label className={labelClass}>OG Description <textarea className={`${fieldClass} mt-2 h-20`} value={form.seo.ogDescription} onChange={(e) => setForm({...form, seo: {...form.seo, ogDescription: e.target.value}})} /></label>
        </section>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="bg-[#6f542f] text-white px-10 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
            <Save size={20} /> {loading ? "Saving..." : "Publish SEO Updates"}
          </button>
          {message && <span className={`text-sm font-bold ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</span>}
        </div>
      </form>
    </div>
  );
}
