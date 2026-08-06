"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { componentContentApi, getImageUrl, uploadImage, type ComponentContent } from "@/lib/api";
import {
  buildEmptyHomepageContent,
  createHomepageData,
  homepageKeys,
  normalizeHomepageData,
  type HomepageComponentKey,
  type HomepageData,
  type HomeGlobalPresenceStat,
  type HomeHeroSlide,
  type HomeFeaturesFeature,
  type HomeTurnkeySolution,
  validateHomepageContent,
} from "@/lib/homepageContent";
import Image from "next/image";
import RichTextEditor from "@/components/common/RichTextEditor";
import ConfirmDialog from "@/components/common/ConfirmDialog";

type ContentForm = Omit<ComponentContent, "_id"> & { key: HomepageComponentKey };

const smallLabelClass = "mb-0 block text-[10px] font-medium";
const smallFieldClass = "w-full rounded border border-slate-200 px-1.5 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-500";
const smallCardClass = "rounded-lg border border-[#ded3c4] bg-white p-1.5 shadow-sm";
const smallBtnClass = "inline-flex items-center gap-1 rounded border border-[#d9cdbb] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#263016]";
const smallPrimaryBtnClass = "inline-flex items-center gap-1 rounded bg-[#263016] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white";
const smallDangerBtnClass = "rounded border border-[#e0b4a0] bg-white px-1.5 py-0.5 text-[10px] text-[#9b2e2e]";
const smallIconBtnClass = "rounded border border-[#d9cdbb] bg-white p-0.5 text-[#263016] disabled:opacity-50";
const summaryClass = "flex cursor-pointer select-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden";
const cardBodyClass = "mt-1.5";

const moveArrayItem = <T,>(items: T[], index: number, direction: number) => {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const item = next.splice(index, 1)[0];
  next.splice(target, 0, item);
  return next;
};

const ImageUploadField = ({
  label,
  value,
  fieldKey,
  onUpload,
  uploadingField,
  onUploadingChange,
  onError,
}: {
  label: string;
  value: string;
  fieldKey: string;
  onUpload: (url: string) => void;
  uploadingField: string | null;
  onUploadingChange: (field: string | null) => void;
  onError: (message: string) => void;
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="mb-1">
      <div className="mb-0.5 flex items-center justify-between gap-2">
        <label className={smallLabelClass}>{label}</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-0.5 rounded border border-[#d9cdbb] bg-white px-1.5 py-0.5 text-[10px] text-[#263016]"
        >
          {uploadingField === fieldKey ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <ImagePlus className="h-2.5 w-2.5" />}
          Upload
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try {
            onUploadingChange(fieldKey);
            onError("");
            const url = await uploadImage(file);
            onUpload(url);
          } catch (error) {
            onError((error as Error).message || "Image upload failed.");
          } finally {
            onUploadingChange(null);
          }
        }}
      />
      <input className={smallFieldClass} type="text" value={value} readOnly placeholder="Uploaded image URL" />
      {value ? (
        <Image height={24} width={24} src={getImageUrl(value)} alt={label} className="mt-0.5 h-12 w-full max-w-[120px] rounded-md object-cover shadow-sm" />
      ) : null}
    </div>
  );
};

export default function HomepageContentAdminPage() {
  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [form, setForm] = useState<ContentForm>(buildEmptyHomepageContent("home.hero"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ message: string; id: string } | null>(null);

  const knownKeys = useMemo(() => homepageKeys.map((item) => item.key), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const list = await componentContentApi.list();
      setRecords(list);
      return list;
    } catch (error) {
      setStatusMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const setData = (nextData: HomepageData) => setForm((current) => ({ ...current, data: nextData }));

  const resetForm = (key: HomepageComponentKey = "home.hero") => {
    setEditingId(null);
    setErrors([]);
    setStatusMessage("");
    setForm(buildEmptyHomepageContent(key));
  };

  const startNew = () => resetForm("home.hero");

  const handleSelectRecord = useCallback((record: ComponentContent) => {
    if (!knownKeys.includes(record.key as HomepageComponentKey)) {
      setStatusMessage(`Cannot edit record with unsupported key: ${record.key}`);
      return;
    }
    setEditingId(record._id);
    setErrors([]);
    setStatusMessage("");
    setForm({
      key: record.key as HomepageComponentKey,
      label: record.label,
      page: record.page || "home",
      description: record.description || "",
      isActive: record.isActive,
      data: normalizeHomepageData(
        record.key as HomepageComponentKey,
        record.data as HomepageData
      ),
    });
  }, [knownKeys]);

  const handleKeyChange = useCallback((key: HomepageComponentKey) => {
    setForm((current) => ({
      ...current,
      key,
      data: current.key === key ? current.data : createHomepageData(key),
    }));
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh().then((list) => {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const componentKey = params.get("component");
          if (componentKey && list) {
            const found = list.find((rec) => rec.key === componentKey);
            if (found) {
              handleSelectRecord(found);
            } else if (knownKeys.includes(componentKey as HomepageComponentKey)) {
              handleKeyChange(componentKey as HomepageComponentKey);
            }
          }
        }
      });
    });
  }, [refresh, handleSelectRecord, handleKeyChange, knownKeys]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors([]);
    setStatusMessage("");
    const payload: ContentForm = {
      key: form.key,
      label: form.label.trim(),
      page: form.page.trim() || "home",
      description: form.description?.trim() ?? "",
      isActive: form.isActive,
      data: normalizeHomepageData(form.key, form.data as HomepageData),
    };

    let validationErrors = validateHomepageContent(payload);

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await componentContentApi.update(editingId, payload);
        setStatusMessage("Component saved successfully.");
      } else {
        await componentContentApi.create(payload);
        setStatusMessage("Component created successfully.");
      }
      await refresh();
      resetForm(payload.key);
    } catch (error) {
      setStatusMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setStatusMessage("");
    try {
      await componentContentApi.remove(id);
      setStatusMessage("Component deleted.");
      if (editingId === id) resetForm();
      await refresh();
    } catch (error) {
      setStatusMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteClick = (id: string, message: string) => setPendingDelete({ id, message });

  const renderHeroEditor = () => {
    const heroData = form.data as { slides: HomeHeroSlide[] };
    const defaultHeroSlide = (createHomepageData("home.hero") as { slides: HomeHeroSlide[] }).slides[0];
    return (
      <div className={smallCardClass}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#8d6a3a]">Home Hero</div>
            <p className="text-[10px] text-[#5f5a50]">Manage slides, buttons, list items, and hero settings.</p>
          </div>
          <button type="button" onClick={() => setData({ slides: [...heroData.slides, defaultHeroSlide] })} className={smallPrimaryBtnClass}>
            <Plus size={10} /> Add slide
          </button>
        </div>
        {heroData.slides.map((slide, index) => (
          <details key={slide.id} className="mb-1 rounded-lg border border-[#f0e7d8] bg-[#faf5ee] p-1.5" open={index === 0}>
            <summary className={summaryClass}>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1f261b]">
                <ChevronDown size={10} className="text-[#8d6a3a]" /> Slide {index + 1}
              </span>
              <span className="flex items-center gap-1">
                <button type="button" disabled={index === 0} onClick={() => setData({ slides: moveArrayItem(heroData.slides, index, -1) })} className={smallIconBtnClass}>
                  <ArrowUp size={10} />
                </button>
                <button type="button" disabled={index === heroData.slides.length - 1} onClick={() => setData({ slides: moveArrayItem(heroData.slides, index, 1) })} className={smallIconBtnClass}>
                  <ArrowDown size={10} />
                </button>
                <button type="button" onClick={() => setData({ slides: heroData.slides.filter((_, indexToRemove) => indexToRemove !== index) })} className={smallDangerBtnClass}>
                  Remove
                </button>
              </span>
            </summary>
            <div className={cardBodyClass}>
              <ImageUploadField
                label="Slide image"
                value={slide.image}
                fieldKey={`hero-image-${slide.id}`}
                uploadingField={uploadingField}
                onUploadingChange={setUploadingField}
                onError={setStatusMessage}
                onUpload={(url) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, image: url } : item)) })}
              />
              <div className="grid gap-1 md:grid-cols-2">
                <label className={smallLabelClass}>
                  Title
                  <input className={smallFieldClass} type="text" value={slide.title} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)) })} />
                </label>
                <label className={smallLabelClass}>
                  Highlight
                  <input className={smallFieldClass} type="text" value={slide.highlight || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, highlight: event.target.value } : item)) })} />
                </label>
              </div>
              <label className={smallLabelClass}>
                Description
                <textarea className={smallFieldClass} rows={1} value={slide.description || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, description: event.target.value } : item)) })} />
              </label>
              <div className="grid gap-1 md:grid-cols-2">
                <label className={smallLabelClass}>
                  Primary button text
                  <input className={smallFieldClass} type="text" value={slide.primaryButtonText || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, primaryButtonText: event.target.value } : item)) })} />
                </label>
                <label className={smallLabelClass}>
                  Primary button href
                  <input className={smallFieldClass} type="text" value={slide.primaryButtonHref || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, primaryButtonHref: event.target.value } : item)) })} />
                </label>
              </div>
              <div className="grid gap-1 md:grid-cols-2">
                <label className={smallLabelClass}>
                  Secondary button text
                  <input className={smallFieldClass} type="text" value={slide.secondaryButtonText || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, secondaryButtonText: event.target.value } : item)) })} />
                </label>
                <label className={smallLabelClass}>
                  Secondary button href
                  <input className={smallFieldClass} type="text" value={slide.secondaryButtonHref || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, secondaryButtonHref: event.target.value } : item)) })} />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-1 text-[10px] text-[#5f5a50]">
                  <input type="checkbox" checked={slide.showLutus || false} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, showLutus: event.target.checked } : item)) })} />
                  Show Lutus
                </label>
                <label className="flex items-center gap-1 text-[10px] text-[#5f5a50]">
                  <input type="checkbox" checked={slide.isCenter || false} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, isCenter: event.target.checked } : item)) })} />
                  Center layout
                </label>
              </div>
              <details className="mt-1 rounded-lg bg-white p-1.5">
                <summary className={summaryClass}>
                  <p className="text-[11px] font-semibold text-[#1f261b]">List Items</p>
                  <button type="button" onClick={() => setData({ slides: heroData.slides.map((item, itemIndex) => itemIndex === index ? { ...item, listItems: [...(item.listItems || []), ""] } : item) })} className={smallBtnClass}>
                    <Plus size={10} /> Add item
                  </button>
                </summary>
                <div className="mt-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {(slide.listItems || []).map((listItem, listIndex) => (
                    <div key={listIndex} className="flex gap-1">
                      <input
                        className={`${smallFieldClass} flex-1`}
                        type="text"
                        value={listItem}
                        onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => {
                          if (itemIndex !== index) return item;
                          const nextList = [...(item.listItems || [])];
                          nextList[listIndex] = event.target.value;
                          return { ...item, listItems: nextList };
                        }) })}
                      />
                      <button
                        type="button"
                        onClick={() => setData({ slides: heroData.slides.map((item, itemIndex) => {
                          if (itemIndex !== index) return item;
                          return { ...item, listItems: (item.listItems || []).filter((_, listIdx) => listIdx !== listIndex) };
                        }) })}
                        className={smallDangerBtnClass}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </details>
              <details className="mt-1 rounded-lg bg-white p-1.5">
                <summary className={summaryClass}>
                  <p className="text-[11px] font-semibold text-[#1f261b]">Features</p>
                  <button type="button" onClick={() => setData({ slides: heroData.slides.map((item, itemIndex) => itemIndex === index ? { ...item, features: [...(item.features || []), { imgUrl: "", title: "" }] } : item) })} className={smallBtnClass}>
                    <Plus size={10} /> Add feature
                  </button>
                </summary>
                <div className="mt-1 grid gap-1 md:grid-cols-2 lg:grid-cols-3">
                  {(slide.features || []).map((feature, featureIndex) => (
                    <div key={featureIndex} className="rounded-lg border border-[#e5dfd5] bg-[#fbf8f3] p-1.5">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-[10px] font-semibold text-[#1f261b]">Feature {featureIndex + 1}</p>
                        <button
                          type="button"
                          onClick={() => setData({ slides: heroData.slides.map((item, itemIndex) => {
                            if (itemIndex !== index) return item;
                            const nextFeatures = [...(item.features || [])];
                            nextFeatures.splice(featureIndex, 1);
                            return { ...item, features: nextFeatures };
                          }) })}
                          className={smallDangerBtnClass}
                        >
                          Remove
                        </button>
                      </div>
                      <ImageUploadField
                        label="Feature image"
                        value={feature.imgUrl}
                        fieldKey={`hero-slide-${slide.id}-feature-img-${featureIndex}`}
                        uploadingField={uploadingField}
                        onUploadingChange={setUploadingField}
                        onError={setStatusMessage}
                        onUpload={(url) => setData({ slides: heroData.slides.map((item, itemIndex) => {
                          if (itemIndex !== index) return item;
                          const nextFeatures = [...(item.features || [])];
                          nextFeatures[featureIndex] = { ...nextFeatures[featureIndex], imgUrl: url };
                          return { ...item, features: nextFeatures };
                        }) })}
                      />
                      <label className={smallLabelClass}>
                        Feature title
                        <input className={smallFieldClass} type="text" value={feature.title} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => {
                          if (itemIndex !== index) return item;
                          const nextFeatures = [...(item.features || [])];
                          nextFeatures[featureIndex] = { ...nextFeatures[featureIndex], title: event.target.value };
                          return { ...item, features: nextFeatures };
                        }) })} />
                      </label>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </details>
        ))}
      </div>
    );
  };

  const renderWellnessSectionEditor = () => {
    const wellnessData = form.data as {
      welcomeImage: string;
      eyebrow: string;
      heading: string;
      description: string;
      buttonText: string;
      buttonHref: string;
      services: { image: string; title: string; description: string, link:string }[];
    };
    return (
      <div className={smallCardClass}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#8d6a3a]">Wellness Section</div>
            <p className="text-[10px] text-[#5f5a50]">Manage welcome info, welcome image, and services list.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setData({
                ...wellnessData,
                services: [
                  ...(wellnessData.services || []),
                  { image: "", title: "", description: "", link: "" },
                ],
              })
            }
            className={smallPrimaryBtnClass}
          >
            <Plus size={10} /> Add Service
          </button>
        </div>
        <div className="grid gap-1 md:grid-cols-2">
          <label className={smallLabelClass}>
            Eyebrow
            <input className={smallFieldClass} type="text" value={wellnessData.eyebrow} onChange={(event) => setData({ ...wellnessData, eyebrow: event.target.value })} />
          </label>
          <label className={smallLabelClass}>
            Heading
            <input className={smallFieldClass} type="text" value={wellnessData.heading} onChange={(event) => setData({ ...wellnessData, heading: event.target.value })} />
          </label>
        </div>
        <label className={smallLabelClass}>
          Description
          <textarea className={smallFieldClass} rows={1} value={wellnessData.description} onChange={(event) => setData({ ...wellnessData, description: event.target.value })} />
        </label>
        <div className="grid gap-1 md:grid-cols-2">
          <label className={smallLabelClass}>
            Button Text
            <input className={smallFieldClass} type="text" value={wellnessData.buttonText} onChange={(event) => setData({ ...wellnessData, buttonText: event.target.value })} />
          </label>
          <label className={smallLabelClass}>
            Button Href
            <input className={smallFieldClass} type="text" value={wellnessData.buttonHref} onChange={(event) => setData({ ...wellnessData, buttonHref: event.target.value })} />
          </label>
        </div>
        <ImageUploadField
          label="Welcome Image"
          value={wellnessData.welcomeImage}
          fieldKey="wellness-welcome-image"
          uploadingField={uploadingField}
          onUploadingChange={setUploadingField}
          onError={setStatusMessage}
          onUpload={(url) => setData({ ...wellnessData, welcomeImage: url })}
        />

        <div className="mt-1 border-t border-[#f0e7d8] pt-1">
          <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#263016]">Service Cards</h3>
          <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3">
            {(wellnessData.services || []).map((service, index) => (
              <details key={index} className="rounded-lg border border-[#f0e7d8] bg-[#faf5ee] p-1.5" open={index === 0}>
                <summary className={summaryClass}>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1f261b]">
                    <ChevronDown size={10} className="text-[#8d6a3a]" /> Service Card {index + 1}
                  </span>
                  <span className="flex items-center gap-1">
                    <button type="button" disabled={index === 0} onClick={() => setData({ ...wellnessData, services: moveArrayItem(wellnessData.services, index, -1) })} className={smallIconBtnClass}>
                      <ArrowUp size={10} />
                    </button>
                    <button type="button" disabled={index === wellnessData.services.length - 1} onClick={() => setData({ ...wellnessData, services: moveArrayItem(wellnessData.services, index, 1) })} className={smallIconBtnClass}>
                      <ArrowDown size={10} />
                    </button>
                    <button type="button" onClick={() => setData({ ...wellnessData, services: wellnessData.services.filter((_, indexToRemove) => indexToRemove !== index) })} className={smallDangerBtnClass}>
                      Remove
                    </button>
                  </span>
                </summary>
                <div className={cardBodyClass}>
                  <ImageUploadField
                    label="Service Image"
                    value={service.image}
                    fieldKey={`wellness-service-image-${index}`}
                    uploadingField={uploadingField}
                    onUploadingChange={setUploadingField}
                    onError={setStatusMessage}
                    onUpload={(url) => setData({
                      ...wellnessData,
                      services: wellnessData.services.map((item, itemIndex) => (itemIndex === index ? { ...item, image: url } : item))
                    })}
                  />
                  <div className="grid gap-1 md:grid-cols-2">
                    <label className={smallLabelClass}>
                      Title
                      <input className={smallFieldClass} type="text" value={service.title} onChange={(event) => setData({
                        ...wellnessData,
                        services: wellnessData.services.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item))
                      })} />
                    </label>
                    <label className={smallLabelClass}>
                      Link
                      <input
                        className={smallFieldClass}
                        type="text"
                        placeholder="/products/steam-chambers"
                        value={service.link}
                        onChange={(event) => setData({
                          ...wellnessData,
                          services: wellnessData.services.map((item, itemIndex) => (itemIndex === index ? { ...item, link: event.target.value } : item))
                        })}
                      />
                    </label>
                  </div>
                  <label className={smallLabelClass}>
                    Description
                    <textarea className={smallFieldClass} rows={1} value={service.description} onChange={(event) => setData({
                      ...wellnessData,
                      services: wellnessData.services.map((item, itemIndex) => (itemIndex === index ? { ...item, description: event.target.value } : item))
                    })} />
                  </label>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFeaturesEditor = () => {
    const featureData = form.data as { features: HomeFeaturesFeature[] };
    return (
      <div className={smallCardClass}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#8d6a3a]">Home Features</div>
            <p className="text-[10px] text-[#5f5a50]">Manage feature cards for the homepage.</p>
          </div>
          <button type="button" onClick={() => setData({ features: [...featureData.features, { imgUrl: "", title: "", desc: "" }] })} className={smallPrimaryBtnClass}>
            <Plus size={10} /> Add feature
          </button>
        </div>
        <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3">
          {featureData.features.map((feature, index) => (
            <details key={index} className="rounded-lg border border-[#f0e7d8] bg-[#faf5ee] p-1.5" open={index === 0}>
              <summary className={summaryClass}>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1f261b]">
                  <ChevronDown size={10} className="text-[#8d6a3a]" /> Feature {index + 1}
                </span>
                <span className="flex items-center gap-1">
                  <button type="button" disabled={index === 0} onClick={() => setData({ features: moveArrayItem(featureData.features, index, -1) })} className={smallIconBtnClass}>
                    <ArrowUp size={10} />
                  </button>
                  <button type="button" disabled={index === featureData.features.length - 1} onClick={() => setData({ features: moveArrayItem(featureData.features, index, 1) })} className={smallIconBtnClass}>
                    <ArrowDown size={10} />
                  </button>
                  <button type="button" onClick={() => setData({ features: featureData.features.filter((_, indexToRemove) => indexToRemove !== index) })} className={smallDangerBtnClass}>
                    Remove
                  </button>
                </span>
              </summary>
              <div className={cardBodyClass}>
                <ImageUploadField
                  label="Feature image"
                  value={feature.imgUrl}
                  fieldKey={`feature-image-${index}`}
                  uploadingField={uploadingField}
                  onUploadingChange={setUploadingField}
                  onError={setStatusMessage}
                  onUpload={(url) => setData({ features: featureData.features.map((item, itemIndex) => (itemIndex === index ? { ...item, imgUrl: url } : item)) })}
                />
                <label className={smallLabelClass}>
                  Title
                  <input className={smallFieldClass} type="text" value={feature.title} onChange={(event) => setData({ features: featureData.features.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)) })} />
                </label>
                <label className={smallLabelClass}>
                  Description
                  <textarea className={smallFieldClass} rows={1} value={feature.desc} onChange={(event) => setData({ features: featureData.features.map((item, itemIndex) => (itemIndex === index ? { ...item, desc: event.target.value } : item)) })} />
                </label>
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  };

  const renderTurnkeyEditor = () => {
    const turnkeyData = form.data as {
      eyebrow: string;
      heading: string;
      description: string;
      buttonText: string;
      buttonHref?: string;
      backgroundImage: string;
      solutions: HomeTurnkeySolution[];
    };
    return (
      <div className={smallCardClass}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#8d6a3a]">Turnkey Solutions</div>
            <p className="text-[10px] text-[#5f5a50]">Manage the turnkey solutions section and service cards.</p>
          </div>
          <button type="button" onClick={() => setData({ ...turnkeyData, solutions: [...turnkeyData.solutions, { imgUrl: "", title: "" }] })} className={smallPrimaryBtnClass}>
            <Plus size={10} /> Add solution
          </button>
        </div>
        <div className="grid gap-1 md:grid-cols-2">
          <label className={smallLabelClass}>
            Eyebrow
            <input className={smallFieldClass} type="text" value={turnkeyData.eyebrow} onChange={(event) => setData({ ...turnkeyData, eyebrow: event.target.value })} />
          </label>
          <label className={smallLabelClass}>
            Heading
            <textarea className={smallFieldClass} rows={1} value={turnkeyData.heading} onChange={(event) => setData({ ...turnkeyData, heading: event.target.value })} />
          </label>
        </div>
        <label className={smallLabelClass}>
          Description
          <textarea className={smallFieldClass} rows={1} value={turnkeyData.description} onChange={(event) => setData({ ...turnkeyData, description: event.target.value })} />
        </label>
        <div className="grid gap-1 md:grid-cols-2">
          <label className={smallLabelClass}>
            Button text
            <input className={smallFieldClass} type="text" value={turnkeyData.buttonText} onChange={(event) => setData({ ...turnkeyData, buttonText: event.target.value })} />
          </label>
          <label className={smallLabelClass}>
            Button href
            <input className={smallFieldClass} type="text" value={turnkeyData.buttonHref || ""} onChange={(event) => setData({ ...turnkeyData, buttonHref: event.target.value })} />
          </label>
        </div>
        <ImageUploadField
          label="Background image"
          value={turnkeyData.backgroundImage}
          fieldKey="turnkey-background"
          uploadingField={uploadingField}
          onUploadingChange={setUploadingField}
          onError={setStatusMessage}
          onUpload={(url) => setData({ ...turnkeyData, backgroundImage: url })}
        />
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {turnkeyData.solutions.map((solution, index) => (
            <details key={index} className="rounded-lg border border-[#f0e7d8] bg-[#faf5ee] p-1.5" open={index === 0}>
              <summary className={summaryClass}>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1f261b]">
                  <ChevronDown size={10} className="text-[#8d6a3a]" /> Solution {index + 1}
                </span>
                <span className="flex items-center gap-1">
                  <button type="button" disabled={index === 0} onClick={() => setData({ ...turnkeyData, solutions: moveArrayItem(turnkeyData.solutions, index, -1) })} className={smallIconBtnClass}>
                    <ArrowUp size={10} />
                  </button>
                  <button type="button" disabled={index === turnkeyData.solutions.length - 1} onClick={() => setData({ ...turnkeyData, solutions: moveArrayItem(turnkeyData.solutions, index, 1) })} className={smallIconBtnClass}>
                    <ArrowDown size={10} />
                  </button>
                  <button type="button" onClick={() => setData({ ...turnkeyData, solutions: turnkeyData.solutions.filter((_, indexToRemove) => indexToRemove !== index) })} className={smallDangerBtnClass}>
                    Remove
                  </button>
                </span>
              </summary>
              <div className={cardBodyClass}>
                <ImageUploadField
                  label="Solution image"
                  value={solution.imgUrl}
                  fieldKey={`turnkey-solution-image-${index}`}
                  uploadingField={uploadingField}
                  onUploadingChange={setUploadingField}
                  onError={setStatusMessage}
                  onUpload={(url) => setData({ ...turnkeyData, solutions: turnkeyData.solutions.map((item, itemIndex) => (itemIndex === index ? { ...item, imgUrl: url } : item)) })}
                />
                <label className={smallLabelClass}>
                  Title
                  <input className={smallFieldClass} type="text" value={solution.title} onChange={(event) => setData({ ...turnkeyData, solutions: turnkeyData.solutions.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)) })} />
                </label>
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  };

  const renderGlobalPresenceEditor = () => {
    const presenceData = form.data as {
      eyebrow: string;
      heading: string;
      description: string;
      image: string;
      stats: HomeGlobalPresenceStat[];
    };
    return (
      <div className={smallCardClass}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#8d6a3a]">Global Presence</div>
            <p className="text-[10px] text-[#5f5a50]">Manage global presence text, image, and statistics.</p>
          </div>
          <button type="button" onClick={() => setData({ ...presenceData, stats: [...presenceData.stats, { value: "", label: "" }] })} className={smallPrimaryBtnClass}>
            <Plus size={10} /> Add stat
          </button>
        </div>
        <div className="grid gap-1 md:grid-cols-2">
          <label className={smallLabelClass}>
            Eyebrow
            <input className={smallFieldClass} type="text" value={presenceData.eyebrow} onChange={(event) => setData({ ...presenceData, eyebrow: event.target.value })} />
          </label>
          <label className={smallLabelClass}>
            Heading
            <textarea className={smallFieldClass} rows={1} value={presenceData.heading} onChange={(event) => setData({ ...presenceData, heading: event.target.value })} />
          </label>
        </div>
        <label className={smallLabelClass}>
          Description
          <textarea className={smallFieldClass} rows={1} value={presenceData.description} onChange={(event) => setData({ ...presenceData, description: event.target.value })} />
        </label>
        <ImageUploadField
          label="Main image"
          value={presenceData.image}
          fieldKey="global-presence-image"
          uploadingField={uploadingField}
          onUploadingChange={setUploadingField}
          onError={setStatusMessage}
          onUpload={(url) => setData({ ...presenceData, image: url })}
        />
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
          {presenceData.stats.map((stat, index) => (
            <details key={index} className="rounded-lg border border-[#f0e7d8] bg-[#faf5ee] p-1.5" open={index === 0}>
              <summary className={summaryClass}>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#1f261b]">
                  <ChevronDown size={10} className="text-[#8d6a3a]" /> Stat {index + 1}
                </span>
                <span className="flex items-center gap-1">
                  <button type="button" disabled={index === 0} onClick={() => setData({ ...presenceData, stats: moveArrayItem(presenceData.stats, index, -1) })} className={smallIconBtnClass}>
                    <ArrowUp size={10} />
                  </button>
                  <button type="button" disabled={index === presenceData.stats.length - 1} onClick={() => setData({ ...presenceData, stats: moveArrayItem(presenceData.stats, index, 1) })} className={smallIconBtnClass}>
                    <ArrowDown size={10} />
                  </button>
                  <button type="button" onClick={() => setData({ ...presenceData, stats: presenceData.stats.filter((_, indexToRemove) => indexToRemove !== index) })} className={smallDangerBtnClass}>
                    Remove
                  </button>
                </span>
              </summary>
              <div className={cardBodyClass}>
                <label className={smallLabelClass}>
                  Value
                  <input className={smallFieldClass} type="text" value={stat.value} onChange={(event) => setData({ ...presenceData, stats: presenceData.stats.map((item, itemIndex) => (itemIndex === index ? { ...item, value: event.target.value } : item)) })} />
                </label>
                <label className={smallLabelClass}>
                  Label
                  <input className={smallFieldClass} type="text" value={stat.label} onChange={(event) => setData({ ...presenceData, stats: presenceData.stats.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item)) })} />
                </label>
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#1f261b]">
      <div className="mx-auto max-w-7xl px-2 py-2">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {statusMessage ? (
              <div className="inline-flex items-center gap-1 rounded bg-[#eef7e8] px-1.5 py-0.5 text-[11px] text-[#2f5f31]">
                <CheckCircle size={10} /> {statusMessage}
              </div>
            ) : null}
            {loading ? (
              <div className="inline-flex items-center gap-1 rounded bg-[#fff8e4] px-1.5 py-0.5 text-[11px] text-[#6f542f]"><Loader2 className="h-2.5 w-2.5 animate-spin" /> Loading…</div>
            ) : null}
          </div>
        </div>

        <div>
          <section className="space-y-1.5">
            <div className={smallCardClass}>
              <div className="mb-1 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{editingId ? "Edit component" : "Create component"}</h2>
                  <p className="text-[10px] text-[#5f5a50]">Select a known homepage key and fill the structured form fields.</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button type="button" onClick={startNew} className={smallBtnClass}>
                    <Plus size={10} /> New
                  </button>
                  {editingId ? (
                    <button type="button" onClick={() => confirmDeleteClick(editingId, "Delete this component? This cannot be undone.")} className="inline-flex items-center gap-1 rounded border border-[#e0b4a0] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#9b2e2e]">
                      <Trash2 size={10} /> Delete
                    </button>
                  ) : null}
                </div>
              </div>
              <form onSubmit={handleSave} className="space-y-1.5">
                <div className="grid gap-1 sm:grid-cols-2">
                  <label className={smallLabelClass}>
                    Component key
                    <select className={smallFieldClass} value={form.key} onChange={(event) => handleKeyChange(event.target.value as HomepageComponentKey)}>
                      {homepageKeys.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={smallLabelClass}>
                    Label
                    <input className={smallFieldClass} type="text" value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} />
                  </label>
                </div>
                <div className="grid gap-1 sm:grid-cols-2">
                  <label className={smallLabelClass}>
                    Page
                    <input className={smallFieldClass} type="text" value={form.page} onChange={(event) => setForm((current) => ({ ...current, page: event.target.value }))} />
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] text-[#5f5a50]">
                    <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
                    Active
                  </label>
                </div>
                <label className={smallLabelClass}>
                  Description
                  <div>
                    <RichTextEditor
                      value={form.description || ""}
                      onChange={val => setForm((current) => ({ ...current, description: val }))}
                      placeholder="Enter component description..."
                      minHeight="60px"
                    />
                  </div>
                </label>

                {form.key === "home.hero" && renderHeroEditor()}
                {form.key === "home.wellnessSection" && renderWellnessSectionEditor()}
                {form.key === "home.features" && renderFeaturesEditor()}
                {form.key === "home.turnkeySolutions" && renderTurnkeyEditor()}
                {form.key === "home.globalPresence" && renderGlobalPresenceEditor()}

                {errors.length ? (
                  <div className="rounded-lg border border-[#f0d6d8] bg-[#fff1f3] p-1.5 text-[11px] text-[#9b2e2e]">
                    <p className="font-semibold">Please fix the following:</p>
                    <ul className="mt-0.5 list-disc space-y-0 pl-3">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-1.5">
                  <button type="submit" disabled={loading} className="inline-flex items-center gap-1 rounded bg-[#263016] px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-60">
                    <Save size={12} /> {editingId ? "Save changes" : "Create component"}
                  </button>
                  <button type="button" onClick={() => resetForm(form.key)} className="rounded border border-[#d9cdbb] bg-white px-3 py-1 text-[11px] font-semibold text-[#263016]">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
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
    </main>
  );
}
