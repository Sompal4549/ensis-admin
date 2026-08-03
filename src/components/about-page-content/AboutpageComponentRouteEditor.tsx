"use client";

import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import {
  aboutpageKeys,
  defaultAboutpageData,
  type AboutPageContentKeys,
  type AboutPageData,
  type AboutHero,
  type AboutStatsStrip,
  type AboutOurStory,
  type AboutWhyChooseEnsis,
  type AboutOurExpertise,
  type AboutOurTurnkeyProcess,
  type AboutIndustriesWeServe,
  type TestimonialsData,
  type AboutFounderVision,
  type AboutLetsBuild,
  type HeaderData,
  type FooterData,
} from "@/lib/about/aboutPageContent";
import { fieldClass, labelClass } from "@/constants";



type ContentForm = Omit<ComponentContent, "_id"> & { key: AboutPageContentKeys };

const randomId = () => Math.random().toString(36).slice(2, 9);

// Compact shared styles
const cardClass = "p-2 border rounded bg-gray-50 space-y-1.5 relative";
const sectionHeaderClass = "text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide";
const addBtnClass = "text-[11px] bg-[#263016] text-white px-2 py-1 rounded";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";

export default function AboutpageComponentRouteEditor({ componentKey, title }: { componentKey: AboutPageContentKeys | "layout.header" | "layout.footer", title: string }) {
  const [form, setForm] = useState<ContentForm>({
    key: componentKey as AboutPageContentKeys,
    label: title,
    page: "about",
    description: "",
    isActive: true,
    data: ((defaultAboutpageData[componentKey as AboutPageContentKeys] || {}) as unknown) as AboutPageData,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      const existing = list.find(r => r.key === componentKey);
      if (existing) {
        setEditingId(existing._id);
        setForm({
          key: existing.key as AboutPageContentKeys,
          label: existing.label,
          page: existing.page || "about",
          description: existing.description || "",
          isActive: existing.isActive,
          data: (existing.data as unknown) as AboutPageData,
        });
      } else {
        setEditingId(null);
        const keyInfo = aboutpageKeys.find(k => k.key === componentKey);
        setForm(prev => ({
          ...prev,
          key: componentKey as AboutPageContentKeys,
          label: keyInfo?.label || title,
          description: keyInfo?.description || "",
          data: ((defaultAboutpageData[componentKey as AboutPageContentKeys] || {}) as unknown) as AboutPageData,
        }));
      }
    } catch (error) {
      toast.error("Failed to load components.");
    } finally {
      setLoading(false);
    }
  }, [componentKey, title]);

  useEffect(() => { refresh(); }, [refresh]);

  const setData = (nextData: AboutPageData) => setForm((current) => ({ ...current, data: nextData }));

  const handleKeyChange = (key: AboutPageContentKeys) => {
    const keyInfo = aboutpageKeys.find(k => k.key === key);
    setEditingId(null);
    setForm(prev => ({
      ...prev,
      key,
      label: keyInfo?.label || prev.label,
      description: keyInfo?.description || prev.description,
      data: defaultAboutpageData[key]
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
    if (!confirm("Are you sure?")) return;
    try {
      await componentContentApi.remove(id);
      toast.success("Component deleted");
    } catch {
      toast.error("Delete failed");
    }
    setEditingId(null);
    refresh();
  };

  // Sub-forms for specific component types
  const renderHeroForm = () => {
    const data = form.data as AboutHero;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 items-end">
          <ImageUploadField label="Background Image" value={data.image?.imageUrl} fieldKey="hero.image" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, image: { ...data.image, imageUrl: url } })} />
          <label className={smallLabelClass}>Image Alt Text <input className={smallFieldClass} value={data.image?.alt || ""} onChange={e => setData({ ...data, image: { ...data.image, alt: e.target.value } })} /></label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
           <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading || ""} onChange={e => setData({ ...data, heading: e.target.value })} /></label>
          <label className={smallLabelClass}>Highlight <input className={smallFieldClass} value={data.highlight || ""} onChange={e => setData({ ...data, highlight: e.target.value })} /></label>
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-2 p-2 border rounded bg-gray-50">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">PRIMARY ACTION</h4>
            <div className="grid grid-cols-2 gap-1">
              <input className={smallFieldClass} placeholder="Label" value={data.primaryAction?.label || ""} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, label: e.target.value } })} />
              <input className={smallFieldClass} placeholder="URL" value={data.primaryAction?.url || ""} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, url: e.target.value } })} />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">SECONDARY ACTION</h4>
            <div className="grid grid-cols-2 gap-1">
              <input className={smallFieldClass} placeholder="Label" value={data.secondaryAction?.label || ""} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, label: e.target.value } })} />
              <input className={smallFieldClass} placeholder="URL" value={data.secondaryAction?.url || ""} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, url: e.target.value } })} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOurStoryForm = () => {
    const data = form.data as AboutOurStory;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading || ""} onChange={e => setData({ ...data, heading: e.target.value })} /></label>
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <div className="row-span-1"><ImageUploadField label="Side Image" value={data.imageurl?.imageUrl} fieldKey="story.image" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, imageurl: { ...data.imageurl, imageUrl: url } })} /></div>
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Story Stats</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, stats: [...data.stats, { id: randomId(), title: '', subtitle: '', imageurl: { imageUrl: '', alt: '' } }] })}>+ Add Stat</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.stats.map((s, idx) => (
              <div key={s.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, stats: data.stats.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Stat Title" value={s.title || ""} onChange={e => { const ns = [...data.stats]; ns[idx].title = e.target.value; setData({ ...data, stats: ns }); }} />
                <input className={smallFieldClass} placeholder="Subtitle" value={s.subtitle || ""} onChange={e => { const ns = [...data.stats]; ns[idx].subtitle = e.target.value; setData({ ...data, stats: ns }); }} />
                <ImageUploadField label="Icon" value={s.imageurl?.imageUrl} fieldKey={`story.stat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => {
                  const ns = [...data.stats]; ns[idx].imageurl = { ...ns[idx].imageurl, imageUrl: url }; setData({ ...data, stats: ns });
                }} />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Core Values</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, ourCoreValues: [...data.ourCoreValues, { id: randomId(), title: '', imageurl: { imageUrl: '', alt: '' } }] })}>+ Add Value</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {data.ourCoreValues.map((v, idx) => (
              <div key={v.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, ourCoreValues: data.ourCoreValues.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Value Title" value={v.title || ""} onChange={e => {
                  const nv = [...data.ourCoreValues]; nv[idx].title = e.target.value; setData({ ...data, ourCoreValues: nv });
                }} />
                <ImageUploadField label="Icon" value={v.imageurl?.imageUrl} fieldKey={`story.value.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => {
                  const nv = [...data.ourCoreValues]; nv[idx].imageurl = { ...nv[idx].imageurl, imageUrl: url }; setData({ ...data, ourCoreValues: nv });
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderExpertiseForm = () => {
    const data = form.data as AboutOurExpertise;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>Section Title <input className={smallFieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Expertise Items</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, items: [...(data.items || []), { id: randomId(), title: '', description: '', imageurl: { imageUrl: '', alt: '' }, linkUrl: '' }] })}>+ Add Item</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
        {(data.items || []).map((item, idx) => (
          <div key={item.id} className={cardClass}>
            <button type="button" onClick={() => setData({ ...data, items: data.items.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
            <input className={smallFieldClass} placeholder="Title" value={item.title || ""} onChange={e => { const ni = data.items.map((it, i) => i === idx ? { ...it, title: e.target.value } : it); setData({ ...data, items: ni }); }} />
            <input className={smallFieldClass} placeholder="Link URL" value={item.linkUrl || ""} onChange={e => { const ni = data.items.map((it, i) => i === idx ? { ...it, linkUrl: e.target.value } : it); setData({ ...data, items: ni }); }} />
            <textarea className={smallFieldClass} placeholder="Description" rows={2} value={item.description || ""} onChange={e => { const ni = data.items.map((it, i) => i === idx ? { ...it, description: e.target.value } : it); setData({ ...data, items: ni }); }} />
            <ImageUploadField label="Thumbnail" value={item.imageurl?.imageUrl} fieldKey={`exp.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ni = data.items.map((it, i) => i === idx ? { ...it, imageurl: { ...it.imageurl, imageUrl: url } } : it); setData({ ...data, items: ni }); }} />
          </div>
        ))}
        </div>
      </div>
    );
  };

  const renderStatsStripForm = () => {
    const data = form.data as AboutStatsStrip;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Stat Items</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, stats: [...(data.stats || []), { id: randomId(), label: '', imageurl: { imageUrl: '', alt: '' }, subtitle: '' }] })}>+ Add Stat</button>
        </div>
        <div className="grid grid-cols-4 gap-2">
        {(data.stats || []).map((stat, idx) => (
          <div key={stat.id} className={cardClass}>
            <button type="button" onClick={() => setData({ ...data, stats: data.stats.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
            <label className={smallLabelClass}>Value <input className={smallFieldClass} value={stat.label || ""} onChange={e => { const ns = data.stats.map((s, i) => i === idx ? { ...s, label: e.target.value } : s); setData({ ...data, stats: ns }); }} /></label>
            <label className={smallLabelClass}>Subtitle <input className={smallFieldClass} value={stat.subtitle || ""} onChange={e => { const ns = data.stats.map((s, i) => i === idx ? { ...s, subtitle: e.target.value } : s); setData({ ...data, stats: ns }); }} /></label>
            <ImageUploadField label="Icon" value={stat.imageurl?.imageUrl} fieldKey={`stat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ns = data.stats.map((s, i) => i === idx ? { ...s, imageurl: { ...s.imageurl, imageUrl: url } } : s); setData({ ...data, stats: ns }); }} />
          </div>
        ))}
        </div>
      </div>
    );
  };

  const renderWhyChooseEnsisForm = () => {
    const data = form.data as AboutWhyChooseEnsis;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 items-end">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Main Image Alt <input className={smallFieldClass} placeholder="Image Alt" value={data.imageurl?.alt || ""} onChange={e => setData({ ...data, imageurl: { ...data.imageurl, alt: e.target.value } })} /></label>
          <ImageUploadField label="Main Image" value={data.imageurl?.imageUrl} fieldKey="why.main" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, imageurl: { ...data.imageurl, imageUrl: url } })} />
        </div>
        <div className="space-y-1">
          <label className={smallLabelClass}>Description</label>
          <RichTextEditor value={data.description || ""} onChange={val => setData({ ...data, description: val })} placeholder="Enter section description..." minHeight="80px" />
        </div>

        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Experience Cards</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, experience: [...(data.experience || []), { id: randomId(), title: '', description: '', imageurl: { imageUrl: '', alt: '' } }] })}>+ Add Card</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
        {(data.experience || []).map((item, idx) => (
          <div key={item.id} className={cardClass}>
            <button type="button" onClick={() => setData({ ...data, experience: data.experience.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
            <input className={smallFieldClass} placeholder="Title" value={item.title || ""} onChange={e => { const ne = data.experience.map((ex, i) => i === idx ? { ...ex, title: e.target.value } : ex); setData({ ...data, experience: ne }); }} />
            <RichTextEditor value={item.description || ""} onChange={val => { const ne = data.experience.map((ex, i) => i === idx ? { ...ex, description: val } : ex); setData({ ...data, experience: ne }); }} placeholder="Card description..." minHeight="70px" />
            <ImageUploadField label="Icon" value={item.imageurl?.imageUrl} fieldKey={`why.item.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ne = data.experience.map((ex, i) => i === idx ? { ...ex, imageurl: { ...ex.imageurl, imageUrl: url } } : ex); setData({ ...data, experience: ne }); }} />
          </div>
        ))}
        </div>
      </div>
    );
  };

  const renderTurnkeyProcessForm = () => {
    const data = form.data as AboutOurTurnkeyProcess;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 items-end">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Diagram Alt <input className={smallFieldClass} placeholder="Diagram Alt" value={data.imageurl?.alt || ""} onChange={e => setData({ ...data, imageurl: { ...data.imageurl, alt: e.target.value } })} /></label>
          <ImageUploadField label="Process Diagram" value={data.imageurl?.imageUrl} fieldKey="process.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, imageurl: { ...data.imageurl, imageUrl: url } })} />
        </div>
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Process Steps</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, steps: [...(data.steps || []), { id: randomId(), title: '', description: '', imageurl: { imageUrl: '', alt: '' } }] })}>+ Add Step</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
        {(data.steps || []).map((step, idx) => (
          <div key={step.id} className={cardClass}>
            <button type="button" onClick={() => setData({ ...data, steps: data.steps.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
            <input className={smallFieldClass} placeholder="Step Title" value={step.title || ""} onChange={e => { const ns = data.steps.map((s, i) => i === idx ? { ...s, title: e.target.value } : s); setData({ ...data, steps: ns }); }} />
            <ImageUploadField label="Step Icon" value={step.imageurl?.imageUrl} fieldKey={`process.step.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ns = data.steps.map((s, i) => i === idx ? { ...s, imageurl: { ...s.imageurl, imageUrl: url } } : s); setData({ ...data, steps: ns }); }} />
            <input className={smallFieldClass} placeholder="Image Alt Text" value={step.imageurl?.alt || ""} onChange={e => { const ns = data.steps.map((s, i) => i === idx ? { ...s, imageurl: { ...s.imageurl, alt: e.target.value } } : s); setData({ ...data, steps: ns }); }} />
          </div>
        ))}
        </div>
      </div>
    );
  };

  const renderIndustriesWeServeForm = () => {
    const data = form.data as AboutIndustriesWeServe;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>Section Title <input className={smallFieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Industries</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, industries: [...(data.industries || []), { id: randomId(), title: '', imageurl: { imageUrl: '', alt: '' }, linkUrl: '' }] })}>+ Add Industry</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(data.industries || []).map((ind, idx) => (
            <div key={ind.id} className={cardClass}>
              <button type="button" onClick={() => setData({ ...data, industries: data.industries.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
              <input className={smallFieldClass} placeholder="Name" value={ind.title || ""} onChange={e => { const ni = data.industries.map((it, i) => i === idx ? { ...it, title: e.target.value } : it); setData({ ...data, industries: ni }); }} />
              <input className={smallFieldClass} placeholder="Link URL" value={ind.linkUrl || ""} onChange={e => { const ni = data.industries.map((it, i) => i === idx ? { ...it, linkUrl: e.target.value } : it); setData({ ...data, industries: ni }); }} />
              <ImageUploadField label="Industry Image" value={ind.imageurl?.imageUrl} fieldKey={`ind.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ni = data.industries.map((it, i) => i === idx ? { ...it, imageurl: { ...it.imageurl, imageUrl: url } } : it); setData({ ...data, industries: ni }); }} />
              <input className={smallFieldClass} placeholder="Image Alt Text" value={ind.imageurl?.alt || ""} onChange={e => { const ni = data.industries.map((it, i) => i === idx ? { ...it, imageurl: { ...it.imageurl, alt: e.target.value } } : it); setData({ ...data, industries: ni }); }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLetsBuildForm = () => {
    const data = form.data as AboutLetsBuild;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <ImageUploadField label="CTA Background" value={data.imageurl?.imageUrl} fieldKey="cta.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, imageurl: { ...data.imageurl, imageUrl: url } })} />
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <input className={smallFieldClass} placeholder="Background Alt" value={data.imageurl?.alt || ""} onChange={e => setData({ ...data, imageurl: { ...data.imageurl, alt: e.target.value } })} />
        <div className="grid grid-cols-2 gap-2 p-2 border rounded bg-gray-50">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">PRIMARY ACTION</h4>
            <input className={smallFieldClass} placeholder="Label" value={data.primaryAction?.label || ""} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, label: e.target.value } })} />
            <input className={smallFieldClass} placeholder="URL" value={data.primaryAction?.url || ""} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, url: e.target.value } })} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">SECONDARY ACTION</h4>
            <input className={smallFieldClass} placeholder="Label" value={data.secondaryAction?.label || ""} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, label: e.target.value } })} />
            <input className={smallFieldClass} placeholder="URL" value={data.secondaryAction?.url || ""} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, url: e.target.value } })} />
          </div>
        </div>
      </div>
    );
  };

  const renderHeaderForm = () => {
    const data = form.data as HeaderData;
    return (
      <div className="space-y-2">
        {/* Logo Section */}
        <div className="p-2 border rounded bg-gray-50 space-y-1">
          <h4 className={sectionHeaderClass}>Logo Configuration</h4>
          <div className="grid grid-cols-3 gap-2 items-end">
            <ImageUploadField label="Logo Image" value={data.logo?.imageUrl} fieldKey="header.logo.src" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, logo: { ...data.logo, imageUrl: url } })} />
            <label className={smallLabelClass}>Alt Text <input className={smallFieldClass} value={data.logo?.alt || ""} onChange={e => setData({ ...data, logo: { ...data.logo, alt: e.target.value } })} /></label>
            <label className={smallLabelClass}>Link URL <input className={smallFieldClass} value={data.logo?.href || ""} onChange={e => setData({ ...data, logo: { ...data.logo, href: e.target.value } })} /></label>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Contact Info Items</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, contactInfo: [...(data.contactInfo || []), { image: { imageUrl: '', alt: '' }, text: '', href: '' }] })}>+ Add Item</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(data.contactInfo || []).map((item, idx) => (
              <div key={idx} className={cardClass}>
                <button type="button" onClick={() => { const nci = [...data.contactInfo]; nci.splice(idx, 1); setData({ ...data, contactInfo: nci }); }} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <ImageUploadField 
                  label="Icon Image" 
                  value={item.image?.imageUrl} 
                  fieldKey={`header.contact.${idx}`} 
                  uploadingField={uploadingField} 
                  onUploadingChange={setUploadingField} 
                  onError={(m) => toast.error(m)} 
                  onUpload={url => { const nci = [...data.contactInfo]; nci[idx].image = { ...nci[idx].image, imageUrl: url }; setData({ ...data, contactInfo: nci }); }} 
                />
                <input className={smallFieldClass} placeholder="Text" value={item.text || ""} onChange={e => { const nci = [...data.contactInfo]; nci[idx].text = e.target.value; setData({ ...data, contactInfo: nci }); }} />
                <input className={smallFieldClass} placeholder="Href (Optional)" value={item.href || ""} onChange={e => { const nci = [...data.contactInfo]; nci[idx].href = e.target.value; setData({ ...data, contactInfo: nci }); }} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Navigation Links</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, navigation: [...(data.navigation || []), { title: '', slug: '' }] })}>+ Add Link</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.navigation || []).map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input className={smallFieldClass} placeholder="Title" value={item.title || ""} onChange={e => { const nn = [...data.navigation]; nn[idx].title = e.target.value; setData({ ...data, navigation: nn }); }} />
                <input className={smallFieldClass} placeholder="Slug/URL" value={item.slug || ""} onChange={e => { const nn = [...data.navigation]; nn[idx].slug = e.target.value; setData({ ...data, navigation: nn }); }} />
                <button type="button" onClick={() => setData({ ...data, navigation: data.navigation.filter((_, i) => i !== idx) })} className="text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Section */}
        <div className="p-2 border rounded bg-gray-50 space-y-1">
          <h4 className={sectionHeaderClass}>Action Buttons & Toggles</h4>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 accent-[#8d6a3a]" checked={data.actions?.wishlist} onChange={e => setData({ ...data, actions: { ...data.actions, wishlist: e.target.checked } })} />
              <span className="text-xs font-bold text-[#5f5a50]">Show Wishlist</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 accent-[#8d6a3a]" checked={data.actions?.cart} onChange={e => setData({ ...data, actions: { ...data.actions, cart: e.target.checked } })} />
              <span className="text-xs font-bold text-[#5f5a50]">Show Cart</span>
            </label>
          </div>
          <div className="pt-1">
             <h5 className="text-[10px] font-bold text-[#5f5a50] mb-1">BROCHURE BUTTON</h5>
             <div className="grid grid-cols-2 gap-2">
                <label className={smallLabelClass}>Button Label <input className={smallFieldClass} value={data.actions?.brochureButton?.text || ""} onChange={e => setData({ ...data, actions: { ...data.actions, brochureButton: { ...data.actions.brochureButton, text: e.target.value } } })} /></label>
                <label className={smallLabelClass}>Button Href <input className={smallFieldClass} value={data.actions?.brochureButton?.href || ""} onChange={e => setData({ ...data, actions: { ...data.actions, brochureButton: { ...data.actions.brochureButton, href: e.target.value } } })} /></label>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFooterForm = () => {
    const data = form.data as FooterData;
    return (
      <div className="space-y-2">
        {/* Company Info */}
        <div className="p-2 border rounded bg-gray-50 space-y-1">
          <h4 className={sectionHeaderClass}>Company Information</h4>
          <div className="grid grid-cols-2 gap-2">
            <label className={smallLabelClass}>Company Name <input className={smallFieldClass} value={data.company?.name || ""} onChange={e => setData({ ...data, company: { ...data.company, name: e.target.value } })} /></label>
            <label className={smallLabelClass}>Map Link <input className={smallFieldClass} value={data.company?.maplink || ""} onChange={e => setData({ ...data, company: { ...data.company, maplink: e.target.value } })} /></label>
          </div>
          <label className={smallLabelClass}>Company Description <textarea className={smallFieldClass} rows={2} value={data.company?.description || ""} onChange={e => setData({ ...data, company: { ...data.company, description: e.target.value } })} /></label>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <ImageUploadField 
                label="Ensis Logo" 
                value={typeof data.company?.ensisLogo === 'string' ? data.company.ensisLogo : data.company?.ensisLogo?.imageUrl} 
                fieldKey="footer.company.ensisLogo" 
                uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} 
                onUpload={url => { const nc = structuredClone(data.company || {}); nc.ensisLogo = typeof nc.ensisLogo === 'object' ? { ...nc.ensisLogo, imageUrl: url } : { imageUrl: url, alt: '' }; setData({ ...data, company: nc }); }} 
              />
              <input className={smallFieldClass} placeholder="Ensis Logo Alt" value={data.company?.ensisLogo?.alt || ""} onChange={e => { const nc = structuredClone(data.company || {}); nc.ensisLogo = typeof nc.ensisLogo === 'object' ? { ...nc.ensisLogo, alt: e.target.value } : { imageUrl: '', alt: e.target.value }; setData({ ...data, company: nc }); }} />
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-[#5f5a50]">SOCIAL LINKS</span>
              <button type="button" className={addBtnClass} onClick={() => { const ns = structuredClone(data.company); ns.socialLinks = [...(ns.socialLinks || []), { image: { imageUrl: '', alt: '' }, url: '' }]; setData({ ...data, company: ns }); }}>+ Add Social Link</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
            {(data.company?.socialLinks || []).map((s, idx) => (
              <div key={idx} className={cardClass}>
                <button type="button" onClick={() => { const ns = structuredClone(data.company); ns.socialLinks.splice(idx, 1); setData({ ...data, company: ns }); }} className="absolute top-1 right-1 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
                
                <ImageUploadField 
                  label="Platform Icon" 
                  value={s.image?.imageUrl} 
                  fieldKey={`footer.social.${idx}`} 
                  uploadingField={uploadingField} 
                  onUploadingChange={setUploadingField} 
                  onError={(m) => toast.error(m)} 
                  onUpload={url => { 
                    const ns = structuredClone(data.company); 
                    ns.socialLinks[idx].image = { ...ns.socialLinks[idx].image, imageUrl: url }; 
                    setData({ ...data, company: ns }); 
                  }} 
                />
                <input className={smallFieldClass} placeholder="Profile URL" value={s.url || ""} onChange={e => { const ns = structuredClone(data.company); ns.socialLinks[idx].url = e.target.value; setData({ ...data, company: ns }); }} />
              </div>
            ))}
            </div>
          </div>
        </div>

  {/* Navigation columns */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Navigation Columns</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, navigation: [...(data.navigation || []), { title: '', links: [] }] })}>+ Add Column</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(data.navigation || []).map((col, cIdx) => (
              <div key={cIdx} className="p-2 border rounded bg-gray-50 space-y-1">
                <div className="flex justify-between items-center gap-1">
                  <input className={`${smallFieldClass} font-bold`} placeholder="Column Title" value={col.title || ""} onChange={e => { const nn = structuredClone(data.navigation); nn[cIdx].title = e.target.value; setData({ ...data, navigation: nn }); }} />
                  <button type="button" onClick={() => setData({ ...data, navigation: data.navigation.filter((_, i) => i !== cIdx) })} className="text-red-500"><Trash2 size={14} /></button>
                </div>
                <div className="pl-2 border-l-2 space-y-1 border-[#d9cdbb]">
                   {(col.links || []).map((link, lIdx) => (
                     <div key={lIdx} className="flex gap-1">
                       <input className={smallFieldClass} placeholder="Label" value={link.label || ""} onChange={e => { const nn = structuredClone(data.navigation); nn[cIdx].links[lIdx].label = e.target.value; setData({ ...data, navigation: nn }); }} />
                       <input className={smallFieldClass} placeholder="URL" value={link.href || ""} onChange={e => { const nn = structuredClone(data.navigation); nn[cIdx].links[lIdx].href = e.target.value; setData({ ...data, navigation: nn }); }} />
                       <button type="button" onClick={() => { const nn = structuredClone(data.navigation); nn[cIdx].links.splice(lIdx, 1); setData({ ...data, navigation: nn }); }} className="text-red-400"><Trash2 size={12} /></button>
                     </div>
                   ))}
                   <button type="button" className="text-[10px] uppercase font-bold text-[#8d6a3a] hover:underline" onClick={() => { const nn = structuredClone(data.navigation); nn[cIdx].links.push({ label: '', href: '' }); setData({ ...data, navigation: nn }); }}>+ Add Link</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-2 border rounded bg-gray-50 space-y-1">
          <h4 className={sectionHeaderClass}>Contact & Support</h4>
          <div className="grid grid-cols-4 gap-2">
            <label className={smallLabelClass}>Phone <input className={smallFieldClass} value={data.contact?.phone || ""} onChange={e => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} /></label>
            <label className={smallLabelClass}>Email <input className={smallFieldClass} value={data.contact?.email || ""} onChange={e => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} /></label>
            <label className={smallLabelClass}>Address <input className={smallFieldClass} value={data.contact?.address || ""} onChange={e => setData({ ...data, contact: { ...data.contact, address: e.target.value } })} /></label>
            <label className={smallLabelClass}>Whatsapp <input className={smallFieldClass} value={data.contact?.whatsappPhone || ""} onChange={e => setData({ ...data, contact: { ...data.contact, whatsappPhone: e.target.value } })} /></label>
          </div>
        </div>

        {/* Copyright */}
        <div className="p-2 border rounded bg-gray-50 space-y-1">
          <h4 className={sectionHeaderClass}>Copyright</h4>
          <input className={smallFieldClass} placeholder="Copyright Text" value={data.copyright?.text || ""} onChange={e => setData({ ...data, copyright: { ...data.copyright, text: e.target.value } })} />
          <div className="pt-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-[#5f5a50]">COPYRIGHT LINKS</span>
              <button type="button" className={addBtnClass} onClick={() => { const nc = structuredClone(data.copyright); nc.links = [...(nc.links || []), { label: '', href: '' }]; setData({ ...data, copyright: nc }); }}>+ Add Link</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
            {(data.copyright?.links || []).map((l, idx) => (
              <div key={idx} className="flex gap-1">
                <input className={smallFieldClass} placeholder="Label" value={l.label || ""} onChange={e => { const nc = structuredClone(data.copyright); nc.links[idx].label = e.target.value; setData({ ...data, copyright: nc }); }} />
                <input className={smallFieldClass} placeholder="URL" value={l.href || ""} onChange={e => { const nc = structuredClone(data.copyright); nc.links[idx].href = e.target.value; setData({ ...data, copyright: nc }); }} />
                <button type="button" onClick={() => { const nc = structuredClone(data.copyright); nc.links.splice(idx, 1); setData({ ...data, copyright: nc }); }} className="text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderTestimonialsForm = () => {
    const data = form.data as TestimonialsData;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>Subtitle <input className={smallFieldClass} value={data.subtitle || ""} onChange={e => setData({ ...data, subtitle: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Testimonials</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, testimonials: [...(data.testimonials || []), { text: '', name: '', role: '', image: { imageUrl: '', alt: '' } }] })}>+ Add Testimonial</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
        {(data.testimonials || []).map((t, idx) => (
          <div key={idx} className={cardClass}>
            <button type="button" onClick={() => setData({ ...data, testimonials: data.testimonials.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
            <textarea className={smallFieldClass} placeholder="Review Text" rows={2} value={t.text || ""} onChange={e => { const nt = data.testimonials.map((test, i) => i === idx ? { ...test, text: e.target.value } : test); setData({ ...data, testimonials: nt }); }} />
            <input className={smallFieldClass} placeholder="Name" value={t.name || ""} onChange={e => { const nt = data.testimonials.map((test, i) => i === idx ? { ...test, name: e.target.value } : test); setData({ ...data, testimonials: nt }); }} />
            <input className={smallFieldClass} placeholder="Role" value={t.role || ""} onChange={e => { const nt = data.testimonials.map((test, i) => i === idx ? { ...test, role: e.target.value } : test); setData({ ...data, testimonials: nt }); }} />
            <ImageUploadField label="Avatar" value={t.image?.imageUrl} fieldKey={`testi.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nt = data.testimonials.map((test, i) => i === idx ? { ...test, image: { ...test.image, imageUrl: url } } : test); setData({ ...data, testimonials: nt }); }} />
            <input className={smallFieldClass} placeholder="Avatar Alt" value={t.image?.alt || ""} onChange={e => { const nt = data.testimonials.map((test, i) => i === idx ? { ...test, image: { ...test.image, alt: e.target.value } } : test); setData({ ...data, testimonials: nt }); }} />
          </div>
        ))}
        </div>
      </div>
    );
  };

  const renderFounderVisionForm = () => {
    const data = form.data as AboutFounderVision;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading || ""} onChange={e => setData({ ...data, heading: e.target.value })} /></label>
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <div className="grid grid-cols-4 gap-2">
          <ImageUploadField label="Founder Image" value={data.founderImageurl?.imageUrl} fieldKey="f.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, founderImageurl: { ...data.founderImageurl, imageUrl: url } })} />
          <ImageUploadField label="Signature" value={data.signatureImageurl?.imageUrl} fieldKey="f.sig" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, signatureImageurl: { ...data.signatureImageurl, imageUrl: url } })} />
          <input className={smallFieldClass} placeholder="Name/Title" value={data.aboutFounder.title || ""} onChange={e => setData({ ...data, aboutFounder: { ...data.aboutFounder, title: e.target.value } })} />
          <input className={smallFieldClass} placeholder="Company" value={data.aboutFounder.company || ""} onChange={e => setData({ ...data, aboutFounder: { ...data.aboutFounder, company: e.target.value } })} />
        </div>
        <input className={smallFieldClass} placeholder="Division" value={data.aboutFounder.division || ""} onChange={e => setData({ ...data, aboutFounder: { ...data.aboutFounder, division: e.target.value } })} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-sm">
      <header className="mb-4 flex items-center justify-between border-b border-[#eee5d9] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8d6a3a]">Configuration</span>
          <h1 className="font-serif text-xl text-[#1f261b] mt-0.5">About Page Content</h1>
          <p className="mt-1 text-[#5f5a50] text-xs leading-snug max-w-xl">
            Manage sections of the about page. Select an existing component to edit or create a new one using a template.
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({ ...form, data: defaultAboutpageData["about.hero"] }); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#263016] text-white rounded-lg font-bold text-xs shadow hover:bg-[#1a210f] transition-all"
        >
          <Plus size={14} /> New Component
        </button>
      </header>

      <div className="grid grid-cols-1">
        {/* Editor Form */}
        <section>
          <form onSubmit={handleSave} className="bg-white border border-[#ded3c4] rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#fcfaf7] border-b border-[#eee5d9] p-3 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base text-[#1f261b]">{editingId ? "Edit Component" : "Create New Component"}</h2>
                <p className="text-[10px] text-[#5f5a50] mt-0.5 italic">Structured data for rendering page sections</p>
              </div>
              <div className="flex items-center gap-2">
                {editingId && (
                  <button type="button" onClick={() => handleDelete(editingId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
              {/* Meta Config */}
              <div className="grid grid-cols-4 gap-3 bg-[#fcfaf7] p-3 rounded-lg border border-[#eee5d9] items-end">
                <label className={smallLabelClass}>
                  Template / Component Key
                  <select
                    className={`${smallFieldClass} font-bold`}
                    value={form.key}
                    onChange={(e) => handleKeyChange(e.target.value as AboutPageContentKeys)}
                  >
                    {aboutpageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
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

              {/* Dynamic Data Editor */}
              <div className="pt-1">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#eee5d9]" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#8d6a3a] uppercase">Component Content</span>
                  <div className="h-px flex-1 bg-[#eee5d9]" />
                </div>

                {form.key === "about.hero" && renderHeroForm()}
                {form.key === "about.ourStory" && renderOurStoryForm()}
                {form.key === "about.statsStrip" && renderStatsStripForm()}
                {form.key === "about.whyChooseEnsis" && renderWhyChooseEnsisForm()}
                {form.key === "about.ourExpertise" && renderExpertiseForm()}
                {form.key === "about.ourTurnkeyProcess" && renderTurnkeyProcessForm()}
                {form.key === "about.industriesWeServe" && renderIndustriesWeServeForm()}
                {form.key === "about.testimonials" && renderTestimonialsForm()}
                {form.key === "about.founderVision" && renderFounderVisionForm()}
                {form.key === "about.letsBuild" && renderLetsBuildForm()}
                {form.key === "layout.header" && renderHeaderForm()}
                {form.key === "layout.footer" && renderFooterForm()}
                
                {/* Standardized Array-based component forms can follow here */}
                {!aboutpageKeys.find(k => k.key === form.key) && (
                   <div className="p-4 text-center border border-dashed rounded-xl bg-gray-50">
                      <p className="text-xs text-[#5f5a50]">Visual editor for <b>{form.key}</b> is coming soon.</p>
                      <p className="text-[10px] uppercase font-bold mt-1 text-gray-400">Current JSON Data:</p>
                      <pre className="mt-2 text-left text-[10px] bg-white p-3 rounded-lg overflow-auto max-h-32 border border-[#eee5d9]">
                        {JSON.stringify(form.data, null, 2)}
                      </pre>
                   </div>
                )}
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}