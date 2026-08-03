"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation"; // Keep useSearchParams
import { toast } from "react-toastify";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import { buildEmptyContactContent, ContactPageContentKeys, contactPageKeys } from "@/app/homepage-content/contact/contactPageContent";

const randomId = () => Math.random().toString(36).slice(2, 9);

// Compact shared styles
const cardClass = "p-2 border rounded-lg bg-slate-50 relative space-y-1.5";
const cardClassWhite = "p-2 border rounded-lg bg-white relative space-y-1.5 shadow-sm";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";
const sectionSubHeaderClass = "text-xs font-bold uppercase";
const addLinkBtnClass = "text-xs font-bold text-blue-600";

export default function ContactPageManager() {
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [form, setForm] = useState<Partial<ComponentContent>>(buildEmptyContactContent("contact.hero"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    const key = searchParams.get("component");
    if (key && records.length > 0) {
      const found = records.find(r => r.key === key);
      if (found) {
        setEditingId(found._id);
        setForm(found);
      }
    }
  }, [searchParams, records]);

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
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading} onChange={e => setForm({...form, data: {...data, heading: e.target.value}})} /></label>
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
          <label className={smallLabelClass}>Highlighted Text <input className={smallFieldClass} value={data.highlightedText} onChange={e => setForm({...form, data: {...data, highlightedText: e.target.value}})} /></label>
        </div>
        <div className="grid grid-cols-2 gap-2 items-end">
          <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description} onChange={e => setForm({...form, data: {...data, description: e.target.value}})} /></label>
          <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="contact.hero.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, bgImage: url}})} />
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionSubHeaderClass}>Hero Features Icons</h4>
            <button type="button" onClick={() => setForm({...form, data: {...data, features: [...data.features, {id: randomId(), iconImage: '', title: ''}]}})} className={addLinkBtnClass}>+ Add Hero Feature</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {data.features.map((feat: any, idx: number) => (
              <div key={feat.id} className={cardClass}>
                <button type="button" onClick={() => { const nf = data.features.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, features: nf}})}} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Feature Title" value={feat.title} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
                <ImageUploadField label="Icon" value={feat.iconImage} fieldKey={`hero.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].iconImage = url; setForm({...form, data: {...data, features: nf}}) }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGetInTouchForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 items-end">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
          <label className={smallLabelClass}>Description <input className={smallFieldClass} value={data.description} onChange={e => setForm({...form, data: {...data, description: e.target.value}})} /></label>
          <ImageUploadField
  label="Form Image"
  value={data.formImage || ""}
  fieldKey="contact.getInTouch.formImage"
  uploadingField={uploadingField}
  onUploadingChange={setUploadingField}
  onError={m => toast.error(m)}
  onUpload={url => setForm({ ...form, data: { ...data, formImage: url } })}
/>
        </div>
        <div className="pt-2 border-t space-y-2">
          <div className="flex justify-between items-center">
            <h4 className={sectionSubHeaderClass}>Contact Details</h4>
            <button type="button" onClick={() => setForm({...form, data: {...data, contactDetails: [...data.contactDetails, {id: randomId(), icon: '', title: '', description: ''}]}})} className={addLinkBtnClass}>+ Add Detail Card</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {data.contactDetails.map((detail: any, idx: number) => (
              <div key={detail.id} className={cardClassWhite}>
                <button type="button" onClick={() => { const nd = data.contactDetails.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, contactDetails: nd}})}} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Title" value={detail.title} onChange={e => { const nd = [...data.contactDetails]; nd[idx].title = e.target.value; setForm({...form, data: {...data, contactDetails: nd}}) }} />
                <input className={smallFieldClass} placeholder="Description" value={detail.description} onChange={e => { const nd = [...data.contactDetails]; nd[idx].description = e.target.value; setForm({...form, data: {...data, contactDetails: nd}}) }} />
                <ImageUploadField label="Icon" value={detail.icon} fieldKey={`detail.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nd = [...data.contactDetails]; nd[idx].icon = url; setForm({...form, data: {...data, contactDetails: nd}}) }} />
              </div>
            ))}
          </div>
        </div>
        {/* <div className="p-4 bg-slate-50 rounded-2xl border space-y-4">
          <h4 className="font-bold">Social Links Section</h4>
          <div className="grid grid-cols-2 gap-4">
            <input className={fieldClass} placeholder="Social Section Title" value={data.socialLinks.title} onChange={e => setForm({...form, data: {...data, socialLinks: {...data.socialLinks, title: e.target.value}}})} />
            <ImageUploadField label="Section Icon" value={data.socialLinks.iconImage} fieldKey="social.main" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, socialLinks: {...data.socialLinks, iconImage: url}}})} />
          </div>
          <div className="space-y-2">
            {data.socialLinks.links.map((link: any, idx: number) => (
              <div key={link.id} className="flex gap-2 items-end relative group p-2 border border-slate-100 rounded-lg">
                <button type="button" onClick={() => { const nl = data.socialLinks.links.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, socialLinks: {...data.socialLinks, links: nl}}})}} className="absolute -top-2 -right-2 bg-white shadow rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 size={12} /></button>
                <ImageUploadField label="Platform Icon" value={link.iconImage} fieldKey={`social.link.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nl = [...data.socialLinks.links]; nl[idx].iconImage = url; setForm({...form, data: {...data, socialLinks: {...data.socialLinks, links: nl}}}) }} />
                <input className={fieldClass} placeholder="URL" value={link.link} onChange={e => { const nl = [...data.socialLinks.links]; nl[idx].link = e.target.value; setForm({...form, data: {...data, socialLinks: {...data.socialLinks, links: nl}}}) }} />
              </div>
            ))}
            <button type="button" onClick={() => setForm({...form, data: {...data, socialLinks: {...data.socialLinks, links: [...data.socialLinks.links, {id: randomId(), iconImage: '', link: ''}]}}})} className="text-blue-600 font-bold text-sm flex items-center gap-1 mt-2">+ Add Social Link</button>
          </div>
        </div> */}
      </div>
    );
  };

  const renderFeaturesStrip = () => {
    const data = form.data as any;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {data.features.map((feat: any, idx: number) => (
            <div key={feat.id} className={cardClassWhite}>
              <button type="button" onClick={() => { const nf = data.features.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, features: nf}})}} className="absolute top-1 right-1 text-red-400"><Trash2 size={12} /></button>
              <input className={smallFieldClass} placeholder="Title" value={feat.title} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
              <ImageUploadField label="Icon" value={feat.iconImage} fieldKey={`strip.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].iconImage = url; setForm({...form, data: {...data, features: nf}}) }} />
              <textarea className={smallFieldClass} placeholder="Description" value={feat.description} onChange={e => { const nf = [...data.features]; nf[idx].description = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setForm({...form, data: {...data, features: [...data.features, {id: randomId(), iconImage: '', title: '', description: ''}]}})} className="w-full py-2.5 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-gray-500"><Plus size={16} /> Add Strip Item</button>
      </div>
    );
  };
const renderCtaBanner = () => {
  const data = form.data as any;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <label className={smallLabelClass}>
          Title
          <input
            className={smallFieldClass}
            value={data.title}
            onChange={e => setForm({ ...form, data: { ...data, title: e.target.value } })}
          />
        </label>
        <label className={smallLabelClass}>
          Available Time
          <input
            className={smallFieldClass}
            placeholder="e.g. Mon–Sat, 9am–6pm"
            value={data.availableTime}
            onChange={e => setForm({ ...form, data: { ...data, availableTime: e.target.value } })}
          />
        </label>
        <label className={smallLabelClass}>
          Phone
          <input
            className={smallFieldClass}
            value={data.phone}
            onChange={e => setForm({ ...form, data: { ...data, phone: e.target.value } })}
          />
        </label>
        <label className={smallLabelClass}>
          WhatsApp Link
          <input
            className={smallFieldClass}
            value={data.whatsappLink}
            onChange={e => setForm({ ...form, data: { ...data, whatsappLink: e.target.value } })}
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2 items-end">
        <label className={smallLabelClass}>
          Description
          <textarea
            className={smallFieldClass}
            rows={2}
            value={data.description}
            onChange={e => setForm({ ...form, data: { ...data, description: e.target.value } })}
          />
        </label>
        <ImageUploadField
          label="Banner Image"
          value={data.image}
          fieldKey="contact.ctaBanner.image"
          uploadingField={uploadingField}
          onUploadingChange={setUploadingField}
          onError={m => toast.error(m)}
          onUpload={url => setForm({ ...form, data: { ...data, image: url } })}
        />
      </div>
    </div>
  );
};

const renderPremiumMap = () => {
  const data = form.data as any;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <label className={smallLabelClass}>
          Title
          <input
            className={smallFieldClass}
            value={data.title}
            onChange={e => setForm({ ...form, data: { ...data, title: e.target.value } })}
          />
        </label>
        <label className={smallLabelClass}>
          Button Text
          <input
            className={smallFieldClass}
            value={data.buttonText}
            onChange={e => setForm({ ...form, data: { ...data, buttonText: e.target.value } })}
          />
        </label>
        <label className={smallLabelClass}>
          Map Embed URL
          <input
            className={smallFieldClass}
            value={data.mapUrl}
            onChange={e => setForm({ ...form, data: { ...data, mapUrl: e.target.value } })}
          />
        </label>
        <label className={smallLabelClass}>
          Directions URL
          <input
            className={smallFieldClass}
            value={data.directionsUrl}
            onChange={e => setForm({ ...form, data: { ...data, directionsUrl: e.target.value } })}
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2 items-end">
        <label className={smallLabelClass}>
          Description
          <textarea
            className={smallFieldClass}
            rows={2}
            value={data.description}
            onChange={e => setForm({ ...form, data: { ...data, description: e.target.value } })}
          />
        </label>
        <ImageUploadField
          label="Leaf / Decorative Image"
          value={data.leafImage}
          fieldKey="contact.premiumMap.leaf"
          uploadingField={uploadingField}
          onUploadingChange={setUploadingField}
          onError={m => toast.error(m)}
          onUpload={url => setForm({ ...form, data: { ...data, leafImage: url } })}
        />
      </div>
    </div>
  );
};
  return (
    <div className="w-full text-sm">
      <section className="w-full">
        <form onSubmit={handleSave} className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-3 flex items-center justify-between">
            <h2 className="text-base font-bold">Contact Page Manager</h2>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all hover:bg-blue-700">
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save Changes
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 p-2 bg-slate-50 rounded-lg items-end">
              <label className={smallLabelClass}>Template Selection
         <select 
  className={smallFieldClass} 
  value={form.key || ""} 
  onChange={e => {
    const key = e.target.value as ContactPageContentKeys;
    const existing = records.find(r => r.key === key);
    if (existing) {
      setEditingId(existing._id);
      setForm(existing);
    } else {
      setEditingId(null);
      setForm(buildEmptyContactContent(key));
    }
    router.replace(`${pathname}?component=${key}`); // 👈 URL sync
  }}
>
  {contactPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
</select>
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-[#5f5a50] font-semibold pb-1"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /> Visible</label>
            </div>

            {form.key === "contact.hero" && renderHeroForm()}
            {form.key === "contact.getInTouch" && renderGetInTouchForm()}
            {form.key === "contact.featuresStrip" && renderFeaturesStrip()}
            {form.key === "contact.ctaBanner" && renderCtaBanner()}
{form.key === "contact.premiumMap" && renderPremiumMap()}
          </div>
        </form>
      </section>
    </div>
  );
}