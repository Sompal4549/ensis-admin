"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import {
  policyPageKeys,
  defaultPolicyPageData,
  type PolicyPageContentKeys,
  type PolicyPageData,
  type PolicySection,
  type PolicyHero,
  type PolicyIntro,
  type PolicyContact,
} from "@/lib/policy/policyPageContent";
import ConfirmDialog from "@/components/common/ConfirmDialog";

type ContentForm = Omit<ComponentContent, "_id"> & { key: PolicyPageContentKeys };

const randomId = () => Math.random().toString(36).slice(2, 9);

// Compact shared styles
const cardClass = "p-2 border rounded bg-gray-50 space-y-1.5 relative";
const sectionHeaderClass = "text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide";
const addBtnClass = "text-[11px] bg-[#263016] text-white px-2 py-1 rounded";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";

export default function PolicyComponentEditor({ 
  componentKey, 
  title 
}: { 
  componentKey: PolicyPageContentKeys
  title: string 
}) {
  const [form, setForm] = useState<ContentForm>({
    key: componentKey,
    label: title,
    page: "policy",
    description: "",
    isActive: true,
    data: defaultPolicyPageData[componentKey] as unknown as Record<string, unknown>,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingDelete, setPendingDelete] = useState<{ message: string; id: string } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      const existing = list.find(r => r.key === componentKey);
      if (existing) {
        setEditingId(existing._id);
        setForm({
          key: existing.key as PolicyPageContentKeys,
          label: existing.label,
          page: existing.page || "policy",
          description: existing.description || "",
          isActive: existing.isActive,
          data: existing.data as unknown as Record<string, unknown>,
        });
      } else {
        setEditingId(null);
        const keyInfo = policyPageKeys.find(k => k.key === componentKey);
        setForm(prev => ({
          ...prev,
          key: componentKey,
          label: keyInfo?.label || title,
          description: keyInfo?.description || "",
          data: defaultPolicyPageData[componentKey] as unknown as Record<string, unknown>,
        }));
      }
    } catch (error) {
      toast.error("Failed to load policy content.");
    } finally {
      setLoading(false);
    }
  }, [componentKey, title]);

  useEffect(() => { 
    refresh(); 
  }, [refresh]);

  const setData = (nextData: PolicyPageData) => 
    setForm((current) => ({ ...current, data: nextData as unknown as Record<string, unknown> }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await componentContentApi.update(editingId, form);
        toast.success("Updated successfully!");
      } else {
        await componentContentApi.create(form);
        toast.success("Created successfully!");
      }
      await refresh();
    } catch {
      toast.error("Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await componentContentApi.remove(id);
      toast.success("Section deleted");
    } catch {
      toast.error("Delete failed");
    }
    setPendingDelete(null);
  };

  const confirmDeleteClick = (id: string, message: string) => 
    setPendingDelete({ id, message });

  const data = (form.data as unknown) as PolicyPageData;
  const sections = data.sections || [];
  const hero: PolicyHero = (data.hero as PolicyHero) || {};
  const intro: PolicyIntro = (data.intro as PolicyIntro) || {};
  const contact: PolicyContact = (data.contact as PolicyContact) || {};

  const updateHero = (patch: Partial<PolicyHero>) =>
    setData({ ...data, hero: { ...hero, ...patch } });
  const updateIntro = (patch: Partial<PolicyIntro>) =>
    setData({ ...data, intro: { ...intro, ...patch } });
  const updateContact = (patch: Partial<PolicyContact>) =>
    setData({ ...data, contact: { ...contact, ...patch } });

  const inputCls = "w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-emerald-500";
  const labelCls = "block text-[10px] font-semibold text-slate-400 uppercase mb-0.5";

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Page Header */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage sections · changes reflect live on{" "}
            <span className="font-semibold text-emerald-700">
              {componentKey === "policy.privacy" ? "/privacy-policy" : "/terms-and-conditions"}
            </span>
          </p>
        </div>

        {/* ── HERO SECTION ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
          <h2 className="text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide">🏷 Hero Section</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Eyebrow Text</label>
              <input className={inputCls} value={hero.eyebrow || ""} onChange={e => updateHero({ eyebrow: e.target.value })} placeholder="ENSIS LEGAL & PRIVACY" />
            </div>
            <div>
              <label className={labelCls}>Last Updated</label>
              <input className={inputCls} value={hero.lastUpdated || ""} onChange={e => updateHero({ lastUpdated: e.target.value })} placeholder="20 May 2025" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Hero Title</label>
            <input className={inputCls} value={hero.title || ""} onChange={e => updateHero({ title: e.target.value })} placeholder="Privacy Policy" />
          </div>
          <div>
            <label className={labelCls}>Hero Subtitle</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={hero.subtitle || ""} onChange={e => updateHero({ subtitle: e.target.value })} placeholder="Your privacy and trust matter to us..." />
          </div>

          {/* Stats */}
          <div>
            <label className={labelCls}>Stats (4 items)</label>
            <div className="grid grid-cols-2 gap-2">
              {(hero.stats || [{number:"",label:""},{number:"",label:""},{number:"",label:""},{number:"",label:""}]).map((stat, i) => (
                <div key={i} className="flex gap-1 items-center">
                  <input
                    className={`${inputCls} w-16 text-center font-bold text-[#a9742a]`}
                    value={stat.number}
                    onChange={e => {
                      const stats = [...(hero.stats || [{number:"",label:""},{number:"",label:""},{number:"",label:""},{number:"",label:""}])];
                      stats[i] = { ...stats[i], number: e.target.value };
                      updateHero({ stats });
                    }}
                    placeholder="100%"
                  />
                  <input
                    className={`${inputCls} flex-1`}
                    value={stat.label}
                    onChange={e => {
                      const stats = [...(hero.stats || [{number:"",label:""},{number:"",label:""},{number:"",label:""},{number:"",label:""}])];
                      stats[i] = { ...stats[i], label: e.target.value };
                      updateHero({ stats });
                    }}
                    placeholder="Data Protection"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── INTRO CARD ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
          <h2 className="text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide">📋 Intro Card</h2>
          <div>
            <label className={labelCls}>Heading</label>
            <input className={inputCls} value={intro.heading || ""} onChange={e => updateIntro({ heading: e.target.value })} placeholder="Your Privacy, Handled with Care" />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={intro.description || ""} onChange={e => updateIntro({ description: e.target.value })} placeholder="ENSIS respects the privacy of every visitor..." />
          </div>

          {/* Features (3 items) */}
          <div>
            <label className={labelCls}>Features (3 items)</label>
            <div className="space-y-1.5">
              {(intro.features || [{title:"",subtitle:""},{title:"",subtitle:""},{title:"",subtitle:""}]).map((feat, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[10px] text-slate-400 w-4 shrink-0">{i+1}.</span>
                  <input
                    className={`${inputCls} flex-1`}
                    value={feat.title}
                    onChange={e => {
                      const features = [...(intro.features || [{title:"",subtitle:""},{title:"",subtitle:""},{title:"",subtitle:""}])];
                      features[i] = { ...features[i], title: e.target.value };
                      updateIntro({ features });
                    }}
                    placeholder="Privacy &"
                  />
                  <input
                    className={`${inputCls} flex-1`}
                    value={feat.subtitle}
                    onChange={e => {
                      const features = [...(intro.features || [{title:"",subtitle:""},{title:"",subtitle:""},{title:"",subtitle:""}])];
                      features[i] = { ...features[i], subtitle: e.target.value };
                      updateIntro({ features });
                    }}
                    placeholder="Transparency"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTACT CARD ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
          <h2 className="text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide">📞 Contact Card</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Heading</label>
              <input className={inputCls} value={contact.heading || ""} onChange={e => updateContact({ heading: e.target.value })} placeholder="Have a Privacy Question?" />
            </div>
            <div>
              <label className={labelCls}>Subheading</label>
              <input className={inputCls} value={contact.subheading || ""} onChange={e => updateContact({ subheading: e.target.value })} placeholder="Contact Our Team" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={contact.description || ""} onChange={e => updateContact({ description: e.target.value })} placeholder="We are committed to protecting your information..." />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={contact.phone || ""} onChange={e => updateContact({ phone: e.target.value })} placeholder="+91 9654900525" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} value={contact.email || ""} onChange={e => updateContact({ email: e.target.value })} placeholder="info@ensis.in" />
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input className={inputCls} value={contact.website || ""} onChange={e => updateContact({ website: e.target.value })} placeholder="www.ensis.in" />
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide">
              Policy Sections
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] bg-[#263016] text-white px-2.5 py-1 rounded-lg hover:bg-[#1a1f0f] transition-colors"
              onClick={() => {
                const newSection: PolicySection = {
                  id: randomId(),
                  number: String(sections.length + 1).padStart(2, "0"),
                  title: "",
                  text: "",
                  bullets: [],
                };
                setData({ ...data, sections: [...sections, newSection] });
              }}
            >
              <Plus size={11} /> Add Section
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div key={section.id} className="relative border border-slate-100 rounded-xl bg-slate-50/60 p-3 space-y-2">
                {/* Delete */}
                <button
                  type="button"
                  onClick={() => confirmDeleteClick(section.id, `Delete section "${section.title || "Untitled"}"?`)}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={13} />
                </button>

                {/* Number + Title row */}
                <div className="grid grid-cols-12 gap-2 pr-5">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">No.</label>
                    <input
                      type="text"
                      value={section.number}
                      onChange={(e) => {
                        const s = [...sections];
                        s[idx] = { ...s[idx], number: e.target.value };
                        setData({ ...data, sections: s });
                      }}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-emerald-500 text-center font-bold text-[#a9742a]"
                      placeholder="01"
                    />
                  </div>
                  <div className="col-span-10">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const s = [...sections];
                        // auto-update id from title slug
                        s[idx] = {
                          ...s[idx],
                          title: e.target.value,
                          id: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "") || s[idx].id,
                        };
                        setData({ ...data, sections: s });
                      }}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                      placeholder="Section title (e.g. Information We Collect)"
                    />
                  </div>
                </div>

                {/* Main Text */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Main Text</label>
                  <textarea
                    value={section.text}
                    onChange={(e) => {
                      const s = [...sections];
                      s[idx] = { ...s[idx], text: e.target.value };
                      setData({ ...data, sections: s });
                    }}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    rows={2}
                    placeholder="Opening paragraph for this section"
                  />
                </div>

                {/* Bullet Points */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase">Bullet Points</label>
                    <button
                      type="button"
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold"
                      onClick={() => {
                        const s = [...sections];
                        s[idx] = { ...s[idx], bullets: [...(s[idx].bullets || []), ""] };
                        setData({ ...data, sections: s });
                      }}
                    >
                      + Add Bullet
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(section.bullets || []).map((bullet, bidx) => (
                      <div key={bidx} className="flex gap-1 items-center">
                        <span className="text-[#a9742a] text-[10px] font-bold shrink-0">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const s = [...sections];
                            const bullets = [...(s[idx].bullets || [])];
                            bullets[bidx] = e.target.value;
                            s[idx] = { ...s[idx], bullets };
                            setData({ ...data, sections: s });
                          }}
                          className="flex-1 px-2 py-0.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder={`Bullet point ${bidx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const s = [...sections];
                            s[idx] = { ...s[idx], bullets: s[idx].bullets!.filter((_, i) => i !== bidx) };
                            setData({ ...data, sections: s });
                          }}
                          className="text-red-400 hover:text-red-600 px-1 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                    {(section.bullets || []).length === 0 && (
                      <p className="text-[10px] text-slate-400 italic">No bullet points — click "+ Add Bullet" above</p>
                    )}
                  </div>
                </div>

                {/* Preview badge */}
                <div className="pt-1 border-t border-slate-100 flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">ID (auto):</span>
                  <code className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{section.id}</code>
                </div>
              </div>
            ))}
          </div>

          {sections.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
              No sections yet — click "Add Section" to get started.
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-2 justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-[#263016] text-white rounded-lg hover:bg-[#1a1f0f] disabled:opacity-50 text-sm font-bold transition-colors"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <Save size={14} />
            Save Changes
          </button>
        </div>
      </form>

      {/* Confirm Delete Dialog */}
      {pendingDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Section"
          message={pendingDelete.message}
          onConfirm={() => handleDelete(pendingDelete.id)}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
