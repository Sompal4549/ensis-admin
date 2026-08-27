"use client";

import { ImageUploadField } from "@/components/common/ImageUploadField";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Save, Trash2 } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import {
  enquiryPageKeys,
  defaultEnquiryData,
  type EnquiryPageContentKeys,
  type EnquiryPageForm,
  type GetInTouchBannerData,
  type CtaBannerData,
  type StatsStripData,
} from "@/lib/enquiry/enquiryPageContent";

type ContentForm = Omit<ComponentContent, "_id"> & { key: EnquiryPageContentKeys };

const randomId = () => Math.random().toString(36).slice(2, 9);
const cardClass = "p-2 border rounded bg-gray-50 space-y-1.5 relative";
const sectionHeaderClass = "text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide";
const addBtnClass = "text-[11px] bg-[#263016] text-white px-2 py-1 rounded";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";

export default function EnquiryComponentEditor({ componentKey, title }: { componentKey: EnquiryPageContentKeys; title: string }) {
  const [form, setForm] = useState<ContentForm>({ key: componentKey, label: title, page: "enquiry", description: "", isActive: true, data: (defaultEnquiryData[componentKey] || {}) as Record<string, unknown> });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ message: string; id: string } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      const existing = list.find((r) => r.key === componentKey);
      if (existing) {
        setEditingId(existing._id);
        setForm({ key: existing.key as EnquiryPageContentKeys, label: existing.label, page: existing.page || "enquiry", description: existing.description || "", isActive: existing.isActive, data: (existing.data as Record<string, unknown>) || {} });
      } else {
        setEditingId(null);
        const keyInfo = enquiryPageKeys.find((k) => k.key === componentKey);
        setForm((prev) => ({ ...prev, key: componentKey, label: keyInfo?.label || title, description: keyInfo?.description || "", data: (defaultEnquiryData[componentKey] || {}) as Record<string, unknown> }));
      }
    } catch { toast.error("Failed to load components."); } finally { setLoading(false); }
  }, [componentKey, title]);

  useEffect(() => { refresh(); }, [refresh]);

  const setData = (nextData: Record<string, unknown>) => setForm((current) => ({ ...current, data: nextData }));
  const handleKeyChange = (key: EnquiryPageContentKeys) => { setEditingId(null); setForm((prev) => ({ ...prev, key, label: enquiryPageKeys.find((k) => k.key === key)?.label || prev.label, data: defaultEnquiryData[key] as Record<string, unknown> })); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingId) { await componentContentApi.update(editingId, form); toast.success("Updated successfully!"); }
      else { await componentContentApi.create(form); toast.success("Created successfully!"); }
      await refresh();
    } catch { toast.error("Save failed."); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try { await componentContentApi.remove(id); toast.success("Component deleted"); } catch { toast.error("Delete failed"); }
    setEditingId(null); refresh();
  };
  const confirmDeleteClick = (id: string, message: string) => setPendingDelete({ id, message });

  const renderEnquiryForm = () => {
    const data = form.data as unknown as EnquiryPageForm;
    return (
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-4">
          <h4 className={sectionHeaderClass}>Hero Section</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.hero?.heading || ""} onChange={(e) => setData({ ...data, hero: { ...data.hero, heading: e.target.value } })} /></label>
            <label className={smallLabelClass}>Subheading <input className={smallFieldClass} value={data.hero?.subheading || ""} onChange={(e) => setData({ ...data, hero: { ...data.hero, subheading: e.target.value } })} /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ImageUploadField label="Hero Image" value={data.hero?.imageSrc} fieldKey="enquiry.hero.image" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={(url) => setData({ ...data, hero: { ...data.hero, imageSrc: url } })} />
            <ImageUploadField label="Form Image" value={data.hero?.formImageSrc} fieldKey="enquiry.hero.formImage" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={(url) => setData({ ...data, hero: { ...data.hero, formImageSrc: url } })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className={smallLabelClass}>Hero Image Alt <input className={smallFieldClass} value={data.hero?.imageAlt || ""} onChange={(e) => setData({ ...data, hero: { ...data.hero, imageAlt: e.target.value } })} /></label>
            <label className={smallLabelClass}>Form Image Alt <input className={smallFieldClass} value={data.hero?.formImageAlt || ""} onChange={(e) => setData({ ...data, hero: { ...data.hero, formImageAlt: e.target.value } })} /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h5 className="text-[10px] font-bold text-[#8d6a3a]">PRIMARY CTA</h5>
              <div className="grid grid-cols-2 gap-1">
                <input className={smallFieldClass} placeholder="Label" value={data.hero?.ctaPrimary?.label || ""} onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaPrimary: { ...data.hero?.ctaPrimary, label: e.target.value } } })} />
                <input className={smallFieldClass} placeholder="Href" value={data.hero?.ctaPrimary?.href || ""} onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaPrimary: { ...data.hero?.ctaPrimary, href: e.target.value } } })} />
              </div>
            </div>
            <div>
              <h5 className="text-[10px] font-bold text-[#8d6a3a]">SECONDARY CTA</h5>
              <div className="grid grid-cols-2 gap-1">
                <input className={smallFieldClass} placeholder="Label" value={data.hero?.ctaSecondary?.label || ""} onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaSecondary: { ...data.hero?.ctaSecondary, label: e.target.value } } })} />
                <input className={smallFieldClass} placeholder="Href" value={data.hero?.ctaSecondary?.href || ""} onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaSecondary: { ...data.hero?.ctaSecondary, href: e.target.value } } })} />
              </div>
            </div>
          </div>
          <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.hero?.description || ""} onChange={(e) => setData({ ...data, hero: { ...data.hero, description: e.target.value } })} /></label>
          <div className="flex justify-between items-center mt-2">
            <h5 className="text-[10px] font-bold text-[#8d6a3a]">TRUST INDICATORS</h5>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, hero: { ...data.hero, trustIndicators: [...(data.hero?.trustIndicators || []), { id: randomId(), label: "" }] } })}>+ Add</button>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {(data.hero?.trustIndicators || []).map((item, idx) => (
              <div key={item.id} className="flex gap-1">
                <input className={smallFieldClass} placeholder="Label" value={item.label || ""} onChange={(e) => { const nt = [...(data.hero?.trustIndicators || [])]; nt[idx] = { ...nt[idx], label: e.target.value }; setData({ ...data, hero: { ...data.hero, trustIndicators: nt } }); }} />
                <button type="button" onClick={() => setData({ ...data, hero: { ...data.hero, trustIndicators: (data.hero?.trustIndicators || []).filter((_, i) => i !== idx) } })} className="text-red-500"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
        <label className={smallLabelClass}>Form Title <input className={smallFieldClass} value={data.formTitle || ""} onChange={(e) => setData({ ...data, formTitle: e.target.value })} /></label>
        <div className="border-b border-slate-100 pb-4">
          <h4 className={sectionHeaderClass}>Select Options</h4>
          {["projectTypeOptions", "stateOptions", "cityOptions", "projectSizeOptions", "budgetRangeOptions", "timelineOptions"].map((key) => (
            <div key={key} className="mt-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#5f5a50]">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <button type="button" className={addBtnClass} onClick={() => setData({ ...data, [key]: [...((data as any)[key] || []), { value: "", label: "" }] })}>+ Add</button>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {((data as any)[key] || []).map((opt: any, idx: number) => (
                  <div key={idx} className="flex gap-1">
                    <input className={smallFieldClass} placeholder="Value" value={opt.value || ""} onChange={(e) => { const arr = [...(data as any)[key]]; arr[idx] = { ...arr[idx], value: e.target.value }; setData({ ...data, [key]: arr }); }} />
                    <input className={smallFieldClass} placeholder="Label" value={opt.label || ""} onChange={(e) => { const arr = [...(data as any)[key]]; arr[idx] = { ...arr[idx], label: e.target.value }; setData({ ...data, [key]: arr }); }} />
                    <button type="button" onClick={() => setData({ ...data, [key]: (data as any)[key].filter((_: any, i: number) => i !== idx) })} className="text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-center"><h4 className={sectionHeaderClass}>Services Options (Checkbox)</h4><button type="button" className={addBtnClass} onClick={() => setData({ ...data, servicesOptions: [...(data.servicesOptions || []), { id: randomId(), label: "" }] })}>+ Add</button></div>
          <div className="grid grid-cols-2 gap-1 mt-1">{(data.servicesOptions || []).map((item, idx) => (<div key={item.id} className="flex gap-1"><input className={smallFieldClass} placeholder="Label" value={item.label || ""} onChange={(e) => { const ns = [...(data.servicesOptions || [])]; ns[idx] = { ...ns[idx], label: e.target.value }; setData({ ...data, servicesOptions: ns }); }} /><button type="button" onClick={() => setData({ ...data, servicesOptions: (data.servicesOptions || []).filter((_, i) => i !== idx) })} className="text-red-500"><Trash2 size={12} /></button></div>))}</div>
        </div>
        <div className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-center"><h4 className={sectionHeaderClass}>Preferred Contact Options (Radio)</h4><button type="button" className={addBtnClass} onClick={() => setData({ ...data, preferredContactOptions: [...(data.preferredContactOptions || []), { id: randomId(), label: "" }] })}>+ Add</button></div>
          <div className="grid grid-cols-2 gap-1 mt-1">{(data.preferredContactOptions || []).map((item, idx) => (<div key={item.id} className="flex gap-1"><input className={smallFieldClass} placeholder="Label" value={item.label || ""} onChange={(e) => { const nr = [...(data.preferredContactOptions || [])]; nr[idx] = { ...nr[idx], label: e.target.value }; setData({ ...data, preferredContactOptions: nr }); }} /><button type="button" onClick={() => setData({ ...data, preferredContactOptions: (data.preferredContactOptions || []).filter((_, i) => i !== idx) })} className="text-red-500"><Trash2 size={12} /></button></div>))}</div>
        </div>
        <div className="border-b border-slate-100 pb-4">
          <h4 className={sectionHeaderClass}>Why Choose Section</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.whyChoose?.heading || ""} onChange={(e) => setData({ ...data, whyChoose: { ...data.whyChoose, heading: e.target.value } })} /></label>
            <ImageUploadField label="Bottom Image" value={data.whyChoose?.bottomImageSrc} fieldKey="enquiry.whyChoose.bottom" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={(url) => setData({ ...data, whyChoose: { ...data.whyChoose, bottomImageSrc: url } })} />
          </div>
          <div className="flex justify-between items-center mt-2"><span className="text-[10px] font-bold text-[#5f5a50]">Items</span><button type="button" className={addBtnClass} onClick={() => setData({ ...data, whyChoose: { ...data.whyChoose, items: [...(data.whyChoose?.items || []), { id: randomId(), iconSrc: "", iconAlt: "", title: "", description: "" }] } })}>+ Add Item</button></div>
          <div className="grid grid-cols-2 gap-2 mt-1">{(data.whyChoose?.items || []).map((item, idx) => (<div key={item.id} className={cardClass}><button type="button" onClick={() => setData({ ...data, whyChoose: { ...data.whyChoose, items: (data.whyChoose?.items || []).filter((_, i) => i !== idx) } })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button><ImageUploadField label="Icon" value={item.iconSrc} fieldKey={`enquiry.whyChoose.item.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={(url) => { const ni = [...(data.whyChoose?.items || [])]; ni[idx] = { ...ni[idx], iconSrc: url }; setData({ ...data, whyChoose: { ...data.whyChoose, items: ni } }); }} /><input className={smallFieldClass} placeholder="Title" value={item.title || ""} onChange={(e) => { const ni = [...(data.whyChoose?.items || [])]; ni[idx] = { ...ni[idx], title: e.target.value }; setData({ ...data, whyChoose: { ...data.whyChoose, items: ni } }); }} /><textarea className={smallFieldClass} rows={2} placeholder="Description" value={item.description || ""} onChange={(e) => { const ni = [...(data.whyChoose?.items || [])]; ni[idx] = { ...ni[idx], description: e.target.value }; setData({ ...data, whyChoose: { ...data.whyChoose, items: ni } }); }} /></div>))}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Upload Label <input className={smallFieldClass} value={data.upload?.label || ""} onChange={(e) => setData({ ...data, upload: { ...data.upload, label: e.target.value } })} /></label>
          <label className={smallLabelClass}>Upload Helper Text <input className={smallFieldClass} value={data.upload?.helperText || ""} onChange={(e) => setData({ ...data, upload: { ...data.upload, helperText: e.target.value } })} /></label>
        </div>
        <label className={smallLabelClass}>Consent Text <textarea className={smallFieldClass} rows={2} value={data.consentText || ""} onChange={(e) => setData({ ...data, consentText: e.target.value })} /></label>
        <label className={smallLabelClass}>Submit Button Text <input className={smallFieldClass} value={data.submitButtonText || ""} onChange={(e) => setData({ ...data, submitButtonText: e.target.value })} /></label>
      </div>
    );
  };

  const renderGetInTouchForm = () => {
    const data = form.data as unknown as GetInTouchBannerData;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading || ""} onChange={(e) => setData({ ...data, heading: e.target.value })} /></label>
        <div className="flex justify-between items-center"><h4 className={sectionHeaderClass}>Contact Items</h4><button type="button" className={addBtnClass} onClick={() => setData({ ...data, items: [...(data.items || []), { id: randomId(), label: "", iconSrc: "", lines: [""] }] })}>+ Add Item</button></div>
        <div className="space-y-2">{(data.items || []).map((item, idx) => (<div key={item.id} className={cardClass}><button type="button" onClick={() => setData({ ...data, items: data.items.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button><input className={smallFieldClass} placeholder="Label" value={item.label || ""} onChange={(e) => { const ni = [...data.items]; ni[idx] = { ...ni[idx], label: e.target.value }; setData({ ...data, items: ni }); }} /><ImageUploadField label="Icon" value={item.iconSrc} fieldKey={`enquiry.getInTouch.item.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={(url) => { const ni = [...data.items]; ni[idx] = { ...ni[idx], iconSrc: url }; setData({ ...data, items: ni }); }} /><div className="flex justify-between items-center mt-1"><span className="text-[10px] font-bold text-[#5f5a50]">Lines</span><button type="button" className="text-[10px] text-[#8d6a3a] font-bold" onClick={() => { const ni = [...data.items]; ni[idx] = { ...ni[idx], lines: [...(item.lines || []), ""] }; setData({ ...data, items: ni }); }}>+ Add Line</button></div>{(item.lines || []).map((line, lIdx) => (<div key={lIdx} className="flex gap-1"><input className={smallFieldClass} placeholder="Line" value={line || ""} onChange={(e) => { const ni = [...data.items]; const nl = [...(item.lines || [])]; nl[lIdx] = e.target.value; ni[idx] = { ...ni[idx], lines: nl }; setData({ ...data, items: ni }); }} /><button type="button" onClick={() => { const ni = [...data.items]; const nl = (item.lines || []).filter((_, i) => i !== lIdx); ni[idx] = { ...ni[idx], lines: nl }; setData({ ...data, items: ni }); }} className="text-red-500"><Trash2 size={10} /></button></div>))}</div>))}</div>
      </div>
    );
  };

  const renderCtaBannerForm = () => {
    const data = form.data as unknown as CtaBannerData;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading || ""} onChange={(e) => setData({ ...data, heading: e.target.value })} /></label>
          <label className={smallLabelClass}>CTA Label <input className={smallFieldClass} value={data.ctaLabel || ""} onChange={(e) => setData({ ...data, ctaLabel: e.target.value })} /></label>
        </div>
        <label className={smallLabelClass}>CTA Href <input className={smallFieldClass} value={data.ctaHref || ""} onChange={(e) => setData({ ...data, ctaHref: e.target.value })} /></label>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={3} value={data.description || ""} onChange={(e) => setData({ ...data, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-2">
          <div><ImageUploadField label="Left Image" value={data.leftImage?.imageUrl} fieldKey="enquiry.cta.left" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={(url) => setData({ ...data, leftImage: { ...data.leftImage, imageUrl: url } })} /><label className={smallLabelClass}>Alt <input className={smallFieldClass} value={data.leftImage?.alt || ""} onChange={(e) => setData({ ...data, leftImage: { ...data.leftImage, alt: e.target.value } })} /></label></div>
          <div><ImageUploadField label="Right Image" value={data.rightImage?.imageUrl} fieldKey="enquiry.cta.right" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={(url) => setData({ ...data, rightImage: { ...data.rightImage, imageUrl: url } })} /><label className={smallLabelClass}>Alt <input className={smallFieldClass} value={data.rightImage?.alt || ""} onChange={(e) => setData({ ...data, rightImage: { ...data.rightImage, alt: e.target.value } })} /></label></div>
        </div>
      </div>
    );
  };

  const renderStatsStripForm = () => {
    const data = form.data as unknown as StatsStripData;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center"><h4 className={sectionHeaderClass}>Stats Items</h4><button type="button" className={addBtnClass} onClick={() => setData({ ...data, items: [...(data.items || []), { id: randomId(), title: "", description: "", imageurl: { imageUrl: "", alt: "" } }] })}>+ Add Item</button></div>
        <div className="grid grid-cols-3 gap-2">{(data.items || []).map((item, idx) => (<div key={item.id} className={cardClass}><button type="button" onClick={() => setData({ ...data, items: data.items.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button><input className={smallFieldClass} placeholder="Title (e.g. 20+)" value={item.title || ""} onChange={(e) => { const ni = [...data.items]; ni[idx] = { ...ni[idx], title: e.target.value }; setData({ ...data, items: ni }); }} /><input className={smallFieldClass} placeholder="Description" value={item.description || ""} onChange={(e) => { const ni = [...data.items]; ni[idx] = { ...ni[idx], description: e.target.value }; setData({ ...data, items: ni }); }} /><ImageUploadField label="Icon" value={item.imageurl?.imageUrl} fieldKey={`enquiry.stats.item.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={(url) => { const ni = [...data.items]; ni[idx] = { ...ni[idx], imageurl: { ...ni[idx].imageurl, imageUrl: url } }; setData({ ...data, items: ni }); }} /></div>))}</div>
      </div>
    );
  };

  if (loading && !editingId) { return (<div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#8d6a3a]" size={40} /></div>); }

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-sm">
      <header className="mb-4 flex items-center justify-between border-b border-[#eee5d9] pb-3">
        <div><span className="text-[10px] font-bold uppercase tracking-widest text-[#8d6a3a]">Configuration</span><h1 className="text-xl text-[#1f261b] mt-0.5">Enquiry Page Content</h1><p className="mt-1 text-[#5f5a50] text-xs leading-snug max-w-xl">Manage sections of the enquiry page. Select an existing component to edit.</p></div>
      </header>
      <div className="grid grid-cols-1"><section>
        <form onSubmit={handleSave} className="bg-white border border-[#ded3c4] rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#fcfaf7] border-b border-[#eee5d9] p-3 flex items-center justify-between">
            <div><h2 className="text-base text-[#1f261b]">{editingId ? "Edit Component" : "Create New Component"}</h2><p className="text-[10px] text-[#5f5a50] mt-0.5 italic">Structured data for rendering page sections</p></div>
            <div className="flex items-center gap-2">
              {editingId && (<button type="button" onClick={() => confirmDeleteClick(editingId, "Are you sure?")} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>)}
              <button type="submit" disabled={loading} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8d6a3a] text-white rounded-lg font-bold text-xs shadow hover:bg-[#6f542f] transition-all disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}{editingId ? "Update Section" : "Publish Section"}</button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-4 gap-3 bg-[#fcfaf7] p-3 rounded-lg border border-[#eee5d9] items-end">
              <label className={smallLabelClass}>Template / Component Key<select className={`${smallFieldClass} font-bold`} value={form.key} onChange={(e) => handleKeyChange(e.target.value as EnquiryPageContentKeys)}>{enquiryPageKeys.map((k) => (<option key={k.key} value={k.key}>{k.label}</option>))}</select></label>
              <label className={smallLabelClass}>Internal Label<input className={smallFieldClass} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Friendly name for admin" /></label>
              <label className={smallLabelClass}>Page ID<input className={smallFieldClass} value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })} /></label>
              <div className="flex items-center gap-1.5 pb-1"><input type="checkbox" id="isActive" className="w-4 h-4 rounded accent-[#8d6a3a]" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /><label htmlFor="isActive" className="text-[11px] font-bold text-[#1f261b] uppercase">Active on page</label></div>
            </div>
            <div className="pt-1">
              <div className="mb-3 flex items-center gap-3"><div className="h-px flex-1 bg-[#eee5d9]" /><span className="text-[10px] font-black tracking-[0.2em] text-[#8d6a3a] uppercase">Component Content</span><div className="h-px flex-1 bg-[#eee5d9]" /></div>
              {form.key === "enquiry.page" && renderEnquiryForm()}
              {form.key === "enquiry.getInTouch" && renderGetInTouchForm()}
              {form.key === "enquiry.ctaBanner" && renderCtaBannerForm()}
              {form.key === "enquiry.features_strip" && renderStatsStripForm()}
            </div>
          </div>
        </form>
      </section></div>
      <ConfirmDialog isOpen={!!pendingDelete} title="Confirm Delete" message={pendingDelete?.message} onConfirm={async () => { if (!pendingDelete) return; await handleDelete(pendingDelete.id); }} onClose={() => setPendingDelete(null)} />
    </div>
  );
}
