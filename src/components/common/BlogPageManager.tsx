"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DropResult } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import { Loader2, Plus, Save, Trash2, Calendar, User, Tag } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ComponentList from "./ComponentList";
import { buildEmptyBlogContent, BlogPageContentKeys, blogPageKeys } from "./blogPageContent";

const randomId = () => Math.random().toString(36).slice(2, 9);

// Compact shared styles
const cardClass = "p-2 border rounded-lg bg-gray-50 space-y-1.5 relative";
const cardClassWhite = "p-2 border rounded-lg bg-white space-y-1.5 relative shadow-sm";
const sectionHeaderClass = "text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide";
const addBtnClass = "text-[11px] bg-[#263016] text-white px-2 py-1 rounded";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";
const richTextLabelClass = "text-[10px] font-bold text-gray-400 uppercase";

export default function BlogPageManager() {
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ message: string; id: string } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const componentKey = searchParams.get("component");

  const [form, setForm] = useState<Partial<ComponentContent>>({
    key: `blog.${Date.now()}`,
    label: "",
    page: "blog",
    isActive: true,
    data: {},
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
    try {
      await componentContentApi.remove(id);
      toast.success("Blog deleted");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const confirmDeleteClick = (id: string, message: string) => setPendingDelete({ id, message });

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
    return (
      <div className="space-y-2">
        <h4 className={sectionHeaderClass}>Featured Articles</h4>
        <p className="text-xs text-gray-500 italic">Individual blog posts are managed in the standard blog list below. This section displays selected highlights.</p>
      </div>
    );
  };
  const renderFeaturesStripForm = () => {
  const items = data.items || [];
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className={sectionHeaderClass}>Stats Strip Items</h4>
        <button
          type="button"
          className={addBtnClass}
          onClick={() => updateData("items", [...items, { id: randomId(), title: "", description: "", imageurl: { imageUrl: "", alt: "" } }])}
        >
          + Add Stat
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {items.map((item: any, idx: number) => (
          <div key={item.id} className={cardClass}>
            <button
              type="button"
              onClick={() => updateData("items", items.filter((_: any, i: number) => i !== idx))}
              className="absolute top-1 right-1 text-red-500"
            >
              <Trash2 size={12} />
            </button>

            <input
              className={smallFieldClass}
              placeholder="Value Label"
              value={item.title || ""}
              onChange={(e) => {
                const ni = [...items];
                ni[idx] = { ...ni[idx], title: e.target.value };
                updateData("items", ni);
              }}
            />

            <input
              className={smallFieldClass}
              placeholder="Subtitle"
              value={item.description || ""}
              onChange={(e) => {
                const ni = [...items];
                ni[idx] = { ...ni[idx], description: e.target.value };
                updateData("items", ni);
              }}
            />

            <input
              className={smallFieldClass}
              value={item.imageurl?.alt || ""}
              placeholder="Image Alt Text"
              onChange={(e) => {
                const ni = [...items];
                ni[idx] = { ...ni[idx], imageurl: { ...ni[idx].imageurl, alt: e.target.value } };
                updateData("items", ni);
              }}
            />

            <ImageUploadField
              label="Icon"
              value={item.imageurl?.imageUrl}
              fieldKey={`fstrip.${idx}`}
              uploadingField={uploadingField}
              onUploadingChange={setUploadingField}
              onError={(m) => toast.error(m)}
              onUpload={(url) => {
                const ni = [...items];
                ni[idx] = { ...ni[idx], imageurl: { ...ni[idx].imageurl, imageUrl: url } };
                updateData("items", ni);
              }}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => updateData("items", [...items, { id: randomId(), title: "", description: "", imageurl: { imageUrl: "", alt: "" } }])}
          className="border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 py-6 hover:bg-gray-50 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

  const renderHeroForm = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 items-end">
        <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => updateData("title", e.target.value)} /></label>
        <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading || ""} onChange={e => updateData("heading", e.target.value)} /></label>
        <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="blog.hero.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => updateData("bgImage", url)} />
      </div>
      <div className="space-y-1">
        <label className={smallLabelClass}>Description</label>
        <RichTextEditor value={data.description || ""} onChange={val => updateData("description", val)} placeholder="Enter hero description..." minHeight="80px" />
      </div>
    </div>
  );

  const renderExpertsForm = () => {
    const experts = data.experts || [];
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Voice of Experts</h4>
          <button type="button" className={addBtnClass} onClick={() => updateData("experts", [...experts, { id: randomId(), image: '', description: '', name: '', designation: '' }])}>+ Add Expert</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
        {experts.map((exp: any, idx: number) => (
          <div key={exp.id} className={cardClass}>
            <button type="button" onClick={() => updateData("experts", experts.filter((_: any, i: number) => i !== idx))} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
            <div className="grid grid-cols-2 gap-2">
              <input className={smallFieldClass} placeholder="Name" value={exp.name || ""} onChange={e => { const ne = [...experts]; ne[idx] = { ...ne[idx], name: e.target.value }; updateData("experts", ne); }} />
              <input className={smallFieldClass} placeholder="Designation" value={exp.designation || ""} onChange={e => { const ne = [...experts]; ne[idx] = { ...ne[idx], designation: e.target.value }; updateData("experts", ne); }} />
            </div>
            <div className="space-y-1">
              <label className={richTextLabelClass}>Expert Insights</label>
              <RichTextEditor value={exp.description || ""} onChange={val => { const ne = [...experts]; ne[idx] = { ...ne[idx], description: val }; updateData("experts", ne); }} placeholder="Short expert description..." minHeight="70px" />
            </div>
            <ImageUploadField label="Expert Image" value={exp.image} fieldKey={`expert.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const ne = [...experts]; ne[idx] = { ...ne[idx], image: url }; updateData("experts", ne); }} />
          </div>
        ))}
        </div>
      </div>
    );
  };

  const renderMediaForm = () => {
    const items = data.blogsMedia || [];
    const report = data.reportResource || { title: '', description: '', buttonLabel: '', buttonHref: '', image: '' };
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Blogs Media Configuration</h4>
          <button type="button" className={addBtnClass} onClick={() => updateData("blogsMedia", [...items, { id: randomId(), title: '', description: '', buttonLabel: '', buttonHref: '', image: '' }])}>+ Add Media Card</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
        {items.map((item: any, idx: number) => (
          <div key={item.id} className={cardClassWhite}>
            <button type="button" onClick={() => updateData("blogsMedia", items.filter((_: any, i: number) => i !== idx))} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
            <input className={smallFieldClass} placeholder="Title" value={item.title || ""} onChange={e => { const ni = [...items]; ni[idx] = { ...ni[idx], title: e.target.value }; updateData("blogsMedia", ni); }} />
            <div className="space-y-1">
              <label className={richTextLabelClass}>Description</label>
              <RichTextEditor value={item.description || ""} onChange={val => { const ni = [...items]; ni[idx] = { ...ni[idx], description: val }; updateData("blogsMedia", ni); }} placeholder="Card description..." minHeight="70px" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={smallFieldClass} placeholder="Button Label" value={item.buttonLabel || ""} onChange={e => { const ni = [...items]; ni[idx] = { ...ni[idx], buttonLabel: e.target.value }; updateData("blogsMedia", ni); }} />
              <input className={smallFieldClass} placeholder="Button Href" value={item.buttonHref || ""} onChange={e => { const ni = [...items]; ni[idx] = { ...ni[idx], buttonHref: e.target.value }; updateData("blogsMedia", ni); }} />
            </div>
            <ImageUploadField label="Image" value={item.image} fieldKey={`media.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const ni = [...items]; ni[idx] = { ...ni[idx], image: url }; updateData("blogsMedia", ni); }} />
          </div>
        ))}
        </div>

        <div className="pt-2 border-t">
          <h4 className={`${sectionHeaderClass} mb-2`}>Report Resource (Single Item)</h4>
          <div className="p-2 border rounded-lg bg-amber-50/30 space-y-1.5 relative">
            <div className="grid grid-cols-2 gap-2">
              <input className={smallFieldClass} placeholder="Report Title" value={report.title || ""} onChange={e => updateData("reportResource", { ...report, title: e.target.value })} />
              <ImageUploadField label="Report Cover" value={report.image} fieldKey="report.cover" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => updateData("reportResource", { ...report, image: url })} />
            </div>
            <div className="space-y-1">
              <label className={richTextLabelClass}>Description</label>
              <RichTextEditor value={report.description || ""} onChange={val => updateData("reportResource", { ...report, description: val })} placeholder="Report description..." minHeight="60px" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={smallFieldClass} placeholder="Button Label" value={report.buttonLabel || ""} onChange={e => updateData("reportResource", { ...report, buttonLabel: e.target.value })} />
              <input className={smallFieldClass} placeholder="Button Href" value={report.buttonHref || ""} onChange={e => updateData("reportResource", { ...report, buttonHref: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStayInspiredForm = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => updateData("title", e.target.value)} /></label>
        <label className={smallLabelClass}>Button Label <input className={smallFieldClass} value={data.buttonLabel || ""} onChange={e => updateData("buttonLabel", e.target.value)} /></label>
        <label className={smallLabelClass}>Button Href <input className={smallFieldClass} value={data.buttonHref || ""} onChange={e => updateData("buttonHref", e.target.value)} /></label>
      </div>
      <div className="space-y-1">
        <label className={smallLabelClass}>Description</label>
        <RichTextEditor value={data.description || ""} onChange={val => updateData("description", val)} placeholder="Enter subscription text..." minHeight="80px" />
      </div>
    </div>
  );

  const renderSupportWellnessForm = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 items-end">
        <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => updateData("title", e.target.value)} /></label>
        <ImageUploadField label="Icon Image" value={data.iconImage} fieldKey="well.icon" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => updateData("iconImage", url)} />
        <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="well.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => updateData("bgImage", url)} />
      </div>
      <div className="space-y-1">
        <label className={smallLabelClass}>Description</label>
        <RichTextEditor value={data.description || ""} onChange={val => updateData("description", val)} placeholder="Enter support text..." minHeight="80px" />
      </div>
      <div className="p-2 border rounded-lg bg-gray-50 space-y-1">
        <h4 className="text-[10px] font-bold text-[#8d6a3a] uppercase">Action Button</h4>
        <div className="grid grid-cols-2 gap-2">
          <input className={smallFieldClass} placeholder="Label" value={data.primaryButton?.label || ""} onChange={e => updateData("primaryButton", { ...data.primaryButton, label: e.target.value })} />
          <input className={smallFieldClass} placeholder="URL" value={data.primaryButton?.href || ""} onChange={e => updateData("primaryButton", { ...data.primaryButton, href: e.target.value })} />
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#8d6a3a]" size={32} /></div>}> {/* Moved Suspense to wrap the entire component */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr] gap-4">
        <div className="space-y-4">
          <form onSubmit={handleSave} className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#fcfaf7] border-b p-3 flex items-center justify-between">
             <h2 className=" text-base">
  {componentKey 
    ? (editingId ? `Edit ${form.label}` : `Create ${blogPageKeys.find(k => k.key === componentKey)?.label}`)
    : "Blog Page Management"
  }
</h2>
              <div className="flex gap-2">
                {(editingId || componentKey) && <button type="button" onClick={resetForm} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700">Cancel / New Blog</button>}
                <button type="submit" disabled={loading} className="bg-[#8d6a3a] text-white px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5">
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save Blog
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 p-2 bg-slate-50 rounded-lg items-end">
                <label className={smallLabelClass}>Section Template / Page Management
                  <select
                    className={smallFieldClass}
                    value={componentKey || ""}
                    onChange={e => {
                      const key = e.target.value;
                      if (key === "") router.push("/blogs-page-management");
                      else router.push(`?component=${key}`);
                    }}
                  >
                    {/* <option value="">-- Individual Blog Post (Standard) --</option> */}
                    {blogPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-[#5f5a50] font-semibold pb-1">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Visibility
                </label>
              </div>

              {componentKey === "blog.hero" && renderHeroForm()}
              {componentKey === "blog.featuredArticles" && renderFeaturedArticlesForm()}
              {componentKey === "blog.voiceOfExperts" && renderExpertsForm()}
              {componentKey === "blog.mediaResources" && renderMediaForm()}
              {componentKey === "blog.stayInspired" && renderStayInspiredForm()}
              {componentKey === "blog.supportWellness" && renderSupportWellnessForm()}
{componentKey === "blog.features_strip" && renderFeaturesStripForm()}
            </div>
          </form>
        </div>

        {/* <aside className="space-y-4">
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
      </aside> */}
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
    </Suspense>
  );
}