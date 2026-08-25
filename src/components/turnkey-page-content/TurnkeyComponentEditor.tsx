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
  turnkeyPageKeys,
  defaultTurnkeyData,
  type TurnkeyPageContentKeys,
  type TurnkeyBanner,
  type TurnkeyWhatIs,
  type TurnkeySolutions,
  type TurnkeyFacilities,
  type TurnkeyCustomized,
  type TurnkeyFeaturedProjects,
  type TurnkeyReadyToBuild,
  type TurnkeyFeaturesStrip,
} from "@/lib/turnkey/turnkeyPageContent";
import { fieldClass, labelClass } from "@/constants";

type ContentForm = Omit<ComponentContent, "_id"> & { key: TurnkeyPageContentKeys };

const randomId = () => Math.random().toString(36).slice(2, 9);

const cardClass = "p-2 border rounded bg-gray-50 space-y-1.5 relative";
const sectionHeaderClass = "text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide";
const addBtnClass = "text-[11px] bg-[#263016] text-white px-2 py-1 rounded";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";

export default function TurnkeyComponentEditor({ componentKey, title }: { componentKey: TurnkeyPageContentKeys; title: string }) {
  const [form, setForm] = useState<ContentForm>({
    key: componentKey,
    label: title,
    page: "turnkey",
    description: "",
    isActive: true,
    data: (defaultTurnkeyData[componentKey] || {}) as Record<string, unknown>,
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
          key: existing.key as TurnkeyPageContentKeys,
          label: existing.label,
          page: existing.page || "turnkey",
          description: existing.description || "",
          isActive: existing.isActive,
          data: (existing.data as Record<string, unknown>) || {},
        });
      } else {
        setEditingId(null);
        const keyInfo = turnkeyPageKeys.find(k => k.key === componentKey);
        setForm(prev => ({
          ...prev,
          key: componentKey,
          label: keyInfo?.label || title,
          description: keyInfo?.description || "",
          data: (defaultTurnkeyData[componentKey] || {}) as Record<string, unknown>,
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

  const handleKeyChange = (key: TurnkeyPageContentKeys) => {
    setEditingId(null);
    setForm(prev => ({
      ...prev,
      key,
      label: turnkeyPageKeys.find(k => k.key === key)?.label || prev.label,
      data: defaultTurnkeyData[key] as Record<string, unknown>,
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

  const renderBannerForm = () => {
    const data = form.data as unknown as TurnkeyBanner;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>Subheading <input className={smallFieldClass} value={data.subheading || ""} onChange={e => setData({ ...data, subheading: e.target.value })} /></label>
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Highlight <input className={smallFieldClass} value={data.highlight || ""} onChange={e => setData({ ...data, highlight: e.target.value })} /></label>
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-2">
          <ImageUploadField label="Background Image" value={data.backgroundImage?.imageUrl} fieldKey="turnkey.banner.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, backgroundImage: { ...data.backgroundImage, imageUrl: url } })} />
          <label className={smallLabelClass}>Background Alt <input className={smallFieldClass} value={data.backgroundImage?.alt || ""} onChange={e => setData({ ...data, backgroundImage: { ...data.backgroundImage, alt: e.target.value } })} /></label>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Features</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, features: [...(data.features || []), { id: randomId(), title: '', image: { imageUrl: '', alt: '' } }] })}>+ Add Feature</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(data.features || []).map((feat, idx) => (
              <div key={feat.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, features: data.features.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Feature Title" value={feat.title || ""} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setData({ ...data, features: nf }); }} />
                <ImageUploadField label="Icon" value={feat.image?.imageUrl} fieldKey={`turnkey.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].image = { ...nf[idx].image, imageUrl: url }; setData({ ...data, features: nf }); }} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-2 border rounded bg-gray-50">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">PRIMARY BUTTON</h4>
            <div className="grid grid-cols-2 gap-1">
              <input className={smallFieldClass} placeholder="Label" value={data.primaryButton?.label || ""} onChange={e => setData({ ...data, primaryButton: { ...data.primaryButton, label: e.target.value } })} />
              <input className={smallFieldClass} placeholder="URL" value={data.primaryButton?.url || ""} onChange={e => setData({ ...data, primaryButton: { ...data.primaryButton, url: e.target.value } })} />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-[#8d6a3a]">SECONDARY BUTTON</h4>
            <div className="grid grid-cols-2 gap-1">
              <input className={smallFieldClass} placeholder="Label" value={data.secondaryButton?.label || ""} onChange={e => setData({ ...data, secondaryButton: { ...data.secondaryButton, label: e.target.value } })} />
              <input className={smallFieldClass} placeholder="URL" value={data.secondaryButton?.url || ""} onChange={e => setData({ ...data, secondaryButton: { ...data.secondaryButton, url: e.target.value } })} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWhatIsForm = () => {
    const data = form.data as unknown as TurnkeyWhatIs;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>Subheading <input className={smallFieldClass} value={data.subheading || ""} onChange={e => setData({ ...data, subheading: e.target.value })} /></label>
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Most Projects Title <input className={smallFieldClass} value={data.mostProjectsTitle || ""} onChange={e => setData({ ...data, mostProjectsTitle: e.target.value })} /></label>
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Most Projects</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, mostProjects: [...(data.mostProjects || []), { id: randomId(), title: '', image: { imageUrl: '', alt: '' } }] })}>+ Add Project</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(data.mostProjects || []).map((proj, idx) => (
              <div key={proj.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, mostProjects: data.mostProjects.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Title" value={proj.title || ""} onChange={e => { const np = [...data.mostProjects]; np[idx].title = e.target.value; setData({ ...data, mostProjects: np }); }} />
                <ImageUploadField label="Image" value={proj.image?.imageUrl} fieldKey={`turnkey.most.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const np = [...data.mostProjects]; np[idx].image = { ...np[idx].image, imageUrl: url }; setData({ ...data, mostProjects: np }); }} />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <h4 className={sectionHeaderClass}>With Ensis</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.withEnsis?.title || ""} onChange={e => setData({ ...data, withEnsis: { ...data.withEnsis, title: e.target.value } })} /></label>
            <ImageUploadField label="Image" value={data.withEnsis?.image?.imageUrl} fieldKey="turnkey.withensis.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, withEnsis: { ...data.withEnsis, image: { imageUrl: url, alt: '' } } })} />
          </div>
          <div className="mt-2 space-y-1">
            {(data.withEnsis?.withEnsisList || []).map((item, idx) => (
              <div key={idx} className="flex gap-1">
                <input className={smallFieldClass} placeholder="List item" value={item || ""} onChange={e => { const nl = [...(data.withEnsis?.withEnsisList || [])]; nl[idx] = e.target.value; setData({ ...data, withEnsis: { ...data.withEnsis, withEnsisList: nl } }); }} />
                <button type="button" onClick={() => { const nl = (data.withEnsis?.withEnsisList || []).filter((_, i) => i !== idx); setData({ ...data, withEnsis: { ...data.withEnsis, withEnsisList: nl } }); }} className="text-red-500"><Trash2 size={12} /></button>
              </div>
            ))}
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, withEnsis: { ...data.withEnsis, withEnsisList: [...(data.withEnsis?.withEnsisList || []), ''] } })}>+ Add Item</button>
          </div>
        </div>
      </div>
    );
  };

  const renderSolutionsForm = () => {
    const data = form.data as unknown as TurnkeySolutions;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Solution Cards</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, cards: [...(data.cards || []), { id: randomId(), title: '', details: [], image: { imageUrl: '', alt: '' }, bottomStrap: false }] })}>+ Add Card</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.cards || []).map((card, idx) => (
              <div key={card.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, cards: data.cards.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Card Title" value={card.title || ""} onChange={e => { const nc = [...data.cards]; nc[idx].title = e.target.value; setData({ ...data, cards: nc }); }} />
                <ImageUploadField label="Image" value={card.image?.imageUrl} fieldKey={`turnkey.sol.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nc = [...data.cards]; nc[idx].image = { ...nc[idx].image, imageUrl: url }; setData({ ...data, cards: nc }); }} />
                <div className="space-y-1">
                  <label className={smallLabelClass}>Details</label>
                  {(card.details || []).map((detail, dIdx) => (
                    <div key={dIdx} className="flex gap-1">
                      <input className={smallFieldClass} placeholder="Detail" value={detail || ""} onChange={e => { const nc = [...data.cards]; const nd = [...nc[idx].details]; nd[dIdx] = e.target.value; nc[idx].details = nd; setData({ ...data, cards: nc }); }} />
                      <button type="button" onClick={() => { const nc = [...data.cards]; nc[idx].details = nc[idx].details.filter((_, i) => i !== dIdx); setData({ ...data, cards: nc }); }} className="text-red-500"><Trash2 size={10} /></button>
                    </div>
                  ))}
                  <button type="button" className="text-[10px] text-[#8d6a3a] font-bold" onClick={() => { const nc = [...data.cards]; nc[idx].details = [...nc[idx].details, '']; setData({ ...data, cards: nc }); }}>+ Add Detail</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {data.specialCard && (
          <div className="pt-2 border-t">
            <h4 className={sectionHeaderClass}>Special Card</h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.specialCard.title || ""} onChange={e => setData({ ...data, specialCard: { ...data.specialCard, title: e.target.value } })} /></label>
              <div className="grid grid-cols-2 gap-1">
                <ImageUploadField label="Left Image" value={data.specialCard.leftImage?.imageUrl} fieldKey="turnkey.special.left" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, specialCard: { ...data.specialCard, leftImage: { imageUrl: url, alt: '' } } })} />
                <ImageUploadField label="Right Image" value={data.specialCard.rightImage?.imageUrl} fieldKey="turnkey.special.right" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, specialCard: { ...data.specialCard, rightImage: { imageUrl: url, alt: '' } } })} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFacilitiesForm = () => {
    const data = form.data as unknown as TurnkeyFacilities;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Facility Cards</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, cards: [...(data.cards || []), { id: randomId(), title: '', image: { imageUrl: '', alt: '' } }] })}>+ Add Card</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(data.cards || []).map((card, idx) => (
            <div key={card.id} className={cardClass}>
              <button type="button" onClick={() => setData({ ...data, cards: data.cards.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
              <input className={smallFieldClass} placeholder="Title" value={card.title || ""} onChange={e => { const nc = [...data.cards]; nc[idx].title = e.target.value; setData({ ...data, cards: nc }); }} />
              <ImageUploadField label="Image" value={card.image?.imageUrl} fieldKey={`turnkey.fac.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nc = [...data.cards]; nc[idx].image = { ...nc[idx].image, imageUrl: url }; setData({ ...data, cards: nc }); }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomizedForm = () => {
    const data = form.data as unknown as TurnkeyCustomized;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Stats Title <input className={smallFieldClass} value={data.statsTitle || ""} onChange={e => setData({ ...data, statsTitle: e.target.value })} /></label>
        </div>
        <ImageUploadField label="Background Image" value={data.backgroundImage?.imageUrl} fieldKey="turnkey.cust.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, backgroundImage: { ...data.backgroundImage, imageUrl: url } })} />

        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className={sectionHeaderClass}>Stats</h4>
              <button type="button" className={addBtnClass} onClick={() => setData({ ...data, stats: [...(data.stats || []), { id: randomId(), title: '', description: '' }] })}>+ Add Stat</button>
            </div>
            {(data.stats || []).map((stat, idx) => (
              <div key={stat.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, stats: data.stats.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Stat Title" value={stat.title || ""} onChange={e => { const ns = [...data.stats]; ns[idx].title = e.target.value; setData({ ...data, stats: ns }); }} />
                <input className={smallFieldClass} placeholder="Description" value={stat.description || ""} onChange={e => { const ns = [...data.stats]; ns[idx].description = e.target.value; setData({ ...data, stats: ns }); }} />
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className={sectionHeaderClass}>Features</h4>
              <button type="button" className={addBtnClass} onClick={() => setData({ ...data, features: [...(data.features || []), { id: randomId(), title: '', image: { imageUrl: '', alt: '' } }] })}>+ Add Feature</button>
            </div>
            {(data.features || []).map((feat, idx) => (
              <div key={feat.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, features: data.features.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Feature Title" value={feat.title || ""} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setData({ ...data, features: nf }); }} />
                <ImageUploadField label="Icon" value={feat.image?.imageUrl} fieldKey={`turnkey.cust.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].image = { ...nf[idx].image, imageUrl: url }; setData({ ...data, features: nf }); }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFeaturedProjectsForm = () => {
    const data = form.data as unknown as TurnkeyFeaturedProjects;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Project Cards</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, cards: [...(data.cards || []), { id: randomId(), title: '', location: '', image: { imageUrl: '', alt: '' } }] })}>+ Add Project</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(data.cards || []).map((card, idx) => (
            <div key={card.id} className={cardClass}>
              <button type="button" onClick={() => setData({ ...data, cards: data.cards.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
              <input className={smallFieldClass} placeholder="Title" value={card.title || ""} onChange={e => { const nc = [...data.cards]; nc[idx].title = e.target.value; setData({ ...data, cards: nc }); }} />
              <input className={smallFieldClass} placeholder="Location" value={card.location || ""} onChange={e => { const nc = [...data.cards]; nc[idx].location = e.target.value; setData({ ...data, cards: nc }); }} />
              <ImageUploadField label="Image" value={card.image?.imageUrl} fieldKey={`turnkey.proj.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nc = [...data.cards]; nc[idx].image = { ...nc[idx].image, imageUrl: url }; setData({ ...data, cards: nc }); }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 border rounded bg-gray-50">
          <label className={smallLabelClass}>Button Label <input className={smallFieldClass} value={data.primaryButton?.label || ""} onChange={e => setData({ ...data, primaryButton: { ...data.primaryButton, label: e.target.value } })} /></label>
          <label className={smallLabelClass}>Button URL <input className={smallFieldClass} value={data.primaryButton?.url || ""} onChange={e => setData({ ...data, primaryButton: { ...data.primaryButton, url: e.target.value } })} /></label>
        </div>
      </div>
    );
  };

  const renderReadyToBuildForm = () => {
    const data = form.data as unknown as TurnkeyReadyToBuild;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading || ""} onChange={e => setData({ ...data, heading: e.target.value })} /></label>
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <ImageUploadField label="Left Image" value={data.leftImage?.imageUrl} fieldKey="turnkey.ready.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, leftImage: { ...data.leftImage, imageUrl: url } })} />

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Action Buttons</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, buttons: [...(data.buttons || []), { id: randomId(), title: '', description: '', link: '', image: { imageUrl: '', alt: '' } }] })}>+ Add Button</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.buttons || []).map((btn, idx) => (
              <div key={btn.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, buttons: data.buttons.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Title" value={btn.title || ""} onChange={e => { const nb = [...data.buttons]; nb[idx].title = e.target.value; setData({ ...data, buttons: nb }); }} />
                <input className={smallFieldClass} placeholder="Description" value={btn.description || ""} onChange={e => { const nb = [...data.buttons]; nb[idx].description = e.target.value; setData({ ...data, buttons: nb }); }} />
                <input className={smallFieldClass} placeholder="Link URL" value={btn.link || ""} onChange={e => { const nb = [...data.buttons]; nb[idx].link = e.target.value; setData({ ...data, buttons: nb }); }} />
                <ImageUploadField label="Icon" value={btn.image?.imageUrl} fieldKey={`turnkey.ready.btn.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nb = [...data.buttons]; nb[idx].image = { ...nb[idx].image, imageUrl: url }; setData({ ...data, buttons: nb }); }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFeaturesStripForm = () => {
    const data = form.data as unknown as TurnkeyFeaturesStrip;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Features Strip Items</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, items: [...(data.items || []), { id: randomId(), title: '', description: '', image: { imageUrl: '', alt: '' } }] })}>+ Add Item</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(data.items || []).map((item, idx) => (
            <div key={item.id} className={cardClass}>
              <button type="button" onClick={() => setData({ ...data, items: data.items.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
              <input className={smallFieldClass} placeholder="Title" value={item.title || ""} onChange={e => { const ni = [...data.items]; ni[idx].title = e.target.value; setData({ ...data, items: ni }); }} />
              <textarea className={smallFieldClass} rows={2} placeholder="Description" value={item.description || ""} onChange={e => { const ni = [...data.items]; ni[idx].description = e.target.value; setData({ ...data, items: ni }); }} />
              <ImageUploadField label="Image" value={item.image?.imageUrl} fieldKey={`turnkey.strip.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const ni = [...data.items]; ni[idx].image = { ...ni[idx].image, imageUrl: url }; setData({ ...data, items: ni }); }} />
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
          <h1 className="text-xl text-[#1f261b] mt-0.5">Turnkey Page Content</h1>
          <p className="mt-1 text-[#5f5a50] text-xs leading-snug max-w-xl">
            Manage sections of the turnkey page. Select an existing component to edit.
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
                    onChange={(e) => handleKeyChange(e.target.value as TurnkeyPageContentKeys)}
                  >
                    {turnkeyPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
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

                {form.key === "turnkey.banner" && renderBannerForm()}
                {form.key === "turnkey.whatIsTurnkey" && renderWhatIsForm()}
                {form.key === "turnkey.completeSolutions" && renderSolutionsForm()}
                {form.key === "turnkey.facilities" && renderFacilitiesForm()}
                {form.key === "turnkey.customized" && renderCustomizedForm()}
                {form.key === "turnkey.featuredProjects" && renderFeaturedProjectsForm()}
                {form.key === "turnkey.readyToBuild" && renderReadyToBuildForm()}
                {form.key === "turnkey.features_strip" && renderFeaturesStripForm()}
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
