"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import {
  defaultPolicyPageData,
  type PolicyPageContentKeys,
  type PolicyPageData,
  type PolicySection,
  type PolicyHero,
  type PolicyIntro,
  type PolicyContact,
} from "@/lib/policy/policyPageContent";

type SectionKey = "hero" | "intro" | "contact" | "sections";

const inputCls =
  "w-full px-2 py-1 text-[11px] border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-emerald-500";
const labelCls =
  "block text-[9px] font-semibold text-slate-400 uppercase mb-0.5";

const randomId = () => Math.random().toString(36).slice(2, 9);

export default function PolicyPageSectionEditor({
  componentKey,
  sectionKey,
  title,
}: {
  componentKey: PolicyPageContentKeys;
  sectionKey: SectionKey;
  title: string;
}) {
  const [fullData, setFullData] = useState<PolicyPageData>(
    defaultPolicyPageData[componentKey] as unknown as PolicyPageData
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      const existing = list.find((r) => r.key === componentKey);
      if (existing) {
        setEditingId(existing._id);
        setFullData(
          (existing.data as unknown as PolicyPageData) ||
            defaultPolicyPageData[componentKey]
        );
      } else {
        setEditingId(null);
        setFullData(
          defaultPolicyPageData[componentKey] as unknown as PolicyPageData
        );
      }
    } catch {
      toast.error("Failed to load content.");
    } finally {
      setLoading(false);
    }
  }, [componentKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Omit<ComponentContent, "_id"> & {
        key: PolicyPageContentKeys;
      } = {
        key: componentKey,
        label:
          componentKey === "policy.privacy"
            ? "Privacy Policy"
            : "Terms & Conditions",
        page: "policy",
        description: "",
        isActive: true,
        data: fullData as unknown as Record<string, unknown>,
      };

      if (editingId) {
        await componentContentApi.update(editingId, payload);
        toast.success("Updated successfully!");
      } else {
        await componentContentApi.create(payload);
        toast.success("Created successfully!");
      }
      await refresh();
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-[#8d6a3a]" size={40} />
      </div>
    );
  }

  const pageLabel =
    componentKey === "policy.privacy"
      ? "Privacy Policy"
      : "Terms & Conditions";
  const livePath =
    componentKey === "policy.privacy"
      ? "/privacy-policy"
      : "/terms-and-conditions";

  return (
    <div className="w-full p-4 space-y-3">
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <h1 className="text-sm font-bold text-slate-800">
          {pageLabel} — {title}
        </h1>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Changes reflect live on{" "}
          <span className="font-semibold text-emerald-700">{livePath}</span>
        </p>
      </div>

      {sectionKey === "hero" && (
        <HeroSection
          data={fullData.hero || {}}
          onChange={(hero) => setFullData({ ...fullData, hero })}
        />
      )}
      {sectionKey === "intro" && (
        <IntroSection
          data={fullData.intro || {}}
          onChange={(intro) => setFullData({ ...fullData, intro })}
        />
      )}
      {sectionKey === "contact" && (
        <ContactSection
          data={fullData.contact || {}}
          onChange={(contact) => setFullData({ ...fullData, contact })}
        />
      )}
      {sectionKey === "sections" && (
        <SectionsSection
          data={fullData.sections || []}
          onChange={(sections) => setFullData({ ...fullData, sections })}
        />
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-1.5 bg-[#263016] text-white rounded-lg hover:bg-[#1a1f0f] disabled:opacity-50 text-xs font-bold transition-colors"
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          <Save size={12} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ── HERO ── */
function HeroSection({
  data,
  onChange,
}: {
  data: PolicyHero;
  onChange: (d: PolicyHero) => void;
}) {
  const update = (patch: Partial<PolicyHero>) =>
    onChange({ ...data, ...patch });

  const defaultStats = [
    { number: "", label: "" },
    { number: "", label: "" },
    { number: "", label: "" },
    { number: "", label: "" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 space-y-2">
      <h2 className="text-[10px] font-bold text-[#8d6a3a] uppercase tracking-wide">
        Hero Section
      </h2>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className={labelCls}>Eyebrow Text</label>
          <input
            className={inputCls}
            value={data.eyebrow || ""}
            onChange={(e) => update({ eyebrow: e.target.value })}
            placeholder="ENSIS LEGAL & PRIVACY"
          />
        </div>
        <div>
          <label className={labelCls}>Hero Title</label>
          <input
            className={inputCls}
            value={data.title || ""}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Privacy Policy"
          />
        </div>
        <div>
          <label className={labelCls}>Last Updated</label>
          <input
            className={inputCls}
            value={data.lastUpdated || ""}
            onChange={(e) => update({ lastUpdated: e.target.value })}
            placeholder="20 May 2025"
          />
        </div>
        <div>
          <label className={labelCls}>Hero Subtitle</label>
          <input
            className={inputCls}
            value={data.subtitle || ""}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="Your privacy and trust matter to us..."
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Stats (4 items)</label>
        <div className="grid grid-cols-4 gap-2">
          {(data.stats || defaultStats).map((stat, i) => (
            <div key={i} className="flex gap-1 items-center">
              <input
                className={`${inputCls} w-14 text-center font-bold text-[#a9742a]`}
                value={stat.number}
                onChange={(e) => {
                  const stats = [...(data.stats || defaultStats)];
                  stats[i] = { ...stats[i], number: e.target.value };
                  update({ stats });
                }}
                placeholder="100%"
              />
              <input
                className={`${inputCls} flex-1`}
                value={stat.label}
                onChange={(e) => {
                  const stats = [...(data.stats || defaultStats)];
                  stats[i] = { ...stats[i], label: e.target.value };
                  update({ stats });
                }}
                placeholder="Data Protection"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── INTRO ── */
function IntroSection({
  data,
  onChange,
}: {
  data: PolicyIntro;
  onChange: (d: PolicyIntro) => void;
}) {
  const update = (patch: Partial<PolicyIntro>) =>
    onChange({ ...data, ...patch });

  const defaultFeatures = [
    { title: "", subtitle: "" },
    { title: "", subtitle: "" },
    { title: "", subtitle: "" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 space-y-2">
      <h2 className="text-[10px] font-bold text-[#8d6a3a] uppercase tracking-wide">
        Intro Card
      </h2>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-2">
          <label className={labelCls}>Heading</label>
          <input
            className={inputCls}
            value={data.heading || ""}
            onChange={(e) => update({ heading: e.target.value })}
            placeholder="Your Privacy, Handled with Care"
          />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Description</label>
          <input
            className={inputCls}
            value={data.description || ""}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="ENSIS respects the privacy of every visitor..."
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Features (3 items)</label>
        <div className="grid grid-cols-3 gap-2">
          {(data.features || defaultFeatures).map((feat, i) => (
            <div key={i} className="flex gap-1 items-center">
              <span className="text-[9px] text-slate-400 w-3 shrink-0">
                {i + 1}.
              </span>
              <input
                className={`${inputCls} flex-1`}
                value={feat.title}
                onChange={(e) => {
                  const features = [...(data.features || defaultFeatures)];
                  features[i] = { ...features[i], title: e.target.value };
                  update({ features });
                }}
                placeholder="Title"
              />
              <input
                className={`${inputCls} flex-1`}
                value={feat.subtitle}
                onChange={(e) => {
                  const features = [...(data.features || defaultFeatures)];
                  features[i] = { ...features[i], subtitle: e.target.value };
                  update({ features });
                }}
                placeholder="Subtitle"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CONTACT ── */
function ContactSection({
  data,
  onChange,
}: {
  data: PolicyContact;
  onChange: (d: PolicyContact) => void;
}) {
  const update = (patch: Partial<PolicyContact>) =>
    onChange({ ...data, ...patch });

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 space-y-2">
      <h2 className="text-[10px] font-bold text-[#8d6a3a] uppercase tracking-wide">
        Contact Card
      </h2>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className={labelCls}>Heading</label>
          <input
            className={inputCls}
            value={data.heading || ""}
            onChange={(e) => update({ heading: e.target.value })}
            placeholder="Have a Privacy Question?"
          />
        </div>
        <div>
          <label className={labelCls}>Subheading</label>
          <input
            className={inputCls}
            value={data.subheading || ""}
            onChange={(e) => update({ subheading: e.target.value })}
            placeholder="Contact Our Team"
          />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input
            className={inputCls}
            value={data.phone || ""}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="+91 9654900525"
          />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input
            className={inputCls}
            value={data.email || ""}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="info@ensis.in"
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3">
          <label className={labelCls}>Description</label>
          <input
            className={inputCls}
            value={data.description || ""}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="We are committed to protecting your information..."
          />
        </div>
        <div>
          <label className={labelCls}>Website</label>
          <input
            className={inputCls}
            value={data.website || ""}
            onChange={(e) => update({ website: e.target.value })}
            placeholder="www.ensis.in"
          />
        </div>
      </div>
    </div>
  );
}

/* ── SECTIONS ── */
function SectionsSection({
  data,
  onChange,
}: {
  data: PolicySection[];
  onChange: (d: PolicySection[]) => void;
}) {
  const addSection = () => {
    const newSection: PolicySection = {
      id: randomId(),
      number: String(data.length + 1).padStart(2, "0"),
      title: "",
      text: "",
      bullets: [],
    };
    onChange([...data, newSection]);
  };

  const updateSection = (idx: number, patch: Partial<PolicySection>) => {
    const updated = [...data];
    updated[idx] = { ...updated[idx], ...patch };
    onChange(updated);
  };

  const removeSection = (idx: number) => {
    onChange(data.filter((_, i) => i !== idx));
  };

  const addBullet = (idx: number) => {
    const updated = [...data];
    updated[idx] = {
      ...updated[idx],
      bullets: [...(updated[idx].bullets || []), ""],
    };
    onChange(updated);
  };

  const updateBullet = (
    sectionIdx: number,
    bulletIdx: number,
    value: string
  ) => {
    const updated = [...data];
    const bullets = [...(updated[sectionIdx].bullets || [])];
    bullets[bulletIdx] = value;
    updated[sectionIdx] = { ...updated[sectionIdx], bullets };
    onChange(updated);
  };

  const removeBullet = (sectionIdx: number, bulletIdx: number) => {
    const updated = [...data];
    updated[sectionIdx] = {
      ...updated[sectionIdx],
      bullets: (updated[sectionIdx].bullets || []).filter(
        (_, i) => i !== bulletIdx
      ),
    };
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold text-[#8d6a3a] uppercase tracking-wide">
          Policy Sections
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 text-[10px] bg-[#263016] text-white px-2 py-0.5 rounded hover:bg-[#1a1f0f] transition-colors"
          onClick={addSection}
        >
          <Plus size={10} /> Add Section
        </button>
      </div>

      <div className="space-y-2">
        {data.map((section, idx) => (
          <div
            key={section.id}
            className="border border-slate-100 rounded-lg bg-slate-50/60 p-2 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-4 gap-2 flex-1">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">
                    No.
                  </label>
                  <input
                    type="text"
                    value={section.number}
                    onChange={(e) =>
                      updateSection(idx, { number: e.target.value })
                    }
                    className="w-full px-1.5 py-0.5 text-[11px] border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-emerald-500 text-center font-bold text-[#a9742a]"
                    placeholder="01"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(idx, {
                        title: e.target.value,
                        id:
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "") || section.id,
                      })
                    }
                    className="w-full px-1.5 py-0.5 text-[11px] border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    placeholder="Section title"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete section "${section.title || "Untitled"}"?`
                        )
                      )
                        removeSection(idx);
                    }}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-0.5">
                Main Text
              </label>
              <input
                value={section.text}
                onChange={(e) => updateSection(idx, { text: e.target.value })}
                className="w-full px-1.5 py-0.5 text-[11px] border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Opening paragraph"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[9px] font-semibold text-slate-400 uppercase">
                  Bullet Points
                </label>
                <button
                  type="button"
                  className="text-[9px] text-emerald-700 hover:text-emerald-900 font-semibold"
                  onClick={() => addBullet(idx)}
                >
                  + Add
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(section.bullets || []).map((bullet, bidx) => (
                  <div key={bidx} className="flex gap-0.5 items-center">
                    <span className="text-[#a9742a] text-[9px] font-bold shrink-0">
                      •
                    </span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) =>
                        updateBullet(idx, bidx, e.target.value)
                      }
                      className="flex-1 px-1.5 py-0.5 text-[10px] border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder={`Bullet ${bidx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet(idx, bidx)}
                      className="text-red-400 hover:text-red-600 px-0.5 transition-colors"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                ))}
              </div>
              {(section.bullets || []).length === 0 && (
                <p className="text-[9px] text-slate-400 italic">
                  No bullets — click + Add
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <p className="text-[10px] text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
          No sections yet — click &quot;Add Section&quot; to get started.
        </p>
      )}
    </div>
  );
}
