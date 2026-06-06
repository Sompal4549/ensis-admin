"use client";

import { ImageUploadField } from "@/components/common/ImageUploadField";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  FilePlus,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { componentContentApi, getImageUrl, uploadImage, type ComponentContent } from "@/lib/api";
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
import { fieldClass, labelClass, cardClass } from "@/constants";



type ContentForm = Omit<ComponentContent, "_id"> & { key: AboutPageContentKeys };

const randomId = () => Math.random().toString(36).slice(2, 9);



export default function AboutpageComponentRouteEditor({ componentKey, title }: { componentKey: AboutPageContentKeys | "layout.header" | "layout.footer", title: string }) {
  const [form, setForm] = useState<ContentForm>({
    key: componentKey as any,
    label: title,
    page: "about",
    description: "",
    isActive: true,
    data: (defaultAboutpageData[componentKey as AboutPageContentKeys] || {}) as AboutPageData,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [records, setRecords] = useState<ComponentContent[]>([]);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      setRecords(list.filter((r) => r.page === "about" || r.page === "layout"));
      const existing = list.find(r => r.key === componentKey);
      if (existing) {
        setEditingId(existing._id);
        setForm({
          key: existing.key as any,
          label: existing.label,
          page: existing.page || "about",
          description: existing.description || "",
          isActive: existing.isActive,
          data: existing.data as any,
        });
      } else {
        setEditingId(null);
        const keyInfo = aboutpageKeys.find(k => k.key === componentKey);
        setForm(prev => ({
          ...prev,
          key: componentKey as any,
          label: keyInfo?.label || title,
          description: keyInfo?.description || "",
          data: defaultAboutpageData[componentKey as any] || {}
        }));
      }
    } catch (error) {
      toast.error("Failed to load components.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [componentKey]);

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

  const handleSelectRecord = (record: ComponentContent) => {
    setEditingId(record._id);
    setForm({
      key: record.key as AboutPageContentKeys,
      label: record.label,
      page: record.page || "about",
      description: record.description || "",
      isActive: record.isActive,
      data: record.data as AboutPageData,
    });
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
    } catch (err) {
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
    } catch (err) {
      toast.error("Delete failed");
    }
    setEditingId(null);
    refresh();
  };

  // Sub-forms for specific component types
  const renderHeroForm = () => {
    const data = form.data as AboutHero;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <ImageUploadField label="Background Image" value={data.image?.imageUrl} fieldKey="hero.image" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, image: { ...data.image, imageUrl: url } })} />
          <label className={labelClass}>Image Alt Text <input className={fieldClass} value={data.image?.alt || ""} onChange={e => setData({ ...data, image: { ...data.image, alt: e.target.value } })} /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>Title <input className={fieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={labelClass}>Highlight <input className={fieldClass} value={data.highlight || ""} onChange={e => setData({ ...data, highlight: e.target.value })} /></label>
        </div>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={3} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3 p-3 border rounded bg-gray-50">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">PRIMARY ACTION</h4>
            <div className="grid grid-cols-2 gap-2">
              <input className={fieldClass} placeholder="Label" value={data.primaryAction?.label || ""} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, label: e.target.value } })} />
              <input className={fieldClass} placeholder="URL" value={data.primaryAction?.url || ""} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, url: e.target.value } })} />
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">SECONDARY ACTION</h4>
            <div className="grid grid-cols-2 gap-2">
              <input className={fieldClass} placeholder="Label" value={data.secondaryAction?.label || ""} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, label: e.target.value } })} />
              <input className={fieldClass} placeholder="URL" value={data.secondaryAction?.url || ""} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, url: e.target.value } })} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOurStoryForm = () => {
    const data = form.data as AboutOurStory;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>Heading <input className={fieldClass} value={data.heading || ""} onChange={e => setData({ ...data, heading: e.target.value })} /></label>
          <label className={labelClass}>Title <input className={fieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        </div>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={4} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <ImageUploadField label="Side Image" value={data.imageurl?.imageUrl} fieldKey="story.image" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, imageurl: { ...data.imageurl, imageUrl: url } })} />
        
        <div className="pt-3 border-t">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-[#8d6a3a]">STORY STATS</h4>
            <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, stats: [...data.stats, { id: randomId(), title: '', subtitle: '', imageurl: { imageUrl: '', alt: '' } }] })}>Add Stat</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.stats.map((s, idx) => (
              <div key={s.id} className="p-2 border rounded bg-gray-50 space-y-1.5 relative">
                <button type="button" onClick={() => setData({ ...data, stats: data.stats.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
                <div className="grid grid-cols-2 gap-2">
                  <input className={fieldClass} placeholder="Stat Title" value={s.title || ""} onChange={e => { const ns = [...data.stats]; ns[idx].title = e.target.value; setData({ ...data, stats: ns }); }} />
                  <input className={fieldClass} placeholder="Subtitle" value={s.subtitle || ""} onChange={e => { const ns = [...data.stats]; ns[idx].subtitle = e.target.value; setData({ ...data, stats: ns }); }} />
                </div>
                <ImageUploadField label="Icon" value={s.imageurl?.imageUrl} fieldKey={`story.stat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => {
                  const ns = [...data.stats]; ns[idx].imageurl = { ...ns[idx].imageurl, imageUrl: url }; setData({ ...data, stats: ns });
                }} />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-[#8d6a3a]">CORE VALUES</h4>
            <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, ourCoreValues: [...data.ourCoreValues, { id: randomId(), title: '', imageurl: { imageUrl: '', alt: '' } }] })}>Add Value</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {data.ourCoreValues.map((v, idx) => (
              <div key={v.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                <input className={fieldClass} placeholder="Value Title" value={v.title || ""} onChange={e => {
                  const nv = [...data.ourCoreValues]; nv[idx].title = e.target.value; setData({ ...data, ourCoreValues: nv });
                }} />
                <button type="button" onClick={() => setData({ ...data, ourCoreValues: data.ourCoreValues.filter((_, i) => i !== idx) })} className="text-red-500"><Trash2 size={16} /></button>
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
      <div className="space-y-3">
        <label className={labelClass}>Section Title <input className={fieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">EXPERTISE ITEMS</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, items: [...(data.items || []), { id: randomId(), title: '', description: '', imageurl: { imageUrl: '', alt: '' }, linkUrl: '' }] })}>Add Item</button>
        </div>
        {(data.items || []).map((item, idx) => (
          <div key={item.id} className="p-3 border rounded bg-gray-50 space-y-2 relative">
            <button type="button" onClick={() => setData({ ...data, items: data.items.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
            <div className="grid grid-cols-2 gap-2">
              <input className={fieldClass} placeholder="Title" value={item.title || ""} onChange={e => { const ni = data.items.map((it, i) => i === idx ? { ...it, title: e.target.value } : it); setData({ ...data, items: ni }); }} />
              <input className={fieldClass} placeholder="Link URL" value={item.linkUrl || ""} onChange={e => { const ni = data.items.map((it, i) => i === idx ? { ...it, linkUrl: e.target.value } : it); setData({ ...data, items: ni }); }} />
            </div>
            <textarea className={fieldClass} placeholder="Description" rows={2} value={item.description || ""} onChange={e => { const ni = data.items.map((it, i) => i === idx ? { ...it, description: e.target.value } : it); setData({ ...data, items: ni }); }} />
            <ImageUploadField label="Thumbnail" value={item.imageurl?.imageUrl} fieldKey={`exp.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ni = data.items.map((it, i) => i === idx ? { ...it, imageurl: { ...it.imageurl, imageUrl: url } } : it); setData({ ...data, items: ni }); }} />
          </div>
        ))}
      </div>
    );
  };

  const renderStatsStripForm = () => {
    const data = form.data as AboutStatsStrip;
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">STAT ITEMS</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, stats: [...(data.stats || []), { id: randomId(), label: '', imageurl: { imageUrl: '', alt: '' }, subtitle: '' }] })}>Add Stat</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
        {(data.stats || []).map((stat, idx) => (
          <div key={stat.id} className="p-3 border rounded bg-gray-50 space-y-1 relative">
            <button type="button" onClick={() => setData({ ...data, stats: data.stats.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
            <label className={labelClass}>Value Label <input className={fieldClass} value={stat.label || ""} onChange={e => { const ns = data.stats.map((s, i) => i === idx ? { ...s, label: e.target.value } : s); setData({ ...data, stats: ns }); }} /></label>
            <label className={labelClass}>Subtitle <input className={fieldClass} value={stat.subtitle || ""} onChange={e => { const ns = data.stats.map((s, i) => i === idx ? { ...s, subtitle: e.target.value } : s); setData({ ...data, stats: ns }); }} /></label>
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
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 items-end">
          <label className={labelClass}>Title <input className={fieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={labelClass}>Main Image Alt <input className={fieldClass} placeholder="Image Alt" value={data.imageurl?.alt || ""} onChange={e => setData({ ...data, imageurl: { ...data.imageurl, alt: e.target.value } })} /></label>
        </div>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={3} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <ImageUploadField label="Main Image" value={data.imageurl?.imageUrl} fieldKey="why.main" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, imageurl: { ...data.imageurl, imageUrl: url } })} />
        
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">EXPERIENCE CARDS</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, experience: [...(data.experience || []), { id: randomId(), title: '', description: '', imageurl: { imageUrl: '', alt: '' } }] })}>Add Card</button>
        </div>
        {(data.experience || []).map((item, idx) => (
          <div key={item.id} className="p-3 border rounded bg-gray-50 space-y-2 relative">
            <button type="button" onClick={() => setData({ ...data, experience: data.experience.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
            <input className={fieldClass} placeholder="Title" value={item.title || ""} onChange={e => { const ne = data.experience.map((ex, i) => i === idx ? { ...ex, title: e.target.value } : ex); setData({ ...data, experience: ne }); }} />
            <textarea className={fieldClass} placeholder="Description" rows={2} value={item.description || ""} onChange={e => { const ne = data.experience.map((ex, i) => i === idx ? { ...ex, description: e.target.value } : ex); setData({ ...data, experience: ne }); }} />
            <ImageUploadField label="Icon" value={item.imageurl?.imageUrl} fieldKey={`why.item.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ne = data.experience.map((ex, i) => i === idx ? { ...ex, imageurl: { ...ex.imageurl, imageUrl: url } } : ex); setData({ ...data, experience: ne }); }} />
          </div>
        ))}
      </div>
    );
  };

  const renderTurnkeyProcessForm = () => {
    const data = form.data as AboutOurTurnkeyProcess;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 items-end">
          <label className={labelClass}>Title <input className={fieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={labelClass}>Diagram Alt <input className={fieldClass} placeholder="Diagram Alt" value={data.imageurl?.alt || ""} onChange={e => setData({ ...data, imageurl: { ...data.imageurl, alt: e.target.value } })} /></label>
        </div>
        <ImageUploadField label="Process Diagram" value={data.imageurl?.imageUrl} fieldKey="process.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, imageurl: { ...data.imageurl, imageUrl: url } })} />
        <div className="flex justify-between items-center mt-2">
          <h4 className="text-xs font-bold text-[#8d6a3a]">PROCESS STEPS</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, steps: [...(data.steps || []), { id: randomId(), title: '', description: '', imageurl: { imageUrl: '', alt: '' } }] })}>Add Step</button>
        </div>
        {(data.steps || []).map((step, idx) => (
          <div key={step.id} className="p-3 border rounded bg-gray-50 space-y-2 relative">
            <button type="button" onClick={() => setData({ ...data, steps: data.steps.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
            <input className={fieldClass} placeholder="Step Title" value={step.title || ""} onChange={e => { const ns = data.steps.map((s, i) => i === idx ? { ...s, title: e.target.value } : s); setData({ ...data, steps: ns }); }} />
            <textarea className={fieldClass} placeholder="Step Description" rows={2} value={step.description || ""} onChange={e => { const ns = data.steps.map((s, i) => i === idx ? { ...s, description: e.target.value } : s); setData({ ...data, steps: ns }); }} />
          </div>
        ))}
      </div>
    );
  };

  const renderIndustriesWeServeForm = () => {
    const data = form.data as AboutIndustriesWeServe;
    return (
      <div className="space-y-3">
        <label className={labelClass}>Section Title <input className={fieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">INDUSTRIES</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, industries: [...(data.industries || []), { id: randomId(), title: '', imageurl: { imageUrl: '', alt: '' }, linkUrl: '' }] })}>Add Industry</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(data.industries || []).map((ind, idx) => (
            <div key={ind.id} className="p-3 border rounded bg-gray-50 space-y-2 relative">
              <button type="button" onClick={() => setData({ ...data, industries: data.industries.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
              <input className={fieldClass} placeholder="Name" value={ind.title || ""} onChange={e => { const ni = data.industries.map((it, i) => i === idx ? { ...it, title: e.target.value } : it); setData({ ...data, industries: ni }); }} />
              <input className={fieldClass} placeholder="Link URL" value={ind.linkUrl || ""} onChange={e => { const ni = data.industries.map((it, i) => i === idx ? { ...it, linkUrl: e.target.value } : it); setData({ ...data, industries: ni }); }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLetsBuildForm = () => {
    const data = form.data as AboutLetsBuild;
    return (
      <div className="space-y-3">
        <label className={labelClass}>Title <input className={fieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={3} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <ImageUploadField label="CTA Background" value={data.imageurl?.imageUrl} fieldKey="cta.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, imageurl: { ...data.imageurl, imageUrl: url } })} />
        <input className={fieldClass} placeholder="Background Alt" value={data.imageurl?.alt || ""} onChange={e => setData({ ...data, imageurl: { ...data.imageurl, alt: e.target.value } })} />
        <div className="grid grid-cols-2 gap-3 p-3 border rounded bg-gray-50">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">PRIMARY ACTION</h4>
            <input className={fieldClass} placeholder="Label" value={data.primaryAction?.label || ""} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, label: e.target.value } })} />
            <input className={fieldClass} placeholder="URL" value={data.primaryAction?.url || ""} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, url: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">SECONDARY ACTION</h4>
            <input className={fieldClass} placeholder="Label" value={data.secondaryAction?.label || ""} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, label: e.target.value } })} />
            <input className={fieldClass} placeholder="URL" value={data.secondaryAction?.url || ""} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, url: e.target.value } })} />
          </div>
        </div>
      </div>
    );
  };

  const renderHeaderForm = () => {
    const data = form.data as HeaderData;
    return (
      <div className="space-y-3">
        {/* Logo Section */}
        <div className="p-3 border rounded bg-gray-50 space-y-2">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Logo Configuration</h4>
          <ImageUploadField label="Logo Image" value={data.logo?.imageUrl} fieldKey="header.logo.src" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, logo: { ...data.logo, imageUrl: url } })} />
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>Alt Text <input className={fieldClass} value={data.logo?.alt || ""} onChange={e => setData({ ...data, logo: { ...data.logo, alt: e.target.value } })} /></label>
            <label className={labelClass}>Link URL <input className={fieldClass} value={data.logo?.href || ""} onChange={e => setData({ ...data, logo: { ...data.logo, href: e.target.value } })} /></label>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Contact Info Items</h4>
            <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, contactInfo: [...(data.contactInfo || []), { image: { imageUrl: '', alt: '' }, text: '', href: '' }] })}>Add Contact Item</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.contactInfo || []).map((item, idx) => (
              <div key={idx} className="p-2 border rounded bg-white relative space-y-1">
                <button type="button" onClick={() => { const nci = [...data.contactInfo]; nci.splice(idx, 1); setData({ ...data, contactInfo: nci }); }} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
                <ImageUploadField 
                  label="Icon Image" 
                  value={item.image?.imageUrl} 
                  fieldKey={`header.contact.${idx}`} 
                  uploadingField={uploadingField} 
                  onUploadingChange={setUploadingField} 
                  onError={(m) => toast.error(m)} 
                  onUpload={url => { const nci = [...data.contactInfo]; nci[idx].image = { ...nci[idx].image, imageUrl: url }; setData({ ...data, contactInfo: nci }); }} 
                />
                <div className="grid grid-cols-2 gap-2">
                   <input className={fieldClass} placeholder="Text" value={item.text || ""} onChange={e => { const nci = [...data.contactInfo]; nci[idx].text = e.target.value; setData({ ...data, contactInfo: nci }); }} />
                   <input className={fieldClass} placeholder="Href (Optional)" value={item.href || ""} onChange={e => { const nci = [...data.contactInfo]; nci[idx].href = e.target.value; setData({ ...data, contactInfo: nci }); }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Navigation Links</h4>
            <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, navigation: [...(data.navigation || []), { title: '', slug: '' }] })}>Add Link</button>
          </div>
          <div className="grid gap-2">
            {(data.navigation || []).map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input className={fieldClass} placeholder="Title" value={item.title || ""} onChange={e => { const nn = [...data.navigation]; nn[idx].title = e.target.value; setData({ ...data, navigation: nn }); }} />
                <input className={fieldClass} placeholder="Slug/URL" value={item.slug || ""} onChange={e => { const nn = [...data.navigation]; nn[idx].slug = e.target.value; setData({ ...data, navigation: nn }); }} />
                <button type="button" onClick={() => setData({ ...data, navigation: data.navigation.filter((_, i) => i !== idx) })} className="text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Section */}
        <div className="p-3 border rounded bg-gray-50 space-y-2">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Action Buttons & Toggles</h4>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-[#8d6a3a]" checked={data.actions?.wishlist} onChange={e => setData({ ...data, actions: { ...data.actions, wishlist: e.target.checked } })} />
              <span className="text-sm font-bold text-[#5f5a50]">Show Wishlist</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-[#8d6a3a]" checked={data.actions?.cart} onChange={e => setData({ ...data, actions: { ...data.actions, cart: e.target.checked } })} />
              <span className="text-sm font-bold text-[#5f5a50]">Show Cart</span>
            </label>
          </div>
          <div className="pt-2">
             <h5 className="text-[10px] font-bold text-[#5f5a50] mb-2">BROCHURE BUTTON</h5>
             <div className="grid grid-cols-2 gap-3">
                <label className={labelClass}>Button Label <input className={fieldClass} value={data.actions?.brochureButton?.text || ""} onChange={e => setData({ ...data, actions: { ...data.actions, brochureButton: { ...data.actions.brochureButton, text: e.target.value } } })} /></label>
                <label className={labelClass}>Button Href <input className={fieldClass} value={data.actions?.brochureButton?.href || ""} onChange={e => setData({ ...data, actions: { ...data.actions, brochureButton: { ...data.actions.brochureButton, href: e.target.value } } })} /></label>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFooterForm = () => {
    const data = form.data as FooterData;
    return (
      <div className="space-y-3">
        {/* Company Info */}
        <div className="p-3 border rounded bg-gray-50 space-y-2">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Company Information</h4>
          <label className={labelClass}>Company Name <input className={fieldClass} value={data.company?.name || ""} onChange={e => setData({ ...data, company: { ...data.company, name: e.target.value } })} /></label>
          <label className={labelClass}>Company Description <textarea className={fieldClass} rows={2} value={data.company?.description || ""} onChange={e => setData({ ...data, company: { ...data.company, description: e.target.value } })} /></label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <ImageUploadField 
                label="Design House Logo" 
                value={typeof data.company?.designHouselogo === 'string' ? data.company.designHouselogo : data.company?.designHouselogo?.imageUrl} 
                fieldKey="footer.company.designHouselogo" 
                uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} 
                onUpload={url => { const nc = structuredClone(data.company || {}); nc.designHouselogo = typeof nc.designHouselogo === 'object' ? { ...nc.designHouselogo, imageUrl: url } : { imageUrl: url, alt: '' }; setData({ ...data, company: nc }); }} 
              />
              <label className={labelClass}>Design Logo Alt <input className={fieldClass} value={data.company?.designHouselogo?.alt || ""} onChange={e => { const nc = structuredClone(data.company || {}); nc.designHouselogo = typeof nc.designHouselogo === 'object' ? { ...nc.designHouselogo, alt: e.target.value } : { imageUrl: '', alt: e.target.value }; setData({ ...data, company: nc }); }} /></label>
            </div>
            <div className="space-y-2">
              <ImageUploadField 
                label="Ensis Logo" 
                value={typeof data.company?.ensisLogo === 'string' ? data.company.ensisLogo : data.company?.ensisLogo?.imageUrl} 
                fieldKey="footer.company.ensisLogo" 
                uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} 
                onUpload={url => { const nc = structuredClone(data.company || {}); nc.ensisLogo = typeof nc.ensisLogo === 'object' ? { ...nc.ensisLogo, imageUrl: url } : { imageUrl: url, alt: '' }; setData({ ...data, company: nc }); }} 
              />
              <label className={labelClass}>Ensis Logo Alt <input className={fieldClass} value={data.company?.ensisLogo?.alt || ""} onChange={e => { const nc = structuredClone(data.company || {}); nc.ensisLogo = typeof nc.ensisLogo === 'object' ? { ...nc.ensisLogo, alt: e.target.value } : { imageUrl: '', alt: e.target.value }; setData({ ...data, company: nc }); }} /></label>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[#5f5a50]">SOCIAL LINKS</span>
              <button type="button" className="text-xs bg-[#263016] text-white px-3 py-1 rounded font-bold" onClick={() => { const ns = structuredClone(data.company); ns.socialLinks = [...(ns.socialLinks || []), { image: { imageUrl: '', alt: '' }, url: '' }]; setData({ ...data, company: ns }); }}>+ Add Social Link</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
            {(data.company?.socialLinks || []).map((s, idx) => (
              <div key={idx} className="bg-white p-2 border rounded space-y-2 relative group">
                <button type="button" onClick={() => { const ns = structuredClone(data.company); ns.socialLinks.splice(idx, 1); setData({ ...data, company: ns }); }} className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                
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
                <input className={fieldClass} placeholder="Profile URL" value={s.url || ""} onChange={e => { const ns = structuredClone(data.company); ns.socialLinks[idx].url = e.target.value; setData({ ...data, company: ns }); }} />
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Navigation columns */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Navigation Columns</h4>
            <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, navigation: [...(data.navigation || []), { title: '', links: [] }] })}>Add Column</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(data.navigation || []).map((col, cIdx) => (
              <div key={cIdx} className="p-3 border rounded bg-gray-50 space-y-2">
                <div className="flex justify-between items-center">
                  <input className={`${fieldClass} font-bold`} placeholder="Column Title" value={col.title || ""} onChange={e => { const nn = structuredClone(data.navigation); nn[cIdx].title = e.target.value; setData({ ...data, navigation: nn }); }} />
                  <button type="button" onClick={() => setData({ ...data, navigation: data.navigation.filter((_, i) => i !== cIdx) })} className="text-red-500 ml-2"><Trash2 size={16} /></button>
                </div>
                <div className="pl-4 border-l-2 space-y-2 border-[#d9cdbb]">
                   {(col.links || []).map((link, lIdx) => (
                     <div key={lIdx} className="flex gap-2">
                       <input className={fieldClass} placeholder="Label" value={link.label || ""} onChange={e => { const nn = structuredClone(data.navigation); nn[cIdx].links[lIdx].label = e.target.value; setData({ ...data, navigation: nn }); }} />
                       <button type="button" onClick={() => { const nn = structuredClone(data.navigation); nn[cIdx].links.splice(lIdx, 1); setData({ ...data, navigation: nn }); }} className="text-red-400"><Trash2 size={14} /></button>
                     </div>
                   ))}
                   <button type="button" className="text-[10px] uppercase font-bold text-[#8d6a3a] hover:underline" onClick={() => { const nn = structuredClone(data.navigation); nn[cIdx].links.push({ label: '', href: '' }); setData({ ...data, navigation: nn }); }}>+ Add Link</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-3 border rounded bg-gray-50 space-y-2">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Contact & Support</h4>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>Phone <input className={fieldClass} value={data.contact?.phone || ""} onChange={e => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} /></label>
            <label className={labelClass}>Email <input className={fieldClass} value={data.contact?.email || ""} onChange={e => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} /></label>
          </div>
          <label className={labelClass}>Address <input className={fieldClass} value={data.contact?.address || ""} onChange={e => setData({ ...data, contact: { ...data.contact, address: e.target.value } })} /></label>
          <label className={labelClass}>Whatsapp Phone <input className={fieldClass} value={data.contact?.whatsappPhone || ""} onChange={e => setData({ ...data, contact: { ...data.contact, whatsappPhone: e.target.value } })} /></label>
        </div>

        {/* Copyright */}
        <div className="p-3 border rounded bg-gray-50 space-y-2">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Copyright</h4>
          <label className={labelClass}>Copyright Text <input className={fieldClass} value={data.copyright?.text || ""} onChange={e => setData({ ...data, copyright: { ...data.copyright, text: e.target.value } })} /></label>
          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[#5f5a50]">COPYRIGHT LINKS</span>
              <button type="button" className="text-xs bg-[#263016] text-white px-3 py-1 rounded font-bold" onClick={() => { const nc = structuredClone(data.copyright); nc.links = [...(nc.links || []), { label: '', href: '' }]; setData({ ...data, copyright: nc }); }}>+ Add Link</button>
            </div>
            {(data.copyright?.links || []).map((l, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input className={fieldClass} placeholder="Label" value={l.label || ""} onChange={e => { const nc = structuredClone(data.copyright); nc.links[idx].label = e.target.value; setData({ ...data, copyright: nc }); }} />
                <input className={fieldClass} placeholder="URL" value={l.href || ""} onChange={e => { const nc = structuredClone(data.copyright); nc.links[idx].href = e.target.value; setData({ ...data, copyright: nc }); }} />
                <button type="button" onClick={() => { const nc = structuredClone(data.copyright); nc.links.splice(idx, 1); setData({ ...data, copyright: nc }); }} className="text-red-400"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


  const renderTestimonialsForm = () => {
    const data = form.data as TestimonialsData;
    return (
      <div className="space-y-3">
        <label className={labelClass}>Subtitle <input className={fieldClass} value={data.subtitle || ""} onChange={e => setData({ ...data, subtitle: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">TESTIMONIALS</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, testimonials: [...(data.testimonials || []), { text: '', name: '', role: '', image: { imageUrl: '', alt: '' } }] })}>Add Testimonial</button>
        </div>
        {(data.testimonials || []).map((t, idx) => (
          <div key={idx} className="p-3 border rounded bg-gray-50 space-y-1.5 relative">
            <button type="button" onClick={() => setData({ ...data, testimonials: data.testimonials.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
            <textarea className={fieldClass} placeholder="Review Text" rows={3} value={t.text || ""} onChange={e => { const nt = data.testimonials.map((test, i) => i === idx ? { ...test, text: e.target.value } : test); setData({ ...data, testimonials: nt }); }} />
            <div className="grid grid-cols-2 gap-2">
              <input className={fieldClass} placeholder="Name" value={t.name || ""} onChange={e => { const nt = data.testimonials.map((test, i) => i === idx ? { ...test, name: e.target.value } : test); setData({ ...data, testimonials: nt }); }} />
              <input className={fieldClass} placeholder="Role" value={t.role || ""} onChange={e => { const nt = data.testimonials.map((test, i) => i === idx ? { ...test, role: e.target.value } : test); setData({ ...data, testimonials: nt }); }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
               <ImageUploadField label="Avatar" value={t.image?.imageUrl} fieldKey={`testi.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nt = data.testimonials.map((test, i) => i === idx ? { ...test, image: { ...test.image, imageUrl: url } } : test); setData({ ...data, testimonials: nt }); }} />
               <input className={fieldClass} placeholder="Avatar Alt" value={t.image?.alt || ""} onChange={e => { const nt = data.testimonials.map((test, i) => i === idx ? { ...test, image: { ...test.image, alt: e.target.value } } : test); setData({ ...data, testimonials: nt }); }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFounderVisionForm = () => {
    const data = form.data as AboutFounderVision;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>Heading <input className={fieldClass} value={data.heading || ""} onChange={e => setData({ ...data, heading: e.target.value })} /></label>
          <label className={labelClass}>Title <input className={fieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        </div>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={4} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <ImageUploadField label="Founder Image" value={data.founderImageurl?.imageUrl} fieldKey="f.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, founderImageurl: { ...data.founderImageurl, imageUrl: url } })} />
          </div>
          <div className="space-y-1.5">
            <ImageUploadField label="Signature" value={data.signatureImageurl?.imageUrl} fieldKey="f.sig" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, signatureImageurl: { ...data.signatureImageurl, imageUrl: url } })} />
          </div>
        </div>
        <div className="p-4 border rounded bg-white space-y-2">
          <h4 className="text-[10px] font-bold text-[#8d6a3a] mb-1">FOUNDER DETAILS</h4>
          <input className={fieldClass} placeholder="Name/Title" value={data.aboutFounder.title || ""} onChange={e => setData({ ...data, aboutFounder: { ...data.aboutFounder, title: e.target.value } })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={fieldClass} placeholder="Company" value={data.aboutFounder.company || ""} onChange={e => setData({ ...data, aboutFounder: { ...data.aboutFounder, company: e.target.value } })} />
            <input className={fieldClass} placeholder="Division" value={data.aboutFounder.division || ""} onChange={e => setData({ ...data, aboutFounder: { ...data.aboutFounder, division: e.target.value } })} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <header className="mb-10 flex items-center justify-between border-b border-[#eee5d9] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8d6a3a]">Configuration</span>
          <h1 className="font-serif text-4xl text-[#1f261b] mt-1">About Page Content</h1>
          <p className="mt-2 text-[#5f5a50] text-sm leading-relaxed max-w-xl">
            Manage sections of the about page. Select an existing component to edit or create a new one using a template.
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({ ...form, data: defaultAboutpageData["about.hero"] }); }}
          className="flex items-center gap-2 px-6 py-3 bg-[#263016] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-[#1a210f] transition-all"
        >
          <Plus size={18} /> New Component
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Records List */}
        {/* <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#ded3c4] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#1f261b] uppercase tracking-widest mb-6">Existing Components</h2>
            <div className="space-y-3">
              {records.length === 0 && <p className="text-xs text-[#5f5a50] italic">No records found for About page.</p>}
              {records.map((rec) => (
                <div
                  key={rec._id}
                  onClick={() => handleSelectRecord(rec)}
                  className={`group cursor-pointer p-4 rounded-xl border transition-all ${editingId === rec._id ? 'bg-[#f3eee6] border-[#8d6a3a]' : 'bg-white border-[#eee5d9] hover:border-[#d9cdbb]'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-[#1f261b] text-sm">{rec.label}</div>
                    <div className={`w-2 h-2 rounded-full ${rec.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="text-[10px] text-[#8d6a3a] mt-1 font-black uppercase tracking-tighter">{rec.key}</div>
                </div>
              ))}
            </div>
          </div>
        </aside> */}

        {/* Editor Form */}
        <section className="lg:col-span-8">
          <form onSubmit={handleSave} className="bg-white border border-[#ded3c4] rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-[#fcfaf7] border-b border-[#eee5d9] p-6 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-[#1f261b]">{editingId ? "Edit Component" : "Create New Component"}</h2>
                <p className="text-xs text-[#5f5a50] mt-1 italic">Structured data for rendering page sections</p>
              </div>
              <div className="flex items-center gap-3">
                {editingId && (
                  <button type="button" onClick={() => handleDelete(editingId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={20} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#8d6a3a] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#6f542f] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {editingId ? "Update Section" : "Publish Section"}
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Meta Config */}
              <div className="grid grid-cols-2 gap-6 bg-[#fcfaf7] p-6 rounded-xl border border-[#eee5d9]">
                <div className="space-y-4">
                  <label className={labelClass}>
                    Template / Component Key
                    <select
                      className={`${fieldClass} mt-1 font-bold`}
                      value={form.key}
                      onChange={(e) => handleKeyChange(e.target.value as AboutPageContentKeys)}
                    >
                      {aboutpageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                    </select>
                  </label>
                  <label className={labelClass}>
                    Internal Label
                    <input className={fieldClass} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Friendly name for admin" />
                  </label>
                </div>
                <div className="space-y-4">
                  <label className={labelClass}>
                    Page ID
                    <input className={fieldClass} value={form.page} onChange={e => setForm({ ...form, page: e.target.value })} />
                  </label>
                  <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" id="isActive" className="w-5 h-5 rounded accent-[#8d6a3a]" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                    <label htmlFor="isActive" className="text-xs font-bold text-[#1f261b] uppercase">Active on page</label>
                  </div>
                </div>
              </div>

              {/* Dynamic Data Editor */}
              <div className="pt-4">
                <div className="mb-6 flex items-center gap-4">
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
                   <div className="p-8 text-center border border-dashed rounded-2xl bg-gray-50">
                      <p className="text-sm text-[#5f5a50]">Visual editor for <b>{form.key}</b> is coming soon.</p>
                      <p className="text-[10px] uppercase font-bold mt-2 text-gray-400">Current JSON Data:</p>
                      <pre className="mt-4 text-left text-[10px] bg-white p-4 rounded-lg overflow-auto max-h-40 border border-[#eee5d9]">
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