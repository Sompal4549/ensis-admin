"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Plus, Send, Save, FileText, Users, Globe, Search, Edit2, Trash2, FileImage, BookOpen, Mail, LayoutTemplate } from "lucide-react";
import { api } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from '@/components/common/RichTextEditor';
interface Blog extends Partial<BlogForm> {
  _id?: string;
  id?: string;
}
interface SocialLink {
  iconImage: string;
  title: string;
  link: string;
}

interface FollowLink {
  image: string;
  path: string;
}
interface BlogForm {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  author: string;
  isFeatured: boolean;
  isActive?: boolean;
  viewCount?: number;

  banner: {
    title: string;
    highlight: string;
    date: string;
    readingTime: string;
    category: string;
    backgroundImage: string;
    backgroundImageAlt: string;
  };

  blogImage: {
    image: string;
    alt: string;
  };

  article: {
    content: string;
  };

  aboutTheAuthor: {
    title: string;
    name: string;
    description: string;
    socialLinks: SocialLink[];
  };

  onThisPage: {
    title: string;
  };

  downloadMedia: {
    title: string;
    image: string;
    description: string;
    link: string;
  };

  newsletter: {
    lotusImage: {
      image: string;
      alt: string;
    };
    title: string;
    description: string;
    followText: string;
    followLinks: FollowLink[];
  };

  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    h1: string;
    canonical: string;
    ogJson: string;
    schema: string;
  };

  robots: string;
}

interface Subscriber {
  _id: string;
  email: string;
  createdAt?: string;
}

type FormTab = "basic" | "banner" | "newsletter" | "seo";

const TABS: { key: FormTab; label: string; icon: React.ReactNode }[] = [
  { key: "basic", label: "Basic Info", icon: <FileText size={14} /> },
  { key: "banner", label: "Banner", icon: <LayoutTemplate size={14} /> },
  // { key: "article",    label: "Article",      icon: <BookOpen size={14} /> },
  { key: "newsletter", label: "Newsletter", icon: <Mail size={14} /> },
  { key: "seo", label: "SEO", icon: <Globe size={14} /> },
];
const emptyBlogForm = (): BlogForm => ({
  title: "",
  slug: "",
  author: "",
  isFeatured: false,

  banner: {
    title: "",
    highlight: "",
    date: "",
    readingTime: "",
    category: "",
    backgroundImage: "",
    backgroundImageAlt: "",
  },

  blogImage: {
    image: "",
    alt: "",
  },

  article: {
    content: "",
  },

  aboutTheAuthor: {
    title: "",
    name: "",
    description: "",
    socialLinks: [],
  },

  onThisPage: {
    title: "",
  },

  downloadMedia: {
    title: "",
    image: "",
    description: "",
    link: "",
  },

  newsletter: {
    lotusImage: {
      image: "",
      alt: "",
    },
    title: "",
    description: "",
    followText: "",
    followLinks: [],
  },

  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    h1: "",
    canonical: "",
    ogJson: "",
    schema: "",
  },

  robots: "index, follow",
});

const randomId = () => Math.random().toString(36).slice(2, 9);

const BlogsManagement = () => {
  const [loading, setLoading] = useState(false);
const [blogs, setBlogs] = useState<Blog[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FormTab>("basic");
  const [blogForm, setBlogForm] = useState(emptyBlogForm());

  const [sendForm, setSendForm] = useState({ blogId: '', emails: '' });

  const calculateReadingTime = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ');
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.ceil(wordCount / 200);
  };
const readingTime = `${calculateReadingTime(
  blogForm.article?.content || ""
)} min read`;
  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const [blogsRes, subRes] = await Promise.all([
        api.get('/blogs'),
        api.get('/newsletter')
      ]);
      setBlogs(blogsRes.data?.data || []);
      setSubscribers(subRes.data?.data || []);
    } catch (error: any) {
  console.error(error);
  toast.error("Failed to fetch data");
}
  };


const handleCreateBlog = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);

  try {
    const payload = {
      title: blogForm.title,
      slug:
        blogForm.slug ||
        blogForm.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, ""),
      author: blogForm.author,
      isFeatured: blogForm.isFeatured,
      banner: {...blogForm.banner, readingTime},
      blogImage: blogForm.blogImage,
      article: blogForm.article,
      aboutTheAuthor: blogForm.aboutTheAuthor,
      onThisPage: blogForm.onThisPage,
      downloadMedia: blogForm.downloadMedia,
      newsletter: blogForm.newsletter,
      seo: blogForm.seo,
      robots: blogForm.robots,
    };

    if (editingBlogId) {
      await api.put(`/blogs/${editingBlogId}`, payload);
      toast.success("Blog updated successfully!");
    } else {
      await api.post("/blogs", payload);
      toast.success("Blog created successfully!");
    }

    setBlogForm(emptyBlogForm());
    setEditingBlogId(null);
    setActiveTab("basic");
    fetchInitialData();
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};
  const handleEditBlog = (blog: any) => {
  setEditingBlogId(blog._id ?? blog.id ?? null);

  setBlogForm({
  title: blog.title || "",
  slug: blog.slug || "",
  author: blog.author || "",
  isFeatured: blog.isFeatured || false,

  banner: blog.banner || emptyBlogForm().banner,
  blogImage: blog.blogImage || emptyBlogForm().blogImage,
  article: blog.article || emptyBlogForm().article,
  aboutTheAuthor:
    blog.aboutTheAuthor || emptyBlogForm().aboutTheAuthor,
  onThisPage:
    blog.onThisPage || emptyBlogForm().onThisPage,
  downloadMedia:
    blog.downloadMedia || emptyBlogForm().downloadMedia,
  newsletter:
    blog.newsletter || emptyBlogForm().newsletter,

  seo: blog.seo || emptyBlogForm().seo,
  robots: blog.robots || "index, follow",
});
    setActiveTab("basic");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendToNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const manualEmails = sendForm.emails.split(',').map(email => email.trim()).filter(Boolean);
    const allEmails = Array.from(new Set([...selectedEmails, ...manualEmails]));
    if (!sendForm.blogId || allEmails.length === 0) {
      toast.error("Please select a blog and provide email addresses");
      return;
    }
    setLoading(true);
    try {
      await api.post('/newsletter/send-blog', { blogId: sendForm.blogId, emails: allEmails });
      toast.success("Blog newsletter sent successfully!");
      setSendForm({ blogId: '', emails: '' });
      setSelectedEmails([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send newsletter");
    } finally {
      setLoading(false);
    }
  };

  // ─── helpers ────────────────────────────────────────────────────────────────
  // const setArticle = (patch: Partial<typeof blogForm.article>) =>
  //   setBlogForm(f => ({ ...f, article: { ...f.article, ...patch } }));

  // const setArticleSection = (key: 'whatIsPanchakarma' | 'modernLife' | 'rightSpace' | 'ensisApproach' | 'conclusion', patch: { heading?: string; content?: string }) =>
  //   setArticle({ [key]: { ...blogForm.article[key], ...patch } });

  // ─── tab panels ─────────────────────────────────────────────────────────────

const renderBasicTab = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className={labelClass}>
        Title
        <input
          className={fieldClass}
          value={blogForm.title}
          onChange={(e) => {
            const value = e.target.value;
            setBlogForm({
              ...blogForm,
              title: value,
              slug: value
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]+/g, ""),
            });
          }}
        />
      </label>

      <label className={labelClass}>
        Author
        <input
          className={fieldClass}
          value={blogForm.author}
          onChange={(e) =>
            setBlogForm({
              ...blogForm,
              author: e.target.value,
            })
          }
        />
      </label>
    </div>

    <label className={labelClass}>
      Slug
      <input
        className={fieldClass}
        value={blogForm.slug}
        onChange={(e) =>
          setBlogForm({
            ...blogForm,
            slug: e.target.value,
          })
        }
      />
    </label>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ImageUploadField
        label="Blog Image"
       value={blogForm.blogImage?.image || ""}
        fieldKey="blog.image"
        uploadingField={uploadingField}
        onUploadingChange={setUploadingField}
        onUpload={(url) =>
          setBlogForm({
            ...blogForm,
            blogImage: {
              ...blogForm.blogImage,
              image: url,
            },
          })
        }
        onError={(m) => toast.error(m)}
      />

      <label className={labelClass}>
        Blog Image Alt
        <input
          className={fieldClass}
          value={blogForm.blogImage.alt}
          onChange={(e) =>
            setBlogForm({
              ...blogForm,
              blogImage: {
                ...blogForm.blogImage,
                alt: e.target.value,
              },
            })
          }
        />
      </label>
    </div>

    <div className="space-y-1">
      <label className={labelClass}>Article Content</label>

      <RichTextEditor
       value={blogForm.article?.content || ""}
        onChange={(value) =>
          setBlogForm({
            ...blogForm,
            article: {
              ...blogForm.article,
              content: value,
            },
          })
        }
        placeholder="Enter blog content..."
        minHeight="300px"
      />
    </div>

    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
      <input
        type="checkbox"
        id="featured"
        checked={blogForm.isFeatured}
        onChange={(e) =>
          setBlogForm({
            ...blogForm,
            isFeatured: e.target.checked,
          })
        }
      />

      <label htmlFor="featured" className="cursor-pointer">
        Featured Blog
      </label>
    </div>
  </div>
);

const renderBannerTab = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className={labelClass}>
        Banner Title
        <input
          className={fieldClass}
          value={blogForm.banner?.title || ""}
          onChange={(e) =>
            setBlogForm({
              ...blogForm,
              banner: {
                ...blogForm.banner,
                title: e.target.value,
              },
            })
          }
        />
      </label>

      <label className={labelClass}>
        Highlight Text
        <input
          className={fieldClass}
          value={blogForm.banner.highlight}
          onChange={(e) =>
            setBlogForm({
              ...blogForm,
              banner: {
                ...blogForm.banner,
                highlight: e.target.value,
              },
            })
          }
        />
      </label>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className={labelClass}>
        Date
        <input
          type="date"
          className={fieldClass}
          value={blogForm.banner.date}
          onChange={(e) =>
            setBlogForm({
              ...blogForm,
              banner: {
                ...blogForm.banner,
                date: e.target.value,
              },
            })
          }
        />
      </label>

      <label className={labelClass}>
        Reading Time
        <input
          className={fieldClass}
          placeholder="5 min read"
          value={blogForm.banner.readingTime}
          onChange={(e) =>
            setBlogForm({
              ...blogForm,
              banner: {
                ...blogForm.banner,
                readingTime: e.target.value,
              },
            })
          }
        />
      </label>

      <label className={labelClass}>
        Category
        <input
          className={fieldClass}
          value={blogForm.banner.category}
          onChange={(e) =>
            setBlogForm({
              ...blogForm,
              banner: {
                ...blogForm.banner,
                category: e.target.value,
              },
            })
          }
        />
      </label>
    </div>

    <ImageUploadField
      label="Banner Background Image"
      value={blogForm.banner.backgroundImage}
      fieldKey="blog.banner"
      uploadingField={uploadingField}
      onUploadingChange={setUploadingField}
      onUpload={(url) =>
        setBlogForm({
          ...blogForm,
          banner: {
            ...blogForm.banner,
            backgroundImage: url,
          },
        })
      }
      onError={(m) => toast.error(m)}
    />

    <label className={labelClass}>
      Background Image Alt
      <input
        className={fieldClass}
        value={blogForm.banner.backgroundImageAlt}
        onChange={(e) =>
          setBlogForm({
            ...blogForm,
            banner: {
              ...blogForm.banner,
              backgroundImageAlt: e.target.value,
            },
          })
        }
      />
    </label>
  </div>
);

  // const renderArticleTab = () => {
  //   const art = blogForm.article;
  //   const SECTIONS = ['whatIsPanchakarma', 'modernLife', 'rightSpace', 'ensisApproach', 'conclusion'] as const;
  //   return (
  //     <div className="space-y-5">
  //       {/* Hero */}
  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //         <ImageUploadField label="Hero Image" value={art.heroImage} fieldKey="blog.article.hero" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setArticle({ heroImage: url })} onError={m => toast.error(m)} />
  //         <label className={labelClass}>Hero Alt Text <input className={fieldClass} value={art.heroAlt} onChange={e => setArticle({ heroAlt: e.target.value })} /></label>
  //       </div>

  //       {/* Intro */}
  //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  //         <label className={labelClass}>Intro Before <input className={fieldClass} value={art.introBefore} onChange={e => setArticle({ introBefore: e.target.value })} /></label>
  //         <label className={labelClass}>Intro Highlight <input className={fieldClass} value={art.introHighlight} onChange={e => setArticle({ introHighlight: e.target.value })} /></label>
  //         <label className={labelClass}>Intro After <input className={fieldClass} value={art.introAfter} onChange={e => setArticle({ introAfter: e.target.value })} /></label>
  //       </div>

  //       {/* Article Sections */}
  //       {SECTIONS.map(key => (
  //         <div key={key} className="p-4 border rounded-xl bg-slate-50 space-y-3">
  //           <h4 className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider">{key}</h4>
  //           <label className={labelClass}>Heading <input className={fieldClass} value={art[key].heading} onChange={e => setArticleSection(key, { heading: e.target.value })} /></label>
  //           <div className="space-y-1">
  //             <label className={labelClass}>Content</label>
  //             <RichTextEditor value={art[key].content} onChange={val => setArticleSection(key, { content: val })} minHeight="100px" />
  //           </div>
  //         </div>
  //       ))}

  //       {/* Benefits */}
  //       <div className="space-y-2">
  //         <div className="flex justify-between items-center">
  //           <span className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider">Benefits</span>
  //           <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setArticle({ benefits: [...art.benefits, { title: '', description: '' }] })}>+ Add</button>
  //         </div>
  //         <label className={labelClass}>Benefits Heading <input className={fieldClass} value={art.benefitsHeading} onChange={e => setArticle({ benefitsHeading: e.target.value })} /></label>
  //         {art.benefits.map((b, idx) => (
  //           <div key={idx} className="grid grid-cols-2 gap-3 p-3 border rounded-xl bg-white relative">
  //             <button type="button" onClick={() => setArticle({ benefits: art.benefits.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-400"><Trash2 size={14} /></button>
  //             <input className={fieldClass} placeholder="Title" value={b.title} onChange={e => { const nb = [...art.benefits]; nb[idx] = { ...nb[idx], title: e.target.value }; setArticle({ benefits: nb }); }} />
  //             <input className={fieldClass} placeholder="Description" value={b.description} onChange={e => { const nb = [...art.benefits]; nb[idx] = { ...nb[idx], description: e.target.value }; setArticle({ benefits: nb }); }} />
  //           </div>
  //         ))}
  //       </div>

  //       {/* Therapies */}
  //       <div className="space-y-2">
  //         <div className="flex justify-between items-center">
  //           <span className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider">Therapies</span>
  //           <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setArticle({ therapies: [...art.therapies, { title: '', description: '', image: '' }] })}>+ Add</button>
  //         </div>
  //         {art.therapies.map((t, idx) => (
  //           <div key={idx} className="p-3 border rounded-xl bg-white space-y-2 relative">
  //             <button type="button" onClick={() => setArticle({ therapies: art.therapies.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-400"><Trash2 size={14} /></button>
  //             <div className="grid grid-cols-2 gap-3">
  //               <input className={fieldClass} placeholder="Title" value={t.title} onChange={e => { const nt = [...art.therapies]; nt[idx] = { ...nt[idx], title: e.target.value }; setArticle({ therapies: nt }); }} />
  //               <input className={fieldClass} placeholder="Description" value={t.description} onChange={e => { const nt = [...art.therapies]; nt[idx] = { ...nt[idx], description: e.target.value }; setArticle({ therapies: nt }); }} />
  //             </div>
  //             <ImageUploadField label="Therapy Image" value={t.image} fieldKey={`therapy.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => { const nt = [...art.therapies]; nt[idx] = { ...nt[idx], image: url }; setArticle({ therapies: nt }); }} onError={m => toast.error(m)} />
  //           </div>
  //         ))}
  //       </div>

  //       {/* TOC */}
  //       <div className="space-y-2">
  //         <div className="flex justify-between items-center">
  //           <span className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider">Table of Contents</span>
  //           <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setArticle({ toc: [...art.toc, { label: '', anchor: '' }] })}>+ Add</button>
  //         </div>
  //         {art.toc.map((t, idx) => (
  //           <div key={idx} className="grid grid-cols-2 gap-3 p-3 border rounded-xl bg-white relative">
  //             <button type="button" onClick={() => setArticle({ toc: art.toc.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-400"><Trash2 size={14} /></button>
  //             <input className={fieldClass} placeholder="Label" value={t.label} onChange={e => { const nt = [...art.toc]; nt[idx] = { ...nt[idx], label: e.target.value }; setArticle({ toc: nt }); }} />
  //             <input className={fieldClass} placeholder="#anchor" value={t.anchor} onChange={e => { const nt = [...art.toc]; nt[idx] = { ...nt[idx], anchor: e.target.value }; setArticle({ toc: nt }); }} />
  //           </div>
  //         ))}
  //       </div>

  //       {/* Guide CTA */}
  //       <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
  //         <h4 className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider">Guide CTA</h4>
  //         <div className="grid grid-cols-2 gap-3">
  //           <input className={fieldClass} placeholder="Heading" value={art.guide.heading} onChange={e => setArticle({ guide: { ...art.guide, heading: e.target.value } })} />
  //           <input className={fieldClass} placeholder="Button Label" value={art.guide.buttonLabel} onChange={e => setArticle({ guide: { ...art.guide, buttonLabel: e.target.value } })} />
  //           <input className={fieldClass} placeholder="Description" value={art.guide.description} onChange={e => setArticle({ guide: { ...art.guide, description: e.target.value } })} />
  //           <input className={fieldClass} placeholder="Href" value={art.guide.href} onChange={e => setArticle({ guide: { ...art.guide, href: e.target.value } })} />
  //         </div>
  //       </div>

  //       {/* Related Articles */}
  //       <div className="space-y-2">
  //         <div className="flex justify-between items-center">
  //           <span className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider">Related Articles</span>
  //           <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setArticle({ relatedArticles: [...art.relatedArticles, { title: '', image: '', href: '', category: '' }] })}>+ Add</button>
  //         </div>
  //         {art.relatedArticles.map((r, idx) => (
  //           <div key={idx} className="p-3 border rounded-xl bg-white space-y-2 relative">
  //             <button type="button" onClick={() => setArticle({ relatedArticles: art.relatedArticles.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-400"><Trash2 size={14} /></button>
  //             <div className="grid grid-cols-3 gap-3">
  //               <input className={fieldClass} placeholder="Title" value={r.title} onChange={e => { const nr = [...art.relatedArticles]; nr[idx] = { ...nr[idx], title: e.target.value }; setArticle({ relatedArticles: nr }); }} />
  //               <input className={fieldClass} placeholder="Category" value={r.category} onChange={e => { const nr = [...art.relatedArticles]; nr[idx] = { ...nr[idx], category: e.target.value }; setArticle({ relatedArticles: nr }); }} />
  //               <input className={fieldClass} placeholder="Href" value={r.href} onChange={e => { const nr = [...art.relatedArticles]; nr[idx] = { ...nr[idx], href: e.target.value }; setArticle({ relatedArticles: nr }); }} />
  //             </div>
  //             <ImageUploadField label="Article Image" value={r.image} fieldKey={`related.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => { const nr = [...art.relatedArticles]; nr[idx] = { ...nr[idx], image: url }; setArticle({ relatedArticles: nr }); }} onError={m => toast.error(m)} />
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  const renderNewsletterTab = () => {
    const nl = blogForm.newsletter;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUploadField label="Lotus Image" value={nl.lotusImage.image} fieldKey="blog.newsletter.lotus" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setBlogForm({ ...blogForm, newsletter: { ...nl, lotusImage: { ...nl.lotusImage, image: url } } })} onError={m => toast.error(m)} />
          <label className={labelClass}>Lotus Alt <input className={fieldClass} value={nl.lotusImage.alt} onChange={e => setBlogForm({ ...blogForm, newsletter: { ...nl, lotusImage: { ...nl.lotusImage, alt: e.target.value } } })} /></label>
        </div>
        <label className={labelClass}>Title <input className={fieldClass} value={nl.title} onChange={e => setBlogForm({ ...blogForm, newsletter: { ...nl, title: e.target.value } })} /></label>
        <label className={labelClass}>Description <textarea className={`${fieldClass} h-20`} value={nl.description} onChange={e => setBlogForm({ ...blogForm, newsletter: { ...nl, description: e.target.value } })} /></label>
        <label className={labelClass}>Follow Text <input className={fieldClass} value={nl.followText} onChange={e => setBlogForm({ ...blogForm, newsletter: { ...nl, followText: e.target.value } })} /></label>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider">Follow Links</span>
            <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setBlogForm({ ...blogForm, newsletter: { ...nl, followLinks: [...nl.followLinks, { image: '', path: '' }] } })}>+ Add</button>
          </div>
          {nl.followLinks.map((link, idx) => (
            <div key={idx} className="p-3 border rounded-xl bg-white space-y-2 relative">
              <button type="button" onClick={() => setBlogForm({ ...blogForm, newsletter: { ...nl, followLinks: nl.followLinks.filter((_, i) => i !== idx) } })} className="absolute top-2 right-2 text-red-400"><Trash2 size={14} /></button>
              <input className={fieldClass} placeholder="Path / URL" value={link.path} onChange={e => { const nl2 = [...nl.followLinks]; nl2[idx] = { ...nl2[idx], path: e.target.value }; setBlogForm({ ...blogForm, newsletter: { ...nl, followLinks: nl2 } }); }} />
              <ImageUploadField label="Icon Image" value={link.image} fieldKey={`follow.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => { const nl2 = [...nl.followLinks]; nl2[idx] = { ...nl2[idx], image: url }; setBlogForm({ ...blogForm, newsletter: { ...nl, followLinks: nl2 } }); }} onError={m => toast.error(m)} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSeoTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[#8d6a3a]">
        <Globe size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">SEO & Meta Tags</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className={labelClass}>Meta Title <input className={fieldClass} value={blogForm.seo.metaTitle||""} onChange={e => setBlogForm({ ...blogForm, seo: { ...blogForm.seo, metaTitle: e.target.value } })} /></label>
        <label className={labelClass}>Meta Keywords <input className={fieldClass} value={blogForm.seo.metaKeywords} onChange={e => setBlogForm({ ...blogForm, seo: { ...blogForm.seo, metaKeywords: e.target.value } })} /></label>
      </div>
      <label className={labelClass}>Meta Description <textarea className={`${fieldClass} h-20`} value={blogForm.seo.metaDescription} onChange={e => setBlogForm({ ...blogForm, seo: { ...blogForm.seo, metaDescription: e.target.value } })} /></label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className={labelClass}>Canonical URL <input className={fieldClass} value={blogForm.seo.canonical} onChange={e => setBlogForm({ ...blogForm, seo: { ...blogForm.seo, canonical: e.target.value } })} /></label>
        <label className={labelClass}>Robots
          <select className={fieldClass} value={blogForm.robots} onChange={e => setBlogForm({ ...blogForm, robots: e.target.value })}>
            <option value="index, follow">index, follow</option>
            <option value="noindex, nofollow">noindex, nofollow</option>
          </select>
        </label>
      </div>
      <div className="flex items-center gap-2 text-[#8d6a3a] pt-2">
        <Search size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Social Sharing (Open Graph)</h3>
      </div>
<label className={labelClass}>
  H1
  <input
    className={fieldClass}
    value={blogForm.seo.h1}
    onChange={(e) =>
      setBlogForm({
        ...blogForm,
        seo: {
          ...blogForm.seo,
          h1: e.target.value,
        },
      })
    }
  />
</label>

<label className={labelClass}>
  OG Json
  <textarea
    className={`${fieldClass} h-32`}
    value={blogForm.seo.ogJson}
    onChange={(e) =>
      setBlogForm({
        ...blogForm,
        seo: {
          ...blogForm.seo,
          ogJson: e.target.value,
        },
      })
    }
  />
</label>

<label className={labelClass}>
  Schema Json
  <textarea
    className={`${fieldClass} h-32`}
    value={blogForm.seo.schema}
    onChange={(e) =>
      setBlogForm({
        ...blogForm,
        seo: {
          ...blogForm.seo,
          schema: e.target.value,
        },
      })
    }
  />
</label>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* ── CREATE / EDIT FORM ── */}
        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="text-blue-600" size={20} />
              <h2 className="text-lg font-bold">{editingBlogId ? "Edit Blog" : "Create New Blog"}</h2>
            </div>
            {editingBlogId && (
              <button type="button" onClick={() => { setEditingBlogId(null); setBlogForm(emptyBlogForm()); setActiveTab("basic"); }} className="text-xs  hover: font-medium">
                Cancel Edit
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key
                  ? "border-[#8d6a3a] text-[#8d6a3a]"
                  : "border-transparent  hover:"
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateBlog} className="p-6">
            {activeTab === "basic" && renderBasicTab()}
            {activeTab === "banner" && renderBannerTab()}
            {/* {activeTab === "article" && renderArticleTab()} */}
            {activeTab === "newsletter" && renderNewsletterTab()}
            {activeTab === "seo" && renderSeoTab()}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {editingBlogId ? 'Update Blog' : 'Create Blog'}
            </button>
          </form>
        </section>

        {/* ── EXISTING BLOGS ── */}
        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold">Existing Blogs</h2>
          </div>
          <div className="p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b  text-xs uppercase font-bold">
                  <th className="pb-3 px-4">Title</th>
                  <th className="pb-3 px-4">Author</th>
                  <th className="pb-3 px-4">Read Time</th>
                  <th className="pb-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {blogs.map(blog => (
                  <tr key={blog._id} className={`hover:bg-slate-50 transition-colors ${editingBlogId === (blog._id || blog.id) ? 'bg-blue-50' : ''}`}>
                    <td className="py-3 px-4 text-sm font-medium "><div className="line-clamp-1">{blog.title}</div></td>
                    <td className="py-3 px-4 text-sm ">{blog.author}</td>
                  <td>{blog.banner?.readingTime || "0 min"}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleEditBlog(blog)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Blog">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── NEWSLETTER + SUBSCRIBERS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center gap-2">
            <Send className="text-emerald-600" size={20} />
            <h2 className="text-lg font-bold">Send Newsletter</h2>
          </div>
          <form onSubmit={handleSendToNewsletter} className="p-6 space-y-4">
            <label className={labelClass}>Select Blog to Send
              <select className={fieldClass} required value={sendForm.blogId} onChange={e => setSendForm({ ...sendForm, blogId: e.target.value })}>
                <option value="">Select a blog...</option>
                {blogs.map(blog => <option key={blog._id} value={blog._id}>{blog.title}</option>)}
              </select>
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Select Recipients</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setSelectedEmails(subscribers.map(s => s.email))} className="text-[9px] font-bold text-blue-600 uppercase hover:underline">Select All</button>
                  <button type="button" onClick={() => setSelectedEmails([])} className="text-[9px] font-bold  uppercase hover:underline">Clear</button>
                </div>
              </div>
              <div className="border rounded-xl max-h-[300px] overflow-y-auto p-3 space-y-1 bg-slate-50 border-slate-200">
                {subscribers.map(sub => (
                  <label key={sub._id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors group">
                    <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" checked={selectedEmails.includes(sub.email)} onChange={e => {
                      if (e.target.checked) setSelectedEmails(prev => [...prev, sub.email]);
                      else setSelectedEmails(prev => prev.filter(email => email !== sub.email));
                    }} />
                    <span className="text-xs font-medium  group-hover:">{sub.email}</span>
                  </label>
                ))}
                {subscribers.length === 0 && <p className="text-[10px]  italic text-center py-2">No subscribers found</p>}
              </div>
              {selectedEmails.length > 0 && <div className="text-[10px] font-medium  italic">Selected: {selectedEmails.length} recipients</div>}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Or Enter Emails Manually (comma separated)</label>
              <input className={fieldClass} placeholder="e.g. admin@example.com, user@gmail.com" value={sendForm.emails} onChange={e => setSendForm({ ...sendForm, emails: e.target.value })} />
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-800">Total Subscribers</span>
              <span className="text-lg font-bold text-emerald-600">{subscribers.length}</span>
            </div>
            <button type="submit" disabled={loading || !sendForm.blogId || (selectedEmails.length === 0 && !sendForm.emails.trim())} className="w-full bg-emerald-600 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors mt-2 disabled:bg-slate-300">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} Send Blog via Newsletter
            </button>
          </form>
        </section>

        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold">Newsletter Subscribers</h2>
          </div>
          <div className="p-6 overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b  text-xs uppercase font-bold">
                  <th className="pb-3 px-4">Email Address</th>
                  <th className="pb-3 px-4">Subscribed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscribers.map(sub => (
                  <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium ">{sub.email}</td>
                    <td className="py-3 px-4 text-sm ">{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr><td colSpan={2} className="py-8 text-center  italic">No subscribers yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogsManagement;