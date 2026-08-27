"use client";

import { ImageUploadField } from "@/components/common/ImageUploadField";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Save, Trash2, Plus } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import {
  careerPageKeys,
  defaultCareerData,
  type CareerPageContentKeys,
  type CareerBanner,
  type CareerSection,
  type CareerBenefits,
  type CareerTalentCommunity,
  type CareerWhyWork,
  type CareerFeaturesStrip,
  type CareerTestimonials,
} from "@/lib/career/careerPageContent";
import { fieldClass, labelClass } from "@/constants";

type ContentForm = Omit<ComponentContent, "_id"> & { key: CareerPageContentKeys };

const randomId = () => Math.random().toString(36).slice(2, 9);

const cardClass = "p-2 border rounded bg-gray-50 space-y-1.5 relative";
const sectionHeaderClass = "text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide";
const addBtnClass = "text-[11px] bg-[#263016] text-white px-2 py-1 rounded";
const smallLabelClass = "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";

export default function CareerComponentEditor({
  componentKey,
  title,
}: {
  componentKey: CareerPageContentKeys;
  title: string;
}) {
  const [form, setForm] = useState<ContentForm>({
    key: componentKey,
    label: title,
    page: "career",
    description: "",
    isActive: true,
    data: (defaultCareerData[componentKey] || {}) as Record<string, unknown>,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    message: string;
    id: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await componentContentApi.list();
      const existing = list.find((r) => r.key === componentKey);
      if (existing) {
        setEditingId(existing._id);
        setForm({
          key: existing.key as CareerPageContentKeys,
          label: existing.label,
          page: existing.page || "career",
          description: existing.description || "",
          isActive: existing.isActive,
          data: (existing.data as Record<string, unknown>) || {},
        });
      } else {
        setEditingId(null);
        const keyInfo = careerPageKeys.find((k) => k.key === componentKey);
        setForm((prev) => ({
          ...prev,
          key: componentKey,
          label: keyInfo?.label || title,
          description: keyInfo?.description || "",
          data: (defaultCareerData[componentKey] || {}) as Record<
            string,
            unknown
          >,
        }));
      }
    } catch (error) {
      toast.error("Failed to load components.");
    } finally {
      setLoading(false);
    }
  }, [componentKey, title]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setData = (nextData: Record<string, unknown>) =>
    setForm((current) => ({ ...current, data: nextData }));

  const handleKeyChange = (key: CareerPageContentKeys) => {
    setEditingId(null);
    setForm((prev) => ({
      ...prev,
      key,
      label: careerPageKeys.find((k) => k.key === key)?.label || prev.label,
      data: defaultCareerData[key] as Record<string, unknown>,
    }));
  };

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
      toast.success("Component deleted");
    } catch {
      toast.error("Delete failed");
    }
    setEditingId(null);
    refresh();
  };

  const confirmDeleteClick = (id: string, message: string) =>
    setPendingDelete({ id, message });

  const renderBannerForm = () => {
    const data = form.data as unknown as CareerBanner;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>
            Heading{" "}
            <input
              className={smallFieldClass}
              value={data.heading || ""}
              onChange={(e) => setData({ ...data, heading: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            Title Part 1{" "}
            <input
              className={smallFieldClass}
              value={data.titlePart1 || ""}
              onChange={(e) => setData({ ...data, titlePart1: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            Title Part 2{" "}
            <input
              className={smallFieldClass}
              value={data.titlePart2 || ""}
              onChange={(e) => setData({ ...data, titlePart2: e.target.value })}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>
            Title Part 3{" "}
            <input
              className={smallFieldClass}
              value={data.titlePart3 || ""}
              onChange={(e) => setData({ ...data, titlePart3: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            Button Text{" "}
            <input
              className={smallFieldClass}
              value={data.buttonText || ""}
              onChange={(e) => setData({ ...data, buttonText: e.target.value })}
            />
          </label>
        </div>
        <label className={smallLabelClass}>
          Button Path{" "}
          <input
            className={smallFieldClass}
            value={data.buttonPath || ""}
            onChange={(e) => setData({ ...data, buttonPath: e.target.value })}
            placeholder="/careers#openings"
          />
        </label>
        <label className={smallLabelClass}>
          Description{" "}
          <textarea
            className={smallFieldClass}
            rows={3}
            value={data.description || ""}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <ImageUploadField
            label="Background Image"
            value={data.bgImage?.imageUrl}
            fieldKey="career.banner.bg"
            uploadingField={uploadingField}
            onUploadingChange={setUploadingField}
            onError={(m) => toast.error(m)}
            onUpload={(url) =>
              setData({
                ...data,
                bgImage: { ...data.bgImage, imageUrl: url },
              })
            }
          />
          <label className={smallLabelClass}>
            Background Alt{" "}
            <input
              className={smallFieldClass}
              value={data.bgImage?.alt || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  bgImage: { ...data.bgImage, alt: e.target.value },
                })
              }
            />
          </label>
        </div>
      </div>
    );
  };

  const renderSectionForm = () => {
    const data = form.data as unknown as CareerSection;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>
            Heading{" "}
            <input
              className={smallFieldClass}
              value={data.heading || ""}
              onChange={(e) => setData({ ...data, heading: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            Title Part 1{" "}
            <input
              className={smallFieldClass}
              value={data.titlePart1 || ""}
              onChange={(e) => setData({ ...data, titlePart1: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            Title Part 2{" "}
            <input
              className={smallFieldClass}
              value={data.titlePart2 || ""}
              onChange={(e) => setData({ ...data, titlePart2: e.target.value })}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>
            Button Label{" "}
            <input
              className={smallFieldClass}
              value={data.buttonLabel || ""}
              onChange={(e) => setData({ ...data, buttonLabel: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            Button Path{" "}
            <input
              className={smallFieldClass}
              value={data.buttonPath || ""}
              onChange={(e) => setData({ ...data, buttonPath: e.target.value })}
            />
          </label>
        </div>
        <label className={smallLabelClass}>
          Description{" "}
          <textarea
            className={smallFieldClass}
            rows={3}
            value={data.description || ""}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        </label>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Right Image Grid</h4>
            <button
              type="button"
              className={addBtnClass}
              onClick={() =>
                setData({
                  ...data,
                  RightImageGrid: [
                    ...(data.RightImageGrid || []),
                    { imageUrl: "", alt: "" },
                  ],
                })
              }
            >
              + Add Image
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(data.RightImageGrid || []).map((img, idx) => (
              <div key={idx} className={cardClass}>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      RightImageGrid: data.RightImageGrid.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                  className="absolute top-1 right-1 text-red-500"
                >
                  <Trash2 size={12} />
                </button>
                <ImageUploadField
                  label={`Grid Image ${idx + 1}`}
                  value={img.imageUrl}
                  fieldKey={`career.section.grid.${idx}`}
                  uploadingField={uploadingField}
                  onUploadingChange={setUploadingField}
                  onError={(m) => toast.error(m)}
                  onUpload={(url) => {
                    const ng = [...data.RightImageGrid];
                    ng[idx] = { ...ng[idx], imageUrl: url };
                    setData({ ...data, RightImageGrid: ng });
                  }}
                />
                <input
                  className={smallFieldClass}
                  placeholder="Alt"
                  value={img.alt || ""}
                  onChange={(e) => {
                    const ng = [...data.RightImageGrid];
                    ng[idx] = { ...ng[idx], alt: e.target.value };
                    setData({ ...data, RightImageGrid: ng });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <h4 className={sectionHeaderClass}>Left Side</h4>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <label className={smallLabelClass}>
              Heading{" "}
              <input
                className={smallFieldClass}
                value={data.leftSide?.heading || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    leftSide: { ...data.leftSide, heading: e.target.value },
                  })
                }
              />
            </label>
            <label className={smallLabelClass}>
              Button Label{" "}
              <input
                className={smallFieldClass}
                value={data.leftSide?.buttonLabel || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    leftSide: {
                      ...data.leftSide,
                      buttonLabel: e.target.value,
                    },
                  })
                }
              />
            </label>
            <label className={smallLabelClass}>
              Button Path{" "}
              <input
                className={smallFieldClass}
                value={data.leftSide?.buttonPath || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    leftSide: {
                      ...data.leftSide,
                      buttonPath: e.target.value,
                    },
                  })
                }
              />
            </label>
          </div>
          <label className={smallLabelClass}>
            Description{" "}
            <textarea
              className={smallFieldClass}
              rows={2}
              value={data.leftSide?.description || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  leftSide: { ...data.leftSide, description: e.target.value },
                })
              }
            />
          </label>
          <div className="flex justify-between items-center mt-2">
            <h4 className={sectionHeaderClass}>Filters</h4>
            <button
              type="button"
              className={addBtnClass}
              onClick={() =>
                setData({
                  ...data,
                  leftSide: {
                    ...data.leftSide,
                    filter: [
                      ...(data.leftSide?.filter || []),
                      { value: "", label: "" },
                    ],
                  },
                })
              }
            >
              + Add Filter
            </button>
          </div>
          {(data.leftSide?.filter || []).map((f, idx) => (
            <div key={idx} className="flex gap-1 mt-1">
              <input
                className={smallFieldClass}
                placeholder="Value"
                value={f.value || ""}
                onChange={(e) => {
                  const nf = [...(data.leftSide?.filter || [])];
                  nf[idx] = { ...nf[idx], value: e.target.value };
                  setData({
                    ...data,
                    leftSide: { ...data.leftSide, filter: nf },
                  });
                }}
              />
              <input
                className={smallFieldClass}
                placeholder="Label"
                value={f.label || ""}
                onChange={(e) => {
                  const nf = [...(data.leftSide?.filter || [])];
                  nf[idx] = { ...nf[idx], label: e.target.value };
                  setData({
                    ...data,
                    leftSide: { ...data.leftSide, filter: nf },
                  });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    leftSide: {
                      ...data.leftSide,
                      filter: (data.leftSide?.filter || []).filter(
                        (_, i) => i !== idx
                      ),
                    },
                  })
                }
                className="text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t">
          <h4 className={sectionHeaderClass}>Hiring Journey</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className={smallLabelClass}>
              Title{" "}
              <input
                className={smallFieldClass}
                value={data.ourHiringJourney?.title || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    ourHiringJourney: {
                      ...data.ourHiringJourney,
                      title: e.target.value,
                    },
                  })
                }
              />
            </label>
          </div>
          <label className={smallLabelClass}>
            Description{" "}
            <textarea
              className={smallFieldClass}
              rows={2}
              value={data.ourHiringJourney?.description || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  ourHiringJourney: {
                    ...data.ourHiringJourney,
                    description: e.target.value,
                  },
                })
              }
            />
          </label>
          <div className="flex justify-between items-center mt-2">
            <h4 className={sectionHeaderClass}>Steps</h4>
            <button
              type="button"
              className={addBtnClass}
              onClick={() =>
                setData({
                  ...data,
                  ourHiringJourney: {
                    ...data.ourHiringJourney,
                    steps: [
                      ...(data.ourHiringJourney?.steps || []),
                      { label: "", description: "" },
                    ],
                  },
                })
              }
            >
              + Add Step
            </button>
          </div>
          {(data.ourHiringJourney?.steps || []).map((step, idx) => (
            <div key={idx} className={cardClass + " mt-1"}>
              <button
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    ourHiringJourney: {
                      ...data.ourHiringJourney,
                      steps: (data.ourHiringJourney?.steps || []).filter(
                        (_, i) => i !== idx
                      ),
                    },
                  })
                }
                className="absolute top-1 right-1 text-red-500"
              >
                <Trash2 size={12} />
              </button>
              <input
                className={smallFieldClass}
                placeholder="Label"
                value={step.label || ""}
                onChange={(e) => {
                  const ns = [...(data.ourHiringJourney?.steps || [])];
                  ns[idx] = { ...ns[idx], label: e.target.value };
                  setData({
                    ...data,
                    ourHiringJourney: {
                      ...data.ourHiringJourney,
                      steps: ns,
                    },
                  });
                }}
              />
              <textarea
                className={smallFieldClass}
                rows={2}
                placeholder="Description"
                value={step.description || ""}
                onChange={(e) => {
                  const ns = [...(data.ourHiringJourney?.steps || [])];
                  ns[idx] = { ...ns[idx], description: e.target.value };
                  setData({
                    ...data,
                    ourHiringJourney: {
                      ...data.ourHiringJourney,
                      steps: ns,
                    },
                  });
                }}
              />
            </div>
          ))}
        </div>

        <div className="pt-2 border-t">
          <h4 className={sectionHeaderClass}>Career Form</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className={smallLabelClass}>
              Title{" "}
              <input
                className={smallFieldClass}
                value={data.careerForm?.title || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerForm: { ...data.careerForm, title: e.target.value },
                  })
                }
              />
            </label>
            <label className={smallLabelClass}>
              Button Text{" "}
              <input
                className={smallFieldClass}
                value={data.careerForm?.buttonText || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    careerForm: {
                      ...data.careerForm,
                      buttonText: e.target.value,
                    },
                  })
                }
              />
            </label>
          </div>
          <label className={smallLabelClass}>
            Description{" "}
            <textarea
              className={smallFieldClass}
              rows={2}
              value={data.careerForm?.description || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  careerForm: {
                    ...data.careerForm,
                    description: e.target.value,
                  },
                })
              }
            />
          </label>
          <label className={smallLabelClass}>
            Terms Text{" "}
            <textarea
              className={smallFieldClass}
              rows={2}
              value={data.careerForm?.termsText || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  careerForm: {
                    ...data.careerForm,
                    termsText: e.target.value,
                  },
                })
              }
            />
          </label>
        </div>
      </div>
    );
  };

  const renderBenefitsForm = () => {
    const data = form.data as unknown as CareerBenefits;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>
          Title{" "}
          <input
            className={smallFieldClass}
            value={data.title || ""}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </label>
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Benefits</h4>
          <button
            type="button"
            className={addBtnClass}
            onClick={() =>
              setData({
                ...data,
                benefits: [
                  ...(data.benefits || []),
                  { title: "", description: "", icon: "" },
                ],
              })
            }
          >
            + Add Benefit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(data.benefits || []).map((benefit, idx) => (
            <div key={idx} className={cardClass}>
              <button
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    benefits: data.benefits.filter((_, i) => i !== idx),
                  })
                }
                className="absolute top-1 right-1 text-red-500"
              >
                <Trash2 size={12} />
              </button>
              <ImageUploadField
                label="Icon"
                value={benefit.icon}
                fieldKey={`career.benefits.${idx}.icon`}
                uploadingField={uploadingField}
                onUploadingChange={setUploadingField}
                onError={(m) => toast.error(m)}
                onUpload={(url) => {
                  const nb = [...data.benefits];
                  nb[idx] = { ...nb[idx], icon: url };
                  setData({ ...data, benefits: nb });
                }}
              />
              <input
                className={smallFieldClass}
                placeholder="Title"
                value={benefit.title || ""}
                onChange={(e) => {
                  const nb = [...data.benefits];
                  nb[idx] = { ...nb[idx], title: e.target.value };
                  setData({ ...data, benefits: nb });
                }}
              />
              <textarea
                className={smallFieldClass}
                rows={2}
                placeholder="Description"
                value={benefit.description || ""}
                onChange={(e) => {
                  const nb = [...data.benefits];
                  nb[idx] = { ...nb[idx], description: e.target.value };
                  setData({ ...data, benefits: nb });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTalentCommunityForm = () => {
    const data = form.data as unknown as CareerTalentCommunity;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <ImageUploadField
            label="Background Image"
            value={data.bgImage?.imageUrl}
            fieldKey="career.talent.bg"
            uploadingField={uploadingField}
            onUploadingChange={setUploadingField}
            onError={(m) => toast.error(m)}
            onUpload={(url) =>
              setData({
                ...data,
                bgImage: { ...data.bgImage, imageUrl: url },
              })
            }
          />
          <label className={smallLabelClass}>
            Background Alt{" "}
            <input
              className={smallFieldClass}
              value={data.bgImage?.alt || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  bgImage: { ...data.bgImage, alt: e.target.value },
                })
              }
            />
          </label>
        </div>
        <label className={smallLabelClass}>
          Heading{" "}
          <input
            className={smallFieldClass}
            value={data.heading || ""}
            onChange={(e) => setData({ ...data, heading: e.target.value })}
          />
        </label>
        <label className={smallLabelClass}>
          Description{" "}
          <textarea
            className={smallFieldClass}
            rows={2}
            value={data.description || ""}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        </label>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Features</h4>
            <button
              type="button"
              className={addBtnClass}
              onClick={() =>
                setData({
                  ...data,
                  features: [...(data.features || []), ""],
                })
              }
            >
              + Add Feature
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.features || []).map((feature, idx) => (
              <div key={idx} className={cardClass}>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      features: data.features.filter((_, i) => i !== idx),
                    })
                  }
                  className="absolute top-1 right-1 text-red-500"
                >
                  <Trash2 size={12} />
                </button>
                <input
                  className={smallFieldClass}
                  placeholder="Feature Label"
                  value={feature || ""}
                  onChange={(e) => {
                    const nf = [...data.features];
                    nf[idx] = e.target.value;
                    setData({ ...data, features: nf });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <h4 className={sectionHeaderClass}>Newsletter Card</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className={smallLabelClass}>
              Title{" "}
              <input
                className={smallFieldClass}
                value={data.newsLetterCard?.title || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    newsLetterCard: {
                      ...data.newsLetterCard,
                      title: e.target.value,
                    },
                  })
                }
              />
            </label>
            <label className={smallLabelClass}>
              Button Text{" "}
              <input
                className={smallFieldClass}
                value={data.newsLetterCard?.buttonText || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    newsLetterCard: {
                      ...data.newsLetterCard,
                      buttonText: e.target.value,
                    },
                  })
                }
              />
            </label>
          </div>
          <label className={smallLabelClass}>
            Description{" "}
            <textarea
              className={smallFieldClass}
              rows={2}
              value={data.newsLetterCard?.description || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  newsLetterCard: {
                    ...data.newsLetterCard,
                    description: e.target.value,
                  },
                })
              }
            />
          </label>
        </div>
      </div>
    );
  };

  const renderWhyWorkForm = () => {
    const data = form.data as unknown as CareerWhyWork;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>
            Title 1{" "}
            <input
              className={smallFieldClass}
              value={data.title1 || ""}
              onChange={(e) => setData({ ...data, title1: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            Title 2{" "}
            <input
              className={smallFieldClass}
              value={data.title2 || ""}
              onChange={(e) => setData({ ...data, title2: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            Heading{" "}
            <input
              className={smallFieldClass}
              value={data.heading || ""}
              onChange={(e) => setData({ ...data, heading: e.target.value })}
            />
          </label>
        </div>
        <label className={smallLabelClass}>
          Description{" "}
          <textarea
            className={smallFieldClass}
            rows={2}
            value={data.description || ""}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        </label>
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Cards</h4>
          <button
            type="button"
            className={addBtnClass}
            onClick={() =>
              setData({
                ...data,
                cards: [
                  ...(data.cards || []),
                  { title: "", description: "", icon: "" },
                ],
              })
            }
          >
            + Add Card
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(data.cards || []).map((card, idx) => (
            <div key={idx} className={cardClass}>
              <button
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    cards: data.cards.filter((_, i) => i !== idx),
                  })
                }
                className="absolute top-1 right-1 text-red-500"
              >
                <Trash2 size={12} />
              </button>
              <ImageUploadField
                label="Icon"
                value={typeof card.icon === "string" ? card.icon : ""}
                fieldKey={`career.whyWork.card.${idx}.icon`}
                uploadingField={uploadingField}
                onUploadingChange={setUploadingField}
                onError={(m) => toast.error(m)}
                onUpload={(url) => {
                  const nc = [...data.cards];
                  nc[idx] = { ...nc[idx], icon: url };
                  setData({ ...data, cards: nc });
                }}
              />
              <input
                className={smallFieldClass}
                placeholder="Title"
                value={card.title || ""}
                onChange={(e) => {
                  const nc = [...data.cards];
                  nc[idx] = { ...nc[idx], title: e.target.value };
                  setData({ ...data, cards: nc });
                }}
              />
              <textarea
                className={smallFieldClass}
                rows={2}
                placeholder="Description"
                value={card.description || ""}
                onChange={(e) => {
                  const nc = [...data.cards];
                  nc[idx] = { ...nc[idx], description: e.target.value };
                  setData({ ...data, cards: nc });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFeaturesStripForm = () => {
    const data = form.data as unknown as CareerFeaturesStrip;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Features Strip Items</h4>
          <button
            type="button"
            className={addBtnClass}
            onClick={() =>
              setData({
                ...data,
                features: [
                  ...(data.features || []),
                  { id: randomId(), image: "", title: "", subtitle: "" },
                ],
              })
            }
          >
            + Add Feature
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(data.features || []).map((feat, idx) => (
            <div key={feat.id} className={cardClass}>
              <button
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    features: data.features.filter((_, i) => i !== idx),
                  })
                }
                className="absolute top-1 right-1 text-red-500"
              >
                <Trash2 size={12} />
              </button>
              <input
                className={smallFieldClass}
                placeholder="Title"
                value={feat.title || ""}
                onChange={(e) => {
                  const nf = [...data.features];
                  nf[idx] = { ...nf[idx], title: e.target.value };
                  setData({ ...data, features: nf });
                }}
              />
              <input
                className={smallFieldClass}
                placeholder="Subtitle"
                value={feat.subtitle || ""}
                onChange={(e) => {
                  const nf = [...data.features];
                  nf[idx] = { ...nf[idx], subtitle: e.target.value };
                  setData({ ...data, features: nf });
                }}
              />
              <ImageUploadField
                label="Image"
                value={feat.image}
                fieldKey={`career.strip.${idx}`}
                uploadingField={uploadingField}
                onUploadingChange={setUploadingField}
                onError={(m) => toast.error(m)}
                onUpload={(url) => {
                  const nf = [...data.features];
                  nf[idx] = { ...nf[idx], image: url };
                  setData({ ...data, features: nf });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTestimonialsForm = () => {
    const data = form.data as unknown as CareerTestimonials;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>
          Section Title{" "}
          <input
            className={smallFieldClass}
            value={data.title || ""}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </label>
        <div className="flex justify-between items-center">
          <h4 className={sectionHeaderClass}>Testimonials</h4>
          <button
            type="button"
            className={addBtnClass}
            onClick={() =>
              setData({
                ...data,
                testimonials: [
                  ...(data.testimonials || []),
                  { text: "", name: "", role: "", image: "" },
                ],
              })
            }
          >
            + Add Testimonial
          </button>
        </div>
        <div className="space-y-2">
          {(data.testimonials || []).map((item, idx) => (
            <div key={idx} className={cardClass}>
              <button
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    testimonials: data.testimonials.filter((_, i) => i !== idx),
                  })
                }
                className="absolute top-1 right-1 text-red-500"
              >
                <Trash2 size={12} />
              </button>
              <div className="grid grid-cols-2 gap-1">
                <input
                  className={smallFieldClass}
                  placeholder="Name"
                  value={item.name || ""}
                  onChange={(e) => {
                    const nt = [...data.testimonials];
                    nt[idx] = { ...nt[idx], name: e.target.value };
                    setData({ ...data, testimonials: nt });
                  }}
                />
                <input
                  className={smallFieldClass}
                  placeholder="Role"
                  value={item.role || ""}
                  onChange={(e) => {
                    const nt = [...data.testimonials];
                    nt[idx] = { ...nt[idx], role: e.target.value };
                    setData({ ...data, testimonials: nt });
                  }}
                />
              </div>
              <textarea
                className={smallFieldClass}
                rows={2}
                placeholder="Testimonial Text"
                value={item.text || ""}
                onChange={(e) => {
                  const nt = [...data.testimonials];
                  nt[idx] = { ...nt[idx], text: e.target.value };
                  setData({ ...data, testimonials: nt });
                }}
              />
              <ImageUploadField
                label="Person Image"
                value={item.image}
                fieldKey={`career.testimonial.${idx}.image`}
                uploadingField={uploadingField}
                onUploadingChange={setUploadingField}
                onError={(m) => toast.error(m)}
                onUpload={(url) => {
                  const nt = [...data.testimonials];
                  nt[idx] = { ...nt[idx], image: url };
                  setData({ ...data, testimonials: nt });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-sm">
      <header className="mb-4 flex items-center justify-between border-b border-[#eee5d9] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8d6a3a]">
            Configuration
          </span>
          <h1 className="text-xl text-[#1f261b] mt-0.5">
            Career Page Content
          </h1>
          <p className="mt-1 text-[#5f5a50] text-xs leading-snug max-w-xl">
            Manage sections of the career page. Select an existing component to
            edit.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1">
        <section>
          <form
            onSubmit={handleSave}
            className="bg-white border border-[#ded3c4] rounded-xl shadow-sm overflow-hidden"
          >
            <div className="bg-[#fcfaf7] border-b border-[#eee5d9] p-3 flex items-center justify-between">
              <div>
                <h2 className="text-base text-[#1f261b]">
                  {editingId ? "Edit Component" : "Create New Component"}
                </h2>
                <p className="text-[10px] text-[#5f5a50] mt-0.5 italic">
                  Structured data for rendering page sections
                </p>
              </div>
              <div className="flex items-center gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={() =>
                      confirmDeleteClick(editingId, "Are you sure?")
                    }
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8d6a3a] text-white rounded-lg font-bold text-xs shadow hover:bg-[#6f542f] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {editingId ? "Update Section" : "Publish Section"}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3 bg-[#fcfaf7] p-3 rounded-lg border border-[#eee5d9] items-end">
                <label className={smallLabelClass}>
                  Template / Component Key
                  <select
                    className={`${smallFieldClass} font-bold`}
                    value={form.key}
                    onChange={(e) =>
                      handleKeyChange(e.target.value as CareerPageContentKeys)
                    }
                  >
                    {careerPageKeys.map((k) => (
                      <option key={k.key} value={k.key}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={smallLabelClass}>
                  Internal Label
                  <input
                    className={smallFieldClass}
                    value={form.label}
                    onChange={(e) =>
                      setForm({ ...form, label: e.target.value })
                    }
                    placeholder="Friendly name for admin"
                  />
                </label>
                <label className={smallLabelClass}>
                  Page ID
                  <input
                    className={smallFieldClass}
                    value={form.page}
                    onChange={(e) =>
                      setForm({ ...form, page: e.target.value })
                    }
                  />
                </label>
                <div className="flex items-center gap-1.5 pb-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="w-4 h-4 rounded accent-[#8d6a3a]"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="isActive"
                    className="text-[11px] font-bold text-[#1f261b] uppercase"
                  >
                    Active on page
                  </label>
                </div>
              </div>

              <div className="pt-1">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#eee5d9]" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#8d6a3a] uppercase">
                    Component Content
                  </span>
                  <div className="h-px flex-1 bg-[#eee5d9]" />
                </div>

                {form.key === "career.banner" && renderBannerForm()}
                {form.key === "career.section" && renderSectionForm()}
                {form.key === "career.benefits" && renderBenefitsForm()}
                {form.key === "career.talentCommunity" &&
                  renderTalentCommunityForm()}
                {form.key === "career.whyWork" && renderWhyWorkForm()}
                {form.key === "career.featuresStrip" &&
                  renderFeaturesStripForm()}
                {form.key === "career.testimonials" && renderTestimonialsForm()}
              </div>
            </div>
          </form>
        </section>
      </div>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Confirm Delete"
        message={pendingDelete?.message}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await handleDelete(pendingDelete.id);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
