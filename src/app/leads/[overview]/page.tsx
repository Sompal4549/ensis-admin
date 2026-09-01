"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  Loader2, ArrowLeft, Save, Pencil, X, Building2,
  History, ShieldPlus, PencilLine, Trash2, ChevronDown as ChevronDownIcon,
  MessageSquare, Phone, Mail, FileText, Send, Clock,
  Smartphone, Briefcase, CalendarDays, Tag, User, Globe, MapPin, Plus, Eye
} from "lucide-react";
import Link from "next/link";
import { leadApi, Lead, AuthUser, adminApi, activityLogApi, ActivityLog, ActivityAction } from "@/lib/api";
import { labelClass, fieldClass } from "@/constants";

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Negotiation", "Converted", "Lost"];
const PRIORITIES = ["High", "Medium", "Low"];
const LEAD_SOURCES = ["Instagram", "Facebook", "Website", "WhatsApp", "Google", "LinkedIn", "Referral", "Cold Call", "Event", "Other"];
const LEAD_TYPES = ["Individual", "Corporate"];
const TYPE_OF_BUSINESS = ["Manufacturing", "Trading", "Service", "IT", "Healthcare", "Education", "Real Estate", "Other"];
const INDUSTRY_SECTOR = ["Construction", "Interior Design", "Architecture", "Automobile", "Electronics", "Textile", "Food & Beverage", "Pharmaceutical", "Other"];
const TITLES = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];

const modalFieldClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400";
const modalSelectClass = `${modalFieldClass} appearance-none pr-6`;

function ModalSelect({ name, value, onChange, placeholder, children }: { name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; placeholder?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select name={name} value={value} onChange={onChange} className={modalSelectClass}>
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDownIcon size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

const COMM_TABS = [
  { key: "all", label: "All" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "calls", label: "Calls" },
  { key: "emails", label: "Emails" },
  { key: "logs", label: "Logs/Status" },
];

const QUICK_ACTIONS = [
  { icon: FileText, label: "Proposals / Brouchers", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: FileText, label: "Documentation", color: "text-indigo-600", bg: "bg-indigo-50" },
  { icon: Building2, label: "Account", color: "text-emerald-600", bg: "bg-emerald-50", href: "account" },
  { icon: User, label: "Contact Details", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Smartphone, label: "WhatsApp Chat", color: "text-green-600", bg: "bg-green-50" },
  { icon: Mail, label: "Email", color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Phone, label: "Call", color: "text-cyan-600", bg: "bg-cyan-50" },
  { icon: Briefcase, label: "PMS Application", color: "text-rose-600", bg: "bg-rose-50" },
];

export default function LeadDetailPage({ params }: { params: Promise<{ overview: string }> }) {
  const { overview: leadId } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityLoading, setActivityLoading] = useState(true);
  const [expandedChanges, setExpandedChanges] = useState<string | null>(null);
  const [commTab, setCommTab] = useState("all");

  const [form, setForm] = useState({
    firstName: "", lastName: "", companyName: "", designation: "", email: "", officialEmail: "", phone: "", phoneCode: "+91",
    altPhone: "", altPhoneCode: "+91", landline: "", website: "", title: "", typeOfBusiness: "", industrySector: "",
    marketType: "Domestic" as "Domestic" | "International",
    leadType: "", leadSource: "", leadStatus: "", priority: "",
    leadCategory: "" as "hot" | "cold" | "", assignedTo: "",
    eventAttribution: "", leadDate: "",
    addressLine: "", city: "", state: "", country: "India", zipCode: "",
    leadNotes: "",
  });

  const [statusForm, setStatusForm] = useState({
    statusUpdate: "New",
    nextAction: "",
    forwardTo: "",
    followUpDate: "",
    remark: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadData, usersData] = await Promise.all([leadApi.get(leadId), adminApi.listUsers()]);
        setLead(leadData);
        setUsers(usersData);
        setForm({
          firstName: leadData.firstName, lastName: leadData.lastName, companyName: leadData.companyName || "",
          designation: leadData.designation || "", email: leadData.email, officialEmail: leadData.officialEmail || "",
          phone: leadData.phone, phoneCode: leadData.phoneCode || "+91", altPhone: leadData.altPhone || "",
          altPhoneCode: leadData.altPhoneCode || "+91", landline: leadData.landline || "", website: leadData.website || "",
          title: leadData.title || "", typeOfBusiness: leadData.typeOfBusiness || "", industrySector: leadData.industrySector || "",
          marketType: leadData.marketType || "Domestic", leadType: leadData.leadType, leadSource: leadData.leadSource,
          leadStatus: leadData.leadStatus, priority: leadData.priority, leadCategory: leadData.leadCategory || "",
          assignedTo: typeof leadData.assignedTo === "object" ? leadData.assignedTo?._id || "" : leadData.assignedTo || "",
          eventAttribution: leadData.eventAttribution || "", leadDate: leadData.leadDate || "",
          addressLine: leadData.addressLine || "", city: leadData.city || "", state: leadData.state || "",
          country: leadData.country || "India", zipCode: leadData.zipCode || "", leadNotes: leadData.leadNotes || "",
        });
        setStatusForm((prev) => ({
          ...prev,
          statusUpdate: leadData.leadStatus || "New",
          forwardTo: typeof leadData.assignedTo === "object" ? leadData.assignedTo?._id || "" : leadData.assignedTo || "",
        }));
      } catch {
        toast.error("Failed to load lead");
        router.push("/leads");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [leadId, router]);

  const fetchActivityLogs = useCallback(async () => {
    setActivityLoading(true);
    try {
      const data = await activityLogApi.list({ entity: "Lead", entityId: leadId, limit: 50 });
      setActivityLogs(data.logs || []);
      setActivityTotal(data.total || 0);
    } catch {} finally {
      setActivityLoading(false);
    }
  }, [leadId]);

  useEffect(() => { fetchActivityLogs(); }, [fetchActivityLogs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setStatusForm({ ...statusForm, [e.target.name]: e.target.value });

  const openModal = () => {
    if (lead) {
      setForm({
        firstName: lead.firstName, lastName: lead.lastName, companyName: lead.companyName || "",
        designation: lead.designation || "", email: lead.email, officialEmail: lead.officialEmail || "",
        phone: lead.phone, phoneCode: lead.phoneCode || "+91", altPhone: lead.altPhone || "",
        altPhoneCode: lead.altPhoneCode || "+91", landline: lead.landline || "", website: lead.website || "",
        title: lead.title || "", typeOfBusiness: lead.typeOfBusiness || "", industrySector: lead.industrySector || "",
        marketType: lead.marketType || "Domestic", leadType: lead.leadType, leadSource: lead.leadSource,
        leadStatus: lead.leadStatus, priority: lead.priority, leadCategory: lead.leadCategory || "",
        assignedTo: typeof lead.assignedTo === "object" ? lead.assignedTo?._id || "" : lead.assignedTo || "",
        eventAttribution: lead.eventAttribution || "", leadDate: lead.leadDate || "",
        addressLine: lead.addressLine || "", city: lead.city || "", state: lead.state || "",
        country: lead.country || "India", zipCode: lead.zipCode || "", leadNotes: lead.leadNotes || "",
      });
    }
    setShowModal(true);
  };

  const handleSaveModal = async () => {
    setSaving(true);
    try {
      await leadApi.update(leadId, {
        ...form, leadType: form.leadType as Lead["leadType"], leadSource: form.leadSource as Lead["leadSource"],
        leadStatus: form.leadStatus as Lead["leadStatus"], priority: form.priority as Lead["priority"],
        leadCategory: form.leadCategory as "hot" | "cold", marketType: form.marketType,
      });
      setLead((prev) => prev ? { ...prev, ...form as Partial<Lead> } : prev);
      setShowModal(false);
      toast.success("Lead updated");
    } catch { toast.error("Failed to update"); } finally { setSaving(false); }
  };

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      await leadApi.update(leadId, {
        leadStatus: statusForm.statusUpdate as Lead["leadStatus"],
        assignedTo: statusForm.forwardTo,
        followUpDate: statusForm.followUpDate,
        leadNotes: statusForm.remark || form.leadNotes,
      });
      setLead((prev) => prev ? { ...prev, leadStatus: statusForm.statusUpdate as Lead["leadStatus"], assignedTo: statusForm.forwardTo } : prev);
      setForm((prev) => ({ ...prev, leadStatus: statusForm.statusUpdate, leadNotes: statusForm.remark || prev.leadNotes }));
      setStatusForm((prev) => ({ ...prev, remark: "" }));
      toast.success("Status updated");
      fetchActivityLogs();
    } catch { toast.error("Failed to update"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={20} className="animate-spin text-emerald-600" /></div>;
  if (!lead) return null;

  const getAssignedName = () => {
    if (!lead.assignedTo) return "-";
    if (typeof lead.assignedTo === "object") return lead.assignedTo.name;
    const u = users.find((u) => u._id === lead.assignedTo);
    return u ? u.name : "-";
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const ACTION_META: Record<ActivityAction, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    create: { label: "Created", color: "text-emerald-600", bg: "bg-emerald-100", icon: <ShieldPlus size={11} /> },
    update: { label: "Updated", color: "text-blue-600", bg: "bg-blue-100", icon: <PencilLine size={11} /> },
    delete: { label: "Deleted", color: "text-red-600", bg: "bg-red-100", icon: <Trash2 size={11} /> },
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                {lead.firstName[0]}{lead.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-sm font-bold text-slate-800">{lead.firstName} {lead.lastName}</h2>
                  <button onClick={openModal} className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-500"><Pencil size={11} /></button>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] text-red-500 font-medium">{lead.eventAttribution || "No Event"}</span>
                  <span className="text-[9px] text-emerald-600 font-medium">New Lead From {lead.leadSource || "Social Media"}</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  {(lead.designation || lead.companyName) && (
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><User size={7} className="text-emerald-600" /></div>
                      <span>{[lead.designation, lead.companyName].filter(Boolean).join(" / ")}{lead.phone ? ` - ${lead.phoneCode} ${lead.phone}` : ""}</span>
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Mail size={10} className="text-slate-400 shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  )}
                  {lead.officialEmail && lead.officialEmail !== lead.email && (
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Mail size={10} className="text-slate-400 shrink-0" />
                      <span className="truncate">{lead.officialEmail}</span>
                      <span className="text-[8px] text-slate-400">(Official)</span>
                    </div>
                  )}
                  {lead.website && (
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Globe size={10} className="text-slate-400 shrink-0" />
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">{lead.website}</a>
                    </div>
                  )}
                  {lead.companyName && (
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Building2 size={10} className="text-slate-400 shrink-0" />
                      <span className="truncate">{lead.companyName}</span>
                    </div>
                  )}
                  {(lead.addressLine || lead.city || lead.state || lead.country) && (
                    <div className="flex items-start gap-1.5 text-slate-700 font-medium">
                      <MapPin size={10} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{[lead.addressLine, lead.city, lead.state, lead.zipCode, lead.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>
                {/* Additional Details */}
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                  {lead.title && <div className="flex items-center gap-1 text-slate-600 font-medium"><User size={9} className="text-slate-400 shrink-0" />{lead.title}</div>}
                  {lead.typeOfBusiness && <div className="flex items-center gap-1 text-slate-600 font-medium"><Briefcase size={9} className="text-slate-400 shrink-0" />{lead.typeOfBusiness}</div>}
                  {lead.industrySector && <div className="flex items-center gap-1 text-slate-600 font-medium"><Building2 size={9} className="text-slate-400 shrink-0" />{lead.industrySector}</div>}
                  {lead.marketType && <div className="flex items-center gap-1 text-slate-600 font-medium"><Globe size={9} className="text-slate-400 shrink-0" />{lead.marketType}</div>}
                  {lead.leadType && <div className="flex items-center gap-1 text-slate-600 font-medium"><Tag size={9} className="text-slate-400 shrink-0" />{lead.leadType}</div>}
                  {lead.altPhone && <div className="flex items-center gap-1 text-slate-600 font-medium"><Phone size={9} className="text-slate-400 shrink-0" />{lead.altPhoneCode} {lead.altPhone}</div>}
                  {lead.landline && <div className="flex items-center gap-1 text-slate-600 font-medium"><Phone size={9} className="text-slate-400 shrink-0" />{lead.landline}</div>}
                  {lead.priority && <div className="flex items-center gap-1 text-slate-600 font-medium"><Tag size={9} className="text-slate-400 shrink-0" />{lead.priority}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards - Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2.5 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-0.5 bg-blue-50 rounded"><Briefcase size={12} className="text-blue-500" /></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase">Industry / Sector</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700">{lead.industrySector || "--"}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2.5 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-0.5 bg-blue-50 rounded"><CalendarDays size={12} className="text-blue-500" /></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase">Lead Date</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700">{lead.leadDate ? new Date(lead.leadDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "--"}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2.5 border-l-4 border-l-emerald-500 relative">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-0.5 bg-emerald-50 rounded"><Tag size={12} className="text-emerald-500" /></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase">Lead Type</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700">{lead.leadType || "--"}</p>
              <button onClick={openModal} className="absolute top-2 right-2 p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-500"><Pencil size={9} /></button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2.5 border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-0.5 bg-emerald-50 rounded"><Tag size={12} className="text-emerald-500" /></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase">Client Status</span>
              </div>
              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                lead.leadStatus === "New" ? "bg-blue-100 text-blue-700" :
                lead.leadStatus === "Contacted" ? "bg-purple-100 text-purple-700" :
                lead.leadStatus === "Qualified" ? "bg-emerald-100 text-emerald-700" :
                lead.leadStatus === "Negotiation" ? "bg-orange-100 text-orange-700" :
                lead.leadStatus === "Converted" ? "bg-green-100 text-green-700" :
                "bg-slate-100 text-slate-600"
              }`}>{lead.leadStatus}</span>
            </div>
          </div>

          {/* Info Cards - Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-0.5 bg-purple-50 rounded"><Smartphone size={12} className="text-purple-500" /></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase">Data Source</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700">{lead.leadSource || "--"}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-0.5 bg-orange-50 rounded"><Tag size={12} className="text-orange-500" /></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase">Priority</span>
              </div>
              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                lead.priority === "High" ? "bg-red-100 text-red-700" :
                lead.priority === "Medium" ? "bg-amber-100 text-amber-700" :
                "bg-slate-100 text-slate-600"
              }`}>{lead.priority || "--"}</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-0.5 bg-cyan-50 rounded"><User size={12} className="text-cyan-500" /></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase">Assigned To</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700">{getAssignedName()}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="p-0.5 bg-rose-50 rounded"><CalendarDays size={12} className="text-rose-500" /></div>
                <span className="text-[8px] font-bold text-slate-500 uppercase">Follow Up Date</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700">{lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "--"}</p>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((item) => (
              <Link
                key={item.label}
                href={item.href ? `/leads/${leadId}/${item.href}` : "#"}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left group"
              >
                <div className={`p-1.5 rounded-md ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon size={13} />
                </div>
                <span className="text-[9px] font-bold text-slate-700 truncate">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Lead Status Updates */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-3">
            <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Lead Status Updates</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Status Update</label>
                <div className="relative">
                  <select name="statusUpdate" value={statusForm.statusUpdate} onChange={handleStatusChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 appearance-none pr-6">
                    {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDownIcon size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Next Action</label>
                <div className="relative">
                  <select name="nextAction" value={statusForm.nextAction} onChange={handleStatusChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 appearance-none pr-6">
                    <option value="">Select Next Action</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="meeting">Meeting</option>
                    <option value="call">Call</option>
                    <option value="email">Send Email</option>
                    <option value="proposal">Send Proposal</option>
                  </select>
                  <ChevronDownIcon size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Forward To</label>
                <div className="relative">
                  <select name="forwardTo" value={statusForm.forwardTo} onChange={handleStatusChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500 appearance-none pr-6">
                    {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                  <ChevronDownIcon size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Follow Up Date</label>
                <input type="datetime-local" name="followUpDate" value={statusForm.followUpDate} onChange={handleStatusChange} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Remark</label>
                <textarea
                  name="remark"
                  value={statusForm.remark}
                  onChange={handleStatusChange}
                  rows={1}
                  placeholder="Write your remark here..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 resize-none placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={handleUpdateStatus}
                disabled={saving}
                className="self-end flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Chat & Communication */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
            <div className="px-3 py-2 border-b border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Chat & Communication</h3>
            </div>
            <div className="flex border-b border-slate-100">
              {COMM_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCommTab(tab.key)}
                  className={`flex-1 py-1.5 font-bold transition-colors ${
                    commTab === tab.key
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                  style={{ fontSize: "10px" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-2">
              {activityLoading ? (
                <div className="flex justify-center py-6"><Loader2 size={14} className="animate-spin text-blue-500" /></div>
              ) : activityLogs.length === 0 ? (
                <div className="text-center py-6">
                  <Clock size={20} className="mx-auto text-slate-200 mb-1" />
                  <p className="text-[9px] font-medium text-slate-400">No communication yet</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {activityLogs.slice(0, 10).map((log) => {
                    const meta = ACTION_META[log.action] ?? ACTION_META.update;
                    return (
                      <div key={log._id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`p-0.5 rounded ${meta.bg} ${meta.color}`}>{meta.icon}</div>
                          <span className="text-[9px] font-bold text-slate-700 uppercase">Status</span>
                          <span className="text-[9px] font-medium text-slate-400 ml-auto">{formatTime(log.createdAt)}</span>
                        </div>
                        <p className="text-[9px] font-bold text-blue-600 uppercase">
                          {log.action === "create" ? "Lead Created" : `${log.action === "delete" ? "Deleted" : "Updated"}: ${log.title || "Lead record"}`}
                        </p>
                        {log.action === "update" && log.changes && Object.keys(log.changes).length > 0 && (
                          <p className="text-[9px] font-medium text-slate-500 mt-1 truncate">
                            {Object.keys(log.changes).slice(0, 3).map((k) => k.replace(/([A-Z])/g, " $1").trim()).join(", ")}
                            {Object.keys(log.changes).length > 3 && ` +${Object.keys(log.changes).length - 3} more`}
                          </p>
                        )}
                        {log.userName && (
                          <p className="text-[9px] font-medium text-slate-500 mt-1">By: <span className="font-semibold">{log.userName}</span></p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {activityTotal > 10 && (
                <Link href="/activity-logs" className="block mt-2 py-1.5 text-center text-[9px] font-bold text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
                  View Full Communication History
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Edit Lead</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="border-b border-gray-200 py-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[9px] font-semibold text-green-800">Company Information</h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="radio" name="marketType" value="Domestic" checked={form.marketType === "Domestic"} onChange={handleChange} className="accent-green-700" /><span className="font-medium">DOMESTIC</span></label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="radio" name="marketType" value="International" checked={form.marketType === "International"} onChange={handleChange} className="accent-green-700" /><span className="font-medium">INTERNATIONAL</span></label>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <div><label className={`${labelClass} text-black`}>Company Name *</label><input name="companyName" value={form.companyName} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Type Of Business *</label><ModalSelect name="typeOfBusiness" value={form.typeOfBusiness} onChange={handleChange} placeholder="Select">{TYPE_OF_BUSINESS.map((t) => <option key={t} value={t}>{t}</option>)}</ModalSelect></div>
                  <div><label className={`${labelClass} text-black`}>Industry / Sector *</label><ModalSelect name="industrySector" value={form.industrySector} onChange={handleChange} placeholder="Select">{INDUSTRY_SECTOR.map((s) => <option key={s} value={s}>{s}</option>)}</ModalSelect></div>
                  <div><label className={`${labelClass} text-black`}>Company Website</label><input name="website" value={form.website} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Official Email *</label><input name="officialEmail" type="email" value={form.officialEmail} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Landline No.</label><input name="landline" value={form.landline} onChange={handleChange} className={modalFieldClass} /></div>
                </div>
              </div>
              <div className="border-b border-gray-200 py-2">
                <h3 className="text-[9px] font-semibold text-green-800 mb-2">Location & Address</h3>
                <div className={`grid grid-cols-2 gap-2 ${form.marketType === "Domestic" ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
                  <div><label className={`${labelClass} text-black`}>Full Address *</label><input name="addressLine" value={form.addressLine} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Country *</label><ModalSelect name="country" value={form.country} onChange={handleChange}><option value="India">India</option><option value="USA">USA</option><option value="UK">UK</option><option value="UAE">UAE</option><option value="Other">Other</option></ModalSelect></div>
                  {form.marketType === "Domestic" && (<div><label className={`${labelClass} text-black`}>Pin Code *</label><input name="zipCode" value={form.zipCode} onChange={handleChange} className={modalFieldClass} /></div>)}
                  <div><label className={`${labelClass} text-black`}>State *</label><input name="state" value={form.state} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>City / Town *</label><input name="city" value={form.city} onChange={handleChange} className={modalFieldClass} /></div>
                </div>
              </div>
              <div className="border-b border-gray-200 py-2">
                <h3 className="text-[9px] font-semibold text-green-800 mb-2">Contact Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                  <div><label className={`${labelClass} text-black`}>Title *</label><ModalSelect name="title" value={form.title} onChange={handleChange} placeholder="Select">{TITLES.map((t) => <option key={t} value={t}>{t}</option>)}</ModalSelect></div>
                  <div><label className={`${labelClass} text-black`}>First Name *</label><input name="firstName" value={form.firstName} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Surname</label><input name="lastName" value={form.lastName} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Designation</label><input name="designation" value={form.designation} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Email *</label><input name="email" type="email" value={form.email} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Mobile No. *</label><input name="phone" value={form.phone} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Alternate No.</label><input name="altPhone" value={form.altPhone} onChange={handleChange} className={modalFieldClass} /></div>
                </div>
              </div>
              <div className="border-b border-gray-200 py-2">
                <h3 className="text-[9px] font-semibold text-green-800 mb-2">CRM & Tracking</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <div><label className={`${labelClass} text-black`}>Lead Type *</label><ModalSelect name="leadType" value={form.leadType} onChange={handleChange}>{LEAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</ModalSelect></div>
                  <div><label className={`${labelClass} text-black`}>Data Source *</label><ModalSelect name="leadSource" value={form.leadSource} onChange={handleChange}>{LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}</ModalSelect></div>
                  <div><label className={`${labelClass} text-black`}>Status</label><ModalSelect name="leadStatus" value={form.leadStatus} onChange={handleChange}>{LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</ModalSelect></div>
                  <div><label className={`${labelClass} text-black`}>Priority</label><ModalSelect name="priority" value={form.priority} onChange={handleChange}>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</ModalSelect></div>
                  <div><label className={`${labelClass} text-black`}>Event Attribution *</label><input name="eventAttribution" value={form.eventAttribution} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Lead Date *</label><input type="datetime-local" name="leadDate" value={form.leadDate} onChange={handleChange} className={modalFieldClass} /></div>
                  <div><label className={`${labelClass} text-black`}>Assigned To *</label><ModalSelect name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Select User">{users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</ModalSelect></div>
                  <div><label className={`${labelClass} text-black`}>Category</label><ModalSelect name="leadCategory" value={form.leadCategory} onChange={handleChange} placeholder="Select"><option value="hot">Hot</option><option value="cold">Cold</option></ModalSelect></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded text-[10px] text-slate-400 hover:text-slate-600">Cancel</button>
              <button onClick={handleSaveModal} disabled={saving} className="flex items-center gap-1.5 px-4 py-1 rounded bg-emerald-800 text-white text-[10px] font-bold hover:bg-emerald-900 disabled:opacity-50">
                {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
