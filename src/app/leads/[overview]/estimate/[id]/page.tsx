"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { ArrowLeft, FileText, Landmark, Loader2, Pencil, PenLine, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { invoiceApi, Invoice, Lead, leadApi } from "@/lib/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import Image from "next/image";

const COMPANY = {
  name: "Design House India Pvt. Ltd.",
  brandName: "Design House India",
  shortName: "Design House India",
  phone1: "+91 9654900525",
  phone2: "",
  email: "info@ensis.in",
  website: "www.ensis.in",
  gstin: "",
  cin: "",
  address: "12/29, Site-II, Loni Road, Industrial Area, Mohan Nagar - 201007, Uttar Pradesh, India",
  bank: {
    name: "",
    accountName: "",
    accountNo: "",
    ifsc: "",
    branch: "",
  },
};

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

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

export default function EstimateDetailPage({ params }: { params: Promise<{ overview: string; id: string }> }) {
  const { overview: leadId, id: invoiceId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printCopies, setPrintCopies] = useState({ original: true, duplicate: true, triplicate: true });

  const fetchData = useCallback(async () => {
    try {
      const [inv, ld] = await Promise.all([
        invoiceApi.get(invoiceId),
        leadApi.get(leadId),
      ]);
      setInvoice(inv);
      setLead(ld);
    } catch {
      toast.error("Failed to load estimate details");
    } finally {
      setLoading(false);
    }
  }, [invoiceId, leadId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = () => {
    const inv = invoice!;
    const estDate = new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const estTime = new Date(inv.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const logoUrl = "https://res.cloudinary.com/dn34qdd2q/image/upload/v1781521763/ensis/f9pgo7qufbqmxwlho5ht.png";

    const itemRows = items.map((item: any, idx: number) => {
      const qty = item.quantity || 0;
      const rate = item.unitPrice || 0;
      const amount = item.amount || qty * rate;
      const disc = item.discount || 0;
      const total = amount - disc;
      const bdr = "border:1px solid #d1d5db";
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
    const emptyRows = Array.from({ length: Math.max(0, 7 - items.length) }).map((_, i) => {
      const bdr = "border:1px solid #d1d5db";
      return `<tr>
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
    }).join("");

    const taxRows = items.map((item: any, idx: number) => {
      const qty = item.quantity || 0;
      const amount = item.amount || 0;
      const gstRate = item.gstRate || 18;
      const cgst = gstRate / 2;
      const sgst = gstRate / 2;
      const cgstAmt = (amount * cgst) / 100;
      const sgstAmt = (amount * sgst) / 100;
      const totalTax = cgstAmt + sgstAmt;
      const bdr = "border:1px solid #d1d5db";
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

    const billAddr = inv.billingAddress || {} as any;
    const shipAddr = inv.shippingAddress || {} as any;

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
  .title-bar h2 { font-size:14px; letter-spacing:3px; text-transform:uppercase; color:#1a3a5c; }
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
  .totals-table .grand td { border-top:2px solid #1a3a5c; font-size:12px; font-weight:600; }
  .terms-table { width:100%; border-collapse:collapse; border:1px solid #d1d5db; margin-top:8px; }
  .terms-table td { padding:8px; font-size:9px; vertical-align:top; border:1px solid #d1d5db; }
  .terms-table h4 { font-size:10px; font-weight:600; margin-bottom:4px; }
  .terms-table ol { padding-left:14px; margin:0; line-height:1.7; }
  .bottom-table { width:100%; border-collapse:collapse; border:1px solid #d1d5db; margin-top:8px; }
  .bottom-table td { padding:8px; vertical-align:top; border:1px solid #d1d5db; }
  .bottom-box { font-size:9px; }
  .bottom-box h4 { font-weight:700; margin-bottom:4px; font-size:10px; }
  .footer { background:#1a3a5c; color:#fff; text-align:center; padding:8px; font-size:9px; }
</style></head><body>
<div class="container">
  <div class="header">
    <img src="https://res.cloudinary.com/ddjhixcwh/image/upload/v1788345967/ensis/home/x4jc41aedar9iiaujo9j.webp" alt="Ensis Header" />
  </div>

  <div class="title-bar"><h2>Estimate</h2></div>

  <div class="info-grid">
    <div class="info-col">
      <div class="info-label">Client Name & Address</div>
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
      <p><strong>${lead ? `${lead.firstName} ${lead.lastName}` : "-"}</strong></p>
      ${shipAddr.addressLine ? `<p>${shipAddr.addressLine}</p>` : ""}
      ${shipAddr.city ? `<p>${shipAddr.city}, ${shipAddr.state || ""} ${shipAddr.postalCode || ""}</p>` : ""}
      <p>Contact Person : ${shipAddr.name || "-"}</p>
      ${shipAddr.phone ? `<p>Contact No. : ${shipAddr.phone}</p>` : ""}
      ${shipAddr.email ? `<p>Email : ${shipAddr.email}</p>` : ""}
      ${shipAddr.gstNumber ? `<p>GSTIN / UIN : ${shipAddr.gstNumber}</p>` : ""}
    </div>
    <div class="info-col">
      <div class="info-label">Estimate Details</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:9px">
        <tr><td>Estimate No. :</td><td style="text-align:left"><strong>${inv.invoiceNumber}</strong></td></tr>
        <tr><td>Estimate Date :</td><td style="text-align:left">${estDate}</td></tr>
        <tr><td>Supply Date :</td><td style="text-align:left">${estDate}</td></tr>
        <tr><td>Created Date :</td><td style="text-align:left">${estDate}</td></tr>
        <tr><td>Created Time :</td><td style="text-align:left">${estTime}</td></tr>
        <tr><td>Created By :</td><td style="text-align:left">${createdByName}</td></tr>
      </table>
    </div>
  </div>  <div style="padding:8px 0">
    <table style="width:100%;border-collapse:collapse">
      <thead><tr>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">S.NO.</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">ITEM DESCRIPTION</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">HSN/SAC CODE</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">QTY.</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">SIZE</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">AREA</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">UNIT</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">RATE</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">DISCOUNT</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">TOTAL</th>
      </tr></thead>
      <tbody>${itemRows}${emptyRows}</tbody>
    </table>
  </div>

  <div style="padding:0 0 8px 0">
    <div style="text-align:right;font-size:10px;margin-bottom:4px"><span style="font-weight:600">TAXABLE VALUE : ${fmt(taxableValue)}</span></div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">S.NO.</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">HSN CODE</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">SAC CODE</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">ITEM VALUE</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">QTY.</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">CGST(%)</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">AMOUNT</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">SGST(%)</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">AMOUNT</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">IGST(%)</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">AMOUNT</th>
        <th style="border:1px solid #d1d5db;padding:6px;text-align:center;font-size:9px;font-weight:600">TOTAL TAX</th>
      </tr></thead>
      <tbody>${taxRows}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-top:8px">
      <tr>
        <td style="border:1px solid #d1d5db;padding:4px 6px;text-align:left">GST AMOUNT IN WORDS (INR)</td>
        <td style="border:1px solid #d1d5db;padding:4px 6px;text-align:left">${amountInWords(tax)}</td>
        <td style="border:1px solid #d1d5db;padding:4px 6px;text-align:center;font-weight:600">TOTAL GST AMT</td>
        <td style="border:1px solid #d1d5db;padding:4px 6px;text-align:center;font-weight:600">${fmt(tax)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #d1d5db;padding:4px 6px;text-align:left">AMOUNT IN WORDS (INR)</td>
        <td style="border:1px solid #d1d5db;padding:4px 6px;text-align:left">${amountInWords(totalAmount)}</td>
        <td style="border:2px solid #1a3a5c;padding:4px 6px;text-align:center;font-size:12px;font-weight:600">GRAND TOTAL</td>
        <td style="border:2px solid #1a3a5c;padding:4px 6px;text-align:center;font-size:12px;font-weight:600">${fmt(totalAmount)}</td>
      </tr>
    </table>
  </div>

  <table class="terms-table">
    <tr>
      <th width="50%" style="border:1px solid #d1d5db;background:#f0f4f8;color:#1a1a1a;padding:4px 6px;text-align:center;font-weight:bold;font-size:9px">Terms and Conditions:</th>
      <th width="50%" style="border:1px solid #d1d5db;background:#f0f4f8;color:#1a1a1a;padding:4px 6px;text-align:center;font-weight:bold;font-size:9px">Payment &amp; Term Conditions:</th>
    </tr>
    <tr>
      <td width="50%">
        <ol>
          <li>Payment must be made in favor of ${COMPANY.name} via Cheque / DD / RTGS / NEFT / UPI only.</li>
          <li>Delay in payment shall attract interest @24% per annum.</li>
          <li>Booking / services shall be confirmed only after receipt of payment.</li>
          <li>Cancellation or amendments shall be subject to company policy and management approval.</li>
          <li>All disputes are subject to Delhi Jurisdiction only.</li>
          <li>Full payment is due within the stipulated invoice period.</li>
        </ol>
      </td>
      <td width="50%">
        <ol>
          <li>Advance Payment - 100%: Full payment is payable in advance on the same day of Estimate generation.</li>
          <li>TDS under Section 194C shall be deducted on the basic value only (excluding GST). Applicable rate: 2% for Companies/Firms/other entities and 1% for Individual/HUF.</li>
          <li>Please share the applicable TDS Certificate (Form 16A) after deduction.</li>
        </ol>
      </td>
    </tr>
  </table>

  <table class="bottom-table" style="margin-top:8px">
    <tr>
      <th width="33%" style="border:1px solid #d1d5db;background:#f0f4f8;color:#1a1a1a;padding:4px 6px;text-align:center;font-weight:bold;font-size:9px">Design House India BANK DETAILS</th>
      <th width="34%" style="border:1px solid #d1d5db;background:#f0f4f8;color:#1a1a1a;padding:4px 6px;text-align:center;font-weight:bold;font-size:9px">RECEIVER'S ACKNOWLEDGEMENT</th>
      <th width="33%" style="border:1px solid #d1d5db;background:#f0f4f8;color:#1a1a1a;padding:4px 6px;text-align:center;font-weight:bold;font-size:9px">FOR Design House India</th>
    </tr>
    <tr>
      <td width="33%" style="padding-right:4px;vertical-align:top">
        <div class="bottom-box">
          <p>Bank Name : ${COMPANY.bank.name || "--"}</p>
          <p>Account Name : ${COMPANY.bank.accountName || "--"}</p>
          <p>Account No. : ${COMPANY.bank.accountNo || "--"}</p>
          <p>IFSC Code : ${COMPANY.bank.ifsc || "--"}</p>
          <p>Branch Name : ${COMPANY.bank.branch || "--"}</p>
        </div>
      </td>
      <td width="34%" style="padding:0 4px;vertical-align:top">
        <div class="bottom-box" style="min-height:120px;display:flex;flex-direction:column">
          <p>Received the above goods / services in good condition.</p>
          <div style="margin-top:auto;border-top:1px dashed #d1d5db;padding-top:6px;text-align:center;color:#9ca3af;font-size:9px">(Signature &amp; Company Seal)</div>
        </div>
      </td>
      <td width="33%" style="padding-left:4px;vertical-align:top;text-align:center">
        <div class="bottom-box" style="min-height:120px;display:flex;flex-direction:column">
          <div style="margin-top:auto">
            <img src="https://res.cloudinary.com/ddjhixcwh/image/upload/v1788348856/ensis/home/dxms1ugculnifsmud6p7.webp" alt="Authorized Sign" style="width:75px;height:75px;margin:8px auto;display:block;object-fit:contain" />
            <div style="border-top:1px dashed #d1d5db;padding-top:6px;text-align:center;color:#9ca3af;font-size:9px">Authorized Signatory.</div>
          </div>
        </div>
      </td>
    </tr>
  </table>

  <div class="footer" style="margin-top:8px">This is a computer generated document and does not require a physical signature.</div>
</div>
</body></html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={24} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-slate-500">Estimate not found</p>
      </div>
    );
  }

  const items = invoice.items || [];
  const subtotal = invoice.subtotal || 0;
  const discount = invoice.discount || 0;
  const tax = invoice.tax || 0;
  const totalAmount = invoice.totalAmount || 0;
  const taxableValue = subtotal;

  const createdByName = user?.name || "Admin";

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Top Actions - hidden on print */}
      <div className="flex items-center justify-between mb-4 no-print px-4 pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Estimate | Sales Management Section
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/leads/${leadId}/estimate`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            ESTIMATE LIST
          </Link>
          <Link
            href={`/leads/${leadId}/estimate/${invoiceId}/edit`}
            className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 flex items-center gap-1"
          >
            <Pencil size={12} /> EDIT
          </Link>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"
          >
            <Printer size={12} /> PRINT
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-[900px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none print:max-w-full px-4 py-5">
        {/* Header */}
        <div className="text-center">
          <Image src="https://res.cloudinary.com/ddjhixcwh/image/upload/v1788345967/ensis/home/x4jc41aedar9iiaujo9j.webp" alt="Ensis Header" width={800} height={200} className="w-full h-auto" unoptimized />
        </div>

        {/* Title */}
        <div className="text-center py-0">
          <h2 className="text-base font-bold tracking-widest text-[#1a3a5c] uppercase">Estimate</h2>
        </div>

        {/* Client / Shipment / Invoice Details */}
        <div className="grid grid-cols-3 border border-slate-300 text-[9px]">
          {/* Client */}
          <div className="p-2.5 border-r border-slate-300">
            <p className="font-bold text-[10px] uppercase tracking-wider bg-[#1a3a5c] text-white px-2 py-1.5 -mx-2.5 -mt-2.5 mb-1.5">Client Name & Address</p>
            <p className="font-semibold">{invoice.billingAddress?.name || "-"}</p>
            {invoice.billingAddress?.addressLine && <p>{invoice.billingAddress.addressLine}</p>}
            {invoice.billingAddress?.city && <p>{invoice.billingAddress.city}, {invoice.billingAddress.state || ""} {invoice.billingAddress.postalCode || ""}</p>}
            {invoice.billingAddress?.country && <p>{invoice.billingAddress.country}</p>}
            <table className="w-full text-[9px]" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr><td className="font-semibold whitespace-nowrap">Contact Person</td><td className="text-left">: {invoice.billingAddress?.name || "-"}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">Contact No.</td><td className="text-left">: {invoice.billingAddress?.phone || "--"}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">Email</td><td className="text-left">: {invoice.billingAddress?.email || "--"}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">GSTIN / UIN</td><td className="text-left">: {invoice.billingAddress?.gstNumber || "--"}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Shipment */}
          <div className="p-2.5 border-r border-slate-300">
            <p className="font-bold text-[10px] uppercase tracking-wider bg-[#1a3a5c] text-white px-2 py-1.5 -mx-2.5 -mt-2.5 mb-1.5">Shipment Details</p>
            <p className="font-semibold">{invoice.shippingAddress?.name || lead ? `${lead?.firstName} ${lead?.lastName}` : "-"}</p>
            {invoice.shippingAddress?.addressLine && <p>{invoice.shippingAddress.addressLine}</p>}
            {invoice.shippingAddress?.city && <p>{invoice.shippingAddress.city}, {invoice.shippingAddress.state || ""} {invoice.shippingAddress.postalCode || ""}</p>}
            <table className="w-full text-[9px]" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr><td className="font-semibold whitespace-nowrap">Contact Person</td><td className="text-left">: {invoice.shippingAddress?.name || "-"}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">Contact No.</td><td className="text-left">: {invoice.shippingAddress?.phone || "--"}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">Email</td><td className="text-left">: {invoice.shippingAddress?.email || "--"}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">GSTIN / UIN</td><td className="text-left">: {invoice.shippingAddress?.gstNumber || "--"}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Estimate Details */}
          <div className="p-2.5">
            <p className="font-bold text-[10px] uppercase tracking-wider bg-[#1a3a5c] text-white px-2 py-1.5 -mx-2.5 -mt-2.5 mb-1.5">Estimate Details</p>
            <table className="w-full text-[9px]" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr><td className="font-semibold whitespace-nowrap">Estimate No.</td><td className="text-left">: {invoice.invoiceNumber}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">Estimate Date</td><td className="text-left">: {new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">Supply Date</td><td className="text-left">: {new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">Created Date</td><td className="text-left">: {new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">Created Time</td><td className="text-left">: {new Date(invoice.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td></tr>
                <tr><td className="font-semibold whitespace-nowrap">Created By</td><td className="text-left">: {createdByName}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-2">
          <table className="w-full text-[10px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-[#1a3a5c] text-white">
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">S.NO.</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">ITEM DESCRIPTION</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">HSN/SAC CODE</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">QTY.</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">SIZE</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">AREA</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">UNIT</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">RATE</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">DISCOUNT</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
                const qty = item.quantity || 0;
                const rate = item.unitPrice || 0;
                const amount = item.amount || qty * rate;
                const disc = item.discount || 0;
                const total = amount - disc;
                return (
                  <tr key={idx} className="border-b border-slate-300 hover:bg-slate-50/50">
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">
                      <p className="font-medium">{item.name}</p>
                      {item.description && <p className="text-[9px] text-slate-500">{item.description}</p>}
                    </td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{item.hsn || "-"}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{qty}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{item.size || "-"}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{item.area || "-"}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{item.unit || "Nos"}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{fmt(rate)}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{disc > 0 ? `${disc}%` : "0%"}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">{fmt(total)}</td>
                  </tr>
                );
              })}
              {Array.from({ length: Math.max(0, 7 - items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-300">
                  <td className="border border-slate-300 px-1.5 py-2.5 text-center">{items.length + i + 1}</td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-center"></td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-center"></td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-center"></td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-center"></td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-center"></td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-center"></td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-center"></td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-center"></td>
                  <td className="border border-slate-300 px-1.5 py-2.5 text-center"></td>
                </tr>
              ))}
              {/* TAXABLE VALUE TABLE ROW */}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td colSpan={9} className="border border-slate-300 px-2 py-1.5 text-right uppercase tracking-wider text-[9px] text-slate-700">
                  TAXABLE VALUE :
                </td>
                <td className="border border-slate-300 px-2 py-1.5 text-right text-[10px] text-slate-900 font-bold">
                  {fmt(taxableValue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Breakdown */}
        <div className="pb-1">
          <table className="w-full text-[10px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-[#1a3a5c] text-white">
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">S.NO.</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">HSN CODE</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">SAC CODE</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">ITEM VALUE</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">QTY.</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">CGST(%)</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">AMOUNT</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">SGST(%)</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">AMOUNT</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">IGST(%)</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">AMOUNT</th>
                <th className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">TOTAL TAX</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
                const qty = item.quantity || 0;
                const amount = item.amount || 0;
                const gstRate = item.gstRate || 18;
                const cgst = gstRate / 2;
                const sgst = gstRate / 2;
                const cgstAmt = (amount * cgst) / 100;
                const sgstAmt = (amount * sgst) / 100;
                const totalTax = cgstAmt + sgstAmt;
                return (
                  <tr key={idx} className="border-b border-slate-300 hover:bg-slate-50/50">
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{item.hsn || "-"}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{item.sac || "-"}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{fmt(amount)}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{qty}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{cgst}%</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{fmt(cgstAmt)}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{sgst}%</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">{fmt(sgstAmt)}</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">-</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center">-</td>
                    <td className="border border-slate-300 px-1.5 py-1.5 text-center font-semibold">{fmt(totalTax)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals as Table */}
          <table className="w-full text-[10px] border-collapse border border-slate-300 mt-1">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="border border-slate-300 px-2 py-1 font-medium bg-slate-50 w-[25%] text-left">GST AMOUNT IN WORDS (INR)</td>
                <td className="border border-slate-300 px-2 py-1 text-left w-[45%]">{amountInWords(tax)}</td>
                <td className="border border-slate-300 px-2 py-1 font-semibold bg-slate-50 w-[15%] text-center">TOTAL GST AMT</td>
                <td className="border border-slate-300 px-2 py-1 text-center font-semibold w-[15%]">{fmt(tax)}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="border border-slate-300 px-2 py-1 font-medium bg-slate-50 text-left">AMOUNT IN WORDS (INR)</td>
                <td className="border border-slate-300 px-2 py-1 text-left">{amountInWords(totalAmount)}</td>
                <td className="border border-slate-300 px-2 py-1 font-bold text-xs bg-slate-100 text-center">GRAND TOTAL</td>
                <td className="border border-slate-300 px-2 py-1 text-center font-bold text-xs bg-slate-100">{fmt(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms & Payment as Table */}
        <table className="w-full border-collapse border border-slate-300 text-[9px] mt-1">
          <tbody>
            <tr>
              <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-center text-[9px] font-bold text-slate-900" width="50%">Terms and Conditions:</th>
              <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-center text-[9px] font-bold text-slate-900" width="50%">Payment & Term Conditions:</th>
            </tr>
            <tr>
              <td className="p-2 border border-slate-300 align-top" width="50%">
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Payment must be made in favor of {COMPANY.name} via Cheque / DD / RTGS / NEFT / UPI only.</li>
                  <li>Delay in payment shall attract interest @24% per annum.</li>
                  <li>Booking / services shall be confirmed only after receipt of payment.</li>
                  <li>Cancellation or amendments shall be subject to company policy and management approval.</li>
                  <li>All disputes are subject to Delhi Jurisdiction only.</li>
                  <li>Full payment is due within the stipulated invoice period.</li>
                </ol>
              </td>
              <td className="p-2 border border-slate-300 align-top" width="50%">
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Advance Payment - 100%: Full payment is payable in advance on the same day of Estimate generation.</li>
                  <li>TDS under Section 194C shall be deducted on the basic value only (excluding GST). Applicable rate: 2% for Companies/Firms/other entities and 1% for Individual/HUF.</li>
                  <li>Please share the applicable TDS Certificate (Form 16A) after deduction.</li>
                </ol>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Bank Details / Acknowledgement / Signatory as Table */}
        <table className="w-full border-collapse border border-slate-300 text-[9px] mt-2">
          <tbody>
            <tr>
              <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-center text-[9px] font-bold text-slate-900" width="33%">
                <span className="flex items-center justify-center gap-1"><Landmark size={12} /> Design House India BANK DETAILS</span>
              </th>
              <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-center text-[9px] font-bold text-slate-900" width="34%">
                <span className="flex items-center justify-center gap-1"><PenLine size={12} /> RECEIVER&apos;S ACKNOWLEDGEMENT</span>
              </th>
              <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-center text-[9px] font-bold text-slate-900" width="33%">
                <span className="flex items-center justify-center gap-1"><FileText size={12} /> FOR Design House India</span>
              </th>
            </tr>
            <tr>
              <td className="align-top border border-slate-300 p-2" width="33%">
                <div>
                  <div className="space-y-0.5">
                    <p>Bank Name : {COMPANY.bank.name || "--"}</p>
                    <p>Account Name : {COMPANY.bank.accountName || "--"}</p>
                    <p>Account No. : {COMPANY.bank.accountNo || "--"}</p>
                    <p>IFSC Code : {COMPANY.bank.ifsc || "--"}</p>
                    <p>Branch Name : {COMPANY.bank.branch || "--"}</p>
                  </div>
                </div>
              </td>
              <td className="align-top border border-slate-300 p-2" width="34%">
                <div className="flex min-h-[120px] flex-col">
                  <p>Received the above goods / services in good condition.</p>
                  <div className="mt-auto border-t border-dashed border-slate-300 pt-2 text-center text-slate-400">
                    (Signature & Company Seal)
                  </div>
                </div>
              </td>
              <td className="align-top border border-slate-300 p-2" width="33%">
                <div className="flex min-h-[120px] flex-col">
                  <div className="mt-auto">
                    <Image
                      src="https://res.cloudinary.com/ddjhixcwh/image/upload/v1788348856/ensis/home/dxms1ugculnifsmud6p7.webp"
                      alt="Authorized Sign"
                      width={75}
                      height={75}
                      className="mx-auto h-[75px] w-[75px] object-contain"
                      unoptimized
                    />
                    <div className="mt-2 border-t border-dashed border-slate-300 pt-2 text-center text-slate-400">
                      Authorized Signatory.
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="bg-[#1a3a5c] text-white text-center py-2 text-[9px] mt-2">
          <p>This is a computer generated document and does not require a physical signature.</p>
        </div>
      </div>
    </div>
  );
}
