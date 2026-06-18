"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Save, Trash2, PlusCircle, Eye } from 'lucide-react';
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import ComponentList from "@/components/common/ComponentList";
import { DropResult } from "@hello-pangea/dnd";

// Options shown in selects / checkboxes / radios

export interface SelectOption {
  value: string;
  label: string;
}

export interface CheckboxOption {
  id: string;
  label: string;
}

export interface RadioOption {
  id: string;
  label: string;
}

export interface ContactItem {
  id: string;
  label: string;
  iconSrc?: string;
  lines: string[];
}

export interface GetInTouchBannerData {
  heading: string;
  items: ContactItem[];
}

export interface CtaBannerImage {
  imageUrl: string;
  alt: string;
}

export interface CtaBannerData {
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  leftImage: CtaBannerImage;
  rightImage: CtaBannerImage;
}

export interface WhyChooseItem {
  id: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
}

export interface EnquiryPageContent {
  brand: {
    logoSrc: string;
    logoAlt: string;
    tagline: string;
  };
  hero: {
    heading: string;
    subheading: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
  };
  formTitle: string;
  projectTypeOptions: SelectOption[];
  stateOptions: SelectOption[];
  cityOptions: SelectOption[];
  projectSizeOptions: SelectOption[];
  budgetRangeOptions: SelectOption[];
  timelineOptions: SelectOption[];
  servicesOptions: CheckboxOption[];
  preferredContactOptions: RadioOption[];
  whyChoose: {
    heading: string;
    items: WhyChooseItem[];
    bottomImageSrc: string;
    bottomImageAlt: string;
  };
  upload: {
    label: string;
    helperText: string;
  };
  consentText: string;
  submitButtonText: string;
}

const randomId = () => Math.random().toString(36).substring(2, 9);

const initialEnquiryPageContentForm: EnquiryPageContent = {
  brand: {
    logoSrc: "",
    logoAlt: "",
    tagline: "",
  },
  hero: {
    heading: "",
    subheading: "",
    description: "",
    imageSrc: "",
    imageAlt: "",
  },
  formTitle: "",
  projectTypeOptions: [],
  stateOptions: [],
  cityOptions: [],
  projectSizeOptions: [],
  budgetRangeOptions: [],
  timelineOptions: [],
  servicesOptions: [],
  preferredContactOptions: [],
  whyChoose: {
    heading: "",
    items: [],
    bottomImageSrc: "",
    bottomImageAlt: "",
  },
  upload: {
    label: "",
    helperText: "",
  },
  consentText: "",
  submitButtonText: "",
};

const EnquaryPageManagement = () => {
  const [loading, setLoading] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [savingGetInTouch, setSavingGetInTouch] = useState(false);
  const [savingCtaBanner, setSavingCtaBanner] = useState(false);
  
  const [content, setContent] = useState<ComponentContent | null>(null);
  const [form, setForm] = useState<EnquiryPageContent>(initialEnquiryPageContentForm);

  const [getInTouchContent, setGetInTouchContent] = useState<ComponentContent | null>(null);
  const [getInTouchForm, setGetInTouchForm] = useState<GetInTouchBannerData>({
    heading: "",
    items: []
  });

  const [ctaBannerContent, setCtaBannerContent] = useState<ComponentContent | null>(null);
  const [ctaBannerForm, setCtaBannerForm] = useState<CtaBannerData>({
    heading: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    leftImage: { imageUrl: "", alt: "" },
    rightImage: { imageUrl: "", alt: "" },
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'getInTouch' | 'ctaBanner'>('form');

  const knownKeys = ["enquiry.page", "enquiry.getInTouch", "enquiry.ctaBanner"];

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const allRecords = await componentContentApi.list();
      setRecords(allRecords.filter(r => r.page === "enquiry"));
    } catch (error) {
      console.error("Failed to load component list:", error);
    }

    try {
      const item = await componentContentApi.getByKey("enquiry.page");
      if (item) {
        setContent(item);
        const d = (item.data || {}) as Partial<EnquiryPageContent>;
        setForm({
          brand: d.brand || initialEnquiryPageContentForm.brand,
          hero: d.hero || initialEnquiryPageContentForm.hero,
          formTitle: d.formTitle || initialEnquiryPageContentForm.formTitle,
          projectTypeOptions: d.projectTypeOptions || initialEnquiryPageContentForm.projectTypeOptions,
          stateOptions: d.stateOptions || initialEnquiryPageContentForm.stateOptions,
          cityOptions: d.cityOptions || initialEnquiryPageContentForm.cityOptions,
          projectSizeOptions: d.projectSizeOptions || initialEnquiryPageContentForm.projectSizeOptions,
          budgetRangeOptions: d.budgetRangeOptions || initialEnquiryPageContentForm.budgetRangeOptions,
          timelineOptions: d.timelineOptions || initialEnquiryPageContentForm.timelineOptions,
          servicesOptions: d.servicesOptions || initialEnquiryPageContentForm.servicesOptions,
          preferredContactOptions: d.preferredContactOptions || initialEnquiryPageContentForm.preferredContactOptions,
          whyChoose: d.whyChoose || initialEnquiryPageContentForm.whyChoose,
          upload: d.upload || initialEnquiryPageContentForm.upload,
          consentText: d.consentText || initialEnquiryPageContentForm.consentText,
          submitButtonText: d.submitButtonText || initialEnquiryPageContentForm.submitButtonText,
        });
      }
    } catch (error) {
      console.error("Failed to load enquiry form content:", error);
    }

    try {
      const gitItem = await componentContentApi.getByKey("enquiry.getInTouch");
      if (gitItem) {
        setGetInTouchContent(gitItem);
        const d = (gitItem.data || {}) as Partial<GetInTouchBannerData>;
        setGetInTouchForm({
          heading: d.heading || "",
          items: d.items || []
        });
      }
    } catch (error) {
      console.error("Failed to load get in touch content:", error);
    }

    try {
      const ctaItem = await componentContentApi.getByKey("enquiry.ctaBanner");
      if (ctaItem) {
        setCtaBannerContent(ctaItem);
        const d = (ctaItem.data || {}) as Partial<CtaBannerData>;
        setCtaBannerForm({
          heading: d.heading || "",
          description: d.description || "",
          ctaLabel: d.ctaLabel || "",
          ctaHref: d.ctaHref || "",
          leftImage: d.leftImage || { imageUrl: "", alt: "" },
          rightImage: d.rightImage || { imageUrl: "", alt: "" },
        });
      }
    } catch (error) {
      console.error("Failed to load cta banner content:", error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingForm(true);
    try {
      const payload = {
        key: "enquiry.page",
        label: "Enquiry Page Content",
        page: "enquiry",
        isActive: true,
        data: form as any,
      };

      if (content) {
        await componentContentApi.update(content._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }
      toast.success("Enquiry page content saved successfully!");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save enquiry page content.");
    } finally {
      setSavingForm(false);
    }
  };

  const handleSaveGetInTouch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGetInTouch(true);
    try {
      const payload = {
        key: "enquiry.getInTouch",
        label: "Enquiry Get In Touch",
        page: "enquiry",
        isActive: true,
        data: getInTouchForm as any,
      };

      if (getInTouchContent) {
        await componentContentApi.update(getInTouchContent._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }
      toast.success("Get in Touch content saved!");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save content.");
    } finally {
      setSavingGetInTouch(false);
    }
  };

  const handleSaveCtaBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCtaBanner(true);
    try {
      const payload = {
        key: "enquiry.ctaBanner",
        label: "Enquiry CTA Banner",
        page: "enquiry",
        isActive: true,
        data: ctaBannerForm as any,
      };

      if (ctaBannerContent) {
        await componentContentApi.update(ctaBannerContent._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }
      toast.success("CTA Banner content saved!");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save content.");
    } finally {
      setSavingCtaBanner(false);
    }
  };

  const handleReorder = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(records);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setRecords(items);

    try {
      await (componentContentApi as any).reorder(items.map(i => i._id));
      toast.success("Order updated");
    } catch (error: any) {
      toast.error("Failed to update order");
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (!window.confirm("Delete this component?")) return;
    try {
      await componentContentApi.remove(id);
      loadContent();
    } catch (error: any) {
      toast.error("Delete failed");
    }
  };

  const handleEditComponent = (record: ComponentContent) => {
    if (record.key === "enquiry.page") setActiveTab("form");
    if (record.key === "enquiry.getInTouch") setActiveTab("getInTouch");
    if (record.key === "enquiry.ctaBanner") setActiveTab("ctaBanner");
  };

  const updateWhyChooseItem = (index: number, field: keyof WhyChooseItem, value: any) => {
    const newItems = [...form.whyChoose.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, whyChoose: { ...form.whyChoose, items: newItems } });
  };

  function updateOption<T extends SelectOption | CheckboxOption | RadioOption>(
    optionsArray: T[],
    setOptionsArray: (newArray: T[]) => void,
    index: number,
    field: keyof T,
    value: any
  ) {
    const newOptions = [...optionsArray];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptionsArray(newOptions);
  }

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-[#8d6a3a]" size={40} />
      </div>
    );
  }

  const currentEditingId = {
    form: content?._id,
    getInTouch: getInTouchContent?._id,
    ctaBanner: ctaBannerContent?._id
  }[activeTab];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Enquiry Management</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Manage content for the enquiry form page</p>
        </div>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as any)}
          className="block w-full sm:w-48 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:border-[#1d5af2] focus:ring-1 focus:ring-[#1d5af2]"
        >
          <option value="form">Enquiry Form</option>
          <option value="getInTouch">Get In Touch</option>
          <option value="ctaBanner">CTA Banner</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Components</h3>
            <ComponentList 
              records={records}
              onEdit={handleEditComponent}
              onDelete={handleDeleteComponent}
              onReorder={handleReorder}
              editingId={currentEditingId}
              knownKeys={knownKeys}
            />
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'form' && (
            <form id="enquiry-page-form" onSubmit={handleSave} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
                <h2 className="font-bold text-slate-700 text-xs sm:text-sm uppercase tracking-wider">Form Section</h2>
                <button type="submit" disabled={savingForm} className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {savingForm ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Form
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Brand Section */}
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-700 mb-4">Brand Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUploadField label="Brand Logo" value={form.brand.logoSrc} fieldKey="enquiry.brand.logo" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setForm({ ...form, brand: { ...form.brand, logoSrc: url } })} onError={m => toast.error(m)} />
                    <div>
                      <label className={labelClass}>Logo Alt Text</label>
                      <input className={fieldClass} value={form.brand.logoAlt} onChange={e => setForm({ ...form, brand: { ...form.brand, logoAlt: e.target.value } })} placeholder="e.g. Company Logo" />
                      <label className={labelClass + " mt-4"}>Tagline</label>
                      <input className={fieldClass} value={form.brand.tagline} onChange={e => setForm({ ...form, brand: { ...form.brand, tagline: e.target.value } })} placeholder="e.g. Your Partner in Success" />
                    </div>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-700 mb-4">Hero Section</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Heading</label>
                      <input className={fieldClass} value={form.hero.heading} onChange={e => setForm({ ...form, hero: { ...form.hero, heading: e.target.value } })} placeholder="e.g. Get in Touch" />
                      <label className={labelClass + " mt-4"}>Subheading</label>
                      <input className={fieldClass} value={form.hero.subheading} onChange={e => setForm({ ...form, hero: { ...form.hero, subheading: e.target.value } })} placeholder="e.g. We'd love to hear from you" />
                    </div>
                    <ImageUploadField label="Hero Image" value={form.hero.imageSrc} fieldKey="enquiry.hero.image" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setForm({ ...form, hero: { ...form.hero, imageSrc: url } })} onError={m => toast.error(m)} />
                  </div>
                </div>

                {/* Dynamic Options Section Mapping ... (rest of the form fields) */}
                <p className="text-xs italic text-slate-400">Rest of the form fields go here...</p>
              </div>
            </form>
          )}

          {activeTab === 'getInTouch' && (
            <form onSubmit={handleSaveGetInTouch} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
                <h2 className="font-bold text-slate-700 text-xs sm:text-sm uppercase tracking-wider">Get In Touch Section</h2>
                <button type="submit" disabled={savingGetInTouch} className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {savingGetInTouch ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Section
                </button>
              </div>
              <div className="p-4 space-y-6">
                <div>
                  <label className={labelClass}>Heading</label>
                  <input className={fieldClass} value={getInTouchForm.heading} onChange={e => setGetInTouchForm({...getInTouchForm, heading: e.target.value})} placeholder="e.g. Get in Touch" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-bold text-slate-700">Contact Items</h3>
                    <button type="button" onClick={() => setGetInTouchForm({...getInTouchForm, items: [...getInTouchForm.items, { id: randomId(), label: "", iconSrc: "", lines: [""] }]})} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 flex items-center gap-1">
                      <PlusCircle size={14} /> Add Item
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getInTouchForm.items.map((item, index) => (
                      <div key={item.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-3">
                        <button type="button" onClick={() => setGetInTouchForm({...getInTouchForm, items: getInTouchForm.items.filter((_, i) => i !== index)})} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                        <div>
                          <label className={labelClass}>Label</label>
                          <input className={fieldClass} value={item.label} onChange={e => {
                            const newItems = [...getInTouchForm.items];
                            newItems[index] = { ...newItems[index], label: e.target.value };
                            setGetInTouchForm({...getInTouchForm, items: newItems});
                          }} placeholder="e.g. Email Us" />
                        </div>
                        <ImageUploadField 
                          label="Item Icon" 
                          value={item.iconSrc || ""} 
                          fieldKey={`enquiry.getInTouch.item.${index}`} 
                          uploadingField={uploadingField} 
                          onUploadingChange={setUploadingField} 
                          onUpload={url => {
                            const newItems = [...getInTouchForm.items];
                            newItems[index] = { ...newItems[index], iconSrc: url };
                            setGetInTouchForm({...getInTouchForm, items: newItems});
                          }} 
                          onError={m => toast.error(m)} 
                        />
                        <div>
                          <label className={labelClass}>Lines (one per line)</label>
                          <textarea className={fieldClass} value={item.lines.join('\n')} onChange={e => {
                            const newItems = [...getInTouchForm.items];
                            newItems[index] = { ...newItems[index], lines: e.target.value.split('\n') };
                            setGetInTouchForm({...getInTouchForm, items: newItems});
                          }} rows={3} placeholder="Line 1&#10;Line 2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'ctaBanner' && (
            <form onSubmit={handleSaveCtaBanner} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
                <h2 className="font-bold text-slate-700 text-xs sm:text-sm uppercase tracking-wider">CTA Banner Section</h2>
                <button type="submit" disabled={savingCtaBanner} className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {savingCtaBanner ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Section
                </button>
              </div>
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Heading</label>
                    <input className={fieldClass} value={ctaBannerForm.heading} onChange={e => setCtaBannerForm({...ctaBannerForm, heading: e.target.value})} placeholder="e.g. Ready to start?" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>CTA Label</label>
                      <input className={fieldClass} value={ctaBannerForm.ctaLabel} onChange={e => setCtaBannerForm({...ctaBannerForm, ctaLabel: e.target.value})} placeholder="e.g. Contact Us" />
                    </div>
                    <div>
                      <label className={labelClass}>CTA Href</label>
                      <input className={fieldClass} value={ctaBannerForm.ctaHref} onChange={e => setCtaBannerForm({...ctaBannerForm, ctaHref: e.target.value})} placeholder="e.g. /contact" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <RichTextEditor value={ctaBannerForm.description} onChange={val => setCtaBannerForm({...ctaBannerForm, description: val})} placeholder="Enter description..." minHeight="150px" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-4">
                    <ImageUploadField label="Left Image" value={ctaBannerForm.leftImage.imageUrl} fieldKey="enquiry.cta.left" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setCtaBannerForm({...ctaBannerForm, leftImage: {...ctaBannerForm.leftImage, imageUrl: url}})} onError={m => toast.error(m)} />
                    <label className={labelClass}>Left Image Alt</label>
                    <input className={fieldClass} value={ctaBannerForm.leftImage.alt} onChange={e => setCtaBannerForm({...ctaBannerForm, leftImage: {...ctaBannerForm.leftImage, alt: e.target.value}})} placeholder="Alt text" />
                  </div>
                  <div className="space-y-4">
                    <ImageUploadField label="Right Image" value={ctaBannerForm.rightImage.imageUrl} fieldKey="enquiry.cta.right" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setCtaBannerForm({...ctaBannerForm, rightImage: {...ctaBannerForm.rightImage, imageUrl: url}})} onError={m => toast.error(m)} />
                    <label className={labelClass}>Right Image Alt</label>
                    <input className={fieldClass} value={ctaBannerForm.rightImage.alt} onChange={e => setCtaBannerForm({...ctaBannerForm, rightImage: {...ctaBannerForm.rightImage, alt: e.target.value}})} placeholder="Alt text" />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquaryPageManagement;