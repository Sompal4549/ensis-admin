"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Loader2, Save, Trash2, Eye, Plus } from 'lucide-react';
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import Image from 'next/image';
import ComponentList from "@/components/common/ComponentList";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { DropResult } from "@hello-pangea/dnd";

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

export interface FeatureStripItem {
  id: string;
  title: string;
  description: string;
  image: {
    imageUrl: string;
    alt: string;
  };
}

export interface FeaturesStripContent {
  items: FeatureStripItem[];
}

// Default width/height so a freshly-added logo never reaches an
// <Image width={0} height={0} /> on the public-facing page before
// the admin fills in real values.
const DEFAULT_LOGO_WIDTH = 120;
const DEFAULT_LOGO_HEIGHT = 60;

const randomId = () => Math.random().toString(36).substring(2, 9);

// Compact shared styles
const cardClass = "p-2 border rounded-lg bg-slate-50 relative space-y-1.5";
const cardClassWhite = "p-2 border rounded-lg bg-white relative space-y-1.5 shadow-sm";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";
const sectionSubHeaderClass = "text-xs font-bold";
const addBtnClass = "bg-green-600 text-white px-2.5 py-1 rounded-lg text-[11px] hover:bg-green-700";
const formHeaderBtnClass = "bg-[#1d5af2] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-[#154dc8] transition-all disabled:opacity-50 cursor-pointer shadow shadow-blue-500/20";

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

const initialFeaturesStripForm: FeaturesStripContent = {
  items: [],
};

const ProjectAndClientManagement = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ComponentContent | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Separate "saving" flags per-section so saving one form doesn't
  // disable/spin the buttons on the other forms.
  const [savingBanner, setSavingBanner] = useState(false);
  const [savingOurClients, setSavingOurClients] = useState(false);
  const [savingWhyPartner, setSavingWhyPartner] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingOurProjects, setSavingOurProjects] = useState(false);
  const [savingFeaturesStrip, setSavingFeaturesStrip] = useState(false);

  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [pendingDelete, setPendingDelete] = useState<{ message: string; id: string } | null>(null);

  const knownKeys = [
    "projects.banner", "projects.whyPartner", "projects.ourProjects", "projects.ourClients", "projects.contactSection", "projects.features_strip"
  ];

  const [activeTab, setActiveTab] = useState<'banner' | 'whyPartner' | 'ourClients' | 'contact' | 'ourProjects' | 'featuresStrip'>('banner');

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
  const [featuresStripContent, setFeaturesStripContent] = useState<ComponentContent | null>(null);
  const [featuresStripForm, setFeaturesStripForm] = useState<FeaturesStripContent>(initialFeaturesStripForm);

  const loadContent = useCallback(async () => {
    setLoading(true);

    // Each section is fetched independently with its own try/catch so
    // that one missing/failing key (e.g. "projects.whyPartner" not yet
    // created in the backend) doesn't stop the other sections from
    // loading.

    try {
      const allRecords = await componentContentApi.list();
      setRecords(
        allRecords
          .filter(r => r.page === "projects")
          .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      );
    } catch (error) {
      console.error("Failed to load component list:", error);
    }

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

    try {
      const featuresStripItem = await componentContentApi.getByKey("projects.features_strip");
      if (featuresStripItem) {
        setFeaturesStripContent(featuresStripItem);
        const d = (featuresStripItem.data || {}) as Partial<FeaturesStripContent>;
        setFeaturesStripForm({
          items: d?.items || [],
        });
      }
    } catch (error) {
      console.error("Failed to load features strip section:", error);
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

  const handleSaveFeaturesStrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFeaturesStrip(true);
    try {
      const payload = {
        key: "projects.features_strip",
        label: "Projects Features Strip Section",
        page: "projects",
        isActive: true,
        data: featuresStripForm as any
      };

      if (featuresStripContent) {
        await componentContentApi.update(featuresStripContent._id, payload as any);
      } else {
        await componentContentApi.create(payload as any);
      }
      toast.success("Features Strip section saved successfully!");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to save Features Strip section");
    } finally {
      setSavingFeaturesStrip(false);
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

  const handleDeleteComponent = async (id: string) => {
    try {
      await componentContentApi.remove(id);
      toast.success("Component deleted successfully");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete component");
    }
  };

  const confirmDeleteClick = (id: string, message: string) => setPendingDelete({ id, message });

  const handleReorder = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(records);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setRecords(items);

    try {
      await Promise.all(
        items.map((item, index) =>
          componentContentApi.update(item._id, {
            key: item.key,
            label: item.label,
            page: item.page,
            description: item.description,
            data: item.data,
            isActive: item.isActive,
            index,
          })
        )
      );
      toast.success("Order updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
      loadContent();
    }
  };

  const handleEditComponent = (record: ComponentContent) => {
    const keyMap: Record<string, typeof activeTab> = {
      "projects.banner": "banner",
      "projects.whyPartner": "whyPartner",
      "projects.ourProjects": "ourProjects",
      "projects.ourClients": "ourClients",
      "projects.contactSection": "contact",
      "projects.features_strip": "featuresStrip"
    };

    if (keyMap[record.key]) {
      setActiveTab(keyMap[record.key]);
    } else {
      toast.info("This component key is not supported by the tabs.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-[#8d6a3a]" size={32} />
      </div>
    );
  }
  const currentEditingId = {
    banner: content?._id,
    whyPartner: whyPartnerContent?._id,
    ourProjects: ourProjectsContent?._id,
    ourClients: ourClientsContent?._id,
    contact: contactContent?._id,
    featuresStrip: featuresStripContent?._id
  }[activeTab];

  return (
    <div className="max-w-7xl mx-auto space-y-3 px-2 sm:px-2 lg:px-2 pb-3 text-sm">
      <div className="flex flex-col gap-2 bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-slate-100 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Projects & Clients</h2>
          <p className="text-[11px]">Manage your portfolio and client testimonials</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="block w-full sm:w-44 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold shadow-sm focus:border-[#1d5af2] focus:ring-1 focus:ring-[#1d5af2] transition-all"
          >
            <option value="banner">Banner</option>
            <option value="whyPartner">Why Partner</option>
            <option value="ourProjects">Our Projects</option>
            <option value="ourClients">Our Clients</option>
            <option value="contact">Contact Section</option>
            <option value="featuresStrip">Features Strip</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Sidebar: Component List */}
        {/* <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold  uppercase tracking-wider mb-4">Components</h3>
            <ComponentList 
              records={records}
              onEdit={handleEditComponent}
              onDelete={handleDeleteComponent}
              onReorder={handleReorder}
              editingId={currentEditingId}
              knownKeys={knownKeys}
            />
          </div>
        </div> */}

        {/* Main: Form Editor */}
        <div className="space-y-4">
      {activeTab === 'banner' && (
        <form onSubmit={handleSave} className="bg-white border rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="bg-slate-50 border-b p-2.5 px-4 flex items-center justify-between">
          <h2 className="font-bold text-xs uppercase tracking-wider">Banner Section</h2>
          <button 
            type="submit" 
            disabled={savingBanner} 
            className={formHeaderBtnClass}
          >
            {savingBanner ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} 
            <span className="hidden sm:inline">Save Banner</span>
          </button>
        </div>

        <div className="p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className={smallLabelClass}>Title Line 1
              <input 
                className={smallFieldClass} 
                value={form.title.line1} 
                onChange={e => setForm({...form, title: {...form.title, line1: e.target.value}})} 
                placeholder="e.g. Our Trusted"
                required
              />
            </label>
            <label className={smallLabelClass}>Title Line 2
              <input 
                className={smallFieldClass} 
                value={form.title.line2} 
                onChange={e => setForm({...form, title: {...form.title, line2: e.target.value}})} 
                placeholder="e.g. Partners"
              />
            </label>
            <label className={smallLabelClass}>Subtitle
              <input 
                className={smallFieldClass} 
                value={form.subtitle} 
                onChange={e => setForm({...form, subtitle: e.target.value})} 
                placeholder="e.g. Delivering excellence across industries"
              />
            </label>
            <label className={smallLabelClass}>Background Image Alt
              <input 
                className={smallFieldClass} 
                value={form.bgImageAlt} 
                onChange={e => setForm({...form, bgImageAlt: e.target.value})} 
                placeholder="e.g. Delivering excellence across industries"
              />
            </label>
            <label className={smallLabelClass}>Section Title
              <input 
                className={smallFieldClass} 
                value={form.sectionTitle} 
                onChange={e => setForm({...form, sectionTitle: e.target.value})} 
                placeholder="e.g. CLIENTS"
                required
              />
            </label>
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

          <div className="pt-2 border-t border-slate-100">
            <label className={smallLabelClass}>Description / Introduction</label>
            <div className="mt-1">
              <RichTextEditor 
                value={form.description} 
                onChange={val => setForm({...form, description: val})} 
                placeholder="Describe the projects and clients overview..."
                minHeight="140px" 
              />
            </div>
          </div>
        </div>
      </form>
      )}

      {/* Why Partner Section */}
      {activeTab === 'whyPartner' && (
        <form onSubmit={handleSaveWhyPartner} className="bg-white border rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="bg-slate-50 border-b p-2.5 px-4 flex items-center justify-between">
          <h2 className="font-bold text-xs uppercase tracking-wider">Why Partner Section</h2>
          <button 
            type="submit" 
            disabled={savingWhyPartner} 
            className={formHeaderBtnClass}
          >
            {savingWhyPartner ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} 
            <span className="hidden sm:inline">Save Why Partner</span>
          </button>
        </div>

        <div className="p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <label className={smallLabelClass}>Heading
              <input 
                className={smallFieldClass} 
                value={whyPartnerForm.heading} 
                onChange={e => setWhyPartnerForm({...whyPartnerForm, heading: e.target.value})} 
                placeholder="e.g. Why Partner With Ensis?"
              />
            </label>
            <ImageUploadField 
              label="Decorative Image" 
              value={whyPartnerForm.decorativeImageSrc} 
              fieldKey="projects.whyPartner.decorative" 
              uploadingField={uploadingField} 
              onUploadingChange={setUploadingField} 
              onUpload={url => setWhyPartnerForm({...whyPartnerForm, decorativeImageSrc: url})} 
              onError={m => toast.error(m)} 
            />
            <label className={smallLabelClass}>Decorative Image Alt Text
              <input 
                className={smallFieldClass} 
                value={whyPartnerForm.decorativeImageAlt} 
                onChange={e => setWhyPartnerForm({...whyPartnerForm, decorativeImageAlt: e.target.value})} 
                placeholder="Alt text"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className={sectionSubHeaderClass}>Partner Features</h3>
              <button 
                type="button" 
                onClick={() => setWhyPartnerForm({...whyPartnerForm, features: [...whyPartnerForm.features, {id: randomId(), iconSrc: "", iconAlt: "", title: "", description: ""}]})}
                className={addBtnClass}
              >
                + Add Feature
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {whyPartnerForm.features.map((feature, index) => (
                <div key={feature.id} className={cardClass}>
                  <button 
                    type="button" 
                    onClick={() => setWhyPartnerForm({...whyPartnerForm, features: whyPartnerForm.features.filter((_, i) => i !== index)})}
                    className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={12} />
                  </button>
                  <input className={smallFieldClass} value={feature.title} onChange={e => updatePartnerFeature(index, "title", e.target.value)} placeholder="Title" />
                  <ImageUploadField 
                    label="Feature Icon" 
                    value={feature.iconSrc} 
                    fieldKey={`projects.whyPartner.icon.${index}`} 
                    uploadingField={uploadingField} 
                    onUploadingChange={setUploadingField} 
                    onUpload={url => updatePartnerFeature(index, "iconSrc", url)} 
                    onError={m => toast.error(m)} 
                  />
                  <textarea className={smallFieldClass} value={feature.description} onChange={e => updatePartnerFeature(index, "description", e.target.value)} placeholder="Description" rows={2} />
                  <input className={smallFieldClass} value={feature.iconAlt} onChange={e => updatePartnerFeature(index, "iconAlt", e.target.value)} placeholder="Icon Alt text" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
      )}

      {/* Our Clients Section */}
      {activeTab === 'ourClients' && (
        <form onSubmit={handleSaveOurClients} className="bg-white border rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="bg-slate-50 border-b p-2.5 px-4 flex items-center justify-between">
          <h2 className="font-bold text-xs uppercase tracking-wider">Our Clients Section</h2>
          <button 
            type="submit" 
            disabled={savingOurClients} 
            className={formHeaderBtnClass}
          >
            {savingOurClients ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} 
            <span className="hidden sm:inline">Save Clients</span>
          </button>
        </div>

        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className={smallLabelClass}>Heading
              <input 
                className={smallFieldClass} 
                value={ourClientsForm.heading} 
                onChange={e => setOurClientsForm({...ourClientsForm, heading: e.target.value})} 
                placeholder="e.g. Our Valued Clients"
              />
            </label>
            <label className={smallLabelClass}>Subheading
              <input 
                className={smallFieldClass} 
                value={ourClientsForm.subheading} 
                onChange={e => setOurClientsForm({...ourClientsForm, subheading: e.target.value})} 
                placeholder="e.g. Trusted by leading brands"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className={sectionSubHeaderClass}>Client Logos</h3>
              <button 
                type="button" 
                onClick={() => setOurClientsForm({...ourClientsForm, clients: [...ourClientsForm.clients, {id: randomId(), name: "", imageSrc: "", imageAlt: "", width: DEFAULT_LOGO_WIDTH, height: DEFAULT_LOGO_HEIGHT}]})}
                className={addBtnClass}
              >
                + Add Client Logo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {ourClientsForm.clients.map((client, index) => (
                <div key={client.id} className={cardClass}>
                  <button 
                    type="button" 
                    onClick={() => setOurClientsForm({...ourClientsForm, clients: ourClientsForm.clients.filter((_, i) => i !== index)})}
                    className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={12} />
                  </button>
                  <input className={smallFieldClass} value={client.name} onChange={e => updateClient(index, "name", e.target.value)} placeholder="Client Name" />
                  <ImageUploadField 
                    label="Logo Image" 
                    value={client.imageSrc} 
                    fieldKey={`projects.clients.logo.${index}`} 
                    uploadingField={uploadingField} 
                    onUploadingChange={setUploadingField} 
                    onUpload={url => updateClient(index, "imageSrc", url)} 
                    onError={m => toast.error(m)} 
                  />
                  <input className={smallFieldClass} value={client.imageAlt} onChange={e => updateClient(index, "imageAlt", e.target.value)} placeholder="Image Alt Text" />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      className={smallFieldClass}
                      placeholder="Width"
                      value={client.width}
                      min={1}
                      onChange={e => {
                        const parsed = parseInt(e.target.value, 10);
                        updateClient(index, "width", Number.isNaN(parsed) ? DEFAULT_LOGO_WIDTH : Math.max(1, parsed));
                      }}
                    />
                    <input
                      type="number"
                      className={smallFieldClass}
                      placeholder="Height"
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

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className={sectionSubHeaderClass}>Trust Stats</h3>
              <button 
                type="button" 
                onClick={() => setOurClientsForm({...ourClientsForm, stats: [...ourClientsForm.stats, {id: randomId(), iconSrc: "", iconAlt: "", value: "", label: ""}]})}
                className={addBtnClass}
              >
                + Add Trust Stat
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {ourClientsForm.stats.map((stat, index) => (
                <div key={stat.id} className={cardClass}>
                  <button 
                    type="button" 
                    onClick={() => setOurClientsForm({...ourClientsForm, stats: ourClientsForm.stats.filter((_, i) => i !== index)})}
                    className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={12} />
                  </button>
                  <input className={smallFieldClass} value={stat.value} onChange={e => updateStat(index, "value", e.target.value)} placeholder="Value e.g. 500+" />
                  <input className={smallFieldClass} value={stat.label} onChange={e => updateStat(index, "label", e.target.value)} placeholder="Label" />
                  <ImageUploadField 
                    label="Icon Image" 
                    value={stat.iconSrc} 
                    fieldKey={`projects.clients.stat.${index}`} 
                    uploadingField={uploadingField} 
                    onUploadingChange={setUploadingField} 
                    onUpload={url => updateStat(index, "iconSrc", url)} 
                    onError={m => toast.error(m)} 
                  />
                  <input className={smallFieldClass} value={stat.iconAlt} onChange={e => updateStat(index, "iconAlt", e.target.value)} placeholder="Icon Alt Text" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
      )}

      {/* Our Projects Section */}
      {activeTab === 'ourProjects' && (
        <form onSubmit={handleSaveOurProjects} className="bg-white border rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-slate-50 border-b p-2.5 px-4 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">Our Projects Section</h2>
            <button 
              type="submit" 
              disabled={savingOurProjects} 
              className={formHeaderBtnClass}
            >
              {savingOurProjects ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} 
              <span className="hidden sm:inline">Save Projects</span>
            </button>
          </div>

          <div className="p-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <label className={smallLabelClass}>Section Title
                <input 
                  className={smallFieldClass} 
                  value={ourProjectsForm.title} 
                  onChange={e => setOurProjectsForm({...ourProjectsForm, title: e.target.value})} 
                  placeholder="e.g. Our Latest Projects"
                />
              </label>
              <label className={smallLabelClass}>Button Text
                <input 
                  className={smallFieldClass} 
                  value={ourProjectsForm.buttonText} 
                  onChange={e => setOurProjectsForm({...ourProjectsForm, buttonText: e.target.value})} 
                  placeholder="View All Projects"
                />
              </label>
              <label className={smallLabelClass}>Button Path
                <input 
                  className={smallFieldClass} 
                  value={ourProjectsForm.buttonPath} 
                  onChange={e => setOurProjectsForm({...ourProjectsForm, buttonPath: e.target.value})} 
                  placeholder="View All Projects"
                />
              </label>
              <label className={smallLabelClass}>Section Subtitle
                <input 
                  className={smallFieldClass} 
                  value={ourProjectsForm.subtitle} 
                  onChange={e => setOurProjectsForm({...ourProjectsForm, subtitle: e.target.value})} 
                  placeholder="e.g. Innovative solutions for our clients"
                />
              </label>
            </div>

            {/* Projects Summary List */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider">Current Projects Summary</h3>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-100 bg-white">
                <table className="w-full text-left text-[11px] min-w-[500px]">
                  <thead className="bg-slate-50  font-bold border-b border-slate-100 uppercase tracking-tighter">
                    <tr>
                      <th className="px-3 py-2">Preview</th>
                      <th className="px-3 py-2">Project Title</th>
                      <th className="px-3 py-2">Location</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ourProjectsForm.cards.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center italic">No projects added yet. Use the button below to add your first project.</td>
                      </tr>
                    ) : (
                      ourProjectsForm.cards.map((card, index) => (
                        <tr key={card.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-3 py-1.5">
                            <div className="h-8 w-14 rounded bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                              {card.image.imageUrl && <Image src={card.image.imageUrl} alt={card.image.alt} width={56} height={32} className="object-cover" unoptimized />}
                            </div>
                          </td>
                          <td className="px-3 py-1.5 font-bold">{card.title || 'Untitled Project'}</td>
                          <td className="px-3 py-1.5">{card.location || 'N/A'}</td>
                          <td className="px-3 py-1.5 text-right">
                            <button 
                              type="button" 
                              onClick={() => setOurProjectsForm({...ourProjectsForm, cards: ourProjectsForm.cards.filter((_, i) => i !== index)})}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove Project"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className={sectionSubHeaderClass}>Project Cards</h3>
                <button 
                  type="button" 
                  onClick={() => setOurProjectsForm({...ourProjectsForm, cards: [...ourProjectsForm.cards, {id: randomId(), title: "", location: "", image: {imageUrl: "", alt: ""}}]})}
                  className={addBtnClass}
                >
                  + Add Project Card
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {ourProjectsForm.cards.map((card, index) => (
                  <div key={card.id} className={cardClass}>
                    <button 
                      type="button" 
                      onClick={() => setOurProjectsForm({...ourProjectsForm, cards: ourProjectsForm.cards.filter((_, i) => i !== index)})}
                      className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </button>
                    <input className={smallFieldClass} value={card.title} onChange={e => updateProjectCard(index, "title", e.target.value)} placeholder="Project Name" />
                    <input className={smallFieldClass} value={card.location} onChange={e => updateProjectCard(index, "location", e.target.value)} placeholder="Location" />
                    <ImageUploadField 
                      label="Project Image" 
                      value={card.image.imageUrl} 
                      fieldKey={`projects.ourProjects.card.${index}`} 
                      uploadingField={uploadingField} 
                      onUploadingChange={setUploadingField} 
                      onUpload={url => updateProjectCard(index, "image", {...card.image, imageUrl: url})} 
                      onError={m => toast.error(m)} 
                    />
                    <input className={smallFieldClass} value={card.image.alt} onChange={e => updateProjectCard(index, "image", {...card.image, alt: e.target.value})} placeholder="Image Alt text" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Contact Section */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSaveContactSection} className="bg-white border rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-slate-50 border-b p-2.5 px-4 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">Contact Section</h2>
            <button 
              type="submit" 
              disabled={savingContact} 
              className={formHeaderBtnClass}
            >
              {savingContact ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} 
              <span className="hidden sm:inline">Save Contact</span>
            </button>
          </div>

          <div className="p-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <h3 className={sectionSubHeaderClass}>Contact Information</h3>
                <input className={smallFieldClass} placeholder="Office Name" value={contactForm.contact.officeName} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, officeName: e.target.value}})} />
                <textarea className={smallFieldClass} placeholder="Address" value={contactForm.contact.address} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, address: e.target.value}})} rows={2} />
                <div className="grid grid-cols-2 gap-2">
                  <input className={smallFieldClass} placeholder="Phone" value={contactForm.contact.phone} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, phone: e.target.value}})} />
                  <input className={smallFieldClass} placeholder="Email" value={contactForm.contact.email} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, email: e.target.value}})} />
                </div>
                <input className={smallFieldClass} placeholder="Website" value={contactForm.contact.website} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, website: e.target.value}})} />
                <div className="grid grid-cols-2 gap-2">
                  <input className={smallFieldClass} value={contactForm.contact.workingDays} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, workingDays: e.target.value}})} placeholder="e.g. Mon - Sat" />
                  <input className={smallFieldClass} value={contactForm.contact.workingHours} onChange={e => setContactForm({...contactForm, contact: {...contactForm.contact, workingHours: e.target.value}})} placeholder="e.g. 09 AM - 06 PM" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className={sectionSubHeaderClass}>Call to Action</h3>
                <input className={smallFieldClass} placeholder="CTA Title" value={contactForm.ctaTitle} onChange={e => setContactForm({...contactForm, ctaTitle: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <input className={smallFieldClass} placeholder="CTA Button Text" value={contactForm.ctaButtonText} onChange={e => setContactForm({...contactForm, ctaButtonText: e.target.value})} />
                  <input className={smallFieldClass} placeholder="CTA Button Path" value={contactForm.ctaButtonPath} onChange={e => setContactForm({...contactForm, ctaButtonPath: e.target.value})} />
                </div>
                <textarea className={smallFieldClass} placeholder="CTA Description" value={contactForm.ctaDescription} onChange={e => setContactForm({...contactForm, ctaDescription: e.target.value})} rows={2} />
                <textarea className={smallFieldClass} value={contactForm.quote} onChange={e => setContactForm({...contactForm, quote: e.target.value})} rows={2} placeholder="Section Quote / Inspirational quote..." />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className={sectionSubHeaderClass}>Testimonials</h3>
                <button 
                  type="button" 
                  onClick={() => setContactForm({...contactForm, testimonials: [...contactForm.testimonials, {id: randomId(), logo: "", company: "", person: "", designation: ""}]})}
                  className={addBtnClass}
                >
                  + Add Testimonial
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {contactForm.testimonials.map((t, idx) => (
                  <div key={t.id} className={cardClass}>
                    <button 
                      type="button" 
                      onClick={() => setContactForm({...contactForm, testimonials: contactForm.testimonials.filter((_, i) => i !== idx)})}
                      className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </button>
                    <ImageUploadField label="Company Logo" value={t.logo} fieldKey={`projects.contact.testimonial.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onUpload={url => updateTestimonial(idx, "logo", url)} onError={m => toast.error(m)} />
                    <input className={smallFieldClass} value={t.company} onChange={e => updateTestimonial(idx, "company", e.target.value)} placeholder="Company Name" />
                    <input className={smallFieldClass} value={t.person} onChange={e => updateTestimonial(idx, "person", e.target.value)} placeholder="Person Name" />
                    <input className={smallFieldClass} value={t.designation} onChange={e => updateTestimonial(idx, "designation", e.target.value)} placeholder="Designation" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className={smallLabelClass}>Bottom Text</label>
              <textarea className={smallFieldClass} value={contactForm.bottomText} onChange={e => setContactForm({...contactForm, bottomText: e.target.value})} rows={2} />
            </div>
          </div>
        </form>
      )}

      {/* Features Strip Section */}
      {activeTab === 'featuresStrip' && (
        <form onSubmit={handleSaveFeaturesStrip} className="bg-white border rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="bg-slate-50 border-b p-2.5 px-4 flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider">Features Strip Section</h2>
            <button
              type="submit"
              disabled={savingFeaturesStrip}
              className={formHeaderBtnClass}
            >
              {savingFeaturesStrip ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              <span className="hidden sm:inline">Save Features Strip</span>
            </button>
          </div>

          <div className="p-3 space-y-2">
            <h4 className="text-[11px] font-bold text-[#8d6a3a] uppercase">
              Features Strip Items
            </h4>

            <div className="grid grid-cols-3 gap-2">
              {featuresStripForm.items.map((item, idx) => (
                <div
                  key={item.id}
                  className={cardClassWhite}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const ni = featuresStripForm.items.filter((_, i) => i !== idx);
                      setFeaturesStripForm({ ...featuresStripForm, items: ni });
                    }}
                    className="absolute top-1 right-1 text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>

                  <ImageUploadField
                    label="Image"
                    value={item.image.imageUrl}
                    fieldKey={`fstrip.${idx}`}
                    uploadingField={uploadingField}
                    onUploadingChange={setUploadingField}
                    onError={(m) => toast.error(m)}
                    onUpload={(url) => {
                      const ni = [...featuresStripForm.items];

                      ni[idx] = {
                        ...ni[idx],
                        image: {
                          ...ni[idx].image,
                          imageUrl: url,
                        },
                      };

                      setFeaturesStripForm({ ...featuresStripForm, items: ni });
                    }}
                  />

                  <input
                    className={smallFieldClass}
                    value={item.image.alt || ''}
                    placeholder="Image Alt Text"
                    onChange={(e) => {
                      const ni = [...featuresStripForm.items];

                      ni[idx] = {
                        ...ni[idx],
                        image: {
                          ...ni[idx].image,
                          alt: e.target.value,
                        },
                      };

                      setFeaturesStripForm({ ...featuresStripForm, items: ni });
                    }}
                  />

                  <input
                    className={smallFieldClass}
                    value={item.title}
                    placeholder="Title"
                    onChange={(e) => {
                      const ni = [...featuresStripForm.items];

                      ni[idx] = {
                        ...ni[idx],
                        title: e.target.value,
                      };

                      setFeaturesStripForm({ ...featuresStripForm, items: ni });
                    }}
                  />

                  <textarea
                    className={smallFieldClass}
                    rows={2}
                    value={item.description}
                    placeholder="Description"
                    onChange={(e) => {
                      const ni = [...featuresStripForm.items];

                      ni[idx] = {
                        ...ni[idx],
                        description: e.target.value,
                      };

                      setFeaturesStripForm({ ...featuresStripForm, items: ni });
                    }}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setFeaturesStripForm({
                    ...featuresStripForm,
                    items: [
                      ...featuresStripForm.items,
                      {
                        id: randomId(),
                        title: '',
                        description: '',
                        image: {
                          imageUrl: '',
                          alt: '',
                        },
                      },
                    ],
                  })
                }
                className="border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 py-6 hover:bg-gray-50 transition-colors"
              >
                <Plus size={20} />
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

export default ProjectAndClientManagement;