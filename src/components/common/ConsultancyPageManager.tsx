"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import { buildEmptyConsultancyContent, ConsultancyPageContentKeys, consultancyPageKeys } from "./consultancyPageContent";




const randomId = () => Math.random().toString(36).slice(2, 9);

export default function ConsultancyPageManager() {
  const [form, setForm] = useState<Partial<ComponentContent>>(buildEmptyConsultancyContent("consultancy.hero"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const componentKey = searchParams.get("component");

  const refresh = useCallback(async () => {
    const key = componentKey;
    if (!key) {
      setEditingId(null);
      setForm(buildEmptyConsultancyContent("consultancy.hero"));
      return;
    }

    setLoading(true);
    try {
      const existing = await componentContentApi.getByKey(key);
      if (existing) {
        setEditingId(existing._id);
        setForm(existing);
      } else {
        setEditingId(null);
        setForm(buildEmptyConsultancyContent(key as ConsultancyPageContentKeys));
      }
    } catch (error: unknown) {
      toast.error("Failed to load component data.");
    } finally {
      setLoading(false);
    }
  }, [componentKey]);

  useEffect(() => { void refresh(); }, [refresh]);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
        ...form, 
        page: "consultancy",
        label: form.label || (consultancyPageKeys.find(k => k.key === form.key)?.label) || "Consultancy Section",
        data: form.data || {} 
      } as Omit<ComponentContent, "_id">;

      if (editingId) {
        await componentContentApi.update(editingId, payload);
      } else {
        const created = await componentContentApi.create(payload);
        if (created && created.key) {
          router.push(`?component=${created.key}`);
        }
      }
      toast.success("Consultancy content saved!");
      refresh();
    } catch (error: unknown) {
      const msg = (error as any).response?.data?.message || "Save failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderHeroForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className={labelClass}>Heading <input className={fieldClass} value={data.heading || ""} onChange={e => setForm({...form, data: {...data, heading: e.target.value}})} /></label>
          <label className={labelClass}>Title Part 1 <input className={fieldClass} value={data.titlepart1 || ""} onChange={e => setForm({...form, data: {...data, titlepart1: e.target.value}})} /></label>
          <label className={labelClass}>Title Part 2 <input className={fieldClass} value={data.titlepart2 || ""} onChange={e => setForm({...form, data: {...data, titlepart2: e.target.value}})} /></label>
          <label className={labelClass}>Title Highlight<input className={fieldClass} value={data.titleHighlight || ""} onChange={e => setForm({...form, data: {...data, titleHighlight: e.target.value}})} /></label>
          <label className={labelClass}>Title <input className={fieldClass} value={data.title || ""} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
          <label className={labelClass}>Primary Button Label <input className={fieldClass} value={data.primaryButton?.label || ""} onChange={e => setForm({...form, data: {...data, primaryButton: { ...(data.primaryButton || {}), label: e.target.value }}})} /></label>
          <label className={labelClass}>Primary Button URL <input className={fieldClass} value={data.primaryButton?.href || ""} onChange={e => setForm({...form, data: {...data, primaryButton: { ...(data.primaryButton || {}), href: e.target.value }}})} /></label>
          <label className={labelClass}>Secondary Button Label <input className={fieldClass} value={data.secondaryButton?.label || ""} onChange={e => setForm({...form, data: {...data, secondaryButton: { ...(data.secondaryButton || {}), label: e.target.value }}})} /></label>
          <label className={labelClass}>Secondary Button URL <input className={fieldClass} value={data.secondaryButton?.href || ""} onChange={e => setForm({...form, data: {...data, secondaryButton: { ...(data.secondaryButton || {}), href: e.target.value }}})} /></label>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <RichTextEditor 
            value={data.description || ""} 
            onChange={val => setForm({...form, data: {...data, description: val}})} 
            placeholder="Enter hero description..."
            minHeight="120px" 
          />
        </div>
        <ImageUploadField label="Background Image" value={data.bgImage || ""} fieldKey="hero.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, bgImage: url}})} />
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4"><h4 className="text-sm font-bold">Hero Features</h4><button type="button" onClick={() => setForm({...form, data: {...data, features: [...(data.features || []), {id: randomId(), title: '', description: '', image: ''}]}})} className="p-1 bg-slate-100 rounded text-slate-600"><Plus size={16} /></button></div>
          {(data.features || []).map((feat: any, idx: number) => (
            <div key={feat.id} className="p-4 border rounded-xl mb-4 bg-slate-50 relative space-y-3">
              <button type="button" onClick={() => { const nf = data.features.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, features: nf}})}} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
              <div className="grid grid-cols-2 gap-4">
                <input className={fieldClass} placeholder="Feature Title" value={feat.title || ""} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
                <ImageUploadField label="Feature Image" value={feat.image || ""} fieldKey={`hero.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].image = url; setForm({...form, data: {...data, features: nf}}) }} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Feature Description</label>
                <RichTextEditor 
                  value={feat.description || ""} 
                  onChange={val => { const nf = [...data.features]; nf[idx].description = val; setForm({...form, data: {...data, features: nf}}); }} 
                  placeholder="Short feature description..."
                  minHeight="100px" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFeaturesForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-4">
        {data.items.map((item: any, idx: number) => (
          <div key={item.id} className="p-4 border rounded-xl bg-white space-y-3 relative">
            <button type="button" onClick={() => { const ni = data.items.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, items: ni}})}} className="absolute top-2 right-2 text-red-400"><Trash2 size={16} /></button>
            <div className="grid grid-cols-2 gap-4">
                <label className={labelClass}>Title <input className={fieldClass} value={item.title} onChange={e => { const ni = [...data.items]; ni[idx].title = e.target.value; setForm({...form, data: {...data, items: ni}}) }} /></label>
                <label className={labelClass}>Heading <input className={fieldClass} value={item.heading} onChange={e => { const ni = [...data.items]; ni[idx].heading = e.target.value; setForm({...form, data: {...data, items: ni}}) }} /></label>
                <ImageUploadField label="Card Image" value={item.image || ""} fieldKey={`feat.card.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const ni = [...data.items]; ni[idx].image = url; setForm({...form, data: {...data, items: ni}}) }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
              <RichTextEditor 
                value={item.description || ""} 
                onChange={val => { const ni = [...data.items]; ni[idx].description = val; setForm({...form, data: {...data, items: ni}}); }} 
                placeholder="Detail description..."
                minHeight="100px" 
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setForm({...form, data: {...data, items: [...data.items, {id: randomId(), title: '', heading: '', description: '', image: ''}]}})} className="w-full py-4 border-2 border-dashed rounded-xl text-slate-400 flex items-center justify-center gap-2"><Plus size={20} /> Add Feature</button>
      </div>
    );
  };

  const renderOfferForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-4">
        <label className={labelClass}>Subheading <input className={fieldClass} value={data.subheading || ""} onChange={e => setForm({...form, data: {...data, subheading: e.target.value}})} /></label>
        <label className={labelClass}>Main Title <input className={fieldClass} value={data.title || ""} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
        <div>
          <label className={labelClass}>Description</label>
          <RichTextEditor 
            value={data.description || ""} 
            onChange={val => setForm({...form, data: {...data, description: val}})} 
            placeholder="Service overview description..."
            minHeight="120px" 
          />
        </div>
        <div className="pt-4 border-t space-y-4">
            <h4 className="text-sm font-bold">Service Cards</h4>
            {(data.serviceCards || []).map((card: any, idx: number) => (
                <div key={card.id} className="p-4 border rounded-lg bg-slate-50 space-y-3 relative group">
                    <button type="button" onClick={() => { const nc = data.serviceCards.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, serviceCards: nc}})}} className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={labelClass}>Card Title <input className={fieldClass} value={card.title || ""} onChange={e => { const nc = [...data.serviceCards]; nc[idx].title = e.target.value; setForm({...form, data: {...data, serviceCards: nc}}) }} /></label>
                        <ImageUploadField 
                            label="Card Image" 
                            value={card.image || ""} 
                            fieldKey={`offer.card.${idx}`} 
                            uploadingField={uploadingField} 
                            onUploadingChange={setUploadingField} 
                            onError={m => toast.error(m)} 
                            onUpload={url => { const nc = [...data.serviceCards]; nc[idx].image = url; setForm({...form, data: {...data, serviceCards: nc}}) }} 
                        />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Card Description</label>
                      <RichTextEditor 
                        value={card.description || ""} 
                        onChange={val => { const nc = [...data.serviceCards]; nc[idx].description = val; setForm({...form, data: {...data, serviceCards: nc}}); }} 
                        placeholder="Card description..."
                        minHeight="100px" 
                      />
                    </div>
                    <label className={labelClass}>Learn More Link <input className={fieldClass} placeholder="e.g. /services/wellness" value={card.learnMoreLink || ""} onChange={e => { const nc = [...data.serviceCards]; nc[idx].learnMoreLink = e.target.value; setForm({...form, data: {...data, serviceCards: nc}}) }} /></label>
                </div>
            ))}
            <button type="button" onClick={() => setForm({...form, data: {...data, serviceCards: [...(data.serviceCards || []), {id: randomId(), title: '', description: '', image: '', learnMoreLink: ''}]}})} className="w-full py-4 border-2 border-dashed rounded-xl text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"><Plus size={20} /> Add Service Card</button>
        </div>
      </div>
    );
  };

  const renderProcessForm = () => {
    const data = form.data as any;
    if (!data.whyChoose || !data.ourProcess) return <div className="p-4 italic text-slate-400">Loading Process Structure...</div>;

    return (
      <div className="space-y-6">
        <div className="p-4 bg-amber-50 rounded-2xl space-y-4">
          <h4 className="font-bold text-amber-800">Why Choose Us</h4>
          <input className={fieldClass} placeholder="Heading" value={data.whyChoose.heading} onChange={e => setForm({...form, data: {...data, whyChoose: {...data.whyChoose, heading: e.target.value}}})} />
          <input className={fieldClass} placeholder="Title" value={data.whyChoose.title} onChange={e => setForm({...form, data: {...data, whyChoose: {...data.whyChoose, title: e.target.value}}})} />
          <div>
            <label className={labelClass}>Why Choose Description</label>
            <RichTextEditor 
              value={data.whyChoose.description || ""} 
              onChange={val => setForm({...form, data: {...data, whyChoose: {...data.whyChoose, description: val}}})} 
              placeholder="Why choose us details..."
              minHeight="120px" 
            />
          </div>
          <ImageUploadField label="Background Image" value={data.whyChoose.bgImage} fieldKey="process.wc.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, whyChoose: {...data.whyChoose, bgImage: url}}})} />
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl space-y-4">
          <h4 className="font-bold text-blue-800">Our Process</h4>
          <input className={fieldClass} placeholder="Heading" value={data.ourProcess.heading} onChange={e => setForm({...form, data: {...data, ourProcess: {...data.ourProcess, heading: e.target.value}}})} />
          <input className={fieldClass} placeholder="Title" value={data.ourProcess.title} onChange={e => setForm({...form, data: {...data, ourProcess: {...data.ourProcess, title: e.target.value}}})} />
          {data.ourProcess.processList.map((proc: any, idx: number) => (
             <div key={proc.id} className="p-3 border bg-white rounded-lg space-y-2">
                <input className={fieldClass} placeholder="Step Title" value={proc.title} onChange={e => { const nl = [...data.ourProcess.processList]; nl[idx].title = e.target.value; setForm({...form, data: {...data, ourProcess: {...data.ourProcess, processList: nl}}}) }} />
                  <input className={fieldClass} placeholder="Step Color" value={proc.color} onChange={e => { const nl = [...data.ourProcess.processList]; nl[idx].color = e.target.value; setForm({...form, data: {...data, ourProcess: {...data.ourProcess, processList: nl}}}) }} />
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Step Description</label>
                  <RichTextEditor 
                    value={proc.description || ""} 
                    onChange={val => { const nl = [...data.ourProcess.processList]; nl[idx].description = val; setForm({...form, data: {...data, ourProcess: {...data.ourProcess, processList: nl}}}); }} 
                    placeholder="Describe this step..."
                    minHeight="100px" 
                  />
                </div>
                <ImageUploadField label="Step Icon" value={proc.image} fieldKey={`proc.step.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nl = [...data.ourProcess.processList]; nl[idx].image = url; setForm({...form, data: {...data, ourProcess: {...data.ourProcess, processList: nl}}}) }} />
             </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReadyForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-4">
        <input className={fieldClass} placeholder="Title" value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} />
        <input className={fieldClass} placeholder="Heading" value={data.heading} onChange={e => setForm({...form, data: {...data, heading: e.target.value}})} />
        <div>
          <label className={labelClass}>CTA Description</label>
          <RichTextEditor 
            value={data.description || ""} 
            onChange={val => setForm({...form, data: {...data, description: val}})} 
            placeholder="Final call to action description..."
            minHeight="120px" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <input className={fieldClass} placeholder="Button Label" value={data.primaryButton.label} onChange={e => setForm({...form, data: {...data, primaryButton: {...data.primaryButton, label: e.target.value}}})} />
            <input className={fieldClass} placeholder="Button Href" value={data.primaryButton.href} onChange={e => setForm({...form, data: {...data, primaryButton: {...data.primaryButton, href: e.target.value}}})} />
        </div>
        <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="ready.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, bgImage: url}})} />
      </div>
    );
  };

  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#8d6a3a]" size={40} /></div>}>
    <div className="w-full">
      <section className="w-full">
        <form onSubmit={handleSave} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Consultancy Manager</h2>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <label className={labelClass}>Section Template
                <select 
                  className={fieldClass} 
                value={componentKey || form.key || ""} 
                  onChange={e => {
                  router.push(`?component=${e.target.value}`);
                  }}
                >
                  {consultancyPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
              </label>
              <label className={labelClass}>Visibility <div className="mt-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /></div></label>
            </div>

            {form.key === "consultancy.hero" && renderHeroForm()}
            {form.key === "consultancy.features" && renderFeaturesForm()}
            {form.key === "consultancy.whatWeOffer" && renderOfferForm()}
            {form.key === "consultancy.whyChooseOurProcess" && renderProcessForm()}
            {form.key === "consultancy.readyToGetStarted" && renderReadyForm()}
          </div>
        </form>
      </section>
    </div>
    </Suspense>
  );
}