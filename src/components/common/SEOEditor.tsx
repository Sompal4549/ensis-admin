"use client";

import { toast } from "react-toastify";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { pageApi, type PageData } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";

interface SEOEditorProps {
  slug: string;
  pageName?: string;
  title: string;
}

export default function SEOEditor({ slug, pageName, title }: SEOEditorProps) {
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);

  const generatePageName = (slugValue: string) =>
    slugValue
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const [form, setForm] = useState({
    pageName: pageName || generatePageName(slug),
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      canonical: "",
      ogJson: "",
      schema: "",
    },
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pageApi.get(slug);
      if (data && Object.keys(data).length > 0) {
        setPageData(data);
        setForm({
          pageName: data.pageName || "",
          seo: {
            metaTitle: data.seo?.metaTitle || "",
            metaDescription: data.seo?.metaDescription || "",
            metaKeywords: data.seo?.metaKeywords || "",
            canonical: data.seo?.canonical || "",
            ogJson: data.seo?.ogJson || "",
            schema: data.seo?.schema || "",
          },
        });
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load SEO data");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (form.seo.metaTitle.trim().length > 65) {
      toast.warn("Meta Title should not exceed 65 characters");
      return;
    }
    if (form.seo.metaDescription.trim().length > 155) {
      toast.warn("Meta Description should not exceed 155 characters");
      return;
    }

    try {
      setLoading(true);

      const seoPayload: PageData["seo"] = {
        metaTitle: form.seo.metaTitle.trim(),
        metaDescription: form.seo.metaDescription.trim(),
      };

      (["metaKeywords", "canonical", "ogJson", "schema"] as const).forEach((field) => {
        const value = form.seo[field]?.trim();
        if (value !== undefined && value !== null) seoPayload[field] = value;
      });

      const payload = {
        pageName: form.pageName.trim(),
        seo: seoPayload,
      };

      console.log("Payload being sent:", JSON.stringify(payload, null, 2));

      if (pageData) {
        await pageApi.update(pageData._id, payload);
        toast.success("SEO settings updated successfully!");
      } else {
        await pageApi.create({ ...payload, slug: slug === "home" ? "/" : slug });
        toast.success("SEO page created and settings saved!");
        await loadData();
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save SEO updates");
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
        {/* Core SEO */}
        <section className="bg-white p-6 rounded-xl border border-[#ded3c4] shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase text-[#8d6a3a] mb-4 border-b pb-2">Core SEO Meta</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              Page Name
              <input
                className={`${fieldClass} mt-2 bg-gray-50 text-gray-400 cursor-not-allowed`}
                value={form.pageName}
                readOnly
              />
            </label>
            <label className={labelClass}>
              Meta Title
              <input
                className={`${fieldClass} mt-2`}
                value={form.seo.metaTitle}
                maxLength={65}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })}
                required
              />
              <span className="text-xs text-[#5f5a50] mt-1 block">{form.seo.metaTitle.length}/65</span>
            </label>
            <label className={labelClass}>
              Meta Keywords
              <input
                className={`${fieldClass} mt-2`}
                value={form.seo.metaKeywords}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaKeywords: e.target.value } })}
              />
            </label>
          </div>
          <label className={labelClass}>
            Meta Description
            <textarea
              className={`${fieldClass} mt-2 h-24`}
              value={form.seo.metaDescription}
              maxLength={155}
              onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })}
              required
            />
            <span className="text-xs text-[#5f5a50] mt-1 block">{form.seo.metaDescription.length}/155</span>
          </label>
          <label className={labelClass}>
            Canonical URL
            <div className="flex gap-2 mt-2">
              <input
                className={fieldClass}
                value={form.seo.canonical}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, canonical: e.target.value } })}
                placeholder="https://ensis.in/page-slug"
              />
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    seo: {
                      ...form.seo,
                      canonical: `https://ensis.in/${slug === "home" ? "" : slug}`,
                    },
                  })
                }
                className="shrink-0 px-3 py-1.5 text-xs font-bold bg-[#faf6ef] border border-[#ded3c4] text-[#6f542f] rounded-md hover:bg-[#f0e8d8] transition-colors"
              >
                Auto Fill
              </button>
            </div>
          </label>
        </section>

        {/* Open Graph */}
        <section className="bg-white p-6 rounded-xl border border-[#ded3c4] shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase text-[#8d6a3a] mb-4 border-b pb-2">Open Graph (Social)</h2>
          <label className={labelClass}>
            OG JSON
            <textarea
              className={`${fieldClass} mt-2 font-mono text-xs h-48`}
              value={form.seo.ogJson}
              placeholder={`{\n  "og:type": "website",\n  "og:url": "https://ensis.in/",\n  "og:site_name": "Ensis"\n}`}
              onChange={(e) => setForm({ ...form, seo: { ...form.seo, ogJson: e.target.value } })}
              spellCheck={false}
            />
          </label>
          <p className="text-xs text-gray-400">OG properties as JSON. Will be injected as Open Graph meta tags.</p>
        </section>

        {/* Schema */}
        <section className="bg-white p-6 rounded-xl border border-[#ded3c4] shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase text-[#8d6a3a] mb-4 border-b pb-2">Schema Markup (JSON-LD)</h2>
          <label className={labelClass}>
            Schema JSON
            <textarea
              className={`${fieldClass} mt-2 font-mono text-xs h-48`}
              value={form.seo.schema}
              placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Ensis"\n}`}
              onChange={(e) => setForm({ ...form, seo: { ...form.seo, schema: e.target.value } })}
              spellCheck={false}
            />
          </label>
          <p className="text-xs text-gray-400">Paste valid JSON-LD schema. Will be injected in &lt;script type="application/ld+json"&gt; tag.</p>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#6f542f] text-white px-10 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Save size={20} /> {loading ? "Saving..." : "Publish SEO Updates"}
          </button>
        </div>
      </form>
    </div>
  );
}