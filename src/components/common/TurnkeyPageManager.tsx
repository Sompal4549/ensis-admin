"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify"; // Ensure toast is imported
import { DropResult } from "@hello-pangea/dnd";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import RichTextEditor from "@/components/common/RichTextEditor";
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
} from "@/lib/turnkey/turnkeyPageContent";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import ComponentList from "./ComponentList";

const randomId = () => Math.random().toString(36).slice(2, 9);

export default function TurnkeyPageManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const componentKey = searchParams.get("component") as TurnkeyPageContentKeys;
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [form, setForm] = useState<Partial<ComponentContent>>({
    key: componentKey || "turnkey.banner",
    label: turnkeyPageKeys.find(k => k.key === (componentKey || "turnkey.banner"))?.label || "Turnkey Banner",
    page: "turnkey",
    isActive: true,
    data: defaultTurnkeyData[componentKey || "turnkey.banner"] as Record<string, unknown>,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleSelectRecord = useCallback((record: ComponentContent) => {
    setEditingId(record._id);
    setForm({ ...record });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      const filtered = list.filter(item => item.page === "turnkey" || item.key.startsWith("turnkey."));
      setRecords(filtered);

      const targetKey = componentKey || "turnkey.banner";
      const existing = filtered.find(r => r.key === targetKey);

      if (existing) {
        setEditingId(existing._id);
        setForm(existing);
      } else {
        const keyInfo = turnkeyPageKeys.find(k => k.key === targetKey);
        setEditingId(null);
        setForm({
          key: targetKey,
          label: keyInfo?.label || "",
          page: "turnkey",
          isActive: true,
          data: defaultTurnkeyData[targetKey] as Record<string, unknown>
        });
      }
    } catch (error: unknown) {
      toast.error("Failed to load components.");
    } finally {
      setLoading(false);
    }
  }, [componentKey]);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
 try {
  if (editingId) {
    await componentContentApi.update(editingId, form);
  } else {
    // Ensure 'data' is at least an empty object if it's undefined in the form state
    const payload = {
      ...form,
      data: form.data || {}, 
    } as Omit<ComponentContent, "_id">;
    
    await componentContentApi.create(payload);
  }
  toast.success("Saved successfully!");
  refresh();
} catch {
      toast.error("Save failed.");
    } finally {
      setLoading(false);
    }
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

  const renderBannerForm = () => {
    const data = form.data as TurnkeyBanner;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className={labelClass}>Subheading <input className={fieldClass} value={data.subheading} onChange={e => setForm({...form, data: {...data, subheading: e.target.value}})} /></label>
          <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
           <label className={labelClass}>Highlight <input className={fieldClass} value={data.highlight} onChange={e => setForm({...form, data: {...data, highlight: e.target.value}})} /></label>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Description</label>
          <RichTextEditor value={data.description || ""} onChange={val => setForm({...form, data: {...data, description: val}})} placeholder="Enter description..." minHeight="120px" />
        </div>
              <ImageUploadField label="Background Image" value={data.backgroundImage?.imageUrl} fieldKey="turnkey.bannerbg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, backgroundImage: { ...data.backgroundImage, imageUrl: url, title: data.backgroundImage?.title || 'Customized Facilities' }}})} />
          <label className={labelClass}>Background Alt <input className={fieldClass} value={data.backgroundImage?.title} onChange={e => setForm({...form, data: {...data, backgroundImage: { ...data.backgroundImage, title: e.target.value }}})} /></label>
        <div className="pt-3 border-t">
          <h4 className="text-xs font-bold text-[#8d6a3a] mb-2 uppercase">Features Highlight</h4>
          <div className="grid grid-cols-2 gap-3">
            {data.features.map((feat, idx) => (
              <div key={feat.id} className="p-3 border rounded bg-gray-50 relative">
                <button type="button" onClick={() => { const nf = data.features.filter((_, i) => i !== idx); setForm({...form, data: {...data, features: nf}})}} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
                <input className={`${fieldClass} mb-2`} placeholder="Feature Title" value={feat.title} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
                <ImageUploadField label="Icon" value={feat.image.imageUrl} fieldKey={`feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].image.imageUrl = url; setForm({...form, data: {...data, features: nf}}) }} />
              </div>
            ))}
        
            <button type="button" onClick={() => setForm({...form, data: {...data, features: [...data.features, {id: randomId(), title: '', image: {imageUrl: '', alt: ''}}]}})} className="border-2 border-dashed rounded flex items-center justify-center text-gray-400 py-4 hover:bg-gray-50"><Plus size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
           <div className="space-y-2"><label className={labelClass}>Primary Button Label</label><input className={fieldClass} value={data.primaryButton.label} onChange={e => setForm({...form, data: {...data, primaryButton: {...data.primaryButton, label: e.target.value}}})} /></div>
           <div className="space-y-2"><label className={labelClass}>Secondary Button Label</label><input className={fieldClass} value={data.secondaryButton.label} onChange={e => setForm({...form, data: {...data, secondaryButton: {...data.secondaryButton, label: e.target.value}}})} /></div>
        </div>
      </div>
    );
  };

  const renderWhatIsForm = () => {
    const data = form.data as TurnkeyWhatIs;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
        <label className={labelClass}>Most Project Title <input className={fieldClass} value={data.mostProjectsTitle} onChange={e => setForm({...form, data: {...data, mostProjectsTitle: e.target.value}})} /></label>
         <label className={labelClass}>SubHeading <input className={fieldClass} value={data.subheading} onChange={e => setForm({...form, data: {...data, subheading: e.target.value}})} /></label>
        <div className="space-y-1">
          <label className={labelClass}>Description</label>
          <RichTextEditor value={data.description || ""} onChange={val => setForm({...form, data: {...data, description: val}})} placeholder="Enter description..." minHeight="120px" />
        </div>
        
        <div className="pt-3 border-t">
          <h4 className="text-xs font-bold text-[#8d6a3a] mb-2 uppercase">Most Projects (Comparison)</h4>
          {data.mostProjects.map((proj, idx) => (
             <div key={proj.id} className="grid grid-cols-2 gap-3 mb-3 p-2 border rounded relative">
               <button type="button" onClick={() => { const np = data.mostProjects.filter((_, i) => i !== idx); setForm({...form, data: {...data, mostProjects: np}})}} className="absolute top-1 right-1 text-red-500 hover:bg-red-50 p-1 rounded transition-colors z-10"><Trash2 size={12} /></button>
               <input className={fieldClass} placeholder="Point Title" value={proj.title} onChange={e => { const np = [...data.mostProjects]; np[idx].title = e.target.value; setForm({...form, data: {...data, mostProjects: np}}) }} />
               <ImageUploadField label="Image" value={proj.image.imageUrl} fieldKey={`most.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const np = [...data.mostProjects]; np[idx].image.imageUrl = url; setForm({...form, data: {...data, mostProjects: np}}) }} />
             </div>
          ))}
          <button 
            type="button" 
            onClick={() => setForm({...form, data: {...data, mostProjects: [...data.mostProjects, {id: randomId(), title: '', image: {imageUrl: '', alt: ''}}]}})} 
            className="w-full border-2 border-dashed py-3 flex items-center justify-center text-gray-400 gap-2 hover:bg-gray-50 rounded-lg transition-colors mt-2"
          >
            <Plus size={18} /> Add Comparison Point
          </button>
        </div>

        <div className="pt-3 border-t bg-blue-50/50 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-widest">With Ensis (Right Side)</h4>
          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>Ensis Title <input className={fieldClass} value={data.withEnsis.title} onChange={e => setForm({...form, data: {...data, withEnsis: {...data.withEnsis, title: e.target.value}}})} /></label>
            <ImageUploadField label="Right Side Image" value={data.withEnsis.image.imageUrl} fieldKey="ensis.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, withEnsis: {...data.withEnsis, image: {imageUrl: url, alt: 'Ensis Advantage'}}}})} />
                {data.withEnsis.withEnsisList.map((proj, idx) => (
             <div key={idx} className="col-span-2 flex items-center gap-2 mb-2">
               <input className={fieldClass} placeholder="Point Title" value={proj} onChange={e => { const np = [...data.withEnsis.withEnsisList]; np[idx] = e.target.value; setForm({...form, data: {...data, withEnsis: { ...data.withEnsis, withEnsisList: np }}}); }} />
               <button type="button" onClick={() => { const np = data.withEnsis.withEnsisList.filter((_, i) => i !== idx); setForm({...form, data: {...data, withEnsis: { ...data.withEnsis, withEnsisList: np }}}); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors shrink-0"><Trash2 size={14} /></button>
             </div>
          ))}
          <button 
            type="button" 
            onClick={() => setForm({...form, data: {...data, withEnsis: { ...data.withEnsis, withEnsisList: [...data.withEnsis.withEnsisList, ''] }}})} 
            className="col-span-2 border-2 border-dashed py-3 flex items-center justify-center text-gray-400 gap-2 hover:bg-gray-50 rounded-lg transition-colors mt-2"
          >
            <Plus size={18} /> Add With Ensis You get List
          </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSolutionsForm = () => {
    const data = (form.data || {}) as TurnkeySolutions;
    const specialCard = data.specialCard || { 
      leftImage: { imageUrl: "", alt: "" }, 
      rightImage: { imageUrl: "", alt: "" }, 
      title: "", 
      details: [] 
    };

    return (
      <div className="space-y-4">
        <label className={labelClass}>Main Title <input className={fieldClass} value={data.title || ""} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>

        <div className="pt-4 border-t bg-amber-50/30 p-4 rounded-xl space-y-4">
          <h4 className="text-xs font-bold text-[#8d6a3a] mb-2 uppercase tracking-wider">Special Featured Card</h4>
          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>Special Title <input className={fieldClass} placeholder="Special Title" value={specialCard.title} onChange={e => setForm({...form, data: {...data, specialCard: { ...specialCard, title: e.target.value }}})} /></label>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Special Details (List)</label>
            {(specialCard.details || []).map((detail, dIdx) => (
              <div key={dIdx} className="flex items-center gap-2 mb-2">
                <input className={fieldClass} placeholder="Detail point" value={detail} onChange={e => {
                  const newDetails = [...specialCard.details];
                  newDetails[dIdx] = e.target.value;
                  setForm({...form, data: {...data, specialCard: { ...specialCard, details: newDetails }}});
                }} />
                <button type="button" onClick={() => {
                  const newDetails = specialCard.details.filter((_, i) => i !== dIdx);
                  setForm({...form, data: {...data, specialCard: { ...specialCard, details: newDetails }}});
                }} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, data: {...data, specialCard: { ...specialCard, details: [...specialCard.details, ""] }}})} className="text-xs font-bold text-[#8d6a3a] flex items-center gap-1">+ Add Detail</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ImageUploadField label="Left Image" value={specialCard.leftImage?.imageUrl} fieldKey="sol.special.left" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, specialCard: { ...specialCard, leftImage: { imageUrl: url, alt: 'Special Left' }}}})} />
            <ImageUploadField label="Right Image" value={specialCard.rightImage?.imageUrl} fieldKey="sol.special.right" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, specialCard: { ...specialCard, rightImage: { imageUrl: url, alt: 'Special Right' }}}})} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Solution Cards</h4>
          {(data.cards || []).map((card, idx) => (
            <div key={card.id} className="p-4 border rounded bg-white relative space-y-3">
               <button type="button" onClick={() => { const nc = [...data.cards]; nc.splice(idx, 1); setForm({...form, data: {...data, cards: nc}})}} className="absolute top-2 right-2 text-red-500"><Trash2 size={16} /></button>
               <div className="grid grid-cols-2 gap-4">
                 <label className={labelClass}>Card Title <input className={fieldClass} value={card.title} onChange={e => { const nc = [...data.cards]; nc[idx].title = e.target.value; setForm({...form, data: {...data, cards: nc}}) }} /></label>
                 <ImageUploadField label="Card Image" value={card.image.imageUrl} fieldKey={`sol.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nc = [...data.cards]; nc[idx].image.imageUrl = url; setForm({...form, data: {...data, cards: nc}}) }} />
               </div>
               <div className="space-y-2">
                 <label className={labelClass}>Details (List)</label>
                 {(card.details || []).map((detail, dIdx) => (
                   <div key={dIdx} className="flex items-center gap-2 mb-2">
                     <input className={fieldClass} placeholder="Detail point" value={detail} onChange={e => {
                       const nc = [...data.cards];
                       const nd = [...(nc[idx].details || [])];
                       nd[dIdx] = e.target.value;
                       nc[idx].details = nd;
                       setForm({...form, data: {...data, cards: nc}});
                     }} />
                     <button type="button" onClick={() => {
                       const nc = [...data.cards];
                       nc[idx].details = nc[idx].details.filter((_, i) => i !== dIdx);
                       setForm({...form, data: {...data, cards: nc}});
                     }} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors shrink-0"><Trash2 size={14} /></button>
                   </div>
                 ))}
                 <button type="button" onClick={() => {
                   const nc = [...data.cards];
                   nc[idx].details = [...(nc[idx].details || []), ""];
                   setForm({...form, data: {...data, cards: nc}});
                 }} className="text-xs font-bold text-[#8d6a3a] flex items-center gap-1">+ Add Detail</button>
               </div>
            </div>
          ))}
          <button type="button" onClick={() => setForm({...form, data: {...data, cards: [...(data.cards || []), {id: randomId(), title: '', details: [], image: {imageUrl: '', alt: ''}}]}})} className="w-full border-2 border-dashed py-3 flex items-center justify-center text-gray-400 gap-2 hover:bg-gray-50"><Plus size={18} /> Add Solution Card</button>
        </div>
      </div>
    );
  };

  const renderFacilitiesForm = () => {
    const data = form.data as TurnkeyFacilities;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Section Title <input className={fieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Facility Cards</h4>
          <div className="grid grid-cols-2 gap-4">
            {data.cards.map((card, idx) => (
              <div key={card.id} className="p-4 border rounded bg-white relative space-y-2 shadow-sm">
                <button type="button" onClick={() => { const nc = data.cards.filter((_, i) => i !== idx); setForm({...form, data: {...data, cards: nc}})}} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded transition-colors"><Trash2 size={14} /></button>
                <input className={fieldClass} placeholder="Title" value={card.title} onChange={e => { const nc = [...data.cards]; nc[idx].title = e.target.value; setForm({...form, data: {...data, cards: nc}}) }} />
                <ImageUploadField label="Card Image" value={card.image.imageUrl} fieldKey={`fac.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nc = [...data.cards]; nc[idx].image.imageUrl = url; setForm({...form, data: {...data, cards: nc}}) }} />
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, data: {...data, cards: [...data.cards, {id: randomId(), title: '', image: {imageUrl: '', alt: ''}}]}})} className="border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 py-8 hover:bg-gray-50 transition-colors"><Plus size={24} /></button>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomizedForm = () => {
    const data = form.data as TurnkeyCustomized;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Section Title <input className={fieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
        <label className={labelClass}>Stats Title <input className={fieldClass} value={data.statsTitle} onChange={e => setForm({...form, data: {...data, statsTitle: e.target.value}})} /></label>
        <ImageUploadField label="Background Image" value={data.backgroundImage.imageUrl} fieldKey="cust.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, backgroundImage: {imageUrl: url, alt: 'Customized Facilities'}}})} />
        
        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-3">
            <div className="flex justify-between items-center"><h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Statistics</h4><button type="button" onClick={() => setForm({...form, data: {...data, stats: [...data.stats, {id: randomId(), title: '', description: ''}]}})} className="text-xs bg-[#263016] text-white px-2 py-1 rounded shadow hover:bg-[#1a210f] transition-all"><Plus size={12} /></button></div>
            {data.stats.map((stat, idx) => (
              <div key={stat.id} className="p-3 border rounded bg-gray-50 relative space-y-2">
                <button type="button" onClick={() => { const ns = data.stats.filter((_, i) => i !== idx); setForm({...form, data: {...data, stats: ns}})}} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={fieldClass} placeholder="Stat Title (e.g. 500+)" value={stat.title} onChange={e => { const ns = [...data.stats]; ns[idx].title = e.target.value; setForm({...form, data: {...data, stats: ns}}) }} />
                <input className={fieldClass} placeholder="Description" value={stat.description} onChange={e => { const ns = [...data.stats]; ns[idx].description = e.target.value; setForm({...form, data: {...data, stats: ns}}) }} />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Features</h4><button type="button" onClick={() => setForm({...form, data: {...data, features: [...data.features, {id: randomId(), title: '', image: {imageUrl: '', alt: ''}}]}})} className="text-xs bg-[#263016] text-white px-2 py-1 rounded shadow hover:bg-[#1a210f] transition-all"><Plus size={12} /></button></div>
            {data.features.map((feat, idx) => (
              <div key={feat.id} className="p-3 border rounded bg-gray-50 relative space-y-2">
                <button type="button" onClick={() => { const nf = data.features.filter((_, i) => i !== idx); setForm({...form, data: {...data, features: nf}})}} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={fieldClass} placeholder="Feature Title" value={feat.title} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
                <ImageUploadField label="Icon" value={feat.image.imageUrl} fieldKey={`cust.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].image.imageUrl = url; setForm({...form, data: {...data, features: nf}}) }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFeaturedProjectsForm = () => {
    const data = form.data as TurnkeyFeaturedProjects;
    return (
      <div className="space-y-4">
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#8d6a3a] uppercase">Project Cards</h4>
          <div className="mb-2">

                    <label className={labelClass}>Section Title <input className={fieldClass} value={data.title || ""} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {data.cards.map((card, idx) => (
              <div key={card.id} className="p-4 border rounded bg-white relative space-y-3 shadow-sm">
                <button type="button" onClick={() => { const nc = data.cards.filter((_, i) => i !== idx); setForm({...form, data: {...data, cards: nc}})}} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded transition-colors"><Trash2 size={16} /></button>
                <div className="space-y-2">
                  <label className={labelClass}>Project Title <input className={fieldClass} placeholder="e.g. Wellness Resort" value={card.title} onChange={e => { const nc = [...data.cards]; nc[idx].title = e.target.value; setForm({...form, data: {...data, cards: nc}}) }} /></label>
                  <label className={labelClass}>Location <input className={fieldClass} placeholder="e.g. Dubai, UAE" value={card.location} onChange={e => { const nc = [...data.cards]; nc[idx].location = e.target.value; setForm({...form, data: {...data, cards: nc}}) }} /></label>
                  <ImageUploadField label="Cover Image" value={card.image.imageUrl} fieldKey={`feat.proj.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nc = [...data.cards]; nc[idx].image.imageUrl = url; setForm({...form, data: {...data, cards: nc}}) }} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, data: {...data, cards: [...data.cards, {id: randomId(), title: '', location: '', image: {imageUrl: '', alt: ''}}]}})} className="border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 py-12 hover:bg-gray-50 transition-colors"><Plus size={32} /></button>
          </div>
        </div>
        <div className="pt-4 border-t bg-gray-50 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-[#8d6a3a] mb-3 uppercase tracking-widest">Global Primary Button</h4>
          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>Button Label <input className={fieldClass} value={data.primaryButton.label} onChange={e => setForm({...form, data: {...data, primaryButton: {...data.primaryButton, label: e.target.value}}})} /></label>
            <label className={labelClass}>Target URL <input className={fieldClass} value={data.primaryButton.url} onChange={e => setForm({...form, data: {...data, primaryButton: {...data.primaryButton, url: e.target.value}}})} /></label>
          </div>
        </div>
      </div>
    );
  };

  const renderReadyToBuildForm = () => {
    const data = form.data as TurnkeyReadyToBuild;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className={labelClass}>Eyebrow Title <input className={fieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
          <label className={labelClass}>Main Heading <input className={fieldClass} value={data.heading} onChange={e => setForm({...form, data: {...data, heading: e.target.value}})} /></label>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Description</label>
          <RichTextEditor value={data.description || ""} onChange={val => setForm({...form, data: {...data, description: val}})} placeholder="Enter description..." minHeight="120px" />
        </div>
         <div className="space-y-1">

         <ImageUploadField label="Left Side Image" value={data.leftImage?.imageUrl} fieldKey="leftSide.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, leftImage: { ...data.leftImage, imageUrl: url, alt: data.leftImage?.alt || 'Customized Facilities' }}})} />
         </div>
        
        <div className="pt-4 border-t">
          <h4 className="text-xs font-bold text-[#8d6a3a] mb-3 uppercase">Action Buttons</h4>
          <div className="space-y-4">
            {data.buttons.map((btn, idx) => (
              <div key={btn.id} className="p-4 border rounded bg-white relative space-y-3 shadow-sm">
                <button type="button" onClick={() => { const nb = data.buttons.filter((_, i) => i !== idx); setForm({...form, data: {...data, buttons: nb}})}} className="absolute top-2 right-2 text-red-500"><Trash2 size={16} /></button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className={labelClass}>Button Title <input className={fieldClass} value={btn.title} onChange={e => { const nb = [...data.buttons]; nb[idx].title = e.target.value; setForm({...form, data: {...data, buttons: nb}}) }} /></label>
                    <label className={labelClass}>Short Description <input className={fieldClass} value={btn.description} onChange={e => { const nb = [...data.buttons]; nb[idx].description = e.target.value; setForm({...form, data: {...data, buttons: nb}}) }} /></label>
                  </div>
                  <ImageUploadField label="Icon/Image" value={btn.image.imageUrl} fieldKey={`ready.btn.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nb = [...data.buttons]; nb[idx].image.imageUrl = url; setForm({...form, data: {...data, buttons: nb}}) }} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, data: {...data, buttons: [...data.buttons, {id: randomId(), title: '', description: '', image: {imageUrl: '', alt: ''}}]}})} className="w-full border-2 border-dashed rounded-xl py-3 flex items-center justify-center text-gray-400 gap-2 hover:bg-gray-50 transition-colors"><Plus size={18} /> Add Action Button</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <section className="w-full">
        <form onSubmit={handleSave} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#fcfaf7] border-b p-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl">{editingId ? "Edit Component" : "Create Component"}</h2>
            <button type="submit" disabled={loading} className="bg-[#8d6a3a] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <label className={labelClass}>Template Key
                <select 
                  className={fieldClass} 
                  value={componentKey || form.key || ""} 
                  onChange={e => router.push(`${pathname}?component=${e.target.value}`)}
                >
                  {turnkeyPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
              </label>
              <label className={labelClass}>Active <div className="mt-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /></div></label>
            </div>

            {form.key === "turnkey.banner" && renderBannerForm()}
            {form.key === "turnkey.whatIsTurnkey" && renderWhatIsForm()}
            {form.key === "turnkey.completeSolutions" && renderSolutionsForm()}
            {form.key === "turnkey.facilities" && renderFacilitiesForm()}
            {form.key === "turnkey.customized" && renderCustomizedForm()}
            {form.key === "turnkey.featuredProjects" && renderFeaturedProjectsForm()}
            {form.key === "turnkey.readyToBuild" && typeof renderReadyToBuildForm === 'function' && renderReadyToBuildForm()}
          </div>
        </form>
      </section>
    </div>
  );
}