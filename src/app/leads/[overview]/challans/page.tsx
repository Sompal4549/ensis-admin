"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { ArrowLeft, Loader2, Plus, Eye, Trash2, Truck, Package, CheckCircle, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { invoiceApi, Invoice, Lead, leadApi } from "@/lib/api";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { CreateDeliveryChallanModal } from "@/components/common/CreateTaxInvoiceModal";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500" },
};

export default function ChallansPage({ params }: { params: Promise<{ overview: string }> }) {
  const { overview: leadId } = use(params);
  const router = useRouter();
  const [challans, setChallans] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [estimates, setEstimates] = useState<Invoice[]>([]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoiceApi.listByLead(leadId, 1, 200);
      const dc = (res.invoices || []).filter((inv) => inv.type === "delivery_challan");
      setChallans(dc);
    } catch {
      toast.error("Failed to load challans");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchChallans();
    leadApi.get(leadId).then(setLead).catch(() => {});
    invoiceApi.listByLead(leadId, 1, 200).then((res) => {
      const proformas = (res.invoices || []).filter((inv) => inv.type === "proforma");
      setEstimates(proformas);
    }).catch(() => {});
  }, [leadId, fetchChallans]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await invoiceApi.remove(pendingDelete._id);
      toast.success("Challan deleted");
      setPendingDelete(null);
      fetchChallans();
    } catch {
      toast.error("Failed to delete challan");
    }
  };

  const totalChallans = challans.length;
  const totalItems = challans.reduce((sum, c) => sum + (c.items?.length || 0), 0);
  const acknowledged = challans.filter((c) => c.status === "delivered" || c.status === "sent").length;
  const pending = challans.filter((c) => c.status === "draft" || c.status === "pending").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-slate-800 uppercase tracking-wider">Delivery Challans</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700"
        >
          <Plus size={14} /> Create Challan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Truck size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">{totalChallans}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total Challans</p>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Created</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Package size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">{totalItems}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total Items</p>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Dispatched</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
              <CheckCircle size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">{acknowledged}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Acknowledged</p>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Completed</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">{pending}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Pending</p>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">In Transit</span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-emerald-600" /></div>
      ) : challans.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm text-center py-8">
          <Truck size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-500">No delivery challans created yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700"
          >
            <Plus size={14} /> Create Your First Challan
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">S.NO.</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Challan No.</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Proforma No.</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Items</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Quantity</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Amount</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Status</th>
                <th className="text-right px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((challan, idx) => {
                const statusConf = STATUS_CONFIG[challan.status] || STATUS_CONFIG.draft;
                const totalQty = challan.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                const sourceProforma = challan.sourceProformaInvoice || "-";
                return (
                  <tr key={challan._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-emerald-600" />
                        <span className="font-semibold text-emerald-700">{challan.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(challan.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      {typeof sourceProforma === "object" && sourceProforma !== null ? (
                        <span className="font-medium text-blue-700">{(sourceProforma as any).invoiceNumber || "-"}</span>
                      ) : (
                        <span className="text-slate-500">{typeof sourceProforma === "string" && sourceProforma !== "-" ? sourceProforma.slice(-8).toUpperCase() : "-"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{challan.items?.length || 0}</td>
                    <td className="px-4 py-3 text-slate-600">{totalQty}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{fmt(challan.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${statusConf.color}`}>{statusConf.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/leads/${leadId}/estimate/${typeof sourceProforma === "string" ? sourceProforma : (sourceProforma as any)?._id || ""}`} className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="View Estimate">
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => setPendingDelete(challan)} className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100" title="Delete Challan">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog isOpen={!!pendingDelete} onClose={() => setPendingDelete(null)} onConfirm={handleDelete} title="Delete Challan" message={`Delete challan ${pendingDelete?.invoiceNumber}?`} />

      {showCreateModal && (
        <CreateDeliveryChallanModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchChallans();
          }}
          estimates={estimates}
          leadId={leadId}
        />
      )}
    </div>
  );
}