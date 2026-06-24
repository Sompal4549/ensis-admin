"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Plus, Send, Save, FileText, Users, Globe, Search, Edit2, Trash2, FileImage, BookOpen, Mail, LayoutTemplate } from "lucide-react";
import { api } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from '@/components/common/RichTextEditor';

interface Blog {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  author: string;
  image: string;
  content: string;
  subtitle?: string;
  description?: string;
  featureImage?: string;
  featuredImage?: string;
  tags?: string[];
  readingTime?: number;
  isFeatured?: boolean;
  seo?: any;
  robots?: string;
  banner?: any;
  article?: any;
  newsletter?: any;
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

const emptyBlogForm = () => ({
  title: '',
  slug: '',
  subtitle: '',
  description: '',
  author: '',
  cardImage: '',
  featureImage: '',
  tags: '',
  readingTime: 0,
  isFeatured: false,

  banner: {
    titleLine1: '',
    titleLine2Start: '',
    titleLine2Highlight: '',
    date: '',
    readTime: '',
    category: '',
    bgImage: '',
  },

  // article: {
  //   heroImage: '',
  //   heroAlt: '',
  //   introBefore: '',
  //   introHighlight: '',
  //   introAfter: '',
  //   whatIsPanchakarma: { heading: '', content: '' },
  //   therapies: [] as { title: string; description: string; image: string }[],
  //   benefitsHeading: '',
  //   benefits: [] as { title: string; description: string }[],
  //   modernLife: { heading: '', content: '' },
  //   rightSpace: { heading: '', content: '' },
  //   ensisApproach: { heading: '', content: '' },
  //   conclusion: { heading: '', content: '' },
  //   toc: [] as { label: string; anchor: string }[],
  //   guide: { heading: '', description: '', buttonLabel: '', href: '' },
  //   relatedArticles: [] as { title: string; image: string; href: string; category: string }[],
  // },

  newsletter: {
    lotusImage: { image: '', alt: '' },
    title: '',
    description: '',
    followText: '',
    followLinks: [] as { image: string; path: string }[],
  },

  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    h1: "",
    canonical: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
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

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const [blogsRes, subRes] = await Promise.all([
        api.get('/blogs'),
        api.get('/newsletter')
      ]);
      setBlogs(blogsRes.data?.data || []);
      setSubscribers(subRes.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.cardImage) {
      toast.error("Title and Card Image are required");
      setActiveTab("basic");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: blogForm.title,
        slug: blogForm.slug || blogForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        content: blogForm.description,
        subtitle: blogForm.subtitle,
        author: blogForm.author,
        image: blogForm.cardImage,
        featureImage: blogForm.featureImage,
        featuredImage: blogForm.featureImage,
        feature_image: blogForm.featureImage,
        featured_image: blogForm.featureImage,
        tags: blogForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        seo: blogForm.seo,
        robots: blogForm.robots,
        isFeatured: blogForm.isFeatured,
        readingTime: blogForm.readingTime || calculateReadingTime(blogForm.description),
        banner: {
          title: {
            line1: blogForm.banner.titleLine1,
            line2Start: blogForm.banner.titleLine2Start,
            line2Highlight: blogForm.banner.titleLine2Highlight,
          },
          date: blogForm.banner.date,
          readTime: blogForm.banner.readTime,
          category: blogForm.banner.category,
          bgImage: blogForm.banner.bgImage,
        },
        // article: blogForm.article,
        newsletter: blogForm.newsletter,
      };

      if (editingBlogId) {
        await api.put(`/blogs/${editingBlogId}`, payload);
        toast.success("Blog updated successfully!");
      } else {
        await api.post('/blogs', payload);
        toast.success("Blog created successfully!");
      }

      setEditingBlogId(null);
      setBlogForm(emptyBlogForm());
      setActiveTab("basic");
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (editingBlogId ? "Failed to update blog" : "Failed to create blog"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = (blog: any) => {
    setEditingBlogId(blog._id || blog.id || null);
    const content = blog.content || '';
    const imgMatch = content.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
    const firstImg = imgMatch ? imgMatch[1] : '';
    const featureImageValue = blog.featureImage || blog.featuredImage || firstImg;
    const cleanedContent = content.replace(/<img[^>]*>/g, '');
    const b = blog.banner || {};
    setBlogForm({
      title: blog.title || '',
      slug: blog.slug || '',
      subtitle: blog.subtitle || '',
      description: cleanedContent,
      author: blog.author || '',
      cardImage: blog.image || '',
      featureImage: featureImageValue,
      tags: (blog.tags || []).join(', '),
      readingTime: blog.readingTime || 0,
      isFeatured: blog.isFeatured || false,
      banner: {
        titleLine1: b.title?.line1 || '',
        titleLine2Start: b.title?.line2Start || '',
        titleLine2Highlight: b.title?.line2Highlight || '',
        date: b.date || '',
        readTime: b.readTime || '',
        category: b.category || '',
        bgImage: b.bgImage || '',
      },
      // article: blog.article || emptyBlogForm().article,
      newsletter: blog.newsletter || emptyBlogForm().newsletter,
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
        <label className={labelClass}>Title <input className={fieldClass} required value={blogForm.title} onChange={e => {
          const val = e.target.value;
          setBlogForm({ ...blogForm, title: val, slug: val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') });
        }} /></label>
        <label className={labelClass}>Author Name <input className={fieldClass} value={blogForm.author} onChange={e => setBlogForm({ ...blogForm, author: e.target.value })} /></label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className={labelClass}>Slug <input className={fieldClass} required value={blogForm.slug} onChange={e => setBlogForm({ ...blogForm, slug: e.target.value })} /></label>
        <label className={labelClass}>Subtitle <input className={fieldClass} value={blogForm.subtitle} onChange={e => setBlogForm({ ...blogForm, subtitle: e.target.value })} /></label>
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Description / Content</label>
        <RichTextEditor
          value={blogForm.description}
          onChange={val => setBlogForm({ ...blogForm, description: val, readingTime: calculateReadingTime(val) })}
          placeholder="Enter blog content here..."
          minHeight="200px"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUploadField label="Card Image" value={blogForm.cardImage} fieldKey="blog.card" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setBlogForm({ ...blogForm, cardImage: url })} onError={m => toast.error(m)} />
        <ImageUploadField label="Feature Image" value={blogForm.featureImage} fieldKey="blog.featureImage" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setBlogForm({ ...blogForm, featureImage: url })} onError={m => toast.error(m)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <label className={labelClass}>Tags (comma separated) <input className={fieldClass} placeholder="e.g. Wellness, Ayurveda" value={blogForm.tags} onChange={e => setBlogForm({ ...blogForm, tags: e.target.value })} /></label>
        <label className={labelClass}>Reading Time (min) <input type="number" className={fieldClass} value={blogForm.readingTime} onChange={e => setBlogForm({ ...blogForm, readingTime: parseInt(e.target.value) || 0 })} /></label>
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 h-[42px] mb-[1px]">
          <input type="checkbox" id="isFeatured" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={blogForm.isFeatured} onChange={e => setBlogForm({ ...blogForm, isFeatured: e.target.checked })} />
          <label htmlFor="isFeatured" className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider cursor-pointer select-none">Mark as Featured</label>
        </div>
      </div>
    </div>
  );

  const renderBannerTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className={labelClass}>Title Line 1 <input className={fieldClass} value={blogForm.banner.titleLine1} onChange={e => setBlogForm({ ...blogForm, banner: { ...blogForm.banner, titleLine1: e.target.value } })} /></label>
        <label className={labelClass}>Title Line 2 Start <input className={fieldClass} value={blogForm.banner.titleLine2Start} onChange={e => setBlogForm({ ...blogForm, banner: { ...blogForm.banner, titleLine2Start: e.target.value } })} /></label>
        <label className={labelClass}>Title Line 2 Highlight <input className={fieldClass} value={blogForm.banner.titleLine2Highlight} onChange={e => setBlogForm({ ...blogForm, banner: { ...blogForm.banner, titleLine2Highlight: e.target.value } })} /></label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className={labelClass}>Date <input type="date" className={fieldClass} value={blogForm.banner.date} onChange={e => setBlogForm({ ...blogForm, banner: { ...blogForm.banner, date: e.target.value } })} /></label>
        <label className={labelClass}>Read Time <input className={fieldClass} placeholder="e.g. 5 min read" value={blogForm.banner.readTime} onChange={e => setBlogForm({ ...blogForm, banner: { ...blogForm.banner, readTime: e.target.value } })} /></label>
        <label className={labelClass}>Category <input className={fieldClass} value={blogForm.banner.category} onChange={e => setBlogForm({ ...blogForm, banner: { ...blogForm.banner, category: e.target.value } })} /></label>
      </div>
      <ImageUploadField label="Banner Background Image" value={blogForm.banner.bgImage} fieldKey="blog.banner.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setBlogForm({ ...blogForm, banner: { ...blogForm.banner, bgImage: url } })} onError={m => toast.error(m)} />
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
        <label className={labelClass}>Meta Title <input className={fieldClass} value={blogForm.seo.metaTitle} onChange={e => setBlogForm({ ...blogForm, seo: { ...blogForm.seo, metaTitle: e.target.value } })} /></label>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className={labelClass}>OG Title <input className={fieldClass} value={blogForm.seo.ogTitle} onChange={e => setBlogForm({ ...blogForm, seo: { ...blogForm.seo, ogTitle: e.target.value } })} /></label>
        <ImageUploadField label="OG Image" value={blogForm.seo.ogImage} fieldKey="blog.seo.og" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setBlogForm({ ...blogForm, seo: { ...blogForm.seo, ogImage: url } })} onError={m => toast.error(m)} />
      </div>
      <label className={labelClass}>OG Description <textarea className={`${fieldClass} h-20`} value={blogForm.seo.ogDescription} onChange={e => setBlogForm({ ...blogForm, seo: { ...blogForm.seo, ogDescription: e.target.value } })} /></label>
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
                    <td className="py-3 px-4 text-sm ">{blog.readingTime || 0} min</td>
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