"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { ArrowLeft, Loader2, Pencil, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { invoiceApi, Invoice, Lead, leadApi } from "@/lib/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";

const COMPANY = {
  name: "Design House India Pvt. Ltd.",
  brandName: "ENSIS",
  shortName: "ENSIS",
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
    const estDate = new Date(inv.createdAt).toLocaleDateString("en-IN");
    const estTime = new Date(inv.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const logoUrl = typeof window !== "undefined" ? window.location.origin + "/images/ensis-logo.png" : "/images/ensis-logo.png";

    const itemRows = items.map((item: any, idx: number) => {
      const qty = item.quantity || 0;
      const rate = item.unitPrice || 0;
      const amount = item.amount || qty * rate;
      const disc = item.discount || 0;
      const total = amount - disc;
      return `<tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:6px 8px">${idx + 1}</td>
        <td style="padding:6px 8px"><strong>${item.name || ""}</strong>${item.description ? `<br/><span style="font-size:10px;color:#6b7280">${item.description}</span>` : ""}</td>
        <td style="padding:6px 8px;text-align:center">${item.hsn || "-"}</td>
        <td style="padding:6px 8px;text-align:center">${qty}</td>
        <td style="padding:6px 8px;text-align:center">${item.size || "-"}</td>
        <td style="padding:6px 8px;text-align:center">${item.area || "-"}</td>
        <td style="padding:6px 8px;text-align:center">${item.unit || "Nos"}</td>
        <td style="padding:6px 8px;text-align:right">${fmt(rate)}</td>
        <td style="padding:6px 8px;text-align:right">${disc > 0 ? disc + "%" : "0%"}</td>
        <td style="padding:6px 8px;text-align:right;font-weight:600">${fmt(total)}</td>
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
      return `<tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:6px 8px">${idx + 1}</td>
        <td style="padding:6px 8px;text-align:center">${item.hsn || "-"}</td>
        <td style="padding:6px 8px;text-align:center">${item.sac || "-"}</td>
        <td style="padding:6px 8px;text-align:right">${fmt(amount)}</td>
        <td style="padding:6px 8px;text-align:center">${qty}</td>
        <td style="padding:6px 8px;text-align:center">${cgst}%</td>
        <td style="padding:6px 8px;text-align:right">${fmt(cgstAmt)}</td>
        <td style="padding:6px 8px;text-align:center">${sgst}%</td>
        <td style="padding:6px 8px;text-align:right">${fmt(sgstAmt)}</td>
        <td style="padding:6px 8px;text-align:center">-</td>
        <td style="padding:6px 8px;text-align:right">-</td>
        <td style="padding:6px 8px;text-align:right;font-weight:600">${fmt(totalTax)}</td>
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
    @page { size:A4 portrait; margin:8mm; }
    body { background:#fff; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
    * { print-color-adjust:exact; -webkit-print-color-adjust:exact; }
  }
  .container { max-width:800px; margin:0 auto; }
  .header { background:#1a3a5c; color:#fff; padding:0; display:grid; grid-template-columns:1fr 1fr 1fr; }
  .header-left { display:flex; align-items:center; gap:10px; padding:12px 16px; border-right:1px solid rgba(255,255,255,0.2); }
  .header-left img { width:44px; height:44px; background:#fff; border-radius:6px; padding:3px; object-fit:contain; flex-shrink:0; }
  .header-left p { font-size:10px; line-height:1.5; }
  .header-mid { padding:12px 16px; border-right:1px solid rgba(255,255,255,0.2); display:flex; flex-direction:column; justify-content:center; }
  .header-mid p { font-size:10px; line-height:1.5; }
  .header-right { padding:12px 16px; text-align:right; font-size:10px; line-height:1.5; display:flex; flex-direction:column; justify-content:center; }
  .title-bar { text-align:center; padding:10px; border-bottom:2px solid #1a3a5c; }
  .title-bar h2 { font-size:14px; letter-spacing:3px; text-transform:uppercase; color:#1a3a5c; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr; border-bottom:1px solid #e5e7eb; }
  .info-col { padding:10px 12px; }
  .info-col:not(:last-child) { border-right:1px solid #e5e7eb; }
  .info-label { background:#1a3a5c; color:#fff; font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:1px; padding:3px 6px; margin:-10px -12px 6px -12px; }
  .info-col p { font-size:10px; line-height:1.6; }
  table { width:100%; border-collapse:collapse; font-size:10px; }
  th { background:#1a3a5c; color:#fff; padding:5px 6px; text-align:left; font-size:9px; }
  th:nth-child(n+3) { text-align:center; }
  th:last-child, th:nth-last-child(2) { text-align:right; }
  td { padding:4px 6px; }
  .totals { margin-top:10px; }
  .totals .row { display:flex; justify-content:space-between; padding:2px 0; font-size:10px; }
  .totals .grand { border-top:2px solid #1a3a5c; padding-top:6px; margin-top:4px; font-size:13px; font-weight:700; }
  .terms-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:10px 12px; border-top:1px solid #e5e7eb; }
  .terms-box { border:1px solid #e5e7eb; border-radius:4px; padding:8px; }
  .terms-box h4 { font-size:10px; font-weight:700; margin-bottom:4px; }
  .terms-box ol { padding-left:14px; font-size:9px; line-height:1.7; }
  .bottom-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; padding:0 12px 10px 12px; }
  .bottom-box { border:1px solid #e5e7eb; border-radius:4px; padding:8px; font-size:10px; }
  .bottom-box h4 { font-weight:700; margin-bottom:4px; }
  .footer { background:#1a3a5c; color:#fff; text-align:center; padding:8px; font-size:9px; }
</style></head><body>
<div class="container">
  <div class="header">
    <div class="header-left">
      <img src="${logoUrl}" alt="Ensis Logo" />
      <div>
        <p style="font-weight:600;font-size:13px">${COMPANY.brandName}</p>
        <p>${COMPANY.phone1}</p>
        <p>${COMPANY.email}</p>
      </div>
    </div>
    <div class="header-mid">
      <p>${COMPANY.website}</p>
      <p>${COMPANY.email}</p>
      <p>${COMPANY.phone1}</p>
      <p style="margin-top:8px">GSTIN - ${COMPANY.gstin || "--"} &nbsp;|&nbsp; CIN No. ${COMPANY.cin || "--"}</p>
    </div>
    <div class="header-right">
      <p style="font-weight:600;margin-bottom:4px">Head Office:</p>
      <p>${COMPANY.address}</p>
    </div>
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
      <div class="info-label" style="text-align:right">Estimate Details</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        <div style="display:flex;justify-content:space-between"><span>Estimate No. :</span><strong>${inv.invoiceNumber}</strong></div>
        <div style="display:flex;justify-content:space-between"><span>Estimate Date :</span><span>${estDate}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Supply Date :</span><span>${estDate}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Created Date :</span><span>${estDate}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Created Time :</span><span>${estTime}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Created By :</span><span>${createdByName}</span></div>
      </div>
    </div>
  </div>

  <div style="padding:10px 12px">
    <table>
      <thead><tr>
        <th style="text-align:left">S.NO.</th>
        <th style="text-align:left">ITEM DESCRIPTION</th>
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

  <div style="padding:0 12px 10px 12px">
    <div style="text-align:right;font-size:11px;margin-bottom:8px"><strong>TAXABLE VALUE : ${fmt(taxableValue)}</strong></div>
    <table>
      <thead><tr>
        <th style="text-align:left">S.NO.</th>
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
    <div class="totals">
      <div class="row"><span>GST AMOUNT IN WORDS (INR)</span><span>${amountInWords(tax)}</span></div>
      <div class="row" style="font-weight:600"><span>TOTAL GST AMT</span><span>${fmt(tax)}</span></div>
      <div class="row"><span>AMOUNT IN WORDS (INR)</span><span>${amountInWords(totalAmount)}</span></div>
      <div class="row grand"><span>GRAND TOTAL</span><span>${fmt(totalAmount)}</span></div>
    </div>
  </div>

  <div class="terms-grid">
    <div class="terms-box">
      <h4>Terms & Conditions:</h4>
      <ol>
        <li>Payment must be made in favor of ${COMPANY.name} via Cheque / DD / RTGS / NEFT / UPI only.</li>
        <li>Delay in payment shall attract interest @24% per annum.</li>
        <li>Booking / services shall be confirmed only after receipt of payment.</li>
        <li>Cancellation or amendments shall be subject to company policy and management approval.</li>
        <li>All disputes are subject to Delhi Jurisdiction only.</li>
        <li>Full payment is due within the stipulated invoice period.</li>
      </ol>
    </div>
    <div class="terms-box">
      <h4>Payment & Term Conditions:</h4>
      <ol>
        <li>Advance Payment - 100%: Full payment is payable in advance on the same day of Estimate generation.</li>
        <li>TDS under Section 194C shall be deducted on the basic value only (excluding GST). Applicable rate: 2% for Companies/Firms/other entities and 1% for Individual/HUF.</li>
        <li>Please share the applicable TDS Certificate (Form 16A) after deduction.</li>
      </ol>
    </div>
  </div>

  <div class="bottom-grid">
    <div class="bottom-box">
      <h4>${COMPANY.shortName} BANK DETAILS</h4>
      <p>Bank Name : ${COMPANY.bank.name || "--"}</p>
      <p>Account Name : ${COMPANY.bank.accountName || "--"}</p>
      <p>Account No. : ${COMPANY.bank.accountNo || "--"}</p>
      <p>IFSC Code : ${COMPANY.bank.ifsc || "--"}</p>
      <p>Branch Name : ${COMPANY.bank.branch || "--"}</p>
    </div>
    <div class="bottom-box">
      <h4>RECEIVER'S ACKNOWLEDGEMENT</h4>
      <p>Received the above goods / services in good condition.</p>
      <div style="margin-top:48px;border-top:1px dashed #d1d5db;padding-top:8px;text-align:center;color:#9ca3af;font-size:10px">(Signature & Company Seal)</div>
    </div>
    <div class="bottom-box">
      <h4>FOR ${COMPANY.brandName}</h4>
      <div style="margin-top:48px;border-top:1px dashed #d1d5db;padding-top:8px;text-align:center;color:#9ca3af;font-size:10px">Authorized Signatory.</div>
    </div>
  </div>

  <div class="footer">This is a computer generated document and does not require a physical signature.</div>
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
      <div className="max-w-[900px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none print:max-w-full">
        {/* Header */}
        <div className="bg-[#1a3a5c] text-white grid grid-cols-3">
          <div className="flex items-center gap-3 p-5 border-r border-white/20">
            <img src="/images/ensis-logo.png" alt="Ensis Logo" className="w-14 h-14 bg-white rounded-lg p-1 object-contain" />
            <div>
              <p className="text-sm font-semibold">{COMPANY.brandName}</p>
              <p className="text-[11px]">{COMPANY.phone1}</p>
              <p className="text-[11px]">{COMPANY.email}</p>
            </div>
          </div>
          <div className="flex flex-col justify-center p-5 border-r border-white/20">
            <p className="text-[11px]">{COMPANY.website}</p>
            <p className="text-[11px]">{COMPANY.email}</p>
            <p className="text-[11px]">{COMPANY.phone1}</p>
            <p className="text-[11px] mt-2">GSTIN - {COMPANY.gstin || "--"} &nbsp;|&nbsp; CIN No. {COMPANY.cin || "--"}</p>
          </div>
          <div className="flex flex-col justify-center p-5 text-right">
            <p className="text-[11px] font-semibold mb-1">Head Office:</p>
            <p className="text-[11px]">{COMPANY.address}</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center py-4 border-b-2 border-[#1a3a5c]">
          <h2 className="text-lg font-bold tracking-widest text-[#1a3a5c] uppercase">Estimate</h2>
        </div>

        {/* Client / Shipment / Invoice Details */}
        <div className="grid grid-cols-3 border-b text-[11px]">
          {/* Client */}
          <div className="p-4 border-r">
            <p className="font-bold text-[10px] uppercase tracking-wider bg-[#1a3a5c] text-white px-2 py-1 -mx-4 -mt-4 mb-2">Client Name & Address</p>
            <p className="font-semibold">{invoice.billingAddress?.name || "-"}</p>
            {invoice.billingAddress?.addressLine && <p>{invoice.billingAddress.addressLine}</p>}
            {invoice.billingAddress?.city && <p>{invoice.billingAddress.city}, {invoice.billingAddress.state || ""} {invoice.billingAddress.postalCode || ""}</p>}
            {invoice.billingAddress?.country && <p>{invoice.billingAddress.country}</p>}
            <p>Contact Person : {invoice.billingAddress?.name || "-"}</p>
            {invoice.billingAddress?.phone && <p>Contact No. : {invoice.billingAddress.phone}</p>}
            {invoice.billingAddress?.email && <p>Email : {invoice.billingAddress.email}</p>}
          </div>

          {/* Shipment */}
          <div className="p-4 border-r">
            <p className="font-bold text-[10px] uppercase tracking-wider bg-[#1a3a5c] text-white px-2 py-1 -mx-4 -mt-4 mb-2">Shipment Details</p>
            <p className="font-semibold">{lead ? `${lead.firstName} ${lead.lastName}` : "-"}</p>
            {invoice.shippingAddress?.addressLine && <p>{invoice.shippingAddress.addressLine}</p>}
            {invoice.shippingAddress?.city && <p>{invoice.shippingAddress.city}, {invoice.shippingAddress.state || ""} {invoice.shippingAddress.postalCode || ""}</p>}
            <p>Contact Person : {invoice.shippingAddress?.name || "-"}</p>
            {invoice.shippingAddress?.phone && <p>Contact No. : {invoice.shippingAddress.phone}</p>}
            {invoice.shippingAddress?.email && <p>Email : {invoice.shippingAddress.email}</p>}
            {invoice.shippingAddress?.gstNumber && <p>GSTIN / UIN : {invoice.shippingAddress.gstNumber}</p>}
          </div>

          {/* Invoice Details */}
          <div className="p-4">
            <p className="font-bold text-[10px] uppercase tracking-wider bg-[#1a3a5c] text-white px-2 py-1 -mx-4 -mt-4 mb-2 text-right">Estimate Details</p>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Estimate No. :</span><span className="font-semibold">{invoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span>Estimate Date :</span><span>{new Date(invoice.createdAt).toLocaleDateString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Supply Date :</span><span>{new Date(invoice.createdAt).toLocaleDateString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Created Date :</span><span>{new Date(invoice.createdAt).toLocaleDateString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Created Time :</span><span>{new Date(invoice.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></div>
              <div className="flex justify-between"><span>Created By :</span><span>{createdByName}</span></div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-4">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-[#1a3a5c] text-white">
                <th className="px-2 py-2 text-left">S.NO.</th>
                <th className="px-2 py-2 text-left">ITEM DESCRIPTION</th>
                <th className="px-2 py-2 text-center">HSN/SAC CODE</th>
                <th className="px-2 py-2 text-center">QTY.</th>
                <th className="px-2 py-2 text-center">SIZE</th>
                <th className="px-2 py-2 text-center">AREA</th>
                <th className="px-2 py-2 text-center">UNIT</th>
                <th className="px-2 py-2 text-right">RATE</th>
                <th className="px-2 py-2 text-right">DISCOUNT</th>
                <th className="px-2 py-2 text-right">TOTAL</th>
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
                  <tr key={idx} className="border-b">
                    <td className="px-2 py-2">{idx + 1}</td>
                    <td className="px-2 py-2">
                      <p className="font-medium">{item.name}</p>
                      {item.description && <p className="text-[10px] text-slate-500">{item.description}</p>}
                    </td>
                    <td className="px-2 py-2 text-center">{item.hsn || "-"}</td>
                    <td className="px-2 py-2 text-center">{qty}</td>
                    <td className="px-2 py-2 text-center">{item.size || "-"}</td>
                    <td className="px-2 py-2 text-center">{item.area || "-"}</td>
                    <td className="px-2 py-2 text-center">{item.unit || "Nos"}</td>
                    <td className="px-2 py-2 text-right">{fmt(rate)}</td>
                    <td className="px-2 py-2 text-right">{disc > 0 ? `${disc}%` : "0%"}</td>
                    <td className="px-2 py-2 text-right font-semibold">{fmt(total)}</td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr className="border-b">
                  <td colSpan={10} className="px-2 py-4 text-center text-slate-400">No items</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tax Breakdown */}
        <div className="px-4 pb-4">
          <div className="text-right text-[11px] mb-2">
            <span className="font-semibold">TAXABLE VALUE : {fmt(taxableValue)}</span>
          </div>
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-[#1a3a5c] text-white">
                <th className="px-2 py-2 text-left">S.NO.</th>
                <th className="px-2 py-2 text-center">HSN CODE</th>
                <th className="px-2 py-2 text-center">SAC CODE</th>
                <th className="px-2 py-2 text-right">ITEM VALUE</th>
                <th className="px-2 py-2 text-center">QTY.</th>
                <th className="px-2 py-2 text-center">CGST(%)</th>
                <th className="px-2 py-2 text-right">AMOUNT</th>
                <th className="px-2 py-2 text-center">SGST(%)</th>
                <th className="px-2 py-2 text-right">AMOUNT</th>
                <th className="px-2 py-2 text-center">IGST(%)</th>
                <th className="px-2 py-2 text-right">AMOUNT</th>
                <th className="px-2 py-2 text-right">TOTAL TAX</th>
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
                  <tr key={idx} className="border-b">
                    <td className="px-2 py-2">{idx + 1}</td>
                    <td className="px-2 py-2 text-center">{item.hsn || "-"}</td>
                    <td className="px-2 py-2 text-center">{item.sac || "-"}</td>
                    <td className="px-2 py-2 text-right">{fmt(amount)}</td>
                    <td className="px-2 py-2 text-center">{qty}</td>
                    <td className="px-2 py-2 text-center">{cgst}%</td>
                    <td className="px-2 py-2 text-right">{fmt(cgstAmt)}</td>
                    <td className="px-2 py-2 text-center">{sgst}%</td>
                    <td className="px-2 py-2 text-right">{fmt(sgstAmt)}</td>
                    <td className="px-2 py-2 text-center">-</td>
                    <td className="px-2 py-2 text-right">-</td>
                    <td className="px-2 py-2 text-right font-semibold">{fmt(totalTax)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>GST AMOUNT IN WORDS (INR)</span>
              <span className="font-medium">{amountInWords(tax)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>TOTAL GST AMT</span>
              <span>{fmt(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>AMOUNT IN WORDS (INR)</span>
              <span className="font-medium">{amountInWords(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t-2 border-[#1a3a5c] pt-2 mt-2">
              <span>GRAND TOTAL</span>
              <span>{fmt(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Payment */}
        <div className="grid grid-cols-2 gap-4 px-4 pb-4 text-[11px]">
          <div className="border rounded-lg p-3">
            <p className="font-bold mb-2">Terms and Conditions:</p>
            <ol className="space-y-1 text-[10px] list-decimal list-inside">
              <li>Payment must be made in favor of {COMPANY.name} via Cheque / DD / RTGS / NEFT / UPI only.</li>
              <li>Delay in payment shall attract interest @24% per annum.</li>
              <li>Booking / services shall be confirmed only after receipt of payment.</li>
              <li>Cancellation or amendments shall be subject to company policy and management approval.</li>
              <li>All disputes are subject to Delhi Jurisdiction only.</li>
              <li>Full payment is due within the stipulated invoice period.</li>
            </ol>
          </div>
          <div className="border rounded-lg p-3">
            <p className="font-bold mb-2">Payment & Term Conditions:</p>
            <ol className="space-y-1 text-[10px] list-decimal list-inside">
              <li>Advance Payment - 100%: Full payment is payable in advance on the same day of Estimate generation.</li>
              <li>TDS under Section 194C shall be deducted on the basic value only (excluding GST). Applicable rate: 2% for Companies/Firms/other entities and 1% for Individual/HUF.</li>
              <li>Please share the applicable TDS Certificate (Form 16A) after deduction.</li>
            </ol>
          </div>
        </div>

        {/* Bank Details / Acknowledgement / Signatory */}
        <div className="grid grid-cols-3 gap-4 px-4 pb-4 text-[11px]">
          <div className="border rounded-lg p-3">
            <p className="font-bold mb-2 flex items-center gap-1">
              <span>&#127974;</span> {COMPANY.shortName} BANK DETAILS
            </p>
            <div className="space-y-1">
              <p>Bank Name : {COMPANY.bank.name || "--"}</p>
              <p>Account Name : {COMPANY.bank.accountName || "--"}</p>
              <p>Account No. : {COMPANY.bank.accountNo || "--"}</p>
              <p>IFSC Code : {COMPANY.bank.ifsc || "--"}</p>
              <p>Branch Name : {COMPANY.bank.branch || "--"}</p>
            </div>
          </div>
          <div className="border rounded-lg p-3">
            <p className="font-bold mb-2 flex items-center gap-1">
              <span>&#9997;</span> RECEIVER&apos;S ACKNOWLEDGEMENT
            </p>
            <p className="text-[10px]">Received the above goods / services in good condition.</p>
            <div className="mt-8 border-t border-dashed pt-2 text-center text-[10px] text-slate-400">
              (Signature & Company Seal)
            </div>
          </div>
          <div className="border rounded-lg p-3">
            <p className="font-bold mb-2 flex items-center gap-1">
              <span>&#9997;</span> FOR {COMPANY.brandName}
            </p>
            <div className="mt-8 border-t border-dashed pt-2 text-center text-[10px] text-slate-400">
              Authorized Signatory.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1a3a5c] text-white text-center py-3 text-[10px]">
          <p>This is a computer generated document and does not require a physical signature.</p>
        </div>
      </div>
    </div>
  );
}
