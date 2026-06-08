"use client";

import { useCallback, useEffect, useState } from "react"; // Removed Suspense from import
import { useSearchParams } from "next/navigation"; // Keep useSearchParams
import { toast } from "react-toastify";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import { BlogPageContentKeys, blogPageKeys, buildEmptyBlogContent } from "./blogPageContent";
import RichTextEditor from "@/components/common/RichTextEditor";


const randomId = () => Math.random().toString(36).slice(2, 9);

export default function BlogPageManager() {
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [form, setForm] = useState<Partial<ComponentContent>>(buildEmptyBlogContent("blog.hero"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      setRecords(list.filter(item => item.page === "blog" || item.key.startsWith("blog.")));
    } catch (error: unknown) {
      toast.error("Failed to load blog components.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    const key = searchParams.get("component");
    if (key && records.length > 0) {
      const found = records.find(r => r.key === key);
      if (found) {
        setEditingId(found._id);
        setForm(found);
      }
    }
  }, [searchParams, records]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, data: form.data || {} } as Omit<ComponentContent, "_id">;
      if (editingId) {
        await componentContentApi.update(editingId, payload);
      } else {
        await componentContentApi.create(payload);
      }
      toast.success("Blog content saved!");
      refresh();
    } catch (error: unknown) {
      const msg = (error as any).response?.data?.message || "Save failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderHeroForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
        <label className={labelClass}>Heading <input className={fieldClass} value={data.heading} onChange={e => setForm({...form, data: {...data, heading: e.target.value}})} /></label>
        <div className="mt-2">
          <label className={labelClass}>Description</label>
          <RichTextEditor 
            value={data.description || ""} 
            onChange={val => setForm({...form, data: {...data, description: val}})} 
            placeholder="Enter hero description..."
            minHeight="120px" 
          />
        </div>
        <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="blog.hero.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, bgImage: url}})} />
      </div>
    );
  };

  const renderArticlesForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-4">
        {data.articles.map((art: any, idx: number) => (
          <div key={art.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-3">
            <button type="button" onClick={() => { const na = data.articles.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, articles: na}})}} className="absolute top-2 right-2 text-red-500"><Trash2 size={16} /></button>
            <input className={fieldClass} placeholder="Article Title" value={art.title} onChange={e => { const na = [...data.articles]; na[idx].title = e.target.value; setForm({...form, data: {...data, articles: na}}) }} />
            <input className={fieldClass} placeholder="Read More Link" value={art.readMoreLink} onChange={e => { const na = [...data.articles]; na[idx].readMoreLink = e.target.value; setForm({...form, data: {...data, articles: na}}) }} />
            <ImageUploadField label="Image" value={art.image} fieldKey={`art.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const na = [...data.articles]; na[idx].image = url; setForm({...form, data: {...data, articles: na}}) }} />
          </div>
        ))}
        <button type="button" onClick={() => setForm({...form, data: {...data, articles: [...data.articles, {id: randomId(), title: '', readMoreLink: '', image: ''}]}})} className="w-full py-4 border-2 border-dashed rounded-xl text-slate-400 flex items-center justify-center gap-2"><Plus size={20} /> Add Article</button>
      </div>
    );
  };

  const renderExpertsForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-4">
        {data.experts.map((exp: any, idx: number) => (
          <div key={exp.id} className="p-4 border rounded-xl bg-white space-y-3 relative shadow-sm">
            <button type="button" onClick={() => { const ne = data.experts.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, experts: ne}})}} className="absolute top-2 right-2 text-red-400"><Trash2 size={16} /></button>
            <div className="grid grid-cols-2 gap-4">
              <input className={fieldClass} placeholder="Expert Name" value={exp.name} onChange={e => { const ne = [...data.experts]; ne[idx].name = e.target.value; setForm({...form, data: {...data, experts: ne}}) }} />
              <input className={fieldClass} placeholder="Designation" value={exp.designation} onChange={e => { const ne = [...data.experts]; ne[idx].designation = e.target.value; setForm({...form, data: {...data, experts: ne}}) }} />
            </div>
            <div className="mt-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
              <RichTextEditor 
                value={exp.description || ""} 
                onChange={val => { const ne = [...data.experts]; ne[idx].description = val; setForm({...form, data: {...data, experts: ne}}); }} 
                placeholder="Enter expert description..."
                minHeight="100px" 
              />
            </div>
            <ImageUploadField label="Expert Photo" value={exp.image} fieldKey={`exp.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const ne = [...data.experts]; ne[idx].image = url; setForm({...form, data: {...data, experts: ne}}) }} />
          </div>
        ))}
        <button type="button" onClick={() => setForm({...form, data: {...data, experts: [...data.experts, {id: randomId(), name: '', designation: '', description: '', image: ''}]}})} className="w-full py-3 bg-slate-100 rounded-lg text-slate-600 font-bold flex items-center justify-center gap-2"><Plus size={18} /> Add Expert</button>
      </div>
    );
  };

  const renderAllBlogsForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-xl space-y-3">
          <h4 className="text-sm font-bold text-blue-800">Categories (Comma Separated)</h4>
          <textarea className={fieldClass} value={data.categories.join(", ")} onChange={e => setForm({...form, data: {...data, categories: e.target.value.split(",").map(s => s.trim())}})} />
        </div>
        <div className="space-y-4">
          <h4 className="font-bold">Blog Entries</h4>
          {data.blogs.map((blog: any, idx: number) => (
            <div key={blog.id} className="p-4 border rounded-xl bg-white space-y-2">
              <div className="flex gap-4">
                <input className={fieldClass} placeholder="Blog Title" value={blog.title} onChange={e => { const nb = [...data.blogs]; nb[idx].title = e.target.value; setForm({...form, data: {...data, blogs: nb}}) }} />
                <input className={fieldClass} type="date" value={blog.date} onChange={e => { const nb = [...data.blogs]; nb[idx].date = e.target.value; setForm({...form, data: {...data, blogs: nb}}) }} />
              </div>
              <div className="mt-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Short Description</label>
                <RichTextEditor 
                  value={blog.description || ""} 
                  onChange={val => { const nb = [...data.blogs]; nb[idx].description = val; setForm({...form, data: {...data, blogs: nb}}); }} 
                  placeholder="Enter short description..."
                  minHeight="100px" 
                />
              </div>
              <input className={fieldClass} placeholder="Post Link" value={blog.link} onChange={e => { const nb = [...data.blogs]; nb[idx].link = e.target.value; setForm({...form, data: {...data, blogs: nb}}) }} />
              <ImageUploadField label="Cover Image" value={blog.image} fieldKey={`blog.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nb = [...data.blogs]; nb[idx].image = url; setForm({...form, data: {...data, blogs: nb}}) }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMediaForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h4 className="font-bold">Blogs Media List</h4>
          {data.blogsMedia.map((m: any, idx: number) => (
            <div key={m.id} className="p-4 border rounded-lg space-y-2 bg-slate-50">
              <input className={fieldClass} placeholder="Media Title" value={m.title} onChange={e => { const nm = [...data.blogsMedia]; nm[idx].title = e.target.value; setForm({...form, data: {...data, blogsMedia: nm}}) }} />
              <div className="mt-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                <RichTextEditor 
                  value={m.description || ""} 
                  onChange={val => { const nm = [...data.blogsMedia]; nm[idx].description = val; setForm({...form, data: {...data, blogsMedia: nm}}); }} 
                  placeholder="Enter media description..."
                  minHeight="100px" 
                />
              </div>
              <ImageUploadField label="Image" value={m.image} fieldKey={`media.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nm = [...data.blogsMedia]; nm[idx].image = url; setForm({...form, data: {...data, blogsMedia: nm}}) }} />
            </div>
          ))}
        </div>
        <div className="p-4 border-2 border-amber-200 bg-amber-50 rounded-2xl space-y-4">
          <h4 className="font-bold text-amber-900">Report Resource</h4>
          <input className={fieldClass} placeholder="Report Title" value={data.reportResource.title} onChange={e => setForm({...form, data: {...data, reportResource: {...data.reportResource, title: e.target.value}}})} />
          <div className="mt-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Report Description</label>
            <RichTextEditor 
              value={data.reportResource.description || ""} 
              onChange={val => setForm({...form, data: {...data, reportResource: {...data.reportResource, description: val}}})} 
              placeholder="Enter report description..."
              minHeight="100px" 
            />
          </div>
          <input className={fieldClass} placeholder="Download Link" value={data.reportResource.link} onChange={e => setForm({...form, data: {...data, reportResource: {...data.reportResource, link: e.target.value}}})} />
          <ImageUploadField label="Cover" value={data.reportResource.image} fieldKey="media.rep" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, reportResource: {...data.reportResource, image: url}}})} />
        </div>
      </div>
    );
  };

  const renderStayInspiredForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-4">
        <input className={fieldClass} placeholder="Title" value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} />
        <div className="mt-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
          <RichTextEditor 
            value={data.description || ""} 
            onChange={val => setForm({...form, data: {...data, description: val}})} 
            placeholder="Enter inspiration description..."
            minHeight="120px" 
          />
        </div>
        <input className={fieldClass} placeholder="Subscription Link" value={data.subscribeLink} onChange={e => setForm({...form, data: {...data, subscribeLink: e.target.value}})} />
      </div>
    );
  };

  const renderSupportWellnessForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ImageUploadField label="Icon" value={data.iconImage} fieldKey="supp.icon" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, iconImage: url}})} />
          <ImageUploadField label="BG Image" value={data.bgImage} fieldKey="supp.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, bgImage: url}})} />
        </div>
        <input className={fieldClass} placeholder="Title" value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} />
        <div className="mt-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
          <RichTextEditor 
            value={data.description || ""} 
            onChange={val => setForm({...form, data: {...data, description: val}})} 
            placeholder="Enter wellness description..."
            minHeight="120px" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input className={fieldClass} placeholder="Button Label" value={data.primaryButton.label} onChange={e => setForm({...form, data: {...data, primaryButton: {...data.primaryButton, label: e.target.value}}})} />
          <input className={fieldClass} placeholder="Button Href" value={data.primaryButton.href} onChange={e => setForm({...form, data: {...data, primaryButton: {...data.primaryButton, href: e.target.value}}})} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <section className="w-full">
        <form onSubmit={handleSave} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Blog Page Manager</h2>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <label className={labelClass}>Template Type
                <select 
                  className={fieldClass} 
                  value={form.key || ""} 
                  onChange={e => {
                    const key = e.target.value as BlogPageContentKeys;
                    setEditingId(null);
                    setForm(buildEmptyBlogContent(key));
                  }}
                >
                  {blogPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
              </label>
              <label className={labelClass}>Active <div className="mt-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /></div></label>
            </div>

            {form.key === "blog.hero" && renderHeroForm()}
            {form.key === "blog.featuredArticles" && renderArticlesForm()}
            {form.key === "blog.voiceOfExperts" && renderExpertsForm()}
            {form.key === "blog.allBlogs" && renderAllBlogsForm()}
            {form.key === "blog.mediaResources" && renderMediaForm()}
            {form.key === "blog.stayInspired" && renderStayInspiredForm()}
            {form.key === "blog.supportWellness" && renderSupportWellnessForm()}
          </div>
        </form>
      </section>
    </div>
  );
}