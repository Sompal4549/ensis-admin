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
  consultancyPageKeys,
  defaultConsultancyData,
  type ConsultancyPageContentKeys,
} from "@/components/common/consultancyPageContent";
import { fieldClass, labelClass } from "@/constants";

type ContentForm = Omit<ComponentContent, "_id"> & { key: ConsultancyPageContentKeys };

const randomId = () => Math.random().toString(36).slice(2, 9);

const cardClass = "p-2 border rounded bg-gray-50 space-y-1.5 relative";
const sectionHeaderClass = "text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide";
const addBtnClass = "text-[11px] bg-[#263016] text-white px-2 py-1 rounded";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";

export default function ConsultancyComponentEditor({ componentKey, title }: { componentKey: ConsultancyPageContentKeys; title: string }) {
  const [form, setForm] = useState<ContentForm>({
    key: componentKey,
    label: title,
    page: "consultancy",
    description: "",
    isActive: true,
    data: (defaultConsultancyData[componentKey] || {}) as Record<string, unknown>,
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
          key: existing.key as ConsultancyPageContentKeys,
          label: existing.label,
          page: existing.page || "consultancy",
          description: existing.description || "",
          isActive: existing.isActive,
          data: (existing.data as Record<string, unknown>) || {},
        });
      } else {
        setEditingId(null);
        const keyInfo = consultancyPageKeys.find(k => k.key === componentKey);
        setForm(prev => ({
          ...prev,
          key: componentKey,
          label: keyInfo?.label || title,
          description: keyInfo?.description || "",
          data: (defaultConsultancyData[componentKey] || {}) as Record<string, unknown>,
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

  const handleKeyChange = (key: ConsultancyPageContentKeys) => {
    setEditingId(null);
    setForm(prev => ({
      ...prev,
      key,
      label: consultancyPageKeys.find(k => k.key === key)?.label || prev.label,
      data: defaultConsultancyData[key] as Record<string, unknown>,
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
          <label className={smallLabelClass}>Title Part 1 <input className={smallFieldClass} value={data.titlepart1 || ""} onChange={e => setData({ ...data, titlepart1: e.target.value })} /></label>
          <label className={smallLabelClass}>Title Part 2 <input className={smallFieldClass} value={data.titlepart2 || ""} onChange={e => setData({ ...data, titlepart2: e.target.value })} /></label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title Highlight <input className={smallFieldClass} value={data.titleHighlight || ""} onChange={e => setData({ ...data, titleHighlight: e.target.value })} /></label>
          <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="consultancy.hero.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, bgImage: url })} />
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Features</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, features: [...(data.features || []), { id: randomId(), image: '', title: '', description: '', primaryButton: { label: '', href: '' }, secondaryButton: { label: '', href: '' } }] })}>+ Add Feature</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.features || []).map((feat: any, idx: number) => (
              <div key={feat.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, features: data.features.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Title" value={feat.title || ""} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setData({ ...data, features: nf }); }} />
                <input className={smallFieldClass} placeholder="Description" value={feat.description || ""} onChange={e => { const nf = [...data.features]; nf[idx].description = e.target.value; setData({ ...data, features: nf }); }} />
                <ImageUploadField label="Image" value={feat.image} fieldKey={`consultancy.hero.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].image = url; setData({ ...data, features: nf }); }} />
                <div className="grid grid-cols-2 gap-1">
                  <input className={smallFieldClass} placeholder="Primary Label" value={feat.primaryButton?.label || ""} onChange={e => { const nf = [...data.features]; nf[idx].primaryButton = { ...nf[idx].primaryButton, label: e.target.value }; setData({ ...data, features: nf }); }} />
                  <input className={smallFieldClass} placeholder="Primary Href" value={feat.primaryButton?.href || ""} onChange={e => { const nf = [...data.features]; nf[idx].primaryButton = { ...nf[idx].primaryButton, href: e.target.value }; setData({ ...data, features: nf }); }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFeaturesForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Feature Items</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, items: [...(data.items || []), { id: randomId(), title: '', heading: '', description: '', image: '' }] })}>+ Add Item</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(data.items || []).map((item: any, idx: number) => (
            <div key={item.id} className={cardClass}>
              <button type="button" onClick={() => setData({ ...data, items: data.items.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
              <input className={smallFieldClass} placeholder="Title" value={item.title || ""} onChange={e => { const ni = [...data.items]; ni[idx].title = e.target.value; setData({ ...data, items: ni }); }} />
              <input className={smallFieldClass} placeholder="Heading" value={item.heading || ""} onChange={e => { const ni = [...data.items]; ni[idx].heading = e.target.value; setData({ ...data, items: ni }); }} />
              <input className={smallFieldClass} placeholder="Description" value={item.description || ""} onChange={e => { const ni = [...data.items]; ni[idx].description = e.target.value; setData({ ...data, items: ni }); }} />
              <ImageUploadField label="Image" value={item.image} fieldKey={`consultancy.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ni = [...data.items]; ni[idx].image = url; setData({ ...data, items: ni }); }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWhatWeOfferForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>Subheading <input className={smallFieldClass} value={data.subheading || ""} onChange={e => setData({ ...data, subheading: e.target.value })} /></label>
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Description <input className={smallFieldClass} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Service Cards</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, serviceCards: [...(data.serviceCards || []), { id: randomId(), title: '', description: '', learnMoreLink: '', image: '', learnMoreText: '' }] })}>+ Add Card</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.serviceCards || []).map((card: any, idx: number) => (
              <div key={card.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, serviceCards: data.serviceCards.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Title" value={card.title || ""} onChange={e => { const nc = [...data.serviceCards]; nc[idx].title = e.target.value; setData({ ...data, serviceCards: nc }); }} />
                <input className={smallFieldClass} placeholder="Description" value={card.description || ""} onChange={e => { const nc = [...data.serviceCards]; nc[idx].description = e.target.value; setData({ ...data, serviceCards: nc }); }} />
                <ImageUploadField label="Image" value={card.image} fieldKey={`consultancy.offer.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nc = [...data.serviceCards]; nc[idx].image = url; setData({ ...data, serviceCards: nc }); }} />
                <div className="grid grid-cols-2 gap-1">
                  <input className={smallFieldClass} placeholder="Learn More Text" value={card.learnMoreText || ""} onChange={e => { const nc = [...data.serviceCards]; nc[idx].learnMoreText = e.target.value; setData({ ...data, serviceCards: nc }); }} />
                  <input className={smallFieldClass} placeholder="Learn More Link" value={card.learnMoreLink || ""} onChange={e => { const nc = [...data.serviceCards]; nc[idx].learnMoreLink = e.target.value; setData({ ...data, serviceCards: nc }); }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProcessValuesForm = () => {
    const data = form.data as Record<string, any>;
    const whyChoose = data.whyChoose || {};
    const ourProcess = data.ourProcess || {};

    return (
      <div className="space-y-2">
        <div className="p-2 border rounded bg-gray-50">
          <h4 className={sectionHeaderClass}>Why Choose Us</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={whyChoose.heading || ""} onChange={e => setData({ ...data, whyChoose: { ...whyChoose, heading: e.target.value } })} /></label>
            <label className={smallLabelClass}>Title <input className={smallFieldClass} value={whyChoose.title || ""} onChange={e => setData({ ...data, whyChoose: { ...whyChoose, title: e.target.value } })} /></label>
          </div>
          <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={whyChoose.description || ""} onChange={e => setData({ ...data, whyChoose: { ...whyChoose, description: e.target.value } })} /></label>
          <ImageUploadField label="Background Image" value={whyChoose.bgImage} fieldKey="consultancy.why.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, whyChoose: { ...whyChoose, bgImage: url } })} />

          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-[#8d6a3a]">CHOOSE LIST</span>
              <button type="button" className={addBtnClass} onClick={() => setData({ ...data, whyChoose: { ...whyChoose, chooseList: [...(whyChoose.chooseList || []), { text: '' }] } })}>+ Add</button>
            </div>
            {(whyChoose.chooseList || []).map((item: any, idx: number) => (
              <div key={idx} className="flex gap-1 mb-1">
                <input className={smallFieldClass} placeholder="Text" value={item.text || ""} onChange={e => { const nl = [...whyChoose.chooseList]; nl[idx].text = e.target.value; setData({ ...data, whyChoose: { ...whyChoose, chooseList: nl } }); }} />
                <button type="button" onClick={() => { const nl = whyChoose.chooseList.filter((_: any, i: number) => i !== idx); setData({ ...data, whyChoose: { ...whyChoose, chooseList: nl } }); }} className="text-red-500"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <input className={smallFieldClass} placeholder="Button Label" value={whyChoose.primaryButton?.label || ""} onChange={e => setData({ ...data, whyChoose: { ...whyChoose, primaryButton: { ...whyChoose.primaryButton, label: e.target.value } } })} />
            <input className={smallFieldClass} placeholder="Button Href" value={whyChoose.primaryButton?.href || ""} onChange={e => setData({ ...data, whyChoose: { ...whyChoose, primaryButton: { ...whyChoose.primaryButton, href: e.target.value } } })} />
          </div>
        </div>

        <div className="p-2 border rounded bg-gray-50">
          <h4 className={sectionHeaderClass}>Our Process</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={ourProcess.heading || ""} onChange={e => setData({ ...data, ourProcess: { ...ourProcess, heading: e.target.value } })} /></label>
            <label className={smallLabelClass}>Title <input className={smallFieldClass} value={ourProcess.title || ""} onChange={e => setData({ ...data, ourProcess: { ...ourProcess, title: e.target.value } })} /></label>
          </div>

          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-[#8d6a3a]">PROCESS STEPS</span>
              <button type="button" className={addBtnClass} onClick={() => setData({ ...data, ourProcess: { ...ourProcess, processList: [...(ourProcess.processList || []), { id: randomId(), title: '', description: '', image: '', color: '' }] } })}>+ Add Step</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(ourProcess.processList || []).map((step: any, idx: number) => (
                <div key={step.id} className={cardClass}>
                  <button type="button" onClick={() => { const nl = ourProcess.processList.filter((_: any, i: number) => i !== idx); setData({ ...data, ourProcess: { ...ourProcess, processList: nl } }); }} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                  <input className={smallFieldClass} placeholder="Title" value={step.title || ""} onChange={e => { const nl = [...ourProcess.processList]; nl[idx].title = e.target.value; setData({ ...data, ourProcess: { ...ourProcess, processList: nl } }); }} />
                  <input className={smallFieldClass} placeholder="Description" value={step.description || ""} onChange={e => { const nl = [...ourProcess.processList]; nl[idx].description = e.target.value; setData({ ...data, ourProcess: { ...ourProcess, processList: nl } }); }} />
                  <ImageUploadField label="Image" value={step.image} fieldKey={`consultancy.process.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nl = [...ourProcess.processList]; nl[idx].image = url; setData({ ...data, ourProcess: { ...ourProcess, processList: nl } }); }} />
                  <input className={smallFieldClass} placeholder="Color" value={step.color || ""} onChange={e => { const nl = [...ourProcess.processList]; nl[idx].color = e.target.value; setData({ ...data, ourProcess: { ...ourProcess, processList: nl } }); }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReadyToStartForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading || ""} onChange={e => setData({ ...data, heading: e.target.value })} /></label>
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="consultancy.ready.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, bgImage: url })} />
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
              <ImageUploadField label="Image" value={item.imageurl?.imageUrl} fieldKey={`consultancy.strip.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ni = [...data.items]; ni[idx].imageurl = { imageUrl: url, alt: '' }; setData({ ...data, items: ni }); }} />
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
          <h1 className="text-xl text-[#1f261b] mt-0.5">Consultancy Page Content</h1>
          <p className="mt-1 text-[#5f5a50] text-xs leading-snug max-w-xl">
            Manage sections of the consultancy page. Select an existing component to edit.
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
                    onChange={(e) => handleKeyChange(e.target.value as ConsultancyPageContentKeys)}
                  >
                    {consultancyPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
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

                {form.key === "consultancy.hero" && renderHeroForm()}
                {form.key === "consultancy.features" && renderFeaturesForm()}
                {form.key === "consultancy.whatWeOffer" && renderWhatWeOfferForm()}
                {form.key === "consultancy.whyChooseOurProcess" && renderProcessValuesForm()}
                {form.key === "consultancy.readyToGetStarted" && renderReadyToStartForm()}
                {form.key === "consultancy.features_strip" && renderFeaturesStripForm()}
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
