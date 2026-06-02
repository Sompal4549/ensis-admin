// Using relative path to resolve ts(2307) error and ensure the module is found
import SEOEditor from "@/components/common/SEOEditor";

export default function BlogSEOPage() {
  return <SEOEditor slug="blog" title="Blog Page SEO Settings" />;
}