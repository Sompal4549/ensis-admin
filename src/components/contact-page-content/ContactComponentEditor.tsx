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
  contactPageKeys,
  defaultContactData,
  type ContactPageContentKeys,
} from "@/app/homepage-content/contact/contactPageContent";
import { fieldClass, labelClass } from "@/constants";

type ContentForm = Omit<ComponentContent, "_id"> & { key: ContactPageContentKeys };

const randomId = () => Math.random().toString(36).slice(2, 9);

const cardClass = "p-2 border rounded bg-gray-50 space-y-1.5 relative";
const sectionHeaderClass = "text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide";
const addBtnClass = "text-[11px] bg-[#263016] text-white px-2 py-1 rounded";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";

export default function ContactComponentEditor({ componentKey, title }: { componentKey: ContactPageContentKeys; title: string }) {
  const [form, setForm] = useState<ContentForm>({
    key: componentKey,
    label: title,
    page: "contact",
    description: "",
    isActive: true,
    data: (defaultContactData[componentKey] || {}) as Record<string, unknown>,
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
          key: existing.key as ContactPageContentKeys,
          label: existing.label,
          page: existing.page || "contact",
          description: existing.description || "",
          isActive: existing.isActive,
          data: (existing.data as Record<string, unknown>) || {},
        });
      } else {
        setEditingId(null);
        const keyInfo = contactPageKeys.find(k => k.key === componentKey);
        setForm(prev => ({
          ...prev,
          key: componentKey,
          label: keyInfo?.label || title,
          description: keyInfo?.description || "",
          data: (defaultContactData[componentKey] || {}) as Record<string, unknown>,
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

  const handleKeyChange = (key: ContactPageContentKeys) => {
    setEditingId(null);
    setForm(prev => ({
      ...prev,
      key,
      label: contactPageKeys.find(k => k.key === key)?.label || prev.label,
      data: defaultContactData[key] as Record<string, unknown>,
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
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Highlighted Text <input className={smallFieldClass} value={data.highlightedText || ""} onChange={e => setData({ ...data, highlightedText: e.target.value })} /></label>
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="contact.hero.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, bgImage: url })} />

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Features</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, features: [...(data.features || []), { id: randomId(), iconImage: '', title: '' }] })}>+ Add Feature</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(data.features || []).map((feat: any, idx: number) => (
              <div key={feat.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, features: data.features.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Title" value={feat.title || ""} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setData({ ...data, features: nf }); }} />
                <ImageUploadField label="Icon" value={feat.iconImage} fieldKey={`contact.hero.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].iconImage = url; setData({ ...data, features: nf }); }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGetInTouchForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Description <input className={smallFieldClass} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        </div>
        <ImageUploadField label="Form Image" value={data.formImage} fieldKey="contact.touch.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, formImage: url })} />

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Contact Details</h4>
            <button type="button" className={addBtnClass} onClick={() => setData({ ...data, contactDetails: [...(data.contactDetails || []), { id: randomId(), icon: '', title: '', description: '' }] })}>+ Add Detail</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.contactDetails || []).map((detail: any, idx: number) => (
              <div key={detail.id} className={cardClass}>
                <button type="button" onClick={() => setData({ ...data, contactDetails: data.contactDetails.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
                <input className={smallFieldClass} placeholder="Title" value={detail.title || ""} onChange={e => { const nd = [...data.contactDetails]; nd[idx].title = e.target.value; setData({ ...data, contactDetails: nd }); }} />
                <input className={smallFieldClass} placeholder="Description" value={detail.description || ""} onChange={e => { const nd = [...data.contactDetails]; nd[idx].description = e.target.value; setData({ ...data, contactDetails: nd }); }} />
                <ImageUploadField label="Icon" value={detail.icon} fieldKey={`contact.touch.detail.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nd = [...data.contactDetails]; nd[idx].icon = url; setData({ ...data, contactDetails: nd }); }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFeaturesStripForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Features</h4>
          <button type="button" className={addBtnClass} onClick={() => setData({ ...data, features: [...(data.features || []), { id: randomId(), iconImage: '', title: '', description: '' }] })}>+ Add Feature</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(data.features || []).map((feat: any, idx: number) => (
            <div key={feat.id} className={cardClass}>
              <button type="button" onClick={() => setData({ ...data, features: data.features.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>
              <input className={smallFieldClass} placeholder="Title" value={feat.title || ""} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setData({ ...data, features: nf }); }} />
              <input className={smallFieldClass} placeholder="Description" value={feat.description || ""} onChange={e => { const nf = [...data.features]; nf[idx].description = e.target.value; setData({ ...data, features: nf }); }} />
              <ImageUploadField label="Icon" value={feat.iconImage} fieldKey={`contact.strip.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].iconImage = url; setData({ ...data, features: nf }); }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCtaBannerForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Available Time <input className={smallFieldClass} value={data.availableTime || ""} onChange={e => setData({ ...data, availableTime: e.target.value })} /></label>
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Phone <input className={smallFieldClass} value={data.phone || ""} onChange={e => setData({ ...data, phone: e.target.value })} /></label>
          <label className={smallLabelClass}>WhatsApp Link <input className={smallFieldClass} value={data.whatsappLink || ""} onChange={e => setData({ ...data, whatsappLink: e.target.value })} /></label>
        </div>
        <ImageUploadField label="Image" value={data.image} fieldKey="contact.cta.img" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, image: url })} />
      </div>
    );
  };

  const renderPremiumMapForm = () => {
    const data = form.data as Record<string, any>;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} /></label>
          <label className={smallLabelClass}>Map URL <input className={smallFieldClass} value={data.mapUrl || ""} onChange={e => setData({ ...data, mapUrl: e.target.value })} /></label>
        </div>
        <label className={smallLabelClass}>Description <textarea className={smallFieldClass} rows={2} value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Button Text <input className={smallFieldClass} value={data.buttonText || ""} onChange={e => setData({ ...data, buttonText: e.target.value })} /></label>
          <label className={smallLabelClass}>Directions URL <input className={smallFieldClass} value={data.directionsUrl || ""} onChange={e => setData({ ...data, directionsUrl: e.target.value })} /></label>
        </div>
        <ImageUploadField label="Leaf Image" value={data.leafImage} fieldKey="contact.map.leaf" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={(m) => toast.error(m)} onUpload={url => setData({ ...data, leafImage: url })} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-sm">
      <header className="mb-4 flex items-center justify-between border-b border-[#eee5d9] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8d6a3a]">Configuration</span>
          <h1 className="text-xl text-[#1f261b] mt-0.5">Contact Page Content</h1>
          <p className="mt-1 text-[#5f5a50] text-xs leading-snug max-w-xl">
            Manage sections of the contact page. Select an existing component to edit.
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
                    onChange={(e) => handleKeyChange(e.target.value as ContactPageContentKeys)}
                  >
                    {contactPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
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

                {form.key === "contact.hero" && renderHeroForm()}
                {form.key === "contact.getInTouch" && renderGetInTouchForm()}
                {form.key === "contact.featuresStrip" && renderFeaturesStripForm()}
                {form.key === "contact.ctaBanner" && renderCtaBannerForm()}
                {form.key === "contact.premiumMap" && renderPremiumMapForm()}
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
