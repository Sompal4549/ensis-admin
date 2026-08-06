"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Save, Trash2, PlusCircle, Plus, Eye } from 'lucide-react';
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import ComponentList from "@/components/common/ComponentList";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { DropResult } from "@hello-pangea/dnd";

// Options shown in selects / checkboxes / radios

export interface SelectOption {
  value: string;
  label: string;
}

export interface TrustIndicatorItem {
  id: string;
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

export interface StatsStripItem {
  id: string;
  title: string;
  description: string;
  imageurl: CtaBannerImage;
}

export interface StatsStripData {
  items: StatsStripItem[];
}

export interface WhyChooseItem {
  id: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
}

export interface EnquiryPageContent {
  hero: {
    heading: string;
    subheading: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    formImageSrc: string;
    formImageAlt: string;
    ctaPrimary: {
      label: string;
      href: string;
    };
    ctaSecondary: {
      label: string;
      href: string;
    };
    trustIndicators: TrustIndicatorItem[];
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
  hero: {
    heading: "",
    subheading: "",
    description: "",
    imageSrc: "",
    imageAlt: "",
    formImageSrc: "",
    formImageAlt: "",
    ctaPrimary: {
      label: "",
      href: "",
    },
    ctaSecondary: {
      label: "",
      href: "",
    },
    trustIndicators: [],
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
  const [savingStatsStrip, setSavingStatsStrip] = useState(false);

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

  const [statsStripContent, setStatsStripContent] = useState<ComponentContent | null>(null);
  const [statsStripForm, setStatsStripForm] = useState<StatsStripData>({
    items: []
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'getInTouch' | 'ctaBanner' | 'statsStrip'>('form');
  const [pendingDelete, setPendingDelete] = useState<{ message: string; id: string } | null>(null);

  const knownKeys = ["enquiry.page", "enquiry.getInTouch", "enquiry.ctaBanner", "enquiry.features_strip"];

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
          hero: {
            ...initialEnquiryPageContentForm.hero,
            ...d.hero,
            ctaPrimary: {
              ...initialEnquiryPageContentForm.hero.ctaPrimary,
              ...(d.hero?.ctaPrimary || {}),
            },
            ctaSecondary: {
              ...initialEnquiryPageContentForm.hero.ctaSecondary,
              ...(d.hero?.ctaSecondary || {}),
            },
            trustIndicators:
              (d.hero?.trustIndicators as TrustIndicatorItem[]) ||
              initialEnquiryPageContentForm.hero.trustIndicators,
          },
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

    try {
      const statsItem = await componentContentApi.getByKey("enquiry.features_strip");
      if (statsItem) {
        setStatsStripContent(statsItem);
        const d = (statsItem.data || {}) as Partial<StatsStripData>;
        setStatsStripForm({
          items: d.items || []
        });
      }
    } catch (error) {
      console.error("Failed to load stats strip content:", error);
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

  const handleSaveStatsStrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStatsStrip(true);
    try {
      const payload = {
        key: "enquiry.features_strip",
        label: "Enquiry Stats Strip",
        page: "enquiry",
        isActive: true,
        data: statsStripForm as any,
      };

      if (statsStripContent) {
        await componentContentApi.update(statsStripContent._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }
      toast.success("Stats Strip content saved!");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save content.");
    } finally {
      setSavingStatsStrip(false);
    }
  };

  const handleReorder = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(records);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setRecords(items);

    try {
      await Promise.all(
        items.map((item, index) => componentContentApi.update(item._id, { index }))
      );
      toast.success("Order updated");
    } catch (error: any) {
      toast.error("Failed to update order");
      loadContent();
    }
  };

  const handleDeleteComponent = async (id: string) => {
    try {
      await componentContentApi.remove(id);
      loadContent();
    } catch (error: any) {
      toast.error("Delete failed");
    }
  };

  const confirmDeleteClick = (id: string, message: string) => setPendingDelete({ id, message });

  const handleEditComponent = (record: ComponentContent) => {
    if (record.key === "enquiry.page") setActiveTab("form");
    if (record.key === "enquiry.getInTouch") setActiveTab("getInTouch");
    if (record.key === "enquiry.ctaBanner") setActiveTab("ctaBanner");
    if (record.key === "enquiry.features_strip") setActiveTab("statsStrip");
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
    ctaBanner: ctaBannerContent?._id,
    statsStrip: statsStripContent?._id
  }[activeTab];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold  tracking-tight">Enquiry Management</h2>
          <p className=" text-xs sm:text-sm">Manage content for the enquiry form page</p>
        </div>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as any)}
          className="block w-full sm:w-48 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold  shadow-sm focus:border-[#1d5af2] focus:ring-1 focus:ring-[#1d5af2]"
        >
          <option value="form">Enquiry Form</option>
          <option value="getInTouch">Get In Touch</option>
          <option value="ctaBanner">CTA Banner</option>
          <option value="statsStrip">Stats Strip</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold  uppercase tracking-wider mb-4">Components</h3>
            <ComponentList
              records={records}
              onEdit={handleEditComponent}
              onDelete={(id) => confirmDeleteClick(id, "Delete this component?")}
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
                <h2 className="font-bold  text-xs sm:text-sm uppercase tracking-wider">Form Section</h2>
                <button type="submit" disabled={savingForm} className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {savingForm ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Form
                </button>
              </div>
              <div className="p-4 space-y-6">

                {/* Hero Section */}
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-700 mb-4">Hero Section</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Heading</label>
                      <input
                        className={fieldClass}
                        value={form.hero.heading}
                        onChange={e => setForm({ ...form, hero: { ...form.hero, heading: e.target.value } })}
                        placeholder="e.g. Get in Touch"
                      />
                      <label className={labelClass + " mt-4"}>Subheading</label>
                      <input
                        className={fieldClass}
                        value={form.hero.subheading}
                        onChange={e => setForm({ ...form, hero: { ...form.hero, subheading: e.target.value } })}
                        placeholder="e.g. We'd love to hear from you"
                      />
                    </div>
                    <ImageUploadField
                      label="Hero Image"
                      value={form.hero.imageSrc}
                      fieldKey="enquiry.hero.image"
                      uploadingField={uploadingField}
                      onUploadingChange={setUploadingField}
                      onUpload={url => setForm({ ...form, hero: { ...form.hero, imageSrc: url } })}
                      onError={m => toast.error(m)}
                    />

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h3 className="text-md font-bold text-slate-700 mb-3">Primary CTA Button</h3>
                        <label className={labelClass}>Label</label>
                        <input
                          className={fieldClass}
                          value={form.hero.ctaPrimary.label}
                          onChange={e => setForm({ ...form, hero: { ...form.hero, ctaPrimary: { ...form.hero.ctaPrimary, label: e.target.value } } })}
                          placeholder="e.g. Start Your Project"
                        />
                        <label className={labelClass + " mt-4"}>Href</label>
                        <input
                          className={fieldClass}
                          value={form.hero.ctaPrimary.href}
                          onChange={e => setForm({ ...form, hero: { ...form.hero, ctaPrimary: { ...form.hero.ctaPrimary, href: e.target.value } } })}
                          placeholder="e.g. #enquiry-form or /contact"
                        />
                      </div>
                      <div>
                        <h3 className="text-md font-bold text-slate-700 mb-3">Secondary CTA Link</h3>
                        <label className={labelClass}>Label</label>
                        <input
                          className={fieldClass}
                          value={form.hero.ctaSecondary.label}
                          onChange={e => setForm({ ...form, hero: { ...form.hero, ctaSecondary: { ...form.hero.ctaSecondary, label: e.target.value } } })}
                          placeholder="e.g. Book Free Consultation"
                        />
                        <label className={labelClass + " mt-4"}>Href</label>
                        <input
                          className={fieldClass}
                          value={form.hero.ctaSecondary.href}
                          onChange={e => setForm({ ...form, hero: { ...form.hero, ctaSecondary: { ...form.hero.ctaSecondary, href: e.target.value } } })}
                          placeholder="e.g. /consultancy"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-md font-bold text-slate-700">Trust Indicators</h3>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, hero: { ...form.hero, trustIndicators: [...(form.hero.trustIndicators || []), { id: randomId(), label: "" }] } })}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 flex items-center gap-1"
                        >
                          <PlusCircle size={14} /> Add Indicator
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(form.hero.trustIndicators || []).map((item, index) => (
                          <div key={item.id} className="p-3 border rounded-xl bg-slate-50 relative space-y-2">
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, hero: { ...form.hero, trustIndicators: (form.hero.trustIndicators || []).filter((_, i) => i !== index) } })}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                            <label className={labelClass}>Label</label>
                            <input
                              className={fieldClass}
                              value={item.label}
                              onChange={e => {
                                const nt = [...(form.hero.trustIndicators || [])];
                                nt[index] = { ...nt[index], label: e.target.value };
                                setForm({ ...form, hero: { ...form.hero, trustIndicators: nt } });
                              }}
                              placeholder="e.g. 100% Confidential"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Hero Image Alt Text</label>
                      <input
                        className={fieldClass}
                        value={form.hero.imageAlt}
                        onChange={e => setForm({ ...form, hero: { ...form.hero, imageAlt: e.target.value } })}
                        placeholder="Alt text for hero image"
                      />
                    </div>
                    <ImageUploadField
                      label="Form Image"
                      value={form.hero.formImageSrc}
                      fieldKey="enquiry.hero.formImage"
                      uploadingField={uploadingField}
                      onUploadingChange={setUploadingField}
                      onUpload={url => setForm({ ...form, hero: { ...form.hero, formImageSrc: url } })}
                      onError={m => toast.error(m)}
                    />
                    <div>
                      <label className={labelClass}>Form Image Alt Text</label>
                      <input
                        className={fieldClass}
                        value={form.hero.formImageAlt}
                        onChange={e => setForm({ ...form, hero: { ...form.hero, formImageAlt: e.target.value } })}
                        placeholder="Alt text for form image"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>Description</label>
                    <RichTextEditor
                      value={form.hero.description}
                      onChange={val => setForm({ ...form, hero: { ...form.hero, description: val } })}
                      placeholder="Enter a description for the hero section..."
                      minHeight="150px"
                    />
                  </div>
                </div>

                {/* Form Title */}
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-700 mb-4">Form Section</h2>
                  <div>
                    <label className={labelClass}>Form Title</label>
                    <input
                      className={fieldClass}
                      value={form.formTitle}
                      onChange={e => setForm({ ...form, formTitle: e.target.value })}
                      placeholder="e.g. Send us an Enquiry"
                    />
                  </div>
                </div>

                {/* Dynamic Options Sections */}
                {[
                  { key: 'projectTypeOptions', label: 'Project Type Options' },
                  { key: 'stateOptions', label: 'State Options' },
                  { key: 'cityOptions', label: 'City Options' },
                  { key: 'projectSizeOptions', label: 'Project Size Options' },
                  { key: 'budgetRangeOptions', label: 'Budget Range Options' },
                  { key: 'timelineOptions', label: 'Timeline Options' },
                ].map((section) => (
                  <div key={section.key} className="border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-bold text-slate-700">{section.label}</h3>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, [section.key]: [...(form as any)[section.key], { value: "", label: "" }] })}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 flex items-center gap-1"
                      >
                        <PlusCircle size={14} /> Add Option
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(form as any)[section.key].map((option: SelectOption, index: number) => (
                        <div key={option.value + index} className="p-3 border rounded-xl bg-slate-50 relative space-y-2">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, [section.key]: (form as any)[section.key].filter((_: any, i: number) => i !== index) })}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div>
                            <label className={labelClass}>Value</label>
                            <input
                              className={fieldClass}
                              value={option.value}
                              onChange={e =>
                                updateOption<SelectOption>(
                                  (form as any)[section.key],
                                  (newArr) => setForm({ ...form, [section.key]: newArr }),
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. residential"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Label</label>
                            <input
                              className={fieldClass}
                              value={option.label}
                              onChange={e =>
                                updateOption<SelectOption>(
                                  (form as any)[section.key],
                                  (newArr) => setForm({ ...form, [section.key]: newArr }),
                                  index,
                                  "label",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Residential Project"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Services Options (Checkbox) */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-bold text-slate-700">Services Options</h3>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, servicesOptions: [...form.servicesOptions, { id: randomId(), label: "" }] })}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 flex items-center gap-1"
                    >
                      <PlusCircle size={14} /> Add Service
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.servicesOptions.map((option, index) => (
                      <div key={option.id} className="p-3 border rounded-xl bg-slate-50 relative space-y-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, servicesOptions: form.servicesOptions.filter((_, i) => i !== index) })}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div>
                          <label className={labelClass}>Label</label>
                          <input
                            className={fieldClass}
                            value={option.label}
                            onChange={e => updateOption(form.servicesOptions, (newArr) => setForm({ ...form, servicesOptions: newArr }), index, "label", e.target.value)}
                            placeholder="e.g. Architectural Design"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferred Contact Options (Radio) */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-bold text-slate-700">Preferred Contact Options</h3>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, preferredContactOptions: [...form.preferredContactOptions, { id: randomId(), label: "" }] })}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 flex items-center gap-1"
                    >
                      <PlusCircle size={14} /> Add Option
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.preferredContactOptions.map((option, index) => (
                      <div key={option.id} className="p-3 border rounded-xl bg-slate-50 relative space-y-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, preferredContactOptions: form.preferredContactOptions.filter((_, i) => i !== index) })}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div>
                          <label className={labelClass}>Label</label>
                          <input
                            className={fieldClass}
                            value={option.label}
                            onChange={e => updateOption(form.preferredContactOptions, (newArr) => setForm({ ...form, preferredContactOptions: newArr }), index, "label", e.target.value)}
                            placeholder="e.g. Email"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why Choose Section */}
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-700 mb-4">Why Choose Section</h2>
                  <div>
                    <label className={labelClass}>Heading</label>
                    <input
                      className={fieldClass}
                      value={form.whyChoose.heading}
                      onChange={e => setForm({ ...form, whyChoose: { ...form.whyChoose, heading: e.target.value } })}
                      placeholder="e.g. Why Choose Ensis"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <ImageUploadField
                      label="Bottom Image"
                      value={form.whyChoose.bottomImageSrc}
                      fieldKey="enquiry.whyChoose.bottomImage"
                      uploadingField={uploadingField}
                      onUploadingChange={setUploadingField}
                      onUpload={url => setForm({ ...form, whyChoose: { ...form.whyChoose, bottomImageSrc: url } })}
                      onError={m => toast.error(m)}
                    />
                    <div>
                      <label className={labelClass}>Bottom Image Alt</label>
                      <input
                        className={fieldClass}
                        value={form.whyChoose.bottomImageAlt}
                        onChange={e => setForm({ ...form, whyChoose: { ...form.whyChoose, bottomImageAlt: e.target.value } })}
                        placeholder="Alt text"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-bold text-slate-700">Items</h3>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            whyChoose: {
                              ...form.whyChoose,
                              items: [...form.whyChoose.items, { id: randomId(), iconSrc: "", iconAlt: "", title: "", description: "" }],
                            },
                          })
                        }
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 flex items-center gap-1"
                      >
                        <PlusCircle size={14} /> Add Item
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {form.whyChoose.items.map((item, index) => (
                        <div key={item.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-3">
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                whyChoose: { ...form.whyChoose, items: form.whyChoose.items.filter((_, i) => i !== index) },
                              })
                            }
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>

                          <ImageUploadField
                            label="Icon"
                            value={item.iconSrc}
                            fieldKey={`enquiry.whyChoose.item.${index}`}
                            uploadingField={uploadingField}
                            onUploadingChange={setUploadingField}
                            onUpload={url => updateWhyChooseItem(index, "iconSrc", url)}
                            onError={m => toast.error(m)}
                          />

                          <div>
                            <label className={labelClass}>Icon Alt</label>
                            <input
                              className={fieldClass}
                              value={item.iconAlt}
                              onChange={e => updateWhyChooseItem(index, "iconAlt", e.target.value)}
                              placeholder="Alt text"
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Title</label>
                            <input
                              className={fieldClass}
                              value={item.title}
                              onChange={e => updateWhyChooseItem(index, "title", e.target.value)}
                              placeholder="e.g. Expert Team"
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                              className={fieldClass}
                              value={item.description}
                              onChange={e => updateWhyChooseItem(index, "description", e.target.value)}
                              rows={2}
                              placeholder="Short description"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-700 mb-4">Upload Section</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        className={fieldClass}
                        value={form.upload.label}
                        onChange={e => setForm({ ...form, upload: { ...form.upload, label: e.target.value } })}
                        placeholder="e.g. Upload Reference Files"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Helper Text</label>
                      <input
                        className={fieldClass}
                        value={form.upload.helperText}
                        onChange={e => setForm({ ...form, upload: { ...form.upload, helperText: e.target.value } })}
                        placeholder="e.g. Max 5MB, PDF/JPG/PNG"
                      />
                    </div>
                  </div>
                </div>

                {/* Consent + Submit */}
                <div>
                  <label className={labelClass}>Consent Text</label>
                  <textarea
                    className={fieldClass}
                    value={form.consentText}
                    onChange={e => setForm({ ...form, consentText: e.target.value })}
                    rows={2}
                    placeholder="e.g. I agree to be contacted regarding my enquiry"
                  />

                  <label className={labelClass + " mt-4"}>Submit Button Text</label>
                  <input
                    className={fieldClass}
                    value={form.submitButtonText}
                    onChange={e => setForm({ ...form, submitButtonText: e.target.value })}
                    placeholder="e.g. Submit Enquiry"
                  />
                </div>

              </div>
            </form>
          )}

          {activeTab === 'getInTouch' && (
            <form onSubmit={handleSaveGetInTouch} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
                <h2 className="font-bold  text-xs sm:text-sm uppercase tracking-wider">Get In Touch Section</h2>
                <button type="submit" disabled={savingGetInTouch} className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {savingGetInTouch ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Section
                </button>
              </div>
              <div className="p-4 space-y-6">
                <div>
                  <label className={labelClass}>Heading</label>
                  <input className={fieldClass} value={getInTouchForm.heading} onChange={e => setGetInTouchForm({ ...getInTouchForm, heading: e.target.value })} placeholder="e.g. Get in Touch" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-bold ">Contact Items</h3>
                    <button type="button" onClick={() => setGetInTouchForm({ ...getInTouchForm, items: [...getInTouchForm.items, { id: randomId(), label: "", iconSrc: "", lines: [""] }] })} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 flex items-center gap-1">
                      <PlusCircle size={14} /> Add Item
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getInTouchForm.items.map((item, index) => (
                      <div key={item.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-3">
                        <button type="button" onClick={() => setGetInTouchForm({ ...getInTouchForm, items: getInTouchForm.items.filter((_, i) => i !== index) })} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                        <div>
                          <label className={labelClass}>Label</label>
                          <input className={fieldClass} value={item.label} onChange={e => {
                            const newItems = [...getInTouchForm.items];
                            newItems[index] = { ...newItems[index], label: e.target.value };
                            setGetInTouchForm({ ...getInTouchForm, items: newItems });
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
                            setGetInTouchForm({ ...getInTouchForm, items: newItems });
                          }}
                          onError={m => toast.error(m)}
                        />
                        <div>
                          <label className={labelClass}>Lines (one per line)</label>
                          <textarea className={fieldClass} value={item.lines.join('\n')} onChange={e => {
                            const newItems = [...getInTouchForm.items];
                            newItems[index] = { ...newItems[index], lines: e.target.value.split('\n') };
                            setGetInTouchForm({ ...getInTouchForm, items: newItems });
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
                <h2 className="font-bold  text-xs sm:text-sm uppercase tracking-wider">CTA Banner Section</h2>
                <button type="submit" disabled={savingCtaBanner} className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {savingCtaBanner ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Section
                </button>
              </div>
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Heading</label>
                    <input className={fieldClass} value={ctaBannerForm.heading} onChange={e => setCtaBannerForm({ ...ctaBannerForm, heading: e.target.value })} placeholder="e.g. Ready to start?" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>CTA Label</label>
                      <input className={fieldClass} value={ctaBannerForm.ctaLabel} onChange={e => setCtaBannerForm({ ...ctaBannerForm, ctaLabel: e.target.value })} placeholder="e.g. Contact Us" />
                    </div>
                    <div>
                      <label className={labelClass}>CTA Href</label>
                      <input className={fieldClass} value={ctaBannerForm.ctaHref} onChange={e => setCtaBannerForm({ ...ctaBannerForm, ctaHref: e.target.value })} placeholder="e.g. /contact" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <RichTextEditor value={ctaBannerForm.description} onChange={val => setCtaBannerForm({ ...ctaBannerForm, description: val })} placeholder="Enter description..." minHeight="150px" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-4">
                    <ImageUploadField label="Left Image" value={ctaBannerForm.leftImage.imageUrl} fieldKey="enquiry.cta.left" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setCtaBannerForm({ ...ctaBannerForm, leftImage: { ...ctaBannerForm.leftImage, imageUrl: url } })} onError={m => toast.error(m)} />
                    <label className={labelClass}>Left Image Alt</label>
                    <input className={fieldClass} value={ctaBannerForm.leftImage.alt} onChange={e => setCtaBannerForm({ ...ctaBannerForm, leftImage: { ...ctaBannerForm.leftImage, alt: e.target.value } })} placeholder="Alt text" />
                  </div>
                  <div className="space-y-4">
                    <ImageUploadField label="Right Image" value={ctaBannerForm.rightImage.imageUrl} fieldKey="enquiry.cta.right" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => setCtaBannerForm({ ...ctaBannerForm, rightImage: { ...ctaBannerForm.rightImage, imageUrl: url } })} onError={m => toast.error(m)} />
                    <label className={labelClass}>Right Image Alt</label>
                    <input className={fieldClass} value={ctaBannerForm.rightImage.alt} onChange={e => setCtaBannerForm({ ...ctaBannerForm, rightImage: { ...ctaBannerForm.rightImage, alt: e.target.value } })} placeholder="Alt text" />
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'statsStrip' && (
            <form onSubmit={handleSaveStatsStrip} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
                <h2 className="font-bold  text-xs sm:text-sm uppercase tracking-wider">Stats Strip Section</h2>
                <button type="submit" disabled={savingStatsStrip} className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {savingStatsStrip ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Section
                </button>
              </div>
              <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-bold ">Stats Strip Items</h3>
                  <button type="button" onClick={() => setStatsStripForm({ ...statsStripForm, items: [...statsStripForm.items, { id: randomId(), title: "", description: "", imageurl: { imageUrl: "", alt: "" } }] })} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 flex items-center gap-1">
                    <PlusCircle size={14} /> Add Stat
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {statsStripForm.items.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-3">
                      <button type="button" onClick={() => setStatsStripForm({ ...statsStripForm, items: statsStripForm.items.filter((_, i) => i !== index) })} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                      <div>
                        <label className={labelClass}>Value Label</label>
                        <input className={fieldClass} value={item.title} onChange={e => {
                          const ni = [...statsStripForm.items];
                          ni[index] = { ...ni[index], title: e.target.value };
                          setStatsStripForm({ ...statsStripForm, items: ni });
                        }} placeholder="e.g. 20+" />
                      </div>
                      <div>
                        <label className={labelClass}>Subtitle</label>
                        <input className={fieldClass} value={item.description} onChange={e => {
                          const ni = [...statsStripForm.items];
                          ni[index] = { ...ni[index], description: e.target.value };
                          setStatsStripForm({ ...statsStripForm, items: ni });
                        }} placeholder="e.g. Years Experience" />
                      </div>
                      <div>
                        <label className={labelClass}>Image Alt Text</label>
                        <input className={fieldClass} value={item.imageurl.alt} onChange={e => {
                          const ni = [...statsStripForm.items];
                          ni[index] = { ...ni[index], imageurl: { ...ni[index].imageurl, alt: e.target.value } };
                          setStatsStripForm({ ...statsStripForm, items: ni });
                        }} placeholder="Describe the image for accessibility" />
                      </div>
                      <ImageUploadField
                        label="Icon"
                        value={item.imageurl.imageUrl}
                        fieldKey={`enquiry.fstrip.${index}`}
                        uploadingField={uploadingField}
                        onUploadingChange={setUploadingField}
                        onError={m => toast.error(m)}
                        onUpload={url => {
                          const ni = [...statsStripForm.items];
                          ni[index] = { ...ni[index], imageurl: { ...ni[index].imageurl, imageUrl: url } };
                          setStatsStripForm({ ...statsStripForm, items: ni });
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setStatsStripForm({ ...statsStripForm, items: [...statsStripForm.items, { id: randomId(), title: "", description: "", imageurl: { imageUrl: "", alt: "" } }] })}
                    className="border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 py-12 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={32} />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Confirm Delete"
        message={pendingDelete?.message}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await handleDeleteComponent(pendingDelete.id);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default EnquaryPageManagement;