"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { StaticImageData } from "next/image";
import { DropResult } from "@hello-pangea/dnd";
import { Loader2, PlusCircle, Save, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import ComponentList from "@/components/common/ComponentList";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import { fieldClass, labelClass } from "@/constants";
import { componentContentApi, type ComponentContent } from "@/lib/api";
const randomId = () => Math.random().toString(36).slice(2, 9);
interface ImageUrlAlt {
  imageUrl: string;
  alt: string;
}

interface ImageAlt {
  image: string;
  alt: string;
}

interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export interface CareerBenefitsProps {
  title: string;
  benefits: Benefit[];
}
export interface Testimonial {
  title: string;
  testimonials: {
    text: string;
    name: string;
    role: string;
    image: string;
  }[];
}

interface CareerSectionProps {
  heading: string;
  titlePart1: string;
  titlePart2: string;
  description: string;
  buttonPath: string;
  buttonLabel: string;
  RightImageGrid: ImageUrlAlt[];
  leftSide: {
    heading: string;
    description: string;
    filter: { value: string; label: string }[];
    buttonPath: string;
    buttonLabel: string;
  };
  ourHiringJourney: {
    title: string;
    description: string;
    steps: { label: string; description: string }[];
  };
  careerForm: {
    title: string;
    description: string;
    termsText: string;
    buttonText: string;
  };
}

export interface CareersBannerProps {
  bgImage: { imageUrl: string; imageAlt: string };
  heading: string;
  titlePart1: string;
  titlePart2: string;
  titlePart3: string;
  description: string;
  buttonText: string;
  buttonPath: string;
}

export interface CareerTalentCommunity {
  bgImage: ImageAlt;
  heading: string;
  description: string;
  features: string[];
  newsLetterCard: {
    title: string;
    description: string;
    buttonText: string;
  };
}

interface CardItem {
  title: string;
  description: string;
  icon: string | StaticImageData;
}

export interface WhyWorkProps {
  title1: string;
  title2: string;
  heading: string;
  description: string;
  cards: CardItem[];
}

export interface FeatureStripProps {
    features: {
        id: string;
        image: string;
        title: string;
        subtitle: string;
    }[];
}

type CareerTab = "banner" | "section" | "benefits" | "talentCommunity" | "whyWork"|"featuresStrip"|"testimonials";
type CareerData =
  | CareersBannerProps
  | CareerSectionProps
  | CareerBenefitsProps
  | CareerTalentCommunity
  | WhyWorkProps
  | FeatureStripProps
  | Testimonial;

const componentMeta: Record<CareerTab, { key: string; label: string }> = {
  banner: { key: "career.banner", label: "Career Banner" },
  section: { key: "career.section", label: "Career Section" },
  benefits: { key: "career.benefits", label: "Career Benefits" },
  talentCommunity: { key: "career.talentCommunity", label: "Career Talent Community" },
  whyWork: { key: "career.whyWork", label: "Why Work" },
  featuresStrip:{key:"career.features", label:"Features Strip"},
  testimonials: { key: "career.testimonials", label: "Testimonials" },
};

const initialBanner: CareersBannerProps = {
  bgImage: { imageUrl: "", imageAlt: "" },
  heading: "",
  titlePart1: "",
  titlePart2: "",
  titlePart3: "",
  description: "",
  buttonText: "",
  buttonPath: "",
};

const initialSection: CareerSectionProps = {
  heading: "",
  titlePart1: "",
  titlePart2: "",
  description: "",
  buttonPath: "",
  buttonLabel: "",
  RightImageGrid: [],
  leftSide: {
    heading: "",
    description: "",
    filter: [],
    buttonPath: "",
    buttonLabel: "",
  },
  ourHiringJourney: {
    title: "",
    description: "",
    steps: [],
  },
  careerForm: {
    title: "",
    description: "",
    termsText: "",
    buttonText: "",
  },
};

const initialBenefits: CareerBenefitsProps = {
  title: "",
  benefits: [],
};

const initialTalentCommunity: CareerTalentCommunity = {
  bgImage: { image: "", alt: "" },
  heading: "",
  description: "",
  features: [''],
  newsLetterCard: {
    title: "",
    description: "",
    buttonText: "",
  },
};

const initialWhyWork: WhyWorkProps = {
  title1: "",
  title2: "",
  heading: "",
  description: "",
  cards: [],
};
const initialTestimonials: Testimonial = {
  title: "",
  testimonials: [],
};

 const initialFeatureStrip={
    features: [{ id: randomId(), image: "", title: "", subtitle: "" }]
  };
const knownKeys = Object.values(componentMeta).map((item) => item.key);

const Textarea = ({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) => (
  <label className={labelClass}>
    {label}
    <textarea className={`${fieldClass} mt-1`} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
  </label>
);

const Input = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <label className={labelClass}>
    {label}
    <input className={`${fieldClass} mt-1`} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
  </label>
);

const SectionShell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-700">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const CareerPageManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [contentByKey, setContentByKey] = useState<Record<string, ComponentContent | undefined>>({});
  const [activeTab, setActiveTab] = useState<CareerTab>("banner");
  const [bannerForm, setBannerForm] = useState<CareersBannerProps>(initialBanner);
  const [sectionForm, setSectionForm] = useState<CareerSectionProps>(initialSection);
  const [benefitsForm, setBenefitsForm] = useState<CareerBenefitsProps>(initialBenefits);
  const [talentForm, setTalentForm] = useState<CareerTalentCommunity>(initialTalentCommunity);
  const [whyWorkForm, setWhyWorkForm] = useState<WhyWorkProps>(initialWhyWork);
const [featureForm, setFeatureForm] = useState<FeatureStripProps>(initialFeatureStrip)
const [testimonialForm, setTestimonialForm] = useState<Testimonial>(initialTestimonials);
  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const allRecords = await componentContentApi.list();
      const careerRecords = allRecords.filter((record) => record.page === "career");
      const byKey = Object.fromEntries(careerRecords.map((record) => [record.key, record]));

      setRecords(careerRecords);
      setContentByKey(byKey);
      setBannerForm({ ...initialBanner, ...((byKey["career.banner"]?.data || {}) as Partial<CareersBannerProps>) });
      setSectionForm({ ...initialSection, ...((byKey["career.section"]?.data || {}) as Partial<CareerSectionProps>) });
      setBenefitsForm({ ...initialBenefits, ...((byKey["career.benefits"]?.data || {}) as Partial<CareerBenefitsProps>) });
      setTalentForm({ ...initialTalentCommunity, ...((byKey["career.talentCommunity"]?.data || {}) as Partial<CareerTalentCommunity>) });
      setWhyWorkForm({ ...initialWhyWork, ...((byKey["career.whyWork"]?.data || {}) as Partial<WhyWorkProps>) });
      setTestimonialForm({ ...initialTestimonials, ...((byKey["career.testimonials"]?.data || {}) as Partial<Testimonial>) });
      setTestimonialForm({ ...initialTestimonials, ...((byKey["career.testimonials"]?.data || {}) as Partial<Testimonial>) });
    } catch (error) {
      toast.error((error as Error).message || "Failed to load career page content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const getActiveData = (): CareerData => {
    if (activeTab === "banner") return bannerForm;
    if (activeTab === "section") return sectionForm;
    if (activeTab === "benefits") return benefitsForm;
    if (activeTab === "talentCommunity") return talentForm;
      if (activeTab === "featuresStrip") return featureForm;
       if (activeTab === "testimonials") return testimonialForm;
    return whyWorkForm;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const meta = componentMeta[activeTab];
    const existing = contentByKey[meta.key];

    try {
      const payload = {
        key: meta.key,
        label: meta.label,
        page: "career",
        isActive: true,
        data: getActiveData() as any,
      };

      if (existing) {
        await componentContentApi.update(existing._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }

      toast.success(`${meta.label} saved successfully.`);
      loadContent();
    } catch (error) {
      toast.error((error as Error).message || "Failed to save career page content.");
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(records);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setRecords(items);

    try {
      await Promise.all(items.map((item, index) => componentContentApi.update(item._id, { index })));
      toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
      loadContent();
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (!window.confirm("Delete this component?")) return;
    try {
      await componentContentApi.remove(id);
      loadContent();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEditComponent = (record: ComponentContent) => {
    const nextTab = (Object.keys(componentMeta) as CareerTab[]).find((tab) => componentMeta[tab].key === record.key);
    if (nextTab) setActiveTab(nextTab);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-[#8d6a3a]" size={40} />
      </div>
    );
  }

  const currentEditingId = contentByKey[componentMeta[activeTab].key]?._id;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">Career Page Management</h2>
          <p className="text-xs text-slate-500 sm:text-sm">Manage content for career page components</p>
        </div>
        <select
          value={activeTab}
          onChange={(event) => setActiveTab(event.target.value as CareerTab)}
          className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:border-[#1d5af2] focus:ring-1 focus:ring-[#1d5af2] sm:w-64"
        >
          <option value="banner">Career Banner</option>
          <option value="section">Career Section</option>
          <option value="benefits">Benefits</option>
          <option value="talentCommunity">Talent Community</option>
          <option value="whyWork">Why Work</option>
          <option value="featuresStrip">Features Strip</option> 
          <option value="testimonials">Testimonials</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-700">Components</h3>
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

        <div className="space-y-6 lg:col-span-8">
          <form onSubmit={handleSave} className="animate-in overflow-hidden rounded-2xl border bg-white shadow-sm duration-300 fade-in">
            <div className="flex items-center justify-between border-b bg-slate-50 p-4 px-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 sm:text-sm">{componentMeta[activeTab].label}</h2>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#1d5af2] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#154dc8] disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save
              </button>
            </div>

            <div className="space-y-6 p-4">
              {activeTab === "banner" && (
                <>
                  <SectionShell title="Background Image">
                    <ImageUploadField label="Background Image" value={bannerForm.bgImage.imageUrl} fieldKey="career.banner.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={(url) => setBannerForm({ ...bannerForm, bgImage: { ...bannerForm.bgImage, imageUrl: url } })} onError={(message) => toast.error(message)} />
                    <Input label="Image Alt" value={bannerForm.bgImage.imageAlt} onChange={(value) => setBannerForm({ ...bannerForm, bgImage: { ...bannerForm.bgImage, imageAlt: value } })} />
                  </SectionShell>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input label="Heading" value={bannerForm.heading} onChange={(value) => setBannerForm({ ...bannerForm, heading: value })} />
                    <Input label="Button Text" value={bannerForm.buttonText} onChange={(value) => setBannerForm({ ...bannerForm, buttonText: value })} />
                    <Input label="Title Part 1" value={bannerForm.titlePart1} onChange={(value) => setBannerForm({ ...bannerForm, titlePart1: value })} />
                    <Input label="Title Part 2" value={bannerForm.titlePart2} onChange={(value) => setBannerForm({ ...bannerForm, titlePart2: value })} />
                    <Input label="Title Part 3" value={bannerForm.titlePart3} onChange={(value) => setBannerForm({ ...bannerForm, titlePart3: value })} />
                    <Input label="Button Path" value={bannerForm.buttonPath} onChange={(value) => setBannerForm({ ...bannerForm, buttonPath: value })} placeholder="/careers#openings" />
                  </div>
                  <Textarea label="Description" value={bannerForm.description} onChange={(value) => setBannerForm({ ...bannerForm, description: value })} />
                </>
              )}
{activeTab === "testimonials" && (
  <>
    <Input
      label="Section Title"
      value={testimonialForm.title}
      onChange={(value) => setTestimonialForm({ ...testimonialForm, title: value })}
    />

    <button
      type="button"
      onClick={() =>
        setTestimonialForm({
          ...testimonialForm,
          testimonials: [
            ...testimonialForm.testimonials,
            { text: "", name: "", role: "", image: "" },
          ],
        })
      }
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
    >
      <PlusCircle size={14} /> Add Testimonial
    </button>

    <div className="space-y-4">
      {testimonialForm.testimonials.map((item, index) => (
        <div key={index} className="relative rounded-xl border bg-slate-50 p-4 space-y-3">
          <button
            type="button"
            onClick={() =>
              setTestimonialForm({
                ...testimonialForm,
                testimonials: testimonialForm.testimonials.filter((_, i) => i !== index),
              })
            }
            className="absolute right-2 top-2 text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Name"
              value={item.name}
              onChange={(value) =>
                setTestimonialForm({
                  ...testimonialForm,
                  testimonials: testimonialForm.testimonials.map((t, i) =>
                    i === index ? { ...t, name: value } : t
                  ),
                })
              }
            />
            <Input
              label="Role"
              value={item.role}
              onChange={(value) =>
                setTestimonialForm({
                  ...testimonialForm,
                  testimonials: testimonialForm.testimonials.map((t, i) =>
                    i === index ? { ...t, role: value } : t
                  ),
                })
              }
            />
          </div>

          <Textarea
            label="Testimonial Text"
            value={item.text}
            onChange={(value) =>
              setTestimonialForm({
                ...testimonialForm,
                testimonials: testimonialForm.testimonials.map((t, i) =>
                  i === index ? { ...t, text: value } : t
                ),
              })
            }
          />

          <ImageUploadField
            label="Person Image"
            value={item.image}
            fieldKey={`career.testimonial.${index}.image`}
            uploadingField={uploadingField}
            onUploadingChange={setUploadingField}
            onUpload={(url) =>
              setTestimonialForm({
                ...testimonialForm,
                testimonials: testimonialForm.testimonials.map((t, i) =>
                  i === index ? { ...t, image: url } : t
                ),
              })
            }
            onError={(message) => toast.error(message)}
          />
        </div>
      ))}
    </div>
  </>
)}
              {activeTab === "section" && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input label="Heading" value={sectionForm.heading} onChange={(value) => setSectionForm({ ...sectionForm, heading: value })} />
                    <Input label="Button Label" value={sectionForm.buttonLabel} onChange={(value) => setSectionForm({ ...sectionForm, buttonLabel: value })} />
                    <Input label="Title Part 1" value={sectionForm.titlePart1} onChange={(value) => setSectionForm({ ...sectionForm, titlePart1: value })} />
                    <Input label="Title Part 2" value={sectionForm.titlePart2} onChange={(value) => setSectionForm({ ...sectionForm, titlePart2: value })} />
                    <Input label="Button Path" value={sectionForm.buttonPath} onChange={(value) => setSectionForm({ ...sectionForm, buttonPath: value })} />
                  </div>
                  <Textarea label="Description" value={sectionForm.description} onChange={(value) => setSectionForm({ ...sectionForm, description: value })} />

                  <SectionShell title="Right Image Grid">
                    <button type="button" onClick={() => setSectionForm({ ...sectionForm, RightImageGrid: [...sectionForm.RightImageGrid, { imageUrl: "", alt: "" }] })} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700">
                      <PlusCircle size={14} /> Add Image
                    </button>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {sectionForm.RightImageGrid.map((image, index) => (
                        <div key={index} className="relative rounded-xl border bg-white p-4">
                          <button type="button" onClick={() => setSectionForm({ ...sectionForm, RightImageGrid: sectionForm.RightImageGrid.filter((_, itemIndex) => itemIndex !== index) })} className="absolute right-2 top-2 text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                          <ImageUploadField label={`Grid Image ${index + 1}`} value={image.imageUrl} fieldKey={`career.section.grid.${index}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={(url) => setSectionForm({ ...sectionForm, RightImageGrid: sectionForm.RightImageGrid.map((item, itemIndex) => (itemIndex === index ? { ...item, imageUrl: url } : item)) })} onError={(message) => toast.error(message)} />
                          <Input label="Alt" value={image.alt} onChange={(value) => setSectionForm({ ...sectionForm, RightImageGrid: sectionForm.RightImageGrid.map((item, itemIndex) => (itemIndex === index ? { ...item, alt: value } : item)) })} />
                        </div>
                      ))}
                    </div>
                  </SectionShell>

                  <SectionShell title="Left Side">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input label="Heading" value={sectionForm.leftSide.heading} onChange={(value) => setSectionForm({ ...sectionForm, leftSide: { ...sectionForm.leftSide, heading: value } })} />
                      <Input label="Button Label" value={sectionForm.leftSide.buttonLabel} onChange={(value) => setSectionForm({ ...sectionForm, leftSide: { ...sectionForm.leftSide, buttonLabel: value } })} />
                      <Input label="Button Path" value={sectionForm.leftSide.buttonPath} onChange={(value) => setSectionForm({ ...sectionForm, leftSide: { ...sectionForm.leftSide, buttonPath: value } })} />
                    </div>
                    <Textarea label="Description" value={sectionForm.leftSide.description} onChange={(value) => setSectionForm({ ...sectionForm, leftSide: { ...sectionForm.leftSide, description: value } })} />
                    <button type="button" onClick={() => setSectionForm({ ...sectionForm, leftSide: { ...sectionForm.leftSide, filter: [...sectionForm.leftSide.filter, { value: "", label: "" }] } })} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700">
                      <PlusCircle size={14} /> Add Filter
                    </button>
                    {sectionForm.leftSide.filter.map((filter, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
                        <Input label="Value" value={filter.value} onChange={(value) => setSectionForm({ ...sectionForm, leftSide: { ...sectionForm.leftSide, filter: sectionForm.leftSide.filter.map((item, itemIndex) => (itemIndex === index ? { ...item, value } : item)) } })} />
                        <Input label="Label" value={filter.label} onChange={(value) => setSectionForm({ ...sectionForm, leftSide: { ...sectionForm.leftSide, filter: sectionForm.leftSide.filter.map((item, itemIndex) => (itemIndex === index ? { ...item, label: value } : item)) } })} />
                        <button type="button" onClick={() => setSectionForm({ ...sectionForm, leftSide: { ...sectionForm.leftSide, filter: sectionForm.leftSide.filter.filter((_, itemIndex) => itemIndex !== index) } })} className="self-end rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </SectionShell>

                  <SectionShell title="Hiring Journey">
                    <Input label="Title" value={sectionForm.ourHiringJourney.title} onChange={(value) => setSectionForm({ ...sectionForm, ourHiringJourney: { ...sectionForm.ourHiringJourney, title: value } })} />
                    <Textarea label="Description" value={sectionForm.ourHiringJourney.description} onChange={(value) => setSectionForm({ ...sectionForm, ourHiringJourney: { ...sectionForm.ourHiringJourney, description: value } })} />
                    <button type="button" onClick={() => setSectionForm({ ...sectionForm, ourHiringJourney: { ...sectionForm.ourHiringJourney, steps: [...sectionForm.ourHiringJourney.steps, { label: "", description: "" }] } })} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700">
                      <PlusCircle size={14} /> Add Step
                    </button>
                    {sectionForm.ourHiringJourney.steps.map((step, index) => (
                      <div key={index} className="rounded-xl border bg-white p-4">
                        <div className="mb-3 flex justify-end">
                          <button type="button" onClick={() => setSectionForm({ ...sectionForm, ourHiringJourney: { ...sectionForm.ourHiringJourney, steps: sectionForm.ourHiringJourney.steps.filter((_, itemIndex) => itemIndex !== index) } })} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <Input label="Label" value={step.label} onChange={(value) => setSectionForm({ ...sectionForm, ourHiringJourney: { ...sectionForm.ourHiringJourney, steps: sectionForm.ourHiringJourney.steps.map((item, itemIndex) => (itemIndex === index ? { ...item, label: value } : item)) } })} />
                        <Textarea label="Description" value={step.description} onChange={(value) => setSectionForm({ ...sectionForm, ourHiringJourney: { ...sectionForm.ourHiringJourney, steps: sectionForm.ourHiringJourney.steps.map((item, itemIndex) => (itemIndex === index ? { ...item, description: value } : item)) } })} />
                      </div>
                    ))}
                  </SectionShell>

                  <SectionShell title="Career Form">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input label="Title" value={sectionForm.careerForm.title} onChange={(value) => setSectionForm({ ...sectionForm, careerForm: { ...sectionForm.careerForm, title: value } })} />
                      <Input label="Button Text" value={sectionForm.careerForm.buttonText} onChange={(value) => setSectionForm({ ...sectionForm, careerForm: { ...sectionForm.careerForm, buttonText: value } })} />
                    </div>
                    <Textarea label="Description" value={sectionForm.careerForm.description} onChange={(value) => setSectionForm({ ...sectionForm, careerForm: { ...sectionForm.careerForm, description: value } })} />
                    <Textarea label="Terms Text" value={sectionForm.careerForm.termsText} onChange={(value) => setSectionForm({ ...sectionForm, careerForm: { ...sectionForm.careerForm, termsText: value } })} />
                  </SectionShell>
                </>
              )}
{activeTab === "featuresStrip" && (
  <>
    <div className="space-y-4">
      {(featureForm.features || []).map((feat, idx) => (
        <div key={feat.id} className="p-4 border rounded-xl bg-white grid grid-cols-2 gap-4 relative">
          <button
            type="button"
            onClick={() =>
              setFeatureForm({
                ...featureForm,
                features: featureForm.features.filter((_, i) => i !== idx),
              })
            }
            className="absolute top-2 right-2 text-red-500"
          >
            <Trash2 size={14} />
          </button>
          <div className="space-y-3">
            <input
              className={fieldClass}
              placeholder="Title"
              value={feat.title}
              onChange={(e) => {
                const nf = [...featureForm.features];
                nf[idx] = { ...nf[idx], title: e.target.value };
                setFeatureForm({ ...featureForm, features: nf });
              }}
            />
            <input
              className={fieldClass}
              placeholder="Subtitle"
              value={feat.subtitle}
              onChange={(e) => {
                const nf = [...featureForm.features];
                nf[idx] = { ...nf[idx], subtitle: e.target.value };
                setFeatureForm({ ...featureForm, features: nf });
              }}
            />
          </div>
          <ImageUploadField
            label="Icon/Image"
            value={feat.image}
            fieldKey={`strip.${idx}`}
            uploadingField={uploadingField}
            onUploadingChange={setUploadingField}
            onError={(m) => toast.error(m)}
            onUpload={(url) => {
              const nf = [...featureForm.features];
              nf[idx] = { ...nf[idx], image: url };
              setFeatureForm({ ...featureForm, features: nf });
            }}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setFeatureForm({
            ...featureForm,
            features: [
              ...featureForm.features,
              { id: randomId(), image: "", title: "", subtitle: "" },
            ],
          })
        }
        className="w-full py-3 border-2 border-dashed rounded-xl text-slate-400 flex items-center justify-center gap-2"
      >
        + Add Feature Strip Item
      </button>
    </div>
  </>
)}
              {activeTab === "benefits" && (
                <>
                  
                  <Input label="Title" value={benefitsForm.title} onChange={(value) => setBenefitsForm({ ...benefitsForm, title: value })} />
                  <button type="button" onClick={() => setBenefitsForm({ ...benefitsForm, benefits: [...benefitsForm.benefits, { title: "", description: "", icon: "" }] })} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700">
                    <PlusCircle size={14} /> Add Benefit
                  </button>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {benefitsForm.benefits.map((benefit, index) => (
                      <div key={index} className="relative rounded-xl border bg-slate-50 p-4">
                        <button type="button" onClick={() => setBenefitsForm({ ...benefitsForm, benefits: benefitsForm.benefits.filter((_, itemIndex) => itemIndex !== index) })} className="absolute right-2 top-2 text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                        <ImageUploadField label="Icon" value={benefit.icon} fieldKey={`career.benefits.${index}.icon`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={(url) => setBenefitsForm({ ...benefitsForm, benefits: benefitsForm.benefits.map((item, itemIndex) => (itemIndex === index ? { ...item, icon: url } : item)) })} onError={(message) => toast.error(message)} />
                        <Input label="Title" value={benefit.title} onChange={(value) => setBenefitsForm({ ...benefitsForm, benefits: benefitsForm.benefits.map((item, itemIndex) => (itemIndex === index ? { ...item, title: value } : item)) })} />
                        <Textarea label="Description" value={benefit.description} onChange={(value) => setBenefitsForm({ ...benefitsForm, benefits: benefitsForm.benefits.map((item, itemIndex) => (itemIndex === index ? { ...item, description: value } : item)) })} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "talentCommunity" && (
                <>
                  <SectionShell title="Background">
                    <ImageUploadField label="Background Image" value={talentForm.bgImage.image} fieldKey="career.talent.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={(url) => setTalentForm({ ...talentForm, bgImage: { ...talentForm.bgImage, image: url } })} onError={(message) => toast.error(message)} />
                    <Input label="Alt" value={talentForm.bgImage.alt} onChange={(value) => setTalentForm({ ...talentForm, bgImage: { ...talentForm.bgImage, alt: value } })} />
                  </SectionShell>
                  <Input label="Heading" value={talentForm.heading} onChange={(value) => setTalentForm({ ...talentForm, heading: value })} />
                  <Textarea label="Description" value={talentForm.description} onChange={(value) => setTalentForm({ ...talentForm, description: value })} />
                  <SectionShell title="Features">
                    <button type="button" onClick={() => setTalentForm({ ...talentForm, features: [...talentForm.features, ''] })} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700">
                      <PlusCircle size={14} /> Add Feature
                    </button>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {talentForm.features.map((feature, index) => (
                        <div key={index} className="relative rounded-xl border bg-white p-4">
                          <button type="button" onClick={() => setTalentForm({ ...talentForm, features: talentForm.features.filter((_, itemIndex) => itemIndex !== index) })} className="absolute right-2 top-2 text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                          {/* <ImageUploadField label="Feature Image" value={feature.image} fieldKey={`career.talent.feature.${index}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={(url) => setTalentForm({ ...talentForm, features: talentForm.features.map((item, itemIndex) => (itemIndex === index ? { ...item, image: url } : item)) })} onError={(message) => toast.error(message)} /> */}
                          <Input label="Label" value={feature} onChange={(value) => setTalentForm({ ...talentForm, features: talentForm.features.map((item, itemIndex) => (itemIndex === index ? value : item)) })} />
                        </div>
                      ))}
                    </div>
                  </SectionShell>
                  <SectionShell title="Newsletter Card">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input label="Title" value={talentForm.newsLetterCard.title} onChange={(value) => setTalentForm({ ...talentForm, newsLetterCard: { ...talentForm.newsLetterCard, title: value } })} />
                      <Input label="Button Text" value={talentForm.newsLetterCard.buttonText} onChange={(value) => setTalentForm({ ...talentForm, newsLetterCard: { ...talentForm.newsLetterCard, buttonText: value } })} />
                    </div>
                    <Textarea label="Description" value={talentForm.newsLetterCard.description} onChange={(value) => setTalentForm({ ...talentForm, newsLetterCard: { ...talentForm.newsLetterCard, description: value } })} />
                  </SectionShell>
                </>
              )}

              {activeTab === "whyWork" && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input label="Title 1" value={whyWorkForm.title1} onChange={(value) => setWhyWorkForm({ ...whyWorkForm, title1: value })} />
                    <Input label="Title 2" value={whyWorkForm.title2} onChange={(value) => setWhyWorkForm({ ...whyWorkForm, title2: value })} />
                    <Input label="Heading" value={whyWorkForm.heading} onChange={(value) => setWhyWorkForm({ ...whyWorkForm, heading: value })} />
                  </div>
                  <Textarea label="Description" value={whyWorkForm.description} onChange={(value) => setWhyWorkForm({ ...whyWorkForm, description: value })} />
                  <button type="button" onClick={() => setWhyWorkForm({ ...whyWorkForm, cards: [...whyWorkForm.cards, { title: "", description: "", icon: "" }] })} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700">
                    <PlusCircle size={14} /> Add Card
                  </button>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {whyWorkForm.cards.map((card, index) => (
                      <div key={index} className="relative rounded-xl border bg-slate-50 p-4">
                        <button type="button" onClick={() => setWhyWorkForm({ ...whyWorkForm, cards: whyWorkForm.cards.filter((_, itemIndex) => itemIndex !== index) })} className="absolute right-2 top-2 text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                        <ImageUploadField label="Icon" value={typeof card.icon === "string" ? card.icon : ""} fieldKey={`career.whyWork.card.${index}.icon`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={(url) => setWhyWorkForm({ ...whyWorkForm, cards: whyWorkForm.cards.map((item, itemIndex) => (itemIndex === index ? { ...item, icon: url } : item)) })} onError={(message) => toast.error(message)} />
                        <Input label="Title" value={card.title} onChange={(value) => setWhyWorkForm({ ...whyWorkForm, cards: whyWorkForm.cards.map((item, itemIndex) => (itemIndex === index ? { ...item, title: value } : item)) })} />
                        <Textarea label="Description" value={card.description} onChange={(value) => setWhyWorkForm({ ...whyWorkForm, cards: whyWorkForm.cards.map((item, itemIndex) => (itemIndex === index ? { ...item, description: value } : item)) })} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CareerPageManagement;
