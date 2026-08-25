"use client";

import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Loader2,
  Save,
  Trash2,
  Plus,
} from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import {
  blogPageKeys,
  defaultBlogData,
  type BlogPageContentKeys,
} from "@/components/common/blogPageContent";
import { fieldClass, labelClass } from "@/constants";

type ContentForm = Omit<ComponentContent, "_id"> & { key: BlogPageContentKeys };

const randomId = () => Math.random().toString(36).slice(2, 9);

const cardClass = "p-2 border rounded bg-gray-50 space-y-1.5 relative";
const sectionHeaderClass = "text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide";
const addBtnClass = "text-[11px] bg-[#263016] text-white px-2 py-1 rounded";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";

export default function BlogComponentEditor({ componentKey, title }: { componentKey: BlogPageContentKeys; title: string }) {
  const [form, setForm] = useState<ContentForm>({
    key: componentKey,
    label: title,
    page: "blog",
    description: "",
    isActive: true,
    data: (defaultBlogData[componentKey] || {}) as Record<string, unknown>,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ message: string; id: string } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      const existing = list.find(r => r.key === componentKey);
      if (existing) {
        setEditingId(existing._id);
        setForm({
          key: existing.key as BlogPageContentKeys,
          label: existing.label,
          page: existing.page || "blog",
          description: existing.description || "",
          isActive: existing.isActive,
          data: (existing.data as Record<string, unknown>) || {},
        });
      } else {
        setEditingId(null);
        const keyInfo = blogPageKeys.find(k => k.key === componentKey);
        setForm(prev => ({
          ...prev,
          key: componentKey,
          label: keyInfo?.label || title,
          description: keyInfo?.description || "",
          data: (defaultBlogData[componentKey] || {}) as Record<string, unknown>,
        }));
      }
    } catch (error) {
      toast.error("Failed to load components.");
    } finally {
      setLoading(false);
    }
  }, [componentKey, title]);

  useEffect(() => { refresh(); }, [refresh]);

  const setData = (nextData: Record<string, unknown>) => setForm((current) => ({ ...current, data: nextData }));

  const handleKeyChange = (key: BlogPageContentKeys) => {
    setEditingId(null);
    setForm(prev => ({
      ...prev,
      key,
      label: blogPageKeys.find(k => k.key === key)?.label || prev.label,
      data: defaultBlogData[key] as Record<string, unknown>,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await componentContentApi.update(editingId, form);
        toast.success("Updated successfully!");
      } else {
        await componentContentApi.create(form);
        toast.success("Created successfully!");
      }
      await refresh();
    } catch {
      toast.error("Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await componentContentApi.remove(id);
      toast.success("Component deleted");
    } catch {
      toast.error("Delete failed");
    }
    setEditingId(null);
    refresh();
  };

  const confirmDeleteClick = (id: string, message: string) => setPendingDelete({ id, message });

  const renderHeroForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading || ""} onChange={e => setData({ ...data, heading: e.target.value })} /></label>
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="blog.hero.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, bgImage: url })} />
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
      </div>
    );
  };

  const renderFeaturedArticlesForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Featured Articles</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, articles: [...(data.articles || []), { id: randomId(), image: '', title: '', readMoreLink: '' }] })}>+ Add Article</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(data.articles || []).map((article: any, idx: number) => (
            <div key={article.id} className={cardClass}>
              <button type="button" onClick={() => setData({ ...data, articles: data.articles.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
              <input className={smallFieldClass} placeholder="Title" value={article.title || ""} onChange={e => { const na = [...data.articles]; na[idx].title = e.target.value; setData({ ...data, articles: na }); }} />
              <input className={smallFieldClass} placeholder="Read More Link" value={article.readMoreLink || ""} onChange={e => { const na = [...data.articles]; na[idx].readMoreLink = e.target.value; setData({ ...data, articles: na }); }} />
              <ImageUploadField label="Image" value={article.image} fieldKey={`blog.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const na = [...data.articles]; na[idx].image = url; setData({ ...data, articles: na }); }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVoiceOfExpertsForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Experts</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, experts: [...(data.experts || []), { id: randomId(), image: '', description: '', name: '', designation: '' }] })}>+ Add Expert</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(data.experts || []).map((expert: any, idx: number) => (
            <div key={expert.id} className={cardClass}>
              <button type="button" onClick={() => setData({ ...data, experts: data.experts.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
              <input className={smallFieldClass} placeholder="Name" value={expert.name || ""} onChange={e => { const ne = [...data.experts]; ne[idx].name = e.target.value; setData({ ...data, experts: ne }); }} />
              <input className={smallFieldClass} placeholder="Designation" value={expert.designation || ""} onChange={e => { const ne = [...data.experts]; ne[idx].designation = e.target.value; setData({ ...data, experts: ne }); }} />
              <input className={smallFieldClass} placeholder="Description" value={expert.description || ""} onChange={e => { const ne = [...data.experts]; ne[idx].description = e.target.value; setData({ ...data, experts: ne }); }} />
              <ImageUploadField label="Image" value={expert.image} fieldKey={`blog.expert.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ne = [...data.experts]; ne[idx].image = url; setData({ ...data, experts: ne }); }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAllBlogsForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Description <input className={smallFieldClass} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Categories</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, categories: [...(data.categories || []), ''] })}>+ Add Category</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(data.categories || []).map((cat: string, idx: number) => (
              <div key={idx} className="flex gap-1">
                <input className={smallFieldClass} placeholder="Category" value={cat || ""} onChange={e => { const nc = [...data.categories]; nc[idx] = e.target.value; setData({ ...data, categories: nc }); }} />
                <button type="button" onClick={() => { const nc = data.categories.filter((_: any, i: number) => i !== idx); setData({ ...data, categories: nc }); }} className="text-red-500"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Blogs</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, blogs: [...(data.blogs || []), { id: randomId(), image: '', title: '', description: '', date: '', link: '' }] })}>+ Add Blog</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.blogs || []).map((blog: any, idx: number) => (
              <div key={blog.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, blogs: data.blogs.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Title" value={blog.title || ""} onChange={e => { const nb = [...data.blogs]; nb[idx].title = e.target.value; setData({ ...data, blogs: nb }); }} />
                <input className={smallFieldClass} placeholder="Date" value={blog.date || ""} onChange={e => { const nb = [...data.blogs]; nb[idx].date = e.target.value; setData({ ...data, blogs: nb }); }} />
                <input className={smallFieldClass} placeholder="Link" value={blog.link || ""} onChange={e => { const nb = [...data.blogs]; nb[idx].link = e.target.value; setData({ ...data, blogs: nb }); }} />
                <ImageUploadField label="Image" value={blog.image} fieldKey={`blog.blog.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nb = [...data.blogs]; nb[idx].image = url; setData({ ...data, blogs: nb }); }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMediaResourcesForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Blogs Media</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, blogsMedia: [...(data.blogsMedia || []), { id: randomId(), title: '', description: '', buttonLabel: '', buttonHref: '', image: '' }] })}>+ Add Media</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.blogsMedia || []).map((media: any, idx: number) => (
              <div key={media.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, blogsMedia: data.blogsMedia.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Title" value={media.title || ""} onChange={e => { const nm = [...data.blogsMedia]; nm[idx].title = e.target.value; setData({ ...data, blogsMedia: nm }); }} />
                <input className={smallFieldClass} placeholder="Description" value={media.description || ""} onChange={e => { const nm = [...data.blogsMedia]; nm[idx].description = e.target.value; setData({ ...data, blogsMedia: nm }); }} />
                <div className="grid grid-cols-2 gap-1">
                  <input className={smallFieldClass} placeholder="Button Label" value={media.buttonLabel || ""} onChange={e => { const nm = [...data.blogsMedia]; nm[idx].buttonLabel = e.target.value; setData({ ...data, blogsMedia: nm }); }} />
                  <input className={smallFieldClass} placeholder="Button Href" value={media.buttonHref || ""} onChange={e => { const nm = [...data.blogsMedia]; nm[idx].buttonHref = e.target.value; setData({ ...data, blogsMedia: nm }); }} />
                </div>
                <ImageUploadField label="Image" value={media.image} fieldKey={`blog.media.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nm = [...data.blogsMedia]; nm[idx].image = url; setData({ ...data, blogsMedia: nm }); }} />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <h4 className={sectionHeaderClass}>Report Resource</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input className={smallFieldClass} placeholder="Title" value={data.reportResource?.title || ""} onChange={e => setData({ ...data, reportResource: { ...data.reportResource, title: e.target.value } })} />
            <input className={smallFieldClass} placeholder="Description" value={data.reportResource?.description || ""} onChange={e => setData({ ...data, reportResource: { ...data.reportResource, description: e.target.value } })} />
            <input className={smallFieldClass} placeholder="Button Label" value={data.reportResource?.buttonLabel || ""} onChange={e => setData({ ...data, reportResource: { ...data.reportResource, buttonLabel: e.target.value } })} />
            <input className={smallFieldClass} placeholder="Button Href" value={data.reportResource?.buttonHref || ""} onChange={e => setData({ ...data, reportResource: { ...data.reportResource, buttonHref: e.target.value } })} />
            <ImageUploadField label="Image" value={data.reportResource?.image} fieldKey="blog.report.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, reportResource: { ...data.reportResource, image: url } })} />
          </div>
        </div>
      </div>
    );
  };

  const renderStayInspiredForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Description <input className={smallFieldClass} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className={smallFieldClass} placeholder="Button Label" value={data.buttonLabel || ""} onChange={e => setData({ ...data, buttonLabel: e.target.value })} />
          <input className={smallFieldClass} placeholder="Button Href" value={data.buttonHref || ""} onChange={e => setData({ ...data, buttonHref: e.target.value })} />
        </div>
      </div>
    );
  };

  const renderSupportWellnessForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <ImageUploadField label="Icon Image" value={data.iconImage} fieldKey="blog.support.icon" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, iconImage: url })} />
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="blog.support.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, bgImage: url })} />
        <div className="grid grid-cols-2 gap-2">
          <input className={smallFieldClass} placeholder="Button Label" value={data.primaryButton?.label || ""} onChange={e => setData({ ...data, primaryButton: { ...data.primaryButton, label: e.target.value } })} />
          <input className={smallFieldClass} placeholder="Button Href" value={data.primaryButton?.href || ""} onChange={e => setData({ ...data, primaryButton: { ...data.primaryButton, href: e.target.value } })} />
        </div>
      </div>
    );
  };

  const renderFeaturesStripForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Stats Items</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, items: [...(data.items || []), { id: randomId(), title: '', imageurl: { imageUrl: '', alt: '' } }] })}>+ Add Item</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(data.items || []).map((item: any, idx: number) => (
            <div key={item.id} className={cardClass}>
              <button type="button" onClick={() => setData({ ...data, items: data.items.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
              <input className={smallFieldClass} placeholder="Title (e.g. 150+)" value={item.title || ""} onChange={e => { const ni = [...data.items]; ni[idx].title = e.target.value; setData({ ...data, items: ni }); }} />
              <ImageUploadField label="Image" value={item.imageurl?.imageUrl} fieldKey={`blog.strip.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ni = [...data.items]; ni[idx].imageurl = { imageUrl: url, alt: '' }; setData({ ...data, items: ni }); }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-sm">
      <header className="mb-4 flex items-center justify-between border-b border-[#eee5d9] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8d6a3a]">Configuration</span>
          <h1 className="text-xl text-[#1f261b] mt-0.5">Blog Page Content</h1>
          <p className="mt-1 text-[#5f5a50] text-xs leading-snug max-w-xl">
            Manage sections of the blog page. Select an existing component to edit.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1">
        <section>
          <form onSubmit={handleSave} className="bg-white border border-[#ded3c4] rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#fcfaf7] border-b border-[#eee5d9] p-3 flex items-center justify-between">
              <div>
                <h2 className="text-base text-[#1f261b]">{editingId ? "Edit Component" : "Create New Component"}</h2>
                <p className="text-[10px] text-[#5f5a50] mt-0.5 italic">Structured data for rendering page sections</p>
              </div>
              <div className="flex items-center gap-2">
                {editingId && (
                  <button type="button" onClick={() => confirmDeleteClick(editingId, "Are you sure?")} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8d6a3a] text-white rounded-lg font-bold text-xs shadow hover:bg-[#6f542f] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {editingId ? "Update Section" : "Publish Section"}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3 bg-[#fcfaf7] p-3 rounded-lg border border-[#eee5d9] items-end">
                <label className={smallLabelClass}>
                  Template / Component Key
                  <select
                    className={`${smallFieldClass} font-bold`}
                    value={form.key}
                    onChange={(e) => handleKeyChange(e.target.value as BlogPageContentKeys)}
                  >
                    {blogPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                  </select>
                </label>
                <label className={smallLabelClass}>
                  Internal Label
                  <input className={smallFieldClass} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Friendly name for admin" />
                </label>
                <label className={smallLabelClass}>
                  Page ID
                  <input className={smallFieldClass} value={form.page} onChange={e => setForm({ ...form, page: e.target.value })} />
                </label>
                <div className="flex items-center gap-1.5 pb-1">
                  <input type="checkbox" id="isActive" className="w-4 h-4 rounded accent-[#8d6a3a]" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                  <label htmlFor="isActive" className="text-[11px] font-bold text-[#1f261b] uppercase">Active on page</label>
                </div>
              </div>

              <div className="pt-1">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#eee5d9]" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#8d6a3a] uppercase">Component Content</span>
                  <div className="h-px flex-1 bg-[#eee5d9]" />
                </div>

                {form.key === "blog.hero" && renderHeroForm()}
                {form.key === "blog.featuredArticles" && renderFeaturedArticlesForm()}
                {form.key === "blog.voiceOfExperts" && renderVoiceOfExpertsForm()}
                {form.key === "blog.allBlogs" && renderAllBlogsForm()}
                {form.key === "blog.mediaResources" && renderMediaResourcesForm()}
                {form.key === "blog.stayInspired" && renderStayInspiredForm()}
                {form.key === "blog.supportWellness" && renderSupportWellnessForm()}
                {form.key === "blog.features_strip" && renderFeaturesStripForm()}
              </div>
            </div>
          </form>
        </section>
      </div>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Confirm Delete"
        message={pendingDelete?.message}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await handleDelete(pendingDelete.id);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
