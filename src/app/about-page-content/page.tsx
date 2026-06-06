import LivePreviewIframe from "@/components/common/LivePreviewIframe";
import PageStatsCards from "@/components/common/PageStatsCards";

  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL

export default function AboutPageContentRedirect() {
 return (
  <>
  <main className="min-h-screen bg-[#f6f1e8] text-[#1f261b]">
    <div className="mb-6">
            <PageStatsCards pageName="about" />
          </div>
          <LivePreviewIframe 
            iframeSrc={`${frontendUrl}/about`} 
            ctaHref={`${frontendUrl}/about`}
            pageName="about"
          />
          </main>
  </>
 )
}