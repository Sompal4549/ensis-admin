"use client";

import { ImageUploadField } from "@/components/common/ImageUploadField";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Save, Trash2, Plus } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import {
  projectsPageKeys,
  defaultProjectsData,
  type ProjectsPageContentKeys,
  type ProjectsBanner,
  type OurClients,
  type WhyPartner,
  type OurProjects,
  type ContactSection,
  type FeaturesStrip,
} from "@/lib/projects/projectsPageContent";
import { fieldClass, labelClass } from "@/constants";

type ContentForm = Omit<ComponentContent, "_id"> & {
  key: ProjectsPageContentKeys;
};

const randomId = () => Math.random().toString(36).slice(2, 9);

const cardClass = "p-2 border rounded bg-gray-50 space-y-1.5 relative";
const sectionHeaderClass =
  "text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide";
const addBtnClass =
  "text-[11px] bg-[#263016] text-white px-2 py-1 rounded";
const smallLabelClass =
  "text-[11px] text-[#5f5a50] font-semibold flex flex-col gap-0.5";
const smallFieldClass = "px-2 py-1 text-xs border rounded w-full";

export default function ProjectsComponentEditor({
  componentKey,
  title,
}: {
  componentKey: ProjectsPageContentKeys;
  title: string;
}) {
  const [form, setForm] = useState<ContentForm>({
    key: componentKey,
    label: title,
    page: "projects",
    description: "",
    isActive: true,
    data: (defaultProjectsData[componentKey] || {}) as Record<string, unknown>,
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
          key: existing.key as ProjectsPageContentKeys,
          label: existing.label,
          page: existing.page || "projects",
          description: existing.description || "",
          isActive: existing.isActive,
          data: (existing.data as Record<string, unknown>) || {},
        });
      } else {
        setEditingId(null);
        const keyInfo = projectsPageKeys.find((k) => k.key === componentKey);
        setForm((prev) => ({
          ...prev,
          key: componentKey,
          label: keyInfo?.label || title,
          description: keyInfo?.description || "",
          data: (defaultProjectsData[componentKey] || {}) as Record<
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

  const handleKeyChange = (key: ProjectsPageContentKeys) => {
    setEditingId(null);
    setForm((prev) => ({
      ...prev,
      key,
      label: projectsPageKeys.find((k) => k.key === key)?.label || prev.label,
      data: defaultProjectsData[key] as Record<string, unknown>,
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
    const data = form.data as unknown as ProjectsBanner;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>
            Title Line 1{" "}
            <input
              className={smallFieldClass}
              value={data.title?.line1 || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  title: { ...data.title, line1: e.target.value },
                })
              }
            />
          </label>
          <label className={smallLabelClass}>
            Title Line 2{" "}
            <input
              className={smallFieldClass}
              value={data.title?.line2 || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  title: { ...data.title, line2: e.target.value },
                })
              }
            />
          </label>
          <label className={smallLabelClass}>
            Subtitle{" "}
            <input
              className={smallFieldClass}
              value={data.subtitle || ""}
              onChange={(e) => setData({ ...data, subtitle: e.target.value })}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>
            Section Title{" "}
            <input
              className={smallFieldClass}
              value={data.sectionTitle || ""}
              onChange={(e) =>
                setData({ ...data, sectionTitle: e.target.value })
              }
            />
          </label>
          <label className={smallLabelClass}>
            Bg Image Alt{" "}
            <input
              className={smallFieldClass}
              value={data.bgImageAlt || ""}
              onChange={(e) => setData({ ...data, bgImageAlt: e.target.value })}
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
        <ImageUploadField
          label="Hero Image"
          value={data.heroImage}
          fieldKey="projects.banner.hero"
          uploadingField={uploadingField}
          onUploadingChange={setUploadingField}
          onError={(m) => toast.error(m)}
          onUpload={(url) => setData({ ...data, heroImage: url })}
        />
      </div>
    );
  };

  const renderWhyPartnerForm = () => {
    const data = form.data as unknown as WhyPartner;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>
          Heading{" "}
          <input
            className={smallFieldClass}
            value={data.heading || ""}
            onChange={(e) => setData({ ...data, heading: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <ImageUploadField
            label="Decorative Image"
            value={data.decorativeImageSrc}
            fieldKey="projects.whyPartner.decorative"
            uploadingField={uploadingField}
            onUploadingChange={setUploadingField}
            onError={(m) => toast.error(m)}
            onUpload={(url) => setData({ ...data, decorativeImageSrc: url })}
          />
          <label className={smallLabelClass}>
            Decorative Image Alt{" "}
            <input
              className={smallFieldClass}
              value={data.decorativeImageAlt || ""}
              onChange={(e) =>
                setData({ ...data, decorativeImageAlt: e.target.value })
              }
            />
          </label>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Features</h4>
            <button
              type="button"
              className={addBtnClass}
              onClick={() =>
                setData({
                  ...data,
                  features: [
                    ...(data.features || []),
                    {
                      id: randomId(),
                      iconSrc: "",
                      iconAlt: "",
                      title: "",
                      description: "",
                    },
                  ],
                })
              }
            >
              + Add Feature
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
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
                <ImageUploadField
                  label="Icon"
                  value={feat.iconSrc}
                  fieldKey={`projects.whyPartner.feat.${idx}`}
                  uploadingField={uploadingField}
                  onUploadingChange={setUploadingField}
                  onError={(m) => toast.error(m)}
                  onUpload={(url) => {
                    const nf = [...data.features];
                    nf[idx] = { ...nf[idx], iconSrc: url };
                    setData({ ...data, features: nf });
                  }}
                />
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
                <textarea
                  className={smallFieldClass}
                  rows={2}
                  placeholder="Description"
                  value={feat.description || ""}
                  onChange={(e) => {
                    const nf = [...data.features];
                    nf[idx] = { ...nf[idx], description: e.target.value };
                    setData({ ...data, features: nf });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOurProjectsForm = () => {
    const data = form.data as unknown as OurProjects;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>
            Title{" "}
            <input
              className={smallFieldClass}
              value={data.title || ""}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            Subtitle{" "}
            <input
              className={smallFieldClass}
              value={data.subtitle || ""}
              onChange={(e) => setData({ ...data, subtitle: e.target.value })}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>
            Button Text{" "}
            <input
              className={smallFieldClass}
              value={data.buttonText || ""}
              onChange={(e) => setData({ ...data, buttonText: e.target.value })}
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
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Project Cards</h4>
            <button
              type="button"
              className={addBtnClass}
              onClick={() =>
                setData({
                  ...data,
                  cards: [
                    ...(data.cards || []),
                    { id: randomId(), title: "", location: "", image: { imageUrl: "", alt: "" } },
                  ],
                })
              }
            >
              + Add Project
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(data.cards || []).map((card, idx) => (
              <div key={card.id} className={cardClass}>
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
                <input
                  className={smallFieldClass}
                  placeholder="Location"
                  value={card.location || ""}
                  onChange={(e) => {
                    const nc = [...data.cards];
                    nc[idx] = { ...nc[idx], location: e.target.value };
                    setData({ ...data, cards: nc });
                  }}
                />
                <ImageUploadField
                  label="Image"
                  value={card.image?.imageUrl}
                  fieldKey={`projects.ourProjects.card.${idx}`}
                  uploadingField={uploadingField}
                  onUploadingChange={setUploadingField}
                  onError={(m) => toast.error(m)}
                  onUpload={(url) => {
                    const nc = [...data.cards];
                    nc[idx] = {
                      ...nc[idx],
                      image: { ...nc[idx].image, imageUrl: url },
                    };
                    setData({ ...data, cards: nc });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOurClientsForm = () => {
    const data = form.data as unknown as OurClients;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>
            Heading{" "}
            <input
              className={smallFieldClass}
              value={data.heading || ""}
              onChange={(e) => setData({ ...data, heading: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            Subheading{" "}
            <input
              className={smallFieldClass}
              value={data.subheading || ""}
              onChange={(e) => setData({ ...data, subheading: e.target.value })}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ImageUploadField
            label="Decorative Image"
            value={data.decorativeImageSrc}
            fieldKey="projects.ourClients.decorative"
            uploadingField={uploadingField}
            onUploadingChange={setUploadingField}
            onError={(m) => toast.error(m)}
            onUpload={(url) => setData({ ...data, decorativeImageSrc: url })}
          />
          <label className={smallLabelClass}>
            Decorative Image Alt{" "}
            <input
              className={smallFieldClass}
              value={data.decorativeImageAlt || ""}
              onChange={(e) =>
                setData({ ...data, decorativeImageAlt: e.target.value })
              }
            />
          </label>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Client Logos</h4>
            <button
              type="button"
              className={addBtnClass}
              onClick={() =>
                setData({
                  ...data,
                  clients: [
                    ...(data.clients || []),
                    {
                      id: randomId(),
                      name: "",
                      imageSrc: "",
                      imageAlt: "",
                      width: 120,
                      height: 60,
                    },
                  ],
                })
              }
            >
              + Add Client
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(data.clients || []).map((client, idx) => (
              <div key={client.id} className={cardClass}>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      clients: data.clients.filter((_, i) => i !== idx),
                    })
                  }
                  className="absolute top-1 right-1 text-red-500"
                >
                  <Trash2 size={12} />
                </button>
                <input
                  className={smallFieldClass}
                  placeholder="Name"
                  value={client.name || ""}
                  onChange={(e) => {
                    const nc = [...data.clients];
                    nc[idx] = { ...nc[idx], name: e.target.value };
                    setData({ ...data, clients: nc });
                  }}
                />
                <ImageUploadField
                  label="Logo"
                  value={client.imageSrc}
                  fieldKey={`projects.ourClients.client.${idx}`}
                  uploadingField={uploadingField}
                  onUploadingChange={setUploadingField}
                  onError={(m) => toast.error(m)}
                  onUpload={(url) => {
                    const nc = [...data.clients];
                    nc[idx] = { ...nc[idx], imageSrc: url };
                    setData({ ...data, clients: nc });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Trust Stats</h4>
            <button
              type="button"
              className={addBtnClass}
              onClick={() =>
                setData({
                  ...data,
                  stats: [
                    ...(data.stats || []),
                    {
                      id: randomId(),
                      iconSrc: "",
                      iconAlt: "",
                      value: "",
                      label: "",
                    },
                  ],
                })
              }
            >
              + Add Stat
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(data.stats || []).map((stat, idx) => (
              <div key={stat.id} className={cardClass}>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      stats: data.stats.filter((_, i) => i !== idx),
                    })
                  }
                  className="absolute top-1 right-1 text-red-500"
                >
                  <Trash2 size={12} />
                </button>
                <ImageUploadField
                  label="Icon"
                  value={stat.iconSrc}
                  fieldKey={`projects.ourClients.stat.${idx}`}
                  uploadingField={uploadingField}
                  onUploadingChange={setUploadingField}
                  onError={(m) => toast.error(m)}
                  onUpload={(url) => {
                    const ns = [...data.stats];
                    ns[idx] = { ...ns[idx], iconSrc: url };
                    setData({ ...data, stats: ns });
                  }}
                />
                <input
                  className={smallFieldClass}
                  placeholder="Value"
                  value={stat.value || ""}
                  onChange={(e) => {
                    const ns = [...data.stats];
                    ns[idx] = { ...ns[idx], value: e.target.value };
                    setData({ ...data, stats: ns });
                  }}
                />
                <input
                  className={smallFieldClass}
                  placeholder="Label"
                  value={stat.label || ""}
                  onChange={(e) => {
                    const ns = [...data.stats];
                    ns[idx] = { ...ns[idx], label: e.target.value };
                    setData({ ...data, stats: ns });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContactForm = () => {
    const data = form.data as unknown as ContactSection;
    return (
      <div className="space-y-2">
        <label className={smallLabelClass}>
          Quote{" "}
          <textarea
            className={smallFieldClass}
            rows={2}
            value={data.quote || ""}
            onChange={(e) => setData({ ...data, quote: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>
            CTA Title{" "}
            <input
              className={smallFieldClass}
              value={data.ctaTitle || ""}
              onChange={(e) => setData({ ...data, ctaTitle: e.target.value })}
            />
          </label>
          <label className={smallLabelClass}>
            CTA Button Text{" "}
            <input
              className={smallFieldClass}
              value={data.ctaButtonText || ""}
              onChange={(e) =>
                setData({ ...data, ctaButtonText: e.target.value })
              }
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>
            CTA Button Path{" "}
            <input
              className={smallFieldClass}
              value={data.ctaButtonPath || ""}
              onChange={(e) =>
                setData({ ...data, ctaButtonPath: e.target.value })
              }
            />
          </label>
          <label className={smallLabelClass}>
            Bottom Text{" "}
            <input
              className={smallFieldClass}
              value={data.bottomText || ""}
              onChange={(e) => setData({ ...data, bottomText: e.target.value })}
            />
          </label>
        </div>
        <label className={smallLabelClass}>
          CTA Description{" "}
          <textarea
            className={smallFieldClass}
            rows={2}
            value={data.ctaDescription || ""}
            onChange={(e) =>
              setData({ ...data, ctaDescription: e.target.value })
            }
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <ImageUploadField
            label="Left Image"
            value={data.leftImage}
            fieldKey="projects.contact.left"
            uploadingField={uploadingField}
            onUploadingChange={setUploadingField}
            onError={(m) => toast.error(m)}
            onUpload={(url) => setData({ ...data, leftImage: url })}
          />
          <ImageUploadField
            label="Right Image"
            value={data.rightImage}
            fieldKey="projects.contact.right"
            uploadingField={uploadingField}
            onUploadingChange={setUploadingField}
            onError={(m) => toast.error(m)}
            onUpload={(url) => setData({ ...data, rightImage: url })}
          />
        </div>

        <div className="pt-2 border-t">
          <h4 className={sectionHeaderClass}>Contact Info</h4>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <label className={smallLabelClass}>
              Office Name{" "}
              <input
                className={smallFieldClass}
                value={data.contact?.officeName || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    contact: { ...data.contact, officeName: e.target.value },
                  })
                }
              />
            </label>
            <label className={smallLabelClass}>
              Phone{" "}
              <input
                className={smallFieldClass}
                value={data.contact?.phone || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    contact: { ...data.contact, phone: e.target.value },
                  })
                }
              />
            </label>
            <label className={smallLabelClass}>
              Email{" "}
              <input
                className={smallFieldClass}
                value={data.contact?.email || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    contact: { ...data.contact, email: e.target.value },
                  })
                }
              />
            </label>
          </div>
          <label className={smallLabelClass}>
            Address{" "}
            <input
              className={smallFieldClass}
              value={data.contact?.address || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  contact: { ...data.contact, address: e.target.value },
                })
              }
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className={smallLabelClass}>
              Website{" "}
              <input
                className={smallFieldClass}
                value={data.contact?.website || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    contact: { ...data.contact, website: e.target.value },
                  })
                }
              />
            </label>
            <label className={smallLabelClass}>
              Working Days{" "}
              <input
                className={smallFieldClass}
                value={data.contact?.workingDays || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    contact: { ...data.contact, workingDays: e.target.value },
                  })
                }
              />
            </label>
            <label className={smallLabelClass}>
              Working Hours{" "}
              <input
                className={smallFieldClass}
                value={data.contact?.workingHours || ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    contact: { ...data.contact, workingHours: e.target.value },
                  })
                }
              />
            </label>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className={sectionHeaderClass}>Testimonials</h4>
            <button
              type="button"
              className={addBtnClass}
              onClick={() =>
                setData({
                  ...data,
                  testimonials: [
                    ...(data.testimonials || []),
                    {
                      id: randomId(),
                      logo: "",
                      company: "",
                      person: "",
                      designation: "",
                    },
                  ],
                })
              }
            >
              + Add Testimonial
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.testimonials || []).map((item, idx) => (
              <div key={item.id} className={cardClass}>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      testimonials: data.testimonials.filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                  className="absolute top-1 right-1 text-red-500"
                >
                  <Trash2 size={12} />
                </button>
                <ImageUploadField
                  label="Logo"
                  value={item.logo}
                  fieldKey={`projects.contact.testimonial.${idx}`}
                  uploadingField={uploadingField}
                  onUploadingChange={setUploadingField}
                  onError={(m) => toast.error(m)}
                  onUpload={(url) => {
                    const nt = [...data.testimonials];
                    nt[idx] = { ...nt[idx], logo: url };
                    setData({ ...data, testimonials: nt });
                  }}
                />
                <input
                  className={smallFieldClass}
                  placeholder="Company"
                  value={item.company || ""}
                  onChange={(e) => {
                    const nt = [...data.testimonials];
                    nt[idx] = { ...nt[idx], company: e.target.value };
                    setData({ ...data, testimonials: nt });
                  }}
                />
                <input
                  className={smallFieldClass}
                  placeholder="Person"
                  value={item.person || ""}
                  onChange={(e) => {
                    const nt = [...data.testimonials];
                    nt[idx] = { ...nt[idx], person: e.target.value };
                    setData({ ...data, testimonials: nt });
                  }}
                />
                <input
                  className={smallFieldClass}
                  placeholder="Designation"
                  value={item.designation || ""}
                  onChange={(e) => {
                    const nt = [...data.testimonials];
                    nt[idx] = { ...nt[idx], designation: e.target.value };
                    setData({ ...data, testimonials: nt });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFeaturesStripForm = () => {
    const data = form.data as unknown as FeaturesStrip;
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
                items: [
                  ...(data.items || []),
                  {
                    id: randomId(),
                    title: "",
                    description: "",
                    image: { imageUrl: "", alt: "" },
                  },
                ],
              })
            }
          >
            + Add Item
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(data.items || []).map((item, idx) => (
            <div key={item.id} className={cardClass}>
              <button
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    items: data.items.filter((_, i) => i !== idx),
                  })
                }
                className="absolute top-1 right-1 text-red-500"
              >
                <Trash2 size={12} />
              </button>
              <input
                className={smallFieldClass}
                placeholder="Title"
                value={item.title || ""}
                onChange={(e) => {
                  const ni = [...data.items];
                  ni[idx] = { ...ni[idx], title: e.target.value };
                  setData({ ...data, items: ni });
                }}
              />
              <textarea
                className={smallFieldClass}
                rows={2}
                placeholder="Description"
                value={item.description || ""}
                onChange={(e) => {
                  const ni = [...data.items];
                  ni[idx] = { ...ni[idx], description: e.target.value };
                  setData({ ...data, items: ni });
                }}
              />
              <ImageUploadField
                label="Image"
                value={item.image?.imageUrl}
                fieldKey={`projects.strip.${idx}`}
                uploadingField={uploadingField}
                onUploadingChange={setUploadingField}
                onError={(m) => toast.error(m)}
                onUpload={(url) => {
                  const ni = [...data.items];
                  ni[idx] = {
                    ...ni[idx],
                    image: { ...ni[idx].image, imageUrl: url },
                  };
                  setData({ ...data, items: ni });
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
            Projects & Clients Page Content
          </h1>
          <p className="mt-1 text-[#5f5a50] text-xs leading-snug max-w-xl">
            Manage sections of the projects page. Select an existing component
            to edit.
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
                      handleKeyChange(
                        e.target.value as ProjectsPageContentKeys
                      )
                    }
                  >
                    {projectsPageKeys.map((k) => (
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

                {form.key === "projects.banner" && renderBannerForm()}
                {form.key === "projects.whyPartner" && renderWhyPartnerForm()}
                {form.key === "projects.ourProjects" &&
                  renderOurProjectsForm()}
                {form.key === "projects.ourClients" && renderOurClientsForm()}
                {form.key === "projects.contactSection" &&
                  renderContactForm()}
                {form.key === "projects.features_strip" &&
                  renderFeaturesStripForm()}
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
