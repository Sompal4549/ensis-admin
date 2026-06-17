"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Save, Trash2, PlusCircle } from 'lucide-react';
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";

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
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<ComponentContent | null>(null);
  const [form, setForm] = useState<EnquiryPageContent>(initialEnquiryPageContentForm);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setLoading(true);
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
      console.error("Failed to load enquiry page content:", error);
      toast.error("Failed to load enquiry page content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
      setSaving(false);
    }
  };

  const updateWhyChooseItem = (index: number, field: keyof WhyChooseItem, value: any) => {
    const newItems = [...form.whyChoose.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, whyChoose: { ...form.whyChoose, items: newItems } });
  };

  const updateOption = <T extends SelectOption | CheckboxOption | RadioOption>(
    optionsArray: T[],
    setOptionsArray: (newArray: T[]) => void,
    index: number,
    field: keyof T,
    value: any
  ) => {
    const newOptions = [...optionsArray];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptionsArray(newOptions);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-[#8d6a3a]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8 pb-8">
      <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Enquiry Page Management</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Manage content for the enquiry form page</p>
        </div>
        <button
          type="submit"
          form="enquiry-page-form"
          disabled={saving}
          className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          <span className="hidden sm:inline">Save Page Content</span>
        </button>
      </div>

      <form id="enquiry-page-form" onSubmit={handleSave} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="p-4 space-y-6">
          {/* Brand Section */}
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-700 mb-4">Brand Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadField
                label="Brand Logo"
                value={form.brand.logoSrc}
                fieldKey="enquiry.brand.logo"
                uploadingField={uploadingField}
                onUploadingChange={setUploadingField}
                onUpload={url => setForm({ ...form, brand: { ...form.brand, logoSrc: url } })}
                onError={m => toast.error(m)}
              />
              <div>
                <label className={labelClass}>Logo Alt Text</label>
                <input
                  className={fieldClass}
                  value={form.brand.logoAlt}
                  onChange={e => setForm({ ...form, brand: { ...form.brand, logoAlt: e.target.value } })}
                  placeholder="e.g. Company Logo"
                />
                <label className={labelClass + " mt-4"}>Tagline</label>
                <input
                  className={fieldClass}
                  value={form.brand.tagline}
                  onChange={e => setForm({ ...form, brand: { ...form.brand, tagline: e.target.value } })}
                  placeholder="e.g. Your Partner in Success"
                />
              </div>
            </div>
          </div>

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
              <div>
                <label className={labelClass}>Hero Image Alt Text</label>
                <input
                  className={fieldClass}
                  value={form.hero.imageAlt}
                  onChange={e => setForm({ ...form, hero: { ...form.hero, imageAlt: e.target.value } })}
                  placeholder="Alt text for hero image"
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
                        onChange={e => updateOption( (form as any)[section.key], (newArr) => setForm({ ...form, [section.key]: newArr }), index, "value", e.target.value)}
                        placeholder="e.g. residential"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        className={fieldClass}
                        value={option.label}
                        onChange={e => updateOption( (form as any)[section.key], (newArr) => setForm({ ...form, [section.key]: newArr }), index, "label", e.target.value)}
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
            <h2 className="text-lg font-bold text-slate-700 mb-4">Why Choose Us Section</h2>
            <div>
              <label className={labelClass}>Heading</label>
              <input
                className={fieldClass}
                value={form.whyChoose.heading}
                onChange={e => setForm({ ...form, whyChoose: { ...form.whyChoose, heading: e.target.value } })}
                placeholder="e.g. Why Choose Ensis?"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <ImageUploadField
                label="Bottom Decorative Image"
                value={form.whyChoose.bottomImageSrc}
                fieldKey="enquiry.whyChoose.bottomImage"
                uploadingField={uploadingField}
                onUploadingChange={setUploadingField}
                onUpload={url => setForm({ ...form, whyChoose: { ...form.whyChoose, bottomImageSrc: url } })}
                onError={m => toast.error(m)}
              />
              <div>
                <label className={labelClass}>Bottom Image Alt Text</label>
                <input
                  className={fieldClass}
                  value={form.whyChoose.bottomImageAlt}
                  onChange={e => setForm({ ...form, whyChoose: { ...form.whyChoose, bottomImageAlt: e.target.value } })}
                  placeholder="Alt text for bottom image"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-bold text-slate-700">Why Choose Items</h3>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, whyChoose: { ...form.whyChoose, items: [...form.whyChoose.items, { id: randomId(), iconSrc: "", iconAlt: "", title: "", description: "" }] } })}
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
                      onClick={() => setForm({ ...form, whyChoose: { ...form.whyChoose, items: form.whyChoose.items.filter((_, i) => i !== index) } })}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div>
                      <label className={labelClass}>Item Title</label>
                      <input className={fieldClass} value={item.title} onChange={e => updateWhyChooseItem(index, "title", e.target.value)} placeholder="Title" />
                    </div>
                    <ImageUploadField
                      label="Item Icon"
                      value={item.iconSrc}
                      fieldKey={`enquiry.whyChoose.item.icon.${index}`}
                      uploadingField={uploadingField}
                      onUploadingChange={setUploadingField}
                      onUpload={url => updateWhyChooseItem(index, "iconSrc", url)}
                      onError={m => toast.error(m)}
                    />
                    <div>
                      <label className={labelClass}>Icon Alt Text</label>
                      <input className={fieldClass} value={item.iconAlt} onChange={e => updateWhyChooseItem(index, "iconAlt", e.target.value)} placeholder="Alt text" />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea className={fieldClass} value={item.description} onChange={e => updateWhyChooseItem(index, "description", e.target.value)} placeholder="Description" rows={2} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-700 mb-4">File Upload Section</h2>
            <div>
              <label className={labelClass}>Upload Field Label</label>
              <input
                className={fieldClass}
                value={form.upload.label}
                onChange={e => setForm({ ...form, upload: { ...form.upload, label: e.target.value } })}
                placeholder="e.g. Upload Project Files"
              />
            </div>
            <div className="mt-4">
              <label className={labelClass}>Upload Helper Text</label>
              <textarea
                className={fieldClass}
                value={form.upload.helperText}
                onChange={e => setForm({ ...form, upload: { ...form.upload, helperText: e.target.value } })}
                placeholder="e.g. Max file size 5MB, accepted formats: PDF, JPG, PNG"
                rows={2}
              />
            </div>
          </div>

          {/* Consent and Submit */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700 mb-4">Consent & Submission</h2>
            <div>
              <label className={labelClass}>Consent Text</label>
              <RichTextEditor
                value={form.consentText}
                onChange={val => setForm({ ...form, consentText: val })}
                placeholder="e.g. I agree to be contacted by Ensis..."
                minHeight="100px"
              />
            </div>
            <div className="mt-4">
              <label className={labelClass}>Submit Button Text</label>
              <input
                className={fieldClass}
                value={form.submitButtonText}
                onChange={e => setForm({ ...form, submitButtonText: e.target.value })}
                placeholder="e.g. Submit Enquiry"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border-t p-4 px-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            <span className="hidden sm:inline">Save Page Content</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnquaryPageManagement;