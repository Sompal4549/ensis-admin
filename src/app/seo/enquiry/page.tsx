// Using relative path to resolve ts(2307) error and ensure the module is found
import SEOEditor from "@/components/common/SEOEditor";

export default function EnquirySEOPage() {
  return <SEOEditor slug="enquiry" pageName="enquiry" title="Enquiry Page SEO Settings" />;
}