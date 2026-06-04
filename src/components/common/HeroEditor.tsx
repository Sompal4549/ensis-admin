"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, Plus, Trash2, Layout } from "lucide-react";
import RichTextEditor from "@/components/common/RichTextEditor";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";



export default function HeroEditor() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [content, setContent] = useState<ComponentContent | null>(null);

  // State management for the specialized form
  const [form, setForm] = useState({
    label: "",
    page: "",
    description: "",
    isActive: true,
    data: {
      slides: [{ title: "", highlight: "", description: "", image: "", primaryBtn: "" }]
    },
  });

  const loadContent = async () => {
    try {
      setLoading(true);
      // Direct fetch by key for efficiency
      const item = await componentContentApi.getByKey("home.hero");
      if (!item) {
        setMessage(`Component "home.hero" not found. Please seed default data.`);
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
      setMessage((error as Error).message);
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
      setMessage("");

      // Sending structured data directly to the backend
      await componentContentApi.update(content._id, {
        label: form.label,
        page: form.page,
        description: form.description,
        isActive: form.isActive,
        data: form.data, 
      });

      setMessage("Hero section updated successfully!");
    } catch (error) {
      setMessage((error as Error).message);
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
        slides: [...form.data.slides, { title: "", highlight: "", description: "", image: "", primaryBtn: "" }]
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
                <label className={labelClass}>Background Image URL <input className={`${fieldClass} mt-1`} value={slide.image} onChange={(e) => updateSlide(index, "image", e.target.value)} /></label>
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
            </div>
          ))}
        </section>

        {/* Footer Actions */}
        <div className="sticky bottom-4 bg-white/80 backdrop-blur p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-lg">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-[#6f542f] text-white px-8 py-3 rounded-lg font-bold hover:shadow-md transition-all disabled:opacity-50">
            <Save size={20} />
            {loading ? "Saving Changes..." : "Publish Updates"}
          </button>
          {message && (
            <span className={`text-sm font-bold ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}