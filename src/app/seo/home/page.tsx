// Using relative path to resolve ts(2307) error and ensure the module is found

import SEOEditor from "@/components/common/SEOEditor";

export default function HomeSEOPage() {
  return <SEOEditor slug="home" title="Home Page SEO Settings" />;
}