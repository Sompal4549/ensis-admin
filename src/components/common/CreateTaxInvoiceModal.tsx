"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Trash2, Upload, FileText, Truck, RefreshCw, X } from "lucide-react";
import { invoiceApi, Invoice, Lead, uploadImage } from "@/lib/api";
import { toast } from "react-toastify";
import { labelClass, fieldClass, cardClass } from "@/constants";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  estimate: Invoice;
  leadId: string;
};

const STATE_CODES: Record<string, string> = {
  "Andhra Pradesh": "37",
  "Arunachal Pradesh": "12",
  "Assam": "18",
  "Bihar": "10",
  "Chhattisgarh": "22",
  "Goa": "30",
  "Gujarat": "24",
  "Haryana": "06",
  "Himachal Pradesh": "02",
  "Jharkhand": "20",
  "Karnataka": "29",
  "Kerala": "32",
  "Madhya Pradesh": "23",
  "Maharashtra": "27",
  "Manipur": "14",
  "Meghalaya": "17",
  "Mizoram": "15",
  "Nagaland": "13",
  "Odisha": "21",
  "Punjab": "03",
  "Rajasthan": "08",
  "Sikkim": "11",
  "Tamil Nadu": "33",
  "Telangana": "36",
  "Tripura": "16",
  "Uttar Pradesh": "09",
  "Uttarakhand": "05",
  "West Bengal": "19",
  "Delhi": "07",
  "Jammu and Kashmir": "01",
  "Ladakh": "38",
  "Puducherry": "34",
  "Chandigarh": "04",
  "Andaman and Nicobar Islands": "35",
  "Dadra and Nagar Haveli and Daman and Diu": "26",
  "Lakshadweep": "31",
};

export default function CreateTaxInvoiceModal({ isOpen, onClose, onCreated, estimate, leadId }: Props) {
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);

  const [poAvailable, setPoAvailable] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState("");
  const [poFile, setPoFile] = useState<File | null>(null);
  const [poFileUrl, setPoFileUrl] = useState("");

  const [challans, setChallans] = useState<Invoice[]>([]);
  const [selectedChallanIds, setSelectedChallanIds] = useState<string[]>([]);
  const [loadingChallans, setLoadingChallans] = useState(false);
  const [dcApplicable, setDcApplicable] = useState(true);
  const [showCreateChallan, setShowCreateChallan] = useState(false);

  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"payment_received" | "full_payment_pending" | "partially_paid">("full_payment_pending");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [paymentDays, setPaymentDays] = useState(7);
  const [amountReceived, setAmountReceived] = useState(0);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const taxableAmount = estimate.subtotal || 0;
  const gstAmount = estimate.tax || 0;
  const invoiceAmount = estimate.totalAmount || 0;
  const outstandingAmount = paymentStatus === "payment_received" ? 0 : invoiceAmount - amountReceived;

  const fetchLead = useCallback(async () => {
    try {
      const l = await invoiceApi.get(estimate._id);
      const leadData = typeof l.lead === "object" ? l.lead : null;
      if (leadData) {
        setLead(leadData as Lead);
      }
    } catch {
      // ignore
    }
  }, [estimate._id]);

  const fetchChallans = useCallback(async () => {
    setLoadingChallans(true);
    try {
      const res = await invoiceApi.listByLead(leadId, 1, 200);
      const linkedChallans = (res.invoices || []).filter(
        (inv) => inv.type === "delivery_challan" && inv.sourceProformaInvoice === estimate._id
      );
      setChallans(linkedChallans);
      setSelectedChallanIds(linkedChallans.map((c) => c._id));
    } catch {
      // ignore
    } finally {
      setLoadingChallans(false);
    }
  }, [leadId, estimate._id]);

  const toggleChallan = (id: string) => {
    setSelectedChallanIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (isOpen) {
      fetchLead();
      fetchChallans();
      setPaymentTerms(`Payment due within ${paymentDays} days from the Invoice Date.`);
    }
  }, [isOpen, fetchLead, fetchChallans, paymentDays]);

  useEffect(() => {
    if (paymentStatus === "payment_received") {
      setAmountReceived(invoiceAmount);
      setPaymentTerms("Payment received as per agreed installment plan.");
    } else if (paymentStatus === "full_payment_pending") {
      setAmountReceived(0);
      setPaymentTerms(`Payment due within ${paymentDays} days from the Invoice Date.`);
    } else {
      setPaymentTerms(`Balance payment due within ${paymentDays} days from the Invoice Date.`);
    }
  }, [paymentStatus, invoiceAmount, paymentDays]);

  const handlePoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPoFile(file);
    try {
      const url = await uploadImage(file, "purchase-orders");
      setPoFileUrl(url);
      toast.success("PO file uploaded");
    } catch {
      toast.error("Failed to upload PO file");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: Partial<Invoice> = {
        lead: leadId,
        type: "tax",
        sourceProformaInvoice: estimate._id,
        items: estimate.items,
        billingAddress: estimate.billingAddress,
        shippingAddress: estimate.shippingAddress,
        subtotal: estimate.subtotal,
        discount: estimate.discount,
        tax: estimate.tax,
        shipping: estimate.shipping,
        totalAmount: estimate.totalAmount,
        notes: estimate.notes,
        termsAndConditions: estimate.termsAndConditions,
        purchaseOrder: {
          available: poAvailable,
          poNumber: poAvailable ? poNumber : undefined,
          poDate: poAvailable ? poDate : undefined,
          poFile: poFileUrl || undefined,
        },
        paymentDetails: {
          showPaymentDetails,
          paymentStatus,
          paymentTerms,
          outstandingAmount,
          amountReceived,
        },
      };

      await invoiceApi.create(payload);
      toast.success("Tax Invoice created successfully");
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to create Tax Invoice");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6 px-4" onClick={onClose}>
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-sm">₹</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Create Tax Invoice from Estimate</h2>
                <p className="text-[10px] text-slate-400">Please provide the additional details to generate the Tax Invoice.</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors text-2xl font-medium">&times;</button>
          </div>

          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* PO & Delivery Challans - Side by Side */}
            <div className="grid grid-cols-2 gap-3">
              {/* Purchase Order Section */}
              <div className={cardClass}>
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-purple-600" />
                  <span className="text-[11px] font-bold text-purple-600">1.</span>
                  <h3 className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Purchase Order</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className={labelClass}>PO Available?</label>
                    <div className="flex items-center gap-4 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={poAvailable === true}
                          onChange={() => setPoAvailable(true)}
                          className="w-3.5 h-3.5 text-blue-600"
                        />
                        <span className="text-[11px] text-slate-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={poAvailable === false}
                          onChange={() => setPoAvailable(false)}
                          className="w-3.5 h-3.5 text-blue-600"
                        />
                        <span className="text-[11px] text-slate-700">No</span>
                      </label>
                    </div>
                  </div>

                  {poAvailable && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelClass}>PO Number</label>
                          <input
                            type="text"
                            value={poNumber}
                            onChange={(e) => setPoNumber(e.target.value)}
                            placeholder="Enter PO Number"
                            className={fieldClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>PO Date</label>
                          <input
                            type="date"
                            value={poDate}
                            onChange={(e) => setPoDate(e.target.value)}
                            className={fieldClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Attach PO (Optional)</label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                            <Upload size={12} className="text-slate-400" />
                            <span className="text-[10px] text-slate-500">
                              {poFile ? poFile.name : "Upload File"}
                            </span>
                            <span className="text-[9px] text-slate-400">(PDF, JPG, PNG)</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handlePoFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Challans Section */}
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-emerald-600" />
                    <span className="text-[11px] font-bold text-emerald-600">2.</span>
                    <h3 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Delivery Challans</h3>
                  </div>
                  <button
                    onClick={() => fetchChallans()}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium text-slate-600 hover:bg-slate-100"
                  >
                    <RefreshCw size={10} /> Refresh challan list
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className={labelClass}>Delivery Challan Applicable?</label>
                    <div className="flex items-center gap-4 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={dcApplicable === true}
                          onChange={() => setDcApplicable(true)}
                          className="w-3.5 h-3.5 text-blue-600"
                        />
                        <span className="text-[11px] text-slate-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={dcApplicable === false}
                          onChange={() => setDcApplicable(false)}
                          className="w-3.5 h-3.5 text-blue-600"
                        />
                        <span className="text-[11px] text-slate-700">No</span>
                      </label>
                    </div>
                  </div>

                  {dcApplicable && (
                    <>
                      {loadingChallans ? (
                        <div className="flex justify-center py-3">
                          <Loader2 size={14} className="animate-spin text-emerald-600" />
                        </div>
                      ) : challans.length === 0 ? (
                        <div className="text-center py-3 text-[10px] text-slate-400">
                          No delivery challans linked yet.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {challans.map((challan) => (
                            <label
                              key={challan._id}
                              className={`flex items-center justify-between p-1.5 rounded-lg border cursor-pointer transition-colors ${
                                selectedChallanIds.includes(challan._id)
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={selectedChallanIds.includes(challan._id)}
                                  onChange={() => toggleChallan(challan._id)}
                                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                                />
                                <Truck size={10} className="text-slate-400" />
                                <span className="text-[10px] font-medium text-slate-700">{challan.invoiceNumber}</span>
                                <span className="text-[9px] text-slate-400">
                                  {new Date(challan.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </span>
                              </div>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                                challan.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                                challan.status === "cancelled" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>
                                {challan.status}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      <p className="text-[9px] text-slate-500">
                        Delivery challans linked to this Estimate are listed here automatically.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-3 gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 shrink-0">
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <line x1="2" x2="22" y1="10" y2="10"/>
                  </svg>
                  <span className="text-[11px] font-bold text-blue-600 shrink-0">3.</span>
                  <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Payment Details / Receipts</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded-md flex-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span className="text-[10px] text-amber-700">TDS, if applicable, shall be deducted on the taxable/basic value (excluding GST) at the applicable rate under the Income Tax Act, 1961.</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* TODO: Show Payment Received Details On Invoice - disabled for now
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={showPaymentDetails === true} onChange={() => setShowPaymentDetails(true)} className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] font-semibold text-slate-700">Show Payment Received Details On Invoice</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={showPaymentDetails === false} onChange={() => setShowPaymentDetails(false)} className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] text-slate-600">No</span>
                  </label>
                </div>
                */}

                {/* {showPaymentDetails && ( */}
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Payment Received Card */}
                      <label
                        className={`rounded-lg p-2 border cursor-pointer transition-all ${
                          paymentStatus === "payment_received"
                            ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <input
                            type="radio"
                            checked={paymentStatus === "payment_received"}
                            onChange={() => setPaymentStatus("payment_received")}
                            className="w-3.5 h-3.5 text-emerald-600"
                          />
                          <div className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="m9 12 2 2 4-4"/>
                            </svg>
                            <span className="text-[10px] font-bold text-slate-800">Payment Received</span>
                          </div>
                          <span className="text-[7px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Paid in Full</span>
                        </div>
                        <div className="ml-5 space-y-0.5">
                          <p className="text-[9px] text-slate-600">Payment Terms: Payment received as per agreed installment plan.</p>
                          <p className="text-[9px] text-slate-600">Payment Status: Paid in Full.</p>
                        </div>
                      </label>

                      {/* Full Payment Pending Card */}
                      <label
                        className={`rounded-lg p-2 border cursor-pointer transition-all ${
                          paymentStatus === "full_payment_pending"
                            ? "bg-amber-50 border-amber-300 ring-1 ring-amber-200"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <input
                            type="radio"
                            checked={paymentStatus === "full_payment_pending"}
                            onChange={() => setPaymentStatus("full_payment_pending")}
                            className="w-3.5 h-3.5 text-amber-600"
                          />
                          <div className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span className="text-[10px] font-bold text-slate-800">Full Payment Pending</span>
                          </div>
                          <span className="text-[7px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">Payment Pending</span>
                        </div>
                        <div className="ml-5 space-y-1.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[9px] text-slate-600">Payment Terms: Payment due within</span>
                            <input
                              type="number"
                              value={paymentDays}
                              onChange={(e) => setPaymentDays(parseInt(e.target.value) || 7)}
                              className="w-10 text-center rounded border border-amber-200 px-0.5 py-0.5 text-[9px] outline-none bg-white"
                              min={1}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-[9px] text-slate-600">days from the Invoice Date.</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500">Outstanding Amount</span>
                            <div className="text-[10px] font-bold text-slate-800">{fmt(outstandingAmount)}</div>
                          </div>
                        </div>
                      </label>

                      {/* Partially Paid Card */}
                      <label
                        className={`rounded-lg p-2 border cursor-pointer transition-all ${
                          paymentStatus === "partially_paid"
                            ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <input
                            type="radio"
                            checked={paymentStatus === "partially_paid"}
                            onChange={() => setPaymentStatus("partially_paid")}
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                          <div className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 6v6l4 2"/>
                            </svg>
                            <span className="text-[10px] font-bold text-slate-800">Partially Paid</span>
                          </div>
                          <span className="text-[7px] px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">Partially Paid</span>
                        </div>
                        <div className="ml-5 space-y-1.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[9px] text-slate-600">Payment Terms: Balance payment due within</span>
                            <input
                              type="number"
                              value={paymentDays}
                              onChange={(e) => setPaymentDays(parseInt(e.target.value) || 7)}
                              className="w-10 text-center rounded border border-blue-200 px-0.5 py-0.5 text-[9px] outline-none bg-white"
                              min={1}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-[9px] text-slate-600">days from the Invoice Date.</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="text-[8px] text-slate-500">Amt. Received</label>
                              <input
                                type="number"
                                value={amountReceived}
                                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                                placeholder="Enter Amount"
                                className="w-full mt-0.5 rounded border border-blue-200 px-1.5 py-0.5 text-[9px] outline-none focus:ring-1 focus:ring-blue-500"
                                min={0}
                                max={invoiceAmount}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div>
                              <label className="text-[8px] text-slate-500">Outstanding Amt.</label>
                              <div className="mt-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-700">{fmt(outstandingAmount)}</div>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Summary Row */}
                    <div className="grid grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100 rounded-xl border border-gray-200 bg-gray-50/60">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                          <rect width="16" height="20" x="4" y="2" rx="2"/>
                          <line x1="8" x2="16" y1="6" y2="6"/>
                          <line x1="16" x2="16" y1="14" y2="18"/>
                          <path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/>
                          <path d="M12 14h.01"/><path d="M8 14h.01"/>
                          <path d="M12 18h.01"/><path d="M8 18h.01"/>
                        </svg>
                        <div>
                          <p className="text-[9px] text-slate-500">Taxable Amount</p>
                          <p className="text-[11px] font-bold text-slate-700">{fmt(taxableAmount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
                          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                          <path d="M12 17.5v-11"/>
                        </svg>
                        <div>
                          <p className="text-[9px] text-slate-500">GST Amount</p>
                          <p className="text-[11px] font-bold text-slate-700">{fmt(gstAmount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#194090]">
                          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                          <path d="M12 11h4"/><path d="M12 16h4"/>
                          <path d="M8 11h.01"/><path d="M8 16h.01"/>
                        </svg>
                        <div>
                          <p className="text-[9px] text-slate-500">Invoice Amount</p>
                          <p className="text-[11px] font-bold text-[#194090]">{fmt(invoiceAmount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                        <div>
                          <p className="text-[9px] text-slate-500">Amount Received</p>
                          <p className="text-[11px] font-bold text-emerald-600">{fmt(amountReceived)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
                          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
                        </svg>
                        <div>
                          <p className="text-[9px] text-slate-500">Outstanding Amount</p>
                          <p className={`text-[11px] font-bold ${outstandingAmount > 0 ? "text-red-500" : "text-emerald-600"}`}>{fmt(outstandingAmount)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>


          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Preview Invoice
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-[10px] font-bold hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              Create Tax Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Create Delivery Challan Modal */}
      {showCreateChallan && (
        <CreateDeliveryChallanModal
          isOpen={showCreateChallan}
          onClose={() => setShowCreateChallan(false)}
          onCreated={() => {
            setShowCreateChallan(false);
            fetchChallans();
          }}
          estimate={estimate}
          leadId={leadId}
        />
      )}
    </>
  );
}

export function CreateDeliveryChallanModal({
  isOpen,
  onClose,
  onCreated,
  estimate,
  estimates,
  leadId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  estimate?: Invoice;
  estimates?: Invoice[];
  leadId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);

  const [selectedEstimateId, setSelectedEstimateId] = useState<string>(estimate?._id || "");
  const activeEstimate = estimate || estimates?.find((e) => e._id === selectedEstimateId) || null;

  const [challanDate, setChallanDate] = useState(new Date().toISOString().split("T")[0]);
  const [challanType, setChallanType] = useState("Outward");
  const [purpose, setPurpose] = useState("Event/Stall Material");
  const [vehicleNo, setVehicleNo] = useState("");
  const [transporter, setTransporter] = useState("");
  const [eventName, setEventName] = useState("");
  const [poRefNo, setPoRefNo] = useState("");
  const [typeOfSale, setTypeOfSale] = useState("");
  const [shippedTo, setShippedTo] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [biltyNo, setBiltyNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [terms, setTerms] = useState("Goods/material received in good condition.");

  const [selectedItems, setSelectedItems] = useState<
    Array<{
      name: string;
      hsn: string;
      size: string;
      piQty: number;
      delivered: number;
      available: number;
      thisChallan: number;
      unit: string;
      selected: boolean;
    }>
  >([]);

  useEffect(() => {
    if (activeEstimate) {
      setSelectedItems(
        activeEstimate.items.map((item) => ({
          name: item.name,
          hsn: (item as any).hsn || "-",
          size: (item as any).size || "-",
          piQty: item.quantity,
          delivered: 0,
          available: item.quantity,
          thisChallan: item.quantity,
          unit: (item as any).unit || "Nos",
          selected: true,
        }))
      );
    }
  }, [activeEstimate]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const billAddr = activeEstimate?.billingAddress || ({} as any);
  const shipAddr = activeEstimate?.shippingAddress || billAddr;

  const selectedCount = selectedItems.filter((i) => i.selected).length;
  const totalSelectedQty = selectedItems.filter((i) => i.selected).reduce((sum, i) => sum + i.thisChallan, 0);

  useEffect(() => {
    if (isOpen && activeEstimate) {
      invoiceApi.get(activeEstimate._id).then((inv) => {
        const leadData = typeof inv.lead === "object" ? inv.lead : null;
        if (leadData) setLead(leadData as Lead);
      }).catch(() => {});
    }
  }, [isOpen, activeEstimate?._id]);

  const handleItemSelect = (idx: number) => {
    const updated = [...selectedItems];
    updated[idx].selected = !updated[idx].selected;
    if (!updated[idx].selected) {
      updated[idx].thisChallan = 0;
    } else {
      updated[idx].thisChallan = updated[idx].available;
    }
    setSelectedItems(updated);
  };

  const handleQtyChange = (idx: number, qty: number) => {
    const updated = [...selectedItems];
    updated[idx].thisChallan = Math.min(Math.max(0, qty), updated[idx].available);
    setSelectedItems(updated);
  };

  const handleSubmit = async () => {
    if (!activeEstimate) {
      toast.error("Please select a proforma invoice");
      return;
    }
    setLoading(true);
    try {
      const items = selectedItems
        .filter((i) => i.selected && i.thisChallan > 0)
        .map((i) => ({
          name: i.name,
          quantity: i.thisChallan,
          delivered: i.delivered,
          available: i.available,
          thisChallan: i.thisChallan,
        }));

      await invoiceApi.create({
        lead: leadId,
        type: "delivery_challan",
        sourceProformaInvoice: activeEstimate._id,
        items: activeEstimate.items.map((item, idx) => ({
          ...item,
          quantity: selectedItems[idx]?.thisChallan || item.quantity,
        })),
        billingAddress: activeEstimate.billingAddress,
        shippingAddress: activeEstimate.shippingAddress,
        subtotal: activeEstimate.subtotal,
        tax: activeEstimate.tax,
        totalAmount: activeEstimate.totalAmount,
        notes: remarks,
      });

      toast.success("Delivery Challan created");
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to create challan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <button onClick={onClose} className="text-[11px] text-blue-600 hover:underline mb-1 flex items-center gap-1">
              ← Back to Challans
            </button>
            <h2 className="text-sm font-bold text-slate-800">Create Delivery Challan</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">One proforma can have multiple challans. Only remaining quantities can be delivered.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-4">
              <label className={labelClass}>Source Proforma Invoice *</label>
              {estimates && estimates.length > 0 && !estimate ? (
                <select
                  value={selectedEstimateId}
                  onChange={(e) => setSelectedEstimateId(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select Proforma Invoice</option>
                  {estimates.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} — {inv.items.length} item(s), ₹{(inv.totalAmount || 0).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={`${fieldClass} bg-slate-50`}>
                  {activeEstimate?.invoiceNumber || "-"} — {activeEstimate?.items.length || 0} item(s), {totalSelectedQty} qty available
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Challan Date *</label>
              <input type="date" value={challanDate} onChange={(e) => setChallanDate(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Challan Type</label>
              <select value={challanType} onChange={(e) => setChallanType(e.target.value)} className={fieldClass}>
                <option>Outward</option>
                <option>Inward</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Purpose</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={fieldClass}>
                <option>Event/Stall Material</option>
                <option>Testing</option>
                <option>Repair</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Vehicle No.</label>
              <input type="text" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="Enter vehicle number" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Transporter</label>
              <input type="text" value={transporter} onChange={(e) => setTransporter(e.target.value)} placeholder="Transporter name" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Event Name</label>
              <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Enter event name" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>PO / Reference No.</label>
              <input type="text" value={poRefNo} onChange={(e) => setPoRefNo(e.target.value)} placeholder="Enter reference number" className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Type of Sale</label>
              <select value={typeOfSale} onChange={(e) => setTypeOfSale(e.target.value)} className={fieldClass}>
                <option value="">Select Type</option>
                <option>B2B</option>
                <option>B2C</option>
                <option>Export</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Shipped To</label>
              <input type="text" value={shippedTo} onChange={(e) => setShippedTo(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>State Code</label>
              <input type="text" value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Bilty No.</label>
              <input type="text" value={biltyNo} onChange={(e) => setBiltyNo(e.target.value)} placeholder="Enter bilty number" className={fieldClass} />
            </div>
          </div>

          {/* Client & Delivery Details */}
          <div className={cardClass}>
            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Client & Delivery Details
            </h4>
            {activeEstimate ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Company Name</label>
                <div className={fieldClass}>{billAddr.name || "-"}</div>
              </div>
              <div>
                <label className={labelClass}>GSTIN</label>
                <div className={fieldClass}>{billAddr.gstNumber || "-"}</div>
              </div>
              <div>
                <label className={labelClass}>Contact Person</label>
                <div className={fieldClass}>{billAddr.name || "-"}</div>
              </div>
              <div>
                <label className={labelClass}>Contact Phone</label>
                <div className={fieldClass}>{billAddr.phone || "-"}</div>
              </div>
              <div>
                <label className={labelClass}>Company Email</label>
                <div className={fieldClass}>{billAddr.email || "-"}</div>
              </div>
              <div>
                <label className={labelClass}>Contact Email</label>
                <div className={fieldClass}>{billAddr.email || "-"}</div>
              </div>
              <div>
                <label className={labelClass}>Company Address</label>
                <div className={fieldClass}>{billAddr.addressLine || "-"}, {billAddr.city || ""} {billAddr.state || ""} {billAddr.postalCode || ""}</div>
              </div>
              <div>
                <label className={labelClass}>Delivery Address</label>
                <div className={fieldClass}>{shipAddr.addressLine || billAddr.addressLine || "-"}</div>
              </div>
            </div>
            ) : (
              <p className="text-[11px] text-slate-400 text-center py-4">Select a proforma invoice to load client details.</p>
            )}
          </div>

          {/* Select Items */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                Select Items for This Challan
              </h4>
              {activeEstimate && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{selectedCount} item(s) selected</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">{totalSelectedQty} total qty</span>
              </div>
              )}
            </div>
            {activeEstimate ? (
            <>
            <p className="text-[10px] text-slate-400 mb-3">Tick only the items going in this delivery and enter their delivery quantity.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-center px-2 py-2 font-semibold text-slate-500 w-10">SELECT</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">DESCRIPTION</th>
                    <th className="text-center px-2 py-2 font-semibold text-slate-500">HSN/SAC</th>
                    <th className="text-center px-2 py-2 font-semibold text-slate-500">SIZE / AREA</th>
                    <th className="text-center px-2 py-2 font-semibold text-slate-500">PI QTY</th>
                    <th className="text-center px-2 py-2 font-semibold text-slate-500">DELIVERED</th>
                    <th className="text-center px-2 py-2 font-semibold text-slate-500">AVAILABLE</th>
                    <th className="text-center px-2 py-2 font-semibold text-slate-500">THIS CHALLAN</th>
                    <th className="text-center px-2 py-2 font-semibold text-slate-500">UNIT</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="text-center px-2 py-2">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleItemSelect(idx)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
                      <td className="px-2 py-2 text-center text-slate-600">{item.hsn}</td>
                      <td className="px-2 py-2 text-center text-slate-600">{item.size}</td>
                      <td className="px-2 py-2 text-center text-slate-600">{item.piQty}</td>
                      <td className="px-2 py-2 text-center text-slate-600">{item.delivered}</td>
                      <td className="px-2 py-2 text-center text-slate-600">{item.available}</td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="number"
                          value={item.thisChallan}
                          onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 0)}
                          className="w-16 text-center rounded border border-slate-200 px-1 py-0.5 text-[11px] outline-none focus:ring-1 focus:ring-blue-500"
                          min={0}
                          max={item.available}
                          disabled={!item.selected}
                        />
                      </td>
                      <td className="px-2 py-2 text-center text-slate-600">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
            ) : (
              <p className="text-[11px] text-slate-400 text-center py-6">Select a proforma invoice to load items.</p>
            )}
          </div>

          {/* Remarks & Terms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any remarks or notes here..."
                className={`${fieldClass} h-20 resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>Terms</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className={`${fieldClass} h-20 resize-none`}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedCount === 0}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <Truck size={14} />
            Create Challan
          </button>
        </div>
      </div>
    </div>
  );
}
