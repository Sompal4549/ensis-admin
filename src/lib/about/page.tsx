"use client";

import { useEffect, useRef, useState } from "react";
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
} from "@/lib/about/aboutPageContent";
import { 
  type HeaderData, 
  type FooterData,
  type HeaderNavItem
} from "@/lib/homepageContent";
import { fieldClass, labelClass, cardClass } from "@/constants";



type ContentForm = Omit<ComponentContent, "_id"> & { key: AboutPageContentKeys };

const randomId = () => Math.random().toString(36).slice(2, 9);

const ImageUploadField = ({
  label,
  value,
  fieldKey,
  onUpload,
  uploadingField,
  onUploadingChange,
  onError,
}: {
  label: string;
  value: string;
  fieldKey: string;
  onUpload: (url: string) => void;
  uploadingField: string | null;
  onUploadingChange: (field: string | null) => void;
  onError: (message: string) => void;
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className={labelClass}>{label}</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-3 py-2 text-xs font-bold text-[#263016] hover:bg-[#fcfaf7]"
        >
          {uploadingField === fieldKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
          Upload Image
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try {
            onUploadingChange(fieldKey);
            onError("");
            const url = await uploadImage(file);
            onUpload(url);
          } catch (error) {
            onError((error as Error).message || "Image upload failed.");
          } finally {
            onUploadingChange(null);
          }
        }}
      />
      <input className={fieldClass} type="text" value={value} readOnly placeholder="Uploaded path will appear here" />
      {value ? (
        <img src={getImageUrl(value)} alt={label} className="mt-3 h-20 w-32 rounded-md object-cover border border-[#eee5d9]" />
      ) : null}
    </div>
  );
};

export default function AboutPageContentAdmin() {
  const searchParams = useSearchParams();
  const queryKey = searchParams.get("key") as AboutPageContentKeys;
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [form, setForm] = useState<ContentForm>({
    key: "about.hero",
    label: "About Hero",
    page: "about",
    description: "",
    isActive: true,
    data: defaultAboutpageData["about.hero"],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      const filtered = list.filter(item => 
        item.page === "about" || 
        item.key.startsWith("about.") || 
        item.key.startsWith("layout.")
      );
      setRecords(filtered);

      // URL query param se component select karna
      if (queryKey) {
        const existing = filtered.find(r => r.key === queryKey);
        if (existing) {
          handleSelectRecord(existing);
        } else if (aboutpageKeys.some(k => k.key === queryKey)) {
          handleKeyChange(queryKey);
        }
      }
    } catch (error) {
      setStatusMessage("Failed to load components.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [queryKey]);

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
        setStatusMessage("Updated successfully!");
      } else {
        await componentContentApi.create(form);
        setStatusMessage("Created successfully!");
      }
      await refresh();
    } catch (err) {
      setStatusMessage("Save failed.");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await componentContentApi.remove(id);
    setEditingId(null);
    refresh();
  };

  // Sub-forms for specific component types
  const renderHeroForm = () => {
    const data = form.data as AboutHero;
    return (
      <div className="space-y-4">
        <ImageUploadField label="Background Image" value={data.image} fieldKey="hero.image" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => setData({ ...data, image: url })} />
        <div className="grid grid-cols-2 gap-4">
          <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={labelClass}>Highlight <input className={fieldClass} value={data.highlight} onChange={e => setData({ ...data, highlight: e.target.value })} /></label>
        </div>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={3} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-4 p-4 border rounded bg-gray-50">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">PRIMARY ACTION</h4>
            <input className={fieldClass} placeholder="Label" value={data.primaryAction.label} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, label: e.target.value } })} />
            <input className={fieldClass} placeholder="URL" value={data.primaryAction.url} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, url: e.target.value } })} />
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">SECONDARY ACTION</h4>
            <input className={fieldClass} placeholder="Label" value={data.secondaryAction.label} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, label: e.target.value } })} />
            <input className={fieldClass} placeholder="URL" value={data.secondaryAction.url} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, url: e.target.value } })} />
          </div>
        </div>
      </div>
    );
  };

  const renderOurStoryForm = () => {
    const data = form.data as AboutOurStory;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Heading <input className={fieldClass} value={data.heading} onChange={e => setData({ ...data, heading: e.target.value })} /></label>
        <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={4} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <ImageUploadField label="Side Image" value={data.imageurl} fieldKey="story.image" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => setData({ ...data, imageurl: url })} />
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-[#8d6a3a]">STORY STATS</h4>
            <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, stats: [...data.stats, { id: randomId(), title: '', subtitle: '', imageurl: '' }] })}>Add Stat</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {data.stats.map((s, idx) => (
              <div key={s.id} className="p-3 border rounded bg-gray-50 space-y-2 relative">
                <button type="button" onClick={() => setData({ ...data, stats: data.stats.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
                <input className={fieldClass} placeholder="Stat Title" value={s.title} onChange={e => { const ns = [...data.stats]; ns[idx].title = e.target.value; setData({ ...data, stats: ns }); }} />
                <input className={fieldClass} placeholder="Subtitle" value={s.subtitle} onChange={e => { const ns = [...data.stats]; ns[idx].subtitle = e.target.value; setData({ ...data, stats: ns }); }} />
                <ImageUploadField label="Icon" value={s.imageurl} fieldKey={`story.stat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => {
                  const ns = [...data.stats]; ns[idx].imageurl = url; setData({ ...data, stats: ns });
                }} />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-[#8d6a3a]">CORE VALUES</h4>
            <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, ourCoreValues: [...data.ourCoreValues, { id: randomId(), title: '', imageurl: '' }] })}>Add Value</button>
          </div>
          <div className="grid gap-2">
            {data.ourCoreValues.map((v, idx) => (
              <div key={v.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                <input className={fieldClass} placeholder="Value Title" value={v.title} onChange={e => {
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
      <div className="space-y-4">
        <label className={labelClass}>Section Title <input className={fieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">EXPERTISE ITEMS</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, items: [...data.items, { id: randomId(), title: '', description: '', imageurl: '', linkUrl: '' }] })}>Add Item</button>
        </div>
        {data.items.map((item, idx) => (
          <div key={item.id} className="p-4 border rounded bg-gray-50 space-y-2 relative">
            <button type="button" onClick={() => setData({ ...data, items: data.items.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
            <input className={fieldClass} placeholder="Title" value={item.title} onChange={e => { const ni = [...data.items]; ni[idx].title = e.target.value; setData({ ...data, items: ni }); }} />
            <textarea className={fieldClass} placeholder="Description" rows={2} value={item.description} onChange={e => { const ni = [...data.items]; ni[idx].description = e.target.value; setData({ ...data, items: ni }); }} />
            <input className={fieldClass} placeholder="Link URL" value={item.linkUrl} onChange={e => { const ni = [...data.items]; ni[idx].linkUrl = e.target.value; setData({ ...data, items: ni }); }} />
            <ImageUploadField label="Thumbnail" value={item.imageurl} fieldKey={`exp.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => { const ni = [...data.items]; ni[idx].imageurl = url; setData({ ...data, items: ni }); }} />
          </div>
        ))}
      </div>
    );
  };

  const renderStatsStripForm = () => {
    const data = form.data as AboutStatsStrip;
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">STAT ITEMS</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, stats: [...data.stats, { id: randomId(), label: '', imageurl: '', subtitle: '' }] })}>Add Stat</button>
        </div>
        {data.stats.map((stat, idx) => (
          <div key={stat.id} className="p-4 border rounded bg-gray-50 space-y-2 relative">
            <button type="button" onClick={() => setData({ ...data, stats: data.stats.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
            <div className="grid grid-cols-2 gap-2">
              <label className={labelClass}>Value Label <input className={fieldClass} value={stat.label} onChange={e => { const ns = [...data.stats]; ns[idx].label = e.target.value; setData({ ...data, stats: ns }); }} /></label>
              <label className={labelClass}>Subtitle <input className={fieldClass} value={stat.subtitle} onChange={e => { const ns = [...data.stats]; ns[idx].subtitle = e.target.value; setData({ ...data, stats: ns }); }} /></label>
            </div>
            <ImageUploadField label="Icon" value={stat.imageurl} fieldKey={`stat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => { const ns = [...data.stats]; ns[idx].imageurl = url; setData({ ...data, stats: ns }); }} />
          </div>
        ))}
      </div>
    );
  };

  const renderWhyChooseEnsisForm = () => {
    const data = form.data as AboutWhyChooseEnsis;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={3} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <ImageUploadField label="Main Image" value={data.imageurl} fieldKey="why.main" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => setData({ ...data, imageurl: url })} />
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">EXPERIENCE CARDS</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, experience: [...data.experience, { id: randomId(), title: '', description: '', imageurl: '' }] })}>Add Card</button>
        </div>
        {data.experience.map((item, idx) => (
          <div key={item.id} className="p-4 border rounded bg-gray-50 space-y-2 relative">
            <button type="button" onClick={() => setData({ ...data, experience: data.experience.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
            <input className={fieldClass} placeholder="Title" value={item.title} onChange={e => { const ne = [...data.experience]; ne[idx].title = e.target.value; setData({ ...data, experience: ne }); }} />
            <textarea className={fieldClass} placeholder="Description" rows={2} value={item.description} onChange={e => { const ne = [...data.experience]; ne[idx].description = e.target.value; setData({ ...data, experience: ne }); }} />
            <ImageUploadField label="Icon" value={item.imageurl} fieldKey={`why.item.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => { const ne = [...data.experience]; ne[idx].imageurl = url; setData({ ...data, experience: ne }); }} />
          </div>
        ))}
      </div>
    );
  };

  const renderTurnkeyProcessForm = () => {
    const data = form.data as AboutOurTurnkeyProcess;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <ImageUploadField label="Process Diagram" value={data.imageurl} fieldKey="process.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => setData({ ...data, imageurl: url })} />
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">PROCESS STEPS</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, steps: [...data.steps, { id: randomId(), title: '', description: '', imageurl: '' }] })}>Add Step</button>
        </div>
        {data.steps.map((step, idx) => (
          <div key={step.id} className="p-4 border rounded bg-gray-50 space-y-2 relative">
            <button type="button" onClick={() => setData({ ...data, steps: data.steps.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
            <input className={fieldClass} placeholder="Step Title" value={step.title} onChange={e => { const ns = [...data.steps]; ns[idx].title = e.target.value; setData({ ...data, steps: ns }); }} />
            <textarea className={fieldClass} placeholder="Step Description" rows={2} value={step.description} onChange={e => { const ns = [...data.steps]; ns[idx].description = e.target.value; setData({ ...data, steps: ns }); }} />
            <ImageUploadField label="Step Icon" value={step.imageurl} fieldKey={`step.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => { const ns = [...data.steps]; ns[idx].imageurl = url; setData({ ...data, steps: ns }); }} />
          </div>
        ))}
      </div>
    );
  };

  const renderIndustriesWeServeForm = () => {
    const data = form.data as AboutIndustriesWeServe;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Section Title <input className={fieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">INDUSTRIES</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, industries: [...data.industries, { id: randomId(), title: '', imageurl: '', linkUrl: '' }] })}>Add Industry</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {data.industries.map((ind, idx) => (
            <div key={ind.id} className="p-4 border rounded bg-gray-50 space-y-2 relative">
              <button type="button" onClick={() => setData({ ...data, industries: data.industries.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
              <input className={fieldClass} placeholder="Industry Name" value={ind.title} onChange={e => { const ni = [...data.industries]; ni[idx].title = e.target.value; setData({ ...data, industries: ni }); }} />
              <input className={fieldClass} placeholder="Link URL" value={ind.linkUrl} onChange={e => { const ni = [...data.industries]; ni[idx].linkUrl = e.target.value; setData({ ...data, industries: ni }); }} />
              <ImageUploadField label="Cover Image" value={ind.imageurl} fieldKey={`ind.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => { const ni = [...data.industries]; ni[idx].imageurl = url; setData({ ...data, industries: ni }); }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLetsBuildForm = () => {
    const data = form.data as AboutLetsBuild;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={3} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <ImageUploadField label="CTA Background" value={data.imageurl} fieldKey="cta.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => setData({ ...data, imageurl: url })} />
        <div className="grid grid-cols-2 gap-4 p-4 border rounded bg-gray-50">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">PRIMARY ACTION</h4>
            <input className={fieldClass} placeholder="Label" value={data.primaryAction.label} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, label: e.target.value } })} />
            <input className={fieldClass} placeholder="URL" value={data.primaryAction.url} onChange={e => setData({ ...data, primaryAction: { ...data.primaryAction, url: e.target.value } })} />
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">SECONDARY ACTION</h4>
            <input className={fieldClass} placeholder="Label" value={data.secondaryAction.label} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, label: e.target.value } })} />
            <input className={fieldClass} placeholder="URL" value={data.secondaryAction.url} onChange={e => setData({ ...data, secondaryAction: { ...data.secondaryAction, url: e.target.value } })} />
          </div>
        </div>
      </div>
    );
  };

  const renderHeaderForm = () => {
    const data = form.data as HeaderData;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className={labelClass}>Logo Text <input className={fieldClass} value={data.logoText} onChange={e => setData({ ...data, logoText: e.target.value })} /></label>
          <label className={labelClass}>Tagline <input className={fieldClass} value={data.logoTagline} onChange={e => setData({ ...data, logoTagline: e.target.value })} /></label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label className={labelClass}>CTA Label <input className={fieldClass} value={data.ctaText} onChange={e => setData({ ...data, ctaText: e.target.value })} /></label>
          <label className={labelClass}>CTA Link <input className={fieldClass} value={data.ctaHref} onChange={e => setData({ ...data, ctaHref: e.target.value })} /></label>
          <label className={labelClass}>Phone <input className={fieldClass} value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} /></label>
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-[#8d6a3a]">NAVIGATION ITEMS</h4>
            <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, navLinks: [...(data.navLinks || []), { label: '', slug: '' }] })}>Add Link</button>
          </div>
          {(data.navLinks || []).map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input className={fieldClass} placeholder="Label" value={item.label} onChange={e => { 
                const nn = data.navLinks.map((nav, i) => i === idx ? { ...nav, label: e.target.value } : nav); 
                setData({ ...data, navLinks: nn }); 
              }} />
              <input className={fieldClass} placeholder="Slug/URL" value={item.slug} onChange={e => { 
                const nn = data.navLinks.map((nav, i) => i === idx ? { ...nav, slug: e.target.value } : nav); 
                setData({ ...data, navLinks: nn }); 
              }} />
              <button type="button" onClick={() => setData({ ...data, navLinks: data.navLinks.filter((_, i) => i !== idx) })} className="text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFooterForm = () => {
    const data = form.data as FooterData;
    return (
      <div className="space-y-4">
        {/* Company Info */}
        <div className="p-4 border rounded bg-gray-50 space-y-3">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Company Information</h4>
          <label className={labelClass}>Company Name <input className={fieldClass} value={data.company?.name} onChange={e => setData({ ...data, company: { ...data.company, name: e.target.value } })} /></label>
          <label className={labelClass}>Company Description <textarea className={fieldClass} rows={2} value={data.company?.description} onChange={e => setData({ ...data, company: { ...data.company, description: e.target.value } })} /></label>
          <ImageUploadField label="Company Logo" value={data.company?.logo} fieldKey="footer.company.logo" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => setData({ ...data, company: { ...data.company, logo: url } })} />
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-[#5f5a50]">SOCIAL LINKS</span>
              <button type="button" className="text-xs bg-[#263016] text-white px-3 py-1 rounded font-bold" onClick={() => { const ns = structuredClone(data.company); ns.socialLinks.push({ image: '', url: '', alt: '' }); setData({ ...data, company: ns }); }}>+ Add Social Link</button>
            </div>
            {data.company?.socialLinks.map((s, idx) => (
              <div key={idx} className="bg-white p-3 border rounded space-y-3 mb-3 relative group">
                <button type="button" onClick={() => { const ns = structuredClone(data.company); ns.socialLinks.splice(idx, 1); setData({ ...data, company: ns }); }} className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                
                <ImageUploadField 
                  label="Platform Icon" 
                  value={s.image} 
                  fieldKey={`footer.social.${idx}`} 
                  uploadingField={uploadingField} 
                  onUploadingChange={setUploadingField} 
                  onError={setStatusMessage} 
                  onUpload={url => { 
                    const ns = structuredClone(data.company); 
                    ns.socialLinks[idx].image = url; 
                    setData({ ...data, company: ns }); 
                  }} 
                />

                <div className="grid grid-cols-2 gap-3">
                  <input className={fieldClass} placeholder="Alt Text (e.g. Facebook)" value={s.alt} onChange={e => { const ns = structuredClone(data.company); ns.socialLinks[idx].alt = e.target.value; setData({ ...data, company: ns }); }} />
                  <input className={fieldClass} placeholder="Profile URL" value={s.url} onChange={e => { const ns = structuredClone(data.company); ns.socialLinks[idx].url = e.target.value; setData({ ...data, company: ns }); }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation columns */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Navigation Columns</h4>
            <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, navigation: [...(data.navigation || []), { title: '', links: [] }] })}>Add Column</button>
          </div>
          <div className="grid gap-4">
            {(data.navigation || []).map((col, cIdx) => (
              <div key={cIdx} className="p-4 border rounded bg-gray-50 space-y-3">
                <div className="flex justify-between items-center">
                  <input className={`${fieldClass} font-bold`} placeholder="Column Title" value={col.title} onChange={e => { const nn = structuredClone(data.navigation); nn[cIdx].title = e.target.value; setData({ ...data, navigation: nn }); }} />
                  <button type="button" onClick={() => setData({ ...data, navigation: data.navigation.filter((_, i) => i !== cIdx) })} className="text-red-500 ml-2"><Trash2 size={16} /></button>
                </div>
                <div className="pl-4 border-l-2 space-y-2 border-[#d9cdbb]">
                   {(col.links || []).map((link, lIdx) => (
                     <div key={lIdx} className="flex gap-2">
                       <input className={fieldClass} placeholder="Label" value={link.label} onChange={e => { const nn = structuredClone(data.navigation); nn[cIdx].links[lIdx].label = e.target.value; setData({ ...data, navigation: nn }); }} />
                       <input className={fieldClass} placeholder="URL" value={link.href} onChange={e => { const nn = structuredClone(data.navigation); nn[cIdx].links[lIdx].href = e.target.value; setData({ ...data, navigation: nn }); }} />
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
        <div className="p-4 border rounded bg-gray-50 space-y-3">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Contact & Support</h4>
          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>Phone <input className={fieldClass} value={data.contact?.phone} onChange={e => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} /></label>
            <label className={labelClass}>Email <input className={fieldClass} value={data.contact?.email} onChange={e => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} /></label>
          </div>
          <label className={labelClass}>Address <input className={fieldClass} value={data.contact?.address} onChange={e => setData({ ...data, contact: { ...data.contact, address: e.target.value } })} /></label>
          <ImageUploadField label="Contact/Alt Logo" value={data.contact?.logo} fieldKey="footer.contact.logo" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => setData({ ...data, contact: { ...data.contact, logo: url } })} />
          
          <div className="p-3 bg-white border rounded space-y-2">
            <h5 className="text-[10px] font-bold text-[#5f5a50]">WHATSAPP SETTINGS</h5>
            <div className="grid grid-cols-3 gap-2">
              <input className={fieldClass} placeholder="Button Label" value={data.contact?.whatsapp?.label} onChange={e => { 
                const nc = structuredClone(data.contact); 
                nc.whatsapp.label = e.target.value; 
                setData({ ...data, contact: nc }); 
              }} />
              <input className={fieldClass} placeholder="Phone (with code)" value={data.contact?.whatsapp?.phone} onChange={e => { 
                const nc = structuredClone(data.contact); 
                nc.whatsapp.phone = e.target.value; 
                setData({ ...data, contact: nc }); 
              }} />
              <input className={fieldClass} placeholder="Direct URL" value={data.contact?.whatsapp?.url} onChange={e => { 
                const nc = structuredClone(data.contact); 
                nc.whatsapp.url = e.target.value; 
                setData({ ...data, contact: nc }); 
              }} />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="p-4 border rounded bg-gray-50">
          <label className={labelClass}>Copyright Text <input className={fieldClass} value={data.copyright?.text} onChange={e => setData({ ...data, copyright: { text: e.target.value } })} /></label>
        </div>
      </div>
    );
  };

  const renderTestimonialsForm = () => {
    const data = form.data as TestimonialsData;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Subtitle <input className={fieldClass} value={data.subtitle} onChange={e => setData({ ...data, subtitle: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#8d6a3a]">TESTIMONIALS</h4>
          <button type="button" className="text-xs bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setData({ ...data, testimonials: [...data.testimonials, { text: '', name: '', role: '', image: '' }] })}>Add Testimonial</button>
        </div>
        {data.testimonials.map((t, idx) => (
          <div key={idx} className="p-4 border rounded bg-gray-50 space-y-2 relative">
            <button type="button" onClick={() => setData({ ...data, testimonials: data.testimonials.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
            <textarea className={fieldClass} placeholder="Review Text" rows={3} value={t.text} onChange={e => { const nt = [...data.testimonials]; nt[idx].text = e.target.value; setData({ ...data, testimonials: nt }); }} />
            <div className="grid grid-cols-2 gap-2">
              <input className={fieldClass} placeholder="Name" value={t.name} onChange={e => { const nt = [...data.testimonials]; nt[idx].name = e.target.value; setData({ ...data, testimonials: nt }); }} />
              <input className={fieldClass} placeholder="Role" value={t.role} onChange={e => { const nt = [...data.testimonials]; nt[idx].role = e.target.value; setData({ ...data, testimonials: nt }); }} />
            </div>
            <ImageUploadField label="Avatar" value={t.image} fieldKey={`testi.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => { const nt = [...data.testimonials]; nt[idx].image = url; setData({ ...data, testimonials: nt }); }} />
          </div>
        ))}
      </div>
    );
  };

  const renderFounderVisionForm = () => {
    const data = form.data as AboutFounderVision;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Heading <input className={fieldClass} value={data.heading} onChange={e => setData({ ...data, heading: e.target.value })} /></label>
        <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={4} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-4">
          <ImageUploadField label="Founder Image" value={data.founderImageurl} fieldKey="f.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => setData({ ...data, founderImageurl: url })} />
          <ImageUploadField label="Signature" value={data.signatureImageurl} fieldKey="f.sig" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={setStatusMessage} onUpload={url => setData({ ...data, signatureImageurl: url })} />
        </div>
        <div className="p-4 border rounded bg-white space-y-2">
          <h4 className="text-[10px] font-bold text-[#8d6a3a] mb-2">FOUNDER DETAILS</h4>
          <input className={fieldClass} placeholder="Name/Title" value={data.aboutFounder.title} onChange={e => setData({ ...data, aboutFounder: { ...data.aboutFounder, title: e.target.value } })} />
          <input className={fieldClass} placeholder="Company" value={data.aboutFounder.company} onChange={e => setData({ ...data, aboutFounder: { ...data.aboutFounder, company: e.target.value } })} />
          <input className={fieldClass} placeholder="Division" value={data.aboutFounder.division} onChange={e => setData({ ...data, aboutFounder: { ...data.aboutFounder, division: e.target.value } })} />
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
        <aside className="lg:col-span-4 space-y-4">
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
        </aside>

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

              {statusMessage && (
                <div className={`flex items-center gap-2 p-4 rounded-xl text-sm font-bold ${statusMessage.includes("fail") ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                  {statusMessage.includes("success") ? <CheckCircle size={18} /> : null}
                  {statusMessage}
                </div>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}