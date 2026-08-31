"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Loader2, UserPlus, Save, ChevronDown, Plus } from "lucide-react";
import { leadApi, adminApi, AuthUser } from "@/lib/api";

const LEAD_TYPES = ["Individual", "Corporate"];
const LEAD_SOURCES = ["Instagram", "Facebook", "Website", "WhatsApp", "Google", "LinkedIn", "Referral", "Cold Call", "Event", "Other"];
const TYPE_OF_BUSINESS = ["Manufacturing", "Trading", "Service", "IT", "Healthcare", "Education", "Real Estate", "Other"];
const INDUSTRY_SECTOR = ["Construction", "Interior Design", "Architecture", "Automobile", "Electronics", "Textile", "Food & Beverage", "Pharmaceutical", "Other"];
const TITLES = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];

const inputClass = "w-full rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[9px] outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 placeholder:text-gray-400 placeholder:text-[9px]";
const selectClass = `${inputClass} appearance-none pr-7 text-gray-700`;
const dateClass = `${inputClass}`;

function FormSelect({ name, value, onChange, placeholder, children }: { name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; placeholder?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select name={name} value={value} onChange={onChange} className={selectClass}>
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

interface ContactPerson {
  title: string;
  firstName: string;
  surname: string;
  designation: string;
  email: string;
  phone: string;
  altPhone: string;
}

const emptyContact: ContactPerson = { title: "", firstName: "", surname: "", designation: "", email: "", phone: "", altPhone: "" };

const initialForm = {
  companyName: "",
  typeOfBusiness: "",
  industrySector: "",
  website: "",
  officialEmail: "",
  landline: "",
  marketType: "Domestic" as "Domestic" | "International",
  addressLine: "",
  country: "India",
  zipCode: "",
  state: "",
  city: "",
  contacts: [{ ...emptyContact }] as ContactPerson[],
  leadSource: "Event" as const,
  eventAttribution: "",
  leadDate: "",
  assignedTo: "",
  followUpDate: "",
};

export default function AddLeadPage() {
  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminApi.listUsers().then(setUsers).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContactChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const updated = [...form.contacts];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setForm({ ...form, contacts: updated });
  };

  const addContact = () => {
    setForm({ ...form, contacts: [...form.contacts, { ...emptyContact }] });
  };

  const removeContact = (index: number) => {
    if (form.contacts.length <= 1) return;
    const updated = form.contacts.filter((_, i) => i !== index);
    setForm({ ...form, contacts: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const firstContact = form.contacts[0];
    if (!firstContact.firstName || !firstContact.email || !firstContact.phone) {
      toast.error("Please fill all required contact fields");
      return;
    }
    if (!form.companyName) {
      toast.error("Company name is required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        companyName: form.companyName,
        typeOfBusiness: form.typeOfBusiness,
        industrySector: form.industrySector,
        website: form.website,
        officialEmail: form.officialEmail,
        landline: form.landline,
        marketType: form.marketType,
        firstName: firstContact.firstName,
        lastName: firstContact.surname,
        title: firstContact.title,
        designation: firstContact.designation,
        email: firstContact.email,
        phone: firstContact.phone,
        altPhone: firstContact.altPhone,
        addressLine: form.addressLine,
        country: form.country,
        zipCode: form.zipCode,
        state: form.state,
        city: form.city,
        leadSource: form.leadSource,
        eventAttribution: form.eventAttribution,
        leadDate: form.leadDate,
        assignedTo: form.assignedTo,
        followUpDate: form.followUpDate,
        leadType: "Corporate" as const,
        leadStatus: "New" as const,
        priority: "High" as const,
      };
      await leadApi.create(payload);
      toast.success("Lead created successfully");
      setForm(initialForm);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create lead";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><UserPlus size={18} /></div>
          <h1 className="text-xs font-bold">Create New Lead</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Company Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-green-800">Company Information</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                <input type="radio" name="marketType" value="Domestic" checked={form.marketType === "Domestic"} onChange={handleChange} className="accent-green-700" />
                <span className="font-medium">DOMESTIC</span>
              </label>
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                <input type="radio" name="marketType" value="International" checked={form.marketType === "International"} onChange={handleChange} className="accent-green-700" />
                <span className="font-medium">INTERNATIONAL</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
              <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Write Here.." className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Type Of Business <span className="text-red-500">*</span></label>
              <FormSelect name="typeOfBusiness" value={form.typeOfBusiness} onChange={handleChange} placeholder="Select Here">
                {TYPE_OF_BUSINESS.map((t) => <option key={t} value={t}>{t}</option>)}
              </FormSelect>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Industry / Sector <span className="text-red-500">*</span></label>
              <FormSelect name="industrySector" value={form.industrySector} onChange={handleChange} placeholder="Select Here">
                {INDUSTRY_SECTOR.map((s) => <option key={s} value={s}>{s}</option>)}
              </FormSelect>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Company Website <span className="text-gray-400 text-[10px] font-normal">(Optional)</span></label>
              <input name="website" value={form.website} onChange={handleChange} placeholder="Write Here.." className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Official Email <span className="text-red-500">*</span></label>
              <input name="officialEmail" type="email" value={form.officialEmail} onChange={handleChange} placeholder="Write Here.." className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Landline No. <span className="text-gray-400 text-[10px] font-normal">(Optional)</span></label>
              <input name="landline" value={form.landline} onChange={handleChange} placeholder="Write Here.." className={inputClass} />
            </div>
          </div>
        </div>

        {/* Location & Address */}
        <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-3 mb-0">
          <h2 className="text-xs font-semibold text-green-800 mb-2">Location & Address</h2>
          <div className={`grid grid-cols-2 gap-2 ${form.marketType === "Domestic" ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Full Address <span className="text-red-500">*</span></label>
              <input name="addressLine" value={form.addressLine} onChange={handleChange} placeholder="Write Here.." className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
              <input name="country" value={form.country} onChange={handleChange} placeholder="Write Here.." className={inputClass} />
            </div>
            {form.marketType === "Domestic" && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Pin Code <span className="text-red-500">*</span></label>
                <input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="Write Here.." className={inputClass} />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
              <FormSelect name="state" value={form.state} onChange={handleChange} placeholder="Select State">
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
              </FormSelect>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">City / Town <span className="text-red-500">*</span></label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="Write Here.." className={inputClass} />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-3 mb-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-green-800">Contact Details</h2>
            <button type="button" onClick={addContact} className="flex items-center justify-center w-7 h-7 rounded bg-green-600 text-white hover:bg-green-700 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          {form.contacts.map((contact, index) => (
            <div key={index} className="mb-4 last:mb-0">
              {form.contacts.length > 1 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-gray-500">Contact {index + 1}</span>
                  <button type="button" onClick={() => removeContact(index)} className="text-[10px] text-red-500 hover:text-red-700">Remove</button>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="title" value={contact.title} onChange={(e) => handleContactChange(index, e)} className={selectClass}>
                      <option value="">Select</option>
                      {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input name="firstName" value={contact.firstName} onChange={(e) => handleContactChange(index, e)} placeholder="Write Here.." className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Surname <span className="text-gray-400 text-[10px] font-normal">(Optional)</span></label>
                  <input name="surname" value={contact.surname} onChange={(e) => handleContactChange(index, e)} placeholder="Write Here.." className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Designation <span className="text-gray-400 text-[10px] font-normal">(Optional)</span></label>
                  <input name="designation" value={contact.designation} onChange={(e) => handleContactChange(index, e)} placeholder="Write Here.." className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input name="email" type="email" value={contact.email} onChange={(e) => handleContactChange(index, e)} placeholder="Write Here.." className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Mobile No. <span className="text-red-500">*</span></label>
                  <input name="phone" value={contact.phone} onChange={(e) => handleContactChange(index, e)} placeholder="Write Here.." className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Alternate No. <span className="text-gray-400 text-[10px] font-normal">(Optional)</span></label>
                  <input name="altPhone" value={contact.altPhone} onChange={(e) => handleContactChange(index, e)} placeholder="Write Here.." className={inputClass} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CRM & Tracking */}
        <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-3 mb-3">
          <h2 className="text-xs font-semibold text-green-800 mb-2">CRM & Tracking</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Data Source <span className="text-red-500">*</span></label>
              <FormSelect name="leadSource" value={form.leadSource} onChange={handleChange} placeholder="Select Source">
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </FormSelect>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Event Attribution <span className="text-red-500">*</span></label>
              <input name="eventAttribution" value={form.eventAttribution} onChange={handleChange} placeholder="Write Here.." className={inputClass} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Lead Date <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="leadDate" value={form.leadDate} onChange={handleChange} className={dateClass} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Assigned To <span className="text-red-500">*</span></label>
              <FormSelect name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Select User">
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </FormSelect>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Follow Up Date <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="followUpDate" value={form.followUpDate} onChange={handleChange} className={dateClass} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-red-600">(*) REQUIRED FIELDS *</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm(initialForm)} className="px-4 py-1 rounded-lg border border-gray-300 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              RESET FORM
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-1 rounded-lg bg-green-900 text-white text-[10px] font-bold hover:bg-green-950 transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
              SAVE REGISTRATION →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
