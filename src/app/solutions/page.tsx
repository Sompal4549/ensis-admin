"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Loader2,
  Plus,
  Save,
  FileText,
  Edit2,
  Trash2,
  ArrowRight,
  BedDouble,
  ClipboardCheck,
  Droplets,
  Flower2,
  Frame,
  HandHeart,
  HardHat,
  Lamp,
  LayoutGrid,
  Leaf,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowRight,
  BedDouble,
  ClipboardCheck,
  Droplets,
  Flower2,
  Frame,
  HandHeart,
  HardHat,
  Lamp,
  LayoutGrid,
  Leaf,
  Settings,
  Sparkles,
};

const ICON_NAMES = Object.keys(ICON_MAP);

function IconPreview({ name }: { name: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <span className="text-xs text-gray-400">?</span>;
  return <Icon size={18} strokeWidth={1.5} className="text-[#8d6a3a]" />;
}

function IconInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50">
        <IconPreview name={value} />
      </div>
      <input
        className={fieldClass}
        placeholder={placeholder || "Icon name"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list="icon-options"
      />
      <datalist id="icon-options">
        {ICON_NAMES.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </div>
  );
}

interface Solution {
  _id?: string;
  title: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  orderBy: number;
  viewCount: number;
  robots: string;
  hero: {
    eyebrow: string;
    heading: string[];
    description: string;
    primaryCta: { text: string; url: string };
    secondaryCta: { text: string; url: string };
    image: string;
    imageAlt: string;
  };
  stats: { icon: string; top: string; text: string }[];
  approach: {
    eyebrow: string;
    heading: string;
    description: string;
    image: string;
    imageAlt: string;
  };
  spaces: {
    eyebrow: string;
    heading: string;
    description: string;
    items: { title: string; text: string; icon: string }[];
  };
  services: { title: string; text: string; icon: string }[];
  process: { number: string; title: string; text: string }[];
  cta: {
    eyebrow: string;
    heading: string[];
    description: string;
    buttonText: string;
    image: string;
    imageAlt: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonical: string;
    ogJson: string;
    schema: string;
  };
}

const empty = (): Solution => ({
  title: "",
  slug: "",
  isActive: true,
  isFeatured: false,
  orderBy: 0,
  viewCount: 0,
  robots: "index, follow",
  hero: {
    eyebrow: "",
    heading: ["", ""],
    description: "",
    primaryCta: { text: "", url: "" },
    secondaryCta: { text: "", url: "" },
    image: "",
    imageAlt: "",
  },
  stats: [],
  approach: { eyebrow: "", heading: "", description: "", image: "", imageAlt: "" },
  spaces: { eyebrow: "", heading: "", description: "", items: [] },
  services: [],
  process: [],
  cta: {
    eyebrow: "",
    heading: ["", ""],
    description: "",
    buttonText: "",
    image: "",
    imageAlt: "",
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonical: "",
    ogJson: "",
    schema: "",
  },
});

type Tab = "basic" | "approach" | "spaces" | "services" | "cta" | "seo";
const TABS: { key: Tab; label: string }[] = [
  { key: "basic", label: "Basic & Hero" },
  { key: "approach", label: "Approach" },
  { key: "spaces", label: "Spaces" },
  { key: "services", label: "Services & Process" },
  { key: "cta", label: "CTA" },
  { key: "seo", label: "SEO" },
];

export default function SolutionsPage() {
  const [loading, setLoading] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [form, setForm] = useState<Solution>(empty());
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      const res = await api.get("/solutions");
      setSolutions(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch solutions");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        slug:
          form.slug ||
          form.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, ""),
      };
      if (editingId) {
        await api.put(`/solutions/${editingId}`, payload);
        toast.success("Updated!");
      } else {
        await api.post("/solutions", payload);
        toast.success("Created!");
      }
      setForm(empty());
      setEditingId(null);
      setActiveTab("basic");
      fetchSolutions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s: Solution) => {
    setEditingId(s._id!);
    setForm({
      ...empty(),
      ...s,
      hero: { ...empty().hero, ...s.hero },
      approach: { ...empty().approach, ...s.approach },
      spaces: {
        ...empty().spaces,
        ...s.spaces,
        items: s.spaces?.items || [],
      },
      cta: { ...empty().cta, ...s.cta },
      seo: { ...empty().seo, ...s.seo },
    });
    setActiveTab("basic");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this solution?")) return;
    try {
      await api.delete(`/solutions/${id}`);
      toast.success("Deleted!");
      fetchSolutions();
    } catch {
      toast.error("Delete failed");
    }
  };

  const set = (path: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (Array.isArray(obj[keys[i]])) obj[keys[i]] = [...obj[keys[i]]];
        else obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // ─── TABS ───────────────────────────────────────────────────────

  const BasicTab = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase text-[#8d6a3a]">
          Basic Info
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <label className={labelClass}>
            Title
            <input
              className={fieldClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <label className={labelClass}>
            Slug
            <input
              className={fieldClass}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
          </label>
        </div>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
            />
            Active
          </label>
          <label className={labelClass + " !mb-0"}>
            Order By
            <input
              type="number"
              className={fieldClass + " !w-24"}
              value={form.orderBy}
              onChange={(e) => set("orderBy", Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* Hero Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase text-[#8d6a3a]">
          Hero Section
        </h4>
        <label className={labelClass}>
          Eyebrow
          <input
            className={fieldClass}
            value={form.hero.eyebrow}
            onChange={(e) => set("hero.eyebrow", e.target.value)}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className={labelClass}>
            Heading 1
            <input
              className={fieldClass}
              value={form.hero.heading[0] || ""}
              onChange={(e) =>
                set("hero.heading", [
                  e.target.value,
                  form.hero.heading[1] || "",
                ])
              }
            />
          </label>
          <label className={labelClass}>
            Heading 2
            <input
              className={fieldClass}
              value={form.hero.heading[1] || ""}
              onChange={(e) =>
                set("hero.heading", [
                  form.hero.heading[0] || "",
                  e.target.value,
                ])
              }
            />
          </label>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Description</label>
          <RichTextEditor
            value={form.hero.description}
            onChange={(v) => set("hero.description", v)}
            minHeight="150px"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 p-3 border rounded-lg bg-slate-50">
            <label className={labelClass}>
              Primary CTA Text
              <input
                className={fieldClass}
                value={form.hero.primaryCta.text}
                onChange={(e) =>
                  set("hero.primaryCta", {
                    ...form.hero.primaryCta,
                    text: e.target.value,
                  })
                }
              />
            </label>
            <label className={labelClass}>
              Primary CTA URL
              <input
                className={fieldClass}
                value={form.hero.primaryCta.url}
                onChange={(e) =>
                  set("hero.primaryCta", {
                    ...form.hero.primaryCta,
                    url: e.target.value,
                  })
                }
                placeholder="/enquiry"
              />
            </label>
          </div>
          <div className="space-y-2 p-3 border rounded-lg bg-slate-50">
            <label className={labelClass}>
              Secondary CTA Text
              <input
                className={fieldClass}
                value={form.hero.secondaryCta.text}
                onChange={(e) =>
                  set("hero.secondaryCta", {
                    ...form.hero.secondaryCta,
                    text: e.target.value,
                  })
                }
              />
            </label>
            <label className={labelClass}>
              Secondary CTA URL
              <input
                className={fieldClass}
                value={form.hero.secondaryCta.url}
                onChange={(e) =>
                  set("hero.secondaryCta", {
                    ...form.hero.secondaryCta,
                    url: e.target.value,
                  })
                }
                placeholder="#approach"
              />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ImageUploadField
            label="Hero Image"
            value={form.hero.image}
            fieldKey="sol.hero"
            uploadingField={uploadingField}
            onUploadingChange={setUploadingField}
            onUpload={(url) => set("hero.image", url)}
            onError={(m) => toast.error(m)}
          />
          <label className={labelClass}>
            Image Alt
            <input
              className={fieldClass}
              value={form.hero.imageAlt}
              onChange={(e) => set("hero.imageAlt", e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  );

  const ApproachTab = () => (
    <div className="space-y-4">
      <label className={labelClass}>
        Eyebrow
        <input
          className={fieldClass}
          value={form.approach.eyebrow}
          onChange={(e) => set("approach.eyebrow", e.target.value)}
        />
      </label>
      <label className={labelClass}>
        Heading
        <input
          className={fieldClass}
          value={form.approach.heading}
          onChange={(e) => set("approach.heading", e.target.value)}
        />
      </label>
      <div className="space-y-1">
        <label className={labelClass}>Description</label>
        <RichTextEditor
          value={form.approach.description}
          onChange={(v) => set("approach.description", v)}
          minHeight="150px"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ImageUploadField
          label="Approach Image"
          value={form.approach.image}
          fieldKey="sol.approach"
          uploadingField={uploadingField}
          onUploadingChange={setUploadingField}
          onUpload={(url) => set("approach.image", url)}
          onError={(m) => toast.error(m)}
        />
        <label className={labelClass}>
          Image Alt
          <input
            className={fieldClass}
            value={form.approach.imageAlt}
            onChange={(e) => set("approach.imageAlt", e.target.value)}
          />
        </label>
      </div>
    </div>
  );

  const SpacesTab = () => (
    <div className="space-y-4">
      <label className={labelClass}>
        Eyebrow
        <input
          className={fieldClass}
          value={form.spaces.eyebrow}
          onChange={(e) => set("spaces.eyebrow", e.target.value)}
        />
      </label>
      <label className={labelClass}>
        Heading
        <input
          className={fieldClass}
          value={form.spaces.heading}
          onChange={(e) => set("spaces.heading", e.target.value)}
        />
      </label>
      <div className="space-y-1">
        <label className={labelClass}>Description</label>
        <RichTextEditor
          value={form.spaces.description}
          onChange={(v) => set("spaces.description", v)}
          minHeight="120px"
        />
      </div>
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase">Items</h4>
        <button
          type="button"
          onClick={() =>
            set("spaces.items", [
              ...form.spaces.items,
              { title: "", text: "", icon: "BedDouble" },
            ])
          }
          className="text-xs text-blue-600"
        >
          + Add
        </button>
      </div>
      {form.spaces.items.map((item, i) => (
        <div key={i} className="p-3 border rounded-lg space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              className={fieldClass}
              placeholder="Title"
              value={item.title}
              onChange={(e) => {
                const n = [...form.spaces.items];
                n[i] = { ...n[i], title: e.target.value };
                set("spaces.items", n);
              }}
            />
            <IconInput
              value={item.icon}
              onChange={(v) => {
                const n = [...form.spaces.items];
                n[i] = { ...n[i], icon: v };
                set("spaces.items", n);
              }}
              placeholder="Icon"
            />
          </div>
          <RichTextEditor
            value={item.text}
            onChange={(v) => {
              const n = [...form.spaces.items];
              n[i] = { ...n[i], text: v };
              set("spaces.items", n);
            }}
            minHeight="80px"
          />
          <button
            type="button"
            onClick={() =>
              set(
                "spaces.items",
                form.spaces.items.filter((_, j) => j !== i)
              )
            }
            className="text-xs text-red-500"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );

  const ServicesProcessTab = () => (
    <div className="space-y-6">
      {/* Services */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase text-[#8d6a3a]">
            Services
          </h4>
          <button
            type="button"
            onClick={() =>
              set("services", [
                ...form.services,
                { title: "", text: "", icon: "ClipboardCheck" },
              ])
            }
            className="text-xs text-blue-600"
          >
            + Add
          </button>
        </div>
        {form.services.map((s, i) => (
          <div key={i} className="p-3 border rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                className={fieldClass}
                placeholder="Title"
                value={s.title}
                onChange={(e) => {
                  const n = [...form.services];
                  n[i] = { ...n[i], title: e.target.value };
                  set("services", n);
                }}
              />
              <IconInput
                value={s.icon}
                onChange={(v) => {
                  const n = [...form.services];
                  n[i] = { ...n[i], icon: v };
                  set("services", n);
                }}
                placeholder="Icon"
              />
            </div>
            <RichTextEditor
              value={s.text}
              onChange={(v) => {
                const n = [...form.services];
                n[i] = { ...n[i], text: v };
                set("services", n);
              }}
              minHeight="80px"
            />
            <button
              type="button"
              onClick={() =>
                set(
                  "services",
                  form.services.filter((_, j) => j !== i)
                )
              }
              className="text-xs text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <hr className="border-gray-200" />

      {/* Process */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase text-[#8d6a3a]">
            Process Steps
          </h4>
          <button
            type="button"
            onClick={() =>
              set("process", [
                ...form.process,
                {
                  number: String(form.process.length + 1).padStart(2, "0"),
                  title: "",
                  text: "",
                },
              ])
            }
            className="text-xs text-blue-600"
          >
            + Add
          </button>
        </div>
        {form.process.map((p, i) => (
          <div key={i} className="p-3 border rounded-lg space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <input
                className={fieldClass}
                placeholder="01"
                value={p.number}
                onChange={(e) => {
                  const n = [...form.process];
                  n[i] = { ...n[i], number: e.target.value };
                  set("process", n);
                }}
              />
              <input
                className={fieldClass + " col-span-2"}
                placeholder="Title"
                value={p.title}
                onChange={(e) => {
                  const n = [...form.process];
                  n[i] = { ...n[i], title: e.target.value };
                  set("process", n);
                }}
              />
            </div>
            <RichTextEditor
              value={p.text}
              onChange={(v) => {
                const n = [...form.process];
                n[i] = { ...n[i], text: v };
                set("process", n);
              }}
              minHeight="80px"
            />
            <button
              type="button"
              onClick={() =>
                set(
                  "process",
                  form.process.filter((_, j) => j !== i)
                )
              }
              className="text-xs text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const CtaTab = () => (
    <div className="space-y-4">
      <label className={labelClass}>
        Eyebrow
        <input
          className={fieldClass}
          value={form.cta.eyebrow}
          onChange={(e) => set("cta.eyebrow", e.target.value)}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>
          Heading 1
          <input
            className={fieldClass}
            value={form.cta.heading[0] || ""}
            onChange={(e) =>
              set("cta.heading", [
                e.target.value,
                form.cta.heading[1] || "",
              ])
            }
          />
        </label>
        <label className={labelClass}>
          Heading 2
          <input
            className={fieldClass}
            value={form.cta.heading[1] || ""}
            onChange={(e) =>
              set("cta.heading", [
                form.cta.heading[0] || "",
                e.target.value,
              ])
            }
          />
        </label>
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Description</label>
        <RichTextEditor
          value={form.cta.description}
          onChange={(v) => set("cta.description", v)}
          minHeight="120px"
        />
      </div>
      <label className={labelClass}>
        Button Text
        <input
          className={fieldClass}
          value={form.cta.buttonText}
          onChange={(e) => set("cta.buttonText", e.target.value)}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <ImageUploadField
          label="CTA Image"
          value={form.cta.image}
          fieldKey="sol.cta"
          uploadingField={uploadingField}
          onUploadingChange={setUploadingField}
          onUpload={(url) => set("cta.image", url)}
          onError={(m) => toast.error(m)}
        />
        <label className={labelClass}>
          Image Alt
          <input
            className={fieldClass}
            value={form.cta.imageAlt}
            onChange={(e) => set("cta.imageAlt", e.target.value)}
          />
        </label>
      </div>
    </div>
  );

  const SeoTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>
          Meta Title
          <input
            className={fieldClass}
            value={form.seo.metaTitle}
            onChange={(e) => set("seo.metaTitle", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Meta Keywords
          <input
            className={fieldClass}
            value={form.seo.metaKeywords}
            onChange={(e) => set("seo.metaKeywords", e.target.value)}
          />
        </label>
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Meta Description</label>
        <RichTextEditor
          value={form.seo.metaDescription}
          onChange={(v) => set("seo.metaDescription", v)}
          minHeight="100px"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>
          Canonical URL
          <input
            className={fieldClass}
            value={form.seo.canonical}
            onChange={(e) => set("seo.canonical", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Robots
          <select
            className={fieldClass}
            value={form.robots}
            onChange={(e) => set("robots", e.target.value)}
          >
            <option value="index, follow">index, follow</option>
            <option value="noindex, nofollow">noindex, nofollow</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>
          OG Json
          <textarea
            className={`${fieldClass} h-32`}
            value={form.seo.ogJson}
            onChange={(e) => set("seo.ogJson", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Schema Json
          <textarea
            className={`${fieldClass} h-32`}
            value={form.seo.schema}
            onChange={(e) => set("seo.schema", e.target.value)}
          />
        </label>
      </div>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case "basic":
        return <BasicTab />;
      case "approach":
        return <ApproachTab />;
      case "spaces":
        return <SpacesTab />;
      case "services":
        return <ServicesProcessTab />;
      case "cta":
        return <CtaTab />;
      case "seo":
        return <SeoTab />;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="text-blue-600" size={20} />
              <h2 className="text-lg font-bold">
                {editingId ? "Edit Solution" : "Create Solution"}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty());
                  setActiveTab("basic");
                }}
                className="text-xs font-medium"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="flex border-b overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === t.key
                    ? "border-[#8d6a3a] text-[#8d6a3a]"
                    : "border-transparent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            {renderTab()}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {editingId ? "Update" : "Create"}
            </button>
          </form>
        </section>

        <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-4 px-6 flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold">Existing Solutions</h2>
          </div>
          <div className="p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-xs uppercase font-bold">
                  <th className="pb-3 px-4">Order</th>
                  <th className="pb-3 px-4">Title</th>
                  <th className="pb-3 px-4">Slug</th>
                  <th className="pb-3 px-4">Views</th>
                  <th className="pb-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {solutions
                  .sort((a, b) => (a.orderBy || 0) - (b.orderBy || 0))
                  .map((s) => (
                    <tr
                      key={s._id}
                      className={`hover:bg-slate-50 ${
                        editingId === s._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-xs font-mono">
                        {s.orderBy || 0}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        <div className="line-clamp-1">{s.title}</div>
                      </td>
                      <td className="py-3 px-4 text-xs">{s.slug}</td>
                      <td className="py-3 px-4 text-xs">{s.viewCount}</td>
                      <td className="py-3 px-4 text-right flex gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id!)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
