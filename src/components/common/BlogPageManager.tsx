"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DropResult } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import { Loader2, Plus, Save, Trash2, Calendar, User, Tag } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import ComponentList from "./ComponentList";
import { buildEmptyBlogContent, BlogPageContentKeys, blogPageKeys } from "./blogPageContent";

const randomId = () => Math.random().toString(36).slice(2, 9);

export default function BlogPageManager() {
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const componentKey = searchParams.get("component");

  const [form, setForm] = useState<Partial<ComponentContent>>({
    key: `blog.${Date.now()}`,
    label: "",
    page: "blog",
    isActive: true,
    data: {
      title: "",
      author: "",
      date: new Date().toISOString().split('T')[0],
      category: "",
      image: "",
      excerpt: "",
      content: ""
    },
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.getByPage("blog");
      setRecords(list);

      if (componentKey) {
        const existing = list.find(r => r.key === componentKey);
        if (existing) {
          setEditingId(existing._id);
          setForm(existing);
        } else if (blogPageKeys.some(k => k.key === componentKey)) {
          setEditingId(null);
          setForm(buildEmptyBlogContent(componentKey as BlogPageContentKeys));
        }
      }
    } catch (error) {
      toast.error("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  }, [componentKey]);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleEdit = (record: ComponentContent) => {
    setEditingId(record._id);
    setForm(record);
    if (blogPageKeys.some(k => k.key === record.key)) {
      router.push(`?component=${record.key}`);
    } else {
      router.push("/blogs-page-management");
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      key: `blog.${Date.now()}`,
      label: "",
      page: "blog",
      isActive: true,
      data: {
        title: "",
        author: "",
        date: new Date().toISOString().split('T')[0],
        category: "",
        image: "",
        excerpt: "",
        content: ""
      },
    });
    router.push("/blogs-page-management");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let label = (form.data as any).title || form.label || "Untitled Blog";
      if (componentKey && blogPageKeys.some(k => k.key === componentKey)) {
        label = blogPageKeys.find(k => k.key === componentKey)?.label || label;
      }

      const payload = { ...form, label, page: "blog" };
      if (editingId) {
        await componentContentApi.update(editingId, payload);
      } else {
        const created = await componentContentApi.create(payload as Omit<ComponentContent, "_id">);
        if (componentKey && created && created.key) {
          router.push(`?component=${created.key}`);
        }
      }
      toast.success("Blog saved successfully!");
      if (!componentKey) resetForm();
      refresh();
    } catch {
      toast.error("Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await componentContentApi.remove(id);
      toast.success("Blog deleted");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const updateData = (field: string, value: any) => {
    setForm({ ...form, data: { ...(form.data as any), [field]: value } });
  };

  const onReorder = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(records);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setRecords(items);
    try {
      await Promise.all(items.map((item, index) => componentContentApi.update(item._id, { index })));
      toast.success("Order updated");
    } catch (error) {
      toast.error("Failed to update order");
      refresh();
    }
  };

  const data = (form.data || {}) as any;

  const renderFeaturedArticlesForm = () => {
    const articles = data.articles || [];
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider">Featured Articles</h4>
        <p className="text-xs text-gray-500 italic">Individual blog posts are managed in the standard blog list below. This section displays selected highlights.</p>
      </div>
    );
  };

  const renderHeroForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>Title <input className={fieldClass} value={data.title || ""} onChange={e => updateData("title", e.target.value)} /></label>
        <label className={labelClass}>Heading <input className={fieldClass} value={data.heading || ""} onChange={e => updateData("heading", e.target.value)} /></label>
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Description</label>
        <RichTextEditor value={data.description || ""} onChange={val => updateData("description", val)} placeholder="Enter hero description..." minHeight="120px" />
      </div>
      <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="blog.hero.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => updateData("bgImage", url)} />
    </div>
  );

  const renderExpertsForm = () => {
    const experts = data.experts || [];
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider">Voice of Experts</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => updateData("experts", [...experts, { id: randomId(), image: '', description: '', name: '', designation: '' }])}>Add Expert</button>
        </div>
        {experts.map((exp: any, idx: number) => (
          <div key={exp.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-3 shadow-sm">
            <button type="button" onClick={() => updateData("experts", experts.filter((_: any, i: number) => i !== idx))} className="absolute top-2 right-2 text-red-500"><Trash2 size={16} /></button>
            <div className="grid grid-cols-2 gap-4">
              <input className={fieldClass} placeholder="Name" value={exp.name || ""} onChange={e => { const ne = [...experts]; ne[idx] = { ...ne[idx], name: e.target.value }; updateData("experts", ne); }} />
              <input className={fieldClass} placeholder="Designation" value={exp.designation || ""} onChange={e => { const ne = [...experts]; ne[idx] = { ...ne[idx], designation: e.target.value }; updateData("experts", ne); }} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Expert Insights</label>
              <RichTextEditor value={exp.description || ""} onChange={val => { const ne = [...experts]; ne[idx] = { ...ne[idx], description: val }; updateData("experts", ne); }} placeholder="Short expert description..." minHeight="100px" />
            </div>
            <ImageUploadField label="Expert Image" value={exp.image} fieldKey={`expert.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const ne = [...experts]; ne[idx] = { ...ne[idx], image: url }; updateData("experts", ne); }} />
          </div>
        ))}
      </div>
    );
  };

  const renderMediaForm = () => {
    const items = data.blogsMedia || [];
    const report = data.reportResource || { title: '', description: '', buttonLabel: '', buttonHref: '', image: '' };
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase tracking-wider">Blogs Media Configuration</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => updateData("blogsMedia", [...items, { id: randomId(), title: '', description: '', buttonLabel: '', buttonHref: '', image: '' }])}>Add Media Card</button>
        </div>
        {items.map((item: any, idx: number) => (
          <div key={item.id} className="p-4 border rounded-xl bg-white space-y-3 relative shadow-sm">
            <button type="button" onClick={() => updateData("blogsMedia", items.filter((_: any, i: number) => i !== idx))} className="absolute top-2 right-2 text-red-500"><Trash2 size={16} /></button>
            <input className={fieldClass} placeholder="Title" value={item.title || ""} onChange={e => { const ni = [...items]; ni[idx] = { ...ni[idx], title: e.target.value }; updateData("blogsMedia", ni); }} />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
              <RichTextEditor value={item.description || ""} onChange={val => { const ni = [...items]; ni[idx] = { ...ni[idx], description: val }; updateData("blogsMedia", ni); }} placeholder="Card description..." minHeight="100px" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input className={fieldClass} placeholder="Button Label" value={item.buttonLabel || ""} onChange={e => { const ni = [...items]; ni[idx] = { ...ni[idx], buttonLabel: e.target.value }; updateData("blogsMedia", ni); }} />
              <input className={fieldClass} placeholder="Button Href" value={item.buttonHref || ""} onChange={e => { const ni = [...items]; ni[idx] = { ...ni[idx], buttonHref: e.target.value }; updateData("blogsMedia", ni); }} />
            </div>
            <ImageUploadField label="Image" value={item.image} fieldKey={`media.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const ni = [...items]; ni[idx] = { ...ni[idx], image: url }; updateData("blogsMedia", ni); }} />
          </div>
        ))}

        <div className="p-4 border-t pt-6">
          <h4 className="text-xs font-bold text-[#8d6a3a] mb-4 uppercase tracking-wider">Report Resource (Single Item)</h4>
          <div className="p-4 border rounded-xl bg-amber-50/30 space-y-3 relative">
            <input className={fieldClass} placeholder="Report Title" value={report.title || ""} onChange={e => updateData("reportResource", { ...report, title: e.target.value })} />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
              <RichTextEditor value={report.description || ""} onChange={val => updateData("reportResource", { ...report, description: val })} placeholder="Report description..." minHeight="80px" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input className={fieldClass} placeholder="Button Label" value={report.buttonLabel || ""} onChange={e => updateData("reportResource", { ...report, buttonLabel: e.target.value })} />
              <input className={fieldClass} placeholder="Button Href" value={report.buttonHref || ""} onChange={e => updateData("reportResource", { ...report, buttonHref: e.target.value })} />
            </div>
            <ImageUploadField label="Report Cover" value={report.image} fieldKey="report.cover" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => updateData("reportResource", { ...report, image: url })} />
          </div>
        </div>
      </div>
    );
  };

  const renderStayInspiredForm = () => (
    <div className="space-y-4">
      <label className={labelClass}>Title <input className={fieldClass} value={data.title || ""} onChange={e => updateData("title", e.target.value)} /></label>
      <div className="space-y-1">
        <label className={labelClass}>Description</label>
        <RichTextEditor value={data.description || ""} onChange={val => updateData("description", val)} placeholder="Enter subscription text..." minHeight="120px" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>Button Label <input className={fieldClass} value={data.buttonLabel || ""} onChange={e => updateData("buttonLabel", e.target.value)} /></label>
        <label className={labelClass}>Button Href <input className={fieldClass} value={data.buttonHref || ""} onChange={e => updateData("buttonHref", e.target.value)} /></label>
      </div>
    </div>
  );

  const renderSupportWellnessForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>Title <input className={fieldClass} value={data.title || ""} onChange={e => updateData("title", e.target.value)} /></label>
        <ImageUploadField label="Icon Image" value={data.iconImage} fieldKey="well.icon" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => updateData("iconImage", url)} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Description</label>
        <RichTextEditor value={data.description || ""} onChange={val => updateData("description", val)} placeholder="Enter support text..." minHeight="120px" />
      </div>
      <div className="grid grid-cols-2 gap-3 p-3 border rounded bg-gray-50">
        <div className="space-y-2 col-span-2">
          <h4 className="text-[10px] font-bold text-[#8d6a3a] uppercase">Action Button</h4>
          <div className="grid grid-cols-2 gap-2">
            <input className={fieldClass} placeholder="Label" value={data.primaryButton?.label || ""} onChange={e => updateData("primaryButton", { ...data.primaryButton, label: e.target.value })} />
            <input className={fieldClass} placeholder="URL" value={data.primaryButton?.href || ""} onChange={e => updateData("primaryButton", { ...data.primaryButton, href: e.target.value })} />
          </div>
        </div>
      </div>
      <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="well.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => updateData("bgImage", url)} />
    </div>
  );

  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#8d6a3a]" size={40} /></div>}>
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
      <div className="space-y-6">
        <form onSubmit={handleSave} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#fcfaf7] border-b p-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl">{editingId ? (componentKey ? `Edit ${form.label}` : "Edit Blog Post") : (componentKey ? `Create ${blogPageKeys.find(k => k.key === componentKey)?.label}` : "Create New Blog")}</h2>
            <div className="flex gap-3">
              {(editingId || componentKey) && <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel / New Blog</button>}
              <button type="submit" disabled={loading} className="bg-[#8d6a3a] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Blog
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-4 p-4 bg-slate-50 rounded-xl">
              <label className={labelClass}>Section Template / Page Management
                <select 
                  className={fieldClass} 
                  value={componentKey || ""} 
                  onChange={e => {
                    const key = e.target.value;
                    if (key === "") router.push("/blogs-page-management");
                    else router.push(`?component=${key}`);
                  }}
                >
                  <option value="">-- Individual Blog Post (Standard) --</option>
                  {blogPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
              </label>
              <label className={labelClass}>Visibility <div className="mt-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /></div></label>
            </div>

            {componentKey === "blog.hero" && renderHeroForm()}
            {componentKey === "blog.featuredArticles" && renderFeaturedArticlesForm()}
            {componentKey === "blog.voiceOfExperts" && renderExpertsForm()}
            {componentKey === "blog.mediaResources" && renderMediaForm()}
            {componentKey === "blog.stayInspired" && renderStayInspiredForm()}
            {componentKey === "blog.supportWellness" && renderSupportWellnessForm()}

            {!componentKey && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className={labelClass}>Blog Title</label>
                        <span className={`text-[10px] font-bold ${(data.title || "").length > 65 ? 'text-red-500' : 'text-slate-400'}`}>
                          {(data.title || "").length} / 65
                        </span>
                      </div>
                      <input className={fieldClass} value={data.title || ""} onChange={e => updateData("title", e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <label className={labelClass}><span className="flex items-center gap-2"><User size={14}/> Author</span> <input className={fieldClass} value={data.author || ""} onChange={e => updateData("author", e.target.value)} /></label>
                      <label className={labelClass}><span className="flex items-center gap-2"><Calendar size={14}/> Date</span> <input type="date" className={fieldClass} value={data.date || ""} onChange={e => updateData("date", e.target.value)} /></label>
                    </div>
                    <label className={labelClass}><span className="flex items-center gap-2"><Tag size={14}/> Category</span> <input className={fieldClass} value={data.category || ""} onChange={e => updateData("category", e.target.value)} /></label>
                  </div>
                  <div className="space-y-4">
                    <ImageUploadField label="Featured Image" value={data.image} fieldKey="blog.image" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => updateData("image", url)} />
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className={labelClass}>Short Excerpt</label>
                        <span className={`text-[10px] font-bold ${(data.excerpt || "").length > 155 ? 'text-red-500' : 'text-slate-400'}`}>
                          {(data.excerpt || "").length} / 155
                        </span>
                      </div>
                      <textarea className={fieldClass} rows={2} value={data.excerpt || ""} onChange={e => updateData("excerpt", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className={labelClass}>Full Blog Content</label>
                  <div className="mt-2">
                    <RichTextEditor value={data.content || ""} onChange={val => updateData("content", val)} minHeight="400px" />
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Saved Blogs</h3>
          <ComponentList 
            records={records} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onReorder={onReorder}
            editingId={editingId} 
          />
        </div>
      </aside>
    </div>
    </Suspense>
  );
}