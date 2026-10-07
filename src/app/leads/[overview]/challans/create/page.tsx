"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { ArrowLeft, Loader2, Truck, FileText, Calendar, Target, Car, User, CalendarDays, Hash, Tag, MapPin, Map, Building2, Phone, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { invoiceApi, Invoice, Lead, leadApi } from "@/lib/api";
import { toast } from "react-toastify";
import { labelClass, fieldClass, cardClass } from "@/constants";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function CreateChallanPage({ params }: { params: Promise<{ overview: string }> }) {
  const { overview: leadId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const estimateIdFromUrl = searchParams.get("estimate");

  const [estimates, setEstimates] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEstimateId, setSelectedEstimateId] = useState<string>(estimateIdFromUrl || "");
  const activeEstimate = estimates.find((e) => e._id === selectedEstimateId) || null;

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

  const billAddr = activeEstimate?.billingAddress || ({} as any);
  const shipAddr = activeEstimate?.shippingAddress || billAddr;

  const selectedCount = selectedItems.filter((i) => i.selected).length;
  const totalSelectedQty = selectedItems.filter((i) => i.selected).reduce((sum, i) => sum + i.thisChallan, 0);

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoiceApi.listByLead(leadId, 1, 200);
      const proformas = (res.invoices || []).filter((inv) => inv.type === "proforma");
      setEstimates(proformas);
      if (estimateIdFromUrl && proformas.find((inv) => inv._id === estimateIdFromUrl)) {
        setSelectedEstimateId(estimateIdFromUrl);
      }
    } catch {
      toast.error("Failed to load estimates");
    } finally {
      setLoading(false);
    }
  }, [leadId, estimateIdFromUrl]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

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
    setSubmitting(true);
    try {
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
      router.push(`/leads/${leadId}/challans`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create challan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={20} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800 uppercase tracking-wider">Create Delivery Challan</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">One proforma can have multiple challans. Only remaining quantities can be delivered.</p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-3">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><FileText size={11} /> Source Proforma Invoice *</label>
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
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><Calendar size={11} /> Challan Date *</label>
            <input type="date" value={challanDate} onChange={(e) => setChallanDate(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><Truck size={11} /> Challan Type</label>
            <select value={challanType} onChange={(e) => setChallanType(e.target.value)} className={fieldClass}>
              <option>Outward</option>
              <option>Inward</option>
              <option>Return</option>
              <option>Gate Pass</option>
            </select>
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><Target size={11} /> Purpose</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={fieldClass}>
              <option>Exhibition / Trade Show</option>
              <option>Corporate Event</option>
              <option>Product Launch</option>
              <option>Stage / Backdrop Setup</option>
              <option>Branding & Signage</option>
              <option>Installation / On-site</option>
              <option>Testing / Quality Check</option>
              <option>Repair / Maintenance</option>
              <option>Client Demo</option>
              <option>Internal Use</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-3">
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><Car size={11} /> Vehicle No.</label>
            <input type="text" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="Enter vehicle number" className={fieldClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><User size={11} /> Transporter</label>
            <input type="text" value={transporter} onChange={(e) => setTransporter(e.target.value)} placeholder="Transporter name" className={fieldClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><CalendarDays size={11} /> Event Name</label>
            <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Enter event name" className={fieldClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><Hash size={11} /> PO / Reference No.</label>
            <input type="text" value={poRefNo} onChange={(e) => setPoRefNo(e.target.value)} placeholder="Enter reference number" className={fieldClass} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-3">
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><Tag size={11} /> Type of Sale</label>
            <select value={typeOfSale} onChange={(e) => setTypeOfSale(e.target.value)} className={fieldClass}>
              <option value="">Select Type</option>
              <option>Local</option>
              <option>Inner-State</option>
              <option>Export</option>
              <option>Import</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><MapPin size={11} /> Shipped To</label>
            <input type="text" value={shippedTo} onChange={(e) => setShippedTo(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><Map size={11} /> State Code</label>
            <input type="text" value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><Hash size={11} /> Bilty No.</label>
            <input type="text" value={biltyNo} onChange={(e) => setBiltyNo(e.target.value)} placeholder="Enter bilty number" className={fieldClass} />
          </div>
        </div>
      </div>

      {/* Client & Delivery Details */}
      <div className={`${cardClass} mb-3`}>
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
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-3">
              <div>
                <label className={`${labelClass} flex items-center gap-1`}><Building2 size={11} /> Company Name</label>
                <div className={fieldClass}>{billAddr.name || "-"}</div>
              </div>
              <div>
                <label className={`${labelClass} flex items-center gap-1`}><Hash size={11} /> GSTIN</label>
                <div className={fieldClass}>{billAddr.gstNumber || "-"}</div>
              </div>
              <div>
                <label className={`${labelClass} flex items-center gap-1`}><User size={11} /> Contact Person</label>
                <div className={fieldClass}>{billAddr.name || "-"}</div>
              </div>
              <div>
                <label className={`${labelClass} flex items-center gap-1`}><Phone size={11} /> Contact Phone</label>
                <div className={fieldClass}>{billAddr.phone || "-"}</div>
              </div>
              <div>
                <label className={`${labelClass} flex items-center gap-1`}><Mail size={11} /> Company Email</label>
                <div className={fieldClass}>{billAddr.email || "-"}</div>
              </div>
              <div>
                <label className={`${labelClass} flex items-center gap-1`}><Mail size={11} /> Contact Email</label>
                <div className={fieldClass}>{billAddr.email || "-"}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`${labelClass} flex items-center gap-1`}><MapPin size={11} /> Company Address</label>
                <div className={fieldClass}>{billAddr.addressLine || "-"}, {billAddr.city || ""} {billAddr.state || ""} {billAddr.postalCode || ""}</div>
              </div>
              <div>
                <label className={`${labelClass} flex items-center gap-1`}><MapPin size={11} /> Delivery Address</label>
                <div className={fieldClass}>{shipAddr.addressLine || billAddr.addressLine || "-"}</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 text-center py-4">Select a proforma invoice to load client details.</p>
        )}
      </div>

      {/* Select Items */}
      <div className={`${cardClass} mb-3`}>
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
      <div className={`${cardClass} mb-3`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><MessageSquare size={11} /> Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks or notes here..."
              className={`${fieldClass} h-8 min-h-[32px] resize-y`}
            />
          </div>
          <div>
            <label className={`${labelClass} flex items-center gap-1`}><FileText size={11} /> Terms</label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className={`${fieldClass} h-8 min-h-[32px] resize-y`}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => router.back()}
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
          disabled={submitting || !activeEstimate || selectedCount === 0}
          className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          <Truck size={14} />
          Create Challan
        </button>
      </div>
    </div>
  );
}
