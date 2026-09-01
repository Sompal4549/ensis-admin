"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart2, ChevronDown, ExternalLink, RefreshCw,
  Link2, Plus, Pencil, Trash2, Save, X, ImagePlus, Loader2,
} from "lucide-react";
import Image from "next/image";
import { getImageUrl, socialClickApi, type SocialLink } from "@/lib/api";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import ConfirmDialog from "@/components/common/ConfirmDialog";

type Click = { _id: string; platform: string; ip: string; userAgent: string; country?: string; city?: string; region?: string; timezone?: string; createdAt: string };
type Stat = { _id: string; count: number };

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  facebook: "bg-blue-100 text-blue-700",
  youtube: "bg-red-100 text-red-700",
  twitter: "bg-sky-100 text-sky-700",
  linkedin: "bg-indigo-100 text-indigo-700",
  whatsapp: "bg-green-100 text-green-700",
};

const badge = (platform: string) =>
  `inline-block rounded-full px-2 py-1 text-[10px] font-bold capitalize ${PLATFORM_COLORS[platform] ?? "bg-slate-100 text-slate-600"}`;

const fieldCls = "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400";
const labelCls = "block text-[10px] font-semibold mb-1";
const emptyForm = { platform: "", url: "", icon: "", isActive: true, order: 0 };

// ── Links Manager ────────────────────────────────────────────
function LinksManager() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ message: string; id: string } | null>(null);
  const fetchLinks = async () => {
    try { setLinks(await socialClickApi.links.list()); } catch { }
  };

  useEffect(() => { fetchLinks(); }, []);

  const reset = () => { setForm(emptyForm); setEditingId(null); setMsg(""); };



  const submit = async () => {
    if (!form.platform || !form.url) { setMsg("Platform and URL are required"); return; }
    setSaving(true); setMsg("");
    try {
      if (editingId) {
        await socialClickApi.links.update(editingId, form);
        setMsg("Updated!");
      } else {
        await socialClickApi.links.create(form as Omit<SocialLink, "_id">);
        setMsg("Created!");
      }
      reset(); fetchLinks();
    } catch (e: any) { setMsg(e?.message || "Error"); }
    finally { setSaving(false); }
  };

  const startEdit = (link: SocialLink) => {
    setEditingId(link._id);
    setForm({ platform: link.platform, url: link.url, icon: link.icon || "", isActive: link.isActive, order: link.order });
    setMsg("");
  };

  const del = async (id: string) => {
    try { await socialClickApi.links.remove(id); fetchLinks(); } catch { }
  };

  const confirmDeleteClick = (id: string, message: string) => setPendingDelete({ id, message });

  return (
    <>
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      {/* List */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-[10px] font-bold uppercase text-slate-500">
          {links.length} Links
        </div>
        {links.length === 0 ? (
          <p className="py-10 text-center text-xs ">No links yet. Add one →</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {links.map(link => (
              <div key={link._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                <div className="h-9 w-9 shrink-0 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                  {link.icon
                    ? <Image width={36} height={36} src={getImageUrl(link.icon)} alt={link.platform} className="h-full w-full object-cover" crossOrigin="anonymous" />
                    : <span className="text-[11px] font-black uppercase">{link.platform?.[0]}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={badge(link.platform)}>{link.platform}</span>
                    {!link.isActive && <span className="text-[9px] font-semibold text-slate-400 border border-slate-200 rounded px-1">inactive</span>}
                    <span className="text-[9px] ">#{link.order}</span>
                  </div>
                  <p className="mt-0.5 text-[11px]  truncate">{link.url}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(link)} className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"><Pencil size={11} /></button>
                  <button onClick={() => confirmDeleteClick(link._id, "Delete this link?")} className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 transition-colors"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3 h-fit">
        <h4 className="text-[10px] font-bold uppercase text-blue-600 flex items-center gap-1">
          <Plus size={11} /> {editingId ? "Edit Link" : "Add New Link"}
        </h4>
        <div>
          <label className={labelCls}>Platform</label>
          <input
            className={fieldCls}
            type="text"
            placeholder="facebook, instagram, youtube..."
            value={form.platform}
            onChange={(e) =>
              setForm({
                ...form,
                platform: e.target.value.toLowerCase(),
              })
            }
          />
        </div>
        <div>
          <label className={labelCls}>URL</label>
          <input className={fieldCls} placeholder="https://instagram.com/ensis" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
              {form.icon ? (
                <Image
                  width={44}
                  height={44}
                  src={getImageUrl(form.icon)}
                  alt="icon"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus size={14} className="" />
              )}
            </div>

            <div className="flex-1">
              <ImageUploadField
                label="Icon Image"
                value={form.icon}
                fieldKey="social-icon"
                uploadingField={uploadingField}
                onUploadingChange={setUploadingField}
                onUpload={(url) =>
                  setForm((prev) => ({
                    ...prev,
                    icon: url,
                  }))
                }
                onError={(message) => setMsg(message)}
              />
            </div>

            {form.icon && (
              <button
                type="button"
                onClick={() => setForm({ ...form, icon: "" })}
                className="shrink-0 text-rose-400 hover:text-rose-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
        <div>
          <label className={labelCls}>Display Order</label>
          <input className={fieldCls} type="number" min="0" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
          <span className="text-xs font-semibold ">Active</span>
        </label>
        {msg && <p className={`text-[11px] font-semibold ${msg.includes("!") ? "text-emerald-600" : "text-rose-500"}`}>{msg}</p>}
        <div className="flex gap-2 pt-1">
          <button onClick={submit} disabled={saving || uploadingField === "social-icon"} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60 transition-colors">
            <Save size={11} /> {editingId ? "Update" : "Save"}
          </button>
          {editingId && (
            <button onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold  hover:bg-slate-50 transition-colors">
              <X size={11} /> Cancel
            </button>
          )}
        </div>
      </div>
</div>

    <ConfirmDialog
      isOpen={!!pendingDelete}
      title="Confirm Delete"
      message={pendingDelete?.message}
      onConfirm={async () => {
        if (!pendingDelete) return;
        await del(pendingDelete.id);
      }}
      onClose={() => setPendingDelete(null)}
    />
    </>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function SocialClicksPage() {
  const [tab, setTab] = useState<"links" | "analytics">("links");
  const [clicks, setClicks] = useState<Click[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const LIMIT = 50;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clicksRes, statsRes] = await Promise.all([
        socialClickApi.list(page, LIMIT, filterPlatform),
        socialClickApi.stats(),
      ]);
      setClicks(clicksRes.clicks ?? []);
      setTotal(clicksRes.total ?? 0);
      setStats(statsRes ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, filterPlatform]);

  useEffect(() => { fetchData(); }, [page, filterPlatform]);

  const statsList = useMemo(() => {
    const map = new Map<string, number>();
    stats.forEach(s => { const k = s._id.toLowerCase(); map.set(k, (map.get(k) || 0) + s.count); });
    return Array.from(map.entries()).map(([_id, count]) => ({ _id, count }));
  }, [stats]);

  const totalClicks = statsList.reduce((s, i) => s + i.count, 0);

  const groupedClicks = useMemo(() => clicks.reduce((acc, c) => {
    const k = c.platform.toLowerCase();
    if (!acc[k]) acc[k] = [];
    acc[k].push(c);
    return acc;
  }, {} as Record<string, Click[]>), [clicks]);

  return (
    <div className="space-y-5 p-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100">
        {([["links", Link2, "Links Manager"], ["analytics", BarChart2, "Click Analytics"]] as const).map(([id, Icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${tab === id ? "border-blue-600 text-blue-600" : "border-transparent "}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === "links" && <LinksManager />}

      {tab === "analytics" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold"><BarChart2 size={15} /> Click Analytics</h2>
            <button onClick={fetchData} className="flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold hover:bg-slate-50">
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            <div className="rounded-lg border bg-white p-2 shadow-sm">
              <p className="text-[9px] font-semibold uppercase text-slate-500">Total</p>
              <p className="mt-1 text-lg font-bold">{totalClicks}</p>
            </div>
            {statsList.map(s => (
              <button key={s._id} onClick={() => { setFilterPlatform(filterPlatform === s._id ? "" : s._id); setPage(1); }}
                className={`rounded-lg border p-2 text-left shadow-sm transition ${filterPlatform === s._id ? "border-blue-500 bg-blue-50" : "bg-white hover:bg-slate-50"}`}>
                <p className={`text-[9px] font-bold capitalize ${PLATFORM_COLORS[s._id]?.split(" ")[1] ?? ""}`}>{s._id}</p>
                <p className="mt-1 text-lg font-bold">{s.count}</p>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500">{total} records found</div>

          <div className="space-y-2">
            {loading ? (
              <div className="rounded-xl border bg-white p-10 text-center text-xs ">Loading...</div>
            ) : Object.keys(groupedClicks).length === 0 ? (
              <div className="rounded-xl border bg-white p-10 text-center text-xs ">No clicks recorded yet.</div>
            ) : Object.entries(groupedClicks).map(([platform, items]) => (
              <details key={platform} className="overflow-hidden rounded-lg border bg-white">
                <summary className="flex cursor-pointer items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={badge(platform)}>{platform}</span>
                    <span className="text-[11px] ">{items.length} clicks</span>
                  </div>
                  <ChevronDown size={14} className="" />
                </summary>
                <div className="border-t">
                  {items.map(c => (
                 <div key={c._id} className="border-b px-3 py-2 last:border-0">
  <div className="flex items-center justify-between gap-2">
    <div className="flex flex-wrap items-center gap-1 text-[11px] min-w-0">
      <span className="font-mono">{c.ip}</span>
      <a href={`https://ipinfo.io/${c.ip}`} target="_blank" rel="noreferrer" className="text-blue-500">
        <ExternalLink size={10} />
      </a>
      {(c.city || c.region || c.country) ? (
        <span className="">
          · {[c.city, c.region, c.country].filter(Boolean).join(", ")}
        </span>
      ) : (
        <span className=" italic">· location unavailable</span>
      )}
    </div>
    <div className="text-[10px]  whitespace-nowrap shrink-0">
      {new Date(c.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
    </div>
  </div>
</div>
                  ))}
                </div>
              </details>
            ))}
          </div>

          {total > LIMIT && (
            <div className="flex items-center gap-3">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded border px-3 py-1 text-xs font-semibold disabled:opacity-40">Prev</button>
              <span className="text-xs ">Page {page} of {Math.ceil(total / LIMIT)}</span>
              <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)} className="rounded border px-3 py-1 text-xs font-semibold disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}