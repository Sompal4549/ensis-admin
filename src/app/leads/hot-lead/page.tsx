"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Loader2, Search, ArrowLeft, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { leadApi, Lead } from "@/lib/api";
import { cardClass, fieldClass } from "@/constants";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const PAGE_SIZE = 10;

export default function HotLeadPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLeads = async (p = page) => {
    setLoading(true);
    try {
      const res = await leadApi.list({ leadCategory: "hot", search: search || undefined, page: p, limit: PAGE_SIZE });
      setLeads(res.leads);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load hot leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(1); setPage(1); }, []);

  const handleSearch = () => { setPage(1); fetchLeads(1); };
  const handlePageChange = (p: number) => { setPage(p); fetchLeads(p); };

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

  const handleMarkCold = async (lead: Lead) => {
    try {
      await leadApi.update(lead._id, { leadCategory: "cold" });
      toast.success("Moved to cold");
      fetchLeads();
    } catch {
      toast.error("Failed to update");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Link href="/leads" className="p-1.5 rounded-lg hover:bg-slate-100"><ArrowLeft size={16} /></Link>
        <h1 className="text-base font-bold text-slate-800">Hot Leads</h1>
        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{total}</span>
      </div>

      <div className={`${cardClass} mb-2 py-1.5`}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1 rounded-lg border border-slate-200 text-[9px] outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button onClick={handleSearch} className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-[11px] font-medium hover:bg-emerald-900">Search</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-emerald-600" /></div>
      ) : leads.length === 0 ? (
        <div className={`${cardClass} text-center py-4`}>
          <p className="text-xs text-slate-500">No hot leads found</p>
        </div>
      ) : (
        <>
          <div className={`${cardClass} p-0 overflow-hidden`}>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-3 py-1 font-semibold text-slate-500">Name</th>
                  <th className="text-left px-3 py-1 font-semibold text-slate-500 hidden md:table-cell">Company</th>
                  <th className="text-left px-3 py-1 font-semibold text-slate-500 hidden lg:table-cell">Email</th>
                  <th className="text-left px-3 py-1 font-semibold text-slate-500 hidden lg:table-cell">Phone</th>
                  <th className="text-left px-3 py-1 font-semibold text-slate-500">Status</th>
                  <th className="text-left px-3 py-1 font-semibold text-slate-500">Priority</th>
                  <th className="text-left px-3 py-1 font-semibold text-slate-500 hidden xl:table-cell">Assigned</th>
                  <th className="text-right px-3 py-1 font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer" onClick={() => router.push(`/leads/${lead._id}`)}>
                    <td className="px-3 py-1">
                      <div className="flex items-center gap-2">
                        {lead.leadImage ? (
                          <img src={lead.leadImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-[9px]">{lead.firstName[0]}{lead.lastName[0]}</div>
                        )}
                        <span className="font-medium text-slate-800 truncate max-w-[120px]">{lead.firstName} {lead.lastName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-800 hidden md:table-cell truncate max-w-[140px]">{lead.companyName}</td>
                    <td className="px-3 py-2 text-slate-800 hidden lg:table-cell truncate max-w-[160px]">{lead.email}</td>
                    <td className="px-3 py-2 text-slate-800 hidden lg:table-cell">{lead.phoneCode} {lead.phone}</td>
                    <td className="px-3 py-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                        lead.leadStatus === "New" ? "bg-blue-100 text-blue-700" :
                        lead.leadStatus === "Contacted" ? "bg-purple-100 text-purple-700" :
                        lead.leadStatus === "Qualified" ? "bg-emerald-100 text-emerald-700" :
                        lead.leadStatus === "Negotiation" ? "bg-orange-100 text-orange-700" :
                        lead.leadStatus === "Converted" ? "bg-green-100 text-green-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>{lead.leadStatus}</span>
                    </td>
                    <td className="px-3 py-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                        lead.priority === "High" ? "bg-red-100 text-red-700" :
                        lead.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>{lead.priority}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-700 hidden xl:table-cell truncate max-w-[100px]">
                      {lead.assignedTo && typeof lead.assignedTo === "object" ? lead.assignedTo.name : "-"}
                    </td>
                    <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleMarkCold(lead)} className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 text-[10px]" title="Move to Cold">Cold</button>
                        <button onClick={() => setPendingDelete(lead)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-400">Page {page} of {totalPages} ({total} leads)</span>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => handlePageChange(p)} className={`w-7 h-7 rounded-lg text-[11px] font-medium ${p === page ? "bg-emerald-800 text-white" : "border border-slate-200 hover:bg-slate-50"}`}>{p}</button>
                  );
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
