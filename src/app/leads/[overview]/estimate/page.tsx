"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { ArrowLeft, Loader2, Plus, Eye, Trash2, FileText, Truck, Receipt, CreditCard, Undo2, MinusCircle, Download, Printer, Clock, DollarSign, CheckCircle, XCircle, Pencil } from "lucide-react";

const WhatsAppIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const EmailIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
import Link from "next/link";
import { useRouter } from "next/navigation";
import { invoiceApi, Invoice, leadApi, Lead } from "@/lib/api";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  partial: { label: "Partial", color: "bg-amber-100 text-amber-700" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500" },
};

export default function EstimatePage({ params }: { params: Promise<{ overview: string }> }) {
  const { overview: leadId } = use(params);
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoiceApi.listByLead(leadId, 1, 200);
      const estimates = (res.invoices || []).filter((inv) => inv.type === "proforma");
      setInvoices(estimates);
    } catch {
      toast.error("Failed to load estimates");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchInvoices();
    leadApi.get(leadId).then(setLead).catch(() => {});
  }, [leadId, fetchInvoices]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await invoiceApi.remove(pendingDelete._id);
      toast.success("Estimate deleted");
      setPendingDelete(null);
      fetchInvoices();
    } catch {
      toast.error("Failed to delete estimate");
    }
  };

  const handleSendEmail = async (inv: Invoice) => {
    try {
      const res = await invoiceApi.sendEmail(inv._id);
      toast.success(res.message || "Sent via email");
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    }
  };

  const handleSendWhatsApp = async (inv: Invoice) => {
    try {
      const res = await invoiceApi.sendWhatsApp(inv._id);
      toast.success(res.message || "Sent via WhatsApp");
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to send via WhatsApp");
    }
  };

  const totalEstimates = invoices.length;
  const totalValue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const activeEstimates = invoices.filter((inv) => inv.status !== "cancelled").length;
  const cancelledEstimates = invoices.filter((inv) => inv.status === "cancelled").length;

  const handleCreateInvoice = async (est: Invoice) => {
    try {
      const res = await invoiceApi.create({
        lead: leadId,
        type: "tax",
        items: est.items,
        billingAddress: est.billingAddress,
        shippingAddress: est.shippingAddress,
        subtotal: est.subtotal,
        discount: est.discount,
        tax: est.tax,
        shipping: est.shipping,
        totalAmount: est.totalAmount,
        notes: est.notes,
        termsAndConditions: est.termsAndConditions,
      });
      toast.success("Invoice created from estimate");
      router.push(`/leads/${leadId}/invoice`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    }
  };

  const printInvoice = (inv: Invoice) => {
    const rows = inv.items.map((item) =>
      `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:center">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt(item.unitPrice)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${item.gstRate}%</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt(item.amount)}</td>
      </tr>`
    ).join("");

    const logoUrl = typeof window !== "undefined" ? window.location.origin + "/images/ensis-logo.png" : "/images/ensis-logo.png";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${inv.invoiceNumber}</title>
<style>@media print{body{margin:0} @page{size:A4;margin:10mm}}</style></head>
<body style="margin:0;font-family:Jost,Arial,sans-serif;background:#FCFAF6;color:#1F3A2A">
<div style="max-width:760px;margin:20px auto;background:#fff;border:1px solid #EDE4D3;border-radius:20px;overflow:hidden">
<div style="background:#1F3A2A;padding:32px 40px;color:#fff;display:flex;align-items:center;gap:16px">
<img src="${logoUrl}" alt="ENSIS Logo" style="height:40px;width:auto;background:#fff;border-radius:8px;padding:4px" />
<div>
<div style="margin:0;font-size:22px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">ENSIS</div>
<p style="margin:6px 0 0;font-size:12px;color:#C7A55B;letter-spacing:.1em;text-transform:uppercase">Estimate (${inv.invoiceNumber})</p>
</div>
</div>
<div style="padding:32px 40px">
<div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap">
<div>
<p style="margin:0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Invoice No</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${inv.invoiceNumber}</p>
<p style="margin:14px 0 0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Date</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${new Date(inv.createdAt).toLocaleDateString("en-IN")}</p>
${inv.dueDate ? `<p style="margin:14px 0 0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Due Date</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${new Date(inv.dueDate).toLocaleDateString("en-IN")}</p>` : ""}
</div>
<div style="text-align:right">
<p style="margin:0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Bill To</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${inv.billingAddress.name}</p>
${inv.billingAddress.email ? `<p style="margin:2px 0 0;font-size:12px">${inv.billingAddress.email}</p>` : ""}
${inv.billingAddress.phone ? `<p style="margin:2px 0 0;font-size:12px">${inv.billingAddress.phone}</p>` : ""}
${inv.billingAddress.addressLine ? `<p style="margin:2px 0 0;font-size:12px">${inv.billingAddress.addressLine}</p>` : ""}
${inv.billingAddress.city ? `<p style="margin:2px 0 0;font-size:12px">${inv.billingAddress.city}, ${inv.billingAddress.state || ""} ${inv.billingAddress.postalCode || ""}</p>` : ""}
${inv.billingAddress.gstNumber ? `<p style="margin:2px 0 0;font-size:12px">GSTIN: ${inv.billingAddress.gstNumber}</p>` : ""}
</div>
</div>
<table style="width:100%;margin-top:28px;border-collapse:collapse;font-size:13px">
<thead><tr style="background:#F7F2E9">
<th style="padding:10px 12px;text-align:left">Item</th><th style="padding:10px 12px">Qty</th><th style="padding:10px 12px;text-align:right">Price</th><th style="padding:10px 12px;text-align:right">GST%</th><th style="padding:10px 12px;text-align:right">Total</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
<div style="margin-top:20px;text-align:right;font-size:13px">
<p style="margin:4px 0">Subtotal: <strong>${fmt(inv.subtotal)}</strong></p>
${inv.discount ? `<p style="margin:4px 0;color:#2F7D5A">Discount: - ${fmt(inv.discount)}</p>` : ""}
${inv.shipping ? `<p style="margin:4px 0">Shipping: ${fmt(inv.shipping)}</p>` : ""}
<p style="margin:4px 0">GST: <strong>${fmt(inv.tax)}</strong></p>
<p style="margin:10px 0 0;font-size:16px;border-top:1px solid #EDE4D3;padding-top:10px">Grand Total (incl. GST): <strong>${fmt(inv.totalAmount)}</strong></p>
</div>
${inv.notes ? `<p style="margin-top:20px;font-size:12px;color:#6c7068"><strong>Notes:</strong> ${inv.notes}</p>` : ""}
<p style="margin-top:28px;font-size:11px;color:#6c7068;text-align:center">Thank you for choosing ENSIS — Premium Wellness & Panchkarma Spaces.<br>This is a computer generated invoice.</p>
</div></div></body></html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-slate-800 uppercase tracking-wider">Estimate</h1>
        </div>
        <Link
          href={`/leads/${leadId}/estimate/create`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700"
        >
          <Plus size={14} /> Create Estimate
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <FileText size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{totalEstimates}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Estimates</p>
            </div>
          </div>
          <p className="text-[10px] text-blue-600 mt-2 font-medium">Created</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50">
              <DollarSign size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{fmt(totalValue)}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Value</p>
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 mt-2 font-medium">Amount</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{activeEstimates}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Estimates</p>
            </div>
          </div>
          <p className="text-[10px] text-green-600 mt-2 font-medium">Valid</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <XCircle size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{cancelledEstimates}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cancelled</p>
            </div>
          </div>
          <p className="text-[10px] text-red-500 mt-2 font-medium">Invalid</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-emerald-600" /></div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm text-center py-8">
          <p className="text-xs text-slate-500">No estimates found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">S.NO.</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Estimate</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Delivery Challan</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Invoice</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Updated Details</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Status</th>
                <th className="text-right px-4 py-2 font-semibold text-slate-500 uppercase text-[9px] tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => {
                const statusConf = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
                const updatedBy = typeof inv.createdBy === "object" ? inv.createdBy.name || "-" : "-";
                return (
                  <tr key={inv._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-700">{inv.invoiceNumber}</span>
                        <span className="text-emerald-600 font-medium">| {fmt(inv.totalAmount)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}, {new Date(inv.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Truck size={12} className="text-slate-400" />
                            <span className="text-[10px] font-medium text-slate-600">0 Challans</span>
                          </div>
                          <span className="text-[10px] text-slate-400">0/1 qty</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1">1 quantity remaining</p>
                        <button className="mt-1.5 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-medium hover:bg-emerald-700">
                          <Plus size={10} /> Create
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCreateInvoice(inv)}
                        className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-semibold hover:bg-blue-100"
                      >
                        Create Invoice
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] font-medium text-slate-700">{updatedBy || "-"}</p>
                      <p className="text-[10px] text-slate-400">{new Date(inv.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}, {new Date(inv.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${statusConf.color}`}>{statusConf.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/leads/${leadId}/estimate/${inv._id}`} className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="View Estimate"><Eye size={14} /></Link>
                        <Link href={`/leads/${leadId}/estimate/${inv._id}/edit`} className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100" title="Edit Estimate"><Pencil size={14} /></Link>
                        <button onClick={() => handleSendWhatsApp(inv)} className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100" title="WhatsApp"><WhatsAppIcon size={14} /></button>
                        <button onClick={() => handleSendEmail(inv)} className="p-1.5 rounded bg-purple-50 text-purple-600 hover:bg-purple-100" title="Email"><EmailIcon size={14} /></button>
                        <button onClick={() => setPendingDelete(inv)} className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100" title="Cancel"><XCircle size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog isOpen={!!pendingDelete} onClose={() => setPendingDelete(null)} onConfirm={handleDelete} title="Cancel Estimate" message={`Cancel estimate ${pendingDelete?.invoiceNumber}?`} />
    </div>
  );
}
