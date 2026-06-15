"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Plus, Send, Save, FileText, CheckCircle, Star, Users, Globe, Search, Edit2 } from "lucide-react";
import { api } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import PageStatsCards from '@/components/common/PageStatsCards';
import RichTextEditor from '@/components/common/RichTextEditor';

interface Blog {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  author: string;
  image: string;
  content: string; // The full HTML content from the API
  subtitle?: string;
  description?: string;
  featureImage?: string;
  featuredImage?: string;
  tags?: string[];
  readingTime?: number;
  isFeatured?: boolean; // Assuming this might be returned by the API
  seo?: any; // Assuming this might be returned by the API
  robots?: string; // Assuming this might be returned by the API
}

interface Subscriber {
  _id: string;
  email: string;
  createdAt?: string;
}

const BlogsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // Blog Creation Form State
  const [blogForm, setBlogForm] = useState({
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

  // Newsletter Send Form State
  const [sendForm, setSendForm] = useState({
    blogId: '',
    emails: ''
  });

  // Helper to calculate reading time (Avg 200 words per minute)
  const calculateReadingTime = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' '); // Strip HTML tags
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.ceil(wordCount / 200);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

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
        readingTime: blogForm.readingTime || calculateReadingTime(blogForm.description)
      };
      if (editingBlogId) {
        await api.put(`/blogs/${editingBlogId}`, payload);
        toast.success("Blog updated successfully!");
      } else {
        await api.post('/blogs', payload);
        toast.success("Blog created successfully!");
      }

      setEditingBlogId(null);
      setBlogForm({
        title: '', slug: '', subtitle: '', description: '', author: '', cardImage: '', featureImage: '', tags: '', isFeatured: false, readingTime: 0,
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
        robots: "index, follow"
      });
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (editingBlogId ? "Failed to update blog" : "Failed to create blog"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = (blog: any) => {
    const blogId = blog._id || blog.id || null;
    setEditingBlogId(blogId);
    const content = blog.content || '';
    const imgMatch = content.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
    const firstImg = imgMatch ? imgMatch[1] : '';
    const featureImageValue = blog.featureImage || blog.featuredImage || firstImg;
    const cleanedContent = content.replace(/<img[^>]*>/g, '');
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
      seo: blog.seo || { metaTitle: "", metaDescription: "", metaKeywords: "", h1: "", canonical: "", ogTitle: "", ogDescription: "", ogImage: "" },
      robots: blog.robots || "index, follow",
    });
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
      const payload = {
        blogId: sendForm.blogId,
        emails: allEmails
      };
      await api.post('/newsletter/send-blog', payload);
      toast.success("Blog newsletter sent successfully!");
      setSendForm({ ...sendForm, blogId: '', emails: '' });
      setSelectedEmails([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send newsletter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="mb-4">
        <PageStatsCards pageName="blog" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center gap-2">
            <Plus className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold">{editingBlogId ? "Edit Blog" : "Create New Blog"}</h2>
          </div>
          <form onSubmit={handleCreateBlog} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={labelClass}>Title <input className={fieldClass} required value={blogForm.title} onChange={e => {
                const val = e.target.value;
                setBlogForm({
                  ...blogForm, 
                  title: val,
                  slug: val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
                });
              }} /></label>
              <label className={labelClass}>Author Name <input className={fieldClass} value={blogForm.author} onChange={e => setBlogForm({...blogForm, author: e.target.value})} /></label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={labelClass}>Slug <input className={fieldClass} required value={blogForm.slug} onChange={e => setBlogForm({...blogForm, slug: e.target.value})} /></label>
              <label className={labelClass}>Subtitle <input className={fieldClass} value={blogForm.subtitle} onChange={e => setBlogForm({...blogForm, subtitle: e.target.value})} /></label>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Description / Content</label>
              <RichTextEditor 
                value={blogForm.description} 
                onChange={(val) => {
                  const estimatedTime = calculateReadingTime(val);
                  setBlogForm({...blogForm, description: val, readingTime: estimatedTime});
                }} 
                placeholder="Enter blog content here..."
                minHeight="200px"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadField label="Card Image" value={blogForm.cardImage} fieldKey="blog.card" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setBlogForm({...blogForm, cardImage: url})} onError={m => toast.error(m)} />
              <ImageUploadField label="Feature Image" value={blogForm.featureImage} fieldKey="blog.featureImage" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setBlogForm({...blogForm, featureImage: url})} onError={m => toast.error(m)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <label className={labelClass}>Tags (comma separated) <input className={fieldClass} placeholder="e.g. Wellness, Ayurveda" value={blogForm.tags} onChange={e => setBlogForm({...blogForm, tags: e.target.value})} /></label>
              <label className={labelClass}>Reading Time (min) <input type="number" className={fieldClass} value={blogForm.readingTime} onChange={e => setBlogForm({...blogForm, readingTime: parseInt(e.target.value) || 0})} /></label>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 h-[42px] mb-[1px]">
                <input 
                  type="checkbox" 
                  id="isFeatured"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  checked={blogForm.isFeatured} 
                  onChange={(e) => setBlogForm({ ...blogForm, isFeatured: e.target.checked })} 
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider cursor-pointer select-none">
                  Mark as Featured Blog
                </label>
              </div>
            </div>

            <div className="pt-6 border-t space-y-4">
              <div className="flex items-center gap-2 text-[#8d6a3a]">
                <Globe size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider">SEO & Meta Tags</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={labelClass}>Meta Title <input className={fieldClass} value={blogForm.seo.metaTitle} onChange={e => setBlogForm({...blogForm, seo: {...blogForm.seo, metaTitle: e.target.value}})} /></label>
                <label className={labelClass}>Meta Keywords <input className={fieldClass} value={blogForm.seo.metaKeywords} onChange={e => setBlogForm({...blogForm, seo: {...blogForm.seo, metaKeywords: e.target.value}})} /></label>
              </div>
              <label className={labelClass}>Meta Description <textarea className={`${fieldClass} h-20`} value={blogForm.seo.metaDescription} onChange={e => setBlogForm({...blogForm, seo: {...blogForm.seo, metaDescription: e.target.value}})} /></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={labelClass}>Canonical URL <input className={fieldClass} value={blogForm.seo.canonical} onChange={e => setBlogForm({...blogForm, seo: {...blogForm.seo, canonical: e.target.value}})} /></label>
                <label className={labelClass}>Robots <select className={fieldClass} value={blogForm.robots} onChange={e => setBlogForm({...blogForm, robots: e.target.value})}>
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select></label>
              </div>
              
              <div className="flex items-center gap-2 text-[#8d6a3a] pt-2">
                <Search size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Social Sharing (Open Graph)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={labelClass}>OG Title <input className={fieldClass} value={blogForm.seo.ogTitle} onChange={e => setBlogForm({...blogForm, seo: {...blogForm.seo, ogTitle: e.target.value}})} /></label>
                <ImageUploadField label="OG Image" value={blogForm.seo.ogImage} fieldKey="blog.seo.og" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setBlogForm({...blogForm, seo: {...blogForm.seo, ogImage: url}})} onError={m => toast.error(m)} />
              </div>
              <label className={labelClass}>OG Description <textarea className={`${fieldClass} h-20`} value={blogForm.seo.ogDescription} onChange={e => setBlogForm({...blogForm, seo: {...blogForm.seo, ogDescription: e.target.value}})} /></label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors mt-4">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}{editingBlogId ? 'Update Blog' : 'Create Blog'}
            </button>
          </form>
        </section>

        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold">Existing Blogs</h2>
          </div>
          <div className="p-6 overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-slate-400 text-xs uppercase font-bold">
                  <th className="pb-3 px-4">Title</th>
                  <th className="pb-3 px-4">Author</th>
                  <th className="pb-3 px-4">Read Time</th>
                  <th className="pb-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-slate-700">
                      <div className="line-clamp-1">{blog.title}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">{blog.author}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{blog.readingTime || 0} min</td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => handleEditBlog(blog)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Blog"
                      >
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center gap-2">
            <Send className="text-emerald-600" size={20} />
            <h2 className="text-lg font-bold">Send Newsletter</h2>
          </div>
          <form onSubmit={handleSendToNewsletter} className="p-6 space-y-4">
            <label className={labelClass}>Select Blog to Send <select className={fieldClass} required value={sendForm.blogId} onChange={e => setSendForm({...sendForm, blogId: e.target.value})}>
              <option value="">Select a blog...</option>
              {blogs.map(blog => <option key={blog._id} value={blog._id}>{blog.title}</option>)}
            </select></label>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Select Recipients</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setSelectedEmails(subscribers.map(s => s.email))} className="text-[9px] font-bold text-blue-600 uppercase hover:underline">Select All</button>
                  <button type="button" onClick={() => setSelectedEmails([])} className="text-[9px] font-bold text-slate-400 uppercase hover:underline">Clear</button>
                </div>
              </div> 
              <div className="border rounded-xl max-h-[300px] overflow-y-auto p-3 space-y-1 bg-slate-50 border-slate-200">
                {subscribers.map(sub => (
                  <label key={sub._id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors group">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={selectedEmails.includes(sub.email)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedEmails(prev => [...prev, sub.email]);
                        else setSelectedEmails(prev => prev.filter(email => email !== sub.email));
                      }}
                    />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">{sub.email}</span>
                  </label>
                ))}
                {subscribers.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-2">No subscribers found</p>}
              </div>
              {selectedEmails.length > 0 && (
                <div className="text-[10px] font-medium text-slate-500 italic">Selected: {selectedEmails.length} recipients</div>
              )}
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Or Enter Emails Manually (comma separated)</label>
              <input 
                className={fieldClass} 
                placeholder="e.g. admin@example.com, user@gmail.com" 
                value={sendForm.emails} 
                onChange={e => setSendForm({...sendForm, emails: e.target.value})} 
              />
            </div>

            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between"><span className="text-sm font-medium text-emerald-800">Total Subscribers</span><span className="text-lg font-bold text-emerald-600">{subscribers.length}</span></div>
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
              <tr className="border-b text-slate-400 text-xs uppercase font-bold">
                <th className="pb-3 px-4">Email Address</th>
                <th className="pb-3 px-4">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscribers.map((sub) => (
                <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-slate-700">{sub.email}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-slate-400 italic">No subscribers yet</td>
                </tr>
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
