"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  LayoutGrid,
  Image as ImageIcon,
  Building2,
  MessageSquare,
  MessageCircle,
  Globe,
  Clock,
} from "lucide-react";
import pink from "@/assets/lightpink.webp";
import blue from "@/assets/blue_wave.webp";
import orange from "@/assets/orange.webp";
import purple from "@/assets/purple.webp";
import green from "@/assets/green.webp";
import { componentContentApi, productApi, type ComponentContent, type Product } from "@/lib/api";

type StatsData = {
  card1: { title: string; count: number; subText: string; icon: React.ReactNode; bg: string; colorClass: string; bgClass: string };
  card2: { title: string; count: number; subText: string; icon: React.ReactNode; bg: string; colorClass: string; bgClass: string };
  card3: { title: string; count: number; subText: string; icon: React.ReactNode; bg: string; colorClass: string; bgClass: string };
  card4: { title: string; count: number; subText: string; icon: React.ReactNode; bg: string; colorClass: string; bgClass: string };
  card5: { title: string; count: number | string; subText: string; icon: React.ReactNode; bg: string; colorClass: string; bgClass: string };
};

export default function PageStatsCards({ pageName }: { pageName: string }) {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      if (pageName === "dashboard") {
        // Fetch dashboard global stats
        try {
          const [productsRes, components] = await Promise.all([
            productApi.list().catch(() => ({ products: [] as Product[] })),
            componentContentApi.list().catch(() => [] as ComponentContent[]),
          ]);
          if (!isMounted) return;
          const pagesCount = new Set(components.map(c => c.page)).size;
          const activeComponents = components.filter(c => c.isActive).length;
          const activeSliders = components.filter(c => c.key.includes("hero") && c.isActive).length;
          
          setStats({
            card1: {
              title: "Total Pages",
              count: pagesCount,
              subText: `Published ${pagesCount}`, // Simple approximation
              icon: <FileText size={24} />,
              bg: blue.src,
              colorClass: "text-blue-600",
              bgClass: "bg-blue-100",
            },
            card2: {
              title: "Total Sections",
              count: components.length,
              subText: `Active ${activeComponents}`,
              icon: <LayoutGrid size={24} />,
              bg: orange.src,
              colorClass: "text-amber-600",
              bgClass: "bg-amber-50",
            },
            card3: {
              title: "Sliders / Banners",
              count: components.filter(c => c.key.includes("hero")).length,
              subText: `Active ${activeSliders}`,
              icon: <ImageIcon size={24} />,
              bg: purple.src,
              colorClass: "text-purple-600",
              bgClass: "bg-purple-50",
            },
            card4: {
              title: "Projects",
              count: productsRes.products.length,
              subText: `Published ${productsRes.products.filter(p => p.isActive !== false).length}`,
              icon: <Building2 size={24} />,
              bg: green.src,
              colorClass: "text-emerald-600",
              bgClass: "bg-emerald-50",
            },
            card5: {
              title: "Inquiries",
              count: 186, // hardcoded for dashboard mockup as per original
              subText: "↑ 18% This Month",
              icon: <MessageSquare size={24} />,
              bg: pink.src,
              colorClass: "text-pink-600",
              bgClass: "bg-pink-50",
            },
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fetch page-specific stats
        try {
          // The API expects 'home' or 'about'
          const components = await componentContentApi.getByPage(pageName);
          if (!isMounted) return;

          let slidesCount = 0;
          let testimonialsCount = 0;
          const activeCount = components.filter(c => c.isActive).length;

          // Find Hero
          const hero = components.find(c => c.key === `${pageName}.hero`);
          if (hero && hero.data && Array.isArray(hero.data.slides)) {
            slidesCount = hero.data.slides.length;
          } else if (hero && hero.data && Array.isArray(hero.data.images)) {
             slidesCount = hero.data.images.length;
          }

          // Find Testimonials
          const tests = components.find(c => c.key === `${pageName}.testimonials`);
          if (tests && tests.data && Array.isArray(tests.data.testimonials)) {
            testimonialsCount = tests.data.testimonials.length;
          } else if (tests && tests.data && Array.isArray(tests.data.items)) {
             testimonialsCount = tests.data.items.length;
          }

          // Last updated
          let lastUpdated = "Never";
          if (components.length > 0) {
            // we'll approximate with current date or latest created (mocking for now as we don't have updatedAt)
            lastUpdated = new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          }

          setStats({
            card1: {
              title: "Hero Slides",
              count: slidesCount,
              subText: `Active ${slidesCount}`,
              icon: <ImageIcon size={24} />,
              bg: blue.src,
              colorClass: "text-blue-600",
              bgClass: "bg-blue-100",
            },
            card2: {
              title: "Sections",
              count: components.length,
              subText: `Visible ${activeCount}`,
              icon: <LayoutGrid size={24} />,
              bg: orange.src,
              colorClass: "text-amber-600",
              bgClass: "bg-amber-50",
            },
            card3: {
              title: "Testimonials",
              count: testimonialsCount,
              subText: `Published ${testimonialsCount}`,
              icon: <MessageCircle size={24} />,
              bg: purple.src,
              colorClass: "text-purple-600",
              bgClass: "bg-purple-50",
            },
            card4: {
              title: "Published Content",
              count: activeCount,
              subText: "Live on Website",
              icon: <Globe size={24} />,
              bg: green.src,
              colorClass: "text-emerald-600",
              bgClass: "bg-emerald-50",
            },
            card5: {
              title: "Last Updated",
              count: lastUpdated,
              subText: "By Admin",
              icon: <Clock size={24} />,
              bg: pink.src,
              colorClass: "text-pink-600",
              bgClass: "bg-pink-50",
            },
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, [pageName]);

  if (!stats) return null; // or a skeleton loader

  return (
    <div className="grid shrink-0 grid-cols-1 md:grid-cols-5 gap-3">
      {Object.values(stats).map((card, idx) => (
        <div key={idx} className="px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm flex justify-between h-full bg-center bg-cover bg-no-repeat bg-white" style={{ backgroundImage: `url(${card.bg})` }}>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{card.title}</span>
            <p className="text-xl font-bold leading-tight text-slate-800">{card.count}</p>
            <span className={`text-[9px] font-semibold leading-none ${card.colorClass}`}>{card.subText}</span>
          </div>
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full mt-2 ${card.bgClass} ${card.colorClass}`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
