"use client";

import { toast } from "react-toastify";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Save, RefreshCw } from "lucide-react";
import { pageApi, type PageData } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";

const SLUG = "advanced-seo";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

interface AdvancedSeoForm {
    sitemap: {
        url: string;
        autoGenerate: boolean;
        excludePaths: string;
    };
    robots: {
        content: string;
    };
    searchConsole: {
        googleVerification: string;
        bingVerification: string;
    };
    analytics: {
        gaId: string;
        gtmId: string;
        fbPixelId: string;
        clarityId: string;
    };
}

const defaultForm: AdvancedSeoForm = {
    sitemap: {
        url: "",
        autoGenerate: true,
        excludePaths: "",
    },
    robots: {
        content: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://ensis.in/sitemap.xml`,
    },
    searchConsole: {
        googleVerification: "",
        bingVerification: "",
    },
    analytics: {
        gaId: "",
        gtmId: "",
        fbPixelId: "",
        clarityId: "",
    },
};

export default function AdvancedSeo() {
    const [loading, setLoading] = useState(false);
    const [pageData, setPageData] = useState<any>(null);
    const [form, setForm] = useState<AdvancedSeoForm>(defaultForm);

    // pageApi ki jagah direct fetch karo
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/seo/advanced`, {
                credentials: "include",
            });
            const json = await res.json();
            if (json.success && json.data) {
                setPageData(json.data);
                setForm({
                    sitemap: json.data.sitemap || defaultForm.sitemap,
                    robots: json.data.robotsTxt || defaultForm.robots,
                    searchConsole: json.data.searchConsole || defaultForm.searchConsole,
                    analytics: json.data.analytics || defaultForm.analytics,
                });
            }
        } catch {
            // no data yet, use defaults
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        loadData();
    }, [loadData]);
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/v1/seo/advanced`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sitemap: form.sitemap,
                    robots: form.robots,
                    searchConsole: form.searchConsole,
                    analytics: form.analytics,
                }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success("Advanced SEO settings saved!");
                setPageData(json.data?.advanced || json.data);
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to save");
        } finally {
            setLoading(false);
        }
    };

    const setSitemap = (key: keyof AdvancedSeoForm["sitemap"], value: string | boolean) =>
        setForm({ ...form, sitemap: { ...form.sitemap, [key]: value } });

    const setRobots = (value: string) =>
        setForm({ ...form, robots: { content: value } });

    const setConsole = (key: keyof AdvancedSeoForm["searchConsole"], value: string) =>
        setForm({ ...form, searchConsole: { ...form.searchConsole, [key]: value } });

    const setAnalytics = (key: keyof AdvancedSeoForm["analytics"], value: string) =>
        setForm({ ...form, analytics: { ...form.analytics, [key]: value } });

    if (loading && !pageData) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Advanced SEO</h1>
                <p className="text-sm text-gray-500">Sitemap, robots.txt, search console verification, and analytics setup.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Sitemap */}
                <section className="bg-white p-6 rounded-xl border border-[#ded3c4] shadow-sm space-y-4">
                    <h2 className="text-sm font-bold uppercase text-[#8d6a3a] mb-4 border-b pb-2">Sitemap</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className={labelClass}>
                            Sitemap URL
                            <div className="flex gap-2 mt-2">
                                <input
                                    className={fieldClass}
                                    value={form.sitemap.url}
                                    onChange={e => setSitemap("url", e.target.value)}
                                    placeholder="https://ensis.in/sitemap.xml"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSitemap("url", "https://ensis.in/sitemap.xml")}
                                    className="shrink-0 px-3 py-1.5 text-xs font-bold bg-[#faf6ef] border border-[#ded3c4] text-[#6f542f] rounded-md hover:bg-[#f0e8d8] transition-colors"
                                >
                                    Auto Fill
                                </button>
                            </div>
                        </label>
                        <label className={labelClass}>
                            Exclude Paths
                            <input
                                className={`${fieldClass} mt-2`}
                                value={form.sitemap.excludePaths}
                                onChange={e => setSitemap("excludePaths", e.target.value)}
                                placeholder="/admin, /api, /private"
                            />
                            <span className="text-xs text-gray-400 mt-1 block">Comma-separated paths to exclude from sitemap</span>
                        </label>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.sitemap.autoGenerate}
                            onChange={e => setSitemap("autoGenerate", e.target.checked)}
                            className="w-4 h-4 accent-[#6f542f]"
                        />
                        <span className="text-sm font-medium text-gray-700">Auto-generate sitemap on content update</span>
                    </label>
                </section>

                {/* Robots.txt */}
                <section className="bg-white p-6 rounded-xl border border-[#ded3c4] shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="text-sm font-bold uppercase text-[#8d6a3a]">Robots.txt</h2>
                        <button
                            type="button"
                            onClick={() => setRobots(defaultForm.robots.content)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#6f542f] hover:underline"
                        >
                            <RefreshCw size={12} /> Reset to Default
                        </button>
                    </div>
                    <label className={labelClass}>
                        robots.txt Content
                        <textarea
                            className={`${fieldClass} mt-2 font-mono text-xs h-48`}
                            value={form.robots.content}
                            onChange={e => setRobots(e.target.value)}
                            spellCheck={false}
                        />
                    </label>
                    <p className="text-xs text-gray-400">This will be served at <code className="bg-gray-100 px-1 rounded">https://ensis.in/robots.txt</code></p>
                </section>

                {/* Search Console */}
                <section className="bg-white p-6 rounded-xl border border-[#ded3c4] shadow-sm space-y-4">
                    <h2 className="text-sm font-bold uppercase text-[#8d6a3a] mb-4 border-b pb-2">Search Console Verification</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className={labelClass}>
                            Google Search Console
                            <input
                                className={`${fieldClass} mt-2`}
                                value={form.searchConsole.googleVerification}
                                onChange={e => setConsole("googleVerification", e.target.value)}
                                placeholder="google-site-verification=xxxxxxxxxxxxxxxx"
                            />
                            <span className="text-xs text-gray-400 mt-1 block">From Google Search Console → Settings → Ownership verification</span>
                        </label>
                        <label className={labelClass}>
                            Bing Webmaster Tools
                            <input
                                className={`${fieldClass} mt-2`}
                                value={form.searchConsole.bingVerification}
                                onChange={e => setConsole("bingVerification", e.target.value)}
                                placeholder="msvalidate.01=xxxxxxxxxxxxxxxx"
                            />
                            <span className="text-xs text-gray-400 mt-1 block">From Bing Webmaster → Settings → Site verification</span>
                        </label>
                    </div>
                </section>

                {/* Analytics */}
                <section className="bg-white p-6 rounded-xl border border-[#ded3c4] shadow-sm space-y-4">
                    <h2 className="text-sm font-bold uppercase text-[#8d6a3a] mb-4 border-b pb-2">Analytics & Tracking</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className={labelClass}>
                            Google Analytics 4 (GA4) ID
                            <input
                                className={`${fieldClass} mt-2`}
                                value={form.analytics.gaId}
                                onChange={e => setAnalytics("gaId", e.target.value)}
                                placeholder="G-XXXXXXXXXX"
                            />
                        </label>
                        <label className={labelClass}>
                            Google Tag Manager (GTM) ID
                            <input
                                className={`${fieldClass} mt-2`}
                                value={form.analytics.gtmId}
                                onChange={e => setAnalytics("gtmId", e.target.value)}
                                placeholder="GTM-XXXXXXX"
                            />
                        </label>
                        <label className={labelClass}>
                            Meta (Facebook) Pixel ID
                            <input
                                className={`${fieldClass} mt-2`}
                                value={form.analytics.fbPixelId}
                                onChange={e => setAnalytics("fbPixelId", e.target.value)}
                                placeholder="XXXXXXXXXXXXXXXXXX"
                            />
                        </label>
                        <label className={labelClass}>
                            Microsoft Clarity ID
                            <input
                                className={`${fieldClass} mt-2`}
                                value={form.analytics.clarityId}
                                onChange={e => setAnalytics("clarityId", e.target.value)}
                                placeholder="xxxxxxxxxx"
                            />
                        </label>
                    </div>
                    <p className="text-xs text-gray-400">These IDs will be injected into the site's <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code> via your layout file.</p>
                </section>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#6f542f] text-white px-10 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        <Save size={20} /> {loading ? "Saving..." : "Save Advanced Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
}