"use client"; // This page is already a client component, so Suspense is not strictly needed here for useSearchParams, but it's good practice if HomepageComponentRouteEditor is a server component or has async operations.

import HomepageComponentRouteEditor from "@/components/homepage-content/HomepageComponentRouteEditor";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function HeroPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#8d6a3a]" size={40} /></div>}>
      <HomepageComponentRouteEditor componentKey="home.hero" title="Home Hero" />
    </Suspense>
  );
}
