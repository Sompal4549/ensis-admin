"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import ComponentList from "./ComponentList";
import { buildEmptyContactContent, ContactPageContentKeys, contactPageKeys } from "@/app/blogs-page-management/contactPageContent";




const randomId = () => Math.random().toString(36).slice(2, 9);

export default function ContactPageManager() {
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [form, setForm] = useState<Partial<ComponentContent>>(buildEmptyContactContent("contact.hero"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      setRecords(list.filter(item => item.page === "contact" || item.key.startsWith("contact.")));
    } catch (error: unknown) {
      toast.error("Failed to load contact components.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, data: form.data || {} } as Omit<ComponentContent, "_id">;
      if (editingId) {
        await componentContentApi.update(editingId, payload);
      } else {
        await componentContentApi.create(payload);
      }
      toast.success("Contact content saved!");
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
          <label className={labelClass}>Heading <input className={fieldClass} value={data.heading} onChange={e => setForm({...form, data: {...data, heading: e.target.value}})} /></label>
          <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
        </div>
        <label className={labelClass}>Highlighted Text <input className={fieldClass} value={data.highlightedText} onChange={e => setForm({...form, data: {...data, highlightedText: e.target.value}})} /></label>
        <label className={labelClass}>Description <textarea className={fieldClass} rows={2} value={data.description} onChange={e => setForm({...form, data: {...data, description: e.target.value}})} /></label>
        <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="contact.hero.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, bgImage: url}})} />
        
        <div className="pt-4 border-t">
          <h4 className="text-sm font-bold mb-4 text-slate-500 uppercase">Hero Features Icons</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.features.map((feat: any, idx: number) => (
              <div key={feat.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-2">
                <button type="button" onClick={() => { const nf = data.features.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, features: nf}})}} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
                <input className={fieldClass} placeholder="Feature Title" value={feat.title} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
                <ImageUploadField label="Icon" value={feat.iconImage} fieldKey={`hero.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].iconImage = url; setForm({...form, data: {...data, features: nf}}) }} />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setForm({...form, data: {...data, features: [...data.features, {id: randomId(), iconImage: '', title: ''}]}})} className="mt-4 text-blue-600 font-bold text-sm flex items-center gap-1">+ Add Hero Feature</button>
        </div>
      </div>
    );
  };

  const renderGetInTouchForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <label className={labelClass}>Title <input className={fieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
          <label className={labelClass}>Description <input className={fieldClass} value={data.description} onChange={e => setForm({...form, data: {...data, description: e.target.value}})} /></label>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold">Contact Details</h4>
          {data.contactDetails.map((detail: any, idx: number) => (
            <div key={detail.id} className="p-4 border rounded-xl bg-white grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              <button type="button" onClick={() => { const nd = data.contactDetails.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, contactDetails: nd}})}} className="absolute -top-2 -right-2 bg-white shadow rounded-full p-1 text-red-500"><Trash2 size={14} /></button>
              <input className={fieldClass} placeholder="Title" value={detail.title} onChange={e => { const nd = [...data.contactDetails]; nd[idx].title = e.target.value; setForm({...form, data: {...data, contactDetails: nd}}) }} />
              <input className={fieldClass} placeholder="Description" value={detail.description} onChange={e => { const nd = [...data.contactDetails]; nd[idx].description = e.target.value; setForm({...form, data: {...data, contactDetails: nd}}) }} />
              <ImageUploadField label="Icon" value={detail.icon} fieldKey={`detail.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nd = [...data.contactDetails]; nd[idx].icon = url; setForm({...form, data: {...data, contactDetails: nd}}) }} />
            </div>
          ))}
          <button type="button" onClick={() => setForm({...form, data: {...data, contactDetails: [...data.contactDetails, {id: randomId(), icon: '', title: '', description: ''}]}})} className="text-sm font-bold text-blue-500">+ Add Detail Card</button>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border space-y-4">
          <h4 className="font-bold">Social Links Section</h4>
          <div className="grid grid-cols-2 gap-4">
            <input className={fieldClass} placeholder="Social Section Title" value={data.socialLinks.title} onChange={e => setForm({...form, data: {...data, socialLinks: {...data.socialLinks, title: e.target.value}}})} />
            <ImageUploadField label="Section Icon" value={data.socialLinks.iconImage} fieldKey="social.main" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, socialLinks: {...data.socialLinks, iconImage: url}}})} />
          </div>
          <div className="space-y-2">
            {data.socialLinks.links.map((link: any, idx: number) => (
              <div key={link.id} className="flex gap-2 items-end">
                <ImageUploadField label="Platform Icon" value={link.iconImage} fieldKey={`social.link.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nl = [...data.socialLinks.links]; nl[idx].iconImage = url; setForm({...form, data: {...data, socialLinks: {...data.socialLinks, links: nl}}}) }} />
                <input className={fieldClass} placeholder="URL" value={link.link} onChange={e => { const nl = [...data.socialLinks.links]; nl[idx].link = e.target.value; setForm({...form, data: {...data, socialLinks: {...data.socialLinks, links: nl}}}) }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFeaturesStrip = () => {
    const data = form.data as any;
    return (
      <div className="space-y-4">
        {data.features.map((feat: any, idx: number) => (
          <div key={feat.id} className="p-4 border rounded-xl bg-white space-y-3 relative shadow-sm">
            <button type="button" onClick={() => { const nf = data.features.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, features: nf}})}} className="absolute top-2 right-2 text-red-400"><Trash2 size={16} /></button>
            <div className="grid grid-cols-2 gap-4">
              <input className={fieldClass} placeholder="Title" value={feat.title} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
              <ImageUploadField label="Icon" value={feat.iconImage} fieldKey={`strip.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].iconImage = url; setForm({...form, data: {...data, features: nf}}) }} />
            </div>
            <textarea className={fieldClass} placeholder="Description" value={feat.description} onChange={e => { const nf = [...data.features]; nf[idx].description = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
          </div>
        ))}
        <button type="button" onClick={() => setForm({...form, data: {...data, features: [...data.features, {id: randomId(), iconImage: '', title: '', description: ''}]}})} className="w-full py-4 border-2 border-dashed rounded-xl text-slate-400 flex items-center justify-center gap-2"><Plus size={20} /> Add Strip Item</button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="lg:col-span-4">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 text-slate-400">Contact Sections</h2>
          <ComponentList
            records={records} 
            onEdit={(r) => { setEditingId(r._id); setForm(r); }} 
            onDelete={async (id) => { if(confirm('Delete?')) { await componentContentApi.remove(id); refresh(); }}} 
            onReorder={async (res) => {
                if (!res.destination) return;
                const items = Array.from(records);
                const [reorderedItem] = items.splice(res.source.index, 1);
                items.splice(res.destination.index, 0, reorderedItem);
                setRecords(items);
                await Promise.all(items.map((item, index) => componentContentApi.update(item._id, { index })));
            }}
            editingId={editingId}
          />
        </div>
      </aside>

      <section className="lg:col-span-8">
        <form onSubmit={handleSave} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Contact Page Manager</h2>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-blue-700">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <label className={labelClass}>Template Selection
                <select 
                  className={fieldClass} 
                  value={form.key || ""} 
                  onChange={e => {
                    const key = e.target.value as ContactPageContentKeys;
                    setEditingId(null);
                    setForm(buildEmptyContactContent(key));
                  }}
                >
                  {contactPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
              </label>
              <label className={labelClass}>Visible <div className="mt-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /></div></label>
            </div>

            {form.key === "contact.hero" && renderHeroForm()}
            {form.key === "contact.getInTouch" && renderGetInTouchForm()}
            {form.key === "contact.featuresStrip" && renderFeaturesStrip()}
          </div>
        </form>
      </section>
    </div>
  );
}