"use client";

import React, { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DropResult } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import { Loader2, Save, Trash2 } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import ComponentList from "./ComponentList";
import { buildEmptyProductContent, ProductPageContentKeys, productPageKeys } from "./productPageContent";

const randomId = () => Math.random().toString(36).slice(2, 9);

function ProductManagerInner() {
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [form, setForm] = useState<Partial<ComponentContent>>(buildEmptyProductContent("product.hero"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const componentKey = searchParams.get("component");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.getByPage("product");
      setRecords(list);

      const key = componentKey;
      if (key) {
        const existing = list.find(r => r.key === key);
        if (existing) {
          setEditingId(existing._id);
          setForm(existing);
        } else {
          setEditingId(null);
          setForm(buildEmptyProductContent(key as ProductPageContentKeys));
        }
      } else {
        setEditingId(null);
        setForm(buildEmptyProductContent("product.hero"));
      }
    } catch (error: unknown) {
      toast.error("Failed to load component data.");
    } finally {
      setLoading(false);
    }
  }, [componentKey]);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleEdit = (record: ComponentContent) => {
    router.push(`?component=${record.key}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      await componentContentApi.remove(id);
      toast.success("Deleted successfully");
      if (editingId === id) router.push("/products-page-management");
      refresh();
    } catch {
      toast.error("Delete failed");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
        ...form, 
        page: "product",
        label: form.label || (productPageKeys.find(k => k.key === form.key)?.label) || "Product Section",
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
      toast.success("Product page content saved!");
      refresh();
    } catch (error: unknown) {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const data = (form.data || {}) as any;

  const renderHeroForm = () => (
    <div className="space-y-6">
      {(data.slides || []).map((slide: any, idx: number) => (
        <div key={slide.id} className="p-4 border rounded-2xl bg-slate-50 relative space-y-4 shadow-sm">
          <button type="button" onClick={() => { const ns = data.slides.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, slides: ns}}) }} className="absolute top-2 right-2 text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>Slide Title <input className={fieldClass} value={slide.title} onChange={e => { const ns = [...data.slides]; ns[idx].title = e.target.value; setForm({...form, data: {...data, slides: ns}}) }} /></label>
            <label className={labelClass}>Highlight <input className={fieldClass} value={slide.highlight} onChange={e => { const ns = [...data.slides]; ns[idx].highlight = e.target.value; setForm({...form, data: {...data, slides: ns}}) }} /></label>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <h5 className="text-[10px] font-bold text-slate-400 uppercase">Primary Button</h5>
               <input className={fieldClass} placeholder="Label" value={slide.primaryButton?.label} onChange={e => { const ns = [...data.slides]; ns[idx].primaryButton = {...ns[idx].primaryButton, label: e.target.value}; setForm({...form, data: {...data, slides: ns}}) }} />
               <input className={fieldClass} placeholder="URL" value={slide.primaryButton?.url} onChange={e => { const ns = [...data.slides]; ns[idx].primaryButton = {...ns[idx].primaryButton, url: e.target.value}; setForm({...form, data: {...data, slides: ns}}) }} />
             </div>
             <div className="space-y-2">
               <h5 className="text-[10px] font-bold text-slate-400 uppercase">Secondary Button</h5>
               <input className={fieldClass} placeholder="Label" value={slide.secondaryButton?.label} onChange={e => { const ns = [...data.slides]; ns[idx].secondaryButton = {...ns[idx].secondaryButton, label: e.target.value}; setForm({...form, data: {...data, slides: ns}}) }} />
               <input className={fieldClass} placeholder="URL" value={slide.secondaryButton?.url} onChange={e => { const ns = [...data.slides]; ns[idx].secondaryButton = {...ns[idx].secondaryButton, url: e.target.value}; setForm({...form, data: {...data, slides: ns}}) }} />
             </div>
          </div>
          <RichTextEditor value={slide.description || ""} onChange={val => { const ns = [...data.slides]; ns[idx].description = val; setForm({...form, data: {...data, slides: ns}}) }} placeholder="Description..." minHeight="100px" />
          <ImageUploadField label="Background Image" value={slide.bgImage} fieldKey={`hero.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const ns = [...data.slides]; ns[idx].bgImage = url; setForm({...form, data: {...data, slides: ns}}) }} />
        </div>
      ))}
      <button type="button" onClick={() => setForm({...form, data: {...data, slides: [...(data.slides || []), { id: randomId(), title: '', highlight: '', primaryButton: {label:'', url:''}, secondaryButton: {label:'', url:''}, description: '', bgImage: '' }]}})} className="w-full py-4 border-2 border-dashed rounded-xl text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-50">+ Add Hero Slide</button>
    </div>
  );

  const renderFeatureStripForm = () => (
    <div className="space-y-4">
      {(data.features || []).map((feat: any, idx: number) => (
        <div key={feat.id} className="p-4 border rounded-xl bg-white grid grid-cols-2 gap-4 relative">
          <button type="button" onClick={() => { const nf = data.features.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, features: nf}}) }} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
          <div className="space-y-3">
            <input className={fieldClass} placeholder="Title" value={feat.title} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
            <input className={fieldClass} placeholder="Subtitle" value={feat.subtitle} onChange={e => { const nf = [...data.features]; nf[idx].subtitle = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
          </div>
          <ImageUploadField label="Icon/Image" value={feat.image} fieldKey={`strip.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].image = url; setForm({...form, data: {...data, features: nf}}) }} />
        </div>
      ))}
      <button type="button" onClick={() => setForm({...form, data: {...data, features: [...(data.features || []), { id: randomId(), image: '', title: '', subtitle: '' }]}})} className="w-full py-3 border-2 border-dashed rounded-xl text-slate-400 flex items-center justify-center gap-2">+ Add Feature Strip Item</button>
    </div>
  );

  const renderTrustedByForm = () => (
    <div className="space-y-4">
      <label className={labelClass}>Section Title <input className={fieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
      <h4 className="text-xs font-bold text-slate-400 uppercase">Center Logos</h4>
      <div className="grid grid-cols-3 gap-4">
        {(data.images || []).map((img: string, idx: number) => (
          <div key={idx} className="relative group">
            <ImageUploadField label={`Logo ${idx + 1}`} value={img} fieldKey={`trusted.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const ni = [...data.images]; ni[idx] = url; setForm({...form, data: {...data, images: ni}}) }} />
            <button type="button" onClick={() => { const ni = data.images.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, images: ni}}) }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
          </div>
        ))}
        <button type="button" onClick={() => setForm({...form, data: {...data, images: [...(data.images || []), ""]}})} className="border-2 border-dashed rounded-xl flex items-center justify-center text-slate-300 min-h-[100px] hover:bg-slate-50 transition-colors">+ Add Logo</button>
      </div>
    </div>
  );

  const renderWhyChooseForm = () => {
    const wc = data.whyChoose || {};
    const wt = data.welcomeToEnsis || {};
    return (
      <div className="space-y-8">
        <div className="p-5 border rounded-2xl bg-amber-50/30 space-y-4">
          <h4 className="font-bold text-amber-900 border-b border-amber-100 pb-2">Why Choose Us</h4>
          <label className={labelClass}>Section Title <input className={fieldClass} value={wc.title} onChange={e => setForm({...form, data: {...data, whyChoose: {...wc, title: e.target.value}}})} /></label>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-amber-700 uppercase">Key Reasons</span>
            {(wc.reasons || []).map((r: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <input className={fieldClass} value={r} onChange={e => { const nr = [...wc.reasons]; nr[idx] = e.target.value; setForm({...form, data: {...data, whyChoose: {...wc, reasons: nr}}}) }} />
                <button type="button" onClick={() => { const nr = wc.reasons.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, whyChoose: {...wc, reasons: nr}}}) }} className="text-red-400"><Trash2 size={16} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, data: {...data, whyChoose: {...wc, reasons: [...(wc.reasons || []), ""]}}})} className="text-xs font-bold text-amber-700">+ Add Reason</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <input className={fieldClass} placeholder="Btn Label" value={wc.button?.label} onChange={e => setForm({...form, data: {...data, whyChoose: {...wc, button: {...wc.button, label: e.target.value}}}})} />
             <input className={fieldClass} placeholder="Btn URL" value={wc.button?.url} onChange={e => setForm({...form, data: {...data, whyChoose: {...wc, button: {...wc.button, url: e.target.value}}}})} />
          </div>
          <ImageUploadField label="Background Image" value={wc.bgImage} fieldKey="wc.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, whyChoose: {...wc, bgImage: url}}})} />
        </div>

        <div className="p-5 border rounded-2xl bg-blue-50/30 space-y-4">
          <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-2">Welcome To Ensis</h4>
          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>Highlight <input className={fieldClass} value={wt.highlight} onChange={e => setForm({...form, data: {...data, welcomeToEnsis: {...wt, highlight: e.target.value}}})} /></label>
            <label className={labelClass}>Main Title <input className={fieldClass} value={wt.title} onChange={e => setForm({...form, data: {...data, welcomeToEnsis: {...wt, title: e.target.value}}})} /></label>
          </div>
          <RichTextEditor value={wt.description || ""} onChange={val => setForm({...form, data: {...data, welcomeToEnsis: {...wt, description: val}}})} placeholder="Welcome description..." minHeight="120px" />
          <div className="grid grid-cols-2 gap-4">
             <input className={fieldClass} placeholder="Btn Label" value={wt.button?.label} onChange={e => setForm({...form, data: {...data, welcomeToEnsis: {...wt, button: {...wt.button, label: e.target.value}}}})} />
             <input className={fieldClass} placeholder="Btn URL" value={wt.button?.url} onChange={e => setForm({...form, data: {...data, welcomeToEnsis: {...wt, button: {...wt.button, url: e.target.value}}}})} />
          </div>
          <div className="pt-2">
            <span className="text-[10px] font-bold text-blue-700 uppercase">Features Highlights</span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {(wt.features || []).map((f: any, idx: number) => (
                <div key={f.id} className="p-3 border rounded bg-white relative space-y-2">
                  <button type="button" onClick={() => { const nf = wt.features.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, welcomeToEnsis: {...wt, features: nf}}}) }} className="absolute top-1 right-1 text-red-400"><Trash2 size={12} /></button>
                  <input className={fieldClass} placeholder="Feature Title" value={f.title} onChange={e => { const nf = [...wt.features]; nf[idx].title = e.target.value; setForm({...form, data: {...data, welcomeToEnsis: {...wt, features: nf}}}) }} />
                  <ImageUploadField label="Icon" value={f.image} fieldKey={`wt.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nf = [...wt.features]; nf[idx].image = url; setForm({...form, data: {...data, welcomeToEnsis: {...wt, features: nf}}}) }} />
                </div>
              ))}
              <button type="button" onClick={() => setForm({...form, data: {...data, welcomeToEnsis: {...wt, features: [...(wt.features || []), {id: randomId(), image: '', title: ''}]}}})} className="border-2 border-dashed rounded flex items-center justify-center text-slate-300 hover:bg-blue-50 transition-colors">+ Add</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTestimonialsForm = () => (
    <div className="space-y-6">
      <label className={labelClass}>Main Title <input className={fieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
      <div className="space-y-4">
        {(data.testimonials || []).map((t: any, idx: number) => (
          <div key={t.id} className="p-4 border rounded-xl bg-white space-y-3 relative shadow-sm">
            <button type="button" onClick={() => { const nt = data.testimonials.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, testimonials: nt}}) }} className="absolute top-2 right-2 text-red-500"><Trash2 size={16} /></button>
            <div className="grid grid-cols-2 gap-4">
              <input className={fieldClass} placeholder="Name" value={t.name} onChange={e => { const nt = [...data.testimonials]; nt[idx].name = e.target.value; setForm({...form, data: {...data, testimonials: nt}}) }} />
              <input className={fieldClass} placeholder="Designation" value={t.designation} onChange={e => { const nt = [...data.testimonials]; nt[idx].designation = e.target.value; setForm({...form, data: {...data, testimonials: nt}}) }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className={labelClass}>Rating (0-5) <input type="number" step="0.5" min="0" max="5" className={fieldClass} value={t.rating} onChange={e => { const nt = [...data.testimonials]; nt[idx].rating = parseFloat(e.target.value); setForm({...form, data: {...data, testimonials: nt}}) }} /></label>
                 <ImageUploadField label="User Image" value={t.userImage} fieldKey={`testi.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nt = [...data.testimonials]; nt[idx].userImage = url; setForm({...form, data: {...data, testimonials: nt}}) }} />
               </div>
               <div className="space-y-1">
                  <label className={labelClass}>Review Description</label>
                  <RichTextEditor value={t.description || ""} onChange={val => { const nt = [...data.testimonials]; nt[idx].description = val; setForm({...form, data: {...data, testimonials: nt}}) }} placeholder="Description..." minHeight="120px" />
               </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setForm({...form, data: {...data, testimonials: [...(data.testimonials || []), { id: randomId(), name: '', designation: '', description: '', rating: 5, userImage: '' }]}})} className="w-full py-4 border-2 border-dashed rounded-xl text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-50">+ Add Testimonial</button>
      </div>
    </div>
  );

  const renderProductSection = () => (
    <div className="space-y-8">
      <div className="p-5 border rounded-2xl bg-slate-50 space-y-4">
        <h4 className="font-bold text-slate-800 border-b pb-2 uppercase text-xs tracking-wider">Price Range Filtering</h4>
        <div className="grid grid-cols-2 gap-4">
          <label className={labelClass}>Start Price <input type="number" className={fieldClass} value={data.priceRange?.start} onChange={e => setForm({...form, data: {...data, priceRange: {...data.priceRange, start: Number(e.target.value) || 0}}})} /></label>
          <label className={labelClass}>End Price <input type="number" className={fieldClass} value={data.priceRange?.end} onChange={e => setForm({...form, data: {...data, priceRange: {...data.priceRange, end: Number(e.target.value) || 0}}})} /></label>
        </div>
      </div>

      <div className="p-5 border rounded-2xl bg-white space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Available Materials</h4>
          <button type="button" onClick={() => setForm({...form, data: {...data, materials: [...(data.materials || []), {id: randomId(), title: ''}]}})} className="text-xs bg-[#263016] text-white px-2 py-1 rounded">Add Material</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(data.materials || []).map((m: any, idx: number) => (
            <div key={m.id} className="flex gap-2">
              <input className={fieldClass} value={m.title} onChange={e => { const nm = [...data.materials]; nm[idx].title = e.target.value; setForm({...form, data: {...data, materials: nm}}) }} />
              <button type="button" onClick={() => { const nm = data.materials.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, materials: nm}}) }} className="text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 border rounded-2xl bg-white space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Ideal For Categories</h4>
          <button type="button" onClick={() => setForm({...form, data: {...data, idealFor: [...(data.idealFor || []), {id: randomId(), title: ''}]}})} className="text-xs bg-[#263016] text-white px-2 py-1 rounded">Add Category</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(data.idealFor || []).map((i: any, idx: number) => (
            <div key={i.id} className="flex gap-2">
              <input className={fieldClass} value={i.title} onChange={e => { const ni = [...data.idealFor]; ni[idx].title = e.target.value; setForm({...form, data: {...data, idealFor: ni}}) }} />
              <button type="button" onClick={() => { const ni = data.idealFor.filter((_: any, idx2: number) => idx2 !== idx); setForm({...form, data: {...data, idealFor: ni}}) }} className="text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>Loading Text <input className={fieldClass} value={data.loadingText} onChange={e => setForm({...form, data: {...data, loadingText: e.target.value}})} /></label>
        <label className={labelClass}>End of List Text <input className={fieldClass} value={data.reachedText} onChange={e => setForm({...form, data: {...data, reachedText: e.target.value}})} /></label>
      </div>

      <div className="p-5 border rounded-2xl bg-amber-50/30 space-y-4">
        <h4 className="font-bold text-amber-900 border-b border-amber-100 pb-2 uppercase text-xs tracking-wider">Explore Now CTA</h4>
        <label className={labelClass}>Title <input className={fieldClass} value={data.exploreNow?.title} onChange={e => setForm({...form, data: {...data, exploreNow: {...data.exploreNow, title: e.target.value}}})} /></label>
        <RichTextEditor value={data.exploreNow?.description || ""} onChange={val => setForm({...form, data: {...data, exploreNow: {...data.exploreNow, description: val}}})} placeholder="Description..." minHeight="100px" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Contact Options</h4>
          <button type="button" onClick={() => setForm({...form, data: {...data, contact: [...(data.contact || []), { id: randomId(), imageUrl: '', alt: '', value: '', title: '', url: '' }]}})} className="text-xs bg-[#263016] text-white px-2 py-1 rounded">Add Contact Method</button>
        </div>
        {(data.contact || []).map((c: any, idx: number) => (
          <div key={c.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-3">
            <button type="button" onClick={() => { const nc = data.contact.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, contact: nc}}) }} className="absolute top-2 right-2 text-red-500"><Trash2 size={16} /></button>
            <div className="grid grid-cols-2 gap-4">
              <input className={fieldClass} placeholder="Title (e.g. Call Us)" value={c.title} onChange={e => { const nc = [...data.contact]; nc[idx].title = e.target.value; setForm({...form, data: {...data, contact: nc}}) }} />
              <input className={fieldClass} placeholder="Value (e.g. +91 ...)" value={c.value} onChange={e => { const nc = [...data.contact]; nc[idx].value = e.target.value; setForm({...form, data: {...data, contact: nc}}) }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input className={fieldClass} placeholder="Action URL (tel: / mailto:)" value={c.url} onChange={e => { const nc = [...data.contact]; nc[idx].url = e.target.value; setForm({...form, data: {...data, contact: nc}}) }} />
              <input className={fieldClass} placeholder="Icon Alt Text" value={c.alt} onChange={e => { const nc = [...data.contact]; nc[idx].alt = e.target.value; setForm({...form, data: {...data, contact: nc}}) }} />
            </div>
            <ImageUploadField label="Icon" value={c.imageUrl} fieldKey={`contact.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nc = [...data.contact]; nc[idx].imageUrl = url; setForm({...form, data: {...data, contact: nc}}) }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
      <div className="space-y-6">
        <form onSubmit={handleSave} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">{editingId ? "Edit Component" : "Create Component"}</h2>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="bg-[#263016] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Layout
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <label className={labelClass}>Select Section Template
                <select 
                  className={fieldClass} 
                  value={componentKey || form.key || ""} 
                  onChange={e => {
                    router.push(`?component=${e.target.value}`);
                  }}
                >
                  {productPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
              </label>
              <label className={labelClass}>Section Visibility <div className="mt-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /></div></label>
            </div>

            {form.key === "product.hero" && renderHeroForm()}
            {form.key === "product.featureStrip" && renderFeatureStripForm()}
            {form.key === "product.trustedBy" && renderTrustedByForm()}
            {form.key === "product.whyChoose" && renderWhyChooseForm()}
            {form.key === "product.testimonials" && renderTestimonialsForm()}
            {form.key === "product.productsection" && renderProductSection()}
          </div>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Saved Sections</h3>
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
  );
}

export default function ProductPageManager() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#8d6a3a]" size={40} /></div>}>
      <ProductManagerInner />
    </Suspense>
  );
}
