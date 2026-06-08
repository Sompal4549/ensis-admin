"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { componentContentApi, getImageUrl, uploadImage, type ComponentContent } from "@/lib/api";
import ComponentList from "@/components/common/ComponentList";
import {
  buildEmptyHomepageContent,
  createHomepageData,
  homepageKeys,
  type HomepageComponentKey,
  type HomepageData,
  type HomeGlobalPresenceStat,
  type HomeHeroSlide,
  type HomeFeaturesFeature,
  type HomeTurnkeySolution,
  validateHomepageContent,
} from "@/lib/homepageContent";
import { labelClass, fieldClass, cardClass } from "@/constants";
import Image from "next/image";

type ContentForm = Omit<ComponentContent, "_id"> & { key: HomepageComponentKey };

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
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className={labelClass}>{label}</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-3 py-2 text-sm text-[#263016]"
        >
          {uploadingField === fieldKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
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
      <input className={fieldClass} type="text" value={value} readOnly placeholder="Uploaded image URL" />
      {value ? (
        <Image height={24} width={24} src={getImageUrl(value)} alt={label} className="mt-3 h-24 w-full max-w-xs rounded-md object-cover shadow-sm" />
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
      data: record.data as HomepageData,
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

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(records);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Optimistically update the UI order
    setRecords(items);

    try {
      // Persist the new index for all items in the list to ensure sync
      await Promise.all(
        items.map((item, index) => 
          componentContentApi.update(item._id, { index })
        )
      );
      toast.success("Component order saved successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save new order";
      toast.error(message);
      refresh(); // Revert to server state if the API call fails
    }
  };

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
      data: form.data,
    };

    let validationErrors = validateHomepageContent(payload);
    
    // Filter out Heading requirement for Features components
    if (form.key === "home.fullWidthFeatures" || form.key === "home.features") {
      validationErrors = validationErrors.filter((err) => err !== "Heading is required.");
    }

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
    const confirmed = window.confirm("Delete this component? This cannot be undone.");
    if (!confirmed) return;
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

  const renderHeroEditor = () => {
    const heroData = form.data as { slides: HomeHeroSlide[] };
    const defaultHeroSlide = (createHomepageData("home.hero") as { slides: HomeHeroSlide[] }).slides[0];
    return (
      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#8d6a3a]">Home Hero</div>
            <p className="mt-1 text-sm text-[#5f5a50]">Manage slides, buttons, list items, and hero settings.</p>
          </div>
          <button type="button" onClick={() => setData({ slides: [...heroData.slides, defaultHeroSlide] })} className="inline-flex items-center gap-2 rounded-md bg-[#263016] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            <Plus size={14} /> Add slide
          </button>
        </div>
        {heroData.slides.map((slide, index) => (
          <div key={slide.id} className="mb-4 rounded-lg border border-[#f0e7d8] bg-[#faf5ee] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="font-semibold text-[#1f261b]">Slide {index + 1}</div>
              <div className="flex items-center gap-2">
                <button type="button" disabled={index === 0} onClick={() => setData({ slides: moveArrayItem(heroData.slides, index, -1) })} className="rounded-md border border-[#d9cdbb] bg-white p-2 disabled:opacity-50">
                  <ArrowUp size={16} />
                </button>
                <button type="button" disabled={index === heroData.slides.length - 1} onClick={() => setData({ slides: moveArrayItem(heroData.slides, index, 1) })} className="rounded-md border border-[#d9cdbb] bg-white p-2 disabled:opacity-50">
                  <ArrowDown size={16} />
                </button>
                <button type="button" onClick={() => setData({ slides: heroData.slides.filter((_, indexToRemove) => indexToRemove !== index) })} className="rounded-md border border-[#e0b4a0] bg-white px-3 py-2 text-sm text-[#9b2e2e]">
                  Remove
                </button>
              </div>
            </div>
            <ImageUploadField
              label="Slide image"
              value={slide.image}
              fieldKey={`hero-image-${slide.id}`}
              uploadingField={uploadingField}
              onUploadingChange={setUploadingField}
              onError={setStatusMessage}
              onUpload={(url) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, image: url } : item)) })}
            />
            <label className={labelClass}>
              Title
              <input className={`${fieldClass} mt-2`} type="text" value={slide.title} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)) })} />
            </label>
            <label className={labelClass}>
              Highlight
              <input className={`${fieldClass} mt-2`} type="text" value={slide.highlight || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, highlight: event.target.value } : item)) })} />
            </label>
            <label className={labelClass}>
              Description
              <textarea className={`${fieldClass} mt-2`} rows={3} value={slide.description || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, description: event.target.value } : item)) })} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                Primary button text
                <input className={`${fieldClass} mt-2`} type="text" value={slide.primaryButtonText || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, primaryButtonText: event.target.value } : item)) })} />
              </label>
              <label className={labelClass}>
                Primary button href
                <input className={`${fieldClass} mt-2`} type="text" value={slide.primaryButtonHref || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, primaryButtonHref: event.target.value } : item)) })} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                Secondary button text
                <input className={`${fieldClass} mt-2`} type="text" value={slide.secondaryButtonText || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, secondaryButtonText: event.target.value } : item)) })} />
              </label>
              <label className={labelClass}>
                Secondary button href
                <input className={`${fieldClass} mt-2`} type="text" value={slide.secondaryButtonHref || ""} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, secondaryButtonHref: event.target.value } : item)) })} />
              </label>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-[#5f5a50]">
                <input type="checkbox" checked={slide.showLutus || false} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, showLutus: event.target.checked } : item)) })} />
                Show Lutus
              </label>
              <label className="flex items-center gap-2 text-sm text-[#5f5a50]">
                <input type="checkbox" checked={slide.isCenter || false} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => (itemIndex === index ? { ...item, isCenter: event.target.checked } : item)) })} />
                Center layout
              </label>
            </div>
            <div className="mt-4 rounded-xl bg-white p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#1f261b]">List Items</p>
                <button type="button" onClick={() => setData({ slides: heroData.slides.map((item, itemIndex) => itemIndex === index ? { ...item, listItems: [...(item.listItems || []), ""] } : item) })} className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#263016]">
                  <Plus size={14} /> Add item
                </button>
              </div>
              {(slide.listItems || []).map((listItem, listIndex) => (
                <div key={listIndex} className="mb-3 flex gap-2">
                  <input
                    className={`${fieldClass} flex-1`}
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
                    className="rounded-md border border-[#e0b4a0] bg-white px-3 py-2 text-sm text-[#9b2e2e]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-white p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#1f261b]">Features</p>
                <button type="button" onClick={() => setData({ slides: heroData.slides.map((item, itemIndex) => itemIndex === index ? { ...item, features: [...(item.features || []), { imgUrl: "", title: "" }] } : item) })} className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#263016]">
                  <Plus size={14} /> Add feature
                </button>
              </div>
              {(slide.features || []).map((feature, featureIndex) => (
                <div key={featureIndex} className="mb-4 rounded-lg border border-[#e5dfd5] bg-[#fbf8f3] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#1f261b]">Feature {featureIndex + 1}</p>
                    <button
                      type="button"
                      onClick={() => setData({ slides: heroData.slides.map((item, itemIndex) => {
                        if (itemIndex !== index) return item;
                        const nextFeatures = [...(item.features || [])];
                        nextFeatures.splice(featureIndex, 1);
                        return { ...item, features: nextFeatures };
                      }) })}
                      className="rounded-md border border-[#e0b4a0] bg-white px-3 py-2 text-sm text-[#9b2e2e]"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
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
                    <label className={labelClass}>
                      Feature title
                      <input className={`${fieldClass} mt-2`} type="text" value={feature.title} onChange={(event) => setData({ slides: heroData.slides.map((item, itemIndex) => {
                        if (itemIndex !== index) return item;
                        const nextFeatures = [...(item.features || [])];
                        nextFeatures[featureIndex] = { ...nextFeatures[featureIndex], title: event.target.value };
                        return { ...item, features: nextFeatures };
                      }) })} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
      services: { image: string; title: string; description: string }[];
    };
    return (
      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#8d6a3a]">Wellness Section</div>
            <p className="mt-1 text-sm text-[#5f5a50]">Manage welcome info, welcome image, and services list.</p>
          </div>
          <button type="button" onClick={() => setData({ ...wellnessData, services: [...(wellnessData.services || []), { image: "", title: "", description: "" }] })} className="inline-flex items-center gap-2 rounded-md bg-[#263016] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            <Plus size={14} /> Add Service
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Eyebrow
            <input className={`${fieldClass} mt-2`} type="text" value={wellnessData.eyebrow} onChange={(event) => setData({ ...wellnessData, eyebrow: event.target.value })} />
          </label>
          <label className={labelClass}>
            Heading
            <input className={`${fieldClass} mt-2`} type="text" value={wellnessData.heading} onChange={(event) => setData({ ...wellnessData, heading: event.target.value })} />
          </label>
        </div>
        <label className={labelClass}>
          Description
          <textarea className={`${fieldClass} mt-2`} rows={3} value={wellnessData.description} onChange={(event) => setData({ ...wellnessData, description: event.target.value })} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Button Text
            <input className={`${fieldClass} mt-2`} type="text" value={wellnessData.buttonText} onChange={(event) => setData({ ...wellnessData, buttonText: event.target.value })} />
          </label>
          <label className={labelClass}>
            Button Href
            <input className={`${fieldClass} mt-2`} type="text" value={wellnessData.buttonHref} onChange={(event) => setData({ ...wellnessData, buttonHref: event.target.value })} />
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
        
        <div className="mt-6 border-t border-[#f0e7d8] pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#263016] mb-4">Service Cards</h3>
          {(wellnessData.services || []).map((service, index) => (
            <div key={index} className="mb-4 rounded-lg border border-[#f0e7d8] bg-[#faf5ee] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="font-semibold text-[#1f261b]">Service Card {index + 1}</div>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={index === 0} onClick={() => setData({ ...wellnessData, services: moveArrayItem(wellnessData.services, index, -1) })} className="rounded-md border border-[#d9cdbb] bg-white p-2 disabled:opacity-50">
                    <ArrowUp size={16} />
                  </button>
                  <button type="button" disabled={index === wellnessData.services.length - 1} onClick={() => setData({ ...wellnessData, services: moveArrayItem(wellnessData.services, index, 1) })} className="rounded-md border border-[#d9cdbb] bg-white p-2 disabled:opacity-50">
                    <ArrowDown size={16} />
                  </button>
                  <button type="button" onClick={() => setData({ ...wellnessData, services: wellnessData.services.filter((_, indexToRemove) => indexToRemove !== index) })} className="rounded-md border border-[#e0b4a0] bg-white px-3 py-2 text-sm text-[#9b2e2e]">
                    Remove
                  </button>
                </div>
              </div>
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
              <label className={labelClass}>
                Title
                <input className={`${fieldClass} mt-2 mb-3`} type="text" value={service.title} onChange={(event) => setData({
                  ...wellnessData,
                  services: wellnessData.services.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item))
                })} />
              </label>
              <label className={labelClass}>
                Description
                <textarea className={`${fieldClass} mt-2`} rows={2} value={service.description} onChange={(event) => setData({
                  ...wellnessData,
                  services: wellnessData.services.map((item, itemIndex) => (itemIndex === index ? { ...item, description: event.target.value } : item))
                })} />
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFeaturesEditor = () => {
    const featureData = form.data as { features: HomeFeaturesFeature[] };
    return (
      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#8d6a3a]">Home Features</div>
            <p className="mt-1 text-sm text-[#5f5a50]">Manage feature cards for the homepage.</p>
          </div>
          <button type="button" onClick={() => setData({ features: [...featureData.features, { imgUrl: "", title: "", desc: "" }] })} className="inline-flex items-center gap-2 rounded-md bg-[#263016] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            <Plus size={14} /> Add feature
          </button>
        </div>
        {featureData.features.map((feature, index) => (
          <div key={index} className="mb-4 rounded-lg border border-[#f0e7d8] bg-[#faf5ee] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="font-semibold text-[#1f261b]">Feature {index + 1}</div>
              <div className="flex items-center gap-2">
                <button type="button" disabled={index === 0} onClick={() => setData({ features: moveArrayItem(featureData.features, index, -1) })} className="rounded-md border border-[#d9cdbb] bg-white p-2 disabled:opacity-50">
                  <ArrowUp size={16} />
                </button>
                <button type="button" disabled={index === featureData.features.length - 1} onClick={() => setData({ features: moveArrayItem(featureData.features, index, 1) })} className="rounded-md border border-[#d9cdbb] bg-white p-2 disabled:opacity-50">
                  <ArrowDown size={16} />
                </button>
                <button type="button" onClick={() => setData({ features: featureData.features.filter((_, indexToRemove) => indexToRemove !== index) })} className="rounded-md border border-[#e0b4a0] bg-white px-3 py-2 text-sm text-[#9b2e2e]">
                  Remove
                </button>
              </div>
            </div>
            <ImageUploadField
              label="Feature image"
              value={feature.imgUrl}
              fieldKey={`feature-image-${index}`}
              uploadingField={uploadingField}
              onUploadingChange={setUploadingField}
              onError={setStatusMessage}
              onUpload={(url) => setData({ features: featureData.features.map((item, itemIndex) => (itemIndex === index ? { ...item, imgUrl: url } : item)) })}
            />
            <label className={labelClass}>
              Title
              <input className={`${fieldClass} mt-2`} type="text" value={feature.title} onChange={(event) => setData({ features: featureData.features.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)) })} />
            </label>
            <label className={labelClass}>
              Description
              <textarea className={`${fieldClass} mt-2`} rows={3} value={feature.desc} onChange={(event) => setData({ features: featureData.features.map((item, itemIndex) => (itemIndex === index ? { ...item, desc: event.target.value } : item)) })} />
            </label>
          </div>
        ))}
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
      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#8d6a3a]">Turnkey Solutions</div>
            <p className="mt-1 text-sm text-[#5f5a50]">Manage the turnkey solutions section and service cards.</p>
          </div>
          <button type="button" onClick={() => setData({ ...turnkeyData, solutions: [...turnkeyData.solutions, { imgUrl: "", title: "" }] })} className="inline-flex items-center gap-2 rounded-md bg-[#263016] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            <Plus size={14} /> Add solution
          </button>
        </div>
        <label className={labelClass}>
          Eyebrow
          <input className={`${fieldClass} mt-2`} type="text" value={turnkeyData.eyebrow} onChange={(event) => setData({ ...turnkeyData, eyebrow: event.target.value })} />
        </label>
        <label className={labelClass}>
          Heading
          <textarea className={`${fieldClass} mt-2`} rows={2} value={turnkeyData.heading} onChange={(event) => setData({ ...turnkeyData, heading: event.target.value })} />
        </label>
        <label className={labelClass}>
          Description
          <textarea className={`${fieldClass} mt-2`} rows={3} value={turnkeyData.description} onChange={(event) => setData({ ...turnkeyData, description: event.target.value })} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Button text
            <input className={`${fieldClass} mt-2`} type="text" value={turnkeyData.buttonText} onChange={(event) => setData({ ...turnkeyData, buttonText: event.target.value })} />
          </label>
          <label className={labelClass}>
            Button href
            <input className={`${fieldClass} mt-2`} type="text" value={turnkeyData.buttonHref || ""} onChange={(event) => setData({ ...turnkeyData, buttonHref: event.target.value })} />
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
        {turnkeyData.solutions.map((solution, index) => (
          <div key={index} className="mb-4 rounded-lg border border-[#f0e7d8] bg-[#faf5ee] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="font-semibold text-[#1f261b]">Solution {index + 1}</div>
              <div className="flex items-center gap-2">
                <button type="button" disabled={index === 0} onClick={() => setData({ ...turnkeyData, solutions: moveArrayItem(turnkeyData.solutions, index, -1) })} className="rounded-md border border-[#d9cdbb] bg-white p-2 disabled:opacity-50">
                  <ArrowUp size={16} />
                </button>
                <button type="button" disabled={index === turnkeyData.solutions.length - 1} onClick={() => setData({ ...turnkeyData, solutions: moveArrayItem(turnkeyData.solutions, index, 1) })} className="rounded-md border border-[#d9cdbb] bg-white p-2 disabled:opacity-50">
                  <ArrowDown size={16} />
                </button>
                <button type="button" onClick={() => setData({ ...turnkeyData, solutions: turnkeyData.solutions.filter((_, indexToRemove) => indexToRemove !== index) })} className="rounded-md border border-[#e0b4a0] bg-white px-3 py-2 text-sm text-[#9b2e2e]">
                  Remove
                </button>
              </div>
            </div>
            <ImageUploadField
              label="Solution image"
              value={solution.imgUrl}
              fieldKey={`turnkey-solution-image-${index}`}
              uploadingField={uploadingField}
              onUploadingChange={setUploadingField}
              onError={setStatusMessage}
              onUpload={(url) => setData({ ...turnkeyData, solutions: turnkeyData.solutions.map((item, itemIndex) => (itemIndex === index ? { ...item, imgUrl: url } : item)) })}
            />
            <label className={labelClass}>
              Title
              <input className={`${fieldClass} mt-2`} type="text" value={solution.title} onChange={(event) => setData({ ...turnkeyData, solutions: turnkeyData.solutions.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)) })} />
            </label>
          </div>
        ))}
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
      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#8d6a3a]">Global Presence</div>
            <p className="mt-1 text-sm text-[#5f5a50]">Manage global presence text, image, and statistics.</p>
          </div>
          <button type="button" onClick={() => setData({ ...presenceData, stats: [...presenceData.stats, { value: "", label: "" }] })} className="inline-flex items-center gap-2 rounded-md bg-[#263016] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            <Plus size={14} /> Add stat
          </button>
        </div>
        <label className={labelClass}>
          Eyebrow
          <input className={`${fieldClass} mt-2`} type="text" value={presenceData.eyebrow} onChange={(event) => setData({ ...presenceData, eyebrow: event.target.value })} />
        </label>
        <label className={labelClass}>
          Heading
          <textarea className={`${fieldClass} mt-2`} rows={2} value={presenceData.heading} onChange={(event) => setData({ ...presenceData, heading: event.target.value })} />
        </label>
        <label className={labelClass}>
          Description
          <textarea className={`${fieldClass} mt-2`} rows={3} value={presenceData.description} onChange={(event) => setData({ ...presenceData, description: event.target.value })} />
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
        {presenceData.stats.map((stat, index) => (
          <div key={index} className="mb-4 rounded-lg border border-[#f0e7d8] bg-[#faf5ee] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="font-semibold text-[#1f261b]">Stat {index + 1}</div>
              <div className="flex items-center gap-2">
                <button type="button" disabled={index === 0} onClick={() => setData({ ...presenceData, stats: moveArrayItem(presenceData.stats, index, -1) })} className="rounded-md border border-[#d9cdbb] bg-white p-2 disabled:opacity-50">
                  <ArrowUp size={16} />
                </button>
                <button type="button" disabled={index === presenceData.stats.length - 1} onClick={() => setData({ ...presenceData, stats: moveArrayItem(presenceData.stats, index, 1) })} className="rounded-md border border-[#d9cdbb] bg-white p-2 disabled:opacity-50">
                  <ArrowDown size={16} />
                </button>
                <button type="button" onClick={() => setData({ ...presenceData, stats: presenceData.stats.filter((_, indexToRemove) => indexToRemove !== index) })} className="rounded-md border border-[#e0b4a0] bg-white px-3 py-2 text-sm text-[#9b2e2e]">
                  Remove
                </button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                Value
                <input className={`${fieldClass} mt-2`} type="text" value={stat.value} onChange={(event) => setData({ ...presenceData, stats: presenceData.stats.map((item, itemIndex) => (itemIndex === index ? { ...item, value: event.target.value } : item)) })} />
              </label>
              <label className={labelClass}>
                Label
                <input className={`${fieldClass} mt-2`} type="text" value={stat.label} onChange={(event) => setData({ ...presenceData, stats: presenceData.stats.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item)) })} />
              </label>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#1f261b]">
      {/* <header className="border-b border-[#ded3c4] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8d6a3a]">Homepage Content Admin</p>
            <h1 className="mt-2 text-3xl font-semibold">Manage Homepage Component Content</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-4 py-2 text-sm font-semibold text-[#263016]">
              <ArrowUp size={16} /> Back to Admin
            </Link>
            <button onClick={startNew} className="inline-flex items-center gap-2 rounded-md bg-[#263016] px-4 py-2 text-sm font-semibold text-white">
              <FilePlus size={16} /> Create Component
            </button>
          </div>
        </div>
      </header> */}

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          {/* <div className="max-w-3xl">
            <p className="text-sm leading-7 text-[#4a473f]">Create and update structured homepage component content records for known keys. Use the list on the left to edit an existing entry or create a new one with the button above.</p>
          </div> */}
          <div className="flex flex-wrap gap-3">
            {statusMessage ? (
              <div className="inline-flex items-center gap-2 rounded-md bg-[#eef7e8] px-4 py-3 text-sm text-[#2f5f31]">
                <CheckCircle size={18} /> {statusMessage}
              </div>
            ) : null}
            {loading ? (
              <div className="inline-flex items-center gap-2 rounded-md bg-[#fff8e4] px-4 py-3 text-sm text-[#6f542f]"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <section className="space-y-4">
            <div className={cardClass}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Components</h2>
                  <p className="text-sm text-[#5f5a50]">List of homepage component content records.</p>
                </div>
                <button type="button" onClick={refresh} className="rounded-md border border-[#d9cdbb] bg-white px-3 py-2 text-sm font-semibold text-[#263016]">
                  Refresh
                </button>
              </div>
              <div className="p-0">
                <ComponentList 
                  records={records} 
                  onEdit={handleSelectRecord} 
                  onDelete={handleDelete} 
                  onReorder={onDragEnd}
                  editingId={editingId}
                  knownKeys={knownKeys}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className={cardClass}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{editingId ? "Edit component" : "Create component"}</h2>
                  <p className="text-sm text-[#5f5a50]">Select a known homepage key and fill the structured form fields.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={startNew} className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-4 py-2 text-sm font-semibold text-[#263016]">
                    <Plus size={14} /> New
                  </button>
                  {editingId ? (
                    <button type="button" onClick={() => handleDelete(editingId)} className="inline-flex items-center gap-2 rounded-md border border-[#e0b4a0] bg-white px-4 py-2 text-sm font-semibold text-[#9b2e2e]">
                      <Trash2 size={14} /> Delete
                    </button>
                  ) : null}
                </div>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Component key
                    <select className={`${fieldClass} mt-2`} value={form.key} onChange={(event) => handleKeyChange(event.target.value as HomepageComponentKey)}>
                      {homepageKeys.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={labelClass}>
                    Label
                    <input className={`${fieldClass} mt-2`} type="text" value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Page
                    <input className={`${fieldClass} mt-2`} type="text" value={form.page} onChange={(event) => setForm((current) => ({ ...current, page: event.target.value }))} />
                  </label>
                  <label className="flex items-center gap-3 text-sm text-[#5f5a50]">
                    <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
                    Active
                  </label>
                </div>
                <label className={labelClass}>
                  Description
                  <textarea className={`${fieldClass} mt-2`} rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                </label>

                {form.key === "home.hero" && renderHeroEditor()}
                {form.key === "home.wellnessSection" && renderWellnessSectionEditor()}
                {form.key === "home.features" && renderFeaturesEditor()}
                {form.key === "home.turnkeySolutions" && renderTurnkeyEditor()}
                {form.key === "home.globalPresence" && renderGlobalPresenceEditor()}

                {errors.length ? (
                  <div className="rounded-lg border border-[#f0d6d8] bg-[#fff1f3] p-4 text-sm text-[#9b2e2e]">
                    <p className="font-semibold">Please fix the following:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-[#263016] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                    <Save size={16} /> {editingId ? "Save changes" : "Create component"}
                  </button>
                  <button type="button" onClick={() => resetForm(form.key)} className="rounded-md border border-[#d9cdbb] bg-white px-5 py-3 text-sm font-semibold text-[#263016]">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
