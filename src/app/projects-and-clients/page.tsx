"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Save, Trash2, Eye } from 'lucide-react';
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import Image from 'next/image';

export interface ClientLogo {
  id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
}

export interface TrustStat {
  id: string;
  iconSrc: string;
  iconAlt: string;
  value: string;
  label: string;
}

export interface OurClients {
  heading: string;
  subheading: string;
  clients: ClientLogo[];
  stats: TrustStat[];
  decorativeImageSrc: string;
  decorativeImageAlt: string;
}

export interface PartnerFeature {
  id: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
}

export interface WhyPartnerBannerData {
  heading: string;
  features: PartnerFeature[];
  decorativeImageSrc: string;
  decorativeImageAlt: string;
}

interface ProjectsBannerContent {
  title: {
    line1: string;
    line2: string;
  };
  subtitle: string;
  description: string;
  heroImage?: string;
  sectionTitle: string;
  bgImageAlt?: string;
}

export interface ProjectCardImage {
  imageUrl: string;
  alt: string;
}

export interface ProjectCard {
  id: string;
  title: string;
  location: string;
  image: ProjectCardImage;
}

export interface OurProjectsContent {
  title: string;
  subtitle: string;
  cards: ProjectCard[];
  buttonText:string;
  buttonPath:string;
}

export interface Testimonial {
  id: string;
  logo: string;
  company: string;
  person: string;
  designation: string;
}

export interface ContactInfo {
  officeName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  workingDays: string;
  workingHours: string;
}

export interface ContactSection {
  quote: string;
  testimonials: Testimonial[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonPath: string;
  contact: ContactInfo;
  leftImage: string;
  rightImage: string;
  bottomText: string;
}

// Default width/height so a freshly-added logo never reaches an
// <Image width={0} height={0} /> on the public-facing page before
// the admin fills in real values.
const DEFAULT_LOGO_WIDTH = 120;
const DEFAULT_LOGO_HEIGHT = 60;

const randomId = () => Math.random().toString(36).substring(2, 9);

const initialOurClientsForm: OurClients = {
  heading: "",
  subheading: "",
  clients: [],
  stats: [],
  decorativeImageSrc: "",
  decorativeImageAlt: "",
};

const initialWhyPartnerForm: WhyPartnerBannerData = {
  heading: "",
  features: [],
  decorativeImageSrc: "",
  decorativeImageAlt: "",
};

const initialOurProjectsForm: OurProjectsContent = {
  title: "",
  subtitle: "",
  cards: [],
  buttonText: "",
  buttonPath: "",
};

const initialContactSectionForm: ContactSection = {
  quote: "",
  testimonials: [],
  ctaTitle: "",
  ctaDescription: "",
  ctaButtonText: "",
  ctaButtonPath: "",
  contact: {
    officeName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    workingDays: "",
    workingHours: ""
  },
  leftImage: "",
  rightImage: "",
  bottomText: ""
};
const ProjectAndClientManagement = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ComponentContent | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Separate "saving" flags per-section so saving one form doesn't
  // disable/spin the buttons on the other two forms.
  const [savingBanner, setSavingBanner] = useState(false);
  const [savingOurClients, setSavingOurClients] = useState(false);
  const [savingWhyPartner, setSavingWhyPartner] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingOurProjects, setSavingOurProjects] = useState(false);

  const [activeTab, setActiveTab] = useState<'banner' | 'whyPartner' | 'ourClients' | 'contact' | 'ourProjects'>('banner');

  const [form, setForm] = useState<ProjectsBannerContent>({
    title: { line1: "", line2: "" },
    subtitle: "",
    description: "",
    heroImage: "",
    sectionTitle: "",
    bgImageAlt:""
  });
  const [ourClientsContent, setOurClientsContent] = useState<ComponentContent | null>(null);
  const [ourClientsForm, setOurClientsForm] = useState<OurClients>(initialOurClientsForm);
  const [whyPartnerContent, setWhyPartnerContent] = useState<ComponentContent | null>(null);
  const [whyPartnerForm, setWhyPartnerForm] = useState<WhyPartnerBannerData>(initialWhyPartnerForm);
  const [ourProjectsContent, setOurProjectsContent] = useState<ComponentContent | null>(null);
  const [ourProjectsForm, setOurProjectsForm] = useState<OurProjectsContent>(initialOurProjectsForm);
  const [contactContent, setContactContent] = useState<ComponentContent | null>(null);
  const [contactForm, setContactForm] = useState<ContactSection>(initialContactSectionForm);

  const loadContent = useCallback(async () => {
    setLoading(true);

    // Each section is fetched independently with its own try/catch so
    // that one missing/failing key (e.g. "projects.whyPartner" not yet
    // created in the backend) doesn't stop the other two sections from
    // loading. Previously all three awaits were inside a single try
    // block, so a failure on the first call silently skipped the rest.

    try {
      const item = await componentContentApi.getByKey("projects.banner");
      if (item) {
        setContent(item);
        const d = (item.data || {}) as Partial<ProjectsBannerContent>;
        setForm({
          title: d?.title || { line1: "", line2: "" },
          subtitle: d?.subtitle || "",
          description: d?.description || "",
          heroImage: d?.heroImage || "",
          sectionTitle: d?.sectionTitle || ""
        });
      }
    } catch (error) {
      console.error("Failed to load projects banner:", error);
    }

    try {
      const ourClientsItem = await componentContentApi.getByKey("projects.ourClients");
      if (ourClientsItem) {
        setOurClientsContent(ourClientsItem);
        const d = (ourClientsItem.data || {}) as Partial<OurClients>;
        setOurClientsForm({
          heading: d?.heading || "",
          subheading: d?.subheading || "",
          clients: d?.clients || [],
          stats: d?.stats || [],
          decorativeImageSrc: d?.decorativeImageSrc || "",
          decorativeImageAlt: d?.decorativeImageAlt || "",
        });
      }
    } catch (error) {
      console.error("Failed to load our clients section:", error);
    }

    try {
      const whyPartnerItem = await componentContentApi.getByKey("projects.whyPartner");
      if (whyPartnerItem) {
        setWhyPartnerContent(whyPartnerItem);
        const d = (whyPartnerItem.data || {}) as Partial<WhyPartnerBannerData>;
        setWhyPartnerForm({
          heading: d?.heading || "",
          features: d?.features || [],
          decorativeImageSrc: d?.decorativeImageSrc || "",
          decorativeImageAlt: d?.decorativeImageAlt || "",
        });
      }
    } catch (error) {
      console.error("Failed to load why partner section:", error);
    }

    try {
      const ourProjectsItem = await componentContentApi.getByKey("projects.ourProjects");
      if (ourProjectsItem) {
        setOurProjectsContent(ourProjectsItem);
        const d = (ourProjectsItem.data || {}) as Partial<OurProjectsContent>;
        setOurProjectsForm({
          title: d?.title || "",
          subtitle: d?.subtitle || "",
          cards: d?.cards || [],
          buttonText: d?.buttonText || "",
          buttonPath: d?.buttonPath || ""
        });
      }
    } catch (error) {
      console.error("Failed to load our projects section:", error);
    }

    try {
      const contactItem = await componentContentApi.getByKey("projects.contactSection");
      if (contactItem) {
        setContactContent(contactItem);
        const d = (contactItem.data || {}) as Partial<ContactSection>;
        setContactForm({
          quote: d?.quote || "",
          testimonials: d?.testimonials || [],
          ctaTitle: d?.ctaTitle || "",
          ctaDescription: d?.ctaDescription || "",
          ctaButtonText: d?.ctaButtonText || "",
          ctaButtonPath: d?.ctaButtonPath || "",

          contact: d?.contact || initialContactSectionForm.contact,
          leftImage: d?.leftImage || "",
          rightImage: d?.rightImage || "",
          bottomText: d?.bottomText || ""
        });
      }
    } catch (error) {
      console.error("Failed to load contact section:", error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const payload = {
        key: "projects.banner",
        label: "Projects Banner",
        page: "projects",
        isActive: true,
        data: form as any
      };

      if (content) {
        await componentContentApi.update(content._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }
      toast.success("Projects banner saved successfully!");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save banner");
    } finally {
      setSavingBanner(false);
    }
  };

  const handleSaveOurClients = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOurClients(true);
    try {
      const payload = {
        key: "projects.ourClients",
        label: "Projects Our Clients Section",
        page: "projects",
        isActive: true,
        data: ourClientsForm as any
      };

      if (ourClientsContent) {
        await componentContentApi.update(ourClientsContent._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }
      toast.success("Our Clients section saved successfully!");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save Our Clients section");
    } finally {
      setSavingOurClients(false);
    }
  };

  const handleSaveWhyPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWhyPartner(true);
    try {
      const payload = {
        key: "projects.whyPartner",
        label: "Projects Why Partner Section",
        page: "projects",
        isActive: true,
        data: whyPartnerForm as any
      };

      if (whyPartnerContent) {
        await componentContentApi.update(whyPartnerContent._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }
      toast.success("Why Partner section saved successfully!");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save Why Partner section");
    } finally {
      setSavingWhyPartner(false);
    }
  };

  const handleSaveOurProjects = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOurProjects(true);
    try {
      const payload = {
        key: "projects.ourProjects",
        label: "Projects Our Projects Section",
        page: "projects",
        isActive: true,
        data: ourProjectsForm as any
      };

      if (ourProjectsContent) {
        await componentContentApi.update(ourProjectsContent._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }
      toast.success("Our Projects section saved successfully!");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save Our Projects section");
    } finally {
      setSavingOurProjects(false);
    }
  };

  const handleSaveContactSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      const payload = {
        key: "projects.contactSection",
        label: "Projects Contact Section",
        page: "projects",
        isActive: true,
        data: contactForm as any
      };

      if (contactContent) {
        await componentContentApi.update(contactContent._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }
      toast.success("Contact section saved successfully!");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save Contact section");
    } finally {
      setSavingContact(false);
    }
  };

  const updateClient = (index: number, field: keyof ClientLogo, value: any) => {
    const newClients = [...ourClientsForm.clients];
    newClients[index] = { ...newClients[index], [field]: value };
    setOurClientsForm({ ...ourClientsForm, clients: newClients });
  };
  const updatePartnerFeature = (index: number, field: keyof PartnerFeature, value: any) => {
    const newFeatures = [...whyPartnerForm.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setWhyPartnerForm({ ...whyPartnerForm, features: newFeatures });
  };
  const updateStat = (index: number, field: keyof TrustStat, value: any) => {
    const newStats = [...ourClientsForm.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setOurClientsForm({ ...ourClientsForm, stats: newStats });
  };
  const updateProjectCard = (index: number, field: keyof ProjectCard, value: any) => {
    const newCards = [...ourProjectsForm.cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setOurProjectsForm({ ...ourProjectsForm, cards: newCards });
  };
  const updateTestimonial = (index: number, field: keyof Testimonial, value: any) => {
    const newTestimonials = [...contactForm.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setContactForm({ ...contactForm, testimonials: newTestimonials });
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Projects & Clients</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Manage your portfolio and client testimonials</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="block w-full sm:w-48 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:border-[#1d5af2] focus:ring-1 focus:ring-[#1d5af2] transition-all"
          >
            <option value="banner">Banner</option>
            <option value="whyPartner">Why Partner</option>
            <option value="ourProjects">Our Projects</option>
            <option value="ourClients">Our Clients</option>
            <option value="contact">Contact Section</option>
          </select>
        </div>
      </div>

      {activeTab === 'banner' && (
        <form onSubmit={handleSave} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
          <h2 className="font-bold text-slate-700 text-xs sm:text-sm uppercase tracking-wider">Banner Section</h2>
          <button 
            type="submit" 
            disabled={savingBanner} 
            className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            {savingBanner ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            <span className="hidden sm:inline">Save Banner</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Title Line 1</label>
                  <input 
                    className={fieldClass} 
                    value={form.title.line1} 
                    onChange={e => setForm({...form, title: {...form.title, line1: e.target.value}})} 
                    placeholder="e.g. Our Trusted"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Title Line 2</label>
                  <input 
                    className={fieldClass} 
                    value={form.title.line2} 
                    onChange={e => setForm({...form, title: {...form.title, line2: e.target.value}})} 
                    placeholder="e.g. Partners"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input 
                  className={fieldClass} 
                  value={form.subtitle} 
                  onChange={e => setForm({...form, subtitle: e.target.value})} 
                  placeholder="e.g. Delivering excellence across industries"
                />
              </div>
               <div>
                <label className={labelClass}>Background Image Alt</label>
                <input 
                  className={fieldClass} 
                  value={form.bgImageAlt} 
                  onChange={e => setForm({...form, bgImageAlt: e.target.value})} 
                  placeholder="e.g. Delivering excellence across industries"
                />
              </div>
              <div>
                <label className={labelClass}>Section Title</label>
                <input 
                  className={fieldClass} 
                  value={form.sectionTitle} 
                  onChange={e => setForm({...form, sectionTitle: e.target.value})} 
                  placeholder="e.g. CLIENTS"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <ImageUploadField 
                label="Banner Hero Image" 
                value={form.heroImage} 
                fieldKey="projects.banner.hero" 
                uploadingField={uploadingField} 
                onUploadingChange={setUploadingField} 
                onUpload={url => setForm({...form, heroImage: url})} 
                onError={m => toast.error(m)} 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className={labelClass}>Description / Introduction</label>
            <div className="mt-2">
              <RichTextEditor 
                value={form.description} 
                onChange={val => setForm({...form, description: val})} 
                placeholder="Describe the projects and clients overview..."
                minHeight="200px" 
              />
            </div>
          </div>
        </div>
      </form>
      )}

      {/* Why Partner Section */}
      {activeTab === 'whyPartner' && (
        <form onSubmit={handleSaveWhyPartner} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
          <h2 className="font-bold text-slate-700 text-xs sm:text-sm uppercase tracking-wider">Why Partner Section</h2>
          <button 
            type="submit" 
            disabled={savingWhyPartner} 
            className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            {savingWhyPartner ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            <span className="hidden sm:inline">Save Why Partner</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className={labelClass}>Heading</label>
            <input 
              className={fieldClass} 
              value={whyPartnerForm.heading} 
              onChange={e => setWhyPartnerForm({...whyPartnerForm, heading: e.target.value})} 
              placeholder="e.g. Why Partner With Ensis?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadField 
              label="Decorative Image" 
              value={whyPartnerForm.decorativeImageSrc} 
              fieldKey="projects.whyPartner.decorative" 
              uploadingField={uploadingField} 
              onUploadingChange={setUploadingField} 
              onUpload={url => setWhyPartnerForm({...whyPartnerForm, decorativeImageSrc: url})} 
              onError={m => toast.error(m)} 
            />
            <div>
              <label className={labelClass}>Decorative Image Alt Text</label>
              <input 
                className={fieldClass} 
                value={whyPartnerForm.decorativeImageAlt} 
                onChange={e => setWhyPartnerForm({...whyPartnerForm, decorativeImageAlt: e.target.value})} 
                placeholder="Alt text"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700">Partner Features</h3>
              <button 
                type="button" 
                onClick={() => setWhyPartnerForm({...whyPartnerForm, features: [...whyPartnerForm.features, {id: randomId(), iconSrc: "", iconAlt: "", title: "", description: ""}]})}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700"
              >
                Add Feature
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {whyPartnerForm.features.map((feature, index) => (
                <div key={feature.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-3">
                  <button 
                    type="button" 
                    onClick={() => setWhyPartnerForm({...whyPartnerForm, features: whyPartnerForm.features.filter((_, i) => i !== index)})}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Feature Title</label>
                      <input className={fieldClass} value={feature.title} onChange={e => updatePartnerFeature(index, "title", e.target.value)} placeholder="Title" />
                    </div>
                    <ImageUploadField 
                      label="Feature Icon" 
                      value={feature.iconSrc} 
                      fieldKey={`projects.whyPartner.icon.${index}`} 
                      uploadingField={uploadingField} 
                      onUploadingChange={setUploadingField} 
                      onUpload={url => updatePartnerFeature(index, "iconSrc", url)} 
                      onError={m => toast.error(m)} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea className={fieldClass} value={feature.description} onChange={e => updatePartnerFeature(index, "description", e.target.value)} placeholder="Description" rows={2} />
                  </div>
                  <div>
                    <label className={labelClass}>Icon Alt Text</label>
                    <input className={fieldClass} value={feature.iconAlt} onChange={e => updatePartnerFeature(index, "iconAlt", e.target.value)} placeholder="Alt text" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
      )}

      {/* Our Clients Section */}
      {activeTab === 'ourClients' && (
        <form onSubmit={handleSaveOurClients} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
          <h2 className="font-bold text-slate-700 text-xs sm:text-sm uppercase tracking-wider">Our Clients Section</h2>
          <button 
            type="submit" 
            disabled={savingOurClients} 
            className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            {savingOurClients ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            <span className="hidden sm:inline">Save Clients</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className={labelClass}>Heading</label>
            <input 
              className={fieldClass} 
              value={ourClientsForm.heading} 
              onChange={e => setOurClientsForm({...ourClientsForm, heading: e.target.value})} 
              placeholder="e.g. Our Valued Clients"
            />
          </div>
          <div>
            <label className={labelClass}>Subheading</label>
            <input 
              className={fieldClass} 
              value={ourClientsForm.subheading} 
              onChange={e => setOurClientsForm({...ourClientsForm, subheading: e.target.value})} 
              placeholder="e.g. Trusted by leading brands"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700">Client Logos</h3>
              <button 
                type="button" 
                onClick={() => setOurClientsForm({...ourClientsForm, clients: [...ourClientsForm.clients, {id: randomId(), name: "", imageSrc: "", imageAlt: "", width: DEFAULT_LOGO_WIDTH, height: DEFAULT_LOGO_HEIGHT}]})}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700"
              >
                Add Client Logo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ourClientsForm.clients.map((client, index) => (
                <div key={client.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-2">
                  <button 
                    type="button" 
                    onClick={() => setOurClientsForm({...ourClientsForm, clients: ourClientsForm.clients.filter((_, i) => i !== index)})}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                  <label className={labelClass}>Client Name</label>
                  <input className={fieldClass} value={client.name} onChange={e => updateClient(index, "name", e.target.value)} placeholder="e.g. Wellness Corp" />
                  <ImageUploadField 
                    label="Logo Image" 
                    value={client.imageSrc} 
                    fieldKey={`projects.clients.logo.${index}`} 
                    uploadingField={uploadingField} 
                    onUploadingChange={setUploadingField} 
                    onUpload={url => updateClient(index, "imageSrc", url)} 
                    onError={m => toast.error(m)} 
                  />
                  <label className={labelClass}>Image Alt Text</label>
                  <input className={fieldClass} value={client.imageAlt} onChange={e => updateClient(index, "imageAlt", e.target.value)} placeholder="e.g. Wellness Corp Logo" />
                  <div className="grid grid-cols-2 gap-2">
                    <label className={labelClass}>Width</label>
                    <input
                      type="number"
                      className={fieldClass}
                      value={client.width}
                      min={1}
                      onChange={e => {
                        const parsed = parseInt(e.target.value, 10);
                        updateClient(index, "width", Number.isNaN(parsed) ? DEFAULT_LOGO_WIDTH : Math.max(1, parsed));
                      }}
                    />
                    <label className={labelClass}>Height</label>
                    <input
                      type="number"
                      className={fieldClass}
                      value={client.height}
                      min={1}
                      onChange={e => {
                        const parsed = parseInt(e.target.value, 10);
                        updateClient(index, "height", Number.isNaN(parsed) ? DEFAULT_LOGO_HEIGHT : Math.max(1, parsed));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700">Trust Stats</h3>
              <button 
                type="button" 
                onClick={() => setOurClientsForm({...ourClientsForm, stats: [...ourClientsForm.stats, {id: randomId(), iconSrc: "", iconAlt: "", value: "", label: ""}]})}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700"
              >
                Add Trust Stat
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ourClientsForm.stats.map((stat, index) => (
                <div key={stat.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-2">
                  <button 
                    type="button" 
                    onClick={() => setOurClientsForm({...ourClientsForm, stats: ourClientsForm.stats.filter((_, i) => i !== index)})}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                  <label className={labelClass}>Value</label>
                  <input className={fieldClass} value={stat.value} onChange={e => updateStat(index, "value", e.target.value)} placeholder="e.g. 500+" />
                  <label className={labelClass}>Label</label>
                  <input className={fieldClass} value={stat.label} onChange={e => updateStat(index, "label", e.target.value)} placeholder="e.g. Projects Completed" />
                  <ImageUploadField 
                    label="Icon Image" 
                    value={stat.iconSrc} 
                    fieldKey={`projects.clients.stat.${index}`} 
                    uploadingField={uploadingField} 
                    onUploadingChange={setUploadingField} 
                    onUpload={url => updateStat(index, "iconSrc", url)} 
                    onError={m => toast.error(m)} 
                  />
                  <label className={labelClass}>Icon Alt Text</label>
                  <input className={fieldClass} value={stat.iconAlt} onChange={e => updateStat(index, "iconAlt", e.target.value)} placeholder="e.g. Projects Icon" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
      )}

      {/* Our Projects Section */}
      {activeTab === 'ourProjects' && (
        <form onSubmit={handleSaveOurProjects} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 text-xs sm:text-sm uppercase tracking-wider">Our Projects Section</h2>
            <button 
              type="submit" 
              disabled={savingOurProjects} 
              className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
            >
              {savingOurProjects ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
              <span className="hidden sm:inline">Save Projects</span>
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Section Title</label>
                <input 
                  className={fieldClass} 
                  value={ourProjectsForm.title} 
                  onChange={e => setOurProjectsForm({...ourProjectsForm, title: e.target.value})} 
                  placeholder="e.g. Our Latest Projects"
                />
              </div>
               <div>
                <label className={labelClass}>Button Text</label>
                <input 
                  className={fieldClass} 
                  value={ourProjectsForm.buttonText} 
                  onChange={e => setOurProjectsForm({...ourProjectsForm, buttonText: e.target.value})} 
                  placeholder="View All Projects"
                />
              </div>
                <div>
                <label className={labelClass}>Button Path</label>
                <input 
                  className={fieldClass} 
                  value={ourProjectsForm.buttonPath} 
                  onChange={e => setOurProjectsForm({...ourProjectsForm, buttonPath: e.target.value})} 
                  placeholder="View All Projects"
                />
              </div>
              <div>
                <label className={labelClass}>Section Subtitle</label>
                <input 
                  className={fieldClass} 
                  value={ourProjectsForm.subtitle} 
                  onChange={e => setOurProjectsForm({...ourProjectsForm, subtitle: e.target.value})} 
                  placeholder="e.g. Innovative solutions for our clients"
                />
              </div>
            </div>

            {/* Projects Summary List */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Current Projects Summary</h3>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                <table className="w-full text-left text-[11px] min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-tighter">
                    <tr>
                      <th className="px-4 py-3">Preview</th>
                      <th className="px-4 py-3">Project Title</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ourProjectsForm.cards.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No projects added yet. Use the button below to add your first project.</td>
                      </tr>
                    ) : (
                      ourProjectsForm.cards.map((card, index) => (
                        <tr key={card.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-4 py-2">
                            <div className="h-10 w-16 rounded bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                              {card.image.imageUrl && <Image src={card.image.imageUrl} alt={card.image.alt} width={64} height={40} className="object-cover" unoptimized />}
                            </div>
                          </td>
                          <td className="px-4 py-2 font-bold text-slate-700">{card.title || 'Untitled Project'}</td>
                          <td className="px-4 py-2 text-slate-500">{card.location || 'N/A'}</td>
                          <td className="px-4 py-2 text-right">
                            <button 
                              type="button" 
                              onClick={() => setOurProjectsForm({...ourProjectsForm, cards: ourProjectsForm.cards.filter((_, i) => i !== index)})}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove Project"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700">Project Cards</h3>
                <button 
                  type="button" 
                  onClick={() => setOurProjectsForm({...ourProjectsForm, cards: [...ourProjectsForm.cards, {id: randomId(), title: "", location: "", image: {imageUrl: "", alt: ""}}]})}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700"
                >
                  Add Project Card
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ourProjectsForm.cards.map((card, index) => (
                  <div key={card.id} className="p-4 border rounded-xl bg-slate-50 relative space-y-2">
                    <button 
                      type="button" 
                      onClick={() => setOurProjectsForm({...ourProjectsForm, cards: ourProjectsForm.cards.filter((_, i) => i !== index)})}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div>
                      <label className={labelClass}>Project Title</label>
                      <input className={fieldClass} value={card.title} onChange={e => updateProjectCard(index, "title", e.target.value)} placeholder="Project Name" />
                    </div>
                    <div>
                      <label className={labelClass}>Location</label>
                      <input className={fieldClass} value={card.location} onChange={e => updateProjectCard(index, "location", e.target.value)} placeholder="Location" />
                    </div>
                    <div className="pt-2 border-t border-slate-200 mt-2">
                      <ImageUploadField 
                        label="Project Image" 
                        value={card.image.imageUrl} 
                        fieldKey={`projects.ourProjects.card.${index}`} 
                        uploadingField={uploadingField} 
                        onUploadingChange={setUploadingField} 
                        onUpload={url => updateProjectCard(index, "image", {...card.image, imageUrl: url})} 
                        onError={m => toast.error(m)} 
                      />
                      <label className={labelClass + " mt-2"}>Image Alt Text</label>
                      <input className={fieldClass} value={card.image.alt} onChange={e => updateProjectCard(index, "image", {...card.image, alt: e.target.value})} placeholder="Alt text" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Contact Section */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSaveContactSection} className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 text-xs sm:text-sm uppercase tracking-wider">Contact Section</h2>
            <button 
              type="submit" 
              disabled={savingContact} 
              className="bg-[#1d5af2] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#154dc8] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20"
            >
              {savingContact ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
              <span className="hidden sm:inline">Save Contact</span>
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadField 
                label="Left Decorative Image" 
                value={contactForm.leftImage} 
                fieldKey="projects.contact.left" 
                uploadingField={uploadingField} 
                onUploadingChange={setUploadingField} 
                onUpload={url => setContactForm({...contactForm, leftImage: url})} 
                onError={m => toast.error(m)} 
              />
              <ImageUploadField 
                label="Right Decorative Image" 
                value={contactForm.rightImage} 
                fieldKey="projects.contact.right" 
                uploadingField={uploadingField} 
                onUploadingChange={setUploadingField} 
                onUpload={url => setContactForm({...contactForm, rightImage: url})} 
                onError={m => toast.error(m)} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700">Contact Information</h3>
                <div>
                  <label className={labelClass}>Office Name</label>
                  <input className={fieldClass} value={contactForm.contact.officeName} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, officeName: e.target.value}})} />
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <textarea className={fieldClass} value={contactForm.contact.address} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, address: e.target.value}})} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input className={fieldClass} value={contactForm.contact.phone} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, phone: e.target.value}})} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input className={fieldClass} value={contactForm.contact.email} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, email: e.target.value}})} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input className={fieldClass} value={contactForm.contact.website} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, website: e.target.value}})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Working Days</label>
                    <input className={fieldClass} value={contactForm.contact.workingDays} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, workingDays: e.target.value}})} placeholder="e.g. Mon - Sat" />
                  </div>
                  <div>
                    <label className={labelClass}>Working Hours</label>
                    <input className={fieldClass} value={contactForm.contact.workingHours} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, workingHours: e.target.value}})} placeholder="e.g. 09 AM - 06 PM" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700">Call to Action</h3>
                <div>
                  <label className={labelClass}>CTA Title</label>
                  <input className={fieldClass} value={contactForm.ctaTitle} onChange={e => setContactForm({...contactForm, ctaTitle: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>CTA Button Text</label>
                  <input className={fieldClass} value={contactForm.ctaButtonText} onChange={e => setContactForm({...contactForm, ctaButtonText: e.target.value})} />
                </div>
                    <div>
                  <label className={labelClass}>CTA Button Path</label>
                  <input className={fieldClass} value={contactForm.ctaButtonPath} onChange={e => setContactForm({...contactForm, ctaButtonPath: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>CTA Description</label>
                  <textarea className={fieldClass} value={contactForm.ctaDescription} onChange={e => setContactForm({...contactForm, ctaDescription: e.target.value})} rows={3} />
                </div>
                <div className="pt-2">
                  <label className={labelClass}>Section Quote</label>
                  <textarea className={fieldClass} value={contactForm.quote} onChange={e => setContactForm({...contactForm, quote: e.target.value})} rows={3} placeholder="Inspirational quote..." />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700">Testimonials</h3>
                <button 
                  type="button" 
                  onClick={() => setContactForm({...contactForm, testimonials: [...contactForm.testimonials, {id: randomId(), logo: "", company: "", person: "", designation: ""}]})}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700"
                >
                  Add Testimonial
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {contactForm.testimonials.map((t, idx) => (
                  <div key={t.id} className="p-4 border rounded-xl bg-slate-50 relative grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      type="button" 
                      onClick={() => setContactForm({...contactForm, testimonials: contactForm.testimonials.filter((_, i) => i !== idx)})}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ImageUploadField label="Company Logo" value={t.logo} fieldKey={`projects.contact.testimonial.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => updateTestimonial(idx, "logo", url)} onError={m => toast.error(m)} />
                    <div className="space-y-2">
                      <input className={fieldClass} value={t.company} onChange={e => updateTestimonial(idx, "company", e.target.value)} placeholder="Company Name" />
                      <input className={fieldClass} value={t.person} onChange={e => updateTestimonial(idx, "person", e.target.value)} placeholder="Person Name" />
                      <input className={fieldClass} value={t.designation} onChange={e => updateTestimonial(idx, "designation", e.target.value)} placeholder="Designation" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className={labelClass}>Bottom Text</label>
              <textarea className={fieldClass} value={contactForm.bottomText} onChange={e => setContactForm({...contactForm, bottomText: e.target.value})} rows={3} />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProjectAndClientManagement;