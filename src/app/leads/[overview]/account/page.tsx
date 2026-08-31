"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { ArrowLeft, FileText, Truck, Receipt, CreditCard, Undo2, MinusCircle, Clock, Loader2, ShieldPlus, PencilLine, Trash2, History, Plus, Download, Globe, Printer } from "lucide-react";

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
import { leadApi, Lead, activityLogApi, ActivityLog, ActivityAction, invoiceApi, Invoice, productApi, orderApi, Order } from "@/lib/api";
import { toast } from "react-toastify";

const ACTION_META: Record<ActivityAction, { label: string; color: string; icon: React.ReactNode }> = {
  create: { label: "Created", color: "bg-emerald-100 text-emerald-700", icon: <ShieldPlus size={10} /> },
  update: { label: "Updated", color: "bg-blue-100 text-blue-700", icon: <PencilLine size={10} /> },
  delete: { label: "Deleted", color: "bg-red-100 text-red-700", icon: <Trash2 size={10} /> },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  proforma: { label: "Proforma", color: "bg-blue-100 text-blue-700" },
  tax: { label: "Invoice", color: "bg-purple-100 text-purple-700" },
  credit_note: { label: "Credit Note", color: "bg-cyan-100 text-cyan-700" },
  debit_note: { label: "Debit Note", color: "bg-rose-100 text-rose-700" },
  delivery_challan: { label: "Challan", color: "bg-emerald-100 text-emerald-700" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  partial: { label: "Partial", color: "bg-amber-100 text-amber-700" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500" },
};

const formatRelative = (iso: string) => {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const changeSummary = (log: ActivityLog): string => {
  if (log.action === "delete") return "Record deleted";
  const changes = log.changes ?? {};
  const keys = Object.keys(changes);
  if (keys.length === 0) return log.action === "create" ? "Record created" : "Record updated";
  if (keys.length <= 3) return keys.map((k) => k.replace(/([A-Z])/g, " $1").trim()).join(", ");
  return `${keys.length} fields changed`;
};

export default function AccountPage({ params }: { params: Promise<{ overview: string }> }) {
  const { overview: leadId } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsTotal, setLogsTotal] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [stats, setStats] = useState({ totalAmount: 0, paymentReceived: 0, count: 0, paidCount: 0 });
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [createType, setCreateType] = useState<string>("tax");

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const data = await activityLogApi.list({ entity: "Lead", entityId: leadId, limit: 20 });
      setLogs(data.logs || []);
      setLogsTotal(data.total || 0);
    } catch {
    } finally {
      setLogsLoading(false);
    }
  }, [leadId]);

  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    try {
      const data = await invoiceApi.listByLead(leadId, 1, 10);
      setInvoices(data.invoices || []);
    } catch {
    } finally {
      setInvoicesLoading(false);
    }
  }, [leadId]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await orderApi.listByLead(leadId, 1, 10);
      setOrders(data.orders || []);
    } catch {
    } finally {
      setOrdersLoading(false);
    }
  }, [leadId]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await invoiceApi.getStats(leadId);
      setStats(data);
    } catch {
    }
  }, [leadId]);

  useEffect(() => {
    (async () => {
      try {
        const data = await leadApi.get(leadId);
        setLead(data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
    fetchLogs();
    fetchInvoices();
    fetchOrders();
    fetchStats();
  }, [leadId, fetchLogs, fetchInvoices, fetchOrders, fetchStats]);

  if (loading) return <div className="flex justify-center py-20 text-sm text-slate-400">Loading...</div>;
  if (!lead) return <div className="flex justify-center py-20 text-sm text-slate-400">Lead not found</div>;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const orderTotal = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const orderPaid = orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const combinedTotal = stats.totalAmount + orderTotal;
  const combinedReceived = stats.paymentReceived + orderPaid;
  const combinedPending = combinedTotal - combinedReceived;
  const receivedPercent = combinedTotal > 0 ? ((combinedReceived / combinedTotal) * 100).toFixed(1) : "0.00";
  const pendingPercent = combinedTotal > 0 ? ((combinedPending / combinedTotal) * 100).toFixed(1) : "100";
  const totalCount = stats.count + orders.length;

  const handleCreateInvoice = (type: string) => {
    setCreateType(type);
    setShowCreateInvoice(true);
  };

  const handleSendEmail = async (inv: Invoice) => {
    try {
      const res = await invoiceApi.sendEmail(inv._id);
      toast.success(res.message || "Invoice sent via email");
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    }
  };

  const handleSendWhatsApp = async (inv: Invoice) => {
    try {
      const res = await invoiceApi.sendWhatsApp(inv._id);
      toast.success(res.message || "Invoice sent via WhatsApp");
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to send via WhatsApp");
    }
  };

  const handleSendOrderEmail = async (order: Order) => {
    try {
      const res = await orderApi.sendEmail(order._id);
      toast.success(res.message || "Order sent via email");
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    }
  };

  const handleSendOrderWhatsApp = async (order: Order) => {
    try {
      const res = await orderApi.sendWhatsApp(order._id);
      toast.success(res.message || "Order sent via WhatsApp");
    } catch (err: any) {
      toast.error(err.message || "Failed to send via WhatsApp");
    }
  };

  const handleInvoiceCreated = () => {
    setShowCreateInvoice(false);
    fetchInvoices();
    fetchStats();
  };

  const downloadInvoice = (inv: Invoice) => {
    const leadName = typeof inv.lead === "object" ? `${inv.lead.firstName} ${inv.lead.lastName}` : "Customer";
    const rows = inv.items.map((item) =>
      `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:center">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt(item.unitPrice)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt(item.amount)}</td>
      </tr>`
    ).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${inv.invoiceNumber}</title></head>
<body style="margin:0;font-family:Jost,Arial,sans-serif;background:#FCFAF6;color:#1F3A2A">
<div style="max-width:760px;margin:40px auto;background:#fff;border:1px solid #EDE4D3;border-radius:20px;overflow:hidden">
<div style="background:#1F3A2A;padding:32px 40px;color:#fff">
<div style="margin:0;font-size:22px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">ENSIS</div>
<p style="margin:6px 0 0;font-size:12px;color:#C7A55B;letter-spacing:.1em;text-transform:uppercase">${TYPE_CONFIG[inv.type]?.label || "Invoice"} (${inv.invoiceNumber})</p>
</div>
<div style="padding:32px 40px">
<div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap">
<div>
<p style="margin:0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Invoice No</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${inv.invoiceNumber}</p>
<p style="margin:14px 0 0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Date</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${new Date(inv.createdAt).toLocaleDateString("en-IN")}</p>
</div>
<div style="text-align:right">
<p style="margin:0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Bill To</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${inv.billingAddress.name}</p>
${inv.billingAddress.email ? `<p style="margin:2px 0 0;font-size:12px">${inv.billingAddress.email}</p>` : ""}
${inv.billingAddress.phone ? `<p style="margin:2px 0 0;font-size:12px">${inv.billingAddress.phone}</p>` : ""}
</div>
</div>
<table style="width:100%;margin-top:28px;border-collapse:collapse;font-size:13px">
<thead><tr style="background:#F7F2E9">
<th style="padding:10px 12px;text-align:left">Item</th><th style="padding:10px 12px">Qty</th><th style="padding:10px 12px;text-align:right">Price</th><th style="padding:10px 12px;text-align:right">Total</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
<div style="margin-top:20px;text-align:right;font-size:13px">
<p style="margin:4px 0">Subtotal: <strong>${fmt(inv.subtotal)}</strong></p>
${inv.discount ? `<p style="margin:4px 0;color:#2F7D5A">Discount: - ${fmt(inv.discount)}</p>` : ""}
<p style="margin:4px 0">GST: <strong>${fmt(inv.tax)}</strong></p>
<p style="margin:10px 0 0;font-size:16px;border-top:1px solid #EDE4D3;padding-top:10px">Grand Total: <strong>${fmt(inv.totalAmount)}</strong></p>
</div>
<p style="margin-top:28px;font-size:11px;color:#6c7068;text-align:center">Thank you for choosing ENSIS.</p>
</div></div></body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printOrder = (order: Order) => {
    const items = (order as any).items || [];
    const rows = items.map((item: any) =>
      `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2">${item.name || item.productName || "Item"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:center">${item.quantity || 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt(item.price || item.unitPrice || 0)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt((item.price || item.unitPrice || 0) * (item.quantity || 1))}</td>
      </tr>`
    ).join("");

    const orderStatusLabel = order.paymentStatus === "paid" ? "Paid" :
      order.orderStatus === "cancelled" ? "Cancelled" :
      order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Order #${order._id.slice(-6).toUpperCase()}</title>
<style>@media print{body{margin:0} @page{size:A4;margin:10mm}}</style></head>
<body style="margin:0;font-family:Jost,Arial,sans-serif;background:#FCFAF6;color:#1F3A2A">
<div style="max-width:760px;margin:20px auto;background:#fff;border:1px solid #EDE4D3;border-radius:20px;overflow:hidden">
<div style="background:#1F3A2A;padding:32px 40px;color:#fff">
<div style="margin:0;font-size:22px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">ENSIS</div>
<p style="margin:6px 0 0;font-size:12px;color:#C7A55B;letter-spacing:.1em;text-transform:uppercase">Order #${order._id.slice(-6).toUpperCase()}</p>
</div>
<div style="padding:32px 40px">
<div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap">
<div>
<p style="margin:0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Order No</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">#${order._id.slice(-6).toUpperCase()}</p>
<p style="margin:14px 0 0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Date</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
</div>
<div style="text-align:right">
<p style="margin:0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Status</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${orderStatusLabel}</p>
</div>
</div>
${rows ? `<table style="width:100%;margin-top:28px;border-collapse:collapse;font-size:13px">
<thead><tr style="background:#F7F2E9">
<th style="padding:10px 12px;text-align:left">Item</th><th style="padding:10px 12px">Qty</th><th style="padding:10px 12px;text-align:right">Price</th><th style="padding:10px 12px;text-align:right">Total</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>` : ""}
<div style="margin-top:20px;text-align:right;font-size:13px">
<p style="margin:10px 0 0;font-size:16px;border-top:1px solid #EDE4D3;padding-top:10px">Grand Total: <strong>${fmt(order.totalAmount)}</strong></p>
</div>
<p style="margin-top:28px;font-size:11px;color:#6c7068;text-align:center">Thank you for choosing ENSIS — Premium Wellness & Panchkarma Spaces.<br>This is a computer generated order receipt.</p>
</div></div></body></html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const printInvoice = (inv: Invoice) => {
    const rows = inv.items.map((item) =>
      `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:center">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt(item.unitPrice)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt(item.gstRate)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt(item.amount)}</td>
      </tr>`
    ).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${inv.invoiceNumber}</title>
<style>@media print{body{margin:0} @page{size:A4;margin:10mm}}</style></head>
<body style="margin:0;font-family:Jost,Arial,sans-serif;background:#FCFAF6;color:#1F3A2A">
<div style="max-width:760px;margin:20px auto;background:#fff;border:1px solid #EDE4D3;border-radius:20px;overflow:hidden">
<div style="background:#1F3A2A;padding:32px 40px;color:#fff">
<div style="margin:0;font-size:22px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">ENSIS</div>
<p style="margin:6px 0 0;font-size:12px;color:#C7A55B;letter-spacing:.1em;text-transform:uppercase">${TYPE_CONFIG[inv.type]?.label || "Invoice"} (${inv.invoiceNumber})</p>
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
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href={`/leads/${leadId}`} className="p-1.5 rounded-lg hover:bg-slate-100"><ArrowLeft size={16} /></Link>
        <h1 className="text-sm font-bold text-slate-800">Account — {lead.firstName} {lead.lastName}</h1>
      </div>

      {/* Company Info + Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* Company Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
              {lead.firstName[0]}{lead.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-800">{lead.firstName} {lead.lastName}</h2>
              <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 mt-2 text-[10px]">
                <span className="flex items-center gap-1.5 text-slate-600"><span className="text-slate-400">✉</span> {lead.email || "--"}</span>
                <span className="flex items-center gap-1.5 text-slate-600"><span className="text-slate-400">☎</span> {lead.phoneCode} {lead.phone}</span>
                <span className="flex items-center gap-1.5 text-slate-600"><span className="text-slate-400">🏭</span> {lead.typeOfBusiness || "--"}</span>
                <span className="flex items-center gap-1.5 text-slate-600"><span className="text-slate-400">📊</span> {lead.industrySector || "--"}</span>
                <span className="flex items-center gap-1.5 text-slate-600"><span className="text-slate-400">👤</span> {lead.designation || "--"}</span>
                <span className="flex items-center gap-1.5 text-slate-600"><span className="text-slate-400">🌐</span> {lead.website || "--"}</span>
                <span className="col-span-2 flex items-start gap-1.5 text-slate-600"><span className="text-slate-400 shrink-0">📍</span> {[lead.addressLine, lead.city, lead.state, lead.country].filter(Boolean).join(", ") || "--"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{fmt(combinedTotal)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{totalCount} Documents</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 p-3 text-center">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Received</p>
            <p className="text-sm font-bold text-emerald-700 mt-1">{fmt(combinedReceived)}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">{receivedPercent}%</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-3 text-center">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Pending</p>
            <p className="text-sm font-bold text-red-600 mt-1">{fmt(combinedPending)}</p>
            <p className="text-[10px] text-red-400 mt-0.5">{pendingPercent}%</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { icon: FileText, label: "Proforma Invoice", desc: "Create proforma", iconBg: "bg-blue-50 group-hover:bg-blue-100", text: "text-blue-600", hover: "hover:bg-blue-50", type: "proforma" },
          { icon: Truck, label: "Delivery Challan", desc: "Create challan", iconBg: "bg-emerald-50 group-hover:bg-emerald-100", text: "text-emerald-600", hover: "hover:bg-emerald-50", type: "delivery_challan" },
          { icon: Receipt, label: "Invoice", desc: "New invoice", iconBg: "bg-purple-50 group-hover:bg-purple-100", text: "text-purple-600", hover: "hover:bg-purple-50", type: "tax" },
          { icon: CreditCard, label: "Payments", desc: "Record payments", iconBg: "bg-amber-50 group-hover:bg-amber-100", text: "text-amber-600", hover: "hover:bg-amber-50", type: "" },
          { icon: Undo2, label: "Credit Note", desc: "Create credit", iconBg: "bg-cyan-50 group-hover:bg-cyan-100", text: "text-cyan-600", hover: "hover:bg-cyan-50", type: "credit_note" },
          { icon: MinusCircle, label: "Debit Note", desc: "Create debit", iconBg: "bg-rose-50 group-hover:bg-rose-100", text: "text-rose-600", hover: "hover:bg-rose-50", type: "debit_note" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.type) {
                handleCreateInvoice(item.type);
              } else {
                router.push("/invoices");
              }
            }}
            className={`flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 shadow-sm bg-white ${item.hover} transition-colors text-left group cursor-pointer`}
          >
            <div className={`p-2 rounded-md ${item.iconBg} ${item.text}`}>
              <item.icon size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{item.label}</p>
              <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_280px] gap-4">
        {/* Recent Documents */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700">Recent Documents</h3>
            <Link href="/invoices" className="text-[10px] font-semibold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="text-left py-1.5 font-semibold">Document</th>
                  <th className="text-left py-1.5 font-semibold">No.</th>
                  <th className="text-left py-1.5 font-semibold">Date</th>
                  <th className="text-right py-1.5 font-semibold">Amount</th>
                  <th className="text-left py-1.5 font-semibold">Status</th>
                  <th className="text-left py-1.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoicesLoading || ordersLoading ? (
                  <tr><td colSpan={6} className="py-6 text-center"><Loader2 size={16} className="animate-spin text-slate-300 mx-auto" /></td></tr>
                ) : (
                  <>
                    {/* Invoices */}
                    {invoices.map((inv) => {
                      const typeConf = TYPE_CONFIG[inv.type] || TYPE_CONFIG.tax;
                      const statusConf = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
                      return (
                        <tr key={`inv-${inv._id}`} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-1.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${typeConf.color}`}>{typeConf.label}</span>
                          </td>
                          <td className="py-1.5 font-medium text-slate-800">{inv.invoiceNumber}</td>
                          <td className="py-1.5 text-slate-500">{new Date(inv.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="py-1.5 text-right font-medium text-slate-800">{fmt(inv.totalAmount)}</td>
                          <td className="py-1.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusConf.color}`}>{statusConf.label}</span>
                          </td>
                          <td className="py-1.5">
                            <div className="flex items-center gap-1">
                              <button onClick={() => downloadInvoice(inv)} className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600" title="Download">
                                <Download size={12} />
                              </button>
                              <button onClick={() => printInvoice(inv)} className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600" title="Print">
                                <Printer size={12} />
                              </button>
                              <button onClick={() => handleSendEmail(inv)} className="p-1 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600" title="Send Email">
                                <EmailIcon size={12} />
                              </button>
                              <button onClick={() => handleSendWhatsApp(inv)} className="p-1 rounded hover:bg-green-50 text-slate-400 hover:text-green-600" title="Send WhatsApp">
                                <WhatsAppIcon size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Website Orders */}
                    {orders.map((order) => {
                      const orderStatusColor = order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" :
                        order.orderStatus === "cancelled" ? "bg-red-100 text-red-600" :
                        order.orderStatus === "delivered" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700";
                      const orderStatusLabel = order.paymentStatus === "paid" ? "Paid" :
                        order.orderStatus === "cancelled" ? "Cancelled" :
                        order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);
                      return (
                        <tr key={`order-${order._id}`} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-1.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700 inline-flex items-center gap-1">
                              <Globe size={9} /> Order
                            </span>
                          </td>
                          <td className="py-1.5 font-medium text-slate-800">#{order._id.slice(-6).toUpperCase()}</td>
                          <td className="py-1.5 text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="py-1.5 text-right font-medium text-slate-800">{fmt(order.totalAmount)}</td>
                          <td className="py-1.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${orderStatusColor}`}>{orderStatusLabel}</span>
                          </td>
                          <td className="py-1.5">
                            <div className="flex items-center gap-1">
                              <Link href={`/orders-list-management`} className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 inline-block" title="View Order">
                                <Globe size={12} />
                              </Link>
                              <button onClick={() => printOrder(order)} className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600" title="Print">
                                <Printer size={12} />
                              </button>
                              <button onClick={() => handleSendOrderEmail(order)} className="p-1 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600" title="Send Email">
                                <EmailIcon size={12} />
                              </button>
                              <button onClick={() => handleSendOrderWhatsApp(order)} className="p-1 rounded hover:bg-green-50 text-slate-400 hover:text-green-600" title="Send WhatsApp">
                                <WhatsAppIcon size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {invoices.length === 0 && orders.length === 0 && (
                      <tr className="text-slate-500">
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-300">No documents yet</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-xs font-bold text-slate-700 mb-3">Payment Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="text-left py-1.5 font-semibold">#</th>
                  <th className="text-left py-1.5 font-semibold">Type</th>
                  <th className="text-left py-1.5 font-semibold">Due Date</th>
                  <th className="text-right py-1.5 font-semibold">Amount</th>
                  <th className="text-left py-1.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const pendingInvoices = invoices.filter((inv) => inv.dueDate && inv.status !== "paid" && inv.status !== "cancelled");
                  const pendingOrders = orders.filter((o) => o.paymentStatus !== "paid" && o.orderStatus !== "cancelled");
                  const allPending = [
                    ...pendingInvoices.map((inv) => ({ type: "invoice", label: TYPE_CONFIG[inv.type]?.label || "Invoice", color: TYPE_CONFIG[inv.type]?.color || "", dueDate: inv.dueDate!, amount: inv.totalAmount - inv.paymentReceived, status: inv.status, statusColor: STATUS_CONFIG[inv.status]?.color || "" })),
                    ...pendingOrders.map((o) => ({ type: "order", label: "Website Order", color: "bg-indigo-100 text-indigo-700", dueDate: new Date(o.createdAt).toISOString(), amount: o.totalAmount, status: o.paymentStatus, statusColor: o.paymentStatus === "pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600" })),
                  ];
                  if (allPending.length === 0) {
                    return (
                      <tr className="text-slate-500">
                        <td colSpan={5} className="py-8 text-center text-xs text-slate-300">No schedule</td>
                      </tr>
                    );
                  }
                  return allPending.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-50">
                      <td className="py-1.5 text-slate-500">{idx + 1}</td>
                      <td className="py-1.5"><span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${item.color}`}>{item.label}</span></td>
                      <td className="py-1.5 text-slate-600">{new Date(item.dueDate).toLocaleDateString("en-IN")}</td>
                      <td className="py-1.5 text-right font-medium text-slate-800">{fmt(item.amount)}</td>
                      <td className="py-1.5"><span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${item.statusColor}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></td>
                    </tr>
                  ));
                })()}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 font-bold text-slate-700">
                  <td colSpan={3} className="py-1.5 text-xs">Total Pending</td>
                  <td className="py-1.5 text-right text-xs">{fmt(combinedPending)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <History size={13} className="text-blue-500" />
              Activity Logs
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
              {logsLoading ? "..." : `${logsTotal} Recent`}
            </span>
          </div>
          {logsLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-blue-500" /></div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock size={24} className="text-slate-200 mb-2" />
              <p className="text-xs text-slate-300">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {logs.map((log) => {
                const meta = ACTION_META[log.action] ?? ACTION_META.update;
                return (
                  <div key={log._id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`p-1 rounded-md shrink-0 ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-700">{meta.label}</span>
                        <span className="text-[9px] text-slate-400">by {log.userName || "Unknown"}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{changeSummary(log)}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{formatRelative(log.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateInvoice && (
        <CreateInvoiceModal
          leadId={leadId}
          initialType={createType}
          onClose={() => setShowCreateInvoice(false)}
          onCreated={handleInvoiceCreated}
        />
      )}
    </div>
  );
}

function CreateInvoiceModal({ leadId, initialType, onClose, onCreated }: { leadId: string; initialType: string; onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [type, setType] = useState(initialType);
  const [items, setItems] = useState<Array<{ name: string; productId: string; quantity: number; unitPrice: number; gstRate: number }>>([
    { name: "", productId: "", quantity: 1, unitPrice: 0, gstRate: 5 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPostal, setBillingPostal] = useState("");
  const [billingCountry, setBillingCountry] = useState("India");
  const [billingGst, setBillingGst] = useState("");
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    productApi.list().then((res: any) => setProducts(res.products || [])).catch(() => {});
    leadApi.get(leadId).then((lead) => {
      setBillingName(`${lead.firstName} ${lead.lastName}`);
      setBillingEmail(lead.email || "");
      setBillingPhone(lead.phone || "");
      setBillingAddress(lead.addressLine || "");
      setBillingCity(lead.city || "");
      setBillingState(lead.state || "");
      setBillingCountry(lead.country || "India");
    }).catch(() => {});
  }, [leadId]);

  const addItem = () => {
    setItems([...items, { name: "", productId: "", quantity: 1, unitPrice: 0, gstRate: 5 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    if (field === "productId" && value) {
      const prod = products.find((p: any) => p._id === value);
      if (prod) {
        updated[idx].name = prod.title;
        updated[idx].unitPrice = prod.price;
        updated[idx].gstRate = prod.gstRate || 5;
      }
    }
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.gstRate) / 100, 0);
  const total = Math.max(0, subtotal + tax - discount + shipping);

  const handleSubmit = async () => {
    if (!billingName) { toast.error("Billing name is required"); return; }
    if (items.some((i) => !i.name || i.quantity < 1)) { toast.error("Fill all item details"); return; }

    setLoading(true);
    try {
      const inv = await invoiceApi.create({
        lead: leadId,
        type: type as any,
        items: items.map((i) => ({
          name: i.name,
          product: i.productId || undefined,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          gstRate: i.gstRate,
          amount: i.quantity * i.unitPrice,
        })),
        billingAddress: {
          name: billingName,
          email: billingEmail,
          phone: billingPhone,
          addressLine: billingAddress,
          city: billingCity,
          state: billingState,
          postalCode: billingPostal,
          country: billingCountry,
          gstNumber: billingGst,
        },
        subtotal,
        tax,
        discount,
        shipping,
        totalAmount: total,
        dueDate: dueDate || undefined,
        notes,
      });
      toast.success("Invoice created");
      setCreatedInvoice(inv);
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!createdInvoice) return;
    setSending(true);
    try {
      const res = await invoiceApi.sendEmail(createdInvoice._id);
      toast.success(res.message || "Invoice sent via email");
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!createdInvoice) return;
    setSending(true);
    try {
      const res = await invoiceApi.sendWhatsApp(createdInvoice._id);
      toast.success(res.message || "Invoice sent via WhatsApp");
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to send via WhatsApp");
    } finally {
      setSending(false);
    }
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const fieldClass = "w-full rounded-lg border border-slate-200 px-2 py-0.5 text-[9px] outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 font-normal";
  const labelClass = "mb-0.5 block text-[9px] font-semibold text-black";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4" onClick={onClose}>
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-800">Create {TYPE_CONFIG[type]?.label || "Invoice"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-base leading-none">&times;</button>
        </div>

        <div className="px-4 py-3 space-y-3 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={fieldClass}>
                <option value="proforma">Proforma Invoice</option>
                <option value="tax">Tax Invoice</option>
                <option value="credit_note">Credit Note</option>
                <option value="debit_note">Debit Note</option>
                <option value="delivery_challan">Delivery Challan</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
            </div>
          </div>

          {/* Billing */}
          <div className="bg-slate-50 rounded-lg p-2 space-y-1.5">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Billing Address</p>
            <div className="grid grid-cols-2 gap-1.5">
              <input placeholder="Name *" value={billingName} onChange={(e) => setBillingName(e.target.value)} className={fieldClass} />
              <input placeholder="Email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} className={fieldClass} />
              <input placeholder="Phone" value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} className={fieldClass} />
              <input placeholder="GSTIN" value={billingGst} onChange={(e) => setBillingGst(e.target.value)} className={fieldClass} />
              <input placeholder="Address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} className={`${fieldClass} col-span-2`} />
              <input placeholder="City" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className={fieldClass} />
              <input placeholder="State" value={billingState} onChange={(e) => setBillingState(e.target.value)} className={fieldClass} />
              <input placeholder="Postal Code" value={billingPostal} onChange={(e) => setBillingPostal(e.target.value)} className={fieldClass} />
              <input placeholder="Country" value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} className={fieldClass} />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Items</p>
              <button onClick={addItem} className="text-[9px] font-semibold text-blue-600 hover:underline">+ Add Item</button>
            </div>
            <div className="space-y-1.5">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1.5">
                  <select value={item.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)} className={`${fieldClass} flex-1 min-w-[90px]`}>
                    <option value="">Custom</option>
                    {products.map((p: any) => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                  <input placeholder="Name" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} className={`${fieldClass} flex-1 min-w-[70px]`} />
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)} className={`${fieldClass} w-12`} min={1} />
                  <input type="number" placeholder="Price" value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} className={`${fieldClass} w-16`} min={0} />
                  <input type="number" placeholder="GST%" value={item.gstRate} onChange={(e) => updateItem(idx, "gstRate", parseFloat(e.target.value) || 0)} className={`${fieldClass} w-12`} min={0} />
                  <span className="text-[9px] font-medium text-slate-600 w-14 text-right shrink-0">{fmt(item.quantity * item.unitPrice)}</span>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-xs leading-none shrink-0">&times;</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${fieldClass} h-12 resize-none`} placeholder="Additional notes..." />
            </div>
            <div className="bg-slate-50 rounded-lg p-2 space-y-1 text-[10px]">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Discount</span>
                <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-16 text-right rounded border border-slate-200 px-1 py-0.5 text-[9px] outline-none" min={0} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Shipping</span>
                <input type="number" value={shipping} onChange={(e) => setShipping(parseFloat(e.target.value) || 0)} className="w-16 text-right rounded border border-slate-200 px-1 py-0.5 text-[9px] outline-none" min={0} />
              </div>
              <div className="flex justify-between"><span className="text-slate-500">GST</span><span className="font-medium">{fmt(tax)}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-800">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-slate-100">
          {createdInvoice ? (
            <>
              <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50">Close</button>
              <button onClick={handleSendEmail} disabled={sending} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[10px] font-bold hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1.5">
                {sending && <Loader2 size={12} className="animate-spin" />}
                <EmailIcon size={11} /> Send Email
              </button>
              <button onClick={handleSendWhatsApp} disabled={sending} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-[10px] font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5">
                {sending && <Loader2 size={12} className="animate-spin" />}
                <WhatsAppIcon size={11} /> Send WhatsApp
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-[10px] font-bold hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-1.5">
                {loading && <Loader2 size={12} className="animate-spin" />}
                Create
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
