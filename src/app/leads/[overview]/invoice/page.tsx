"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { ArrowLeft, Loader2, Search, Plus, Trash2, ChevronLeft, ChevronRight, Eye, Download, Printer, FileText, Truck, Receipt, CreditCard, Undo2, MinusCircle } from "lucide-react";

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
import { useRouter, usePathname } from "next/navigation";
import { invoiceApi, Invoice, Lead, Product, leadApi, productApi } from "@/lib/api";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { cardClass, fieldClass, labelClass } from "@/constants";

const PAGE_SIZE = 15;

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  proforma: { label: "Proforma", color: "bg-blue-100 text-blue-700", icon: <FileText size={10} /> },
  tax: { label: "Invoice", color: "bg-purple-100 text-purple-700", icon: <Receipt size={10} /> },
  credit_note: { label: "Credit Note", color: "bg-cyan-100 text-cyan-700", icon: <Undo2 size={10} /> },
  debit_note: { label: "Debit Note", color: "bg-rose-100 text-rose-700", icon: <MinusCircle size={10} /> },
  delivery_challan: { label: "Challan", color: "bg-emerald-100 text-emerald-700", icon: <Truck size={10} /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  partial: { label: "Partial", color: "bg-amber-100 text-amber-700" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500" },
};

export default function LeadInvoicesPage({ params }: { params: Promise<{ overview: string }> }) {
  const { overview: leadId } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("tax");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingWhatsAppId, setSendingWhatsAppId] = useState<string | null>(null);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const fetchInvoices = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await invoiceApi.listByLead(leadId, 1, 200);
      let filtered = res.invoices || [];
      if (filterType) filtered = filtered.filter((inv) => inv.type === filterType);
      if (filterStatus) filtered = filtered.filter((inv) => inv.status === filterStatus);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (inv) =>
            inv.invoiceNumber.toLowerCase().includes(q) ||
            (inv.billingAddress.name && inv.billingAddress.name.toLowerCase().includes(q))
        );
      }
      const totalFiltered = filtered.length;
      const start = (p - 1) * PAGE_SIZE;
      const paginated = filtered.slice(start, start + PAGE_SIZE);
      setInvoices(paginated);
      setTotal(totalFiltered);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [leadId, page, filterType, filterStatus, search]);

  useEffect(() => { fetchInvoices(1); setPage(1); }, [filterType, filterStatus]);

  const handleSearch = () => { setPage(1); fetchInvoices(1); };
  const handlePageChange = (p: number) => { setPage(p); fetchInvoices(p); };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await invoiceApi.remove(pendingDelete._id);
      toast.success("Invoice deleted");
      setPendingDelete(null);
      fetchInvoices();
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  const handleSendEmail = async (inv: Invoice) => {
    setSendingEmailId(inv._id);
    try {
      const res = await invoiceApi.sendEmail(inv._id);
      toast.success(res.message || "Invoice sent via email");
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleSendWhatsApp = async (inv: Invoice) => {
    setSendingWhatsAppId(inv._id);
    try {
      const res = await invoiceApi.sendWhatsApp(inv._id);
      toast.success(res.message || "Invoice sent via WhatsApp");
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to send via WhatsApp");
    } finally {
      setSendingWhatsAppId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const amountInWords = (n: number): string => {
    if (n === 0) return "Zero Rupees Only";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const convert = (num: number): string => {
      if (num < 20) return ones[num];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
      if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + convert(num % 100) : "");
      if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
      if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
      return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
    };
    return convert(Math.floor(n)) + " Rupees Only";
  };

  const getFullInvoiceHtml = (inv: Invoice) => {
    const isEstimate = inv.type === "proforma";
    const invDate = new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const invTime = new Date(inv.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const logoUrl = "https://res.cloudinary.com/dn34qdd2q/image/upload/v1781521763/ensis/f9pgo7qufbqmxwlho5ht.png";
    const billAddr = inv.billingAddress || {} as any;
    const shipAddr = inv.shippingAddress || {} as any;
    const items = inv.items || [];
    const taxableValue = inv.subtotal || 0;
    const tax = inv.tax || 0;
    const totalAmount = inv.totalAmount || 0;

    const bdr = "border:1px solid #d1d5db";
    const minRows = 7;
    const emptyCount = Math.max(0, minRows - items.length);

    let itemRows = items.map((item: any, idx: number) => {
      const qty = item.quantity || 0;
      const rate = item.unitPrice || 0;
      const amount = item.amount || qty * rate;
      const disc = item.discount || 0;
      const total = amount - disc;
      return `<tr>
        <td style="${bdr};text-align:center">${idx + 1}</td>
        <td style="${bdr};text-align:center"><span style="font-weight:600">${item.name || ""}</span>${item.description ? `<br/><span style="font-size:9px;color:#6b7280">${item.description}</span>` : ""}</td>
        <td style="${bdr};text-align:center">${item.hsn || "-"}</td>
        <td style="${bdr};text-align:center">${qty}</td>
        <td style="${bdr};text-align:center">${item.size || "-"}</td>
        <td style="${bdr};text-align:center">${item.area || "-"}</td>
        <td style="${bdr};text-align:center">${item.unit || "Nos"}</td>
        <td style="${bdr};text-align:center">${fmt(rate)}</td>
        <td style="${bdr};text-align:center">${disc > 0 ? disc + "%" : "0%"}</td>
        <td style="${bdr};text-align:center;font-weight:600">${fmt(total)}</td>
      </tr>`;
    }).join("");

    for (let i = 0; i < emptyCount; i++) {
      itemRows += `<tr>
        <td style="${bdr};text-align:center">${items.length + i + 1}</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
      </tr>`;
    }

    itemRows += `<tr style="background:#f8fafc">
      <td colspan="9" style="${bdr};padding:5px 8px;text-align:center;font-weight:bold;font-size:9px">TAXABLE VALUE :</td>
      <td style="${bdr};padding:5px 8px;text-align:center;font-weight:bold;font-size:10px">${fmt(taxableValue)}</td>
    </tr>`;

    let taxRows = items.map((item: any, idx: number) => {
      const qty = item.quantity || 0;
      const amount = item.amount || 0;
      const gstRate = item.gstRate || 18;
      const cgst = gstRate / 2;
      const sgst = gstRate / 2;
      const cgstAmt = (amount * cgst) / 100;
      const sgstAmt = (amount * sgst) / 100;
      const totalTax = cgstAmt + sgstAmt;
      return `<tr>
        <td style="${bdr};text-align:center">${idx + 1}</td>
        <td style="${bdr};text-align:center">${item.hsn || "-"}</td>
        <td style="${bdr};text-align:center">${item.sac || "-"}</td>
        <td style="${bdr};text-align:center">${fmt(amount)}</td>
        <td style="${bdr};text-align:center">${qty}</td>
        <td style="${bdr};text-align:center">${cgst}%</td>
        <td style="${bdr};text-align:center">${fmt(cgstAmt)}</td>
        <td style="${bdr};text-align:center">${sgst}%</td>
        <td style="${bdr};text-align:center">${fmt(sgstAmt)}</td>
        <td style="${bdr};text-align:center">-</td>
        <td style="${bdr};text-align:center">-</td>
        <td style="${bdr};text-align:center;font-weight:600">${fmt(totalTax)}</td>
      </tr>`;
    }).join("");

    for (let i = 0; i < emptyCount; i++) {
      taxRows += `<tr>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
        <td style="${bdr};text-align:center">&nbsp;</td>
      </tr>`;
    }

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${inv.invoiceNumber}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,Helvetica,sans-serif; font-size:10px; color:#1a1a1a; background:#fff; }
  @media print {
    @page { size:A4 portrait; margin:0; }
    body { background:#fff; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
    .container { padding:20px 16px; }
    * { print-color-adjust:exact; -webkit-print-color-adjust:exact; }
  }
  .container { max-width:800px; margin:0 auto; padding:20px 16px; }
  .header { text-align:center; }
  .header img { width:100%; max-width:800px; height:auto; display:block; margin:0 auto; }
  .title-bar { text-align:center; padding:6px 0; border-bottom:2px solid #1a3a5c; }
  .title-bar h2 { font-size:14px; letter-spacing:3px; text-transform:uppercase; color:#1a3a5c; font-weight:700; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr; border:1px solid #d1d5db; }
  .info-col { padding:8px 10px; }
  .info-col:not(:last-child) { border-right:1px solid #d1d5db; }
  .info-label { background:#1a3a5c; color:#fff; font-size:8px; font-weight:600; text-transform:uppercase; letter-spacing:1px; padding:3px 6px; margin:-8px -10px 6px -10px; }
  .info-col p { font-size:9px; line-height:1.5; }
  table { width:100%; border-collapse:collapse; border:1px solid #d1d5db; font-size:10px; }
  th { background:#1a3a5c; color:#fff; padding:6px; text-align:left; font-size:9px; font-weight:600; height:28px; border:1px solid #d1d5db; }
  td { padding:5px 6px; font-size:9px; border:1px solid #d1d5db; }
  .totals-table { width:100%; border-collapse:collapse; margin-top:8px; border:1px solid #d1d5db; }
  .totals-table td { padding:4px 6px; font-size:10px; border:1px solid #d1d5db; }
  .terms-table { width:100%; border-collapse:collapse; border:1px solid #d1d5db; margin-top:4px; }
  .terms-table td { padding:8px; font-size:9px; vertical-align:top; border:1px solid #d1d5db; }
  .terms-table h4 { font-size:10px; font-weight:600; margin-bottom:4px; }
  .terms-table ol { padding-left:14px; margin:0; line-height:1.7; }
  .bottom-table { width:100%; border-collapse:collapse; border:1px solid #d1d5db; margin-top:8px; }
  .bottom-table td { padding:8px; vertical-align:top; border:1px solid #d1d5db; font-size:9px; }
  .footer { background:#1a3a5c; color:#fff; text-align:center; padding:8px; font-size:9px; margin-top:8px; }
</style></head><body>
<div class="container">
  <div class="header">
    <img src="https://res.cloudinary.com/ddjhixcwh/image/upload/v1788345967/ensis/home/x4jc41aedar9iiaujo9j.webp" alt="Ensis Header" />
  </div>

  <div class="title-bar"><h2>${TYPE_CONFIG[inv.type]?.label || (isEstimate ? "Estimate" : "Tax Invoice")}</h2></div>

  <div class="info-grid">
    <div class="info-col">
      <div class="info-label">Client Name &amp; Address</div>
      <p><strong>${billAddr.name || "-"}</strong></p>
      ${billAddr.addressLine ? `<p>${billAddr.addressLine}</p>` : ""}
      ${billAddr.city ? `<p>${billAddr.city}, ${billAddr.state || ""} ${billAddr.postalCode || ""}</p>` : ""}
      ${billAddr.country ? `<p>${billAddr.country}</p>` : ""}
      <p>Contact Person : ${billAddr.name || "-"}</p>
      ${billAddr.phone ? `<p>Contact No. : ${billAddr.phone}</p>` : ""}
      ${billAddr.email ? `<p>Email : ${billAddr.email}</p>` : ""}
    </div>
    <div class="info-col">
      <div class="info-label">Shipment Details</div>
      <p><strong>${shipAddr.name || billAddr.name || "-"}</strong></p>
      ${shipAddr.addressLine ? `<p>${shipAddr.addressLine}</p>` : ""}
      ${shipAddr.city ? `<p>${shipAddr.city}, ${shipAddr.state || ""} ${shipAddr.postalCode || ""}</p>` : ""}
      <p>Contact Person : ${shipAddr.name || "-"}</p>
      ${shipAddr.phone ? `<p>Contact No. : ${shipAddr.phone}</p>` : ""}
      ${shipAddr.email ? `<p>Email : ${shipAddr.email}</p>` : ""}
      ${shipAddr.gstNumber ? `<p>GSTIN / UIN : ${shipAddr.gstNumber}</p>` : ""}
    </div>
    <div class="info-col">
      <div class="info-label" style="text-align:right">${isEstimate ? "Estimate" : "Invoice"} Details</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:9px;border:none">
        <tr><td style="border:none;padding:2px 0">${isEstimate ? "Estimate No." : "Invoice No."} :</td><td style="border:none;padding:2px 0;text-align:right"><strong>${inv.invoiceNumber}</strong></td></tr>
        <tr><td style="border:none;padding:2px 0">${isEstimate ? "Estimate Date" : "Invoice Date"} :</td><td style="border:none;padding:2px 0;text-align:right">${invDate}</td></tr>
        ${inv.dueDate ? `<tr><td style="border:none;padding:2px 0">Due Date :</td><td style="border:none;padding:2px 0;text-align:right">${new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td></tr>` : `<tr><td style="border:none;padding:2px 0">Supply Date :</td><td style="border:none;padding:2px 0;text-align:right">${invDate}</td></tr>`}
        <tr><td style="border:none;padding:2px 0">Created Date :</td><td style="border:none;padding:2px 0;text-align:right">${invDate}</td></tr>
        <tr><td style="border:none;padding:2px 0">Created Time :</td><td style="border:none;padding:2px 0;text-align:right">${invTime}</td></tr>
      </table>
    </div>
  </div>

  <div style="padding:8px 0">
    <table>
      <thead><tr>
        <th>S.NO.</th>
        <th>ITEM DESCRIPTION</th>
        <th style="text-align:center">HSN/SAC CODE</th>
        <th style="text-align:center">QTY.</th>
        <th style="text-align:center">SIZE</th>
        <th style="text-align:center">AREA</th>
        <th style="text-align:center">UNIT</th>
        <th style="text-align:right">RATE</th>
        <th style="text-align:right">DISCOUNT</th>
        <th style="text-align:right">TOTAL</th>
      </tr></thead>
      <tbody>${itemRows || '<tr><td colspan="10" style="text-align:center;padding:10px;color:#9ca3af">No items</td></tr>'}</tbody>
    </table>
  </div>

  <div style="padding:0 0 8px 0">
    <table>
      <thead><tr>
        <th>S.NO.</th>
        <th style="text-align:center">HSN CODE</th>
        <th style="text-align:center">SAC CODE</th>
        <th style="text-align:right">ITEM VALUE</th>
        <th style="text-align:center">QTY.</th>
        <th style="text-align:center">CGST(%)</th>
        <th style="text-align:right">AMOUNT</th>
        <th style="text-align:center">SGST(%)</th>
        <th style="text-align:right">AMOUNT</th>
        <th style="text-align:center">IGST(%)</th>
        <th style="text-align:right">AMOUNT</th>
        <th style="text-align:right">TOTAL TAX</th>
      </tr></thead>
      <tbody>${taxRows}</tbody>
    </table>
    <table class="totals-table">
      <tr>
        <td style="width:25%;font-weight:600">GST AMOUNT IN WORDS (INR)</td>
        <td style="width:45%;text-align:left">${amountInWords(tax)}</td>
        <td style="width:15%;font-weight:600">TOTAL GST AMT</td>
        <td style="width:15%;text-align:right;font-weight:600">${fmt(tax)}</td>
      </tr>
      <tr>
        <td style="font-weight:600">AMOUNT IN WORDS (INR)</td>
        <td style="text-align:left">${amountInWords(totalAmount)}</td>
        <td style="font-size:11px;font-weight:700">GRAND TOTAL</td>
        <td style="text-align:right;font-size:11px;font-weight:700">${fmt(totalAmount)}</td>
      </tr>
    </table>
  </div>

  <table class="terms-table">
    <tr>
      <td width="50%">
        <table style="width:100%;border-collapse:collapse;margin-bottom:6px"><tr><th style="border:1px solid #d1d5db;background:#f0f4f8;color:#1a1a1a;padding:4px 6px;text-align:center;font-weight:bold;font-size:9px">Terms and Conditions:</th></tr></table>
        <ol>
          <li>Payment must be made in favor of Design House India Pvt. Ltd. via Cheque / DD / RTGS / NEFT / UPI only.</li>
          <li>Delay in payment shall attract interest @24% per annum.</li>
          <li>Booking / services shall be confirmed only after receipt of payment.</li>
          <li>Cancellation or amendments shall be subject to company policy and management approval.</li>
          <li>All disputes are subject to Delhi Jurisdiction only.</li>
          <li>Full payment is due within the stipulated invoice period.</li>
        </ol>
      </td>
      <td width="50%">
        <table style="width:100%;border-collapse:collapse;margin-bottom:6px"><tr><th style="border:1px solid #d1d5db;background:#f0f4f8;color:#1a1a1a;padding:4px 6px;text-align:center;font-weight:bold;font-size:9px">Payment &amp; Term Conditions:</th></tr></table>
        <ol>
          <li>Advance Payment - 100%: Full payment is payable in advance on the same day of ${isEstimate ? "Estimate" : "Invoice"} generation.</li>
          <li>TDS under Section 194C shall be deducted on the basic value only (excluding GST). Applicable rate: 2% for Companies/Firms/other entities and 1% for Individual/HUF.</li>
          <li>Please share the applicable TDS Certificate (Form 16A) after deduction.</li>
        </ol>
      </td>
    </tr>
  </table>

  <table class="bottom-table">
    <tr>
      <td width="33%" style="vertical-align:top">
        <table style="width:100%;border-collapse:collapse;margin-bottom:6px"><tr><th style="border:1px solid #d1d5db;background:#f0f4f8;color:#1a1a1a;padding:4px 6px;text-align:center;font-weight:bold;font-size:9px">Design House India BANK DETAILS</th></tr></table>
        <p>Bank Name : --</p>
        <p>Account Name : --</p>
        <p>Account No. : --</p>
        <p>IFSC Code : --</p>
        <p>Branch Name : --</p>
      </td>
      <td width="34%" style="vertical-align:top">
        <table style="width:100%;border-collapse:collapse;margin-bottom:6px"><tr><th style="border:1px solid #d1d5db;background:#f0f4f8;color:#1a1a1a;padding:4px 6px;text-align:center;font-weight:bold;font-size:9px">RECEIVER'S ACKNOWLEDGEMENT</th></tr></table>
        <p>Received the above goods / services in good condition.</p>
        <div style="border-top:1px dashed #d1d5db;padding-top:6px;text-align:center;color:#9ca3af;font-size:9px">(Signature &amp; Company Seal)</div>
      </td>
      <td width="33%" style="vertical-align:top;text-align:center">
        <table style="width:100%;border-collapse:collapse;margin-bottom:6px"><tr><th style="border:1px solid #d1d5db;background:#f0f4f8;color:#1a1a1a;padding:4px 6px;text-align:center;font-weight:bold;font-size:9px">FOR Design House India</th></tr></table>
        <div style="border-top:1px dashed #d1d5db;padding-top:6px;text-align:center;color:#9ca3af;font-size:9px">Authorized Signatory.</div>
        <img src="https://res.cloudinary.com/ddjhixcwh/image/upload/v1788348856/ensis/home/dxms1ugculnifsmud6p7.webp" alt="Authorized Sign" style="width:140px;height:auto;margin:8px auto;display:block" />
      </td>
    </tr>
  </table>

  <div class="footer">This is a computer generated document and does not require a physical signature.</div>
</div>
</body></html>`;
  };

  const printInvoice = (inv: Invoice) => {
    const html = getFullInvoiceHtml(inv);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const downloadInvoice = (inv: Invoice) => {
    const html = getFullInvoiceHtml(inv);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800">Invoices</h1>
            <p className="text-[10px] text-slate-400">All invoices for this lead</p>
          </div>
          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{total}</span>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-3 py-1.5 px-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative w-[160px]">
            <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search invoices..."
              className="w-full pl-6 pr-2 py-1 rounded border border-slate-200 text-[11px] outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-2 py-1 rounded border border-slate-200 text-[11px] outline-none focus:ring-1 focus:ring-blue-500 bg-white">
            <option value="">All Types</option>
            <option value="proforma">Proforma</option>
            <option value="tax">Invoice</option>
            <option value="credit_note">Credit Note</option>
            <option value="debit_note">Debit Note</option>
            <option value="delivery_challan">Delivery Challan</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-2 py-1 rounded border border-slate-200 text-[11px] outline-none focus:ring-1 focus:ring-blue-500 bg-white">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={handleSearch} className="px-2 py-1 rounded bg-emerald-800 text-white text-[11px] font-medium hover:bg-emerald-900">Search</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-emerald-600" /></div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm text-center py-8">
          <p className="text-xs text-slate-500">No invoices found for this lead</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-0 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-3 py-1 font-semibold text-slate-500">Invoice No</th>
                  <th className="text-left px-3 py-1 font-semibold text-slate-500">Type</th>
                  <th className="text-left px-3 py-1 font-semibold text-slate-500 hidden lg:table-cell">Date</th>
                  <th className="text-left px-3 py-1 font-semibold text-slate-500 hidden lg:table-cell">Due Date</th>
                  <th className="text-right px-3 py-1 font-semibold text-slate-500">Amount</th>
                  <th className="text-left px-3 py-1 font-semibold text-slate-500">Status</th>
                  <th className="text-right px-3 py-1 font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const typeConf = TYPE_CONFIG[inv.type] || TYPE_CONFIG.tax;
                  const statusConf = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={inv._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-3 py-1.5">
                        <span className="font-medium text-slate-800">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${typeConf.color}`}>
                          {typeConf.icon} {typeConf.label}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-slate-600 hidden lg:table-cell">{new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="px-3 py-1.5 text-slate-600 hidden lg:table-cell">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-slate-800">{fmt(inv.totalAmount)}</td>
                      <td className="px-3 py-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusConf.color}`}>{statusConf.label}</span>
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/leads/${leadId}/invoice/${inv._id}`} className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600" title="View"><Eye size={12} /></Link>
                          <button onClick={() => printInvoice(inv)} className="p-1 rounded hover:bg-purple-50 text-slate-400 hover:text-purple-600" title="Print"><Printer size={12} /></button>
                          <button onClick={() => downloadInvoice(inv)} className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600" title="Download"><Download size={12} /></button>
                          <button
                            disabled={sendingEmailId === inv._id}
                            onClick={() => handleSendEmail(inv)}
                            className="p-1 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 disabled:opacity-50 inline-flex items-center justify-center min-w-[20px] min-h-[20px]"
                            title="Send Email"
                          >
                            {sendingEmailId === inv._id ? <Loader2 size={12} className="animate-spin text-amber-600" /> : <EmailIcon size={12} />}
                          </button>
                          <button
                            disabled={sendingWhatsAppId === inv._id}
                            onClick={() => handleSendWhatsApp(inv)}
                            className="p-1 rounded hover:bg-green-50 text-slate-400 hover:text-green-600 disabled:opacity-50 inline-flex items-center justify-center min-w-[20px] min-h-[20px]"
                            title="Send WhatsApp"
                          >
                            {sendingWhatsAppId === inv._id ? <Loader2 size={12} className="animate-spin text-green-600" /> : <WhatsAppIcon size={12} />}
                          </button>
                          <button onClick={() => setPendingDelete(inv)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600" title="Delete"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-400">Page {page} of {totalPages} ({total} invoices)</span>
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

      <ConfirmDialog isOpen={!!pendingDelete} onClose={() => setPendingDelete(null)} onConfirm={handleDelete} title="Delete Invoice" message={`Delete invoice ${pendingDelete?.invoiceNumber}?`} />

      {viewInvoice && <ViewInvoiceModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} onDownload={() => downloadInvoice(viewInvoice)} />}

      {showCreate && <CreateInvoiceModal leadId={leadId} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchInvoices(); }} />}
    </div>
  );
}

function ViewInvoiceModal({ invoice, onClose, onDownload }: { invoice: Invoice; onClose: () => void; onDownload: () => void }) {
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const leadName = typeof invoice.lead === "object" ? `${invoice.lead.firstName} ${invoice.lead.lastName}` : "Customer";
  const typeConf = TYPE_CONFIG[invoice.type] || TYPE_CONFIG.tax;
  const statusConf = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;

  const handlePrint = () => {
    const rows = invoice.items.map((item) =>
      `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:center">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt(item.unitPrice)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${item.gstRate}%</td>
        <td style="padding:10px 12px;border-bottom:1px solid #ece3d2;text-align:right">${fmt(item.amount)}</td>
      </tr>`
    ).join("");

    const logoUrl = "https://res.cloudinary.com/dn34qdd2q/image/upload/v1781521763/ensis/f9pgo7qufbqmxwlho5ht.png";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${invoice.invoiceNumber}</title>
<style>@media print{body{margin:0} @page{size:A4;margin:10mm}}</style></head>
<body style="margin:0;font-family:Jost,Arial,sans-serif;background:#FCFAF6;color:#1F3A2A">
<div style="max-width:760px;margin:20px auto;background:#fff;border:1px solid #EDE4D3;border-radius:20px;overflow:hidden">
<div style="background:#1F3A2A;padding:32px 40px;color:#fff;display:flex;align-items:center;gap:16px">
<img src="${logoUrl}" alt="ENSIS Logo" style="height:40px;width:auto;background:#fff;border-radius:8px;padding:4px" />
<div>
<div style="margin:0;font-size:22px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">ENSIS</div>
<p style="margin:6px 0 0;font-size:12px;color:#C7A55B;letter-spacing:.1em;text-transform:uppercase">${TYPE_CONFIG[invoice.type]?.label || "Invoice"} (${invoice.invoiceNumber})</p>
</div>
</div>
<div style="padding:32px 40px">
<div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap">
<div>
<p style="margin:0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Invoice No</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${invoice.invoiceNumber}</p>
<p style="margin:14px 0 0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Date</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
${invoice.dueDate ? `<p style="margin:14px 0 0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Due Date</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>` : ""}
</div>
<div style="text-align:right">
<p style="margin:0;font-size:11px;color:#8d6a3a;letter-spacing:.12em;text-transform:uppercase">Bill To</p>
<p style="margin:4px 0 0;font-size:14px;font-weight:600">${invoice.billingAddress.name}</p>
${invoice.billingAddress.email ? `<p style="margin:2px 0 0;font-size:12px">${invoice.billingAddress.email}</p>` : ""}
${invoice.billingAddress.phone ? `<p style="margin:2px 0 0;font-size:12px">${invoice.billingAddress.phone}</p>` : ""}
${invoice.billingAddress.addressLine ? `<p style="margin:2px 0 0;font-size:12px">${invoice.billingAddress.addressLine}</p>` : ""}
${invoice.billingAddress.city ? `<p style="margin:2px 0 0;font-size:12px">${invoice.billingAddress.city}, ${invoice.billingAddress.state || ""} ${invoice.billingAddress.postalCode || ""}</p>` : ""}
${invoice.billingAddress.gstNumber ? `<p style="margin:2px 0 0;font-size:12px">GSTIN: ${invoice.billingAddress.gstNumber}</p>` : ""}
</div>
</div>
<table style="width:100%;margin-top:28px;border-collapse:collapse;font-size:13px">
<thead><tr style="background:#F7F2E9">
<th style="padding:10px 12px;text-align:left">Item</th><th style="padding:10px 12px">Qty</th><th style="padding:10px 12px;text-align:right">Price</th><th style="padding:10px 12px;text-align:right">GST%</th><th style="padding:10px 12px;text-align:right">Total</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
<div style="margin-top:20px;text-align:right;font-size:13px">
<p style="margin:4px 0">Subtotal: <strong>${fmt(invoice.subtotal)}</strong></p>
${invoice.discount ? `<p style="margin:4px 0;color:#2F7D5A">Discount: - ${fmt(invoice.discount)}</p>` : ""}
${invoice.shipping ? `<p style="margin:4px 0">Shipping: ${fmt(invoice.shipping)}</p>` : ""}
<p style="margin:4px 0">GST: <strong>${fmt(invoice.tax)}</strong></p>
<p style="margin:10px 0 0;font-size:16px;border-top:1px solid #EDE4D3;padding-top:10px">Grand Total (incl. GST): <strong>${fmt(invoice.totalAmount)}</strong></p>
</div>
${invoice.notes ? `<p style="margin-top:20px;font-size:12px;color:#6c7068"><strong>Notes:</strong> ${invoice.notes}</p>` : ""}
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">{invoice.invoiceNumber}</h2>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${typeConf.color}`}>{typeConf.icon} {typeConf.label}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusConf.color}`}>{statusConf.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-medium hover:bg-purple-700">
              <Printer size={12} /> Print
            </button>
            <button onClick={onDownload} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-800 text-white text-[10px] font-medium hover:bg-emerald-900">
              <Download size={12} /> Download
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <p className="text-slate-400 uppercase text-[9px] font-semibold tracking-wider">Bill To</p>
              <p className="font-bold text-slate-800 mt-1">{invoice.billingAddress.name}</p>
              {invoice.billingAddress.email && <p className="text-slate-600">{invoice.billingAddress.email}</p>}
              {invoice.billingAddress.phone && <p className="text-slate-600">{invoice.billingAddress.phone}</p>}
              {invoice.billingAddress.addressLine && <p className="text-slate-600">{invoice.billingAddress.addressLine}</p>}
              {invoice.billingAddress.city && <p className="text-slate-600">{invoice.billingAddress.city}, {invoice.billingAddress.state} {invoice.billingAddress.postalCode}</p>}
              {invoice.billingAddress.gstNumber && <p className="text-slate-600">GSTIN: {invoice.billingAddress.gstNumber}</p>}
            </div>
            <div className="text-right">
              <p className="text-slate-400 uppercase text-[9px] font-semibold tracking-wider">Details</p>
              <p className="mt-1"><span className="text-slate-500">Date:</span> <span className="font-medium">{new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></p>
              {invoice.dueDate && <p><span className="text-slate-500">Due:</span> <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></p>}
              <p><span className="text-slate-500">Customer:</span> <span className="font-medium">{leadName}</span></p>
            </div>
          </div>

          <table className="w-full text-[11px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300">
                <th className="text-left px-3 py-1 font-semibold text-slate-500 border border-slate-300">Item</th>
                <th className="text-center px-3 py-1 font-semibold text-slate-500 border border-slate-300">Qty</th>
                <th className="text-right px-3 py-1 font-semibold text-slate-500 border border-slate-300">Price</th>
                <th className="text-right px-3 py-1 font-semibold text-slate-500 border border-slate-300">GST%</th>
                <th className="text-right px-3 py-1 font-semibold text-slate-500 border border-slate-300">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-300 hover:bg-slate-50/50">
                  <td className="px-3 py-1.5 font-medium text-slate-800 border border-slate-300">{item.name}</td>
                  <td className="px-3 py-1.5 text-center text-slate-600 border border-slate-300">{item.quantity}</td>
                  <td className="px-3 py-1.5 text-right text-slate-600 border border-slate-300">{fmt(item.unitPrice)}</td>
                  <td className="px-3 py-1.5 text-right text-slate-600 border border-slate-300">{item.gstRate}%</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-800 border border-slate-300">{fmt(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-[11px] space-y-1 bg-slate-50 rounded-lg p-3">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">{fmt(invoice.subtotal)}</span></div>
            {invoice.discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-medium text-emerald-600">- {fmt(invoice.discount)}</span></div>}
            {invoice.shipping > 0 && <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="font-medium">{fmt(invoice.shipping)}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">GST</span><span className="font-medium">{fmt(invoice.tax)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-800 text-sm">
              <span>Grand Total</span><span>{fmt(invoice.totalAmount)}</span>
            </div>
            {invoice.paymentReceived > 0 && (
              <div className="flex justify-between text-emerald-600"><span>Payment Received</span><span className="font-medium">{fmt(invoice.paymentReceived)}</span></div>
            )}
          </div>

          {invoice.notes && (
            <div className="text-[11px]">
              <p className="text-slate-400 uppercase text-[9px] font-semibold tracking-wider mb-1">Notes</p>
              <p className="text-slate-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateInvoiceModal({ onClose, onCreated, leadId }: { onClose: () => void; onCreated: () => void; leadId: string }) {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedLead, setSelectedLead] = useState(leadId);
  const [type, setType] = useState<string>("tax");
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

  useEffect(() => {
    Promise.all([
      leadApi.list({ limit: 200 }).catch(() => ({ leads: [], total: 0 })),
      productApi.list().catch(() => ({ products: [], total: 0, page: 1, limit: 100 })),
    ]).then(([leadRes, prodRes]) => {
      setLeads(leadRes.leads || []);
      setProducts((prodRes as any).products || []);
    });
  }, []);

  useEffect(() => {
    if (selectedLead) {
      const lead = leads.find((l) => l._id === selectedLead);
      if (lead) {
        setBillingName(`${lead.firstName} ${lead.lastName}`);
        setBillingEmail(lead.email || "");
        setBillingPhone(lead.phone || "");
        setBillingAddress(lead.addressLine || "");
        setBillingCity(lead.city || "");
        setBillingState(lead.state || "");
        setBillingCountry(lead.country || "India");
      }
    }
  }, [selectedLead, leads]);

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
      const prod = products.find((p) => p._id === value);
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
    if (!selectedLead) { toast.error("Select a customer"); return; }
    if (!billingName) { toast.error("Billing name is required"); return; }
    if (items.some((i) => !i.name || i.quantity < 1)) { toast.error("Fill all item details"); return; }

    setLoading(true);
    try {
      await invoiceApi.create({
        lead: selectedLead,
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
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4" onClick={onClose}>
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Create Invoice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Type & Customer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Invoice Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={fieldClass}>
                <option value="proforma">Proforma Invoice</option>
                <option value="tax">Tax Invoice</option>
                <option value="credit_note">Credit Note</option>
                <option value="debit_note">Debit Note</option>
                <option value="delivery_challan">Delivery Challan</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Customer *</label>
              <select value={selectedLead} onChange={(e) => setSelectedLead(e.target.value)} className={fieldClass}>
                <option value="">Select customer</option>
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>{l.firstName} {l.lastName} — {l.companyName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Billing Address</p>
            <div className="grid grid-cols-2 gap-2">
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Items</p>
              <button onClick={addItem} className="text-[10px] font-semibold text-blue-600 hover:underline">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                  <select value={item.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)} className={`${fieldClass} flex-1 min-w-[120px]`}>
                    <option value="">Custom Item</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.title} — {fmt(p.price)}</option>
                    ))}
                  </select>
                  <input placeholder="Name" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} className={`${fieldClass} flex-1 min-w-[100px]`} />
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)} className={`${fieldClass} w-16`} min={1} />
                  <input type="number" placeholder="Price" value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} className={`${fieldClass} w-20`} min={0} />
                  <input type="number" placeholder="GST%" value={item.gstRate} onChange={(e) => updateItem(idx, "gstRate", parseFloat(e.target.value) || 0)} className={`${fieldClass} w-16`} min={0} />
                  <span className="text-[10px] font-medium text-slate-600 w-20 text-right">{fmt(item.quantity * item.unitPrice)}</span>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-xs">&times;</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <label className={labelClass}>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${fieldClass} h-16 resize-none`} placeholder="Additional notes..." />
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-[11px]">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Discount</span>
                <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-20 text-right rounded border border-slate-200 px-1 py-0.5 text-[11px] outline-none" min={0} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Shipping</span>
                <input type="number" value={shipping} onChange={(e) => setShipping(parseFloat(e.target.value) || 0)} className="w-20 text-right rounded border border-slate-200 px-1 py-0.5 text-[11px] outline-none" min={0} />
              </div>
              <div className="flex justify-between"><span className="text-slate-500">GST</span><span className="font-medium">{fmt(tax)}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-800">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
