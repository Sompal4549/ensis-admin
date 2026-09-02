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
import CreateTaxInvoiceModal from "@/components/common/CreateTaxInvoiceModal";
import { CreateDeliveryChallanModal } from "@/components/common/CreateTaxInvoiceModal";

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

  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingWhatsAppId, setSendingWhatsAppId] = useState<string | null>(null);
  const [creatingInvoiceId, setCreatingInvoiceId] = useState<string | null>(null);
  const [showCreateTaxInvoice, setShowCreateTaxInvoice] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Invoice | null>(null);
  const [showCreateChallan, setShowCreateChallan] = useState(false);
  const [selectedEstimateForChallan, setSelectedEstimateForChallan] = useState<Invoice | null>(null);

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
    setSendingEmailId(inv._id);
    try {
      const res = await invoiceApi.sendEmail(inv._id);
      toast.success(res.message || "Sent via email");
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
      toast.success(res.message || "Sent via WhatsApp");
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to send via WhatsApp");
    } finally {
      setSendingWhatsAppId(null);
    }
  };

  const totalEstimates = invoices.length;
  const totalValue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const activeEstimates = invoices.filter((inv) => inv.status !== "cancelled").length;
  const cancelledEstimates = invoices.filter((inv) => inv.status === "cancelled").length;

  const handleCreateInvoice = async (est: Invoice) => {
    setSelectedEstimate(est);
    setShowCreateTaxInvoice(true);
  };

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

  const printInvoice = (inv: Invoice) => {
    const estDate = new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const estTime = new Date(inv.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
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

    const html = `<!DOCTYPE html>
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

  <div class="title-bar"><h2>Estimate</h2></div>

  <div class="info-grid">
    <div class="info-col" style="text-align:center">
      <div class="info-label">Client Name &amp; Address</div>
      <p><strong>${billAddr.name || "-"}</strong></p>
      ${billAddr.addressLine ? `<p>${billAddr.addressLine}</p>` : ""}
      ${billAddr.city ? `<p>${billAddr.city}, ${billAddr.state || ""} ${billAddr.postalCode || ""}</p>` : ""}
      ${billAddr.country ? `<p>${billAddr.country}</p>` : ""}
      <p>Contact Person : ${billAddr.name || "-"}</p>
      ${billAddr.phone ? `<p>Contact No. : ${billAddr.phone}</p>` : ""}
      ${billAddr.email ? `<p>Email : ${billAddr.email}</p>` : ""}
    </div>
    <div class="info-col" style="text-align:center">
      <div class="info-label">Shipment Details</div>
      <p><strong>${shipAddr.name || billAddr.name || "-"}</strong></p>
      ${shipAddr.addressLine ? `<p>${shipAddr.addressLine}</p>` : ""}
      ${shipAddr.city ? `<p>${shipAddr.city}, ${shipAddr.state || ""} ${shipAddr.postalCode || ""}</p>` : ""}
      <p>Contact Person : ${shipAddr.name || "-"}</p>
      ${shipAddr.phone ? `<p>Contact No. : ${shipAddr.phone}</p>` : ""}
      ${shipAddr.email ? `<p>Email : ${shipAddr.email}</p>` : ""}
      ${shipAddr.gstNumber ? `<p>GSTIN / UIN : ${shipAddr.gstNumber}</p>` : ""}
    </div>
    <div class="info-col" style="text-align:center">
      <div class="info-label">Estimate Details</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:9px;border:none">
        <tr><td style="border:none;padding:2px 0">Estimate No. :</td><td style="border:none;padding:2px 0;text-align:center"><strong>${inv.invoiceNumber}</strong></td></tr>
        <tr><td style="border:none;padding:2px 0">Estimate Date :</td><td style="border:none;padding:2px 0;text-align:center">${estDate}</td></tr>
        <tr><td style="border:none;padding:2px 0">Supply Date :</td><td style="border:none;padding:2px 0;text-align:center">${estDate}</td></tr>
        <tr><td style="border:none;padding:2px 0">Created Date :</td><td style="border:none;padding:2px 0;text-align:center">${estDate}</td></tr>
        <tr><td style="border:none;padding:2px 0">Created Time :</td><td style="border:none;padding:2px 0;text-align:center">${estTime}</td></tr>
      </table>
    </div>
  </div>

  <div style="padding:8px 0">
    <table>
      <thead><tr>
        <th style="text-align:center">S.NO.</th>
        <th style="text-align:center">ITEM DESCRIPTION</th>
        <th style="text-align:center">HSN/SAC CODE</th>
        <th style="text-align:center">QTY.</th>
        <th style="text-align:center">SIZE</th>
        <th style="text-align:center">AREA</th>
        <th style="text-align:center">UNIT</th>
        <th style="text-align:center">RATE</th>
        <th style="text-align:center">DISCOUNT</th>
        <th style="text-align:center">TOTAL</th>
      </tr></thead>
      <tbody>${itemRows || '<tr><td colspan="10" style="text-align:center;padding:10px;color:#9ca3af">No items</td></tr>'}</tbody>
    </table>
  </div>

  <div style="padding:0 0 8px 0">
    <table>
      <thead><tr>
        <th style="text-align:center">S.NO.</th>
        <th style="text-align:center">HSN CODE</th>
        <th style="text-align:center">SAC CODE</th>
        <th style="text-align:center">ITEM VALUE</th>
        <th style="text-align:center">QTY.</th>
        <th style="text-align:center">CGST(%)</th>
        <th style="text-align:center">AMOUNT</th>
        <th style="text-align:center">SGST(%)</th>
        <th style="text-align:center">AMOUNT</th>
        <th style="text-align:center">IGST(%)</th>
        <th style="text-align:center">AMOUNT</th>
        <th style="text-align:center">TOTAL TAX</th>
      </tr></thead>
      <tbody>${taxRows}</tbody>
    </table>
    <table class="totals-table">
      <tr>
        <td style="width:25%;font-weight:600;text-align:center">GST AMOUNT IN WORDS (INR)</td>
        <td style="width:45%;text-align:center">${amountInWords(tax)}</td>
        <td style="width:15%;font-weight:600;text-align:center">TOTAL GST AMT</td>
        <td style="width:15%;text-align:center;font-weight:600">${fmt(tax)}</td>
      </tr>
      <tr>
        <td style="font-weight:600;text-align:center">AMOUNT IN WORDS (INR)</td>
        <td style="text-align:center">${amountInWords(totalAmount)}</td>
        <td style="font-size:11px;font-weight:700;text-align:center">GRAND TOTAL</td>
        <td style="text-align:center;font-size:11px;font-weight:700">${fmt(totalAmount)}</td>
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
          <li>Advance Payment - 100%: Full payment is payable in advance on the same day of Estimate generation.</li>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">{totalEstimates}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total Estimates</p>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Created</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">{fmt(totalValue)}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Total Value</p>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Amount</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
              <CheckCircle size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">{activeEstimates}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Active Estimates</p>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Valid</span>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-500">
              <XCircle size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">{cancelledEstimates}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Cancelled</p>
            </div>
          </div>
          <span className="text-[9px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Invalid</span>
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
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, {new Date(inv.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 h-[70px] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Truck size={12} className="text-slate-400" />
                              <span className="text-[10px] font-medium text-slate-600">0 Challans</span>
                            </div>
                            <span className="text-[10px] text-slate-400">0/1 qty</span>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-1">1 quantity remaining</p>
                        </div>
                        <button
                          onClick={() => {
                            router.push(`/leads/${leadId}/challans/create?estimate=${inv._id}`);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-medium hover:bg-emerald-700"
                        >
                          <Plus size={10} /> Create
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        disabled={creatingInvoiceId === inv._id}
                        onClick={() => handleCreateInvoice(inv)}
                        className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-semibold hover:bg-blue-100 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {creatingInvoiceId === inv._id ? <Loader2 size={12} className="animate-spin" /> : null}
                        Create Invoice
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] font-medium text-slate-700">{updatedBy || "-"}</p>
                      <p className="text-[10px] text-slate-400">{new Date(inv.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, {new Date(inv.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${statusConf.color}`}>{statusConf.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/leads/${leadId}/estimate/${inv._id}`} className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="View Estimate"><Eye size={14} /></Link>
                        <Link href={`/leads/${leadId}/estimate/${inv._id}/edit`} className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100" title="Edit Estimate"><Pencil size={14} /></Link>
                        <button
                          disabled={sendingWhatsAppId === inv._id}
                          onClick={() => handleSendWhatsApp(inv)}
                          className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 flex items-center justify-center min-w-[28px] min-h-[28px]"
                          title="WhatsApp"
                        >
                          {sendingWhatsAppId === inv._id ? <Loader2 size={14} className="animate-spin text-green-600" /> : <WhatsAppIcon size={14} />}
                        </button>
                        <button
                          disabled={sendingEmailId === inv._id}
                          onClick={() => handleSendEmail(inv)}
                          className="p-1.5 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-50 flex items-center justify-center min-w-[28px] min-h-[28px]"
                          title="Email"
                        >
                          {sendingEmailId === inv._id ? <Loader2 size={14} className="animate-spin text-purple-600" /> : <EmailIcon size={14} />}
                        </button>
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

      {showCreateTaxInvoice && selectedEstimate && (
        <CreateTaxInvoiceModal
          isOpen={showCreateTaxInvoice}
          onClose={() => {
            setShowCreateTaxInvoice(false);
            setSelectedEstimate(null);
          }}
          onCreated={() => {
            setShowCreateTaxInvoice(false);
            setSelectedEstimate(null);
            router.push(`/leads/${leadId}/invoice`);
          }}
          estimate={selectedEstimate}
          leadId={leadId}
        />
      )}

      {showCreateChallan && selectedEstimateForChallan && (
        <CreateDeliveryChallanModal
          isOpen={showCreateChallan}
          onClose={() => {
            setShowCreateChallan(false);
            setSelectedEstimateForChallan(null);
          }}
          onCreated={() => {
            setShowCreateChallan(false);
            setSelectedEstimateForChallan(null);
            fetchInvoices();
            toast.success("Delivery Challan created");
          }}
          estimate={selectedEstimateForChallan}
          leadId={leadId}
        />
      )}
    </div>
  );
}
