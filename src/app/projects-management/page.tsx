"use client";

import axios from "axios";
import Image from "next/image";
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
  ImagePlus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { fieldClass, labelClass } from "@/constants";
import { authStore, categoryApi, type Category, getImageUrl, API_URL } from "@/lib/api";

interface Project {
  _id: string;
  title: string;
  category: string;
  location: string;
  client: string;
  projectYear: number;
  image: string;
  isFeatured: boolean;
}

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  
  const initialForm = {
    title: "",
    category: "",
    location: "",
    client: "",
    projectYear: new Date().getFullYear(),
    image: "",
    isFeatured: false
  };

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const paginatedProjects = projects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.list();
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = authStore.getToken();
      const res = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data.data || []);
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setMessage({ text: "Failed to load projects", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = authStore.getToken();
      const res = await axios.post(`${API_URL}/uploads`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setForm({ ...form, image: res.data.data.url });
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage({ text: "Image upload failed", isError: true });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const url = isEditing 
        ? `${API_URL}/projects/${currentId}` 
        : `${API_URL}/projects`;
      
      const token = authStore.getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (isEditing) {
        await axios.put(url, form, config);
      } else {
        await axios.post(url, form, config);
      }

      setMessage({ 
        text: `Project ${isEditing ? "updated" : "created"} successfully!`, 
        isError: false 
      });
      resetForm();
      fetchProjects();
    } catch (error) {
      const errMsg = axios.isAxiosError(error) 
        ? error.response?.data?.message 
        : "An unexpected error occurred";
      setMessage({ text: errMsg || "Operation failed", isError: true });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setIsEditing(true);
    setCurrentId(project._id);
    setForm({
      title: project.title,
      category: project.category,
      location: project.location,
      client: project.client,
      projectYear: project.projectYear,
      image: project.image,
      isFeatured: project.isFeatured
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} projects?`)) return;

    try {
      const token = authStore.getToken();
      await Promise.all(
        selectedIds.map(id => 
          axios.delete(`${API_URL}/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      setSelectedIds([]);
      fetchProjects();
      setMessage({ text: "Projects deleted successfully", isError: false });
    } catch (error) {
      setMessage({ text: "Bulk delete failed", isError: true });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const resetForm = () => {
    setForm(initialForm);
    setIsEditing(false);
    setCurrentId(null);
  };
console.log(form)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Project List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <Briefcase size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Projects</h2>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase hover:bg-rose-100 transition-colors">
                  <Trash2 size={14} /> Delete ({selectedIds.length})
                </button>
              )}
              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                {projects.length} Total
              </span>
            </div>
          </div>

          <div className="p-0 max-h-[700px] overflow-y-auto">
            {loading && projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {paginatedProjects.map((project) => (
                  <div key={project._id} className="p-4 hover:bg-slate-50/50 flex items-center justify-between group">
                    <div className="flex items-center gap-4 min-w-0">
                      <input type="checkbox" checked={selectedIds.includes(project._id)} onChange={() => toggleSelect(project._id)} className="w-4 h-4 rounded border-slate-300 text-blue-600 shrink-0" />
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {project.image ? (
                          <Image src={getImageUrl(project.image)} alt="" width={48} height={48} className="object-cover w-full h-full" unoptimized crossOrigin="anonymous" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><Briefcase size={20} /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{project.title}</h3>
                        <p className="text-[11px] text-slate-500">{project.category} • {project.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(project)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 disabled:opacity-30"><ChevronLeft size={18} /></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1 disabled:opacity-30"><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Project Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6 self-start">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">{isEditing ? "Edit Project" : "New Project"}</h2>
            {isEditing && <button onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600"><X size={16} /></button>}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Project Image</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {form.image ? <Image src={getImageUrl(form.image)} alt="" width={80} height={80} className="object-cover w-full h-full" unoptimized crossOrigin="anonymous" /> : <ImagePlus className="text-slate-300" />}
                  </div>
                  <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                    {imageUploading ? "Uploading..." : "Upload Photo"}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Project Title</label>
                  <input type="text" required className={fieldClass} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select required className={fieldClass} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Year</label>
                  <input type="number" required className={fieldClass} value={form.projectYear} onChange={e => setForm({...form, projectYear: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className={labelClass}>Client</label>
                  <input type="text" required className={fieldClass} value={form.client} onChange={e => setForm({...form, client: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input type="text" required className={fieldClass} value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span className="text-xs font-bold text-slate-700">Feature this project</span>
              </label>
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg text-xs font-semibold ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={formLoading || imageUploading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {formLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {isEditing ? "Update Project" : "Save Project"}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
