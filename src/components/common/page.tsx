"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PageStatsCards from "@/components/common/PageStatsCards";
import TurnkeyPageManager from "@/components/common/TurnkeyPageManager";

export default function TurnkeyPageContentPage() {
  return (
    <main className="min-h-screen bg-[#fcfaf7] p-8">
      <div className="mb-8">
        <PageStatsCards pageName="dashboard" />
      </div>
      <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#8d6a3a]" size={40} /></div>}>
        <TurnkeyPageManager />
      </Suspense>
    </main>
  );
}