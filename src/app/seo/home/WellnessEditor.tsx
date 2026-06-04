"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";

export default function WellnessEditor() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [content, setContent] = useState<ComponentContent | null>(null);

  const [form, setForm] = useState({
    label: "",
    page: "",
    description: "",
    isActive: true,
    data: {
      welcomeImage: "",
      eyebrow: "",
      heading: "",
      description: "",
      buttonText: "",
      buttonHref: "",
      services: [] as any[]
    },
  });

  const loadContent = async () => {
    try {
      setLoading(true);
      const item = await componentContentApi.getByKey("home.wellnessSection");
      if (!item) return;
      setContent(item);
      setForm({
        label: item.label || "",
        page: item.page || "",
        description: item.description || "",
        isActive: item.isActive,
        data: item.data || { services: [] },
      });
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContent(); }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content) return;
    try {
      setLoading(true);
      await componentContentApi.update(content._id, { ...form });
      setMessage("Wellness section updated!");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to update root data fields
  const updateData = (field: string, value: any) => {
    setForm({ ...form, data: { ...form.data, [field]: value } });
  };

  // Helper to update specific items in the services array
  const updateService = (index: number, field: string, value: string) => {
    const newServices = [...form.data.services];
    newServices[index] = { ...newServices[index], [field]: value };
    updateData("services", newServices);
  };

  if (loading && !content) return <div className="p-10">Loading Wellness Data...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Wellness Section</h1>
        <p className="text-sm text-gray-500">Edit the intro section and the featured service grid.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Intro Configuration */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-bold uppercase text-[#8d6a3a] mb-4 border-b pb-2">Section Header</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>Welcome Image <input className={`${fieldClass} mt-1`} value={form.data.welcomeImage} onChange={(e) => updateData("welcomeImage", e.target.value)} /></label>
            <label className={labelClass}>Eyebrow Text <input className={`${fieldClass} mt-1`} value={form.data.eyebrow} onChange={(e) => updateData("eyebrow", e.target.value)} /></label>
            <label className={labelClass}>Heading <input className={`${fieldClass} mt-1`} value={form.data.heading} onChange={(e) => updateData("heading", e.target.value)} /></label>
            <div className="grid grid-cols-2 gap-2">
              <label className={labelClass}>Button Text <input className={`${fieldClass} mt-1`} value={form.data.buttonText} onChange={(e) => updateData("buttonText", e.target.value)} /></label>
              <label className={labelClass}>Button Link <input className={`${fieldClass} mt-1`} value={form.data.buttonHref} onChange={(e) => updateData("buttonHref", e.target.value)} /></label>
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Intro Description</label>
            <textarea className={`${fieldClass} mt-1 h-24`} value={form.data.description} onChange={(e) => updateData("description", e.target.value)} />
          </div>
        </div>

        {/* Services Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-700">Services Grid</h2>
            <button type="button" onClick={() => updateData("services", [...form.data.services, { title: "", image: "", description: "" }])} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              Add Service Card
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {form.data.services.map((service, index) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 relative shadow-sm">
                <button type="button" onClick={() => {
                  const s = [...form.data.services]; s.splice(index, 1); updateData("services", s);
                }} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
                <label className={labelClass}>Title <input className={`${fieldClass} mt-1`} value={service.title} onChange={(e) => updateService(index, "title", e.target.value)} /></label>
                <label className={`${labelClass} mt-3`}>Icon/Image <input className={`${fieldClass} mt-1`} value={service.image} onChange={(e) => updateService(index, "image", e.target.value)} /></label>
                <label className={`${labelClass} mt-3`}>Description <textarea className={`${fieldClass} mt-1 h-16`} value={service.description} onChange={(e) => updateService(index, "description", e.target.value)} /></label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-6">
          <button type="submit" disabled={loading} className="bg-[#6f542f] text-white px-10 py-3 rounded-lg font-bold hover:shadow-lg transition-all">
            Save Changes
          </button>
          {message && <span className="text-sm font-semibold text-[#6f542f]">{message}</span>}
        </div>
      </form>
    </div>
  );
}