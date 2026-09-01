"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Loader2, Search, Eye, Trash2, Plus, Flame, Snowflake, Filter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { leadApi, Lead } from "@/lib/api";
import { fieldClass } from "@/constants";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const PAGE_SIZE = 10;

export default function LeadsOverviewPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLeads = useCallback(async (p = page, s = search) => {
    setLoading(true);
    try {
      const params: { search?: string; page?: number; limit?: number } = { page: p, limit: PAGE_SIZE };
      if (s) params.search = s;
      const res = await leadApi.list(params);
      setLeads(res.leads);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchLeads(1); }, []);

  const handleSearch = () => { setPage(1); fetchLeads(1, search); };
  const handlePageChange = (p: number) => { setPage(p); fetchLeads(p, search); };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await leadApi.remove(pendingDelete._id);
      toast.success("Lead deleted");
      setPendingDelete(null);
      fetchLeads();
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1 max-w-xs">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <button onClick={handleSearch} className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-medium hover:bg-emerald-900">Search</button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Filter size={16} /></div>
          <h1 className="text-sm font-bold">Leads Overview</h1>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{total}</span>
        </div>
        <Link href="/leads/add-lead" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-[11px] font-bold hover:bg-emerald-900 transition-colors">
          <Plus size={12} /> Add Lead
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={20} className="animate-spin text-emerald-600" /></div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 text-center py-12">
          <p className="text-xs text-slate-500">No leads found</p>
          <Link href="/leads/add-lead" className="inline-flex items-center gap-1 mt-2 text-[11px] text-emerald-700 hover:underline"><Plus size={10} /> Create lead</Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-bold tracking-wider">
                  <th className="text-left px-4 py-2.5 text-slate-700">Name</th>
                  <th className="text-left px-4 py-2.5 text-slate-700 hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-2.5 text-slate-700 hidden lg:table-cell">Email</th>
                  <th className="text-left px-4 py-2.5 text-slate-700 hidden lg:table-cell">Phone</th>
                  <th className="text-left px-4 py-2.5 text-slate-700">Status</th>
                  <th className="text-left px-4 py-2.5 text-slate-700 hidden xl:table-cell">Assigned</th>
                  <th className="text-right px-4 py-2.5 text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => router.push(`/leads/${lead._id}`)}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {lead.leadImage ? (
                          <img src={lead.leadImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-[8px] ${lead.leadCategory === "hot" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>{lead.firstName[0]}{lead.lastName[0]}</div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-800 truncate">{lead.firstName} {lead.lastName}</span>
                            {lead.leadCategory === "hot" ? <Flame size={10} className="text-orange-500 shrink-0" /> : lead.leadCategory === "cold" ? <Snowflake size={10} className="text-blue-500 shrink-0" /> : null}
                          </div>
                          <span className="text-[9px] text-slate-600">{lead.leadType} · {lead.leadSource}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-800 hidden md:table-cell truncate max-w-[120px]">{lead.companyName || "--"}</td>
                    <td className="px-4 py-2.5 text-slate-800 hidden lg:table-cell truncate max-w-[150px]">{lead.email}</td>
                    <td className="px-4 py-2.5 text-slate-800 hidden lg:table-cell">{lead.phoneCode} {lead.phone}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                        lead.leadStatus === "New" ? "bg-blue-100 text-blue-700" :
                        lead.leadStatus === "Contacted" ? "bg-purple-100 text-purple-700" :
                        lead.leadStatus === "Qualified" ? "bg-emerald-100 text-emerald-700" :
                        lead.leadStatus === "Negotiation" ? "bg-orange-100 text-orange-700" :
                        lead.leadStatus === "Converted" ? "bg-green-100 text-green-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>{lead.leadStatus}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 hidden xl:table-cell truncate max-w-[90px]">
                      {lead.assignedTo && typeof lead.assignedTo === "object" ? lead.assignedTo.name : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/leads/${lead._id}`} className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600" title="View"><Eye size={12} /></Link>
                        <button onClick={() => setPendingDelete(lead)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Page {page} of {totalPages} ({total} leads)</span>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2;
                  if (p < 1 || p > totalPages) return null;
                  return <button key={p} onClick={() => handlePageChange(p)} className={`w-7 h-7 rounded-lg text-[11px] font-medium ${p === page ? "bg-emerald-800 text-white" : "border border-slate-200 hover:bg-slate-50"}`}>{p}</button>;
                })}
                <button disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog isOpen={!!pendingDelete} onClose={() => setPendingDelete(null)} onConfirm={handleDelete} title="Delete Lead" message={`Delete ${pendingDelete?.firstName} ${pendingDelete?.lastName}?`} />
    </div>
  );
}
