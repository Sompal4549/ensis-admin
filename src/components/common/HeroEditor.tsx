"use client";

import { toast } from "react-toastify";
import { FormEvent, useEffect, useState } from "react";
import { Save, Plus, Trash2, Layout } from "lucide-react";
import RichTextEditor from "@/components/common/RichTextEditor";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "./ImageUploadField";



export default function HeroEditor() {
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [content, setContent] = useState<ComponentContent | null>(null);

  // State management for the specialized form
  const [form, setForm] = useState({
    label: "",
    page: "",
    description: "",
    isActive: true,
    data: {
      slides: [{ title: "", highlight: "", description: "", image: "", primaryBtn: "", features: [] as { imgUrl: string; title: string }[] }]
    },
  });

  const loadContent = async () => {
    try {
      setLoading(true);
      // Direct fetch by key for efficiency
      const item = await componentContentApi.getByKey("home.hero");
      if (!item) {
        toast.error(`Component "home.hero" not found.`);
        return;
      }
      setContent(item);
      setForm({
        label: item.label || "",
        page: item.page || "",
        description: item.description || "",
        isActive: item.isActive,
        data: { ...form.data, ...(item.data || {}) },
      });
    } catch (error) {
      toast.error((error as Error).message || "Failed to load hero content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content) return;

    try {
      setLoading(true);

      // Sending structured data directly to the backend
      await componentContentApi.update(content._id, {
        label: form.label,
        page: form.page,
        description: form.description,
        isActive: form.isActive,
        data: form.data, 
      });

      toast.success("Hero section updated successfully!");
    } catch (error) {
      toast.error((error as Error).message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Helpers for managing the dynamic slides array
  const addSlide = () => {
    setForm({
      ...form,
      data: {
        ...form.data,
        slides: [...form.data.slides, { title: "", highlight: "", description: "", image: "", primaryBtn: "", features: [] as { imgUrl: string; title: string }[] }]
      }
    });
  };

  const removeSlide = (index: number) => {
    const newSlides = [...form.data.slides];
    newSlides.splice(index, 1);
    setForm({ ...form, data: { ...form.data, slides: newSlides } });
  };

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...form.data.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setForm({ ...form, data: { ...form.data, slides: newSlides } });
  };

  const addFeature = (slideIndex: number) => {
    const newSlides = [...form.data.slides];
    const features = [...(newSlides[slideIndex].features || [])];
    features.push({ imgUrl: "", title: "" });
    newSlides[slideIndex] = { ...newSlides[slideIndex], features };
    setForm({ ...form, data: { ...form.data, slides: newSlides } });
  };

  const updateFeature = (slideIndex: number, featureIndex: number, field: string, value: string) => {
    const newSlides = [...form.data.slides];
    const features = [...(newSlides[slideIndex].features || [])];
    features[featureIndex] = { ...features[featureIndex], [field]: value };
    newSlides[slideIndex] = { ...newSlides[slideIndex], features };
    setForm({ ...form, data: { ...form.data, slides: newSlides } });
  };

  if (loading && !content) return <div className="p-10 text-center">Loading Hero Data...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Hero Section Editor</h1>
        <p className="text-sm text-gray-500">Manage your homepage sliders and main call-to-actions.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Component Settings */}
        <section className="bg-white p-6 rounded-xl border border-[#ded3c4] shadow-sm">
          <h2 className="text-sm font-bold uppercase text-[#8d6a3a] mb-4 border-b pb-2">Internal Metadata</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Label <input className={`${fieldClass} mt-2`} value={form.label} onChange={(e) => setForm({...form, label: e.target.value})} /></label>
            <label className={labelClass}>Status <div className="mt-2 flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} /> <span className="text-sm">Active</span></div></label>
          </div>
        </section>

        {/* Slide List */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-700">Slider Content</h2>
            <button type="button" onClick={addSlide} className="flex items-center gap-2 bg-[#6f542f] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#5a4325] transition-all">
              <Plus size={16} /> Add New Slide
            </button>
          </div>

          {form.data.slides.map((slide, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <button type="button" onClick={() => removeSlide(index)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={20} />
              </button>
              
              <div className="grid gap-4 md:grid-cols-2">
                <label className={labelClass}>Main Title <input className={`${fieldClass} mt-1`} value={slide.title} onChange={(e) => updateSlide(index, "title", e.target.value)} /></label>
                <label className={labelClass}>Highlight Text <input className={`${fieldClass} mt-1`} value={slide.highlight} onChange={(e) => updateSlide(index, "highlight", e.target.value)} /></label>
                <ImageUploadField 
                  label="Background Image" 
                  value={slide.image} 
                  fieldKey={`hero-slide-bg-${index}`} 
                  uploadingField={uploadingField} 
                  onUploadingChange={setUploadingField} 
                  onError={(m) => toast.error(m)} 
                  onUpload={(url) => updateSlide(index, "image", url)} 
                />
                <label className={labelClass}>Button Text <input className={`${fieldClass} mt-1`} value={slide.primaryBtn} onChange={(e) => updateSlide(index, "primaryBtn", e.target.value)} /></label>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Slide Description</label>
                <RichTextEditor
                  value={slide.description}
                  onChange={(val: string) => updateSlide(index, "description", val)}
                  placeholder="Enter slide description..."
                  minHeight="120px"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Slide Features</h3>
                  <button type="button" onClick={() => addFeature(index)} className="flex items-center gap-1 bg-gray-100 text-[#8d6a3a] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all">
                    <Plus size={14} /> Add Feature
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(slide.features || []).map((feature: any, fIdx: number) => (
                    <div key={fIdx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                      <button type="button" onClick={() => {
                        const newSlides = [...form.data.slides];
                        newSlides[index].features = slide.features?.filter((_: any, i: number) => i !== fIdx);
                        setForm({ ...form, data: { ...form.data, slides: newSlides } });
                      }} className="absolute -top-2 -right-2 bg-white text-red-400 p-1.5 rounded-full border border-red-50 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <Trash2 size={12} />
                      </button>
                      <div className="space-y-3">
                        <ImageUploadField 
                          label="Icon" 
                          value={feature.imgUrl} 
                          fieldKey={`feat-icon-${index}-${fIdx}`} 
                          uploadingField={uploadingField} 
                          onUploadingChange={setUploadingField} 
                          onError={(m) => toast.error(m)} 
                          onUpload={(url) => updateFeature(index, fIdx, "imgUrl", url)} 
                        />
                        <label className={labelClass}>Label <input className={`${fieldClass} mt-1`} value={feature.title} onChange={(e) => updateFeature(index, fIdx, "title", e.target.value)} /></label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Footer Actions */}
        <div className="sticky bottom-4 bg-white/80 backdrop-blur p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-lg">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-[#6f542f] text-white px-8 py-3 rounded-lg font-bold hover:shadow-md transition-all disabled:opacity-50">
            <Save size={20} />
            {loading ? "Saving Changes..." : "Publish Updates"}
          </button>
        </div>
      </form>
    </div>
  );
}