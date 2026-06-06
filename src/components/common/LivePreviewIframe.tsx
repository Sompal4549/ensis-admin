"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { componentContentApi } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

interface LivePreviewIframeProps {
  iframeSrc: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  pageName?: "dashboard" | "home" | "about";
  lastUpdated?: string;
  publishedBy?: string;
  navLinks?: string[];
  heroHeading?: string;
  heroText?: string;
  brandText?: string;
}

export default function LivePreviewIframe({
  iframeSrc,
  title = "Live Homepage Preview",
  subtitle = "See how your homepage looks live.",
  ctaLabel = "View Full Site",
  ctaHref,
  pageName,
  lastUpdated: lastUpdatedProp,
  publishedBy: publishedByProp,
  navLinks = ["Home", "About Us", "Services", "Projects", "Industries", "Contact Us"],
  heroHeading = "We Create Impactful Spaces That Inspire",
  heroText = "End to end interior & turnkey solutions for retail, commercial & corporate spaces.",
  brandText = "ensis",
}: LivePreviewIframeProps) {
  const actionLink = ctaHref ?? iframeSrc;
  const { user } = useAuth();
  const [displayLastUpdated, setDisplayLastUpdated] = useState(lastUpdatedProp || "Today, 05:45 PM");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pageName || lastUpdatedProp) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const components = await componentContentApi.getByPage(pageName);
        if (components && components.length > 0) {
          const now = new Date();
          const formatted = now.toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            hour: "2-digit", 
            minute: "2-digit" 
          });
          setDisplayLastUpdated(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch live preview stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [pageName, lastUpdatedProp]);

  return (
    <div className="rounded-4xl border border-slate-200/80 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.08)] overflow-hidden">
    

      <div className="relative ">
      
        <div className="relative grid gap-6 overflow-hidden rounded-4xl">
    
          <div >
            <div className="overflow-hidden rounded-3xl ">
              <iframe
                src={iframeSrc}
                title="Live site preview"
                className="h-80 w-full border-0 bg-slate-950"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Last Updated</p>
          <div className="flex items-center gap-2">
            {loading && <Loader2 size={12} className="animate-spin text-slate-400" />}
            <p className="text-sm font-semibold text-slate-700">{displayLastUpdated}</p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Published By</p>
          <p className="text-sm font-semibold text-slate-700">{user?.name || publishedByProp || "Super Admin"}</p>
        </div>
        <a
          href={actionLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-orange-500"
        >
          View Full Site
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
