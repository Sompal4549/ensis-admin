"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2, 
  Briefcase,
  CheckCircle2,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { fieldClass, labelClass } from "@/constants";
import { API_URL, authStore } from "@/lib/api";

interface Career {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  status: string;
}

const initialCareerForm = {
  title: "",
  department: "",
  location: "",
  type: "Full-time",
  experience: "",
  status: "active"
};

type CareerForm = typeof initialCareerForm;

const getCareerList = (payload: unknown): Career[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const data = payload as {
    careers?: Career[];
    jobs?: Career[];
    records?: Career[];
    items?: Career[];
  };

  return data.careers || data.jobs || data.records || data.items || [];
};

const careerPaths = ["/careers", "/career"];

const careerRequest = async (
  method: "get" | "post" | "put" | "delete",
  pathSuffix = "",
  data?: CareerForm
) => {
  const token = authStore.getToken();
  const config = { headers: { Authorization: `Bearer ${token}` } };
  let lastError: unknown;

  for (const path of careerPaths) {
    try {
      const url = `${API_URL}${path}${pathSuffix}`;
      if (method === "get") return await axios.get(url, config);
      if (method === "delete") return await axios.delete(url, config);
      if (method === "put") return await axios.put(url, data, config);
      return await axios.post(url, data, config);
    } catch (error) {
      lastError = error;
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status !== 404 && status !== 405) throw error;
    }
  }

  throw lastError;
};

export default function CareerManagementPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [form, setForm] = useState(initialCareerForm);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(careers.length / itemsPerPage);
  const paginatedCareers = careers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    fetchCareers();
  }, []);

  async function fetchCareers() {
    setLoading(true);
    try {
      const res = await careerRequest("get");
      setCareers(getCareerList(res.data.data));
    } catch (error) {
      console.error("Failed to fetch careers:", error);
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to load careers";
      setMessage({ text: errMsg || "Failed to load careers", isError: true });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: "", isError: false });

    try {
      if (isEditing) {
        await careerRequest("put", `/${currentId}`, form);
      } else {
        await careerRequest("post", "", form);
      }

      setMessage({ 
        text: `Career ${isEditing ? "updated" : "created"} successfully!`, 
        isError: false 
      });
      resetForm();
      fetchCareers();
    } catch (error) {
      const errMsg = axios.isAxiosError(error) 
        ? error.response?.data?.message 
        : "An unexpected error occurred";
      setMessage({ text: errMsg || "Operation failed", isError: true });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (career: Career) => {
    setIsEditing(true);
    setCurrentId(career._id);
    setForm({
      title: career.title,
      department: career.department,
      location: career.location,
      type: career.type,
      experience: career.experience,
      status: career.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this career opportunity?")) return;

    try {
      await careerRequest("delete", `/${id}`);
      fetchCareers();
    } catch (error) {
      console.error("Delete failed:", error);
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Delete failed";
      setMessage({ text: errMsg || "Delete failed", isError: true });
    }
  };

  const resetForm = () => {
    setForm(initialCareerForm);
    setIsEditing(false);
    setCurrentId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Career List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <Briefcase size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Job Openings</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
              {careers.length} Total
            </span>
          </div>

          <div className="p-0 max-h-[700px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-xs text-slate-400 font-medium">Loading careers...</p>
              </div>
            ) : careers.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-sm text-slate-400 font-medium">No job openings found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {paginatedCareers.map((career) => (
                  <div key={career._id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{career.title}</h3>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${career.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                          {career.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin size={12} /> {career.location}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {career.type}
                        </span>
                        <span className="text-[11px] text-slate-400">• {career.experience} exp</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(career)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(career._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Career Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6 self-start">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                {isEditing ? <Edit size={18} /> : <Plus size={18} />}
              </div>
              <h2 className="text-sm font-bold text-slate-800">{isEditing ? "Edit Posting" : "New Career Posting"}</h2>
            </div>
            {isEditing && (
              <button onClick={resetForm} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 uppercase transition-colors">
                <X size={12} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Job Title</label>
                <input type="text" required className={`${fieldClass} mt-1`} placeholder="e.g. Senior Ayurvedic Doctor" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div>
                <label className={labelClass}>Department</label>
                <input type="text" required className={`${fieldClass} mt-1`} placeholder="e.g. Medical" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>

              <div>
                <label className={labelClass}>Location</label>
                <input type="text" required className={`${fieldClass} mt-1`} placeholder="e.g. Noida" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>

              <div>
                <label className={labelClass}>Job Type</label>
                <select className={`${fieldClass} mt-1`} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Experience Required</label>
                <input type="text" required className={`${fieldClass} mt-1`} placeholder="e.g. 5+ Years" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              </div>

              <div>
                <label className={labelClass}>Posting Status</label>
                <select className={`${fieldClass} mt-1`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message.isError ? <X size={14} /> : <CheckCircle2 size={14} />}
                {message.text}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="w-full h-11 flex items-center justify-center gap-2 bg-[#1d5af2] hover:bg-[#154dc8] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {formLoading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <Save size={18} />
                    {isEditing ? "Update Posting" : "Publish Career"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
