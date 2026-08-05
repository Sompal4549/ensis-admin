"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import RichTextEditor from "@/components/common/RichTextEditor";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { buildEmptyConsultancyContent, ConsultancyPageContentKeys, consultancyPageKeys } from "./consultancyPageContent";

// Compact local classes for this manager only
const smallFieldClass =
  "w-full rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-[#1d5af2] focus:ring-1 focus:ring-[#1d5af2] outline-none";
const smallLabelClass = "block text-[11px] font-semibold text-slate-600 mb-0.5";

const randomId = () => Math.random().toString(36).slice(2, 9);

export default function ConsultancyPageManager() {
  const [form, setForm] = useState<Partial<ComponentContent>>(buildEmptyConsultancyContent("consultancy.hero"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ label: string; action: () => void } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const componentKey = searchParams.get("component");

 const refresh = useCallback(async () => {
    const key = componentKey;
    if (!key) {
      setEditingId(null);
      setForm(buildEmptyConsultancyContent("consultancy.hero"));
      return;
    }

    setLoading(true);
    try {
      const existing = await componentContentApi.getByKey(key);
      if (existing) {
        setEditingId(existing._id);
        setForm(existing);
      } else {
        setEditingId(null);
        setForm(buildEmptyConsultancyContent(key as ConsultancyPageContentKeys));
      }
    } catch (error: unknown) {
      // Naya/abhi-tak-na-bana section ho sakta hai — empty form se fallback karo
      setEditingId(null);
      setForm(buildEmptyConsultancyContent(key as ConsultancyPageContentKeys));
    } finally {
      setLoading(false);
    }
  }, [componentKey]);

  useEffect(() => { void refresh(); }, [refresh]);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
        ...form, 
        page: "consultancy",
        label: form.label || (consultancyPageKeys.find(k => k.key === form.key)?.label) || "Consultancy Section",
        data: form.data || {} 
      } as Omit<ComponentContent, "_id">;

      if (editingId) {
        await componentContentApi.update(editingId, payload);
      } else {
        const created = await componentContentApi.create(payload);
        if (created && created.key) {
          router.push(`?component=${created.key}`);
        }
      }
      toast.success("Consultancy content saved!");
      refresh();
    } catch (error: unknown) {
      const msg = (error as any).response?.data?.message || "Save failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderHeroForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={data.heading || ""} onChange={e => setForm({...form, data: {...data, heading: e.target.value}})} /></label>
          <label className={smallLabelClass}>Title Part 1 <input className={smallFieldClass} value={data.titlepart1 || ""} onChange={e => setForm({...form, data: {...data, titlepart1: e.target.value}})} /></label>
          <label className={smallLabelClass}>Title Part 2 <input className={smallFieldClass} value={data.titlepart2 || ""} onChange={e => setForm({...form, data: {...data, titlepart2: e.target.value}})} /></label>
          <label className={smallLabelClass}>Title Highlight<input className={smallFieldClass} value={data.titleHighlight || ""} onChange={e => setForm({...form, data: {...data, titleHighlight: e.target.value}})} /></label>
          <label className={smallLabelClass}>Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
          <label className={smallLabelClass}>Primary Button Label <input className={smallFieldClass} value={data.primaryButton?.label || ""} onChange={e => setForm({...form, data: {...data, primaryButton: { ...(data.primaryButton || {}), label: e.target.value }}})} /></label>
          <label className={smallLabelClass}>Primary Button URL <input className={smallFieldClass} value={data.primaryButton?.href || ""} onChange={e => setForm({...form, data: {...data, primaryButton: { ...(data.primaryButton || {}), href: e.target.value }}})} /></label>
          <label className={smallLabelClass}>Secondary Button Label <input className={smallFieldClass} value={data.secondaryButton?.label || ""} onChange={e => setForm({...form, data: {...data, secondaryButton: { ...(data.secondaryButton || {}), label: e.target.value }}})} /></label>
          <label className={smallLabelClass}>Secondary Button URL <input className={smallFieldClass} value={data.secondaryButton?.href || ""} onChange={e => setForm({...form, data: {...data, secondaryButton: { ...(data.secondaryButton || {}), href: e.target.value }}})} /></label>
        </div>
        <div>
          <label className={smallLabelClass}>Description</label>
          <RichTextEditor 
            value={data.description || ""} 
            onChange={val => setForm({...form, data: {...data, description: val}})} 
            placeholder="Enter hero description..."
            minHeight="90px" 
          />
        </div>
        <ImageUploadField label="Background Image" value={data.bgImage || ""} fieldKey="hero.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, bgImage: url}})} />
        
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2"><h4 className="text-xs font-bold">Hero Features</h4><button type="button" onClick={() => setForm({...form, data: {...data, features: [...(data.features || []), {id: randomId(), title: '', description: '', image: ''}]}})} className="p-1 bg-slate-100 rounded "><Plus size={13} /></button></div>
          <div className="grid grid-cols-1 gap-2">
            {(data.features || []).map((feat: any, idx: number) => (
              <div key={feat.id} className="p-2 border rounded-xl bg-slate-50 relative space-y-1.5">
                <button type="button" onClick={() => { const nf = data.features.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, features: nf}})}} className="absolute top-1.5 right-1.5 text-red-500"><Trash2 size={12} /></button>
                <div className="grid grid-cols-2 gap-2 pr-4">
                  <input className={smallFieldClass} placeholder="Feature Title" value={feat.title || ""} onChange={e => { const nf = [...data.features]; nf[idx].title = e.target.value; setForm({...form, data: {...data, features: nf}}) }} />
                  <ImageUploadField label="Feature Image" value={feat.image || ""} fieldKey={`hero.feat.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const nf = [...data.features]; nf[idx].image = url; setForm({...form, data: {...data, features: nf}}) }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Feature Description</label>
                  <RichTextEditor 
                    value={feat.description || ""} 
                    onChange={val => { const nf = [...data.features]; nf[idx].description = val; setForm({...form, data: {...data, features: nf}}); }} 
                    placeholder="Short feature description..."
                    minHeight="80px" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFeaturesForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.items.map((item: any, idx: number) => (
            <div key={item.id} className="p-2 border rounded-xl bg-white space-y-1.5 relative">
              <button type="button" onClick={() => { const ni = data.items.filter((_:any, i:number) => i !== idx); setForm({...form, data: {...data, items: ni}})}} className="absolute top-1.5 right-1.5 text-red-400"><Trash2 size={13} /></button>
              <div className="grid grid-cols-2 gap-2 pr-4">
                  <label className={smallLabelClass}>Title <input className={smallFieldClass} value={item.title} onChange={e => { const ni = [...data.items]; ni[idx].title = e.target.value; setForm({...form, data: {...data, items: ni}}) }} /></label>
                  <label className={smallLabelClass}>Heading <input className={smallFieldClass} value={item.heading} onChange={e => { const ni = [...data.items]; ni[idx].heading = e.target.value; setForm({...form, data: {...data, items: ni}}) }} /></label>
                  <ImageUploadField label="Card Image" value={item.image || ""} fieldKey={`feat.card.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const ni = [...data.items]; ni[idx].image = url; setForm({...form, data: {...data, items: ni}}) }} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                <RichTextEditor 
                  value={item.description || ""} 
                  onChange={val => { const ni = [...data.items]; ni[idx].description = val; setForm({...form, data: {...data, items: ni}}); }} 
                  placeholder="Detail description..."
                  minHeight="80px" 
                />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setForm({...form, data: {...data, items: [...data.items, {id: randomId(), title: '', heading: '', description: '', image: ''}]}})} className="w-full py-2 border-2 border-dashed rounded-xl  flex items-center justify-center gap-2"><Plus size={16} /> Add Feature</button>
      </div>
    );
  };

  const renderOfferForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className={smallLabelClass}>Subheading <input className={smallFieldClass} value={data.subheading || ""} onChange={e => setForm({...form, data: {...data, subheading: e.target.value}})} /></label>
          <label className={smallLabelClass}>Main Title <input className={smallFieldClass} value={data.title || ""} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} /></label>
        </div>
        <div>
          <label className={smallLabelClass}>Description</label>
          <RichTextEditor 
            value={data.description || ""} 
            onChange={val => setForm({...form, data: {...data, description: val}})} 
            placeholder="Service overview description..."
            minHeight="90px" 
          />
        </div>
        <div className="pt-2 border-t space-y-2">
            <h4 className="text-xs font-bold">Service Cards</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(data.serviceCards || []).map((card: any, idx: number) => (
                  <div key={card.id} className="p-2 border rounded-lg bg-slate-50 space-y-1.5 relative group">
                      <button type="button" onClick={() => { const nc = data.serviceCards.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, serviceCards: nc}})}} className="absolute top-1.5 right-1.5 text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={13} /></button>
                      <div className="grid grid-cols-2 gap-2 pr-4">
                          <label className={smallLabelClass}>Card Title <input className={smallFieldClass} value={card.title || ""} onChange={e => { const nc = [...data.serviceCards]; nc[idx].title = e.target.value; setForm({...form, data: {...data, serviceCards: nc}}) }} /></label>
                          <ImageUploadField 
                              label="Card Image" 
                              value={card.image || ""} 
                              fieldKey={`offer.card.${idx}`} 
                              uploadingField={uploadingField} 
                              onUploadingChange={setUploadingField} 
                              onError={m => toast.error(m)} 
                              onUpload={url => { const nc = [...data.serviceCards]; nc[idx].image = url; setForm({...form, data: {...data, serviceCards: nc}}) }} 
                          />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Card Description</label>
                        <RichTextEditor 
                          value={card.description || ""} 
                          onChange={val => { const nc = [...data.serviceCards]; nc[idx].description = val; setForm({...form, data: {...data, serviceCards: nc}}); }} 
                          placeholder="Card description..."
                          minHeight="80px" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <label className={smallLabelClass}>Learn More Link <input className={smallFieldClass} placeholder="e.g. /services/wellness" value={card.learnMoreLink || ""} onChange={e => { const nc = [...data.serviceCards]; nc[idx].learnMoreLink = e.target.value; setForm({...form, data: {...data, serviceCards: nc}}) }} /></label>
                        <label className={smallLabelClass}>Learn More Text <input className={smallFieldClass} placeholder="e.g. Learn More" value={card.learnMoreText || ""} onChange={e => { const nc = [...data.serviceCards]; nc[idx].learnMoreText = e.target.value; setForm({...form, data: {...data, serviceCards: nc}}) }} /></label>
                      </div>
                  </div>
              ))}
            </div>
            <button type="button" onClick={() => setForm({...form, data: {...data, serviceCards: [...(data.serviceCards || []), {id: randomId(), title: '', description: '', image: '', learnMoreLink: '', learnMoreText: ''}]}})} className="w-full py-2 border-2 border-dashed rounded-xl  flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"><Plus size={16} /> Add Service Card</button>
        </div>
      </div>
    );
  };

const renderProcessForm = () => {
  const data = form.data as any;

  if (!data.whyChoose || !data.ourProcess) {
    return (
      <div className="p-2 italic text-xs">
        Loading Process Structure...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Why Choose Us */}
      <div className="p-2 bg-amber-50 rounded-2xl space-y-2">
        <h4 className="font-bold text-amber-800 text-xs">Why Choose Us</h4>

        <div className="grid grid-cols-2 gap-2">
          <input
            className={smallFieldClass}
            placeholder="Heading"
            value={data.whyChoose.heading || ""}
            onChange={(e) =>
              setForm({
                ...form,
                data: {
                  ...data,
                  whyChoose: {
                    ...data.whyChoose,
                    heading: e.target.value,
                  },
                },
              })
            }
          />

          <input
            className={smallFieldClass}
            placeholder="Title"
            value={data.whyChoose.title || ""}
            onChange={(e) =>
              setForm({
                ...form,
                data: {
                  ...data,
                  whyChoose: {
                    ...data.whyChoose,
                    title: e.target.value,
                  },
                },
              })
            }
          />
        </div>

        <div>
          <label className={smallLabelClass}>Why Choose Description</label>
          <RichTextEditor
            value={data.whyChoose.description || ""}
            onChange={(val) =>
              setForm({
                ...form,
                data: {
                  ...data,
                  whyChoose: {
                    ...data.whyChoose,
                    description: val,
                  },
                },
              })
            }
            placeholder="Why choose us details..."
            minHeight="90px"
          />
        </div>

        <ImageUploadField
          label="Background Image"
          value={data.whyChoose.bgImage}
          fieldKey="process.wc.bg"
          uploadingField={uploadingField}
          onUploadingChange={setUploadingField}
          onError={(m) => toast.error(m)}
          onUpload={(url) =>
            setForm({
              ...form,
              data: {
                ...data,
                whyChoose: {
                  ...data.whyChoose,
                  bgImage: url,
                },
              },
            })
          }
        />

        {/* Choose List */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className={smallLabelClass}>Choose List</label>

            <button
              type="button"
              className="px-2 py-1 text-[11px] bg-amber-200 rounded"
              onClick={() =>
                setForm({
                  ...form,
                  data: {
                    ...data,
                    whyChoose: {
                      ...data.whyChoose,
                      chooseList: [
                        ...(data.whyChoose.chooseList || []),
                        { text: "" },
                      ],
                    },
                  },
                })
              }
            >
              + Add Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {(data.whyChoose.chooseList || []).map(
              (item: any, idx: number) => (
                <div key={idx} className="flex gap-1.5">
                  <input
                    className={smallFieldClass}
                    placeholder={`Choose Item ${idx + 1}`}
                    value={typeof item === "string" ? item : item.text || ""}
                    onChange={(e) => {
                      const newList = [
                        ...(data.whyChoose.chooseList || []),
                      ];
                      newList[idx] = { text: e.target.value };

                      setForm({
                        ...form,
                        data: {
                          ...data,
                          whyChoose: {
                            ...data.whyChoose,
                            chooseList: newList,
                          },
                        },
                      });
                    }}
                  />

                  <button
                    type="button"
                    className="px-2 py-1 border rounded text-red-500 text-xs"
                    onClick={() =>
                      setPendingDelete({
                        label: "Remove this choose item?",
                        action: () => {
                          const newList = (
                            data.whyChoose.chooseList || []
                          ).filter((_: any, i: number) => i !== idx);

                          setForm({
                            ...form,
                            data: {
                              ...data,
                              whyChoose: {
                                ...data.whyChoose,
                                chooseList: newList,
                              },
                            },
                          });
                        },
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Primary Button */}
        <div className="space-y-1.5">
          <label className={smallLabelClass}>Primary Button</label>

          <div className="grid grid-cols-2 gap-2">
            <input
              className={smallFieldClass}
              placeholder="Button Label"
              value={data.whyChoose.primaryButton?.label || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  data: {
                    ...data,
                    whyChoose: {
                      ...data.whyChoose,
                      primaryButton: {
                        ...(data.whyChoose.primaryButton || {}),
                        label: e.target.value,
                      },
                    },
                  },
                })
              }
            />

            <input
              className={smallFieldClass}
              placeholder="Button Link"
              value={data.whyChoose.primaryButton?.href || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  data: {
                    ...data,
                    whyChoose: {
                      ...data.whyChoose,
                      primaryButton: {
                        ...(data.whyChoose.primaryButton || {}),
                        href: e.target.value,
                      },
                    },
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Our Process */}
      <div className="p-2 bg-blue-50 rounded-2xl space-y-2">
        <h4 className="font-bold text-blue-800 text-xs">Our Process</h4>

        <div className="grid grid-cols-2 gap-2">
          <input
            className={smallFieldClass}
            placeholder="Heading"
            value={data.ourProcess.heading}
            onChange={(e) =>
              setForm({
                ...form,
                data: {
                  ...data,
                  ourProcess: {
                    ...data.ourProcess,
                    heading: e.target.value,
                  },
                },
              })
            }
          />

          <input
            className={smallFieldClass}
            placeholder="Title"
            value={data.ourProcess.title}
            onChange={(e) =>
              setForm({
                ...form,
                data: {
                  ...data,
                  ourProcess: {
                    ...data.ourProcess,
                    title: e.target.value,
                  },
                },
              })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.ourProcess.processList.map(
            (proc: any, idx: number) => (
              <div
                key={proc.id}
                className="p-2 border bg-white rounded-lg space-y-1.5 relative"
              >
                <button
                  type="button"
                  className="absolute top-1.5 right-1.5 text-red-500 hover:text-red-700"
                  onClick={() =>
                    setPendingDelete({
                      label: "Delete this process step?",
                      action: () => {
                        const nl = data.ourProcess.processList.filter(
                          (_: any, i: number) => i !== idx
                        );
                        setForm({
                          ...form,
                          data: {
                            ...data,
                            ourProcess: {
                              ...data.ourProcess,
                              processList: nl,
                            },
                          },
                        });
                      },
                    })
                  }
                >
                  <Trash2 size={13} />
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    className={smallFieldClass}
                    placeholder="Step Title"
                    value={proc.title}
                    onChange={(e) => {
                      const nl = [...data.ourProcess.processList];
                      nl[idx].title = e.target.value;

                      setForm({
                        ...form,
                        data: {
                          ...data,
                          ourProcess: {
                            ...data.ourProcess,
                            processList: nl,
                          },
                        },
                      });
                    }}
                  />

                  <input
                    className={smallFieldClass}
                    placeholder="Step Color"
                    value={proc.color}
                    onChange={(e) => {
                      const nl = [...data.ourProcess.processList];
                      nl[idx].color = e.target.value;

                      setForm({
                        ...form,
                        data: {
                          ...data,
                          ourProcess: {
                            ...data.ourProcess,
                            processList: nl,
                          },
                        },
                      });
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Step Description
                  </label>

                  <RichTextEditor
                    value={proc.description || ""}
                    onChange={(val) => {
                      const nl = [...data.ourProcess.processList];
                      nl[idx].description = val;

                      setForm({
                        ...form,
                        data: {
                          ...data,
                          ourProcess: {
                            ...data.ourProcess,
                            processList: nl,
                          },
                        },
                      });
                    }}
                    placeholder="Describe this step..."
                    minHeight="80px"
                  />
                </div>

                <ImageUploadField
                  label="Step Icon"
                  value={proc.image}
                  fieldKey={`proc.step.${idx}`}
                  uploadingField={uploadingField}
                  onUploadingChange={setUploadingField}
                  onError={(m) => toast.error(m)}
                  onUpload={(url) => {
                    const nl = [...data.ourProcess.processList];
                    nl[idx].image = url;

                    setForm({
                      ...form,
                      data: {
                        ...data,
                        ourProcess: {
                          ...data.ourProcess,
                          processList: nl,
                        },
                      },
                    });
                  }}
                />
              </div>
            )
          )}
        </div>

        <button
          type="button"
          className="w-full py-2 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={() =>
            setForm({
              ...form,
              data: {
                ...data,
                ourProcess: {
                  ...data.ourProcess,
                  processList: [
                    ...(data.ourProcess.processList || []),
                    { id: randomId(), title: "", description: "", image: "", color: "" },
                  ],
                },
              },
            })
          }
        >
          <Plus size={16} /> Add Process Step
        </button>
      </div>
    </div>
  );
};

  const renderFeaturesStripForm = () => {
    const data = (form.data || { items: [] }) as any;
    const items = data.items || [];
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-[11px] font-bold text-[#8d6a3a] uppercase tracking-wide">Stats Strip Items</h4>
          <button type="button" className="text-[11px] bg-[#263016] text-white px-2 py-1 rounded" onClick={() => setForm({...form, data: {...data, items: [...items, { id: randomId(), title: "", description: "", imageurl: { imageUrl: "", alt: "" } }]}})}><Plus size={13} /> Add Stat</button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {items.map((item: any, idx: number) => (
            <div key={item.id || idx} className="p-2 border rounded bg-gray-50 space-y-1.5 relative">
              <button type="button" onClick={() => { const ni = items.filter((_: any, i: number) => i !== idx); setForm({...form, data: {...data, items: ni}}) }} className="absolute top-1 right-1 text-red-500"><Trash2 size={12} /></button>

              <input className={smallFieldClass} placeholder="Value Label" value={item.title || ""} onChange={e => { const ni = [...items]; ni[idx] = { ...ni[idx], title: e.target.value }; setForm({...form, data: {...data, items: ni}}) }} />

              <input className={smallFieldClass} placeholder="Subtitle" value={item.description || ""} onChange={e => { const ni = [...items]; ni[idx] = { ...ni[idx], description: e.target.value }; setForm({...form, data: {...data, items: ni}}) }} />

              <input className={smallFieldClass} value={item.imageurl?.alt || ""} placeholder="Image Alt Text" onChange={e => { const ni = [...items]; ni[idx] = { ...ni[idx], imageurl: { ...(ni[idx].imageurl || {}), alt: e.target.value } }; setForm({...form, data: {...data, items: ni}}) }} />

              <ImageUploadField label="Icon" value={item.imageurl?.imageUrl} fieldKey={`fstrip.${idx}`} uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => { const ni = [...items]; ni[idx] = { ...ni[idx], imageurl: { ...(ni[idx].imageurl || {}), imageUrl: url } }; setForm({...form, data: {...data, items: ni}}) }} />
            </div>
          ))}

          <button type="button" onClick={() => setForm({...form, data: {...data, items: [...items, { id: randomId(), title: "", description: "", imageurl: { imageUrl: "", alt: "" } }]}})} className="border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 py-6 hover:bg-gray-50 transition-colors">
            <Plus size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderReadyForm = () => {
    const data = form.data as any;
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input className={smallFieldClass} placeholder="Title" value={data.title} onChange={e => setForm({...form, data: {...data, title: e.target.value}})} />
          <input className={smallFieldClass} placeholder="Heading" value={data.heading} onChange={e => setForm({...form, data: {...data, heading: e.target.value}})} />
        </div>
        <div>
          <label className={smallLabelClass}>CTA Description</label>
          <RichTextEditor 
            value={data.description || ""} 
            onChange={val => setForm({...form, data: {...data, description: val}})} 
            placeholder="Final call to action description..."
            minHeight="90px" 
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
            <input className={smallFieldClass} placeholder="Button Label" value={data.primaryButton.label} onChange={e => setForm({...form, data: {...data, primaryButton: {...data.primaryButton, label: e.target.value}}})} />
            <input className={smallFieldClass} placeholder="Button Href" value={data.primaryButton.href} onChange={e => setForm({...form, data: {...data, primaryButton: {...data.primaryButton, href: e.target.value}}})} />
        </div>
        <ImageUploadField label="Background Image" value={data.bgImage} fieldKey="ready.bg" uploadingField={uploadingField} onUploadingChange={setUploadingField} onError={m => toast.error(m)} onUpload={url => setForm({...form, data: {...data, bgImage: url}})} />
      </div>
    );
  };

  return (
    <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#8d6a3a]" size={32} /></div>}>
    <div className="w-full">
      <section className="w-full">
        <form onSubmit={handleSave} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b p-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Consultancy Manager</h2>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5">
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save Changes
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-xl">
              <label className={smallLabelClass}>Section Template
                <select 
                  className={smallFieldClass} 
                value={componentKey || form.key || ""} 
                  onChange={e => {
                  router.push(`?component=${e.target.value}`);
                  }}
                >
                  {consultancyPageKeys.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
              </label>
              <label className={smallLabelClass}>Visibility <div className="mt-1"><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} /></div></label>
            </div>

            {form.key === "consultancy.hero" && renderHeroForm()}
            {form.key === "consultancy.features" && renderFeaturesForm()}
            {form.key === "consultancy.whatWeOffer" && renderOfferForm()}
            {form.key === "consultancy.whyChooseOurProcess" && renderProcessForm()}
            {form.key === "consultancy.readyToGetStarted" && renderReadyForm()}
            {form.key === "consultancy.features_strip" && renderFeaturesStripForm()}
          </div>
        </form>
      </section>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Confirm Delete"
        message={pendingDelete?.label}
        onConfirm={async () => {
          pendingDelete?.action();
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
    </Suspense>
  );
}