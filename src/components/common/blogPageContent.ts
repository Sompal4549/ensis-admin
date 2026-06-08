import { ComponentContent } from "@/lib/api";

export type BlogPageContentKeys =
  | "blog.hero"
  | "blog.featuredArticles"
  | "blog.voiceOfExperts"
  | "blog.allBlogs"
  | "blog.mediaResources"
  | "blog.stayInspired"
  | "blog.supportWellness";

export const blogPageKeys: { key: BlogPageContentKeys; label: string; description: string }[] = [
  { key: "blog.hero", label: "Blog Hero", description: "Main banner for the blog page." },
  { key: "blog.featuredArticles", label: "Featured Articles", description: "Top picks for readers." },
  { key: "blog.voiceOfExperts", label: "Voice of Experts", description: "Expert insights and designations." },
  { key: "blog.allBlogs", label: "All Blogs & Categories", description: "Category management and blog list." },
  { key: "blog.mediaResources", label: "Media & Resources", description: "Blogs media list and report resources." },
  { key: "blog.stayInspired", label: "Stay Inspired", description: "Subscription CTA section." },
  { key: "blog.supportWellness", label: "Support Wellness", description: "Final footer CTA with icon and buttons." },
];

export const defaultBlogData: Record<BlogPageContentKeys, any> = {
  "blog.hero": {
    title: "", heading: "", description: "", bgImage: ""
  },
  "blog.featuredArticles": {
    articles: [{ id: "1", image: "", title: "", readMoreLink: "" }]
  },
  "blog.voiceOfExperts": {
    experts: [{ id: "1", image: "", description: "", name: "", designation: "" }]
  },
  "blog.allBlogs": {
    categories: [""],
    blogs: [{ id: "1", image: "", title: "", description: "", date: "", link: "" }]
  },
  "blog.mediaResources": {
    blogsMedia: [{ id: "1", title: "", description: "", link: "", image: "" }],
    reportResource: { title: "", description: "", link: "", image: "" }
  },
  "blog.stayInspired": {
    title: "", description: "", subscribeLink: ""
  },
  "blog.supportWellness": {
    iconImage: "", title: "", description: "", primaryButton: { label: "", href: "" }, bgImage: ""
  }
};

export const buildEmptyBlogContent = (key: BlogPageContentKeys): Omit<ComponentContent, "_id"> & { key: BlogPageContentKeys } => {
  const data = JSON.parse(JSON.stringify(defaultBlogData[key]));
  
  const randomId = () => Math.random().toString(36).slice(2, 9);
  
  // Initialize IDs for list items
  if (data.articles) data.articles = data.articles.map((a: any) => ({ ...a, id: randomId() }));
  if (data.experts) data.experts = data.experts.map((e: any) => ({ ...e, id: randomId() }));
  if (data.blogs) data.blogs = data.blogs.map((b: any) => ({ ...b, id: randomId() }));
  if (data.blogsMedia) data.blogsMedia = data.blogsMedia.map((m: any) => ({ ...m, id: randomId() }));

  const keyInfo = blogPageKeys.find(k => k.key === key);

  return {
    key,
    label: keyInfo?.label || "",
    page: "blog",
    description: keyInfo?.description || "",
    isActive: true,
    data,
  };
};