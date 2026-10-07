"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { ArrowLeft, Loader2, Pencil, Printer, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { invoiceApi, Invoice, Lead, leadApi } from "@/lib/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import Image from "next/image";
import { COMPANY, fmt, amountInWords, buildInvoicePrintWindowHtml, openInvoicePrintWindow } from "@/lib/invoiceTemplate";

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

  const handlePrint = (copies: { original: boolean; duplicate: boolean; triplicate: boolean }) => {
    setShowPrintModal(false);
    const inv = invoice!;
    const fullHtml = buildInvoicePrintWindowHtml({
      title: "PROFORMA INVOICE",
      detailsLabel: "Proforma Invoice",
      copyLabel: "ORIGINAL INVOICE",
      items: inv.items || [],
      billingAddress: inv.billingAddress || {} as any,
      shippingAddress: inv.shippingAddress || {} as any,
      leadFirstName: lead?.firstName,
      leadLastName: lead?.lastName,
      invoiceNumber: inv.invoiceNumber || "",
      createdAt: inv.createdAt,
      createdByName: createdByName,
      subtotal: inv.subtotal || 0,
      tax: inv.tax || 0,
      totalAmount: inv.totalAmount || 0,
      copies,
    });
    openInvoicePrintWindow(fullHtml);
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
      <div className="flex items-center justify-between mb-4 no-print px-4 py-2 border-b bg-white">
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
            onClick={() => setShowPrintModal(true)}
            className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"
          >
            <Printer size={12} /> PRINT
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-[1000px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none print:max-w-full p-10 text-[11px] font-sans text-black" style={{ fontFamily: "Calibri, Arial, sans-serif" }}>
        {/* Header */}
        <div className="text-center">
          <Image src={COMPANY.headerUrl} alt="Header" width={800} height={200} className="w-full h-auto" unoptimized />
        </div>

        {/* Title */}
        <div className="text-center py-0 relative" style={{ minHeight: 22, paddingTop: 10, paddingBottom: 4 }}>
          <h2 className="text-[18px] font-medium tracking-widest text-[#0d1f3c] uppercase">PROFORMA INVOICE</h2>
          <div className="absolute right-0 bottom-0 font-semibold text-[11px] leading-none text-[#0d1f3c]" style={{ letterSpacing: "-0.35px" }}>ORIGINAL INVOICE</div>
        </div>

        {/* Client / Shipment / Invoice Details */}
        <div className="w-full border-collapse mb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-[#0d1f3c] text-white border border-[#0d1f3c] px-1 py-0.5 text-center text-[10px] font-bold uppercase" style={{ width: "38%" }}>Client Name & Address</th>
                <th className="bg-[#0d1f3c] text-white border border-[#0d1f3c] px-1 py-0.5 text-center text-[10px] font-bold uppercase" style={{ width: "38%" }}>Shipment/Venue Details</th>
                <th className="bg-[#0d1f3c] text-white border border-[#0d1f3c] px-1 py-0.5 text-center text-[10px] font-bold uppercase" style={{ width: "24%" }}>Proforma Invoice Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Client */}
                <td className="border border-[#ccc] px-2 py-1 align-top text-[11px] leading-tight">
                  <div className="font-bold uppercase">{invoice.billingAddress?.name || "-"}</div>
                  {invoice.billingAddress?.addressLine && <div className="mt-0.5 capitalize">{invoice.billingAddress.addressLine}{invoice.billingAddress.city ? `, ${invoice.billingAddress.city}` : ""}{invoice.billingAddress.state ? `, ${invoice.billingAddress.state}` : ""}{invoice.billingAddress.postalCode ? ` - ${invoice.billingAddress.postalCode}` : ""}{invoice.billingAddress.country ? `, ${invoice.billingAddress.country}` : ""}</div>}
                  <table className="w-full text-[11px] border-collapse mt-1" style={{ lineHeight: 1.3 }}>
                    <tbody>
                      <tr><td className="whitespace-nowrap pr-1 py-px border-none w-1%">Contact Person</td><td className="pr-1 py-px border-none w-1%">:</td><td className="py-px border-none">{invoice.billingAddress?.name || "-"}</td></tr>
                      <tr><td className="whitespace-nowrap pr-1 py-px border-none w-1%">Contact No.</td><td className="pr-1 py-px border-none w-1%">:</td><td className="py-px border-none">{invoice.billingAddress?.phone || "—"}</td></tr>
                      <tr><td className="whitespace-nowrap pr-1 py-px border-none w-1%">Email</td><td className="pr-1 py-px border-none w-1%">:</td><td className="py-px border-none">{invoice.billingAddress?.email || "—"}</td></tr>
                      <tr><td className="whitespace-nowrap pr-1 py-px border-none w-1%">GSTIN.</td><td className="pr-1 py-px border-none w-1%">:</td><td className="py-px border-none">{invoice.billingAddress?.gstNumber || "—"}</td></tr>
                    </tbody>
                  </table>
                </td>

                {/* Shipment */}
                <td className="border border-[#ccc] px-2 py-1 align-top text-[11px] leading-tight">
                  <div className="font-bold uppercase">{invoice.shippingAddress?.name || (lead ? `${lead.firstName} ${lead.lastName}` : "-")}</div>
                  {invoice.shippingAddress?.addressLine && <div className="mt-0.5">{invoice.shippingAddress.addressLine}{invoice.shippingAddress.city ? `, ${invoice.shippingAddress.city}` : ""}{invoice.shippingAddress.state ? `, ${invoice.shippingAddress.state}` : ""}{invoice.shippingAddress.postalCode ? ` - ${invoice.shippingAddress.postalCode}` : ""}{invoice.shippingAddress.country ? `, ${invoice.shippingAddress.country}` : ""}</div>}
                  <table className="w-full text-[11px] border-collapse mt-1" style={{ lineHeight: 1.3 }}>
                    <tbody>
                      <tr><td className="whitespace-nowrap pr-1 py-px border-none w-1%">Place of Supply & Code</td><td className="pr-1 py-px border-none w-1%">:</td><td className="py-px border-none">{invoice.shippingAddress?.state || "-"} ({invoice.shippingAddress?.postalCode || "-"})</td></tr>
                      <tr><td className="whitespace-nowrap pr-1 py-px border-none w-1%">Contact Person</td><td className="pr-1 py-px border-none w-1%">:</td><td className="py-px border-none">{invoice.shippingAddress?.name || "-"}</td></tr>
                      <tr><td className="whitespace-nowrap pr-1 py-px border-none w-1%">Contact No.</td><td className="pr-1 py-px border-none w-1%">:</td><td className="py-px border-none">{invoice.shippingAddress?.phone || "—"}</td></tr>
                      <tr><td className="whitespace-nowrap pr-1 py-px border-none w-1%">Email</td><td className="pr-1 py-px border-none w-1%">:</td><td className="py-px border-none">{invoice.shippingAddress?.email || "—"}</td></tr>
                      <tr><td className="whitespace-nowrap pr-1 py-px border-none w-1%">GSTIN / UIN</td><td className="pr-1 py-px border-none w-1%">:</td><td className="py-px border-none">{invoice.shippingAddress?.gstNumber || "—"}</td></tr>
                    </tbody>
                  </table>
                </td>

                {/* Estimate Details */}
                <td className="border border-[#ccc] px-2 py-1.5 align-top text-[11px]">
                  <table className="w-full text-[11px] border-collapse" style={{ lineHeight: 1.3 }}>
                    <tbody>
                      <tr><td className="font-bold whitespace-nowrap pr-1 py-px border-none w-1%">Proforma Invoice No.</td><td className="font-bold pr-1 py-px border-none w-1%">:</td><td className="py-px border-none text-right whitespace-nowrap">{invoice.invoiceNumber}</td></tr>
                      <tr><td className="font-bold whitespace-nowrap pr-1 py-px border-none w-1%">Proforma Invoice Date</td><td className="font-bold pr-1 py-px border-none w-1%">:</td><td className="py-px border-none text-right whitespace-nowrap">{new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td></tr>
                      <tr><td className="font-bold whitespace-nowrap pr-1 py-px border-none w-1%">Supply Date</td><td className="font-bold pr-1 py-px border-none w-1%">:</td><td className="py-px border-none text-right">{new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td></tr>
                      <tr><td className="font-bold whitespace-nowrap pr-1 py-px border-none w-1%">Created Date</td><td className="font-bold pr-1 py-px border-none w-1%">:</td><td className="py-px border-none text-right whitespace-nowrap">{new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td></tr>
                      <tr><td className="font-bold whitespace-nowrap pr-1 py-px border-none w-1%">Created Time</td><td className="font-bold pr-1 py-px border-none w-1%">:</td><td className="py-px border-none text-right whitespace-nowrap">{new Date(invoice.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td></tr>
                      <tr><td className="font-bold whitespace-nowrap pr-1 py-px border-none w-1%">Created By</td><td className="font-bold pr-1 py-px border-none w-1%">:</td><td className="py-px border-none text-right capitalize whitespace-nowrap">{createdByName}</td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Items Table */}
        <div className="py-0">
          <table className="w-full text-[10px] border-collapse" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr className="bg-[#0d1f3c] text-white uppercase">
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white" style={{ width: "3%" }}>S.No.</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white" style={{ width: "41%" }}>Item Description</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white" style={{ width: "8%" }}>HSN/SAC Code</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white" style={{ width: "4%" }}>Qty.</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white" style={{ width: "8%" }}>Size</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white" style={{ width: "8%" }}>Area</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white" style={{ width: "5%" }}>Unit</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white" style={{ width: "7%" }}>Rate</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white" style={{ width: "7%" }}>Discount</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white" style={{ width: "9%" }}>Total</th>
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
                  <tr key={idx}>
                    <td className="border border-[#ccc] px-0.5 py-0.5 text-center text-[10px] font-medium whitespace-nowrap">{idx + 1}</td>
                    <td className="border border-[#ccc] px-0.5 py-0.5 text-[10px] leading-tight">
                      <div className="font-bold uppercase">{item.name}</div>
                      {item.description && <div className="text-[10px] font-medium text-[#555] whitespace-pre-wrap">{item.description}</div>}
                    </td>
                    <td className="border border-[#ccc] px-0.5 py-0.5 text-center whitespace-nowrap text-[10px] font-medium">{item.hsn || "-"}</td>
                    <td className="border border-[#ccc] px-0.5 py-0.5 text-center whitespace-nowrap text-[10px] font-medium">{qty}</td>
                    <td className="border border-[#ccc] px-0.5 py-0.5 text-center whitespace-nowrap text-[10px] font-medium">{item.size || "—"}</td>
                    <td className="border border-[#ccc] px-0.5 py-0.5 text-center whitespace-nowrap text-[10px] font-medium">{item.area || "-"}</td>
                    <td className="border border-[#ccc] px-0.5 py-0.5 text-center whitespace-nowrap text-[10px] font-medium">{item.unit || "Nos"}</td>
                    <td className="border border-[#ccc] px-0.5 py-0.5 text-right whitespace-nowrap text-[10px] font-medium">{fmt(rate)}</td>
                    <td className="border border-[#ccc] px-0.5 py-0.5 text-center whitespace-nowrap text-[10px] font-medium">{disc > 0 ? `${disc}%` : "0%"}</td>
                    <td className="border border-[#ccc] px-0.5 py-0.5 text-center whitespace-nowrap font-bold text-[10px]">{fmt(total)}</td>
                  </tr>
                );
              })}
              {Array.from({ length: Math.max(0, 7 - items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} style={{ height: 24 }}>
                  <td className="border border-[#ccc]"></td>
                  <td className="border border-[#ccc]"></td>
                  <td className="border border-[#ccc]"></td>
                  <td className="border border-[#ccc]"></td>
                  <td className="border border-[#ccc]"></td>
                  <td className="border border-[#ccc]"></td>
                  <td className="border border-[#ccc]"></td>
                  <td className="border border-[#ccc]"></td>
                  <td className="border border-[#ccc]"></td>
                  <td className="border border-[#ccc]"></td>
                </tr>
              ))}
              {/* TAXABLE VALUE ROW */}
              <tr className="uppercase" style={{ background: "#f8fafc" }}>
                <td colSpan={7} className="border border-[#ccc] px-1.5 py-1 font-bold text-[10px] leading-tight whitespace-nowrap"></td>
                <td colSpan={2} className="border border-[#ccc] px-1.5 py-1 font-bold text-[10px] leading-tight whitespace-nowrap text-right">Taxable Value</td>
                <td className="border border-[#ccc] px-1 py-1 font-bold text-[10px] leading-tight whitespace-nowrap text-center">{fmt(taxableValue)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Breakdown */}
        <div className="pb-0">
          <table className="w-full text-[10px] border-collapse" style={{ marginBottom: 8 }}>
            <thead>
              <tr className="bg-[#0d1f3c] text-white uppercase">
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">S.No.</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">HSN Code</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">SAC Code</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">Item Value</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">Qty.</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">CGST(%)</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">Amount</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">SGST(%)</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">Amount</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">IGST(%)</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">Amount</th>
                <th className="border border-[#0d1f3c] px-0.5 py-0.5 text-center font-bold text-[10px] bg-[#0d1f3c] text-white">Total Tax</th>
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
                  <tr key={idx}>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">{idx + 1}</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">{item.hsn || "—"}</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">{item.sac || "—"}</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">{fmt(amount)}</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">{qty}</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">{cgst}%</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">{fmt(cgstAmt)}</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">{sgst}%</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">{fmt(sgstAmt)}</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">-</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center">-</td>
                    <td className="border border-[#ccc] px-1.5 py-1 text-center font-bold">{fmt(totalTax)}</td>
                  </tr>
                );
              })}
              {/* GST Amount in Words Row */}
              <tr className="uppercase" style={{ background: "#f1f5f9" }}>
                <td colSpan={4} className="border border-[#ccc] px-1.5 py-1 font-bold text-left" style={{ background: "#f1f5f9" }}>GST Amount in Words (INR)</td>
                <td colSpan={6} className="border border-[#ccc] px-1.5 py-1 capitalize text-left" style={{ background: "#f1f5f9" }}>{amountInWords(tax)}</td>
                <td className="border border-[#ccc] px-1.5 py-1 font-bold whitespace-nowrap text-center" style={{ background: "#f1f5f9" }}>Total GST Amt</td>
                <td className="border border-[#ccc] px-1.5 py-1 font-bold text-center" style={{ background: "#f1f5f9" }}>{fmt(tax)}</td>
              </tr>
              {/* Amount in Words Row */}
              <tr className="uppercase" style={{ background: "#f1f5f9" }}>
                <td colSpan={4} className="border border-[#ccc] px-1.5 py-1 font-bold text-left" style={{ background: "#f1f5f9" }}>Amount in Words (INR)</td>
                <td colSpan={6} className="border border-[#ccc] px-1.5 py-1 capitalize text-left" style={{ background: "#f1f5f9" }}>{amountInWords(totalAmount)}</td>
                <td className="border border-[#ccc] px-1.5 py-1 font-bold text-center" style={{ background: "#f1f5f9" }}>Grand Total</td>
                <td className="border border-[#ccc] px-1.5 py-1 font-bold text-center text-[10px] text-black" style={{ background: "#f1f5f9" }}>{fmt(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms & Payment */}
        <div className="invoice-footer-section" style={{ breakInside: "avoid" }}>
          <table className="w-full border-collapse mb-2" style={{ fontSize: 11 }}>
            <tbody>
              <tr>
                <td style={{ width: "60%", border: "1px solid #ccc", padding: "6px 8px", verticalAlign: "top", fontSize: 11, background: "#fff" }}>
                  <div style={{ fontWeight: 700, margin: "-6px -8px 6px", background: "#f1f5f9", borderBottom: "1px solid #ccc", padding: "4px 8px" }}>Terms and Conditions:</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    <div>1. Payment must be made in favor of {COMPANY.name} via Cheque / DD / RTGS / NEFT / UPI only.</div>
                    <div>2. Delay in payment shall attract interest @24% per annum.</div>
                    <div>3. Booking / services shall be confirmed only after receipt of payment.</div>
                    <div>4. Cancellation or amendments shall be subject to company policy and management approval.</div>
                    <div>5. All disputes are subject to Delhi Jurisdiction only.</div>
                    <div>6. Full payment is due within the stipulated invoice period.</div>
                  </div>
                </td>
                <td style={{ width: "40%", border: "1px solid #ccc", padding: "6px 8px", verticalAlign: "top", fontSize: 11, background: "#fff" }}>
                  <div style={{ fontWeight: 700, margin: "-6px -8px 6px", background: "#f1f5f9", borderBottom: "1px solid #ccc", padding: "4px 8px" }}>Payment & Term Conditions:</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    <div>1. Advance Payment – 100%: Full payment is payable in advance on the same day of Proforma Invoice (PI) generation.</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bank Details / Acknowledgement / Signatory */}
          <table className="w-full border-collapse" style={{ tableLayout: "fixed",  borderCollapse: "collapse",
  marginBottom: "0px",
  border: "1px solid rgb(204, 204, 204)", }}>
            <colgroup>
              <col style={{ width: "33%" }} />
              <col style={{ width: "33%" }} />
              <col style={{ width: "34%" }} />
            </colgroup>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={{ borderRight: "1px", borderColor: "currentcolor #ccc #ccc currentcolor", padding: "6px 8px", background: "#f1f5f9", textAlign: "center", borderStyle:"solid" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#0d1f3c", fontWeight: 700, fontSize: 10, textTransform: "uppercase", whiteSpace: "nowrap" }}>DHI Bank Details</div>
                </th>
                 <th style={{ borderRight: "1px", border:0, borderColor: "#ccc", padding: "6px 8px", background: "#f1f5f9", textAlign: "center", borderStyle:"solid", borderBottom:"0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#0d1f3c", fontWeight: 700, fontSize: 10, textTransform: "uppercase", whiteSpace: "nowrap" }}>Receiver's Acknowledgement</div>
                </th>
                <th style={{ border: "1px", borderColor: "currentcolor currentcolor #ccc", padding: "6px 8px", background: "#f1f5f9", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#0d1f3c", fontWeight: 700, fontSize: 10, textTransform: "uppercase", whiteSpace: "nowrap" }}>For {COMPANY.name}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ngwpl-bank-details" rowSpan={2} style={{ border: "1px", borderColor: "#ccc", padding: "2px 8px", verticalAlign: "top", fontSize: 11, width: "33.33%", borderRight:"1px solid #ccc", borderStyle:"solid" }}>
                  <table>
                    <tr>
                      <td style={{
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        padding: "1px 4px 1px 0px",
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentColor",
                        borderImage: "none",
                      }}>Bank Name</td>
                      <td style={{
                        fontWeight: "bold",
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentcolor",
                        borderImage: "none",
                        padding: "1px 4px 1px 0px",
                      }}>:</td>
                      <td style={{
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentcolor",
                        borderImage: "none",
                        padding: "1px 0px",
                        wordBreak: "break-word",
                      }}>{COMPANY.bank.name}</td>
                    </tr>
                    <tr>
                      <td style={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      padding: "1px 4px 1px 0px",
                      borderWidth: "medium",
                      borderStyle: "none",
                      borderColor: "currentColor",
                      borderImage: "none",
                    }}>Account Name</td> 
                    <td style={{
                      fontWeight: "bold",
                      borderWidth: "medium",
                      borderStyle: "none",
                      borderColor: "currentcolor",
                      borderImage: "none",
                      padding: "1px 4px 1px 0px",
                    }}>:</td> 
                    <td>{COMPANY.bank.accountName}</td>
                    </tr>
                    <tr>
                      <td style={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      padding: "1px 4px 1px 0px",
                      borderWidth: "medium",
                      borderStyle: "none",
                      borderColor: "currentColor",
                      borderImage: "none",
                    }}>Account No.</td> 
                    <td style={{
                        fontWeight: "bold",
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentcolor",
                        borderImage: "none",
                        padding: "1px 4px 1px 0px",
                      }}>:</td> 
                    <td style={{
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentcolor",
                        borderImage: "none",
                        padding: "1px 0px",
                        wordBreak: "break-word",
                      }}>{COMPANY.bank.accountNo}</td>
                    </tr>

                    <tr>
                      <td style={{
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        padding: "1px 4px 1px 0px",
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentColor",
                        borderImage: "none",
                      }}>IFSC Code</td>
                       <td style={{
                        fontWeight: "bold",
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentcolor",
                        borderImage: "none",
                        padding: "1px 4px 1px 0px",
                      }}>:</td>
                        <td style={{
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentcolor",
                        borderImage: "none",
                        padding: "1px 0px",
                        wordBreak: "break-word",
                      }}>{COMPANY.bank.ifsc}</td>
                        </tr>
                    <tr>
                      <td style={{
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        padding: "1px 4px 1px 0px",
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentColor",
                        borderImage: "none",
                      }}>Branch Name</td>
                       <td style={{
                        fontWeight: "bold",
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentcolor",
                        borderImage: "none",
                        padding: "1px 4px 1px 0px",
                      }}>:</td>
                        <td style={{
                        borderWidth: "medium",
                        borderStyle: "none",
                        borderColor: "currentcolor",
                        borderImage: "none",
                        padding: "1px 0px",
                        wordBreak: "break-word",
                      }}>{COMPANY.bank.branch}</td>
                        </tr>
                  </table>
                </td>
                <td style={{ border: "1px 1px 0px 1px", borderColor: "#ccc", padding: "2px 8px", verticalAlign: "top", fontSize: 11, width: "33.33%", borderRight:"1px solid #ccc", borderStyle:"solid" }}>
                  <span style={{ fontSize: 11, whiteSpace: "nowrap" }}>Received the above goods / services in good condition.</span>
                </td>
                <td style={{ border: "1px", padding: 8, verticalAlign: "top", textAlign: "center", width: "33.33%" }}>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <Image src={COMPANY.stampUrl} alt="Stamp" width={80} height={80} className="max-h-20 max-w-20" unoptimized />
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ borderRight: "1px", borderColor: "#ccc", padding: "0 8px 2px", verticalAlign: "bottom", borderStyle:"solid" }}>
                  <div style={{ borderTop: "1px solid #ccc", margin: "0 2px 4px" }}></div>
                  <div style={{ textAlign: "center", fontStyle: "italic", color: "#888", fontSize: 11 }}>(Signature & Company Seal)</div>
                </td>
                <td style={{ border: "none", padding: "0 8px 2px", verticalAlign: "bottom" }}>
                  <div style={{ borderTop: "1px solid #ccc", margin: "0 2px 4px" }}></div>
                  <div style={{ textAlign: "center", fontStyle: "italic", color: "#888", fontSize: 11 }}>Authorized Signatory.</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Bar */}
          <div className="avoid-break relative overflow-hidden" style={{ height: 52, borderWidth: "medium 1px 1px", borderStyle: "none solid solid", borderColor: `currentcolor rgb(204,204,204) rgb(204,204,204)` }}>
            <div className="absolute left-0 right-0 bottom-0" style={{ height: 24, background: "#0d1f3c", zIndex: 0 }}></div>
            <div className="absolute top-0 left-0 right-0 flex items-center justify-center gap-5 text-[11px] font-medium" style={{ height: 28, color: "#0d1f3c", zIndex: 2 }}>
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
                {COMPANY.phone1}
              </div>
              <div className="w-px h-3" style={{ background: "#ccc" }}></div>
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect></svg>
                {COMPANY.email}
              </div>
              <div className="w-px h-3" style={{ background: "#ccc" }}></div>
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                {COMPANY.website}
              </div>
            </div>
            <div className="absolute left-0 right-0 bottom-0 flex items-center justify-center text-white text-[10px]" style={{ height: 24, zIndex: 2 }}>
              <span>This is a computer generated document and does not require a physical signature.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Copy Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPrintModal(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Choose Estimate Copy</h3>
            <p className="text-sm text-slate-500 mb-5">Select the copy required for this print.</p>

            {/* Select All */}
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={printCopies.original && printCopies.duplicate && printCopies.triplicate}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setPrintCopies({ original: checked, duplicate: checked, triplicate: checked });
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-semibold text-slate-700">Select All</span>
            </label>

            {/* Copy Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Original */}
              <button
                type="button"
                onClick={() => setPrintCopies({ ...printCopies, original: !printCopies.original })}
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                  printCopies.original
                    ? "border-slate-800 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {printCopies.original && (
                  <CheckCircle2 size={20} className="absolute top-3 right-3 text-slate-800 fill-slate-800 text-white" />
                )}
                <p className="text-sm font-bold text-slate-800 mb-0.5">Original</p>
                <p className="text-xs text-slate-500">For Recipient</p>
                <p className="text-[10px] text-slate-400 mt-2">Customer&apos;s official copy</p>
              </button>

              {/* Duplicate */}
              <button
                type="button"
                onClick={() => setPrintCopies({ ...printCopies, duplicate: !printCopies.duplicate })}
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                  printCopies.duplicate
                    ? "border-slate-800 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {printCopies.duplicate && (
                  <CheckCircle2 size={20} className="absolute top-3 right-3 text-slate-800 fill-slate-800 text-white" />
                )}
                <p className="text-sm font-bold text-slate-800 mb-0.5">Duplicate</p>
                <p className="text-xs text-slate-500">For Supplier</p>
                <p className="text-[10px] text-slate-400 mt-2">Office and accounts record</p>
              </button>

              {/* Triplicate */}
              <button
                type="button"
                onClick={() => setPrintCopies({ ...printCopies, triplicate: !printCopies.triplicate })}
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                  printCopies.triplicate
                    ? "border-slate-800 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {printCopies.triplicate && (
                  <CheckCircle2 size={20} className="absolute top-3 right-3 text-slate-800 fill-slate-800 text-white" />
                )}
                <p className="text-sm font-bold text-slate-800 mb-0.5">Triplicate</p>
                <p className="text-xs text-slate-500">For Transportation</p>
                <p className="text-[10px] text-slate-400 mt-2">For movement of goods</p>
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-5 py-2.5 rounded-lg bg-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePrint(printCopies)}
                disabled={!printCopies.original && !printCopies.duplicate && !printCopies.triplicate}
                className="px-5 py-2.5 rounded-lg bg-[#1a2332] text-white text-sm font-semibold hover:bg-[#0f1720] disabled:opacity-50 flex items-center gap-2"
              >
                <Printer size={14} /> Print Selected Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
