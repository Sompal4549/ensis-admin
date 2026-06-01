"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
// Correctly importing the exported member and function
import { pageApi, type PageData } from "@/lib/api";

const fieldClass = "w-full rounded-md border border-[#d9cdbb] bg-white px-3 py-2 text-sm outline-none focus:border-[#8d6a3a]";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-[#5f5a50]";

interface SEOEditorProps {
  slug: string;
  title: string;
}

export default function SEOEditor({ slug, title }: SEOEditorProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pageData, setPageData] = useState<PageData | null>(null);

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

  const loadData = async () => {
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
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [slug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      
      if (pageData) {
        await pageApi.update(pageData._id, form);
        setMessage("SEO settings updated successfully!");
      } else {
        // Handle creation if it doesn't exist yet
        const payload = { ...form, slug: slug === 'home' ? '/' : slug };
        await pageApi.create(payload);
        setMessage("SEO page created and settings saved!");
        loadData();
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pageData) return <div className="p-10 text-center">Loading SEO Settings...</div>;

  return (
    <div className="max-w-5xl mx-auto">
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
            <label className={labelClass}>OG Image URL <input className={`${fieldClass} mt-2`} value={form.seo.ogImage} onChange={(e) => setForm({...form, seo: {...form.seo, ogImage: e.target.value}})} /></label>
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