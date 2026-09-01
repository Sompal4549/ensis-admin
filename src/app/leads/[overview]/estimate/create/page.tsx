"use client";

import React, { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { invoiceApi, leadApi, Lead, Product, productApi, Category, categoryApi } from "@/lib/api";
import { toast } from "react-toastify";
import { fieldClass, labelClass } from "@/constants";

export default function CreateEstimatePage({ params }: { params: Promise<{ overview: string }> }) {
  const { overview: leadId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  const [saleType, setSaleType] = useState<"Intrastate" | "Interstate Sale" | "Foreign Sale">("Interstate Sale");

  // Billing
  const [billingName, setBillingName] = useState("");
  const [billingContactPerson, setBillingContactPerson] = useState("");
  const [billingMobile, setBillingMobile] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCountry, setBillingCountry] = useState("India");
  const [billingState, setBillingState] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingPinCode, setBillingPinCode] = useState("");
  const [billingGst, setBillingGst] = useState("");

  // Consignee
  const [consigneeName, setConsigneeName] = useState("");
  const [consigneeContactPerson, setConsigneeContactPerson] = useState("");
  const [consigneeMobile, setConsigneeMobile] = useState("");
  const [consigneeEmail, setConsigneeEmail] = useState("");
  const [consigneeAddress, setConsigneeAddress] = useState("");
  const [consigneeCountry, setConsigneeCountry] = useState("India");
  const [consigneeState, setConsigneeState] = useState("");
  const [consigneeCity, setConsigneeCity] = useState("");
  const [consigneePinCode, setConsigneePinCode] = useState("");
  const [consigneeGst, setConsigneeGst] = useState("");

  // Items
  const [items, setItems] = useState<Array<{
    category: string;
    description: string;
    stallType: string;
    hsn: string;
    qty: number;
    area: string;
    size: string;
    unit: string;
    rate: number;
    gstRate: number;
    discPercent: number;
  }>>([{
    category: "",
    description: "",
    stallType: "",
    hsn: "",
    qty: 1,
    area: "",
    size: "",
    unit: "Nos",
    rate: 0,
    gstRate: 18,
    discPercent: 0,
  }]);

  // Charges
  const [plcPercent, setPlcPercent] = useState(0);
  const [plcAmount, setPlcAmount] = useState(0);
  const [plcGst, setPlcGst] = useState(18);

  // Payment
  const [tdsApplicable, setTdsApplicable] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<"Full Payment" | "Instalment Plan">("Full Payment");

  useEffect(() => {
    leadApi.get(leadId).then((l) => {
      setLead(l);
      setBillingName(`${l.firstName} ${l.lastName}`);
      setBillingContactPerson(`${l.firstName} ${l.lastName}`);
      setBillingMobile(l.phone || "");
      setBillingEmail(l.email || "");
      setBillingAddress(l.addressLine || "");
      setBillingCity(l.city || "");
      setBillingState(l.state || "");
      setBillingCountry(l.country || "India");
      setBillingPinCode(l.zipCode || "");
    }).catch(() => {});
    productApi.list().then((res: any) => {
      setProducts(res.products || []);
    }).catch(() => {
      toast.error("Failed to load products");
    });
    categoryApi.list().then((res: any) => {
      setCategories(Array.isArray(res) ? res : res.categories || []);
    }).catch(() => {});
  }, [leadId]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    if (field === "description" && value) {
      const prod = products.find((p) => p.title === value);
      if (prod) {
        updated[idx].rate = prod.price;
        updated[idx].gstRate = prod.gstRate || 18;
      }
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, {
      category: "Exhibition Stall",
      description: "",
      stallType: "",
      hsn: "",
      qty: 1,
      area: "",
      size: "",
      unit: "Nos",
      rate: 0,
      gstRate: 18,
      discPercent: 0,
    }]);
  };

  const removeItem = (idx: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
  };

  const itemCalculations = items.map((item) => {
    const basicAmt = item.qty * item.rate;
    const gstAmt = (basicAmt * item.gstRate) / 100;
    const discAmt = (basicAmt * item.discPercent) / 100;
    const totalAmt = basicAmt + gstAmt - discAmt;
    return { basicAmt, gstAmt, discAmt, totalAmt };
  });

  const totalTaxableValue = itemCalculations.reduce((sum, c) => sum + c.basicAmt, 0);
  const totalDiscount = itemCalculations.reduce((sum, c) => sum + c.discAmt, 0);
  const totalGst = itemCalculations.reduce((sum, c) => sum + c.gstAmt, 0);
  const plcGstAmt = (plcAmount * plcGst) / 100;
  const finalAmount = totalTaxableValue - totalDiscount + totalGst + plcAmount + plcGstAmt;

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

  const handleSubmit = async () => {
    if (!billingName) { toast.error("Billing name is required"); return; }
    if (items.some((i) => !i.description || i.qty < 1)) { toast.error("Fill all item details"); return; }

    setLoading(true);
    try {
      await invoiceApi.create({
        lead: leadId,
        type: "proforma",
        items: items.map((item, idx) => ({
          name: item.description || item.category,
          quantity: item.qty,
          unitPrice: item.rate,
          gstRate: item.gstRate,
          amount: itemCalculations[idx].basicAmt,
        })),
        billingAddress: {
          name: billingName,
          email: billingEmail,
          phone: billingMobile,
          addressLine: billingAddress,
          city: billingCity,
          state: billingState,
          postalCode: billingPinCode,
          country: billingCountry,
          gstNumber: billingGst,
        },
        shippingAddress: {
          name: consigneeName || billingName,
          email: consigneeEmail || billingEmail,
          phone: consigneeMobile || billingMobile,
          addressLine: consigneeAddress || billingAddress,
          city: consigneeCity || billingCity,
          state: consigneeState || billingState,
          postalCode: consigneePinCode || billingPinCode,
          country: consigneeCountry || billingCountry,
          gstNumber: consigneeGst || billingGst,
        },
        subtotal: totalTaxableValue,
        discount: totalDiscount,
        tax: totalGst + plcGstAmt,
        shipping: 0,
        totalAmount: finalAmount,
      });
      toast.success("Estimate created");
      router.push(`/leads/${leadId}/estimate`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create estimate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-slate-800">Create Estimate</h1>
        </div>
      </div>

      <div className="space-y-3">
        {/* Section 1: Company, Billing & Consignee */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
          <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Company, Billing & Consignee Information</h2>

          {/* Estimate No & Date */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div>
              <label className={labelClass}>Estimate No.</label>
              <input value="NGW/26-27/PI/" disabled className={`${fieldClass} bg-slate-50`} />
            </div>
            <div>
              <label className={labelClass}>Supply Date *</label>
              <input type="date" value={new Date().toISOString().split("T")[0]} className={fieldClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Sale Type</label>
              <div className="flex gap-3 mt-0.5">
                {(["Intrastate", "Interstate Sale", "Foreign Sale"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-1.5 text-[10px] text-slate-600 cursor-pointer">
                    <input type="radio" name="saleType" checked={saleType === t} onChange={() => setSaleType(t)} className="accent-blue-600" />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Billing & Consignee Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Billing */}
            <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Company / Billing Details</p>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input value={billingName} onChange={(e) => setBillingName(e.target.value)} className={fieldClass} placeholder="Company name" />
                </div>
                <div>
                  <label className={labelClass}>Contact Person *</label>
                  <input value={billingContactPerson} onChange={(e) => setBillingContactPerson(e.target.value)} className={fieldClass} placeholder="Contact person" />
                </div>
                <div>
                  <label className={labelClass}>Mobile No.</label>
                  <input value={billingMobile} onChange={(e) => setBillingMobile(e.target.value)} className={fieldClass} placeholder="Mobile" />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} className={fieldClass} placeholder="Email" />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input value={billingState} onChange={(e) => setBillingState(e.target.value)} className={fieldClass} placeholder="State" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Address</label>
                  <input value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} className={fieldClass} placeholder="Address" />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className={fieldClass} placeholder="City" />
                </div>
                <div>
                  <label className={labelClass}>Pin Code</label>
                  <input value={billingPinCode} onChange={(e) => setBillingPinCode(e.target.value)} className={fieldClass} placeholder="Pin code" />
                </div>
                <div>
                  <label className={labelClass}>GSTIN / PAN</label>
                  <input value={billingGst} onChange={(e) => setBillingGst(e.target.value)} className={fieldClass} placeholder="GSTIN / PAN" />
                </div>
              </div>
            </div>

            {/* Consignee */}
            <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Consignee Details</p>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className={labelClass}>Consignee Name *</label>
                  <input value={consigneeName} onChange={(e) => setConsigneeName(e.target.value)} className={fieldClass} placeholder="Consignee name" />
                </div>
                <div>
                  <label className={labelClass}>Contact Person *</label>
                  <input value={consigneeContactPerson} onChange={(e) => setConsigneeContactPerson(e.target.value)} className={fieldClass} placeholder="Contact person" />
                </div>
                <div>
                  <label className={labelClass}>Mobile No. *</label>
                  <input value={consigneeMobile} onChange={(e) => setConsigneeMobile(e.target.value)} className={fieldClass} placeholder="Mobile" />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input value={consigneeEmail} onChange={(e) => setConsigneeEmail(e.target.value)} className={fieldClass} placeholder="Email" />
                </div>
                <div>
                  <label className={labelClass}>Country *</label>
                  <input value={consigneeCountry} onChange={(e) => setConsigneeCountry(e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <input value={consigneeState} onChange={(e) => setConsigneeState(e.target.value)} className={fieldClass} placeholder="State" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Consignee Address *</label>
                  <input value={consigneeAddress} onChange={(e) => setConsigneeAddress(e.target.value)} className={fieldClass} placeholder="Address" />
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input value={consigneeCity} onChange={(e) => setConsigneeCity(e.target.value)} className={fieldClass} placeholder="City" />
                </div>
                <div>
                  <label className={labelClass}>Pin Code *</label>
                  <input value={consigneePinCode} onChange={(e) => setConsigneePinCode(e.target.value)} className={fieldClass} placeholder="Pin code" />
                </div>
                <div>
                  <label className={labelClass}>GSTIN / UIN</label>
                  <input value={consigneeGst} onChange={(e) => setConsigneeGst(e.target.value)} className={fieldClass} placeholder="GSTIN / UIN" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Item & Pricing */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Item & Pricing Details</h2>
            <div className="flex gap-2">
              <button onClick={() => setCustomMode(false)} className={`px-3 py-1 rounded-lg text-[10px] font-semibold ${!customMode ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Default</button>
              <button onClick={() => {
                setCustomMode(true);
                setItems([{
                  category: "",
                  description: "",
                  stallType: "",
                  hsn: "",
                  qty: 1,
                  area: "",
                  size: "",
                  unit: "Nos",
                  rate: 0,
                  gstRate: 18,
                  discPercent: 0,
                }]);
              }} className={`px-3 py-1 rounded-lg text-[10px] font-semibold ${customMode ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Custom</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-1.5 py-1 text-left font-semibold text-slate-500">#</th>
                  <th className="px-1.5 py-1 text-left font-semibold text-slate-500">Item Category</th>
                  <th className="px-1.5 py-1 text-left font-semibold text-slate-500">Item Description</th>
                  <th className="px-1.5 py-1 text-left font-semibold text-slate-500">HSN No.</th>
                  <th className="px-1.5 py-1 text-center font-semibold text-slate-500">Qty.</th>
                  <th className="px-1.5 py-1 text-left font-semibold text-slate-500">Area</th>
                  <th className="px-1.5 py-1 text-left font-semibold text-slate-500">Size</th>
                  <th className="px-1.5 py-1 text-left font-semibold text-slate-500">Unit</th>
                  <th className="px-1.5 py-1 text-right font-semibold text-slate-500">Rate</th>
                  <th className="px-1.5 py-1 text-right font-semibold text-slate-500">Basic Amt</th>
                  <th className="px-1.5 py-1 text-right font-semibold text-slate-500">GST%</th>
                  <th className="px-1.5 py-1 text-right font-semibold text-slate-500">GST Amt</th>
                  <th className="px-1.5 py-1 text-right font-semibold text-slate-500">Disc%</th>
                  <th className="px-1.5 py-1 text-right font-semibold text-slate-500">Disc Amt</th>
                  <th className="px-1.5 py-1 text-right font-semibold text-slate-500">Total Amt</th>
                  <th className="px-1.5 py-1 text-center font-semibold text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const calc = itemCalculations[idx];
                  return (
                    <tr key={idx} className="border-b border-slate-50">
                      <td className="px-1.5 py-1 text-slate-500">{idx + 1}</td>
                      <td className="px-2 py-1.5">
                        {customMode ? (
                          <input value={item.category} onChange={(e) => updateItem(idx, "category", e.target.value)} className={`${fieldClass} min-w-[110px]`} placeholder="Category" />
                        ) : (
                          <select value={item.category} onChange={(e) => {
                            setProductsLoading(true);
                            updateItem(idx, "category", e.target.value);
                            updateItem(idx, "description", "");
                            setTimeout(() => setProductsLoading(false), 500);
                          }} className={`${fieldClass} min-w-[110px]`}>
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                              <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        {customMode ? (
                          <input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className={`${fieldClass} min-w-[140px]`} placeholder="Description" />
                        ) : (
                          <select
                            value={item.description}
                            onChange={(e) => updateItem(idx, "description", e.target.value)}
                            className={`${fieldClass} min-w-[140px]`}
                            disabled={!item.category || productsLoading}
                          >
                            <option value="">{productsLoading ? "Loading products..." : item.category ? "Select Product" : "Select Category first"}</option>
                            {!productsLoading && products
                              .filter((p) => {
                                if (!item.category) return false;
                                const pCat = typeof p.category === "object" ? p.category?.name : p.category;
                                return pCat === item.category;
                              })
                              .map((p) => (
                                <option key={p._id} value={p.title}>{p.title} — {fmt(p.price)}</option>
                              ))}
                          </select>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={item.hsn} onChange={(e) => updateItem(idx, "hsn", e.target.value)} className={`${fieldClass} w-16`} placeholder="HSN" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" value={item.qty} onChange={(e) => updateItem(idx, "qty", parseInt(e.target.value) || 1)} className={`${fieldClass} w-14 text-center`} min={1} />
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={item.area} onChange={(e) => updateItem(idx, "area", e.target.value)} className={`${fieldClass} w-16`} placeholder="Area" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={item.size} onChange={(e) => updateItem(idx, "size", e.target.value)} className={`${fieldClass} w-16`} placeholder="Size" />
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} className={`${fieldClass} w-16`}>
                          <option>Nos</option>
                          <option>Sq.ft</option>
                          <option>Sq.m</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" value={item.rate} onChange={(e) => updateItem(idx, "rate", parseFloat(e.target.value) || 0)} className={`${fieldClass} w-20 text-right`} min={0} />
                      </td>
                      <td className="px-2 py-1.5 text-right font-medium text-slate-700">{fmt(calc.basicAmt)}</td>
                      <td className="px-2 py-1.5">
                        <input type="number" value={item.gstRate} onChange={(e) => updateItem(idx, "gstRate", parseFloat(e.target.value) || 0)} className={`${fieldClass} w-14 text-right`} min={0} />
                      </td>
                      <td className="px-2 py-1.5 text-right text-slate-600">{fmt(calc.gstAmt)}</td>
                      <td className="px-2 py-1.5">
                        <input type="number" value={item.discPercent} onChange={(e) => updateItem(idx, "discPercent", parseFloat(e.target.value) || 0)} className={`${fieldClass} w-14 text-right`} min={0} />
                      </td>
                      <td className="px-2 py-1.5 text-right text-slate-600">{fmt(calc.discAmt)}</td>
                      <td className="px-2 py-1.5 text-right font-semibold text-slate-800">{fmt(calc.totalAmt)}</td>
                      <td className="px-2 py-1.5 text-center">
                        {items.length > 1 && (
                          <button onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button onClick={addItem} className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-[10px] font-semibold text-blue-600 hover:bg-blue-50">
            <Plus size={12} /> Add Item
          </button>
        </div>

        {/* Section 3: Charges & Payment Plan */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Charges & Payment Plan</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Additional Charges */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-3">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Additional Charges</p>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <label className={labelClass}>PLC Charges (%)</label>
                  <input type="number" value={plcPercent} onChange={(e) => {
                    const p = parseFloat(e.target.value) || 0;
                    setPlcPercent(p);
                    setPlcAmount((totalTaxableValue * p) / 100);
                  }} className={fieldClass} min={0} />
                </div>
                <div>
                  <label className={labelClass}>Amount</label>
                  <input type="number" value={plcAmount} onChange={(e) => setPlcAmount(parseFloat(e.target.value) || 0)} className={fieldClass} min={0} />
                </div>
                <div>
                  <label className={labelClass}>GST %</label>
                  <input type="number" value={plcGst} onChange={(e) => setPlcGst(parseFloat(e.target.value) || 0)} className={fieldClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>GST Amount</label>
                  <input value={fmt(plcGstAmt)} disabled className={`${fieldClass} bg-white`} />
                </div>
                <div>
                  <label className={labelClass}>PLC Final Amount</label>
                  <input value={fmt(plcAmount + plcGstAmt)} disabled className={`${fieldClass} bg-white`} />
                </div>
              </div>
              <p className="text-[9px] text-slate-400">For: {lead ? `${lead.firstName} ${lead.lastName}` : "-"}</p>
            </div>

            {/* Payment Plan */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>TDS Applicable *</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input type="radio" name="tds" checked={tdsApplicable} onChange={() => setTdsApplicable(true)} className="accent-blue-600" />
                    Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input type="radio" name="tds" checked={!tdsApplicable} onChange={() => setTdsApplicable(false)} className="accent-blue-600" />
                    No
                  </label>
                </div>
                {tdsApplicable && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-[11px] font-semibold text-amber-800 mb-1">TDS Deduction (Section 194C)</p>
                    <p className="text-[10px] text-amber-700 leading-relaxed">
                      TDS shall be deducted on the basic value only (excluding GST). Applicable rate: 2% for Companies/Firms/other entities and 1% for Individual/HUF.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Payment Plan *</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input type="radio" name="payment" checked={paymentPlan === "Full Payment"} onChange={() => setPaymentPlan("Full Payment")} className="accent-blue-600" />
                    Full Payment
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input type="radio" name="payment" checked={paymentPlan === "Instalment Plan"} onChange={() => setPaymentPlan("Instalment Plan")} className="accent-blue-600" />
                    Instalment Plan
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 text-[10px] text-slate-500 leading-relaxed space-y-1">
                <p><strong>Payment Terms</strong></p>
                <p>1. Advance Payment – 100%: Full payment is payable in advance on the same day of Estimate generation.</p>
                <p>2. TDS under Section 194C shall be deducted on the basic value only (excluding GST). Applicable rate: 2% for Companies/Firms/other entities and 1% for Individual/HUF.</p>
                <p>3. Please share the applicable TDS Certificate (Form 16A) after deduction.</p>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-4 bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Taxable Value</span>
                <span className="font-bold text-slate-800">{fmt(totalTaxableValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Discount</span>
                <span className="font-bold text-red-600">- {fmt(totalDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST Total ({items[0]?.gstRate || 18}%)</span>
                <span className="font-bold text-slate-800">{fmt(totalGst + plcGstAmt)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-800">Final Amount</span>
                <span className="font-bold text-lg text-slate-800">{fmt(finalAmount)}</span>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              <strong>Amount In Words:</strong> {amountInWords(finalAmount)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <button onClick={() => router.back()} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Generate Estimate
          </button>
        </div>
      </div>
    </div>
  );
}
